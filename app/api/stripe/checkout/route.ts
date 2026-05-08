import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createCapsule } from "../../../lib/capsules";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { theme, uploadId, storage, storageLabel, uid, accentColor, email, devBypass } = await req.json();
    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

    // 1. Créer la capsule Firestore en statut "pending"
    const capsuleId = await createCapsule({
      uid: uid || "anonymous",
      theme: theme || "deuil",
      accentColor: accentColor || "#c9a96e",
      storageOption: storage ?? 0,
      uploadId: uploadId || "",
    });

    // ── Bypass dev : pas de Stripe, on marque paid + on déclenche process ──
    if (devBypass && process.env.NEXT_PUBLIC_DEV_BYPASS === "true") {
      await fetch(`${origin}/api/capsules/${capsuleId}/dev-claim`, { method: "POST" });
      return NextResponse.json({ capsuleId });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-03-25.dahlia",
    });

    // 2. Session Stripe avec capsuleId en metadata (consommé par le webhook)
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: 999 + (storage ?? 0),
            product_data: {
              name: "Écho EKKO — Accès complet" + (storageLabel ? ` + ${storageLabel}` : ""),
              description:
                "Assemblage de vos voix · Téléchargement MP3 · QR code" +
                (storageLabel ? ` · Conservation ${storageLabel}` : ""),
            },
          },
          quantity: 1,
        },
      ],
      metadata: { capsuleId, customerEmail: email || "" },
      ...(email ? { customer_email: email } : {}),
      success_url: `${origin}/capsule/${capsuleId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/theme/${theme ?? "deuil"}?payment=cancel`,
      locale: "fr",
    });

    return NextResponse.json({ url: session.url, capsuleId });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json({ error: "Erreur lors de la création du paiement." }, { status: 500 });
  }
}
