"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import BlobBackground from "./BlobBackground";
import EkkoLogo from "./EkkoLogo";
import ImportGuide from "./ImportGuide";
import AudioSelector from "./AudioSelector";
import AuthModal from "./AuthModal";
import { useAuth } from "../context/AuthContext";

type ThemeType = "deuil" | "amitie" | "amour";

const themeConfig: Record<string, {
  label: string;
  subtitle: string;
  accent: string;
  accentDim: string;
  gradient: string;
  blobVariant: ThemeType;
  ctaVocapsule: string;
  ctaLivre: string;
}> = {
  deuil: {
    label: "Mémoire éternelle",
    subtitle: "Préserver une présence",
    accent: "#4db8c8",
    accentDim: "rgba(77,184,200,0.15)",
    gradient: "from-[#081525] to-[#0d2a1a]",
    blobVariant: "deuil",
    ctaVocapsule: "Créer la vocapsule",
    ctaLivre: "Créer le livre de mémoire",
  },
  amitie: {
    label: "Amitiés & joie",
    subtitle: "Immortaliser vos fous rires",
    accent: "#f0a855",
    accentDim: "rgba(240,168,85,0.15)",
    gradient: "from-[#200e00] to-[#3d1a00]",
    blobVariant: "amitie",
    ctaVocapsule: "Fusionner les souvenirs",
    ctaLivre: "Créer le livre de l'amitié",
  },
  amour: {
    label: "Amour & intimité",
    subtitle: "Un coffret sonore précieux",
    accent: "#e05580",
    accentDim: "rgba(224,85,128,0.15)",
    gradient: "from-[#180710] to-[#2e0a1a]",
    blobVariant: "amour",
    ctaVocapsule: "Créer la vocapsule d'amour",
    ctaLivre: "Créer le livre du cœur",
  },
};

type Step = "home" | "import" | "select" | "vocapsule" | "livre";

function NavButton({ onClick, accent, children }: { onClick: () => void; accent: string; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="text-sm px-4 py-2 rounded-full transition-all duration-200 ekko-serif"
      style={{
        background: hovered ? `${accent}18` : "rgba(255,255,255,0.05)",
        border: `1px solid ${hovered ? accent + "45" : "rgba(255,255,255,0.08)"}`,
        color: hovered ? `${accent}` : "rgba(240,232,216,0.5)",
        transform: hovered ? "scale(1.03)" : "scale(1)",
      }}
    >
      {children}
    </button>
  );
}

