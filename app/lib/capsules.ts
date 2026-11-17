import { getAdminFirestore } from "./firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Statuts d'une capsule post-paiement :
 * - pending                 : créée, paiement non confirmé
 * - paid_awaiting_selection : payée avec option Souvenirs intelligents (+3 €), en attente de la sélection finale et des marque-pages
 * - paid                    : paiement confirmé et sélection validée, fusion prête à démarrer
 * - processing              : fusion en cours côté serveur
 * - ready                   : audio prêt, URL disponible, QR affichable
 * - failed                  : erreur lors de la fusion, bouton "réessayer" possible
 */
export type CapsuleStatus = "pending" | "paid_awaiting_selection" | "paid" | "processing" | "ready" | "failed";

export interface SelectedAudioManifestItem {
  audioId: string;
  storageName?: string;
  filename?: string;
  position: number;
  durationSec: number;
}

export interface BookmarkDraftItem {
  id: string;
  title: string;
  audioId: string;
  offsetInAudioSec: number;
  color?: string;
}

export interface CapsuleBookmark {
  id: string;
  title: string;
  timeSec: number;
  audioId: string;
  offsetInAudioSec?: number;
  displayOrder: number;
  color?: string;
}

export interface CapsuleManifest {
  selectedAudios: SelectedAudioManifestItem[];
  bookmarks: BookmarkDraftItem[];
}

export function getExpirationDate(productType: "numerique" | "porteClef" | undefined, storageOption: number, from = new Date()): Date {
  const expiration = new Date(from);
  if (productType === "porteClef") {
    expiration.setUTCFullYear(expiration.getUTCFullYear() + 20);
    return expiration;
  }
  const days = storageOption === 100 ? 365 : storageOption === 200 ? 730 : 7;
  return new Date(expiration.getTime() + days * 24 * 3600 * 1000);
}

export interface Capsule {
  id: string;
  status: CapsuleStatus;
  uid: string;
  theme: string;
  accentColor: string;
  storageOption: number;
  uploadId: string;
  productType?: "numerique" | "porteClef";
  engraveName?: string;
  format?: string;
  material?: string;
  engravingFont?: string;
  nfcEnabled?: boolean;
  shippingStatus?: "pending" | "to_engrave" | "shipped";
  shippingName?: string;
  shippingAddress?: string;
  customerPhone?: string;
  customerEmail?: string;
  sessionId?: string;
  echoId?: string;
  audioUrl?: string;
  expiresAt?: string;
  error?: string;
  smartSearchEnabled?: boolean;
  advancePayment?: boolean;
  maxDurationSec?: number;
  manifest?: CapsuleManifest;
  bookmarks?: CapsuleBookmark[];
  createdAt?: string;
  paidAt?: string;
  selectionValidatedAt?: string;
  processingAt?: string;
  readyAt?: string;
  failedAt?: string;
}

const COLLECTION = "capsules";

