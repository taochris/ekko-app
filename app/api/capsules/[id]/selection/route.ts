import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getCapsule, updateCapsule, CapsuleManifest, SelectedAudioManifestItem, BookmarkDraftItem } from "../../../../lib/capsules";
import { deleteVectorIndex } from "../../../../lib/smartVectorStore";

export const runtime = "nodejs";

const MAX_VOCAPSULE_DURATION_SEC = 3600;
const AI_SERVICE_URL = process.env.VOSEKKO_AI_URL ?? "http://127.0.0.1:8765";
const AI_SECRET = process.env.VOSEKKO_AI_SECRET ?? "vosekko-local-dev-secret";

function sanitizeManifest(raw: unknown): { manifest: CapsuleManifest; totalDurationSec: number } {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const rawAudios = Array.isArray(obj.selectedAudios) ? obj.selectedAudios : [];
  const rawBookmarks = Array.isArray(obj.bookmarks) ? obj.bookmarks : [];

  const selectedAudios: SelectedAudioManifestItem[] = rawAudios.map((item, idx) => {
    const a = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
    const dur = Math.max(0, Number(a.durationSec ?? 0));
    const entry: SelectedAudioManifestItem = {
      audioId: String(a.audioId ?? `audio_${idx}`).slice(0, 128),
      position: Number.isFinite(Number(a.position)) ? Number(a.position) : idx,
      durationSec: Number(dur.toFixed(2)),
    };
    if (a.storageName) entry.storageName = String(a.storageName).slice(0, 255);
    if (a.filename) entry.filename = String(a.filename).slice(0, 255);
    return entry;
  });

  selectedAudios.sort((a, b) => a.position - b.position);
  selectedAudios.forEach((a, i) => { a.position = i; });

  const validAudioIds = new Set(selectedAudios.map((a) => a.audioId));
  const bookmarks: BookmarkDraftItem[] = rawBookmarks
    .map((item, idx) => {
      const b = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
      return {
        id: String(b.id ?? `bm_${idx + 1}`).slice(0, 64),
        title: String(b.title ?? "").trim().slice(0, 80),
        audioId: String(b.audioId ?? "").slice(0, 128),
        offsetInAudioSec: Math.max(0, Number(b.offsetInAudioSec ?? 0)),
      };
    })
    .filter((b) => b.title.length > 0 && validAudioIds.has(b.audioId));

  const totalDurationSec = selectedAudios.reduce((acc, a) => acc + a.durationSec, 0);
  return { manifest: { selectedAudios, bookmarks }, totalDurationSec };
}

/**
 * PUT /api/capsules/[id]/selection
 * Sauvegarde en brouillon l'état de la sélection et des marque-pages dans Firestore
 * pour permettre la reprise après interruption.
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: capsuleId } = await params;
    const capsule = await getCapsule(capsuleId);
    if (!capsule) return NextResponse.json({ error: "Capsule introuvable" }, { status: 404 });

    if (capsule.status !== "paid_awaiting_selection" && capsule.status !== "pending") {
      return NextResponse.json({ error: "La sélection ne peut plus être modifiée" }, { status: 409 });
    }

    const body = await req.json();
    const { manifest, totalDurationSec } = sanitizeManifest(body.manifest ?? body);
    if (totalDurationSec > MAX_VOCAPSULE_DURATION_SEC) {
      return NextResponse.json(
        { error: "La durée totale de la sélection dépasse la limite d'une heure (3 600 secondes)." },
        { status: 400 }
      );
    }

    await updateCapsule(capsuleId, {
      manifest,
      ...(body.engraveName !== undefined ? { engraveName: String(body.engraveName).trim().slice(0, 20) } : {}),
      ...(body.engravingFont !== undefined ? { engravingFont: String(body.engravingFont) } : {}),
      ...(body.format !== undefined ? { format: String(body.format) } : {}),
    });

    return NextResponse.json({ saved: true, manifest });
  } catch (err) {
    console.error("[capsules/selection PUT]", err);
    return NextResponse.json({ error: "Erreur sauvegarde sélection" }, { status: 500 });
  }
}

/**
 * POST /api/capsules/[id]/selection
 * Validation définitive par le client ayant déjà payé en avance (paid_awaiting_selection) :
 * - Vérifie que le paiement est bien confirmé (aucun 2ème paiement requis)
 * - Vérifie que la durée cumulée <= 3 600 secondes
 * - Enregistre l'uploadId contenant les audios finaux sélectionnés et le manifeste
 * - Passe la capsule en statut "paid" et lance la fusion FFmpeg (/api/capsules/[id]/process)
 * - Nettoie les vecteurs temporaires du service IA
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: capsuleId } = await params;
    const capsule = await getCapsule(capsuleId);
    if (!capsule) return NextResponse.json({ error: "Capsule introuvable" }, { status: 404 });

    if (capsule.status === "processing" || capsule.status === "ready") {
      return NextResponse.json({ status: capsule.status, alreadyTriggered: true });
    }

    if (capsule.status !== "paid_awaiting_selection" && capsule.status !== "paid" && capsule.status !== "failed") {
      return NextResponse.json(
        { error: "Paiement non confirmé pour cette commande." },
        { status: 402 }
      );
    }

    const body = await req.json();
    const uploadId = typeof body.uploadId === "string" && /^[a-zA-Z0-9_-]{1,64}$/.test(body.uploadId)
      ? body.uploadId
      : capsule.uploadId;

    if (!uploadId) {
      return NextResponse.json({ error: "uploadId manquant pour la fusion" }, { status: 400 });
    }

    const { manifest, totalDurationSec } = sanitizeManifest(body.manifest ?? capsule.manifest ?? {});
    if (manifest.selectedAudios.length === 0) {
      return NextResponse.json({ error: "Aucun audio sélectionné" }, { status: 400 });
    }
    if (totalDurationSec > MAX_VOCAPSULE_DURATION_SEC) {
      return NextResponse.json(
        { error: "La sélection dépasse la limite maximale de 3 600 secondes (1 heure)." },
        { status: 400 }
      );
    }

    await updateCapsule(capsuleId, {
      status: "paid",
      uploadId,
      manifest,
      selectionValidatedAt: FieldValue.serverTimestamp(),
      ...(body.engraveName ? { engraveName: String(body.engraveName).trim().slice(0, 20) } : {}),
      ...(body.engravingFont ? { engravingFont: String(body.engravingFont) } : {}),
      ...(body.format ? { format: String(body.format) } : {}),
    });

    // Nettoyer immédiatement l'index vectoriel temporaire sur Firebase Storage et sur le worker IA
    deleteVectorIndex(capsuleId).catch(() => {});
    fetch(`${AI_SERVICE_URL}/v1/sessions/${encodeURIComponent(`${capsule.uid}_${capsuleId}`)}`, {
      method: "DELETE",
      headers: { "x-vosekko-secret": AI_SECRET },
    }).catch(() => {});

    // Déclencher la fusion FFmpeg (qui enverra aussi l'email admin SVG si porteClef)
    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    fetch(`${origin}/api/capsules/${capsuleId}/process`, {
      method: "POST",
      headers: { "x-internal-trigger": "selection-finalized" },
    }).catch((e) => console.error("[capsules/selection] trigger process error:", e));

    return NextResponse.json({ status: "paid", triggered: true });
  } catch (err) {
    console.error("[capsules/selection POST]", err);
    return NextResponse.json({ error: "Erreur lors de la validation finale" }, { status: 500 });
  }
}
