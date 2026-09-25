import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { getFirestore } from "firebase-admin/firestore";

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
    const audioFiles = files.filter((f) => AUDIO_EXTS.some((ext) => f.name.endsWith(`/audio${ext}`)));

    const rawEchos = audioFiles.map((f) => {
      const meta = f.metadata?.metadata ?? {};
      const parts = f.name.split("/");
      // Nouveau format : echos/{uid}/{echoId}/audio.mp4 → parts[2]
      // Ancien format : echos/{echoId}/audio.mp4 → parts[1]
      const echoId = parts.length === 4 ? parts[2] : parts[1];
      const expiresAt = String(meta.expiresAt ?? "");
      const expired = expiresAt ? new Date(expiresAt) < new Date() : false;
      const storageOption = parseInt(String(meta.storageOption ?? "0"), 10);
      return {
        echoId,
        capsuleId: String(meta.capsuleId ?? ""),
        theme: String(meta.theme ?? "deuil"),
        accentColor: String(meta.accentColor ?? "#c9a96e"),
        storageOption,
        expiresAt: expiresAt || null,
        expired,
        createdApprox: meta.createdAt ? String(meta.createdAt) : expiresAt
          ? (() => {
              const exp = new Date(expiresAt).getTime();
              const dur =
                storageOption === 100 ? 365 * 24 * 3600 * 1000 :
                storageOption === 200 ? 2 * 365 * 24 * 3600 * 1000 :
                7 * 24 * 3600 * 1000;
              return new Date(exp - dur).toISOString();
            })()
          : null,
        productType: String(meta.productType ?? "numerique"),
        nfcEnabled: false,
        paidAt: null as string | null,
      };
    }).filter((e) => !e.expired);

    // Joindre les données Firestore pour récupérer paidAt et productType
    const capsuleIds = rawEchos.map((e) => e.capsuleId).filter(Boolean);
    if (capsuleIds.length > 0) {
      const db = getFirestore();
      const snaps = await Promise.all(capsuleIds.map((id) => db.collection("capsules").doc(id).get()));
      const capsuleMap: Record<string, { productType?: string; nfcEnabled?: boolean; paidAt?: string | null }> = {};
      snaps.forEach((snap) => {
        if (snap.exists) {
          const d = snap.data() ?? {};
          const pt = d.paidAt;
          capsuleMap[snap.id] = {
            productType: d.productType ?? "numerique",
            nfcEnabled: d.nfcEnabled === true,
            paidAt: pt && typeof pt === "object" && "toDate" in pt
              ? (pt as { toDate: () => Date }).toDate().toISOString()
              : typeof pt === "string" ? pt : null,
          };
        }
      });
      rawEchos.forEach((e) => {
        const c = capsuleMap[e.capsuleId];
        if (c) {
          e.productType = c.productType ?? "numerique";
          e.nfcEnabled = c.nfcEnabled ?? false;
          e.paidAt = c.paidAt ?? e.createdApprox;
        }
      });
    }

    const echos = rawEchos.map(({ capsuleId: _c, ...rest }) => rest);
    return NextResponse.json({ echos });
  } catch (err) {
    console.error("[account/echos]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