export default function ThemePage({ theme }: { theme: string }) {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const config = themeConfig[theme] ?? themeConfig.deuil;
  const [step, setStep] = useState<Step>("home");
  const [importedAudios, setImportedAudios] = useState<File[]>([]);
  const [selectedAudios, setSelectedAudios] = useState<File[]>([]);

  const handleAudiosImported = (files: File[]) => {
    setImportedAudios(files);
    setStep("select");
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
        <BlobBackground variant={config.blobVariant} />
        <p className="ekko-serif text-sm" style={{ color: "rgba(240,232,216,0.3)", position: "relative", zIndex: 10 }}>
          …
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <BlobBackground variant={config.blobVariant} />
        <nav className="relative z-10 flex items-center justify-between px-8 py-7 md:px-14">
          <EkkoLogo size="md" glow={true} />
        </nav>
        <div className="relative z-10 px-6 pb-16 md:px-14" style={{ maxWidth: 480, margin: "0 auto" }}>
          <AuthModal accent={config.accent} onSuccess={() => {}} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BlobBackground variant={config.blobVariant} />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-7 md:px-14">
        <EkkoLogo size="md" glow={true} />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3"
        >
          {step !== "home" && (
            <NavButton onClick={() => {
              if (step === "select") setStep("import");
              else if (step === "import") setStep("home");
              else if (step === "vocapsule" || step === "livre") setStep("select");
            }} accent={config.accent}>
              ← Retour
            </NavButton>
          )}
          <NavButton onClick={() => router.push("/")} accent={config.accent}>
            Accueil
          </NavButton>
          <NavButton onClick={() => router.push("/compte")} accent={config.accent}>
            Compte
          </NavButton>
          <span className="ekko-serif text-xs hidden md:block" style={{ color: `${config.accent}70`, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.isAdmin ? "⚙ Admin" : user.name}
          </span>
          <NavButton onClick={logout} accent={config.accent}>
            Déconnexion
          </NavButton>
        </motion.div>
      </nav>

      {/* Content */}
      <div className="relative z-10 px-6 md:px-14 pb-24">
        {step === "home" && (
          <ThemeHome
            config={config}
            onStart={() => setStep("import")}
          />
        )}
        {step === "import" && (
          <ImportGuide
            theme={theme}
            config={config}
            onAudiosImported={handleAudiosImported}
          />
        )}
        {step === "select" && (
          <AudioSelector
            audios={importedAudios}
            config={config}
            onSelect={(files: File[]) => setSelectedAudios(files)}
            onVocapsule={() => {
              setSelectedAudios(selectedAudios);
              setStep("vocapsule");
            }}
            onLivre={() => {
              setSelectedAudios(selectedAudios);
              setStep("livre");
            }}
            ctaVocapsule={config.ctaVocapsule}
            ctaLivre={config.ctaLivre}
          />
        )}
        {step === "vocapsule" && (
          <VocapsulePage
            audios={selectedAudios}
            config={config}
          />
        )}
        {step === "livre" && (
          <LivrePage
            audios={selectedAudios}
            config={config}
            theme={theme}
          />
        )}
      </div>
    </div>
  );
}

function ThemeHome({
  config,
  onStart,
}: {
  config: typeof themeConfig["deuil"];
  onStart: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="max-w-2xl mx-auto text-center pt-10 md:pt-16"
    >
      <p
        className="text-xs tracking-[0.5em] uppercase mb-4 ekko-serif"
        style={{ color: `${config.accent}80` }}
      >
        {config.subtitle}
      </p>
      <h1
        className="ekko-serif font-light text-[clamp(2rem,5vw,3.5rem)] leading-tight mb-6"
        style={{ color: "#f0e8d8" }}
      >
        {config.label}
      </h1>
      <p
        className="ekko-serif italic text-base leading-relaxed mb-12"
        style={{ color: "rgba(240,232,216,0.45)" }}
      >
        Importez vos archives vocales depuis WhatsApp, Instagram, Telegram ou Messenger
        et transformez-les en un souvenir intemporel.
      </p>

      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={onStart}
        className="px-10 py-4 rounded-2xl text-base font-medium ekko-serif tracking-wide"
        style={{
          background: `linear-gradient(135deg, ${config.accent}40, ${config.accent}70)`,
          border: `1px solid ${config.accent}40`,
          color: "#f0e8d8",
          boxShadow: `0 8px 30px ${config.accent}20`,
        }}
      >
        Commencer l&apos;import
      </motion.button>
    </motion.div>
  );
}

function VocapsulePage({
  audios,
  config,
}: {
  audios: File[];
  config: typeof themeConfig["deuil"];
}) {
  return (
    <div className="max-w-2xl mx-auto pt-10">
      <VocapsuleProcessor audios={audios} config={config} />
    </div>
  );
}

function LivrePage({
  audios,
  config,
  theme,
}: {
  audios: File[];
  config: typeof themeConfig["deuil"];
  theme: string;
}) {
  return (
    <div className="max-w-2xl mx-auto pt-10">
      <TranscriptionProcessor audios={audios} config={config} theme={theme} />
    </div>
  );
}

// ─── STORAGE PAY FORM ────────────────────────────────────────────────────────

function StoragePayForm({
  offer,
  config,
  onCancel,
  onSuccess,
}: {
  offer: "1an" | "2ans";
  config: typeof themeConfig["deuil"];
  onCancel: () => void;
  onSuccess: (link: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [processing, setProcessing] = useState(false);
  const [fieldError, setFieldError] = useState("");

  const price = offer === "1an" ? "0.99 €" : "1.99 €";
  const duration = offer === "1an" ? "12 mois" : "24 mois";

  const formatCard = (v: string) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (v: string) =>
    v.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2");

  const handleSubmit = async () => {
    if (!email.includes("@")) return setFieldError("Email invalide.");
    if (card.replace(/\s/g, "").length < 16) return setFieldError("Numéro de carte incomplet.");
    if (expiry.length < 5) return setFieldError("Date d'expiration invalide.");
    if (cvc.length < 3) return setFieldError("CVC invalide.");
    setFieldError("");
    setProcessing(true);
    // Simulation paiement 2s
    await new Promise((r) => setTimeout(r, 2000));
    const id = Math.random().toString(36).slice(2, 10).toUpperCase();
    onSuccess(`https://ekko.app/v/${id}`);
  };

  if (processing) {
    return (
      <div style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{ width: 28, height: 28, border: `2px solid ${config.accent}40`, borderTop: `2px solid ${config.accent}`, borderRadius: "50%" }}
        />
        <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "rgba(240,232,216,0.5)", fontStyle: "italic" }}>
          Traitement du paiement…
        </p>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 13px", borderRadius: 10, boxSizing: "border-box",
    fontFamily: "Georgia, serif", fontSize: 13, color: "#f0e8d8",
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    outline: "none",
  };

  return (
    <div style={{ padding: "16px 18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "#f0e8d8", margin: 0 }}>
          Stockage <strong>{duration}</strong>
        </p>
        <span style={{ fontFamily: "Georgia, serif", fontSize: 16, color: config.accent, fontWeight: 600 }}>{price}</span>
      </div>

      <input
        type="email"
        placeholder="Votre email (pour recevoir le lien)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={inputStyle}
      />
      <input
        type="text"
        placeholder="Numéro de carte"
        value={card}
        onChange={(e) => setCard(formatCard(e.target.value))}
        style={inputStyle}
        maxLength={19}
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <input
          type="text"
          placeholder="MM/AA"
          value={expiry}
          onChange={(e) => setExpiry(formatExpiry(e.target.value))}
          style={inputStyle}
          maxLength={5}
        />
        <input
          type="text"
          placeholder="CVC"
          value={cvc}
          onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
          style={inputStyle}
          maxLength={4}
        />
      </div>

      {fieldError && (
        <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: "#ff8888", margin: 0 }}>{fieldError}</p>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button
          onClick={onCancel}
          style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "rgba(240,232,216,0.4)", fontFamily: "Georgia, serif", fontSize: 12, cursor: "pointer" }}
        >
          Annuler
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          style={{ flex: 2, padding: "10px 0", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${config.accent}50, ${config.accent}90)`, color: "#fff", fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
        >
          Payer {price}
        </motion.button>
      </div>

      <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: "rgba(240,232,216,0.2)", textAlign: "center", margin: 0 }}>
        🔒 Paiement sécurisé · Aucune donnée conservée sur nos serveurs
      </p>
    </div>
  );
}

// ─── VOCAPSULE PROCESSOR ────────────────────────────────────────────────────

function VocapsuleProcessor({
  audios,
  config,
}: {
  audios: File[];
  config: typeof themeConfig["deuil"];
}) {
  const [status, setStatus] = useState<"idle" | "merging" | "encoding" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [storageOffer, setStorageOffer] = useState<null | "1an" | "2ans">(null);
  const [payStep, setPayStep] = useState<"select" | "form" | "processing" | "done">("select");
  const [permanentLink, setPermanentLink] = useState<string | null>(null);
  const [vocapsuleId, setVocapsuleId] = useState<string | null>(null);

  const merge = async () => {
    if (audios.length === 0) return;
    setStatus("merging");
    setProgress(10);

    try {
      // Decode all audio files via AudioContext
      const decodeCtx = new AudioContext();
      const buffers: AudioBuffer[] = [];

      for (let i = 0; i < audios.length; i++) {
        const ab = await audios[i].arrayBuffer();
        try {
          const decoded = await decodeCtx.decodeAudioData(ab);
          buffers.push(decoded);
        } catch {
          // Skip files that can't be decoded (corrupted / unsupported codec)
          console.warn(`Skipped: ${audios[i].name}`);
        }
        setProgress(10 + Math.floor(((i + 1) / audios.length) * 40));
      }

      if (buffers.length === 0) throw new Error("No decodable audio");

      setProgress(55);
      setStatus("encoding");

      // Merge all buffers into one OfflineAudioContext (stereo → mono)
      const sampleRate = buffers[0].sampleRate;
      const totalLength = buffers.reduce((acc, b) => acc + b.length, 0);
      const offline = new OfflineAudioContext(1, totalLength, sampleRate);

      let offsetSec = 0;
      for (const buf of buffers) {
        const src = offline.createBufferSource();
        src.buffer = buf;
        src.connect(offline.destination);
        src.start(offsetSec);
        offsetSec += buf.duration;
      }

      setProgress(65);
      const renderedBuffer = await offline.startRendering();
      setProgress(80);

      // Encode to WAV (PCM 16-bit) directly in memory — instant, no real-time
      const numCh = 1;
      const numSamples = renderedBuffer.length;
      const sr = renderedBuffer.sampleRate;
      const dataSize = numSamples * numCh * 2;
      const wavBuf = new ArrayBuffer(44 + dataSize);
      const v = new DataView(wavBuf);
      const ws = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };

      ws(0, "RIFF"); v.setUint32(4, 36 + dataSize, true);
      ws(8, "WAVE"); ws(12, "fmt ");
      v.setUint32(16, 16, true); v.setUint16(20, 1, true);
      v.setUint16(22, numCh, true); v.setUint32(24, sr, true);
      v.setUint32(28, sr * numCh * 2, true); v.setUint16(32, numCh * 2, true);
      v.setUint16(34, 16, true); ws(36, "data");
      v.setUint32(40, dataSize, true);

      const ch = renderedBuffer.getChannelData(0);
      let offset = 44;
      for (let i = 0; i < numSamples; i++) {
        const s = Math.max(-1, Math.min(1, ch[i]));
        v.setInt16(offset, s < 0 ? s * 32768 : s * 32767, true);
        offset += 2;
      }

      setProgress(95);
      const blob = new Blob([wavBuf], { type: "audio/wav" });

      // Save to localStorage for QR code player page
      const id = Math.random().toString(36).slice(2, 10).toUpperCase();
      try {
        const reader = new FileReader();
        const b64: string = await new Promise((res, rej) => {
          reader.onload = () => res((reader.result as string).split(",")[1]);
          reader.onerror = rej;
          reader.readAsDataURL(blob);
        });
        localStorage.setItem(`ekko_v_${id}`, JSON.stringify({ b64, created: Date.now(), theme: config.accent }));
      } catch { /* localStorage full — still works with download */ }

      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      setVocapsuleId(id);
      setProgress(100);
      setStatus("done");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  const generateQR = async () => {
    const { default: QRCode } = await import("qrcode");
    const playerUrl = vocapsuleId
      ? `${window.location.origin}/v/${vocapsuleId}`
      : `${window.location.origin}/v/demo`;
    const url = await QRCode.toDataURL(playerUrl, {
      width: 300,
      color: { dark: "#f0e8d8", light: "#0d0a0f" },
    });
    setQrUrl(url);
    setShowQR(true);
  };

  const statusLabels: Record<string, string> = {
    idle: "Prêt à fusionner",
    merging: "Fusion des pistes audio…",
    encoding: "Encodage audio…",
    done: "Vocapsule créée",
    error: "Une erreur est survenue",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <p className="text-xs tracking-[0.4em] uppercase mb-3 ekko-serif" style={{ color: `${config.accent}80` }}>
        Vocapsule audio
      </p>
      <h2 className="ekko-serif font-light text-3xl mb-2" style={{ color: "#f0e8d8" }}>
        Fusion sonore
      </h2>
      <p className="ekko-serif text-sm mb-8" style={{ color: "rgba(240,232,216,0.4)" }}>
        {audios.length} audio{audios.length > 1 ? "s" : ""} sélectionné{audios.length > 1 ? "s" : ""}
      </p>

      {/* Audio list preview */}
      <div className="mb-8 space-y-2">
        {audios.slice(0, 5).map((f, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ background: config.accentDim, color: config.accent }}>
              {i + 1}
            </div>
            <span className="text-sm ekko-serif" style={{ color: "rgba(240,232,216,0.7)" }}>{f.name}</span>
            <span className="ml-auto text-xs" style={{ color: "rgba(240,232,216,0.3)" }}>
              {(f.size / 1024 / 1024).toFixed(1)} MB
            </span>
          </div>
        ))}
        {audios.length > 5 && (
          <p className="text-xs text-center ekko-serif" style={{ color: "rgba(240,232,216,0.3)" }}>
            + {audios.length - 5} autres
          </p>
        )}
      </div>

      {/* Progress */}
      {status !== "idle" && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs ekko-serif" style={{ color: config.accent }}>{statusLabels[status]}</span>
            <span className="text-xs ekko-serif" style={{ color: "rgba(240,232,216,0.4)" }}>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${config.accent}80, ${config.accent})` }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Merge button */}
      {status === "idle" && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={merge}
          disabled={audios.length === 0}
          className="w-full py-4 rounded-2xl text-base font-medium ekko-serif tracking-wide mb-4"
          style={{
            background: `linear-gradient(135deg, ${config.accent}40, ${config.accent}70)`,
            border: `1px solid ${config.accent}40`,
            color: "#f0e8d8",
            opacity: audios.length === 0 ? 0.5 : 1,
          }}
        >
          Fusionner {audios.length} audio{audios.length > 1 ? "s" : ""}
        </motion.button>
      )}

      {/* Result */}
      {status === "done" && outputUrl && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          {/* Player */}
          <div style={{ padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: `1px solid ${config.accent}30` }}>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: `${config.accent}80`, marginBottom: 10 }}>
              Votre vocapsule
            </p>
            <audio controls src={outputUrl} style={{ width: "100%" }} />
          </div>

          {/* Free download */}
          <div style={{ display: "flex", gap: 10 }}>
            <a
              href={outputUrl}
              download="vocapsule-ekko.webm"
              style={{
                flex: 1, padding: "12px 0", borderRadius: 14, textAlign: "center",
                fontFamily: "Georgia, serif", fontSize: 13, color: "#f0e8d8",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                textDecoration: "none",
              }}
            >
              ↓ Télécharger (gratuit)
            </a>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={generateQR}
              style={{
                flex: 1, padding: "12px 0", borderRadius: 14,
                fontFamily: "Georgia, serif", fontSize: 13, color: "#f0e8d8", cursor: "pointer",
                background: `linear-gradient(135deg, ${config.accent}30, ${config.accent}55)`,
                border: `1px solid ${config.accent}40`,
              } as React.CSSProperties}
            >
              QR Code
            </motion.button>
          </div>

          {/* QR Code */}
          {showQR && qrUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 24, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: `1px solid ${config.accent}20` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrUrl} alt="QR Code" style={{ width: 160, height: 160, borderRadius: 12 }} />
              <a href={qrUrl} download="qrcode-ekko.png" style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "rgba(240,232,216,0.5)", textDecoration: "underline" }}>
                Télécharger le QR code
              </a>
            </motion.div>
          )}

          {/* ─── Offre de stockage ─────────────────────────── */}
          {!permanentLink && (
            <div style={{ borderRadius: 18, overflow: "hidden", border: `1px solid ${config.accent}25`, background: "rgba(255,255,255,0.025)" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <p style={{ fontFamily: "Georgia, serif", fontSize: 10, letterSpacing: "0.35em", textTransform: "uppercase", color: `${config.accent}90`, margin: 0 }}>
                  Conserver en ligne
                </p>
                <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "rgba(240,232,216,0.5)", margin: "4px 0 0", fontStyle: "italic" }}>
                  Réécoutez votre vocapsule à tout moment, depuis n'importe quel appareil.
                </p>
              </div>

              {payStep === "select" && (
                <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                  {([
                    { id: "1an" as const, label: "1 an", price: "0.99 €", desc: "Lien permanent · QR code · accessible 12 mois", best: false },
                    { id: "2ans" as const, label: "2 ans", price: "1.99 €", desc: "Lien permanent · QR code · accessible 24 mois", best: true },
                  ]).map((offer) => (
                    <motion.button
                      key={offer.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setStorageOffer(offer.id); setPayStep("form"); }}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "14px 16px", borderRadius: 13, cursor: "pointer",
                        background: storageOffer === offer.id ? `${config.accent}18` : "rgba(255,255,255,0.04)",
                        border: `1px solid ${storageOffer === offer.id ? config.accent + "50" : "rgba(255,255,255,0.07)"}`,
                      } as React.CSSProperties}
                    >
                      <div style={{ textAlign: "left" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontFamily: "Georgia, serif", fontSize: 14, color: "#f0e8d8", fontWeight: 500 }}>{offer.label}</span>
                          {offer.best && (
                            <span style={{ fontFamily: "Georgia, serif", fontSize: 9, padding: "2px 7px", borderRadius: 6, background: `${config.accent}30`, color: config.accent, letterSpacing: "0.1em" }}>
                              RECOMMANDÉ
                            </span>
                          )}
                        </div>
                        <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: "rgba(240,232,216,0.4)", margin: "3px 0 0", fontStyle: "italic" }}>{offer.desc}</p>
                      </div>
                      <span style={{ fontFamily: "Georgia, serif", fontSize: 18, color: config.accent, fontWeight: 500 }}>{offer.price}</span>
                    </motion.button>
                  ))}
                </div>
              )}

              {payStep === "form" && storageOffer && (
                <StoragePayForm
                  offer={storageOffer}
                  config={config}
                  onCancel={() => { setPayStep("select"); setStorageOffer(null); }}
                  onSuccess={(link: string) => { setPermanentLink(link); setPayStep("done"); }}
                />
              )}
            </div>
          )}

          {/* Lien permanent activé */}
          {permanentLink && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ padding: 18, borderRadius: 16, background: `${config.accent}10`, border: `1px solid ${config.accent}35`, display: "flex", flexDirection: "column", gap: 12 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke={config.accent} strokeWidth="2" style={{ width: 18, height: 18, flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: config.accent, margin: 0 }}>Vocapsule conservée avec succès</p>
              </div>
              <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "rgba(240,232,216,0.6)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {permanentLink}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(permanentLink)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: config.accent, flexShrink: 0, fontFamily: "Georgia, serif", fontSize: 11 }}
                >
                  Copier
                </button>
              </div>
              <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: "rgba(240,232,216,0.3)", fontStyle: "italic", margin: 0 }}>
                Ce lien vous a également été envoyé par email. Partagez-le ou scannez le QR code.
              </p>
            </motion.div>
          )}
        </motion.div>
      )}

      {status === "error" && (
        <div className="p-4 rounded-xl text-sm ekko-serif" style={{ background: "rgba(200,50,50,0.1)", color: "#ff8888", border: "1px solid rgba(200,50,50,0.2)" }}>
          Erreur lors de la fusion. Vérifiez que vos fichiers sont bien des audio valides.
        </div>
      )}
    </motion.div>
  );
}

