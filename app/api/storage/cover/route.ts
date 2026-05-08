import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

export const runtime = "nodejs";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

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

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const uid = formData.get("uid") as string | null;
    const echoId = formData.get("echoId") as string | null;

    if (!file || !uid || !echoId) {
      return NextResponse.json({ error: "Paramètres manquants (file, uid, echoId)" }, { status: 400 });
    }
    if (!ALLOWED_MIME.has(file.type)) {
      return NextResponse.json({ error: "Format non autorisé. Utilisez JPEG, PNG ou WebP." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Image trop lourde (max 10 MB)." }, { status: 400 });
    }

    // Vérifier magic bytes image
    const buf = await file.slice(0, 12).arrayBuffer();
    const b = new Uint8Array(buf);
    const isJpeg = b[0] === 0xFF && b[1] === 0xD8;
    const isPng  = b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47;
    const isWebp = b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46;
    if (!isJpeg && !isPng && !isWebp) {
      return NextResponse.json({ error: "Le fichier ne semble pas être une image valide." }, { status: 400 });
    }

    initAdmin();
    const bucket = getStorage().bucket();

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const destPath = `echos/${uid}/${echoId}/cover.${ext}`;
    const destFile = bucket.file(destPath);

    const arrayBuf = await file.arrayBuffer();
    await destFile.save(Buffer.from(arrayBuf), {
      metadata: { contentType: file.type },
    });
    await destFile.makePublic();

    const coverUrl = `https://storage.googleapis.com/${bucket.name}/${destPath}`;
    return NextResponse.json({ coverUrl });
  } catch (err) {
    console.error("[storage/cover]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
