import { NextRequest, NextResponse } from "next/server";
import { getCapsule } from "../../../lib/capsules";
import {
  loadVectorIndex,
  upsertVectorIndexBatch,
  SMART_SEARCH_QUOTAS,
  StoredIndexedAudio,
} from "../../../lib/smartVectorStore";

export const runtime = "nodejs";
export const maxDuration = 60;

const AI_SERVICE_URL = process.env.VOSEKKO_AI_URL ?? "http://127.0.0.1:8765";
const AI_SECRET = process.env.VOSEKKO_AI_SECRET ?? "vosekko-local-dev-secret";

/**
 * POST /api/smart-search/index
 * Architecture 100 % Cloud GPU Serverless (Modal / RunPod) :
 * 1. Vérifie côté serveur que l'option Souvenirs intelligents (+3 €) est bien payée.
 * 2. Vérifie les quotas configurables (nombre max de fichiers et durée max d'analyse).
 * 3. Ignore les fichiers déjà présents dans l'index vectoriel persistant de la commande.
 * 4. Envoie le lot au worker GPU Serverless, récupère les vecteurs 768D et les sauvegarde
 *    dans Firebase Storage (`temp-vectors/{capsuleId}/index.json`) afin que le GPU puisse
 *    s'éteindre immédiatement après l'indexation.
 */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const capsuleId = String(form.get("capsuleId") ?? "").trim();
    const audioIdsRaw = String(form.get("audioIds") ?? "[]");
    const files = form.getAll("files") as File[];

    if (!capsuleId) {
      return NextResponse.json({ error: "capsuleId manquant" }, { status: 400 });
    }

    const capsule = await getCapsule(capsuleId);
    if (!capsule) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    const isAllowedStatus =
      capsule.status === "paid_awaiting_selection" ||
      capsule.status === "paid" ||
      capsule.status === "processing" ||
      capsule.status === "ready";

    if (!capsule.smartSearchEnabled || !isAllowedStatus) {
      return NextResponse.json(
        { error: "L'option Souvenirs intelligents (+3 €) n'est pas activée ou payée pour cette commande." },
        { status: 403 }
      );
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "Aucun fichier audio fourni" }, { status: 400 });
    }

    const audioIds: string[] = JSON.parse(audioIdsRaw);
    const existingIndex = await loadVectorIndex(capsuleId, capsule.uid);
    const existingCount = Object.keys(existingIndex.audios).length;

    if (existingCount >= SMART_SEARCH_QUOTAS.maxIndexedFiles) {
      return NextResponse.json(
        { error: `Quota atteint : maximum ${SMART_SEARCH_QUOTAS.maxIndexedFiles} fichiers analysables par commande.` },
        { status: 429 }
      );
    }

    if (existingIndex.totalDurationSec >= SMART_SEARCH_QUOTAS.maxTotalIndexedDurationSec) {
      const maxHours = Math.round(SMART_SEARCH_QUOTAS.maxTotalIndexedDurationSec / 3600);
      return NextResponse.json(
        { error: `Quota atteint : volume maximal de ${maxHours}h d'audio analysé pour cette commande.` },
        { status: 429 }
      );
    }

    // Ne transmettre au GPU que les audios qui ne sont pas encore dans l'index de la capsule
    const toProcessFiles: File[] = [];
    const toProcessIds: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const id = audioIds[i] ?? `aud_${i}`;
      if (!existingIndex.audios[id]) {
        toProcessIds.push(id);
        toProcessFiles.push(files[i]);
      }
    }

    if (toProcessFiles.length === 0) {
      return NextResponse.json({
        sessionId: `${capsule.uid}_${capsuleId}`,
        totalIndexedInBatch: files.length,
        newlyAnalyzed: 0,
        reusedFromCache: files.length,
        totalInSession: existingCount,
        totalDurationSec: existingIndex.totalDurationSec,
      });
    }

    const upstreamForm = new FormData();
    upstreamForm.append("session_id", `${capsule.uid}_${capsuleId}`);
    upstreamForm.append("audio_ids", JSON.stringify(toProcessIds));
    upstreamForm.append("return_vectors", "true");
    for (const f of toProcessFiles) {
      upstreamForm.append("files", f, f.name);
    }

    const upstreamRes = await fetch(`${AI_SERVICE_URL}/v1/index`, {
      method: "POST",
      headers: { "x-vosekko-secret": AI_SECRET },
      body: upstreamForm,
    });

    if (!upstreamRes.ok) {
      const errText = await upstreamRes.text().catch(() => "");
      console.error("[smart-search/index] AI service error:", upstreamRes.status, errText);
      return NextResponse.json(
        { error: "Service cloud d'analyse vocale momentanément indisponible." },
        { status: 502 }
      );
    }

    const data = await upstreamRes.json();
    const batchItems: StoredIndexedAudio[] = Array.isArray(data.items)
      ? data.items
          .filter((it: Record<string, unknown>) => Array.isArray(it.segmentVectors))
          .map((it: Record<string, unknown>) => ({
            audioId: String(it.audioId),
            filename: String(it.filename ?? ""),
            durationSec: Number(it.durationSec ?? 0),
            segmentVectors: it.segmentVectors as StoredIndexedAudio["segmentVectors"],
          }))
      : [];

    if (batchItems.length > 0) {
      const saved = await upsertVectorIndexBatch(capsuleId, capsule.uid, batchItems);
      if (saved.quotaExceeded) {
        return NextResponse.json({ error: saved.quotaExceeded }, { status: 429 });
      }
    }

    // Ne pas renvoyer les gros tableaux de vecteurs au navigateur client
    return NextResponse.json({
      sessionId: data.sessionId,
      totalIndexedInBatch: data.totalIndexedInBatch,
      newlyAnalyzed: data.newlyAnalyzed,
      reusedFromCache: data.reusedFromCache,
      totalInSession: data.totalInSession,
      elapsedSec: data.elapsedSec,
    });
  } catch (err) {
    console.error("[smart-search/index] exception:", err);
    return NextResponse.json(
      { error: "Impossible de joindre le service d'analyse vocale." },
      { status: 500 }
    );
  }
}
