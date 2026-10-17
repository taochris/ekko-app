import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

export const runtime = "nodejs";

function initAdmin() {
  if (getApps().length > 0) return;
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n").replace(/^"|"$/g, ""),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export async function GET(req: NextRequest) {
  const echoId = req.nextUrl.searchParams.get("echoId");
  const download = req.nextUrl.searchParams.get("download") === "1";

  if (!echoId || !/^[a-zA-Z0-9_-]{1,128}$/.test(echoId)) {
    return NextResponse.json({ error: "echoId manquant ou invalide" }, { status: 400 });
  }

  try {
    initAdmin();
    const bucket = getStorage().bucket();

    // Chercher le fichier — supporte les deux formats de path
    const [files] = await bucket.getFiles({ prefix: "echos/" });
    const match = files.find(f => f.name.includes(`/${echoId}/`) && /\/audio\.[a-z0-9]+$/.test(f.name));

    if (!match) {
      return NextResponse.json({ error: "Echo introuvable" }, { status: 404 });
    }

    // Vérifier l'expiration comme sur /api/storage/echo
    const meta = match.metadata?.metadata ?? {};
    if (meta.expiresAt) {
      const expires = new Date(String(meta.expiresAt));
      if (expires < new Date()) {
        await match.delete().catch(() => {});
        return NextResponse.json({ error: "Écho expiré" }, { status: 410 });
      }
    }

    const [buffer] = await match.download();
    const ext = match.name.split(".").pop() ?? "opus";
    const contentType = (match.metadata.contentType as string) ?? "audio/ogg; codecs=opus";
    const filename = `echo-ekko-${echoId.slice(0, 8)}.${ext}`;

    const uint8 = new Uint8Array(buffer);

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(buffer.length),
        "Content-Disposition": download
          ? `attachment; filename="${filename}"`
          : `inline; filename="${filename}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("[storage/proxy]", err);
    return NextResponse.json({ error: "Erreur proxy" }, { status: 500 });
  }
}
