import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { promises as fs } from "fs";
import { spawn } from "child_process";
import os from "os";
import path from "path";
import ffmpegStatic from "ffmpeg-static";

const ffmpegPath: string = process.env.FFMPEG_PATH ?? (ffmpegStatic as string) ?? "ffmpeg";

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

function expiresAt(storageOption: number): Date {
  const now = Date.now();
  if (storageOption === 100) return new Date(now + 365 * 24 * 3600 * 1000);
  if (storageOption === 200) return new Date(now + 2 * 365 * 24 * 3600 * 1000);
  return new Date(now + 7 * 24 * 3600 * 1000);
}

// Concat via ffmpeg concat demuxer — pas besoin de ffprobe
function mergeWithFfmpeg(inputPaths: string[], outputPath: string, tmpDir: string): Promise<void> {
  return new Promise(async (resolve, reject) => {
    // Créer un fichier de liste pour le concat demuxer
    const listPath = path.join(tmpDir, "list.txt");
    const listContent = inputPaths.map((p) => `file '${p.replace(/\\/g, "/")}'`).join("\n");
    await fs.writeFile(listPath, listContent, "utf8");

    const ffmpeg = ffmpegPath;
    const args = [
      "-y",
      "-f", "concat",
      "-safe", "0",
      "-i", listPath,
      "-c", "copy",
      outputPath,
    ];

    const proc = spawn(ffmpeg, args);
    let stderr = "";
    proc.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exit ${code}: ${stderr.slice(-300)}`));
    });
    proc.on("error", reject);
  });
}

export async function POST(req: NextRequest) {
  const { uploadId, theme, storageOption, accentColor, uid } = await req.json();
  if (!uploadId) {
    return NextResponse.json({ error: "uploadId manquant" }, { status: 400 });
  }

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "ekko-"));
  const inputPaths: string[] = [];

  try {
    initAdmin();
    const bucket = getStorage().bucket();

    // 1. Lister les fichiers temp
    const [tempFiles] = await bucket.getFiles({ prefix: `temp/${uploadId}/` });
    if (tempFiles.length === 0) {
      return NextResponse.json({ error: "Aucun fichier trouvé" }, { status: 404 });
    }

    // 2. Trier les fichiers par nom (préfixe 0000_, 0001_, ...) pour respecter l'ordre de sélection
    tempFiles.sort((a, b) => a.name.localeCompare(b.name));
    const ext = tempFiles[0].name.split(".").pop() ?? "mp4";
    const orderedPaths: string[] = new Array(tempFiles.length);
    await Promise.all(
      tempFiles.map(async (f, i) => {
        const [buf] = await f.download();
        const p = path.join(tmpDir, `input_${i}.${ext}`);
        await fs.writeFile(p, buf);
        orderedPaths[i] = p;
      })
    );
    orderedPaths.forEach(p => inputPaths.push(p));

    // 3. Fusionner avec ffmpeg (concat propre)
    const outputPath = path.join(tmpDir, `output.mp4`);
    if (inputPaths.length === 1) {
      await fs.copyFile(inputPaths[0], outputPath);
    } else {
      await mergeWithFfmpeg(inputPaths, outputPath, tmpDir);
    }

    const mergedBuf = await fs.readFile(outputPath);

    // 4. Upload sur Firebase
    const echoId = crypto.randomUUID();
    const expires = expiresAt(storageOption ?? 0);
    const ownerUid = uid ?? "anonymous";
    const destPath = `echos/${ownerUid}/${echoId}/audio.mp4`;
    const destFile = bucket.file(destPath);

    await destFile.save(mergedBuf, {
      metadata: {
        contentType: "video/mp4",
        metadata: {
          theme,
          accentColor,
          storageOption: String(storageOption ?? 0),
          expiresAt: expires.toISOString(),
          uploadId,
          uid: ownerUid,
        },
      },
    });

    await destFile.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destPath}`;

    // 5. Supprimer les fichiers temporaires Firebase
    await Promise.all(tempFiles.map((f) => f.delete().catch(() => {})));

    return NextResponse.json({
      echoId,
      audioUrl: publicUrl,
      expiresAt: expires.toISOString(),
    });
  } catch (err) {
    console.error("[storage/merge]", err);
    return NextResponse.json({ error: "Erreur fusion" }, { status: 500 });
  } finally {
    // Nettoyage fichiers tmp locaux
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}
