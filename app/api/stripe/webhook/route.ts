import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { markCapsulePaid } from "../../../lib/capsules";

export const runtime = "nodejs";

/**
 * Webhook Stripe.
 * - Vérifie la signature
 * - Sur checkout.session.completed : marque la capsule "paid" et déclenche la fusion (fire-and-forget)
 * - Idempotent : si la capsule n'est pas en "pending", on ignore
 *
 * Config Stripe :
 * - Dashboard Stripe > Developers > Webhooks > Add endpoint
 * - URL : https://<votre-domaine>/api/stripe/webhook
 * - Events : checkout.session.completed
 * - Copier le "signing secret" dans la variable d'env STRIPE_WEBHOOK_SECRET
 */
export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-03-25.dahlia",
  });
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[stripe/webhook] STRIPE_WEBHOOK_SECRET manquant");
    return NextResponse.json({ error: "Webhook non configuré" }, { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Signature manquante" }, { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("[stripe/webhook] signature invalide:", (err as Error).message);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const capsuleId = session.metadata?.capsuleId;
    if (!capsuleId) {
      console.error("[stripe/webhook] capsuleId absent du metadata");
      return NextResponse.json({ received: true });
    }
    try {
      await markCapsulePaid(capsuleId, session.id);
      console.log("[stripe/webhook] capsule marquée paid:", capsuleId);
      // Déclencher le processing en fire-and-forget
      const origin = process.env.NEXT_PUBLIC_BASE_URL ?? `https://${req.headers.get("host")}`;
      fetch(`${origin}/api/capsules/${capsuleId}/process`, {
        method: "POST",
        headers: { "x-internal-trigger": "stripe-webhook" },
      }).catch((e) => console.error("[stripe/webhook] trigger process failed:", e));
    } catch (err) {
      console.error("[stripe/webhook] markCapsulePaid error:", err);
    }
  }

  return NextResponse.json({ received: true });
}
