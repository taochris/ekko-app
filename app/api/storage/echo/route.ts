import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

export const runtime = "nodejs";

function initAdmin(): App {
  if (getApps().length > 0) return getApps()[0];
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n").replace(/^"|"$/g, ""),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export async function GET(req: NextRequest) {
  const echoId = req.nextUrl.searchParams.get("echo_id");
  if (!echoId) {
    return NextResponse.json({ error: "echo_id manquant" }, { status: 400 });
  }

  try {
    initAdmin();
    const bucket = getStorage().bucket();
    // Chercher dans echos/{uid}/{echoId}/ — on ne connaît pas l'uid depuis la page publique
    const [allFiles] = await bucket.getFiles({ prefix: "echos/" });
    const file = allFiles.find((f) => f.name.includes(`/${echoId}/`));

    if (!file) {
      return NextResponse.json({ error: "Écho introuvable ou expiré" }, { status: 404 });
    }
    const meta = file.metadata?.metadata ?? {};

    // Vérifier expiration
    if (meta.expiresAt) {
      const expires = new Date(meta.expiresAt as string);
      if (expires < new Date()) {
        await file.delete().catch(() => {});
        return NextResponse.json({ error: "Écho expiré" }, { status: 410 });
      }
    }

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

    return NextResponse.json({
      audioUrl: publicUrl,
      accentColor: meta.accentColor ?? "#c9a96e",
      theme: meta.theme ?? "deuil",
      expiresAt: meta.expiresAt ?? null,
    });
  } catch (err) {
    console.error("[storage/echo]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
