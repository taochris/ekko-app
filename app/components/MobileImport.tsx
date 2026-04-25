"use client";
/**
 * MobileImport.tsx
 * Import audio dédié mobile — totalement isolé du code PC.
 *
 * Résout les bugs mobiles :
 * - Android : input file natif direct (contourne les problèmes de dropzone)
 * - iOS     : ArrayBuffer stocké en mémoire, blob URL créée à la volée à chaque lecture
 *             pour contourner l'expiration des blob URLs sur WebKit
 */
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import JSZip from "jszip";

interface MobileImportProps {
  config: { accent: string; accentDim: string };
  onAudiosImported: (files: File[]) => void;
  onClose: () => void;
}

const AUDIO_EXTENSIONS = /\.(mp3|wav|ogg|oga|m4a|aac|opus|flac|weba|3gp|amr|mp4)$/i;
const VIDEO_EXCLUDE = /^VID-|^video-|\.mov$|\.avi$|\.mkv$/i;
const EXCLUDE_PATHS = /(__MACOSX|\.DS_Store|Thumbs\.db)/i;
const AUDIO_MIME: Record<string, string> = {
  mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg", oga: "audio/ogg",
  m4a: "audio/mp4", mp4: "audio/mp4", aac: "audio/aac", opus: "audio/opus",
  flac: "audio/flac", weba: "audio/webm", "3gp": "audio/3gpp", amr: "audio/amr",
};

interface AudioEntry {
  name: string;
  buffer: ArrayBuffer;  // stocké en mémoire pour iOS (blob URL ne expire pas)
  mime: string;
  size: number;
}

async function extractFromZipMobile(zipFile: File): Promise<AudioEntry[]> {
  const zip = new JSZip();
  const contents = await zip.loadAsync(zipFile);
  const entries: AudioEntry[] = [];

  for (const entry of Object.values(contents.files)) {
    if (entry.dir || EXCLUDE_PATHS.test(entry.name) || !AUDIO_EXTENSIONS.test(entry.name)) continue;
    const filename = entry.name.split("/").pop() ?? entry.name;
    if (VIDEO_EXCLUDE.test(filename)) continue;
    const buffer = await entry.async("arraybuffer");
    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    const mime = AUDIO_MIME[ext] ?? "audio/octet-stream";
    entries.push({ name: filename, buffer, mime, size: buffer.byteLength });
  }
  return entries;
}

