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

  if (!echoId) {
    return NextResponse.json({ error: "echoId manquant" }, { status: 400 });
  }

  try {
    initAdmin();
    const bucket = getStorage().bucket();

    // Chercher le fichier — supporte les deux formats de path
    const [files] = await bucket.getFiles({ prefix: "echos/" });
    const match = files.find(f => f.name.includes(echoId) && f.name.endsWith("audio.mp4"));

    if (!match) {
      return NextResponse.json({ error: "Echo introuvable" }, { status: 404 });
    }

    const [buffer] = await match.download();
    const contentType = (match.metadata.contentType as string) ?? "audio/mp4";
    const filename = `echo-ekko-${echoId.slice(0, 8)}.mp4`;

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
