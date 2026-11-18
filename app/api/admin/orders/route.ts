import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getAdminApp, getAdminFirestore } from "../../../lib/firebaseAdmin";
import { generateLightBurnSVG, shortQrUrl, sendTelegramOrderAlert } from "../../../lib/order-emails";

export const runtime = "nodejs";

const ADMIN_UIDS = new Set(["P2zXABb32JWGnOT0TZicWLL35lk2"]);
const ADMIN_EMAILS = new Set(["taochris66@hotmail.fr", "vosekko@outlook.com"]);

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
    if (!token) return false;
    const decoded = await getAuth(getAdminApp()).verifyIdToken(token);
    return (
      ADMIN_UIDS.has(decoded.uid) ||
      (!!decoded.email && ADMIN_EMAILS.has(decoded.email.toLowerCase()))
    );
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Accès réservé à l'administrateur" }, { status: 403 });
  }

  const db = getAdminFirestore();
  const snap = await db
    .collection("capsules")
    .where("productType", "==", "porteClef")
    .get();

  const orders = snap.docs
    .map((d) => {
      const x = d.data();
      return {
        capsuleId: d.id,
        status: String(x.status ?? ""),
        engraveName: String(x.engraveName ?? ""),
        engravingFont: String(x.engravingFont ?? "Georgia, serif"),
        format: String(x.format ?? "etiquette-rect"),
        nfcEnabled: Boolean(x.nfcEnabled),
        smartSearchEnabled: Boolean(x.smartSearchEnabled),
        shippingName: String(x.shippingName ?? ""),
        shippingAddress: String(x.shippingAddress ?? ""),
        customerPhone: String(x.customerPhone ?? ""),
        customerEmail: String(x.customerEmail ?? ""),
        createdAt: String(x.createdAt ?? ""),
        paidAt: String(x.paidAt ?? x.createdAt ?? ""),
        shipped: Boolean(x.shipped),
        shippedAt: x.shippedAt ? String(x.shippedAt) : null,
        shortUrl: shortQrUrl(d.id),
      };
    })
    .filter((o) => o.status === "paid" || o.status === "ready" || o.status === "processing" || o.status === "paid_awaiting_selection")
    .sort((a, b) => (b.paidAt || b.createdAt).localeCompare(a.paidAt || a.createdAt));

  const pendingCount = orders.filter((o) => !o.shipped).length;

  const settingsSnap = await db.collection("settings").doc("admin_notifications").get();
  const settingsData = settingsSnap.exists ? settingsSnap.data() ?? {} : {};
  const telegramConfigured = Boolean(
    (settingsData.telegramBotToken && settingsData.telegramChatId) ||
      (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID)
  );

  return NextResponse.json({
    orders,
    pendingCount,
    telegramConfigured,
    telegramBotName: settingsData.telegramBotName ?? null,
  });
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Accès réservé à l'administrateur" }, { status: 403 });
  }

  const body = await req.json();
  const action = String(body.action ?? "");
  const db = getAdminFirestore();

  if (action === "toggleShipped") {
    const capsuleId = String(body.capsuleId ?? "").trim();
    const shipped = Boolean(body.shipped);
    if (!capsuleId) return NextResponse.json({ error: "capsuleId manquant" }, { status: 400 });
    await db.collection("capsules").doc(capsuleId).update({
      shipped,
      shippedAt: shipped ? new Date().toISOString() : null,
    });
    return NextResponse.json({ ok: true, shipped });
  }

  if (action === "downloadSvg") {
    const capsuleId = String(body.capsuleId ?? "").trim();
    if (!capsuleId) return NextResponse.json({ error: "capsuleId manquant" }, { status: 400 });
    const doc = await db.collection("capsules").doc(capsuleId).get();
    if (!doc.exists) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    const x = doc.data() ?? {};
    const shortUrl = shortQrUrl(capsuleId);
    const svg = await generateLightBurnSVG(
      capsuleId,
      String(x.engraveName ?? ""),
      String(x.format ?? "etiquette-rect"),
      shortUrl,
      String(x.engravingFont ?? "Georgia, serif")
    );
    return NextResponse.json({
      svg,
      filename: `lightburn-${(String(x.engraveName ?? "qr") || "qr").toLowerCase()}-${capsuleId.slice(0, 8)}.svg`,
    });
  }

  if (action === "connectTelegram") {
    let botToken = String(body.botToken ?? "").trim();
    const existingSnap = await db.collection("settings").doc("admin_notifications").get();
    if (!botToken && existingSnap.exists) {
      botToken = String(existingSnap.data()?.telegramBotToken ?? "");
    }
    if (!botToken) {
      return NextResponse.json({ error: "Collez d'abord le token de votre bot Telegram." }, { status: 400 });
    }

    const meRes = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const meData = await meRes.json().catch(() => ({}));
    if (!meRes.ok || !meData.ok) {
      return NextResponse.json({ error: "Token Telegram invalide. Vérifiez le token donné par @BotFather." }, { status: 400 });
    }
    const botUsername = meData.result?.username ?? "votre_bot";

    const updRes = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates?limit=20`);
    const updData = await updRes.json().catch(() => ({}));
    const updates = Array.isArray(updData.result) ? updData.result : [];
    let foundChatId = "";
    for (let i = updates.length - 1; i >= 0; i--) {
      const msg = updates[i]?.message || updates[i]?.edited_message || updates[i]?.my_chat_member;
      if (msg?.chat?.id) {
        foundChatId = String(msg.chat.id);
        break;
      }
    }

    if (!foundChatId && existingSnap.exists && existingSnap.data()?.telegramChatId) {
      foundChatId = String(existingSnap.data()?.telegramChatId);
    }

    if (!foundChatId) {
      return NextResponse.json(
        {
          error: `Ouvrez @${botUsername} dans Telegram sur votre téléphone, appuyez sur "Démarrer" (ou envoyez-lui "Bonjour"), puis recliquez sur ce bouton !`,
          botUsername,
        },
        { status: 400 }
      );
    }

    await db.collection("settings").doc("admin_notifications").set(
      {
        telegramBotToken: botToken,
        telegramChatId: foundChatId,
        telegramBotName: botUsername,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    await sendTelegramOrderAlert(
      "✅ Notifications VOSEKKO activées !\nVous recevrez désormais une alerte instantanée ici à chaque commande physique de porte-clé."
    );

    return NextResponse.json({ ok: true, botUsername, chatId: foundChatId });
  }

  if (action === "testTelegram") {
    const sent = await sendTelegramOrderAlert(
      "🔔 Test d'alerte VOSEKKO : votre téléphone reçoit bien les notifications prioritaires de commandes de porte-clés !"
    );
    if (!sent) {
      return NextResponse.json({ error: "Telegram n'est pas encore configuré." }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}
