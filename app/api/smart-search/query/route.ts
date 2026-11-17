import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getCapsule } from "../../../lib/capsules";
import {
  loadVectorIndex,
  rankStoredVectors,
  deleteVectorIndex,
  checkAndIncrementSearchQuota,
  SMART_SEARCH_QUOTAS,
} from "../../../lib/smartVectorStore";

export const runtime = "nodejs";

const AI_SERVICE_URL =
  process.env.VOSEKKO_AI_URL ??
  "https://taochris66--vosekko-embeddinggemma2-vosekko-ai-asgi.us-east.modal.run";
// Possibilité d'utiliser un endpoint texte CPU léger dédié sur Modal pour les requêtes, ou le même service
const AI_QUERY_EMBED_URL = process.env.VOSEKKO_AI_QUERY_URL ?? `${AI_SERVICE_URL}/v1/embed-query`;

function getAiSecret(): string {
  if (process.env.VOSEKKO_AI_SECRET) return process.env.VOSEKKO_AI_SECRET;
  const pk = (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "").replace(/\\n/g, "\n").replace(/^"|"$/g, "");
  if (pk) {
    return crypto.createHmac("sha256", pk).update("vosekko-ai-secret-v1").digest("hex");
  }
  return "vosekko-local-dev-secret";
}

/**
 * POST /api/smart-search/query
 * Architecture GPU Serverless :
 * 1. Vérifie côté serveur que l'option Souvenirs intelligents (+3 €) est bien payée et respecte le quota de requêtes.
 * 2. Charge les vecteurs pré-calculés de la capsule depuis Firebase Storage (`temp-vectors/{capsuleId}/index.json`).
 * 3. Appelle uniquement l'endpoint léger d'embedding texte (`/v1/embed-query`) pour transformer la requête en vecteur 768D,
 *    puis calcule la similarité cosinus directement en Node.js (aucune ré-analyse GPU des fichiers audio).
 */
export async function POST(req: NextRequest) {
  try {
    const { capsuleId, query, topK = 20 } = await req.json();
    const cleanCapsuleId = String(capsuleId ?? "").trim();
    const cleanQuery = String(query ?? "").trim();

    if (!cleanCapsuleId || !cleanQuery) {
      return NextResponse.json({ error: "Paramètres manquants (capsuleId, query)" }, { status: 400 });
    }

    const capsule = await getCapsule(cleanCapsuleId);
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
        { error: "Accès refusé : option Souvenirs intelligents non payée pour cette commande." },
        { status: 403 }
      );
    }

    const quota = await checkAndIncrementSearchQuota(cleanCapsuleId);
    if (!quota.allowed) {
      return NextResponse.json(
        { error: `Limite de ${SMART_SEARCH_QUOTAS.maxQueriesPerCapsule} recherches atteinte pour cette commande.` },
        { status: 429 }
      );
    }

    // 1. Charger l'index vectoriel persistant de la commande
    const storedIndex = await loadVectorIndex(cleanCapsuleId, capsule.uid);
    const indexedAudioCount = Object.keys(storedIndex.audios).length;

    if (indexedAudioCount > 0) {
      const embedRes = await fetch(AI_QUERY_EMBED_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-vosekko-secret": getAiSecret(),
        },
        body: JSON.stringify({
          query: cleanQuery.slice(0, 200),
          only_embed_query: true,
        }),
      });

      if (embedRes.ok) {
        const embedData = await embedRes.json();
        if (Array.isArray(embedData.vector) && embedData.vector.length > 0) {
          const ranked = rankStoredVectors(
            storedIndex,
            embedData.vector as number[],
            Math.min(Math.max(Number(topK) || 20, 1), 50)
          );
          return NextResponse.json({
            query: cleanQuery,
            ...ranked,
          });
        }
      }
    }

    // Fallback direct sur /v1/search si les vecteurs sont en mémoire dans la session du worker
    const upstreamRes = await fetch(`${AI_SERVICE_URL}/v1/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-vosekko-secret": getAiSecret(),
      },
      body: JSON.stringify({
        session_id: `${capsule.uid}_${cleanCapsuleId}`,
        query: cleanQuery.slice(0, 200),
        top_k: Math.min(Math.max(Number(topK) || 20, 1), 50),
      }),
    });

    if (!upstreamRes.ok) {
      return NextResponse.json(
        { error: "Erreur lors de la recherche vocale." },
        { status: 502 }
      );
    }

    const data = await upstreamRes.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[smart-search/query] exception:", err);
    return NextResponse.json({ error: "Erreur serveur de recherche." }, { status: 500 });
  }
}

/**
 * DELETE /api/smart-search/query?capsuleId=xxx
 * Nettoie les vecteurs temporaires sur Firebase Storage et sur le worker IA.
 */
export async function DELETE(req: NextRequest) {
  try {
    const capsuleId = req.nextUrl.searchParams.get("capsuleId")?.trim() ?? "";
    if (!capsuleId) return NextResponse.json({ deleted: false }, { status: 400 });
    const capsule = await getCapsule(capsuleId);
    if (!capsule) return NextResponse.json({ deleted: false }, { status: 404 });

    await deleteVectorIndex(capsuleId);
    await fetch(`${AI_SERVICE_URL}/v1/sessions/${encodeURIComponent(`${capsule.uid}_${capsuleId}`)}`, {
      method: "DELETE",
      headers: { "x-vosekko-secret": getAiSecret() },
    }).catch(() => {});

    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json({ deleted: false }, { status: 500 });
  }
}