export async function createCapsule(data: {
  uid: string;
  theme: string;
  accentColor: string;
  storageOption: number;
  uploadId: string;
  productType?: "numerique" | "porteClef";
  engraveName?: string;
  format?: string;
  material?: string;
  engravingFont?: string;
  nfcEnabled?: boolean;
  customerEmail?: string;
  smartSearchEnabled?: boolean;
  advancePayment?: boolean;
  manifest?: CapsuleManifest;
}): Promise<string> {
  const db = getAdminFirestore();
  const ref = db.collection(COLLECTION).doc();
  const isPorteClef = data.productType === "porteClef";
  await ref.set({
    status: "pending" as CapsuleStatus,
    uid: data.uid,
    theme: data.theme,
    accentColor: data.accentColor,
    storageOption: data.storageOption,
    uploadId: data.uploadId,
    productType: data.productType ?? "numerique",
    smartSearchEnabled: data.smartSearchEnabled === true,
    advancePayment: data.advancePayment === true,
    maxDurationSec: 3600,
    ...(data.manifest ? { manifest: data.manifest } : {}),
    ...(isPorteClef ? {
      engraveName: data.engraveName ?? "",
      format: data.format ?? "",
      material: data.material ?? "bois",
      engravingFont: data.engravingFont ?? "Georgia, serif",
      nfcEnabled: data.nfcEnabled === true,
      shippingStatus: "pending" as const,
    } : {}),
    ...(data.customerEmail ? { customerEmail: data.customerEmail } : {}),
    createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function getCapsule(id: string): Promise<Capsule | null> {
  const db = getAdminFirestore();
  const snap = await db.collection(COLLECTION).doc(id).get();
  if (!snap.exists) return null;
  const raw = snap.data() ?? {};
  // Convertir Timestamps Firestore en ISO strings
  const convert = (v: unknown) =>
    v && typeof v === "object" && "toDate" in (v as object)
      ? (v as { toDate: () => Date }).toDate().toISOString()
      : typeof v === "string"
        ? v
        : undefined;
  return {
    id: snap.id,
    status: (raw.status as CapsuleStatus) ?? "pending",
    uid: String(raw.uid ?? ""),
    theme: String(raw.theme ?? "deuil"),
    accentColor: String(raw.accentColor ?? "#c9a96e"),
    storageOption: Number(raw.storageOption ?? 0),
    uploadId: String(raw.uploadId ?? ""),
    productType: raw.productType,
    engraveName: raw.engraveName,
    format: raw.format,
    material: raw.material,
    engravingFont: raw.engravingFont,
    nfcEnabled: raw.nfcEnabled === true,
    shippingStatus: raw.shippingStatus,
    shippingName: raw.shippingName,
    shippingAddress: raw.shippingAddress,
    customerPhone: raw.customerPhone,
    customerEmail: raw.customerEmail,
    sessionId: raw.sessionId,
    echoId: raw.echoId,
    audioUrl: raw.audioUrl,
    expiresAt: raw.expiresAt,
    error: raw.error,
    smartSearchEnabled: raw.smartSearchEnabled === true,
    advancePayment: raw.advancePayment === true,
    maxDurationSec: Number(raw.maxDurationSec ?? 3600),
    manifest: raw.manifest as CapsuleManifest | undefined,
    bookmarks: Array.isArray(raw.bookmarks) ? (raw.bookmarks as CapsuleBookmark[]) : undefined,
    createdAt: convert(raw.createdAt),
    paidAt: convert(raw.paidAt),
    selectionValidatedAt: convert(raw.selectionValidatedAt),
    processingAt: convert(raw.processingAt),
    readyAt: convert(raw.readyAt),
    failedAt: convert(raw.failedAt),
  };
}

export async function updateCapsule(id: string, patch: Record<string, unknown>): Promise<void> {
  const db = getAdminFirestore();
  await db.collection(COLLECTION).doc(id).update(patch);
}

export async function markCapsulePaid(id: string, sessionId: string): Promise<void> {
  await updateCapsule(id, {
    status: "paid",
    sessionId,
    paidAt: FieldValue.serverTimestamp(),
  });
}

export async function markCapsulePaidAwaitingSelection(id: string, sessionId: string): Promise<void> {
  await updateCapsule(id, {
    status: "paid_awaiting_selection",
    smartSearchEnabled: true,
    sessionId,
    paidAt: FieldValue.serverTimestamp(),
  });
}

export async function markCapsuleProcessing(id: string): Promise<void> {
  await updateCapsule(id, {
    status: "processing",
    processingAt: FieldValue.serverTimestamp(),
    error: FieldValue.delete(),
  });
}

export async function markCapsuleReady(
  id: string,
  data: { echoId: string; audioUrl: string; expiresAt: string; bookmarks?: CapsuleBookmark[] }
): Promise<void> {
  await updateCapsule(id, {
    status: "ready",
    echoId: data.echoId,
    audioUrl: data.audioUrl,
    expiresAt: data.expiresAt,
    ...(data.bookmarks ? { bookmarks: data.bookmarks } : {}),
    readyAt: FieldValue.serverTimestamp(),
  });
}

export async function markCapsuleFailed(id: string, error: string): Promise<void> {
  await updateCapsule(id, {
    status: "failed",
    error: error.slice(0, 500),
    failedAt: FieldValue.serverTimestamp(),
  });
}
