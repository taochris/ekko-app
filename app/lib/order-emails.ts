import { Resend } from "resend";
import QRCode from "qrcode";

// ─── Email client porte-clé ──────────────────────────────────────────────────
export function buildKeychainEmail({ capsuleId, engraveName, format, shippingName }: {
  capsuleId: string; engraveName: string; format: string; shippingName: string;
}): string {
  const formatLabel: Record<string, string> = {
    "etiquette-rect":     "Rectangulaire · 50×30 mm",
    "etiquette-arrondie": "Arrondie · 50,8×31,8 mm",
    "carre":              "Carré · 40×40 mm",
  };
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Commande EKKO</title></head>
<body style="margin:0;padding:0;background:#0d0a0f;font-family:Georgia,'Times New Roman',serif;color:#f0e8d8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0a0f;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#141018;border-radius:20px;border:1px solid rgba(201,169,110,0.15);overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,rgba(201,169,110,0.12),rgba(201,169,110,0.05));padding:36px 40px 28px;border-bottom:1px solid rgba(201,169,110,0.12);text-align:center;">
          <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#c9a96e;">EKKO</p>
          <h1 style="margin:0;font-size:22px;font-weight:300;color:#f0e8d8;line-height:1.4;">Votre porte-clé est en cours de fabrication</h1>
        </td></tr>
        <tr><td style="padding:36px 40px;">
          <p style="margin:0 0 20px;font-size:15px;color:rgba(240,232,216,0.85);line-height:1.75;">Merci ${shippingName} pour votre commande. ✦</p>
          <p style="margin:0 0 24px;font-size:15px;color:rgba(240,232,216,0.85);line-height:1.75;">Votre porte-clé en bois gravé au laser est en cours de fabrication. Vous recevrez un second email dès l'expédition.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(201,169,110,0.06);border:1px solid rgba(201,169,110,0.2);border-radius:14px;margin:0 0 28px;">
            <tr><td style="padding:22px 24px;">
              <p style="margin:0 0 14px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#c9a96e;">Récapitulatif commande</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="font-size:13px;color:rgba(240,232,216,0.5);padding:4px 0;">Prénom gravé</td><td style="font-size:13px;color:#f0e8d8;text-align:right;padding:4px 0;">${engraveName.toUpperCase()}</td></tr>
                <tr><td style="font-size:13px;color:rgba(240,232,216,0.5);padding:4px 0;">Format</td><td style="font-size:13px;color:#f0e8d8;text-align:right;padding:4px 0;">${formatLabel[format] ?? format}</td></tr>
                <tr><td style="font-size:13px;color:rgba(240,232,216,0.5);padding:4px 0;">Matière</td><td style="font-size:13px;color:#f0e8d8;text-align:right;padding:4px 0;">Bois naturel · Gravure laser</td></tr>
                <tr><td style="font-size:13px;color:rgba(240,232,216,0.5);padding:4px 0;">Livraison</td><td style="font-size:13px;color:#f0e8d8;text-align:right;padding:4px 0;">5–7 jours ouvrés · Gratuite</td></tr>
              </table>
              <p style="margin:18px 0 4px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(201,169,110,0.6);">Référence</p>
              <p style="margin:0;font-family:ui-monospace,monospace;font-size:12px;color:rgba(240,232,216,0.4);">${capsuleId}</p>
            </td></tr>
          </table>
          <p style="margin:0;font-size:13px;color:rgba(240,232,216,0.5);line-height:1.75;font-style:italic;">Des questions ? Répondez à cet email ou écrivez-nous à <a href="mailto:vosekko@outlook.com" style="color:#c9a96e;">vosekko@outlook.com</a>.</p>
        </td></tr>
        <tr><td style="padding:20px 40px 28px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
          <p style="margin:0;font-size:11px;color:rgba(240,232,216,0.25);">© EKKO · <a href="https://vosekko.com" style="color:rgba(240,232,216,0.35);text-decoration:none;">vosekko.com</a> · <a href="https://vosekko.com/cgv" style="color:rgba(240,232,216,0.35);text-decoration:none;">CGV</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Email admin nouvelle commande ───────────────────────────────────────────
export function buildAdminOrderEmail({ capsuleId, engraveName, format, qrUrl, shippingName, shippingAddress, customerPhone, customerEmail, amount }: {
  capsuleId: string; engraveName: string; format: string; qrUrl: string;
  shippingName: string; shippingAddress: string; customerPhone: string; customerEmail: string; amount: number;
}): string {
  const formatLabel: Record<string, string> = {
    "etiquette-rect":     "Rectangulaire (50×30 mm)",
    "etiquette-arrondie": "Arrondie (50,8×31,8 mm)",
    "carre":              "Carré (40×40 mm)",
  };
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/><title>Nouvelle commande EKKO</title></head>
<body style="margin:0;padding:0;background:#0a0a14;font-family:Georgia,serif;color:#f0e8d8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
    <tr><td align="center">
      <table width="540" cellpadding="0" cellspacing="0" style="max-width:540px;background:#141018;border-radius:16px;border:2px solid #c9a96e;overflow:hidden;">
        <tr><td style="background:#c9a96e;padding:20px 32px;">
          <p style="margin:0;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#0d0a0f;">EKKO — ADMIN</p>
          <h1 style="margin:4px 0 0;font-size:20px;font-weight:700;color:#0d0a0f;">🔑 Nouvelle commande porte-clé</h1>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td colspan="2" style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#c9a96e;padding-bottom:10px;">GRAVURE</td></tr>
            <tr><td style="font-size:14px;color:rgba(240,232,216,0.55);padding:4px 0;width:140px;">Prénom à graver</td><td style="font-size:16px;font-weight:bold;color:#f0e8d8;">${engraveName.toUpperCase()}</td></tr>
            <tr><td style="font-size:14px;color:rgba(240,232,216,0.55);padding:4px 0;">Format</td><td style="font-size:14px;color:#f0e8d8;">${formatLabel[format] ?? format}</td></tr>
            <tr><td style="font-size:14px;color:rgba(240,232,216,0.55);padding:4px 0;">Montant</td><td style="font-size:14px;color:#c9a96e;font-weight:bold;">${(amount / 100).toFixed(2)} €</td></tr>
          </table>
          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:20px 0;"/>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td colspan="2" style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#c9a96e;padding-bottom:10px;">LIVRAISON</td></tr>
            <tr><td style="font-size:14px;color:rgba(240,232,216,0.55);padding:4px 0;width:140px;">Nom</td><td style="font-size:14px;color:#f0e8d8;">${shippingName}</td></tr>
            <tr><td style="font-size:14px;color:rgba(240,232,216,0.55);padding:4px 0;vertical-align:top;">Adresse</td><td style="font-size:14px;color:#f0e8d8;">${shippingAddress}</td></tr>
            <tr><td style="font-size:14px;color:rgba(240,232,216,0.55);padding:4px 0;">Téléphone</td><td style="font-size:14px;color:#f0e8d8;">${customerPhone || "—"}</td></tr>
            <tr><td style="font-size:14px;color:rgba(240,232,216,0.55);padding:4px 0;">Email</td><td style="font-size:14px;color:#f0e8d8;">${customerEmail}</td></tr>
          </table>
          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:20px 0;"/>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td colspan="2" style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#c9a96e;padding-bottom:10px;">TECHNIQUE</td></tr>
            <tr><td style="font-size:13px;color:rgba(240,232,216,0.55);padding:4px 0;width:140px;">Capsule ID</td><td style="font-family:monospace;font-size:13px;color:rgba(240,232,216,0.7);">${capsuleId}</td></tr>
            <tr><td style="font-size:13px;color:rgba(240,232,216,0.55);padding:4px 0;">URL QR code</td><td style="font-size:13px;color:#c9a96e;">${qrUrl}</td></tr>
          </table>
          <p style="margin:24px 0 0;font-size:12px;color:rgba(240,232,216,0.4);font-style:italic;">Le fichier LightBurn SVG est en pièce jointe de cet email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Génération SVG LightBurn ─────────────────────────────────────────────────
export async function generateLightBurnSVG(capsuleId: string, engraveName: string, format: string, qrUrl: string, engravingFont = "Georgia, serif"): Promise<string> {
  const dims: Record<string, { w: number; h: number; rx: number }> = {
    "etiquette-rect":     { w: 30,   h: 50,   rx: 3  },
    "etiquette-arrondie": { w: 31.8, h: 50.8, rx: 14 },
    "carre":              { w: 40,   h: 40,   rx: 4  },
  };
  const dim = dims[format] ?? dims["etiquette-rect"];

  // Accès direct à la matrice QR (synchrone) — évite tout parsing SVG intermédiaire
  const qr = QRCode.create(qrUrl, { errorCorrectionLevel: "M" });
  const moduleCount = qr.modules.size;

  // QR : 72% de la dimension courte, décalé vers le bas (+8% de hauteur)
  const qrSizeMm = Math.min(dim.w, dim.h) * 0.72;
  const qrX = (dim.w - qrSizeMm) / 2;
  const topOffset = dim.h * 0.10 + 3; // légèrement plus bas
  const modSize = qrSizeMm / moduleCount;

  // Un seul <path> avec toutes les coordonnées directement en mm — aucun transform,
  // entièrement compatible LightBurn (pas de scale/translate imbriqué)
  let d = "";
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qr.modules.get(col, row)) {
        const mx = (qrX + col * modSize).toFixed(4);
        const my = (topOffset + row * modSize).toFixed(4);
        const ms = modSize.toFixed(4);
        d += `M${mx},${my}h${ms}v${ms}h-${ms}z`;
      }
    }
  }

  // Police plus grande (+30%) et texte décalé de 8mm vers le bas
  const fontSize = dim.w * 0.11;
  const textY = topOffset + qrSizeMm + fontSize * 1.9 + 8;

  // Largeur adaptative du texte : clamp(nbLettres * 2.3, 12, 23) mm — format rect uniquement
  const nameLen = engraveName.trim().length || 1;
  const textWidthMm = format === "etiquette-rect"
    ? Math.min(23, Math.max(12, nameLen * 2.3))
    : null;
  const textLengthAttr = textWidthMm !== null
    ? `textLength="${textWidthMm.toFixed(1)}" lengthAdjust="spacingAndGlyphs"`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- LightBurn SVG — EKKO — ${capsuleId} -->
