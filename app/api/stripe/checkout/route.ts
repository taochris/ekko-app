import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createCapsule } from "../../../lib/capsules";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { theme, uploadId, storage, storageLabel, uid, accentColor, email, devBypass, product, engraveName, format, material } = await req.json();
    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const isPorteClef = product === "porteClef";

    // 1. Créer la capsule Firestore en statut "pending"
    const capsuleId = await createCapsule({
      uid: uid || "anonymous",
      theme: theme || "deuil",
      accentColor: accentColor || "#c9a96e",
      storageOption: storage ?? 0,
      uploadId: uploadId || "",
      productType: isPorteClef ? "porteClef" : "numerique",
      ...(isPorteClef ? { engraveName, format, material: material || "bois" } : {}),
      customerEmail: email || "",
    });

    // ── Bypass dev : pas de Stripe si c'est le compte dev ──
    const devUid = process.env.NEXT_PUBLIC_DEV_UID;
    if (devBypass && devUid && uid === devUid) {
      await fetch(`${origin}/api/capsules/${capsuleId}/dev-claim`, { method: "POST" });
      return NextResponse.json({ capsuleId });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-03-25.dahlia",
    });

    // 2. Session Stripe avec capsuleId en metadata (consommé par le webhook)
    const lineItem = isPorteClef
      ? {
          price_data: {
            currency: "eur",
            unit_amount: 2490,
            product_data: {
              name: "Porte-clé EKKO en bois gravé",
              description:
                "Porte-clé bois gravé au laser · QR code unique" +
                (engraveName ? ` · Gravure « ${engraveName} »` : "") +
                " · Anneau inox · Expédition gratuite",
            },
          },
          quantity: 1,
        }
      : {
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
        };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [lineItem],
      metadata: {
        capsuleId,
        customerEmail: email || "",
        productType: isPorteClef ? "porteClef" : "numerique",
        ...(isPorteClef ? { engraveName: engraveName || "", format: format || "" } : {}),
      },
      ...(isPorteClef ? {
        shipping_address_collection: { allowed_countries: ["FR", "BE", "CH", "LU", "MC"] },
        phone_number_collection: { enabled: true },
      } : {}),
      ...(email ? { customer_email: email } : {}),
      ...(email ? { payment_intent_data: { receipt_email: email } } : {}),
      success_url: `${origin}/capsule/${capsuleId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: isPorteClef
        ? `${origin}/theme-porteClef/${theme ?? "deuil"}?payment=cancel`
        : `${origin}/theme/${theme ?? "deuil"}?payment=cancel`,
      locale: "fr",
    });

    return NextResponse.json({ url: session.url, capsuleId });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json({ error: "Erreur lors de la création du paiement." }, { status: 500 });
  }
}
