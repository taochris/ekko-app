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
  const uid = req.nextUrl.searchParams.get("uid");
  if (!uid) return NextResponse.json({ error: "uid manquant" }, { status: 400 });

  try {
    initAdmin();
    const bucket = getStorage().bucket();
    const [files] = await bucket.getFiles({ prefix: `echos/${uid}/` });

    const AUDIO_EXTS = [".mp4", ".ogg", ".opus", ".mp3", ".m4a", ".wav", ".webm"];
    const echos = files
      .filter((f) => AUDIO_EXTS.some((ext) => f.name.endsWith(`/audio${ext}`)))
      .map((f) => {
        const meta = f.metadata?.metadata ?? {};
        const parts = f.name.split("/");
        // Nouveau format : echos/{uid}/{echoId}/audio.mp4 → parts[2]
        // Ancien format : echos/{echoId}/audio.mp4 → parts[1]
        const echoId = parts.length === 4 ? parts[2] : parts[1];
        const expiresAt = String(meta.expiresAt ?? "");
        const expired = expiresAt ? new Date(expiresAt) < new Date() : false;
        return {
          echoId,
          theme: String(meta.theme ?? "deuil"),
          accentColor: String(meta.accentColor ?? "#c9a96e"),
          storageOption: parseInt(String(meta.storageOption ?? "0"), 10),
          expiresAt: expiresAt || null,
          expired,
          createdApprox: expiresAt
            ? (() => {
                const exp = new Date(expiresAt).getTime();
                const opt = parseInt(String(meta.storageOption ?? "0"), 10);
                const dur =
                  opt === 100 ? 365 * 24 * 3600 * 1000 :
                  opt === 200 ? 2 * 365 * 24 * 3600 * 1000 :
                  7 * 24 * 3600 * 1000;
                return new Date(exp - dur).toISOString();
              })()
            : null,
        };
      })
      .filter((e) => !e.expired);

    return NextResponse.json({ echos });
  } catch (err) {
    console.error("[account/echos]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