// ─── TRANSCRIPTION PROCESSOR ─────────────────────────────────────────────────

function TranscriptionProcessor({
  audios,
  config,
}: {
  audios: File[];
  config: typeof themeConfig["deuil"];
  theme: string;
}) {
  const [voted, setVoted] = useState<"yes" | "no" | null>(null);

  const vote = (v: "yes" | "no") => {
    setVoted(v);
    try {
      const key = "ekko_transcription_votes";
      const existing = JSON.parse(localStorage.getItem(key) ?? '{"yes":0,"no":0}');
      existing[v] = (existing[v] ?? 0) + 1;
      localStorage.setItem(key, JSON.stringify(existing));
    } catch { /* silently ignore */ }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{ maxWidth: 540, margin: "0 auto" }}
    >
      <p className="text-xs tracking-[0.4em] uppercase mb-3 ekko-serif" style={{ color: `${config.accent}80` }}>
        Livre de mémoire
      </p>
      <h2 className="ekko-serif font-light text-3xl mb-2" style={{ color: "#f0e8d8" }}>
        Transcription audio
      </h2>

      <div
        style={{
          marginTop: 32, padding: "32px 28px", borderRadius: 24,
          background: "rgba(255,255,255,0.03)", border: `1px solid ${config.accent}25`,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center",
        }}
      >
        {/* Icône */}
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: `${config.accent}15`, border: `1px solid ${config.accent}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={config.accent} strokeWidth="1.5" style={{ width: 26, height: 26 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>

        <div>
          <p className="ekko-serif" style={{ fontSize: 17, color: "#f0e8d8", marginBottom: 8, fontWeight: 400 }}>
            Fonctionnalité en développement
          </p>
          <p className="ekko-serif" style={{ fontSize: 13, color: "rgba(240,232,216,0.45)", lineHeight: 1.7, maxWidth: 380 }}>
            La transcription audio en texte — pour créer un livre de mémoire à partir de vos {audios.length} message{audios.length > 1 ? "s" : ""} vocaux — n&apos;est pas encore disponible.
          </p>
        </div>

        {!voted ? (
          <div style={{ width: "100%" }}>
            <p className="ekko-serif" style={{ fontSize: 12, color: `${config.accent}90`, marginBottom: 14, letterSpacing: "0.1em" }}>
              Seriez-vous intéressé(e) par cette fonctionnalité ?
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => vote("yes")}
                style={{
                  flex: 1, padding: "12px 0", borderRadius: 14, cursor: "pointer",
                  background: `linear-gradient(135deg, ${config.accent}30, ${config.accent}55)`,
                  border: `1px solid ${config.accent}40`, color: "#f0e8d8",
                  fontFamily: "Georgia, serif", fontSize: 14,
                }}
              >
                👍 Oui, je veux ça
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => vote("no")}
                style={{
                  flex: 1, padding: "12px 0", borderRadius: 14, cursor: "pointer",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(240,232,216,0.4)", fontFamily: "Georgia, serif", fontSize: 14,
                }}
              >
                Non, pas utile
              </motion.button>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              padding: "16px 24px", borderRadius: 14, width: "100%",
              background: voted === "yes" ? `${config.accent}12` : "rgba(255,255,255,0.03)",
              border: `1px solid ${voted === "yes" ? config.accent + "35" : "rgba(255,255,255,0.07)"}`,
            }}
          >
            <p className="ekko-serif" style={{ fontSize: 14, color: voted === "yes" ? config.accent : "rgba(240,232,216,0.4)", margin: 0 }}>
              {voted === "yes"
                ? "Merci ! Votre vote a été pris en compte. Nous vous préviendrons dès que la fonctionnalité sera disponible."
                : "Merci pour votre retour."}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
