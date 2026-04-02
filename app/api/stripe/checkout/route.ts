import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-03-25.dahlia",
  });
  try {
    const { theme } = await req.json();
    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: 999,
            product_data: {
              name: "Vocapsule EKKO — Accès complet",
              description: "Import, tri, assemblage des voix, téléchargement et QR code.",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/theme/${theme ?? "deuil"}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/theme/${theme ?? "deuil"}?payment=cancel`,
      locale: "fr",
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json({ error: "Erreur lors de la création du paiement." }, { status: 500 });
  }
}
