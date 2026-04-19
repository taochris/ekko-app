import { getAdminFirestore } from "./firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Statuts d'une capsule post-paiement :
 * - pending    : créée, paiement non confirmé
 * - paid       : paiement confirmé (webhook Stripe), fusion pas encore lancée
 * - processing : fusion en cours côté serveur
 * - ready      : audio prêt, URL disponible, QR affichable
 * - failed     : erreur lors de la fusion, bouton "réessayer" possible
 */
export type CapsuleStatus = "pending" | "paid" | "processing" | "ready" | "failed";

export interface Capsule {
  id: string;
  status: CapsuleStatus;
  uid: string;
  theme: string;
  accentColor: string;
  storageOption: number;
  uploadId: string;
  sessionId?: string;
  echoId?: string;
  audioUrl?: string;
  expiresAt?: string;
  error?: string;
  createdAt?: string;
  paidAt?: string;
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
}): Promise<string> {
  const db = getAdminFirestore();
  const ref = db.collection(COLLECTION).doc();
  await ref.set({
    status: "pending" as CapsuleStatus,
    uid: data.uid,
    theme: data.theme,
    accentColor: data.accentColor,
    storageOption: data.storageOption,
    uploadId: data.uploadId,
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
    sessionId: raw.sessionId,
    echoId: raw.echoId,
    audioUrl: raw.audioUrl,
    expiresAt: raw.expiresAt,
    error: raw.error,
    createdAt: convert(raw.createdAt),
    paidAt: convert(raw.paidAt),
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

export async function markCapsuleProcessing(id: string): Promise<void> {
  await updateCapsule(id, {
    status: "processing",
    processingAt: FieldValue.serverTimestamp(),
    error: FieldValue.delete(),
  });
}

export async function markCapsuleReady(
  id: string,
  data: { echoId: string; audioUrl: string; expiresAt: string }
): Promise<void> {
  await updateCapsule(id, {
    status: "ready",
    echoId: data.echoId,
    audioUrl: data.audioUrl,
    expiresAt: data.expiresAt,
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
