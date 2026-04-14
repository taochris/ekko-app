"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import BlobBackground from "./BlobBackground";
import EkkoLogo from "./EkkoLogo";
import ImportGuide from "./ImportGuide";
import AudioSelector from "./AudioSelector";
import AuthModal from "./AuthModal";
import { useAuth } from "../context/AuthContext";
import { uploadAudiosToStorage, downloadAudiosFromStorage, deleteAudiosFromStorage } from "../lib/audioStorage";

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
    ctaVocapsule: "Créer mon écho",
    ctaLivre: "Créer le livre de mémoire",
  },
  amitie: {
    label: "Amitiés & joie",
    subtitle: "Immortaliser vos fous rires",
    accent: "#f0a855",
    accentDim: "rgba(240,168,85,0.15)",
    gradient: "from-[#200e00] to-[#3d1a00]",
    blobVariant: "amitie",
    ctaVocapsule: "Créer mon écho",
    ctaLivre: "Créer le livre de l'amitié",
  },
  amour: {
    label: "Amour & intimité",
    subtitle: "Un coffret sonore précieux",
    accent: "#e05580",
    accentDim: "rgba(224,85,128,0.15)",
    gradient: "from-[#180710] to-[#2e0a1a]",
    blobVariant: "amour",
    ctaVocapsule: "Créer mon écho",
    ctaLivre: "Créer le livre du cœur",
  },
};