<!-- Format : ${format} | Prénom : ${engraveName} | Police : ${engravingFont} -->
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 ${dim.w} ${dim.h}"
     width="${dim.w}mm" height="${dim.h}mm">

  <!-- ROUGE = Contour (ligne de coupe ou repère) -->
  <rect x="0.3" y="0.3" width="${(dim.w - 0.6).toFixed(2)}" height="${(dim.h - 0.6).toFixed(2)}"
        rx="${dim.rx}" ry="${dim.rx}"
        fill="none" stroke="#FF0000" stroke-width="0.25"/>

  <!-- NOIR = Gravure laser — QR Code (coordonnées directes en mm, sans transform) -->
  <!-- URL : ${qrUrl} -->
  <path fill="#000000" d="${d}"/>

  <!-- Prénom gravé -->
  <text x="${(dim.w / 2).toFixed(3)}" y="${textY.toFixed(3)}"
        text-anchor="middle"
        font-family="${engravingFont}"
        font-size="${fontSize.toFixed(3)}"
        font-weight="bold"
        fill="#000000"
        ${textLengthAttr}>
    ${engraveName.toUpperCase()}
  </text>

</svg>`;
}

// ─── Notification Pushover (optionnelle) ─────────────────────────────────────
export async function sendPushover(title: string, message: string): Promise<void> {
  const token = process.env.PUSHOVER_APP_TOKEN;
  const user  = process.env.PUSHOVER_USER_KEY;
  if (!token || !user) return;
  try {
    await fetch("https://api.pushover.net/1/messages.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, user, title, message, priority: 1 }),
    });
  } catch (e) {
    console.error("[pushover]", e);
  }
}

// ─── Envoi groupé emails + Pushover pour une commande porteClef ──────────────
export async function sendKeychainOrderEmails({
  capsuleId, engraveName, format, qrUrl,
  shippingName, shippingAddress, customerPhone, customerEmail,
  amount,
}: {
  capsuleId: string; engraveName: string; format: string; qrUrl: string;
  shippingName: string; shippingAddress: string; customerPhone: string;
  customerEmail: string; amount: number;
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[order-emails] RESEND_API_KEY absent — emails non envoyés");
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const adminEmail = process.env.ADMIN_EMAIL ?? "vosekko@outlook.com";

  if (customerEmail) {
    try {
      const { data, error } = await resend.emails.send({
        from: "EKKO <onboarding@resend.dev>",
        to: customerEmail,
        subject: "Votre porte-clé EKKO est en cours de fabrication ✦",
        html: buildKeychainEmail({ capsuleId, engraveName, format, shippingName }),
      });
      if (error) console.error("[order-emails] email client ERREUR:", JSON.stringify(error));
      else console.log("[order-emails] email client envoyé →", customerEmail, "id:", data?.id);
    } catch (e) {
      console.error("[order-emails] email client exception:", e);
    }
  } else {
    console.warn("[order-emails] pas de customerEmail — email client non envoyé");
  }

  try {
    const svg = await generateLightBurnSVG(capsuleId, engraveName, format, qrUrl);
    const { data, error } = await resend.emails.send({
      from: "EKKO <ekko@vosekko.com>",
      to: adminEmail,
      subject: `🔑 Nouvelle commande porte-clé — ${engraveName.toUpperCase()}`,
      html: buildAdminOrderEmail({ capsuleId, engraveName, format, qrUrl, shippingName, shippingAddress, customerPhone, customerEmail, amount }),
      attachments: [{
        filename: `lightburn-${engraveName.toLowerCase()}-${capsuleId.slice(0, 8)}.svg`,
        content: Buffer.from(svg),
      }],
    });
    if (error) console.error("[order-emails] email admin ERREUR:", JSON.stringify(error));
    else console.log("[order-emails] email admin envoyé →", adminEmail, "id:", data?.id);

    sendPushover(
      "🔑 Nouvelle commande EKKO",
      `Prénom : ${engraveName}\nFormat : ${format}\nClient : ${shippingName}\n${shippingAddress}`
    ).catch((e) => console.error("[order-emails] pushover:", e));
  } catch (e) {
    console.error("[order-emails] email admin exception:", e);
  }
}
