import { NextRequest, NextResponse } from "next/server";
import { promises as fs, existsSync } from "fs";
import { spawn } from "child_process";
import os from "os";
import path from "path";
import { getAdminBucket } from "../../../../lib/firebaseAdmin";
import {
  getCapsule,
  markCapsuleProcessing,
  markCapsuleReady,
  markCapsuleFailed,
} from "../../../../lib/capsules";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg") as { path: string; version: string; url: string };

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
  const installerPath = ffmpegInstaller?.path as string | undefined;
  if (installerPath && existsSync(installerPath)) {
    console.log("[ffmpeg] @ffmpeg-installer OK:", installerPath);
    return installerPath;
  }
  if (installerPath) {
    console.warn("[ffmpeg] @ffmpeg-installer pointe sur un fichier inexistant:", installerPath);
  } else {
    console.warn("[ffmpeg] @ffmpeg-installer.path indisponible");
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

    // Pour les OGG/opus, -c copy peut échouer si les headers diffèrent (Telegram vs WhatsApp)
    // On re-encode en libopus pour garantir la compatibilité
    const isOgg = outputPath.endsWith(".ogg") || outputPath.endsWith(".opus");
    const codecArgs = isOgg
      ? ["-c:a", "libopus", "-b:a", "64k"]
      : ["-c", "copy", "-strict", "-2"];
    const args = ["-y", "-f", "concat", "-safe", "0", "-i", listPath, ...codecArgs, outputPath];
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
    // Stratégie de tri : extraire date depuis métadonnées timeCreated, puis nom de fichier
    // Supporte : PTT-YYYYMMDD-WA0001.ogg (WhatsApp), audio_YYYY-MM-DD (Telegram), timestamps, noms séquentiels
    // Extraction de date selon la source détectée par pattern spécifique.
    // On privilégie TOUJOURS les dates dans le nom (date réelle du message) par rapport à
    // timeCreated (= date d'upload Firebase, identique pour tous les fichiers d'une session).
    function extractSortKey(f: { name: string; metadata?: { timeCreated?: string; updated?: string; [key: string]: unknown } }): number {
      const fname = f.name.split("/").pop() ?? "";

      // 1. Telegram : audio_N@DD-MM-YYYY_HH-MM-SS.ogg (présence du @ = signature unique)
      const mTg = fname.match(/@(\d{2})-(\d{2})-(\d{4})_(\d{2})-(\d{2})-(\d{2})/);
      if (mTg) {
        const [, dd, mm, yyyy, hh, min, ss] = mTg;
        const t = new Date(`${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`).getTime();
        if (!isNaN(t)) return t;
      }

      // 2. WhatsApp : PTT-YYYYMMDD-WA0001.opus ou AUD-YYYYMMDD-WA0001.m4a
      const mWa = fname.match(/(?:PTT|AUD)[_\-](\d{4})(\d{2})(\d{2})[_\-]WA(\d+)/i);
      if (mWa) {
        const [, yyyy, mm, dd, seq] = mWa;
        const t = new Date(`${yyyy}-${mm}-${dd}`).getTime();
        if (!isNaN(t)) return t + parseInt(seq); // ajoute seq pour ordre intra-journée
      }

      // 3. Format ISO générique YYYY-MM-DD (avec séparateurs - ou _)
      const mIso = fname.match(/(20\d{2})[_\-](\d{2})[_\-](\d{2})(?:[_\-T ](\d{2})[_\-:](\d{2})(?:[_\-:](\d{2}))?)?/);
      if (mIso) {
        const [, yyyy, mm, dd, hh, min, ss] = mIso;
        const iso = `${yyyy}-${mm}-${dd}T${hh ?? "00"}:${min ?? "00"}:${ss ?? "00"}`;
        const t = new Date(iso).getTime();
        if (!isNaN(t)) return t;
      }

      // 4. Timestamp unix (Messenger/Instagram exportent parfois en timestamp)
      const mTs = fname.match(/(?:^|[_\-])(\d{10,13})(?:[_\-.]|$)/);
      if (mTs) {
        const n = parseInt(mTs[1]);
        return n > 9999999999 ? n : n * 1000;
      }

      // 5. Fallback : timeCreated Firebase (date d'upload, moins précis mais ordonné)
      const tc = f.metadata?.timeCreated as string | undefined;
      if (tc) {
        const t = new Date(tc).getTime();
        if (!isNaN(t)) return t;
      }

      // 6. Dernier recours : tri lexicographique via la clé 0 (les noms départageront)
      return 0;
    }
    tempFiles.sort((a, b) => {
      const ka = extractSortKey(a);
      const kb = extractSortKey(b);
      if (ka !== kb) return ka - kb;
      return a.name.localeCompare(b.name);
    });
    const ext = tempFiles[0].name.split(".").pop() ?? "opus";
    const mimeByExt: Record<string, string> = {
      opus: "audio/ogg; codecs=opus",
      ogg: "audio/ogg",
      mp3: "audio/mpeg",
      m4a: "audio/mp4",
      wav: "audio/wav",
      webm: "audio/webm",
    };
    const contentType = mimeByExt[ext] ?? "audio/ogg; codecs=opus";
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
    const outputPath = path.join(tmpDir, `output.${ext}`);
    if (orderedPaths.length === 1) {
      await fs.copyFile(orderedPaths[0], outputPath);
    } else {
      await mergeWithFfmpeg(orderedPaths, outputPath, tmpDir);
    }

    const mergedBuf = await fs.readFile(outputPath);
    console.log("[capsule/process] fusion OK, taille:", mergedBuf.byteLength, "ext:", ext);

    // 4. Upload final
    const echoId = crypto.randomUUID();
    const expires = expiresAt(capsule.storageOption);
    const destPath = `echos/${capsule.uid}/${echoId}/audio.${ext}`;
    const destFile = bucket.file(destPath);
    await destFile.save(mergedBuf, {
      metadata: {
        contentType,
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