type Step = "home" | "import" | "select" | "loading" | "capsule" | "vocapsule" | "livre";

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
  const [recovering, setRecovering] = useState(false);
  const [echoId, setEchoId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showEchos, setShowEchos] = useState(false);

  // Retour Stripe après paiement : fusionner les audios et afficher l'écran de dévoilement
  useEffect(() => {
    if (isLoading) return;

    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const sessionId = params.get("session_id");
    const uploadId = params.get("upload_id");
    const storageOption = parseInt(params.get("storage") ?? "0", 10);
    const uid = params.get("uid") ?? user?.uid ?? "anonymous";
    if (payment !== "success" || !sessionId || !uploadId) return;

    window.history.replaceState({}, "", window.location.pathname);

    setRecovering(true);
    (async () => {
      try {
        // Vérifier le paiement Stripe
        const verifyRes = await fetch(`/api/stripe/verify?session_id=${sessionId}`);
        const verifyData = await verifyRes.json();
        if (!verifyData.paid) { setRecovering(false); return; }

        // Fusionner les audios côté serveur et stocker sur Firebase
        const mergeRes = await fetch("/api/storage/merge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uploadId,
            theme,
            storageOption,
            accentColor: config.accent,
            uid,
          }),
        });
        const mergeData = await mergeRes.json();
        if (!mergeRes.ok || !mergeData.echoId) {
          console.error("Fusion échouée:", mergeData.error);
          setRecovering(false);
          return;
        }

        setEchoId(mergeData.echoId);
        setAudioUrl(mergeData.audioUrl);
        setStep("vocapsule");
      } catch (err) {
        console.error("Récupération post-paiement:", err);
        setRecovering(false);
      } finally {
        setRecovering(false);
      }
    })();
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

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

  if (recovering) {
    return (
      <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
        <BlobBackground variant={config.blobVariant} />
        <div style={{ position: "relative", zIndex: 10, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: 60, height: 60, borderRadius: "50%", background: `radial-gradient(circle, ${config.accent}60, transparent)`, border: `1px solid ${config.accent}50` }}
          />
          <p className="ekko-serif" style={{ fontStyle: "italic", fontSize: 16, color: "rgba(240,232,216,0.7)" }}>
            Votre écho se révèle…
          </p>
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
          {step !== "home" && step !== "loading" && (
            <NavButton onClick={() => {
              if (step === "select") setStep("import");
              else if (step === "import") setStep("home");
              else if (step === "capsule") setStep("select");
              else if (step === "vocapsule" || step === "livre") setStep("select");
            }} accent={config.accent}>
              ← Retour
            </NavButton>
          )}
          <NavButton onClick={() => router.push("/")} accent={config.accent}>
            Accueil
          </NavButton>
          {user ? (
            <>
              <NavButton onClick={() => setShowEchos(true)} accent={config.accent}>
                ✦ Mes échos
              </NavButton>
              <NavButton onClick={() => router.push("/account")} accent={config.accent}>
                <span className="flex items-center gap-2">
                  Mon compte
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: config.accent, display: "inline-block", opacity: 0.85 }} />
                </span>
              </NavButton>
              <NavButton onClick={() => router.push("/faq")} accent={config.accent}>
                FAQ
              </NavButton>
            </>
          ) : (
            <>
              <NavButton onClick={() => router.push("/compte")} accent={config.accent}>
                Connexion
              </NavButton>
              <NavButton onClick={() => router.push("/faq")} accent={config.accent}>
                FAQ
              </NavButton>
            </>
          )}
        </motion.div>
      </nav>

      {/* Modal Mes échos express */}
      {showEchos && user && (
        <EchosQuickModal uid={user.uid} accent={config.accent} onClose={() => setShowEchos(false)} />
      )}

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
              setStep("loading");
            }}
            onLivre={() => {
              setSelectedAudios(selectedAudios);
              setStep("livre");
            }}
            ctaVocapsule={config.ctaVocapsule}
            ctaLivre={config.ctaLivre}
            showLivre={false}
          />
        )}
        {step === "loading" && (
          <LoadingScreen
            config={config}
            onDone={() => setStep("capsule")}
          />
        )}
        {step === "capsule" && (
          <CapsuleScreen
            config={config}
            audios={selectedAudios}
            theme={theme}
            onUnlock={() => setStep("vocapsule")}
          />
        )}
        {step === "vocapsule" && (
          <EchoRevealScreen
            config={config}
            echoId={echoId ?? ""}
            audioUrl={audioUrl ?? ""}
            theme={theme}
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

// ─── LOADING SCREEN ──────────────────────────────────────────────────────────

const emotionalPhrases: Record<string, string[]> = {
  deuil: [
    "Leurs voix prennent forme…",
    "Chaque mot conservé avec soin…",
    "Un souvenir qui ne s'effacera jamais…",
  ],
  amitie: [
    "Vos éclats de rire se rassemblent…",
    "Ces moments partagés prennent vie…",
    "Votre bande, pour toujours…",
  ],
  amour: [
    "Ces mots doux se retrouvent…",
    "Votre histoire prend forme…",
    "Un lien que le temps ne brisera pas…",
  ],
};

function LoadingScreen({
  config,
  onDone,
}: {
  config: typeof themeConfig["deuil"] & { blobVariant?: string };
  onDone: () => void;
}) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const variant = config.blobVariant ?? "deuil";
  const phrases = emotionalPhrases[variant] ?? emotionalPhrases.deuil;

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setPhraseIndex((i) => (i + 1) % phrases.length);
        setVisible(true);
      }, 500);
    }, 2200);
    return () => clearInterval(interval);
  }, [phrases.length]);

  useEffect(() => {
    const timer = setTimeout(onDone, 7000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "70vh",
        textAlign: "center",
        gap: 40,
      }}
    >
      {/* Orbe animée */}
      <div style={{ position: "relative", width: 120, height: 120 }}>
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: `radial-gradient(circle, ${config.accent}40 0%, transparent 70%)`,
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.06, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          style={{
            position: "absolute", inset: 16, borderRadius: "50%",
            background: `radial-gradient(circle, ${config.accent}60 0%, ${config.accent}20 100%)`,
            border: `1px solid ${config.accent}50`,
          }}
        />
        {/* Waveform simulée */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          {[0.5, 0.8, 1, 0.7, 0.9, 0.6, 1, 0.8, 0.5].map((h, i) => (
            <motion.div
              key={i}
              animate={{ scaleY: [h, h * 0.4, h] }}
              transition={{ duration: 0.8 + i * 0.1, repeat: Infinity, ease: "easeInOut", delay: i * 0.08 }}
              style={{
                width: 3, borderRadius: 2,
                height: 32 * h,
                background: config.accent,
                opacity: 0.8,
                transformOrigin: "center",
              }}
            />
          ))}
        </div>
      </div>

      {/* Phrase émotionnelle */}
      <motion.p
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className="ekko-serif"
        style={{
          fontStyle: "italic",
          fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
          color: "rgba(240,232,216,0.75)",
          maxWidth: 400,
          lineHeight: 1.6,
        }}
      >
        {phrases[phraseIndex]}
      </motion.p>

      {/* Phrase fixe en dessous */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="ekko-serif"
        style={{ fontSize: 13, color: `${config.accent}80`, letterSpacing: "0.2em" }}
      >
        Dans quelques secondes, vous pourrez l&apos;écouter…
      </motion.p>
    </motion.div>
  );
}

// ─── CAPSULE SCREEN ───────────────────────────────────────────────────────────

const capsuleTexts: Record<string, { title: string; sub: string }> = {
  deuil: { title: "Leur voix est là.", sub: "Il ne reste qu'un geste pour la garder pour toujours." },
  amitie: { title: "Votre écho est prêt.", sub: "Ces rires méritent de traverser le temps." },
  amour: { title: "Ces mots vous appartiennent.", sub: "Pour toujours, rien que pour vous deux." },
};

function CapsuleScreen({
  config,
  audios,
  theme,
  onUnlock,
}: {
  config: typeof themeConfig["deuil"] & { blobVariant?: string };
  audios: File[];
  theme: string;
  onUnlock: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "uploading" | "redirecting">("idle");
  const [showAuth, setShowAuth] = useState(false);
  const [storageOption, setStorageOption] = useState<0 | 100 | 200>(0);
  const { user } = useAuth();
  const variant = config.blobVariant ?? theme;
  const texts = capsuleTexts[variant] ?? capsuleTexts.deuil;

  // Fermer la modale dès que l'user est connecté
  useEffect(() => {
    if (user && showAuth) {
      setShowAuth(false);
    }
  }, [user, showAuth]);

  const storageLabel = storageOption === 100 ? "1 an" : storageOption === 200 ? "2 ans" : null;
  const totalLabel = storageOption === 0 ? "9,99 €" : storageOption === 100 ? "10,99 €" : "11,99 €";

  const handlePay = async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    setStatus("uploading");
    try {
      const uploadId = await uploadAudiosToStorage(audios);
      setStatus("redirecting");
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, uploadId, storage: storageOption, storageLabel, uid: user?.uid ?? "" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setStatus("idle");
      }
    } catch (err) {
      console.error("handlePay error:", err);
      setStatus("idle");
    }
  };

  if (showAuth) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: 480, margin: "0 auto", paddingTop: 32 }}
      >
        <p className="ekko-serif text-center mb-6" style={{ fontSize: 14, color: "rgba(240,232,216,0.5)", fontStyle: "italic" }}>
          Connectez-vous pour finaliser votre écho
        </p>
        <AuthModal accent={config.accent} onSuccess={() => setShowAuth(false)} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "70vh",
        textAlign: "center",
        gap: 32,
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      {/* Capsule scellée */}
      <div style={{ position: "relative", width: 160, height: 160 }}>
        {/* Halo extérieur */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.25, 0.5, 0.25] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute", inset: -16, borderRadius: "50%",
            background: `radial-gradient(circle, ${config.accent}30 0%, transparent 70%)`,
          }}
        />
        {/* Corps capsule */}
        <motion.div
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: `radial-gradient(135deg, ${config.accent}25 0%, rgba(10,10,20,0.95) 100%)`,
            border: `1.5px solid ${config.accent}50`,
            boxShadow: `0 0 40px ${config.accent}25, inset 0 1px 0 ${config.accent}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {/* Icône cadenas */}
          <svg viewBox="0 0 24 24" fill="none" stroke={config.accent} strokeWidth="1.5"
            style={{ width: 40, height: 40, opacity: 0.9 }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </motion.div>
        {/* Waveform floue derrière */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
          gap: 3, filter: "blur(1.5px)", opacity: 0.25,
        }}>
          {[0.4,0.7,1,0.8,0.6,0.9,0.5,0.7,0.4].map((h, i) => (
            <div key={i} style={{
              width: 3, borderRadius: 2,
              height: 50 * h,
              background: config.accent,
            }} />
          ))}
        </div>
      </div>

      {/* Texte */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="ekko-serif"
          style={{ fontSize: "clamp(1.2rem, 3vw, 1.6rem)", color: "#f0e8d8", fontWeight: 300, margin: 0 }}
        >
          {texts.title}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="ekko-serif"
          style={{ fontSize: 14, fontStyle: "italic", color: "rgba(240,232,216,0.45)", margin: 0 }}
        >
          {texts.sub}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="ekko-serif"
          style={{ fontSize: 12, color: `${config.accent}70`, letterSpacing: "0.1em", margin: 0 }}
        >
          {audios.length} moment{audios.length > 1 ? "s" : ""} capturé{audios.length > 1 ? "s" : ""}
        </motion.p>
      </div>

      {/* Options de conservation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}
      >
        <p className="ekko-serif" style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,232,216,0.3)", marginBottom: 4 }}>
          Conservation de votre écho
        </p>
        {([
          {
            value: 0,
            label: "Sans conservation",
            desc: "⚠︎ Fichier supprimé après 7 jours. Téléchargement unique — si vous perdez le fichier, il sera irrécupérable.",
            price: "",
            warn: true,
          },
          {
            value: 100,
            label: "Conservation 1 an",
            desc: "Votre écho reste sauvegardé 1 an · Accessible sur tous vos appareils · Retrouvable depuis votre compte en cas de perte · Lien de partage permanent",
            price: "+1 €",
            warn: false,
          },
          {
            value: 200,
            label: "Conservation 2 ans",
            desc: "Votre écho reste sauvegardé 2 ans · Multi-appareils · Retrouvable depuis votre compte · Lien de partage permanent · Idéal pour un souvenir durable",
            price: "+2 €",
            warn: false,
          },
        ] as { value: 0 | 100 | 200; label: string; desc: string; price: string; warn: boolean }[]).map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStorageOption(opt.value)}
            style={{
              display: "flex", alignItems: "flex-start", gap: 12,
              padding: "12px 14px", borderRadius: 12, cursor: "pointer", textAlign: "left", width: "100%",
              background: storageOption === opt.value ? `${config.accent}12` : "rgba(255,255,255,0.03)",
              border: `1px solid ${storageOption === opt.value ? config.accent + "50" : opt.warn ? "rgba(255,100,100,0.15)" : "rgba(255,255,255,0.07)"}`,
              transition: "all 0.2s",
            }}
          >
            <div style={{
              width: 16, height: 16, borderRadius: "50%", flexShrink: 0, marginTop: 2,
              border: `1.5px solid ${storageOption === opt.value ? config.accent : "rgba(255,255,255,0.2)"}`,
              background: storageOption === opt.value ? config.accent : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {storageOption === opt.value && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#0d0a0f" }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                <span className="ekko-serif" style={{ fontSize: 13, color: storageOption === opt.value ? "#f0e8d8" : "rgba(240,232,216,0.6)", fontWeight: 500 }}>
                  {opt.label}
                </span>
                {opt.price && (
                  <span className="ekko-serif" style={{ fontSize: 12, color: config.accent, fontWeight: 500 }}>
                    {opt.price}
                  </span>
                )}
              </div>
              <span className="ekko-serif" style={{ fontSize: 11, color: opt.warn ? "rgba(255,120,120,0.6)" : "rgba(240,232,216,0.28)", lineHeight: 1.5 }}>
                {opt.desc}
              </span>
            </div>
          </button>
        ))}
      </motion.div>

      {/* Bouton déverrouiller */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}
      >
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handlePay}
          disabled={status !== "idle"}
          style={{
            width: "100%", padding: "16px 0", borderRadius: 18,
            background: `linear-gradient(135deg, ${config.accent}60, ${config.accent}90)`,
            border: `1px solid ${config.accent}60`,
            color: "#fff",
            fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 500,
            letterSpacing: "0.05em", cursor: status !== "idle" ? "wait" : "pointer",
            boxShadow: `0 8px 32px ${config.accent}30`,
          }}
        >
          {status === "uploading" ? "Préparation de votre écho…" : status === "redirecting" ? "Redirection vers le paiement…" : `Déverrouiller mon écho — ${totalLabel}`}
        </motion.button>
        <p className="ekko-serif" style={{ fontSize: 11, color: "rgba(240,232,216,0.25)", margin: 0, fontStyle: "italic" }}>
          Paiement unique · Accès immédiat · Téléchargement MP3 + QR code
        </p>
      </motion.div>
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
  const [vocapsuleName, setVocapsuleName] = useState("");
  const [showOffer, setShowOffer] = useState(false);

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
        {vocapsuleName.trim() || "Réunion de voix"}
      </h2>
      <p className="ekko-serif text-sm mb-8" style={{ color: "rgba(240,232,216,0.4)" }}>
        {audios.length} audio{audios.length > 1 ? "s" : ""} sélectionné{audios.length > 1 ? "s" : ""}
      </p>

      {/* Audio list preview */}
      {status !== "done" && (
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
      )}

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

      {/* Nom de la vocapsule */}
      {status === "idle" && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Nommez votre vocapsule…"
            value={vocapsuleName}
            onChange={(e) => setVocapsuleName(e.target.value)}
            style={{
              width: "100%", padding: "12px 16px", borderRadius: 12, boxSizing: "border-box" as const,
              background: "rgba(255,255,255,0.04)", border: `1px solid ${config.accent}30`,
              color: "#f0e8d8", fontFamily: "Georgia, serif", fontSize: 14,
              outline: "none",
            }}
          />
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
              download={`${vocapsuleName.trim() || "vocapsule-ekko"}.wav`}
              onMouseEnter={() => setShowOffer(true)}
              style={{
                flex: 1, padding: "12px 0", borderRadius: 14, textAlign: "center",
                fontFamily: "Georgia, serif", fontSize: 13, color: "#f0e8d8",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                textDecoration: "none",
              }}
            >
              Télécharger
            </a>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onMouseEnter={() => setShowOffer(true)}
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
          {!permanentLink && (showOffer || payStep === "form") && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{ borderRadius: 18, overflow: "hidden", border: `1px solid ${config.accent}25`, background: "rgba(255,255,255,0.025)" }}
            >
              <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <p style={{ fontFamily: "Georgia, serif", fontSize: 16, color: "#f0e8d8", margin: "0 0 10px", fontWeight: 400 }}>
                  Votre vocapsule est prête 🎧
                </p>
                <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "rgba(240,232,216,0.55)", margin: "0 0 14px", fontStyle: "italic", lineHeight: 1.7 }}>
                  Scannez votre QR code et revivez vos souvenirs instantanément, pendant 7 jours.
                </p>
                <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "rgba(240,232,216,0.45)", margin: "0 0 8px", lineHeight: 1.7 }}>
                  Et si vous voulez garder ces moments à portée de main plus longtemps :
                </p>
                <p style={{ fontFamily: "Georgia, serif", fontSize: 12, color: `${config.accent}cc`, margin: "0 0 4px", letterSpacing: "0.02em" }}>• 1 an pour 0,99 €</p>
                <p style={{ fontFamily: "Georgia, serif", fontSize: 12, color: `${config.accent}cc`, margin: "0 0 14px", letterSpacing: "0.02em" }}>• 2 ans pour 1,90 €</p>
                <p style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "rgba(240,232,216,0.3)", margin: 0, fontStyle: "italic" }}>
                  Parce que certains souvenirs méritent de ne jamais disparaître.
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
            </motion.div>
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

// ─── ECHO REVEAL SCREEN ───────────────────────────────────────────────────────

function EchoRevealScreen({
  config,
  echoId,
  audioUrl,
  theme,
}: {
  config: typeof themeConfig["deuil"];
  echoId: string;
  audioUrl: string;
  theme: string;
}) {
  const [phase, setPhase] = useState<"unlock" | "reveal">("unlock");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const pageUrl = typeof window !== "undefined" ? `${window.location.origin}/v/${echoId}` : `/v/${echoId}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(pageUrl)}&bgcolor=0d0a0f&color=${config.accent.replace("#", "")}&margin=8`;

  useEffect(() => {
    // Lancer l'animation d'ouverture après 600ms
    const t = setTimeout(() => setPhase("reveal"), 2200);
    return () => clearTimeout(t);
  }, []);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (isPlaying) { a.pause(); } else { a.play(); }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (s: number) => {
    if (!isFinite(s) || isNaN(s)) return "0:00";
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ maxWidth: 480, margin: "0 auto", paddingTop: 24, paddingBottom: 48 }}
    >
      {phase === "unlock" ? (
        // ── Animation cadenas qui s'ouvre ──
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, minHeight: "60vh", justifyContent: "center" }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            style={{ position: "relative", width: 100, height: 100 }}
          >
            {/* Halo */}
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ position: "absolute", inset: -20, borderRadius: "50%", background: `radial-gradient(circle, ${config.accent}30, transparent)` }}
            />
            {/* Cadenas SVG animé */}
            <motion.svg
              viewBox="0 0 24 24" fill="none" stroke={config.accent} strokeWidth="1.2"
              style={{ width: 100, height: 100 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {/* Corps cadenas */}
              <motion.rect
                x="3" y="11" width="18" height="11" rx="2"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              />
              {/* Arceau qui s'ouvre */}
              <motion.path
                strokeLinecap="round"
                d="M7 11V7a5 5 0 0 1 9.9-1"
                initial={{ pathLength: 1, rotate: 0, originX: "12px", originY: "11px" }}
                animate={{ rotate: -40, y: -4 }}
                transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
              />
              {/* Trou de serrure */}
              <motion.circle
                cx="12" cy="16" r="1.5" fill={config.accent}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              />
            </motion.svg>
          </motion.div>
          <motion.p
            className="ekko-serif"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ fontSize: 15, color: "rgba(240,232,216,0.6)", fontStyle: "italic", textAlign: "center" }}
          >
            Votre écho se dévoile…
          </motion.p>
          {/* Spinner */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            style={{ width: 22, height: 22, border: `1.5px solid ${config.accent}30`, borderTop: `1.5px solid ${config.accent}`, borderRadius: "50%" }}
          />
        </div>
      ) : (
        // ── Écran de résultat ──
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ display: "flex", flexDirection: "column", gap: 28 }}
        >
          {/* Titre */}
          <div style={{ textAlign: "center" }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              style={{ fontSize: 32, marginBottom: 12 }}
            >
              ✦
            </motion.div>
            <h2 className="ekko-serif" style={{ fontSize: 26, fontWeight: 300, color: "#f0e8d8", margin: "0 0 8px" }}>
              Votre écho est prêt
            </h2>
            <p className="ekko-serif" style={{ fontSize: 13, color: "rgba(240,232,216,0.4)", fontStyle: "italic", margin: 0 }}>
              Ces voix vous appartiennent pour toujours.
            </p>
          </div>

          {/* Lecteur audio */}
          <div style={{
            borderRadius: 20, padding: "20px 22px",
            background: `linear-gradient(135deg, ${config.accent}0a, rgba(255,255,255,0.03))`,
            border: `1px solid ${config.accent}25`,
          }}>
            <p className="ekko-serif" style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: `${config.accent}80`, margin: "0 0 14px" }}>
              Écho audio
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
              <motion.button
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                onClick={togglePlay}
                style={{
                  width: 52, height: 52, borderRadius: "50%", border: "none", cursor: "pointer",
                  background: `linear-gradient(135deg, ${config.accent}60, ${config.accent}95)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 4px 20px ${config.accent}40`, flexShrink: 0,
                }}
              >
                {isPlaying ? (
                  <svg viewBox="0 0 24 24" fill="white" style={{ width: 18, height: 18 }}>
                    <rect x="6" y="4" width="4" height="16" rx="1"/>
                    <rect x="14" y="4" width="4" height="16" rx="1"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="white" style={{ width: 18, height: 18, marginLeft: 3 }}>
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </motion.button>
              <div style={{ flex: 1 }}>
                <p className="ekko-serif" style={{ fontSize: 13, color: "rgba(240,232,216,0.8)", margin: "0 0 2px" }}>
                  {isPlaying ? "En cours…" : "Écouter mon écho"}
                </p>
                <p className="ekko-serif" style={{ fontSize: 11, color: "rgba(240,232,216,0.3)", margin: 0 }}>
                  {formatTime(duration * progress / 100)} · {formatTime(duration)}
                </p>
              </div>
            </div>
            {/* Barre de progression */}
            <div
              style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)", cursor: "pointer" }}
              onClick={(e) => {
                const a = audioRef.current;
                if (!a || !duration) return;
                const rect = e.currentTarget.getBoundingClientRect();
                a.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
              }}
            >
              <div style={{ height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${config.accent}80, ${config.accent})`, width: `${progress}%`, transition: "width 0.1s linear" }} />
            </div>
          </div>

          {/* QR Code + lien */}
          <div style={{
            borderRadius: 20, padding: "20px 22px",
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
            display: "flex", gap: 18, alignItems: "center",
          }}>
            <img src={qrSrc} alt="QR Code" style={{ width: 140, height: 140, borderRadius: 10, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="ekko-serif" style={{ fontSize: 14, color: config.accent, margin: "0 0 8px", letterSpacing: "0.1em" }}>
                Lien de partage
              </p>
              <p className="ekko-serif" style={{ fontSize: 12, color: "rgba(240,232,216,0.7)", margin: "0 0 12px", wordBreak: "break-all" }}>
                {pageUrl}
              </p>
              <button
                onClick={() => navigator.clipboard?.writeText(pageUrl)}
                style={{
                  padding: "6px 14px", borderRadius: 8, cursor: "pointer",
                  background: `${config.accent}15`, border: `1px solid ${config.accent}30`,
                  color: config.accent, fontFamily: "Georgia, serif", fontSize: 13,
                }}
              >
                Copier le lien
              </button>
            </div>
          </div>

          {/* Téléchargement */}
          <a
            href={`/api/storage/proxy?echoId=${echoId}&download=1`}
            download={`echo-ekko-${echoId.slice(0, 8)}.mp4`}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              padding: "14px 0", borderRadius: 16, textDecoration: "none",
              background: `linear-gradient(135deg, ${config.accent}20, ${config.accent}35)`,
              border: `1px solid ${config.accent}40`,
              color: "#f0e8d8", fontFamily: "Georgia, serif", fontSize: 14,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Télécharger mon écho
          </a>

          <p className="ekko-serif" style={{ fontSize: 10, color: "rgba(240,232,216,0.15)", textAlign: "center", letterSpacing: "0.2em", margin: 0 }}>
            EKKO · MÉMOIRES SONORES
          </p>
        </motion.div>
      )}

      {/* Audio caché */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={() => {
            const a = audioRef.current;
            if (a?.duration) setProgress((a.currentTime / a.duration) * 100);
          }}
          onLoadedMetadata={() => { if (audioRef.current) setDuration(audioRef.current.duration); }}
          onEnded={() => setIsPlaying(false)}
        />
      )}
    </motion.div>
  );
}

