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

// Données plateformes — copiées et isolées du code PC (règle de séparation stricte)
const MOBILE_PLATFORMS = [
  {
    id: "whatsapp", name: "WhatsApp", color: "#25d366",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>,
    steps: {
      android: [
        { label: "Ouvrir la conversation", desc: "Allez dans la conversation WhatsApp souhaitée" },
        { label: "Appuyer sur les 3 points", desc: "En haut à droite → ‘Plus’ → ‘Exporter la discussion’" },
        { label: "Choisir avec médias", desc: "Sélectionnez ‘Joindre les médias’. Si la conversation est très longue, l’export peut être incomplet." },
        { label: "Importer le ZIP ici", desc: "Déposez le fichier ZIP reçu dans ce formulaire." },
      ],
      iphone: [
        { label: "Ouvrir la conversation", desc: "Allez dans la conversation WhatsApp souhaitée" },
        { label: "Appuyer sur le nom du contact", desc: "En haut de la conversation, appuyez sur le nom" },
        { label: "Défiler jusqu’à ‘Exporter la discussion’", desc: "Faites défiler vers le bas dans les informations" },
        { label: "Choisir ‘Avec média’", desc: "Sélectionnez ‘Avec média’ pour inclure les messages vocaux" },
        { label: "Importer le ZIP ici", desc: "Appuyez sur ‘Enregistrer dans Fichiers’ puis importez directement depuis ce formulaire." },
      ],
    },
  },
  {
    id: "instagram", name: "Instagram", color: "#e1306c",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
    steps: {
      android: [
        { label: "Profil → ☰ → Paramètres → Comptes", desc: "Appuyez sur ‘Vos informations et autorisations’ puis ‘Exporter vos informations’" },
        { label: "Créer une exportation", desc: "Destination : votre appareil ou Google Drive" },
        { label: "Cocher Messages uniquement", desc: "Décochez tout, cochez uniquement ‘Messages’. Choisissez la période." },
        { label: "Format JSON · Qualité élevée", desc: "Format JSON obligatoire (pas HTML). Lancez l’exportation puis importez le ZIP ici." },
      ],
      iphone: [
        { label: "Profil → ☰ → Paramètres → Comptes", desc: "Appuyez sur ‘Vos informations et autorisations’ puis ‘Exporter vos informations’" },
        { label: "Créer une exportation", desc: "Destination : iCloud, Google Drive ou Dropbox" },
        { label: "Cocher Messages uniquement", desc: "Décochez tout, cochez uniquement ‘Messages’. Choisissez la période." },
        { label: "Format JSON · Qualité élevée", desc: "Format JSON obligatoire (pas HTML). Lancez l’exportation puis importez le ZIP ici." },
      ],
    },
  },
  {
    id: "messenger", name: "Messenger", color: "#0084ff",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}><path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.26L19.752 8l-6.561 6.963z"/></svg>,
    steps: {
      android: [
        { label: "Facebook → ☰ → Paramètres", desc: "Menu ☰ → ‘Paramètres et confidentialité’ → ‘Paramètres’" },
        { label: "Espace compte → Exporter", desc: "‘Vos informations et autorisations’ → ‘Exporter vos informations’ → ‘Créer une exportation’" },
        { label: "Messages uniquement · JSON · Supérieure", desc: "Personnaliser → décochez TOUT, cochez ‘Messages’ → Format JSON → Qualité supérieure." },
        { label: "Importer le ZIP ici", desc: "Conversations chiffrées E2E : audios absents, utiliser Messenger Desktop sur PC." },
      ],
      iphone: [
        { label: "Facebook → photo de profil", desc: "Appuyez sur votre photo en haut à gauche" },
        { label: "Flèche déroulante → Espace compte", desc: "Flèche à côté de votre nom → ‘Espace compte’ en bas" },
        { label: "Vos informations → Exporter", desc: "‘Vos informations et autorisations’ → ‘Exporter vos informations’ → ‘Créer une exportation’" },
        { label: "Messages uniquement · JSON · Supérieure", desc: "Personnaliser → décochez TOUT, cochez ‘Messages’ → Format JSON → Qualité supérieure. Importez le ZIP ici." },
      ],
    },
  },
  {
    id: "telegram", name: "Telegram", color: "#2aabee",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>,
    steps: {
      android: [
        { label: "Telegram Desktop obligatoire", desc: "L’export n’est possible que sur PC/Mac. Téléchargez sur desktop.telegram.org" },
        { label: "Ouvrir la conversation → 3 points", desc: "Cliquez sur les 3 points en haut à droite" },
        { label: "Export chat history", desc: "Cochez ‘Voice messages’ uniquement puis lancez l’export" },
        { label: "Importer le dossier ZIP ici", desc: "Telegram exporte un dossier avec fichiers audio. Importez-le ici." },
      ],
      iphone: [
        { label: "Telegram Desktop obligatoire", desc: "L’export n’est possible que sur PC/Mac. Téléchargez sur desktop.telegram.org" },
        { label: "Ouvrir la conversation → 3 points", desc: "Cliquez sur les 3 points en haut à droite" },
        { label: "Export chat history", desc: "Cochez ‘Voice messages’ uniquement puis lancez l’export" },
        { label: "Importer le dossier ZIP ici", desc: "Telegram exporte un dossier avec fichiers audio. Importez-le ici." },
      ],
    },
  },
];

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

