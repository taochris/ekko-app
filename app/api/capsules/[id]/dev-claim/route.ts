import { NextRequest, NextResponse } from "next/server";
import { getCapsule, markCapsulePaid } from "../../../../lib/capsules";

export const runtime = "nodejs";

/**
 * POST /api/capsules/[id]/dev-claim
 *
 * Route dev-only : bypass le paiement Stripe pour tester localement.
 * Ne fonctionne QUE si NEXT_PUBLIC_DEV_BYPASS=true dans .env.local.
 * Ce fichier n'a aucun effet en production (variable absente sur Netlify).
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (process.env.NEXT_PUBLIC_DEV_BYPASS !== "true") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { id: capsuleId } = await params;
  const capsule = await getCapsule(capsuleId);
  if (!capsule) return NextResponse.json({ error: "Capsule introuvable" }, { status: 404 });

  if (capsule.status === "ready" || capsule.status === "processing" || capsule.status === "paid") {
    return NextResponse.json({ status: capsule.status });
  }

  try {
    await markCapsulePaid(capsuleId, "dev-bypass");
  } catch (err) {
    console.warn("[dev-claim] markPaid warning:", (err as Error).message);
  }

  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_BASE_URL ?? `http://localhost:3000`;
  fetch(`${origin}/api/capsules/${capsuleId}/process`, {
    method: "POST",
    headers: { "x-internal-trigger": "dev-claim" },
  }).catch((e) => console.error("[dev-claim] trigger process failed:", e));

  return NextResponse.json({ status: "paid", triggered: true });
}
