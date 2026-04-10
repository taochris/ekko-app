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
  const uploadId = req.nextUrl.searchParams.get("upload_id");
  if (!uploadId) {
    return NextResponse.json({ error: "upload_id manquant" }, { status: 400 });
  }

  try {
    initAdmin();
    const bucket = getStorage().bucket();
    const [files] = await bucket.getFiles({ prefix: `temp/${uploadId}/` });

    const results = await Promise.all(
      files.map(async (file) => {
        const [buffer] = await file.download();
        const name = file.name.split("/").pop() ?? file.name;
        const b64 = buffer.toString("base64");
        const contentType = file.metadata.contentType ?? "audio/mpeg";
        return { name, b64, contentType };
      })
    );

    return NextResponse.json({ files: results });
  } catch (err) {
    console.error("[storage/download]", err);
    return NextResponse.json({ error: "Erreur téléchargement Firebase" }, { status: 500 });
  }
}
