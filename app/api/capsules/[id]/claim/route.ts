import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getCapsule, markCapsulePaid } from "../../../../lib/capsules";

export const runtime = "nodejs";

/**
 * POST /api/capsules/[id]/claim?session_id=xxx
 *
 * Fallback pour quand le webhook Stripe n'est pas encore arrivé (ou pas configuré en dev).
 * Vérifie côté Stripe que la session est bien "paid", puis :
 *   - si capsule pending → marque paid + déclenche le process
 *   - si capsule paid/processing/ready → ne fait rien (idempotent)
 *   - si capsule failed → relance le process
 *
 * Appelée par la page /capsule/[id] quand elle reçoit session_id en URL.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: capsuleId } = await params;
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) return NextResponse.json({ error: "session_id manquant" }, { status: 400 });

  const capsule = await getCapsule(capsuleId);
  if (!capsule) return NextResponse.json({ error: "Capsule introuvable" }, { status: 404 });

  // Déjà payée → rien à faire
  if (capsule.status === "ready" || capsule.status === "processing" || capsule.status === "paid") {
    return NextResponse.json({ status: capsule.status });
  }

  // Vérifier Stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-03-25.dahlia" });
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    console.error("[capsules/claim] retrieve session failed:", err);
    return NextResponse.json({ error: "Session Stripe introuvable" }, { status: 400 });
  }

  if (session.payment_status !== "paid") {
    return NextResponse.json({ error: "Paiement non confirmé", status: session.payment_status }, { status: 402 });
  }
  if (session.metadata?.capsuleId !== capsuleId) {
    return NextResponse.json({ error: "Session ne correspond pas à cette capsule" }, { status: 403 });
  }

  // Tout bon → marquer paid et déclencher le process (fire-and-forget)
  try {
    await markCapsulePaid(capsuleId, sessionId);
  } catch (err) {
    // Peut déjà être paid (race avec webhook), on ignore
    console.warn("[capsules/claim] markPaid warning:", (err as Error).message);
  }

  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_BASE_URL ?? `https://${req.headers.get("host")}`;
  fetch(`${origin}/api/capsules/${capsuleId}/process`, {
    method: "POST",
    headers: { "x-internal-trigger": "claim" },
  }).catch((e) => console.error("[capsules/claim] trigger process failed:", e));

  return NextResponse.json({ status: "paid", triggered: true });
}
