import { NextRequest, NextResponse } from "next/server";
import { promises as fs, existsSync } from "fs";
import { spawn } from "child_process";
import os from "os";
import path from "path";
import ffmpegStatic from "ffmpeg-static";
import { getAdminBucket } from "../../../../lib/firebaseAdmin";
import {
  getCapsule,
  markCapsuleProcessing,
  markCapsuleReady,
  markCapsuleFailed,
} from "../../../../lib/capsules";

export const runtime = "nodejs";
export const maxDuration = 60; // Vercel : autoriser jusqu'à 60s pour la fusion

/**
 * Résout le chemin ffmpeg de façon robuste :
 * 1. Si FFMPEG_PATH est défini ET que le fichier existe → l'utiliser (dev local)
 * 2. Sinon ffmpeg-static (Vercel et autres) → vérifier qu'il existe
 * 3. Sinon "ffmpeg" (PATH système, dernier recours)
 *
 * On IGNORE explicitement FFMPEG_PATH si le fichier n'existe pas : cela évite
 * qu'une valeur locale (ex: C:\... de Windows) fuite sur Vercel Linux.
 */
function resolveFfmpegPath(): string {
  const envPath = process.env.FFMPEG_PATH;
  if (envPath && existsSync(envPath)) {
    console.log("[ffmpeg] FFMPEG_PATH OK:", envPath);
    return envPath;
  }
  if (envPath) {
    console.warn("[ffmpeg] FFMPEG_PATH defini mais fichier inexistant (ignoré):", envPath);
  }
  const staticPath = ffmpegStatic as string | null;
  if (staticPath && existsSync(staticPath)) {
    console.log("[ffmpeg] ffmpeg-static OK:", staticPath);
    return staticPath;
  }
  if (staticPath) {
    console.warn("[ffmpeg] ffmpeg-static pointe sur un fichier inexistant:", staticPath);
  } else {
    console.warn("[ffmpeg] ffmpeg-static renvoie null (binaire pas installé?)");
  }
  console.warn("[ffmpeg] fallback sur 'ffmpeg' du PATH système");
  return "ffmpeg";
}

function expiresAt(storageOption: number): Date {
  const now = Date.now();
  if (storageOption === 100) return new Date(now + 365 * 24 * 3600 * 1000);
  if (storageOption === 200) return new Date(now + 2 * 365 * 24 * 3600 * 1000);
  return new Date(now + 7 * 24 * 3600 * 1000);
}

function mergeWithFfmpeg(inputPaths: string[], outputPath: string, tmpDir: string): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const listPath = path.join(tmpDir, "list.txt");
    const listContent = inputPaths.map((p) => `file '${p.replace(/\\/g, "/")}'`).join("\n");
    await fs.writeFile(listPath, listContent, "utf8");

    const args = ["-y", "-f", "concat", "-safe", "0", "-i", listPath, "-c", "copy", outputPath];
    const bin = resolveFfmpegPath();
    const proc = spawn(bin, args);
    let stderr = "";
    proc.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exit ${code}: ${stderr.slice(-400)}`));
    });
    proc.on("error", reject);
  });
}

/**
 * Processeur de capsule : fusionne les audios Firebase temp/, upload le résultat,
 * met à jour la capsule Firestore (processing → ready/failed).
 *
 * Idempotent : si la capsule est déjà "ready", on renvoie directement.
 * Peut être appelé depuis le webhook Stripe OU depuis /api/capsules/[id]/claim.
 */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: capsuleId } = await params;
  const capsule = await getCapsule(capsuleId);
  if (!capsule) return NextResponse.json({ error: "Capsule introuvable" }, { status: 404 });

  if (capsule.status === "ready") {
    return NextResponse.json({ status: "ready", echoId: capsule.echoId, audioUrl: capsule.audioUrl });
  }
  if (capsule.status === "processing") {
    // Traitement déjà en cours ailleurs, ne pas doubler
    return NextResponse.json({ status: "processing" });
  }
  if (capsule.status !== "paid" && capsule.status !== "failed") {
    return NextResponse.json({ error: `Statut invalide: ${capsule.status}` }, { status: 409 });
  }

  await markCapsuleProcessing(capsuleId);
  console.log("[capsule/process] start", capsuleId, "uploadId=", capsule.uploadId);

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "ekko-"));
  try {
    const bucket = getAdminBucket();

    // 1. Lister les fichiers temp
    const [tempFiles] = await bucket.getFiles({ prefix: `temp/${capsule.uploadId}/` });
    console.log("[capsule/process] fichiers trouvés:", tempFiles.length);
    if (tempFiles.length === 0) {
      throw new Error(`Aucun fichier temp pour uploadId=${capsule.uploadId}`);
    }

    // 2. Trier + télécharger
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

    // 3. Fusionner (ou simple copie si un seul fichier)
    const outputPath = path.join(tmpDir, "output.mp4");
    if (orderedPaths.length === 1) {
      await fs.copyFile(orderedPaths[0], outputPath);
    } else {
      await mergeWithFfmpeg(orderedPaths, outputPath, tmpDir);
    }

    const mergedBuf = await fs.readFile(outputPath);
    console.log("[capsule/process] fusion OK, taille:", mergedBuf.byteLength);

    // 4. Upload final
    const echoId = crypto.randomUUID();
    const expires = expiresAt(capsule.storageOption);
    const destPath = `echos/${capsule.uid}/${echoId}/audio.mp4`;
    const destFile = bucket.file(destPath);
    await destFile.save(mergedBuf, {
      metadata: {
        contentType: "video/mp4",
        metadata: {
          theme: capsule.theme,
          accentColor: capsule.accentColor,
          storageOption: String(capsule.storageOption),
          expiresAt: expires.toISOString(),
          uploadId: capsule.uploadId,
          uid: capsule.uid,
          capsuleId,
        },
      },
    });
    await destFile.makePublic();
    const audioUrl = `https://storage.googleapis.com/${bucket.name}/${destPath}`;

    // 5. Supprimer les temp
    await Promise.all(tempFiles.map((f) => f.delete().catch(() => {})));

    // 6. Marquer capsule ready
    await markCapsuleReady(capsuleId, {
      echoId,
      audioUrl,
      expiresAt: expires.toISOString(),
    });
    console.log("[capsule/process] ready", capsuleId);

    return NextResponse.json({ status: "ready", echoId, audioUrl });
  } catch (err) {
    const msg = (err as Error)?.message ?? String(err);
    console.error("[capsule/process] ERREUR:", msg, (err as Error)?.stack);
    await markCapsuleFailed(capsuleId, msg).catch(() => {});
    return NextResponse.json({ status: "failed", error: msg }, { status: 500 });
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}