// ─── ECHOS QUICK MODAL ────────────────────────────────────────────────────────

interface EchoItem {
  echoId: string;
  theme: string;
  accentColor: string;
  expiresAt: string | null;
  storageOption: number;
  createdApprox: string | null;
}

function EchosQuickModal({ uid, accent, onClose }: { uid: string; accent: string; onClose: () => void }) {
  const [echos, setEchos] = useState<EchoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/account/echos?uid=${uid}`)
      .then(r => r.json())
      .then(d => { setEchos(d.echos ?? []); setLoading(false); })
      .catch(() => { setError("Impossible de charger vos échos."); setLoading(false); });
  }, [uid]);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const copyLink = (echoId: string) => {
    navigator.clipboard.writeText(`${baseUrl}/v/${echoId}`);
    setCopiedId(echoId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatExpiry = (iso: string | null) => {
    if (!iso) return null;
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  };

  const storageLabel = (opt: number) =>
    opt === 200 ? "2 ans" : opt === 100 ? "1 an" : "7 jours";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(13,10,15,0.75)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        paddingTop: 80,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16, scale: 0.97 }}
        transition={{ duration: 0.22 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 460, maxHeight: "80vh", overflowY: "auto",
          background: "#0d0a0f", border: `1px solid ${accent}22`,
          borderRadius: 20, padding: 28,
          boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px ${accent}10`,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <div>
            <p className="ekko-serif" style={{ fontSize: 10, letterSpacing: "0.35em", textTransform: "uppercase", color: `${accent}70`, marginBottom: 4 }}>
              Accès rapide
            </p>
            <h2 className="ekko-serif" style={{ fontSize: 20, fontWeight: 300, color: "#f0e8d8", margin: 0 }}>
              Mes échos
            </h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(240,232,216,0.3)", fontSize: 20, lineHeight: 1, padding: 4 }}>
            ✕
          </button>
        </div>

        {/* Contenu */}
        {loading && (
          <p className="ekko-serif" style={{ textAlign: "center", color: "rgba(240,232,216,0.3)", fontSize: 13, padding: "32px 0", fontStyle: "italic" }}>
            Chargement…
          </p>
        )}
        {error && (
          <p className="ekko-serif" style={{ textAlign: "center", color: "#e05580", fontSize: 13, padding: "24px 0" }}>{error}</p>
        )}
        {!loading && !error && echos.length === 0 && (
          <p className="ekko-serif" style={{ textAlign: "center", color: "rgba(240,232,216,0.3)", fontSize: 13, padding: "32px 0", fontStyle: "italic" }}>
            Aucun écho actif pour le moment.
          </p>
        )}
        {!loading && echos.map((echo) => {
          const pageUrl = `${baseUrl}/v/${echo.echoId}`;
          const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(pageUrl)}&bgcolor=0d0a0f&color=${echo.accentColor.replace("#", "")}&margin=6`;
          const expiry = formatExpiry(echo.expiresAt);

          return (
            <div key={echo.echoId} style={{
              borderRadius: 14, border: `1px solid ${echo.accentColor}20`,
              background: "rgba(255,255,255,0.02)", padding: "16px 18px",
              marginBottom: 12, display: "flex", gap: 18, alignItems: "flex-start",
            }}>
              {/* QR code */}
              <div style={{ flexShrink: 0, borderRadius: 10, overflow: "hidden", border: `1px solid ${echo.accentColor}25`, background: "#0d0a0f" }}>
                <img src={qrSrc} alt="QR" width={80} height={80} style={{ display: "block" }} />
              </div>

              {/* Infos */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="ekko-serif" style={{ fontSize: 11, color: `${echo.accentColor}90`, letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 4px" }}>
                  {echo.theme} · {storageLabel(echo.storageOption)}
                </p>
                {expiry && (
                  <p className="ekko-serif" style={{ fontSize: 12, color: "rgba(240,232,216,0.35)", margin: "0 0 10px" }}>
                    Expire le {expiry}
                  </p>
                )}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {/* Lien direct */}
                  <a
                    href={pageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ekko-serif"
                    style={{
                      fontSize: 12, padding: "5px 12px", borderRadius: 8,
                      border: `1px solid ${echo.accentColor}35`,
                      color: echo.accentColor, background: "none",
                      textDecoration: "none", display: "inline-block",
                      transition: "background 0.15s",
                    }}
                  >
                    ▶ Écouter
                  </a>
                  {/* Copier lien */}
                  <button
                    onClick={() => copyLink(echo.echoId)}
                    className="ekko-serif"
                    style={{
                      fontSize: 12, padding: "5px 12px", borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: copiedId === echo.echoId ? echo.accentColor : "rgba(240,232,216,0.4)",
                      background: "none", cursor: "pointer", transition: "color 0.2s",
                    }}
                  >
                    {copiedId === echo.echoId ? "✓ Copié !" : "⎘ Lien"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Footer */}
        <div style={{ marginTop: 18, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p className="ekko-serif" style={{ fontSize: 11, color: "rgba(240,232,216,0.25)", fontStyle: "italic", margin: 0 }}>
            {echos.length} écho{echos.length > 1 ? "s" : ""} actif{echos.length > 1 ? "s" : ""}
          </p>
          <button
            onClick={onClose}
            className="ekko-serif"
            style={{ fontSize: 12, background: "none", border: "none", color: `${accent}60`, cursor: "pointer" }}
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
