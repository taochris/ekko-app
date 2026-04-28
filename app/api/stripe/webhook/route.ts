import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { markCapsulePaid } from "../../../lib/capsules";

export const runtime = "nodejs";

function buildConfirmationEmail({ capsuleUrl, capsuleId }: { capsuleUrl: string; capsuleId: string }): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Votre vocapsule EKKO</title>
</head>
<body style="margin:0;padding:0;background:#0d0a0f;font-family:Georgia,'Times New Roman',serif;color:#f0e8d8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0a0f;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#141018;border-radius:20px;border:1px solid rgba(201,169,110,0.15);overflow:hidden;">

          <!-- Header doré -->
          <tr>
            <td style="background:linear-gradient(135deg,rgba(201,169,110,0.12),rgba(201,169,110,0.05));padding:36px 40px 28px;border-bottom:1px solid rgba(201,169,110,0.12);text-align:center;">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#c9a96e;">EKKO</p>
              <h1 style="margin:0;font-size:22px;font-weight:300;color:#f0e8d8;line-height:1.4;">Votre vocapsule est en cours de création</h1>
            </td>
          </tr>

          <!-- Corps -->
          <tr>
            <td style="padding:36px 40px;">

              <p style="margin:0 0 20px;font-size:15px;color:rgba(240,232,216,0.85);line-height:1.75;">
                Merci pour votre commande. 🎧
              </p>

              <p style="margin:0 0 20px;font-size:15px;color:rgba(240,232,216,0.85);line-height:1.75;">
                Nous avons bien reçu votre paiement et la création de votre vocapsule a démarré immédiatement.
                Dans quelques instants, vos voix seront réunies en un seul écho.
              </p>

              <!-- Bloc capsule -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(201,169,110,0.06);border:1px solid rgba(201,169,110,0.2);border-radius:14px;margin:28px 0;">
                <tr>
                  <td style="padding:22px 24px;">
                    <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#c9a96e;">Votre vocapsule</p>
                    <p style="margin:0 0 18px;font-size:13px;color:rgba(240,232,216,0.45);font-family:ui-monospace,monospace;">${capsuleId}</p>
                    <a href="${capsuleUrl}" style="display:inline-block;padding:12px 28px;border-radius:50px;background:linear-gradient(135deg,rgba(201,169,110,0.4),rgba(201,169,110,0.6));border:1px solid rgba(201,169,110,0.5);color:#f0e8d8;font-size:14px;text-decoration:none;letter-spacing:0.05em;">
                      Accéder à ma vocapsule →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 20px;font-size:15px;color:rgba(240,232,216,0.85);line-height:1.75;">
                Une fois la création terminée, vous pourrez télécharger votre fichier MP3 et accéder à votre QR code personnel.
              </p>

              <p style="margin:0 0 8px;font-size:15px;color:rgba(240,232,216,0.85);line-height:1.75;">
                Si vous avez des questions, répondez simplement à cet email ou contactez-nous à{' '}
                <a href="mailto:contact@vosekko.com" style="color:#c9a96e;text-decoration:underline;">contact@vosekko.com</a>.
              </p>

              <p style="margin:32px 0 0;font-size:14px;color:rgba(240,232,216,0.5);font-style:italic;line-height:1.7;">
                Merci de nous avoir confié vos voix.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 28px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
              <p style="margin:0;font-size:11px;color:rgba(240,232,216,0.25);">
                © EKKO · <a href="https://vosekko.com" style="color:rgba(240,232,216,0.35);text-decoration:none;">vosekko.com</a> ·
                <a href="https://vosekko.com/cgv" style="color:rgba(240,232,216,0.35);text-decoration:none;">CGV</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

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
    const customerEmail = session.metadata?.customerEmail || session.customer_details?.email || "";

    if (!capsuleId) {
      console.error("[stripe/webhook] capsuleId absent du metadata");
      return NextResponse.json({ received: true });
    }
    try {
      await markCapsulePaid(capsuleId, session.id);
      console.log("[stripe/webhook] capsule marquée paid:", capsuleId);

      // Envoyer l'email de confirmation
      if (customerEmail && process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const origin = process.env.NEXT_PUBLIC_BASE_URL ?? `https://${req.headers.get("host")}`;
        const capsuleUrl = `${origin}/capsule/${capsuleId}`;
        resend.emails.send({
          from: "EKKO <onboarding@resend.dev>",
          to: customerEmail,
          subject: "Votre vocapsule EKKO est en cours de création ✦",
          html: buildConfirmationEmail({ capsuleUrl, capsuleId }),
        }).catch((e: unknown) => console.error("[stripe/webhook] email error:", e));
      }

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
