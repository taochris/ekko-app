import { NextRequest, NextResponse } from "next/server";
import { getCapsule } from "../../../lib/capsules";

export const runtime = "nodejs";

/**
 * GET /api/capsules/[id]
 * Retourne l'état courant de la capsule (pour le polling côté client).
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const capsule = await getCapsule(id);
    if (!capsule) return NextResponse.json({ error: "Capsule introuvable" }, { status: 404 });
    // Ne jamais renvoyer le uploadId ou infos sensibles côté client
    return NextResponse.json({
      id: capsule.id,
      status: capsule.status,
      theme: capsule.theme,
      accentColor: capsule.accentColor,
      storageOption: capsule.storageOption,
      echoId: capsule.echoId ?? null,
      audioUrl: capsule.audioUrl ?? null,
      expiresAt: capsule.expiresAt ?? null,
      error: capsule.error ?? null,
      uid: capsule.uid,
    });
  } catch (err) {
    console.error("[capsules/GET]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