function makeFile(entry: AudioEntry): File {
  return new File([entry.buffer], entry.name, { type: entry.mime });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

export default function MobileImport({ config, onAudiosImported, onClose }: MobileImportProps) {
  const [step, setStep] = useState<"pick" | "processing" | "preview">("pick");
  const [entries, setEntries] = useState<AudioEntry[]>([]);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [unplayableFormat, setUnplayableFormat] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentBlobUrl = useRef<string | null>(null);

  const log = (msg: string) => {
    console.log("[MobileImport]", msg);
    setDebugLog((prev) => [...prev.slice(-15), msg]);
  };

  const processFiles = useCallback(async (files: FileList | File[]) => {
    setError(null);
    setUnplayableFormat(null);
    setStep("processing");
    setProgress(0);
    setDebugLog([]);

    const fileArray = Array.from(files);
    log(`${fileArray.length} fichier(s) sélectionné(s)`);
    const allEntries: AudioEntry[] = [];

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const fileName = file.name || `file-${i}`;
        const fileType = file.type || "(type vide)";
        log(`[${i + 1}/${fileArray.length}] ${fileName} · ${fileType} · ${formatSize(file.size)}`);
        setProgress(Math.round((i / fileArray.length) * 80));

        try {
          const isZip = fileName.toLowerCase().endsWith(".zip") ||
                        fileType.includes("zip") ||
                        fileType === "application/octet-stream" ||
                        fileType === "" ||
                        fileType === "application/x-zip" ||
                        fileType === "application/x-zip-compressed";

          // Forcer en ZIP si nom .zip OU si extension audio absente ET fichier > 100Ko
          const looksLikeAudio = AUDIO_EXTENSIONS.test(fileName) || fileType.startsWith("audio/");

          if (isZip && !looksLikeAudio) {
            log(`  → ZIP détecté, extraction…`);
            const zipEntries = await extractFromZipMobile(file);
            log(`  → ${zipEntries.length} audio(s) extrait(s)`);
            allEntries.push(...zipEntries);
          } else if (looksLikeAudio) {
            if (VIDEO_EXCLUDE.test(fileName)) {
              log(`  → Vidéo exclue`);
              continue;
            }
            log(`  → Audio direct, lecture…`);
            const buffer = await file.arrayBuffer();
            const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
            const mime = fileType.startsWith("audio/") ? fileType : (AUDIO_MIME[ext] ?? "audio/octet-stream");
            allEntries.push({ name: fileName, buffer, mime, size: buffer.byteLength });
            log(`  → OK (${formatSize(buffer.byteLength)})`);
          } else {
            log(`  → Type inconnu, tentative ZIP…`);
            try {
              const zipEntries = await extractFromZipMobile(file);
              log(`  → ${zipEntries.length} audio(s) extrait(s)`);
              allEntries.push(...zipEntries);
            } catch {
              log(`  → Pas un ZIP valide, ignoré`);
            }
          }
        } catch (fileErr) {
          log(`  → ERREUR : ${fileErr instanceof Error ? fileErr.message : "inconnue"}`);
        }
      }

      setProgress(100);
      log(`Total : ${allEntries.length} audio(s)`);

      if (allEntries.length === 0) {
        setError("Aucun fichier audio trouvé. Voir détails ci-dessous.");
        setStep("pick");
        return;
      }

      setEntries(allEntries);
      setStep("preview");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "erreur inconnue";
      log(`ERREUR FATALE : ${msg}`);
      setError(`Erreur : ${msg}`);
      setStep("pick");
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    } else {
      log("Aucun fichier dans l'input (annulé ?)");
    }
    e.target.value = "";
  };

  const playEntry = (index: number) => {
    setUnplayableFormat(null);

    if (currentBlobUrl.current) {
      URL.revokeObjectURL(currentBlobUrl.current);
      currentBlobUrl.current = null;
    }

    if (playingIndex === index) {
      audioRef.current?.pause();
      setPlayingIndex(null);
      return;
    }

    const entry = entries[index];
    const ext = entry.name.split(".").pop()?.toLowerCase() ?? "";
    const isIOS = typeof navigator !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent);

    // iOS Safari ne peut PAS lire OGG/Opus nativement
    if (isIOS && (ext === "ogg" || ext === "oga" || ext === "opus" || entry.mime.includes("ogg") || entry.mime.includes("opus"))) {
      setUnplayableFormat(`Format ${ext.toUpperCase()} non lisible sur iOS — le fichier sera quand même envoyé pour traitement.`);
      return;
    }

    const blob = new Blob([entry.buffer], { type: entry.mime });
    const url = URL.createObjectURL(blob);
    currentBlobUrl.current = url;

    if (!audioRef.current) audioRef.current = new Audio();
    audioRef.current.src = url;
    audioRef.current.onended = () => setPlayingIndex(null);
    audioRef.current.onerror = () => {
      setPlayingIndex(null);
      setUnplayableFormat(`Format non lisible par votre navigateur — le fichier reste valide pour le traitement.`);
    };
    audioRef.current.play().catch(() => {
      setPlayingIndex(null);
      setUnplayableFormat(`Lecture impossible — le fichier reste valide pour le traitement.`);
    });
    setPlayingIndex(index);
  };

  const handleConfirm = () => {
    // Nettoyer l'audio en cours
    audioRef.current?.pause();
    if (currentBlobUrl.current) {
      URL.revokeObjectURL(currentBlobUrl.current);
      currentBlobUrl.current = null;
    }
    // Convertir tous les AudioEntry en File pour l'interface EKKO
    const files = entries.map(makeFile);
    onAudiosImported(files);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      style={{ padding: "0 4px" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onClose}
          style={{
            background: "none", border: "none", color: "rgba(240,232,216,0.5)",
            fontFamily: "Georgia, serif", fontSize: 13, cursor: "pointer", padding: "4px 0",
          }}
        >
          ← Retour
        </button>
        <p style={{
          fontFamily: "Georgia, serif", fontSize: 11, letterSpacing: "0.3em",
          textTransform: "uppercase", color: `${config.accent}80`,
        }}>
          Import mobile
        </p>
        <div style={{ width: 60 }} />
      </div>

      {/* Étape : sélection */}
      {step === "pick" && (
        <div className="text-center">
          <div style={{ fontSize: 40, marginBottom: 16 }}>📂</div>
          <h3 style={{ fontFamily: "Georgia, serif", fontSize: 20, color: "#f0e8d8", marginBottom: 12, fontWeight: 400 }}>
            Sélectionner vos fichiers
          </h3>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "rgba(240,232,216,0.6)", lineHeight: 1.6, marginBottom: 24 }}>
            Sélectionnez votre fichier ZIP d&apos;export (WhatsApp, Messenger, Instagram)
            ou vos fichiers audio directement.
          </p>

          {error && (
            <div style={{
              background: "rgba(220,50,50,0.1)", border: "1px solid rgba(220,50,50,0.3)",
              borderRadius: 12, padding: "12px 16px", marginBottom: 20,
            }}>
              <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "rgba(255,120,120,0.9)" }}>
                {error}
              </p>
            </div>
          )}

          {/* Input natif — pas d'accept restrictif, certains gestionnaires Android filtrent les ZIP */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: "none" }}
            onChange={handleInputChange}
          />

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: "100%", padding: "18px 0", borderRadius: 16,
              background: `linear-gradient(135deg, ${config.accent}30, ${config.accent}55)`,
              border: `1px solid ${config.accent}50`,
              color: "#f0e8d8", fontFamily: "Georgia, serif", fontSize: 15,
              cursor: "pointer", letterSpacing: "0.05em",
            }}
          >
            Choisir mes fichiers
          </motion.button>

          <p style={{
            fontFamily: "Georgia, serif", fontSize: 11, color: "rgba(240,232,216,0.35)",
            marginTop: 12, fontStyle: "italic",
          }}>
            Formats acceptés : ZIP WhatsApp / Messenger / Instagram · OGG · MP3 · M4A · OPUS
          </p>

          {/* Panneau debug — visible quand il y a des logs (utile pour diagnostiquer Android) */}
          {debugLog.length > 0 && (
            <div style={{
              marginTop: 24, padding: "12px 14px", borderRadius: 12,
              background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)",
              textAlign: "left",
            }}>
              <p style={{
                fontFamily: "Georgia, serif", fontSize: 10, letterSpacing: "0.2em",
                textTransform: "uppercase", color: "rgba(240,232,216,0.4)", marginBottom: 8,
              }}>
                Détails techniques
              </p>
              <div style={{
                fontFamily: "ui-monospace, Menlo, monospace", fontSize: 10,
                color: "rgba(240,232,216,0.55)", lineHeight: 1.5,
                maxHeight: 200, overflowY: "auto",
              }}>
                {debugLog.map((l, idx) => (
                  <div key={idx} style={{ wordBreak: "break-all" }}>{l}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Étape : traitement */}
      {step === "processing" && (
        <div className="text-center" style={{ paddingTop: 40 }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            style={{
              width: 48, height: 48, borderRadius: "50%", margin: "0 auto 20px",
              border: `2px solid ${config.accent}30`,
              borderTop: `2px solid ${config.accent}`,
            }}
          />
          <p style={{ fontFamily: "Georgia, serif", fontSize: 15, color: "#f0e8d8", marginBottom: 8 }}>
            Extraction en cours…
          </p>
          <div style={{
            width: "100%", height: 4, borderRadius: 2,
            background: "rgba(255,255,255,0.08)", marginTop: 16,
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
              style={{ height: "100%", borderRadius: 2, background: config.accent }}
            />
          </div>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "rgba(240,232,216,0.4)", marginTop: 8 }}>
            {progress}%
          </p>
        </div>
      )}

      {/* Étape : prévisualisation */}
      {step === "preview" && (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "rgba(240,232,216,0.7)" }}>
                <span style={{ color: config.accent, fontWeight: 600 }}>{entries.length}</span> fichier{entries.length > 1 ? "s" : ""} trouvé{entries.length > 1 ? "s" : ""}
              </p>
              <button
                onClick={() => { setStep("pick"); setEntries([]); setPlayingIndex(null); }}
                style={{
                  background: "none", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8, padding: "6px 12px",
                  color: "rgba(240,232,216,0.5)", fontFamily: "Georgia, serif",
                  fontSize: 12, cursor: "pointer",
                }}
              >
                Changer
              </button>
            </div>

            {/* Message format non lisible (iOS OGG par exemple) */}
            {unplayableFormat && (
              <div style={{
                background: `${config.accent}10`, border: `1px solid ${config.accent}30`,
                borderRadius: 12, padding: "10px 14px", marginBottom: 14,
              }}>
                <p style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "rgba(240,232,216,0.75)", lineHeight: 1.5, margin: 0 }}>
                  {unplayableFormat}
                </p>
              </div>
            )}

            {/* Liste des fichiers */}
            <div style={{
              maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8,
              marginBottom: 20,
            }}>
              {entries.map((entry, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.4) }}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 14px", borderRadius: 12,
                    background: playingIndex === i
                      ? `${config.accent}15`
                      : "rgba(255,255,255,0.03)",
                    border: `1px solid ${playingIndex === i ? config.accent + "40" : "rgba(255,255,255,0.06)"}`,
                  }}
                >
                  {/* Bouton play */}
                  <button
                    onClick={() => playEntry(i)}
                    style={{
                      width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                      background: playingIndex === i ? config.accent : "rgba(255,255,255,0.08)",
                      border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: playingIndex === i ? "#000" : "rgba(240,232,216,0.7)",
                      fontSize: 12,
                    }}
                  >
                    {playingIndex === i ? "⏸" : "▶"}
                  </button>

                  {/* Nom + taille */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontFamily: "Georgia, serif", fontSize: 13, color: "#f0e8d8",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      margin: 0,
                    }}>
                      {entry.name.replace(/\.(mp3|wav|ogg|oga|m4a|aac|opus|flac|weba|3gp|amr|mp4)$/i, "")}
                    </p>
                    <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: "rgba(240,232,216,0.35)", margin: 0 }}>
                      {entry.name.split(".").pop()?.toUpperCase()} · {formatSize(entry.size)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bouton confirmer */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleConfirm}
              style={{
                width: "100%", padding: "18px 0", borderRadius: 16,
                background: `linear-gradient(135deg, ${config.accent}40, ${config.accent}70)`,
                border: `1px solid ${config.accent}40`,
                color: "#f0e8d8", fontFamily: "Georgia, serif", fontSize: 15,
                fontWeight: 500, cursor: "pointer", letterSpacing: "0.05em",
              }}
            >
              Utiliser ces {entries.length} fichier{entries.length > 1 ? "s" : ""} →
            </motion.button>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}
