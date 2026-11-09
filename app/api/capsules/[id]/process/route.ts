import { NextRequest, NextResponse } from "next/server";
import { promises as fs, existsSync } from "fs";
import { spawn } from "child_process";
import os from "os";
import path from "path";
import { getAdminBucket } from "../../../../lib/firebaseAdmin";
import {
  getCapsule,
  getExpirationDate,
  markCapsuleProcessing,
  markCapsuleReady,
  markCapsuleFailed,
  updateCapsule,
  CapsuleBookmark,
} from "../../../../lib/capsules";
import { sendKeychainOrderEmails } from "../../../../lib/order-emails";

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

function spawnFfmpeg(bin: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
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

const MAX_VOCAPSULE_DURATION_SEC = 3600;
const PCM_SAMPLE_RATE = 48000;
const PCM_BYTES_PER_SEC = PCM_SAMPLE_RATE * 2; // 16-bit mono = 96 000 octets/s

async function decodeToWavAndMeasure(inputPaths: string[], tmpDir: string): Promise<{ wavPaths: string[]; durationsSec: number[] }> {
  const bin = resolveFfmpegPath();
  const wavPaths: string[] = [];
  const durationsSec: number[] = [];

  for (let i = 0; i < inputPaths.length; i++) {
    const wavPath = path.join(tmpDir, `pre_${i}.wav`);
    await spawnFfmpeg(bin, [
      "-y", "-err_detect", "ignore_err",
      "-i", inputPaths[i],
      "-ar", String(PCM_SAMPLE_RATE), "-ac", "1",
      wavPath,
    ]);
    const st = await fs.stat(wavPath);
    const pcmBytes = Math.max(0, st.size - 44);
    const durSec = pcmBytes / PCM_BYTES_PER_SEC;
    wavPaths.push(wavPath);
    durationsSec.push(durSec);
  }
  return { wavPaths, durationsSec };
}

async function mergeWavFilesWithFfmpeg(wavPaths: string[], outputPath: string, tmpDir: string): Promise<void> {
  const bin = resolveFfmpegPath();
  const isOgg = outputPath.endsWith(".ogg") || outputPath.endsWith(".opus");

  const listPath = path.join(tmpDir, "list.txt");
  const listContent = wavPaths.map((p) => `file '${p.replace(/\\/g, "/")}'`).join("\n");
  await fs.writeFile(listPath, listContent, "utf8");

  const codecArgs = isOgg
    ? ["-c:a", "libopus", "-b:a", "64k"]
    : ["-c:a", "aac", "-b:a", "128k"];
  await spawnFfmpeg(bin, ["-y", "-f", "concat", "-safe", "0", "-i", listPath, ...codecArgs, outputPath]);
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
    const hasExplicitManifestOrder = Boolean(
      capsule.manifest && Array.isArray(capsule.manifest.selectedAudios) && capsule.manifest.selectedAudios.length > 0
    );

    if (hasExplicitManifestOrder) {
      // Les fichiers ont été uploadés sous 0000_nom, 0001_nom dans l'ordre exact choisi par l'utilisateur
      tempFiles.sort((a, b) => {
        const na = a.name.split("/").pop() ?? "";
        const nb = b.name.split("/").pop() ?? "";
        return na.localeCompare(nb);
      });
    } else {
      tempFiles.sort((a, b) => {
        const ka = extractSortKey(a);
        const kb = extractSortKey(b);
        if (ka !== kb) return ka - kb;
        return a.name.localeCompare(b.name);
      });
    }

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
        const fExt = f.name.split(".").pop() ?? ext;
        const p = path.join(tmpDir, `input_${i}.${fExt}`);
        await fs.writeFile(p, buf);
        orderedPaths[i] = p;
      })
    );

    // 3. Décoder en WAV PCM 48kHz, mesurer la durée exacte de chaque segment et vérifier le plafond de 3600s
    const { wavPaths, durationsSec } = await decodeToWavAndMeasure(orderedPaths, tmpDir);
    const totalRealDurationSec = durationsSec.reduce((acc, d) => acc + d, 0);
    console.log("[capsule/process] durée totale mesurée:", totalRealDurationSec.toFixed(2), "s");

    if (totalRealDurationSec > MAX_VOCAPSULE_DURATION_SEC + 2) {
      throw new Error(
        `La sélection dépasse la limite maximale d'une heure (${Math.round(totalRealDurationSec)}s > 3600s).`
      );
    }

    // Calculer la position de départ exacte de chaque audio dans la piste fusionnée
    const segmentStartsSec: number[] = [];
    let runningStart = 0;
    for (const d of durationsSec) {
      segmentStartsSec.push(runningStart);
      runningStart += d;
    }

    // Calculer les positions définitives des marque-pages s'il y en a dans le manifeste
    const computedBookmarks: CapsuleBookmark[] = [];
    if (capsule.manifest?.bookmarks && capsule.manifest.bookmarks.length > 0) {
      const manifestAudios = capsule.manifest.selectedAudios ?? [];
      for (const bm of capsule.manifest.bookmarks) {
        const audioPos = manifestAudios.findIndex((a) => a.audioId === bm.audioId);
        if (audioPos >= 0 && audioPos < segmentStartsSec.length) {
          const segStart = segmentStartsSec[audioPos];
          const segDur = durationsSec[audioPos];
          const clampedOffset = Math.min(Math.max(0, Number(bm.offsetInAudioSec) || 0), Math.max(0, segDur - 0.1));
          const finalTimeSec = Number((segStart + clampedOffset).toFixed(2));
          computedBookmarks.push({
            id: bm.id,
            title: bm.title.slice(0, 80),
            timeSec: finalTimeSec,
            audioId: bm.audioId,
            offsetInAudioSec: Number(clampedOffset.toFixed(2)),
            displayOrder: 0,
          });
        }
      }
      computedBookmarks.sort((a, b) => a.timeSec - b.timeSec);
      computedBookmarks.forEach((b, idx) => { b.displayOrder = idx + 1; });
    }

    // Fusionner vers le fichier de sortie
    const outputPath = path.join(tmpDir, `output.${ext}`);
    if (orderedPaths.length === 1) {
      await fs.copyFile(orderedPaths[0], outputPath);
    } else {
      await mergeWavFilesWithFfmpeg(wavPaths, outputPath, tmpDir);
    }

    const mergedBuf = await fs.readFile(outputPath);
    console.log("[capsule/process] fusion OK, taille:", mergedBuf.byteLength, "ext:", ext, "bookmarks:", computedBookmarks.length);

    // 4. Upload final
    const echoId = crypto.randomUUID();
    const createdAt = new Date();
    const expires = getExpirationDate(capsule.productType, capsule.storageOption, createdAt);
    const destPath = `echos/${capsule.uid}/${echoId}/audio.${ext}`;
    const destFile = bucket.file(destPath);
    await destFile.save(mergedBuf, {
      metadata: {
        contentType,
        metadata: {
          theme: capsule.theme,
          accentColor: capsule.accentColor,
          storageOption: String(capsule.storageOption),
          productType: capsule.productType ?? "numerique",
          smartSearchEnabled: String(capsule.smartSearchEnabled === true),
          createdAt: createdAt.toISOString(),
          expiresAt: expires.toISOString(),
          uploadId: capsule.uploadId,
          uid: capsule.uid,
          capsuleId,
        },
      },
    });
    await destFile.makePublic();
    const audioUrl = `https://storage.googleapis.com/${bucket.name}/${destPath}`;

    // Sauvegarder les marque-pages dans le dossier de l'écho sur Firebase Storage
    if (computedBookmarks.length > 0) {
      const bmPath = `echos/${capsule.uid}/${echoId}/bookmarks.json`;
      const bmFile = bucket.file(bmPath);
      await bmFile.save(JSON.stringify({ bookmarks: computedBookmarks }), {
        metadata: { contentType: "application/json" },
      });
    }

    // 5. Supprimer les temp
    await Promise.all(tempFiles.map((f) => f.delete().catch(() => {})));

    // 6. Marquer capsule ready
    await markCapsuleReady(capsuleId, {
      echoId,
      audioUrl,
      expiresAt: expires.toISOString(),
      ...(computedBookmarks.length > 0 ? { bookmarks: computedBookmarks } : {}),
    });

    // 7. Si porte-clé payé par anticipation (advancePayment), déclencher maintenant l'email de fabrication LightBurn
    if (
      capsule.productType === "porteClef" &&
      capsule.advancePayment &&
      capsule.shippingStatus !== "to_engrave" &&
      capsule.shippingStatus !== "shipped"
    ) {
      await updateCapsule(capsuleId, { shippingStatus: "to_engrave" }).catch(() => {});
      const origin = _req.headers.get("origin") ?? process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
      const qrUrl = `${origin}/capsule/${capsuleId}`;
      const baseAmount = capsule.nfcEnabled ? 2790 : 2490;
      const totalAmount = baseAmount + (capsule.smartSearchEnabled ? 300 : 0);
      await sendKeychainOrderEmails({
        capsuleId,
        engraveName: capsule.engraveName ?? "",
        format: capsule.format ?? "etiquette-rect",
        qrUrl,
        shippingName: capsule.shippingName ?? "",
        shippingAddress: capsule.shippingAddress ?? "",
        customerPhone: capsule.customerPhone ?? "",
        customerEmail: capsule.customerEmail ?? "",
        amount: totalAmount,
        engravingFont: capsule.engravingFont ?? "Georgia, serif",
        nfcEnabled: capsule.nfcEnabled ?? false,
      }).catch((e) => console.error("[capsule/process] sendKeychainOrderEmails error:", e));
    }

    console.log("[capsule/process] ready", capsuleId);

    return NextResponse.json({ status: "ready", echoId, audioUrl, bookmarks: computedBookmarks });
  } catch (err) {
    const msg = (err as Error)?.message ?? String(err);
    console.error("[capsule/process] ERREUR:", msg, (err as Error)?.stack);
    await markCapsuleFailed(capsuleId, msg).catch(() => {});
    return NextResponse.json({ status: "failed", error: msg }, { status: 500 });
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}
