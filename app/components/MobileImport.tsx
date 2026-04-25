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

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentBlobUrl = useRef<string | null>(null);

  const processFiles = useCallback(async (files: FileList | File[]) => {
    setError(null);
    setStep("processing");
    setProgress(0);

    const fileArray = Array.from(files);
    const allEntries: AudioEntry[] = [];

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setProgress(Math.round((i / fileArray.length) * 80));

        if (file.name.toLowerCase().endsWith(".zip") || file.type.includes("zip") || file.type === "application/octet-stream") {
          const zipEntries = await extractFromZipMobile(file);
          allEntries.push(...zipEntries);
        } else if (AUDIO_EXTENSIONS.test(file.name) || file.type.startsWith("audio/")) {
          if (!VIDEO_EXCLUDE.test(file.name)) {
            const buffer = await file.arrayBuffer();
            const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
            const mime = file.type.startsWith("audio/") ? file.type : (AUDIO_MIME[ext] ?? "audio/octet-stream");
            allEntries.push({ name: file.name, buffer, mime, size: buffer.byteLength });
          }
        }
      }

      setProgress(100);

      if (allEntries.length === 0) {
        setError("Aucun fichier audio trouvé. Vérifiez que votre export contient bien des messages vocaux.");
        setStep("pick");
        return;
      }

      setEntries(allEntries);
      setStep("preview");
    } catch (e) {
      setError(`Erreur lors du traitement : ${e instanceof Error ? e.message : "erreur inconnue"}`);
      setStep("pick");
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    // Reset pour permettre re-sélection du même fichier
    e.target.value = "";
  };

  const playEntry = (index: number) => {
    // Nettoyer l'ancienne URL blob (iOS : on recrée à chaque lecture)
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
    // Créer une NOUVELLE blob URL à chaque lecture (contourne l'expiration iOS)
    const blob = new Blob([entry.buffer], { type: entry.mime });
    const url = URL.createObjectURL(blob);
    currentBlobUrl.current = url;

    if (!audioRef.current) audioRef.current = new Audio();
    audioRef.current.src = url;
    audioRef.current.onended = () => setPlayingIndex(null);
    audioRef.current.onerror = () => {
      setPlayingIndex(null);
    };
    audioRef.current.play().catch(() => setPlayingIndex(null));
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

          {/* Input natif — essentiel pour Android */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".zip,.mp3,.wav,.ogg,.oga,.m4a,.aac,.opus,.flac,.3gp,.amr,audio/*"
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