function isOpusFormat(entry: AudioEntry): boolean {
  const ext = entry.name.split(".").pop()?.toLowerCase() ?? "";
  return ext === "ogg" || ext === "oga" || ext === "opus" || entry.mime.includes("ogg") || entry.mime.includes("opus");
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

export default function MobileImport({ config, onAudiosImported, onClose }: MobileImportProps) {
  const [os, setOs] = useState<"android" | "iphone">("android");
  const [activeGuide, setActiveGuide] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [step, setStep] = useState<"pick" | "processing" | "preview">("pick");
  const [entries, setEntries] = useState<AudioEntry[]>([]);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentBlobUrl = useRef<string | null>(null);

  const log = (msg: string) => {
    console.log("[MobileImport]", msg);
    setDebugLog((prev) => [...prev.slice(-15), msg]);
  };

  const processFiles = useCallback(async (files: FileList | File[]) => {
    setError(null);
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

  const stopCurrent = () => {
    // Arrêt lecture HTML audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    if (currentBlobUrl.current) {
      URL.revokeObjectURL(currentBlobUrl.current);
      currentBlobUrl.current = null;
    }
    // Arrêt lecture WebAudio (Opus)
    if (currentSourceRef.current) {
      try { currentSourceRef.current.stop(); } catch {}
      currentSourceRef.current = null;
    }
  };

  const playEntry = async (index: number) => {
    stopCurrent();

    if (playingIndex === index) {
      setPlayingIndex(null);
      return;
    }

    const entry = entries[index];
    setPlayingIndex(index);

    try {
      if (isOpusFormat(entry)) {
        // Décodage Opus pur JS → PCM → AudioContext (fonctionne sur iOS et Android)
        const { OggOpusDecoder } = await import("ogg-opus-decoder");
        const decoder = new OggOpusDecoder();
        await decoder.ready;
        const { channelData, samplesDecoded, sampleRate } = await decoder.decode(new Uint8Array(entry.buffer));
        await decoder.free();

        if (samplesDecoded === 0) throw new Error("0 samples décodés");

        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
          audioCtxRef.current = new AudioCtx();
        }
        // iOS nécessite un resume après interaction utilisateur
        if (audioCtxRef.current.state === "suspended") await audioCtxRef.current.resume();

        const audioBuffer = audioCtxRef.current.createBuffer(channelData.length, samplesDecoded, sampleRate);
        channelData.forEach((ch: Float32Array, i: number) => audioBuffer.copyToChannel(ch as unknown as Float32Array<ArrayBuffer>, i));

        const source = audioCtxRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtxRef.current.destination);
        source.onended = () => setPlayingIndex(null);
        currentSourceRef.current = source;
        source.start();
      } else {
        // Formats natifs (mp3, m4a, aac, wav) → lecture HTML audio directe
        const blob = new Blob([entry.buffer], { type: entry.mime });
        const url = URL.createObjectURL(blob);
        currentBlobUrl.current = url;
        if (!audioRef.current) audioRef.current = new Audio();
        audioRef.current.src = url;
        audioRef.current.onended = () => setPlayingIndex(null);
        audioRef.current.onerror = () => setPlayingIndex(null);
        await audioRef.current.play();
      }
    } catch {
      setPlayingIndex(null);
    }
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

          {/* Sélecteur OS */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
              {(["android", "iphone"] as const).map((o) => (
                <button key={o} onClick={() => { setOs(o); setActiveGuide(null); setExpandedStep(null); }}
                  style={{
                    padding: "7px 18px", border: "none", cursor: "pointer",
                    fontFamily: "Georgia, serif", fontSize: 12,
                    background: os === o ? `${config.accent}22` : "transparent",
                    color: os === o ? config.accent : "rgba(240,232,216,0.4)",
                    borderRight: o === "android" ? "1px solid rgba(255,255,255,0.07)" : "none",
                  }}
                >
                  {o === "android" ? "🧑‍💻 Android" : "📱 iPhone"}
                </button>
              ))}
            </div>
          </div>

          {/* Sélecteur plateformes */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {MOBILE_PLATFORMS.map((p) => (
              <button key={p.id}
                onClick={() => { setActiveGuide(activeGuide === p.id ? null : p.id); setExpandedStep(null); }}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 12px", borderRadius: 12, cursor: "pointer",
                  background: activeGuide === p.id ? `${p.color}18` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${activeGuide === p.id ? p.color + "50" : "rgba(255,255,255,0.07)"}`,
                  color: activeGuide === p.id ? p.color : "rgba(240,232,216,0.5)",
                  fontFamily: "Georgia, serif", fontSize: 12,
                }}
              >
                {p.icon} {p.name}
              </button>
            ))}
          </div>

          {/* Guide accordéon */}
          <AnimatePresence>
            {activeGuide && (() => {
              const p = MOBILE_PLATFORMS.find((x) => x.id === activeGuide)!;
              const steps = p.steps[os];
              return (
                <motion.div
                  key={activeGuide + os}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: "hidden", marginBottom: 16 }}
                >
                  <div style={{ borderRadius: 14, padding: "14px 16px", background: `${p.color}08`, border: `1px solid ${p.color}25` }}>
                    <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: p.color, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>
                      Guide {p.name}
                    </p>
                    {steps.map((s, i) => (
                      <div key={i} style={{ marginBottom: 8 }}>
                        <button
                          onClick={() => setExpandedStep(expandedStep === i ? null : i)}
                          style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}
                        >
                          <div style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `${p.color}20`, border: `1px solid ${p.color}30`, color: p.color, fontFamily: "Georgia, serif", fontSize: 10 }}>
                            {i + 1}
                          </div>
                          <p style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "#f0e8d8", margin: 0, flex: 1 }}>{s.label}</p>
                        </button>
                        <AnimatePresence>
                          {expandedStep === i && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              style={{ fontFamily: "Georgia, serif", fontSize: 11, color: "rgba(240,232,216,0.5)", lineHeight: 1.6, margin: "6px 0 0 32px" }}
                            >
                              {s.desc}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>

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
                  {/* Bouton play — tous formats lisibles (Opus décodé via ogg-opus-decoder) */}
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
