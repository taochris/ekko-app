"use client";
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import JSZip from "jszip";

interface ImportGuideProps {
  theme: string;
  config: {
    accent: string;
    accentDim: string;
    label: string;
  };
  onAudiosImported: (files: File[]) => void;
}

const whatsappSteps = {
  android: [
    { label: "Ouvrir la conversation", desc: "Allez dans la conversation WhatsApp souhaitée" },
    { label: "Appuyer sur les 3 points", desc: "En haut à droite → 'Plus' → 'Exporter la discussion'" },
    { label: "Choisir avec médias", desc: "Sélectionnez 'Joindre les médias'. ⚠️ Si la conversation est très longue ou lourde, l'export peut être incomplet sur Android — passez alors par un iPhone. Détails en FAQ." },
    { label: "Importer le ZIP", desc: "Déposez le fichier ZIP reçu ci-dessous." },
  ],
  iphone: [
    { label: "Ouvrir la conversation", desc: "Allez dans la conversation WhatsApp souhaitée" },
    { label: "Appuyer sur la photo de la personne", desc: "En haut de la conversation, appuyez sur la photo ou le nom du contact" },
    { label: "Descendre jusqu'à 'Exporter la discussion'", desc: "Faites défiler vers le bas dans les informations du contact" },
    { label: "Choisir 'Avec média'", desc: "Sélectionnez 'Avec média' pour inclure les messages vocaux et photos" },
    { label: "Récupérer le ZIP", desc: "Sur smartphone : appuyez sur 'Enregistrer dans Fichiers' et importez directement. Sur PC : choisissez iCloud, Google Drive ou Dropbox, puis récupérez le fichier sur votre ordinateur. Détails en FAQ." },
  ],
};

const instagramSteps = {
  android: [
    { label: "Profil → ☰ → Paramètres → Comptes", desc: "Ouvrez votre profil, appuyez sur le menu ☰ en haut à droite, puis 'Paramètres et confidentialité' → 'Comptes'" },
    { label: "Vos informations et autorisations → Exporter vos informations", desc: "Dans 'Comptes', appuyez sur 'Vos informations et autorisations' puis 'Exporter vos informations'" },
    { label: "Créer une exportation → Votre appareil (ou Drive)", desc: "Appuyez sur 'Créer une exportation', choisissez la destination : votre appareil ou Google Drive" },
    { label: "Personnaliser → cocher Messages uniquement", desc: "Appuyez sur 'Personnaliser les informations', décochez tout et cochez uniquement 'Messages'. Choisissez la période souhaitée." },
    { label: "Format JSON · Qualité élevée · Lancer", desc: "Format : JSON (obligatoire pour extraire les audios) — Qualité : Élevée — puis lancez l'exportation. Déposez le ZIP reçu ici." },
  ],
  iphone: [
    { label: "Profil → ☰ → Paramètres → Comptes", desc: "Ouvrez votre profil, appuyez sur le menu ☰ en haut à droite, puis 'Paramètres et confidentialité' → 'Comptes'" },
    { label: "Vos informations et autorisations → Exporter vos informations", desc: "Dans 'Comptes', appuyez sur 'Vos informations et autorisations' puis 'Exporter vos informations'" },
    { label: "Créer une exportation → iCloud ou autre", desc: "Appuyez sur 'Créer une exportation', choisissez la destination : iCloud, Google Drive ou Dropbox" },
    { label: "Personnaliser → cocher Messages uniquement", desc: "Appuyez sur 'Personnaliser les informations', décochez tout et cochez uniquement 'Messages'. Choisissez la période souhaitée." },
    { label: "Format JSON · Qualité élevée · Lancer", desc: "Format : JSON (obligatoire pour extraire les audios) — Qualité : Élevée — puis lancez l'exportation. Déposez le ZIP reçu ici." },
  ],
};

const telegramSteps = {
  android: [
    { label: "Utiliser Telegram Desktop", desc: "L'export n'est disponible que sur la version ordinateur. Téléchargez-le sur : desktop.telegram.org" },
    { label: "Ouvrir la conversation", desc: "Cliquez sur les 3 points en haut à droite de la conversation" },
    { label: "Exporter l'historique", desc: "Choisissez 'Export chat history' → cochez 'Voice messages' uniquement" },
    { label: "Importer le dossier", desc: "Telegram exporte un dossier JSON + fichiers audio. Déposez le dossier ci-dessous. Détails en FAQ." },
  ],
  iphone: [
    { label: "Utiliser Telegram Desktop", desc: "L'export n'est disponible que sur la version ordinateur. Téléchargez-le sur : desktop.telegram.org" },
    { label: "Ouvrir la conversation", desc: "Cliquez sur les 3 points en haut à droite de la conversation" },
    { label: "Exporter l'historique", desc: "Choisissez 'Export chat history' → cochez 'Voice messages' uniquement" },
    { label: "Importer le dossier", desc: "Telegram exporte un dossier JSON + fichiers audio. Déposez le dossier ci-dessous. Détails en FAQ." },
  ],
};

const messengerSteps = {
  android: [
    { label: "Ouvrir Facebook → Paramètres", desc: "Dans Facebook : menu ☰ → 'Paramètres et confidentialité' → 'Paramètres'" },
    { label: "Espace compte", desc: "Faites défiler jusqu'à 'Espace compte' et appuyez dessus" },
    { label: "Vos informations → Exporter", desc: "'Vos informations et autorisations' → 'Exporter vos informations' → 'Créer une exportation'" },
    { label: "Messages uniquement · JSON · Supérieure", desc: "Personnaliser → décochez TOUT, cochez uniquement 'Messages' → période → Format JSON → Qualité supérieure. Déposez le ZIP ici." },
    { label: "💡 Conversation chiffrée (E2E) ?", desc: "Si audios absents : il s'agit d'une conversation chiffrée. Utilisez Messenger Desktop pour l'export sécurisé. Détails en FAQ." },
  ],
  iphone: [
    { label: "Ouvrir Facebook → photo de profil", desc: "Ouvrez l'app Facebook et appuyez sur votre photo de profil en haut à gauche" },
    { label: "Flèche déroulante → Espace compte", desc: "Appuyez sur la flèche déroulante à côté de votre nom, puis choisissez 'Espace compte' tout en bas" },
    { label: "Vos informations → Exporter", desc: "'Vos informations et autorisations' → 'Exporter vos informations' → 'Créer une exportation'" },
    { label: "Messages uniquement · JSON · Supérieure", desc: "Personnaliser → décochez TOUT, cochez uniquement 'Messages' → période → Format JSON → Qualité supérieure. Déposez le ZIP ici." },
    { label: "💡 Conversation chiffrée (E2E) ?", desc: "Si audios absents : il s'agit d'une conversation chiffrée. Utilisez Messenger Desktop pour l'export sécurisé. Détails en FAQ." },
  ],
};

const platforms = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    color: "#25d366",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    ),
    stepsPerOs: whatsappSteps,
    tip: "Sans médias = texte seulement. Avec médias = audios + photos inclus dans le ZIP.",
  },
  {
    id: "instagram",
    name: "Instagram",
    color: "#e1306c",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
    stepsPerOs: instagramSteps,
    tip: "Choisissez bien le format JSON (pas HTML) — seul ce format permet d'extraire les messages vocaux. Qualité élevée obligatoire.",
  },
  {
    id: "telegram",
    name: "Telegram",
    color: "#2aabee",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
    ),
    stepsPerOs: telegramSteps,
    tip: "Telegram Desktop est obligatoire. L'appli mobile ne permet pas l'export complet.",
  },
  {
    id: "messenger",
    name: "Messenger",
    color: "#0084ff",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.26L19.752 8l-6.561 6.963z"/>
      </svg>
    ),
    stepsPerOs: messengerSteps,
    tip: "Les messages chiffrés E2E nécessitent Messenger Desktop (PC/Mac) — ils ne sont pas inclus dans l'export Facebook standard.",
  },
];

export default function ImportGuide({ theme, config, onAudiosImported }: ImportGuideProps) {
  const [os, setOs] = useState<"android" | "iphone">("android");
  const [activeGuide, setActiveGuide] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [importedFiles, setImportedFiles] = useState<File[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDropHovered, setIsDropHovered] = useState(false);
  const [conversations, setConversations] = useState<{ name: string; count: number; prefix: string }[]>([]);
  const [pendingZip, setPendingZip] = useState<File | null>(null);
  const [selectedConvs, setSelectedConvs] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(typeof window !== "undefined" && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent));
  }, []);


  const applyConversationSelection = useCallback(async (zip: File, prefixes: Set<string>) => {
    const extracted = await extractAudiosFromZip(zip, prefixes);
    setImportedFiles(extracted);
    setConversations([]);
    setPendingZip(null);
    if (extracted.length > 0) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3500);
    }
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const audioFiles: File[] = [];
    const zipFiles: File[] = [];

    for (const file of acceptedFiles) {
      if (file.type.startsWith("audio/") || file.name.match(/\.(mp3|wav|ogg|m4a|aac|opus|flac)$/i)) {
        audioFiles.push(file);
      } else if (file.name.endsWith(".zip")) {
        zipFiles.push(file);
      }
    }

    if (audioFiles.length > 0) {
      setImportedFiles(audioFiles);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3500);
    } else if (zipFiles.length > 0) {
      const zip = zipFiles[0];
      const convs = await detectConversations(zip);
      if (convs.length > 1) {
        // Plusieurs conversations → afficher la modal de sélection
        setConversations(convs);
        setSelectedConvs(new Set(convs.map((c: { name: string; count: number; prefix: string }) => c.prefix)));
        setPendingZip(zip);
      } else {
        // 0 ou 1 conversation (WhatsApp simple, fichiers à la racine, etc.) → importer directement
        const extracted = await extractAudiosFromZip(zip, convs.length === 1 ? new Set([convs[0].prefix]) : undefined);
        setImportedFiles(extracted);
        if (extracted.length > 0) {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3500);
        }
      }
    }
  }, []);


  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".mp3", ".wav", ".ogg", ".m4a", ".aac", ".opus", ".flac"],
      "application/zip": [".zip"],
    },
    multiple: true,
    noClick: false,
  });

  const loadDemoFiles = () => {
    setIsDemoMode(true);
    const demoFiles = createDemoFiles(theme);
    setImportedFiles(demoFiles);
  };

  const handleContinue = () => {
    if (importedFiles.length > 0) {
      onAudiosImported(importedFiles);
    }
  };

  const toggleConv = (prefix: string) => {
    setSelectedConvs((prev) => {
      const next = new Set(prev);
      if (next.has(prefix)) next.delete(prefix); else next.add(prefix);
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="max-w-3xl mx-auto pt-6"
    >
      <p className="text-xs tracking-[0.4em] uppercase mb-3 ekko-serif text-center" style={{ color: `${config.accent}80` }}>
        Import de vos souvenirs
      </p>
      <h2 className="ekko-serif font-light text-3xl mb-2 text-center" style={{ color: "#f0e8d8" }}>
        Comment importer vos audios ?
      </h2>
      <p className="ekko-serif text-sm text-center" style={{ color: "rgba(240,232,216,0.4)", marginBottom: 100 }}>
        Choisissez votre plateforme et suivez le guide pas à pas.
      </p>

      {/* OS toggle */}
      <div className="flex flex-col items-center gap-3 mb-7">
        <p className="ekko-serif text-xs" style={{ color: "rgba(240,232,216,0.35)", letterSpacing: "0.1em" }}>Mon téléphone :</p>
        <div
          className="flex rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
        >
          <button
            onClick={() => { setOs("android"); setExpandedStep(null); }}
            className="ekko-serif flex items-center gap-2 px-4 py-2 text-xs transition-all duration-200"
            style={{
              background: os === "android" ? `${config.accent}20` : "transparent",
              color: os === "android" ? config.accent : "rgba(240,232,216,0.35)",
              borderRight: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 13, height: 13 }}>
              <path d="M17.523 15.341A5.988 5.988 0 0 0 18 13a6 6 0 0 0-6-6 6 6 0 0 0-6 6 5.988 5.988 0 0 0 .477 2.341L3 20h18l-3.477-4.659zM12 3a1 1 0 0 1 1-1 1 1 0 0 1 1 1 1 1 0 0 1-1 1 1 1 0 0 1-1-1zm-2 0a1 1 0 0 1 1-1 1 1 0 0 1 1 1 1 1 0 0 1-1 1 1 1 0 0 1-1-1z"/>
            </svg>
            Android
          </button>
          <button
            onClick={() => { setOs("iphone"); setExpandedStep(null); }}
            className="ekko-serif flex items-center gap-2 px-4 py-2 text-xs transition-all duration-200"
            style={{
              background: os === "iphone" ? `${config.accent}20` : "transparent",
              color: os === "iphone" ? config.accent : "rgba(240,232,216,0.35)",
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 13, height: 13 }}>
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            iPhone
          </button>
        </div>
      </div>

      {/* Platform selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {platforms.map((p) => (
          <motion.button
            key={p.id}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveGuide(activeGuide === p.id ? null : p.id)}
            className="flex flex-col items-center gap-2 py-4 px-3 rounded-2xl transition-all duration-300"
            style={{
              background: activeGuide === p.id ? `${p.color}18` : "rgba(255,255,255,0.04)",
              border: `1px solid ${activeGuide === p.id ? p.color + "50" : "rgba(255,255,255,0.07)"}`,
              color: activeGuide === p.id ? p.color : "rgba(240,232,216,0.5)",
            }}
          >
            {p.icon}
            <span className="text-xs ekko-serif tracking-wide">{p.name}</span>
          </motion.button>
        ))}
      </div>

      {/* Platform guide accordion */}
      <AnimatePresence>
        {activeGuide && (() => {
          const basePlatform = platforms.find((p) => p.id === activeGuide)!;
          const platform = { ...basePlatform, steps: basePlatform.stepsPerOs[os] };
          return (
            <motion.div
              key={activeGuide}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35 }}
              className="mb-8 overflow-hidden"
            >
              <div
                className="rounded-2xl p-6"
                style={{
                  background: `${platform.color}08`,
                  border: `1px solid ${platform.color}25`,
                }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div style={{ color: platform.color }}>{platform.icon}</div>
                  <h3 className="ekko-serif font-medium text-lg" style={{ color: "#f0e8d8" }}>
                    Guide {platform.name}
                  </h3>
                </div>

                <div className="space-y-5 mb-5">
                  {platform.steps.map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <button
                        onClick={() => setExpandedStep(expandedStep === i ? null : i)}
                        className="w-full flex items-center gap-4 text-left group"
                      >
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                          style={{ background: `${platform.color}20`, color: platform.color, border: `1px solid ${platform.color}30` }}
                        >
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium ekko-serif" style={{ color: "#f0e8d8" }}>
                            {step.label}
                          </p>
                          <AnimatePresence>
                            {expandedStep === i && (
                              <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-xs mt-1 ekko-serif"
                                style={{ color: "rgba(240,232,216,0.5)" }}
                              >
                                {step.desc}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                        <span
                          className="text-xs transition-transform duration-200"
                          style={{
                            color: "rgba(240,232,216,0.3)",
                            transform: expandedStep === i ? "rotate(180deg)" : "rotate(0deg)",
                            display: "inline-block",
                          }}
                        >
                          ▼
                        </span>
                      </button>
                    </motion.div>
                  ))}
                </div>

                <div
                  className="px-4 py-3 rounded-xl text-xs ekko-serif italic"
                  style={{ background: `${platform.color}10`, color: `${platform.color}cc`, border: `1px solid ${platform.color}20` }}
                >
                  💡 {platform.tip}
                </div>
                <p className="ekko-serif text-xs mt-3" style={{ color: "rgba(240,232,216,0.25)", fontStyle: "italic", textAlign: "right" }}>
                  * Pour une explication plus détaillée,{" "}
                  <a href="/faq" style={{ color: "rgba(240,232,216,0.45)", textDecoration: "underline", textUnderlineOffset: 3 }}>
                    consultez la FAQ
                  </a>
                </p>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Toast succès */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.35 }}
            className="mb-5 flex items-center gap-3 px-5 py-3.5 rounded-2xl"
            style={{
              background: "rgba(37,211,102,0.1)",
              border: "1px solid rgba(37,211,102,0.25)",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#25d366" strokeWidth="2.5" style={{ width: 18, height: 18, flexShrink: 0 }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <p className="text-sm ekko-serif" style={{ color: "#25d366" }}>
              Import réussi · {importedFiles.length} fichier{importedFiles.length > 1 ? "s" : ""} audio extrait{importedFiles.length > 1 ? "s" : ""}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sélecteur de conversation (ZIP multi-dossiers) */}
      <AnimatePresence>
        {conversations.length >= 1 && pendingZip && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 rounded-2xl overflow-hidden"
            style={{ border: `1px solid ${config.accent}30`, background: "rgba(255,255,255,0.03)" }}
          >
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="ekko-serif" style={{ fontSize: 12, letterSpacing: "0.25em", textTransform: "uppercase", color: `${config.accent}80`, margin: "0 0 4px" }}>
                {conversations.length > 1 ? `${conversations.length} conversations détectées` : "1 conversation détectée"}
              </p>
              <p className="ekko-serif" style={{ fontSize: 13, color: "rgba(240,232,216,0.6)", margin: 0 }}>
                {conversations.length > 1 ? "Sélectionnez les conversations à importer" : "Confirmez pour importer les audios"}
              </p>
            </div>

            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }}>
              {conversations.map((conv) => {
                const active = selectedConvs.has(conv.prefix);
                return (
                  <motion.button
                    key={conv.prefix}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleConv(conv.prefix)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 14px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                      background: active ? `${config.accent}12` : "rgba(255,255,255,0.03)",
                      border: `1px solid ${active ? config.accent + "40" : "rgba(255,255,255,0.06)"}`,
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                      border: `1.5px solid ${active ? config.accent : "rgba(255,255,255,0.2)"}`,
                      background: active ? config.accent : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {active && (
                        <svg viewBox="0 0 12 12" fill="none" style={{ width: 10, height: 10 }}>
                          <polyline points="1.5 6 4.5 9 10.5 3" stroke="#0d0a0f" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="ekko-serif" style={{ fontSize: 13, color: active ? "#f0e8d8" : "rgba(240,232,216,0.5)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {conv.name}
                      </p>
                      <p className="ekko-serif" style={{ fontSize: 11, color: "rgba(240,232,216,0.25)", margin: "2px 0 0" }}>
                        {conv.count} message{conv.count > 1 ? "s" : ""} vocal{conv.count > 1 ? "aux" : ""}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 8 }}>
              <button
                onClick={() => { setConversations([]); setPendingZip(null); }}
                className="ekko-serif"
                style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "rgba(240,232,216,0.3)", fontSize: 12, cursor: "pointer" }}
              >
                Annuler
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                disabled={selectedConvs.size === 0}
                onClick={() => applyConversationSelection(pendingZip, selectedConvs)}
                className="ekko-serif"
                style={{
                  flex: 2, padding: "9px 0", borderRadius: 10, border: "none", cursor: selectedConvs.size === 0 ? "not-allowed" : "pointer",
                  background: selectedConvs.size === 0 ? "rgba(255,255,255,0.05)" : `linear-gradient(135deg, ${config.accent}50, ${config.accent}90)`,
                  color: selectedConvs.size === 0 ? "rgba(240,232,216,0.3)" : "#fff", fontSize: 13,
                }}
              >
                Importer {selectedConvs.size > 0 ? `(${selectedConvs.size} conversation${selectedConvs.size > 1 ? "s" : ""})` : ""}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Drop zone + démo + fichiers importés */}
      <>
      <div className="mb-6">
        <p className="text-xs tracking-[0.3em] uppercase mb-4 ekko-serif" style={{ color: "rgba(240,232,216,0.3)" }}>
          Déposez vos fichiers
        </p>

        <div
          {...getRootProps()}
          onMouseEnter={() => setIsDropHovered(true)}
          onMouseLeave={() => setIsDropHovered(false)}
          className="relative rounded-2xl p-10 text-center cursor-pointer transition-all duration-300"
          style={{
            background: isDragActive
              ? `${config.accent}12`
              : isDropHovered
              ? `${config.accent}07`
              : "rgba(255,255,255,0.03)",
            border: `2px dashed ${
              isDragActive
                ? config.accent + "90"
                : isDropHovered
                ? config.accent + "35"
                : "rgba(255,255,255,0.1)"
            }`,
            boxShadow: isDropHovered || isDragActive
              ? `0 0 20px ${config.accent}0e, inset 0 0 12px ${config.accent}05`
              : "none",
            transform: isDropHovered ? "scale(1.005)" : "scale(1)",
          }}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center gap-3">
            <motion.div
              animate={{ y: isDragActive ? -6 : isDropHovered ? -3 : 0, scale: isDropHovered || isDragActive ? 1.1 : 1 }}
              transition={{ duration: 0.2 }}
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: isDropHovered || isDragActive ? config.accent + "22" : config.accentDim,
                boxShadow: isDropHovered || isDragActive ? `0 0 14px ${config.accent}28` : "none",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6" style={{ color: config.accent }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </motion.div>

            <div>
              <p className="text-sm ekko-serif" style={{ color: isDropHovered || isDragActive ? "rgba(240,232,216,0.95)" : "rgba(240,232,216,0.7)", transition: "color 0.2s" }}>
                {isDragActive ? "Déposez maintenant…" : isMobile ? "Appuyez pour sélectionner vos fichiers" : "Glissez vos fichiers audio ou votre ZIP ici"}
              </p>
              <p className="text-xs mt-1 ekko-serif" style={{ color: "rgba(240,232,216,0.3)" }}>
                MP3, WAV, OGG, M4A, AAC, OPUS, FLAC — ou fichier ZIP
              </p>
            </div>

            {isMobile ? (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); open(); }}
                className="ekko-serif text-sm px-6 py-3 rounded-2xl transition-all duration-200"
                style={{
                  background: `linear-gradient(135deg, ${config.accent}30, ${config.accent}55)`,
                  border: `1px solid ${config.accent}50`,
                  color: config.accent,
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                📂 Parcourir mes fichiers
              </button>
            ) : (
              <span
                className="text-xs px-4 py-1.5 rounded-full ekko-serif transition-all duration-200"
                style={{
                  background: isDropHovered ? config.accentDim : "rgba(255,255,255,0.06)",
                  color: isDropHovered ? config.accent : "rgba(240,232,216,0.5)",
                  border: `1px solid ${isDropHovered ? config.accent + "40" : "rgba(255,255,255,0.08)"}`,
                }}
              >
                ou cliquez pour sélectionner
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Demo mode button */}
      {importedFiles.length === 0 && (
        <div className="text-center mb-6">
          <button
            onClick={loadDemoFiles}
            className="text-xs ekko-serif underline underline-offset-4 transition-colors duration-200"
            style={{ color: "rgba(240,232,216,0.25)" }}
          >
            Continuer avec des audios de démonstration
          </button>
        </div>
      )}

      {/* Imported files preview */}
      <AnimatePresence>
        {importedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs tracking-widest uppercase ekko-serif" style={{ color: `${config.accent}80` }}>
                {importedFiles.length} audio{importedFiles.length > 1 ? "s" : ""} importé{importedFiles.length > 1 ? "s" : ""}
                {isDemoMode ? " · démonstration" : ""}
              </p>
              <button
                onClick={() => {
                  setImportedFiles([]);
                  setIsDemoMode(false);
                }}
                className="text-xs ekko-serif"
                style={{ color: "rgba(240,232,216,0.3)" }}
              >
                Effacer
              </button>
            </div>

            {/* Simple list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 280, overflowY: "auto" }}>
              {importedFiles.map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px", borderRadius: 12,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                    background: config.accentDim,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 11, height: 11, color: config.accent }}>
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                  </div>
                  <span style={{
                    fontFamily: "Georgia, serif", fontSize: 13, flex: 1, minWidth: 0,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    color: "rgba(240,232,216,0.7)",
                  }}>{f.name}</span>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: 11, color: "rgba(240,232,216,0.3)", flexShrink: 0 }}>
                    {isDemoMode ? "démo" : f.size > 0 ? `${(f.size / 1024).toFixed(0)} Ko` : ""}
                  </span>
                </div>
              ))}
            </div>

            <div className="w-full mt-5 flex flex-col items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleContinue}
                className="w-full py-4 rounded-2xl text-base font-medium ekko-serif tracking-wide"
                style={{
                  background: `linear-gradient(135deg, ${config.accent}40, ${config.accent}70)`,
                  border: `1px solid ${config.accent}40`,
                  color: "#f0e8d8",
                  boxShadow: `0 8px 30px ${config.accent}15`,
                }}
              >
                Choisir mes moments →
              </motion.button>
              <p className="ekko-serif text-xs italic" style={{ color: "rgba(240,232,216,0.3)" }}>
                Vous pourrez les trier et les écouter avant de créer votre ekko
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </>
    </motion.div>
  );
}

// ─── AudioCardList ───────────────────────────────────────────────

function extractDateFromName(name: string): string {
  const m = name.match(/(\d{4})[\-_.](\d{2})[\-_.](\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  return "";
}

function friendlyDate(dateStr: string): string {
  if (!dateStr) return "Date inconnue";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

interface AudioCardListProps {
  files: File[];
  config: { accent: string; accentDim: string };
  isDemoMode: boolean;
  playingIndex: number | null;
  setPlayingIndex: (i: number | null) => void;
  getAudioUrl: (file: File, index: number) => string;
}

function AudioCardList({ files, config, isDemoMode, playingIndex, setPlayingIndex, getAudioUrl }: AudioCardListProps) {
  // Group by date
  const groups: { date: string; items: { file: File; index: number }[] }[] = [];
  const seen = new Map<string, number>();

  files.forEach((file, index) => {
    const date = extractDateFromName(file.name);
    const key = date || "__nodate";
    if (!seen.has(key)) {
      seen.set(key, groups.length);
      groups.push({ date, items: [] });
    }
    groups[seen.get(key)!].items.push({ file, index });
  });

  // Sort groups by date desc
  groups.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.localeCompare(a.date);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxHeight: 420, overflowY: "auto", paddingRight: 4 }}>
      {groups.map((group) => (
        <div key={group.date || "nodate"}>
          {/* Date separator */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.06)" }} />
            <span style={{
              fontFamily: "Georgia, serif",
              fontSize: 10,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: `${config.accent}90`,
            }}>
              {group.date ? friendlyDate(group.date) : "Date inconnue"}
            </span>
            <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.06)" }} />
          </div>

          {/* Cards grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
            {group.items.map(({ file, index }) => {
              const isPlaying = playingIndex === index;
              const cleanName = file.name.replace(/\.(mp3|wav|ogg|oga|m4a|aac|opus|flac|weba|3gp|amr|mp4)$/i, "");
              const ext = file.name.split(".").pop()?.toUpperCase() ?? "";
              const size = formatSize(file.size);

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03, duration: 0.3 }}
                  style={{
                    borderRadius: 16,
                    padding: "12px 14px",
                    background: isPlaying ? `${config.accent}12` : "rgba(255,255,255,0.04)",
                    border: `1px solid ${isPlaying ? config.accent + "40" : "rgba(255,255,255,0.07)"}`,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    transition: "all 0.2s",
                  }}
                >
                  {/* File name + badge */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: config.accentDim,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 13, height: 13, color: config.accent }}>
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontFamily: "Georgia, serif", fontSize: 12,
                        color: isPlaying ? "#f0e8d8" : "rgba(240,232,216,0.75)",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        margin: 0,
                      }}>
                        {cleanName}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                        {ext && (
                          <span style={{
                            fontFamily: "Georgia, serif", fontSize: 9,
                            padding: "1px 6px", borderRadius: 4,
                            background: `${config.accent}18`, color: config.accent,
                            letterSpacing: "0.1em",
                          }}>{ext}</span>
                        )}
                        {size && !isDemoMode && (
                          <span style={{ fontFamily: "Georgia, serif", fontSize: 10, color: "rgba(240,232,216,0.3)" }}>
                            {size}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Audio player */}
                  {!isDemoMode ? (
                    <audio
                      src={getAudioUrl(file, index)}
                      controls
                      onPlay={() => setPlayingIndex(index)}
                      onPause={() => setPlayingIndex(null)}
                      onEnded={() => setPlayingIndex(null)}
                      style={{
                        width: "100%",
                        height: 28,
                        borderRadius: 8,
                        accentColor: config.accent,
                      }}
                    />
                  ) : (
                    <div style={{
                      height: 28, borderRadius: 8,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px dashed rgba(255,255,255,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontFamily: "Georgia, serif", fontSize: 10, color: "rgba(240,232,216,0.2)", fontStyle: "italic" }}>
                        aperçu indisponible · démo
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── ZIP extraction ───────────────────────────────────────────────

function detectZipPlatform(filenames: string[]): "instagram" | "messenger" | "whatsapp" | "generic" {
  for (const f of filenames) {
    if (f.includes("your_instagram_activity/messages") || f.includes("inbox/") && f.includes("_instagram")) return "instagram";
    if (f.startsWith("messages/inbox/") || f.includes("/messages/inbox/")) return "messenger";
    if (f.includes("WhatsApp")) return "whatsapp";
  }
  // secondary pass for Instagram without explicit path
  for (const f of filenames) {
    if (f.includes("/inbox/")) return "messenger"; // covers both Messenger & Instagram
  }
  return "generic";
}

async function detectConversations(zipFile: File): Promise<{ name: string; count: number; prefix: string }[]> {
  const AUDIO_EXTENSIONS = /\.(mp3|wav|ogg|oga|m4a|aac|opus|flac|weba|3gp|amr|mp4|mpeg)$/i;
  const EXCLUDE_PATHS = /(__MACOSX|\.DS_Store|Thumbs\.db)/i;
  const zip = new JSZip();
  const contents = await zip.loadAsync(zipFile);
  const allNames = Object.keys(contents.files);
  const platform = detectZipPlatform(allNames);
  const convMap = new Map<string, number>();

  Object.values(contents.files).forEach((entry) => {
    if (entry.dir || EXCLUDE_PATHS.test(entry.name) || !AUDIO_EXTENSIONS.test(entry.name)) return;
    const parts = entry.name.split("/");
    let prefix: string;

    if (platform === "instagram") {
      // your_instagram_activity/messages/inbox/NomPersonne_ABC/audio/file.m4a
      // or messages/inbox/NomPersonne_ABC/audio/file.m4a
      const inboxIdx = parts.findIndex((p) => p === "inbox");
      if (inboxIdx !== -1 && parts.length > inboxIdx + 1) {
        prefix = parts.slice(0, inboxIdx + 2).join("/");
      } else {
        prefix = parts.slice(0, Math.max(1, parts.length - 1)).join("/");
      }
    } else if (platform === "messenger") {
      // messages/inbox/NomPersonne_ABC123/audio/file.mp4
      const inboxIdx = parts.findIndex((p) => p === "inbox");
      if (inboxIdx !== -1 && parts.length > inboxIdx + 1) {
        prefix = parts.slice(0, inboxIdx + 2).join("/");
      } else {
        prefix = parts.slice(0, Math.max(1, parts.length - 1)).join("/");
      }
    } else if (platform === "whatsapp") {
      prefix = parts.length >= 2 ? parts.slice(0, parts.length - 1).join("/") : "__root__";
    } else {
      if (parts.length >= 4) {
        prefix = parts.slice(0, 3).join("/");
      } else if (parts.length >= 2) {
        prefix = parts.slice(0, parts.length - 1).join("/");
      } else {
        prefix = "__root__";
      }
    }
    convMap.set(prefix, (convMap.get(prefix) ?? 0) + 1);
  });

  return Array.from(convMap.entries())
    .map(([prefix, count]) => ({
      prefix,
      count,
      name: prefix.split("/").pop()?.replace(/_[a-z0-9]{6,}$/i, "").replace(/_/g, " ") ?? prefix,
    }))
    .sort((a, b) => b.count - a.count);
}

async function extractAudiosFromZip(zipFile: File, filterPrefixes?: Set<string>): Promise<File[]> {
  const AUDIO_EXTENSIONS = /\.(mp3|wav|ogg|oga|m4a|aac|opus|flac|weba|3gp|amr|mp4)$/i;
  const AUDIO_MIME: Record<string, string> = {
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    oga: "audio/ogg",
    m4a: "audio/mp4",
    mp4: "audio/mp4",
    aac: "audio/aac",
    opus: "audio/opus",
    flac: "audio/flac",
    weba: "audio/webm",
    "3gp": "audio/3gpp",
    amr: "audio/amr",
  };

  // Fichiers vidéo à exclure : VID- (WhatsApp vidéos), .mov, .avi, .mkv, .webm vidéo
  const VIDEO_EXCLUDE = /^VID-|\.mov$|\.avi$|\.mkv$|\.mp4$/i;
  // Sauf si c'est un vrai vocal (PTT- ou AUD- = voice notes WhatsApp)
  const VOICE_NOTE = /^(PTT-|AUD-|voice|audio|ptt|aud)/i;

  const EXCLUDE_PATHS = /(__MACOSX|\.DS_Store|Thumbs\.db)/i;

  const zip = new JSZip();
  const contents = await zip.loadAsync(zipFile);
  const audioFiles: File[] = [];

  const allNames = Object.keys(contents.files);
  const platform = detectZipPlatform(allNames);

  const entries = Object.values(contents.files).filter((entry) => {
    if (entry.dir || EXCLUDE_PATHS.test(entry.name) || !AUDIO_EXTENSIONS.test(entry.name)) return false;
    // Exclure les vidéos mp4 sauf si c'est un message vocal (PTT- ou AUD-)
    const filename = entry.name.split("/").pop() ?? entry.name;
    if (VIDEO_EXCLUDE.test(filename) && !VOICE_NOTE.test(filename)) return false;
    if (filterPrefixes && filterPrefixes.size > 0) {
      const parts = entry.name.split("/");
      let prefix: string;
      if (platform === "instagram" || platform === "messenger") {
        const inboxIdx = parts.findIndex((p) => p === "inbox");
        if (inboxIdx !== -1 && parts.length > inboxIdx + 1) {
          prefix = parts.slice(0, inboxIdx + 2).join("/");
        } else {
          prefix = parts.slice(0, Math.max(1, parts.length - 1)).join("/");
        }
      } else if (parts.length >= 4) {
        prefix = parts.slice(0, 3).join("/");
      } else if (parts.length >= 2) {
        prefix = parts.slice(0, parts.length - 1).join("/");
      } else {
        prefix = "__root__";
      }
      return filterPrefixes.has(prefix);
    }
    return true;
  });

  for (const entry of entries) {
    const blob = await entry.async("blob");
    const filename = entry.name.split("/").pop() ?? entry.name;
    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    const mime = AUDIO_MIME[ext] ?? "audio/octet-stream";
    const file = new File([blob], filename, { type: mime });
    audioFiles.push(file);
  }

  return audioFiles;
}

function createDemoFiles(theme: string): File[] {
  const sets: Record<string, string[]> = {
    deuil: [
      "message_vocal_papa_2023-12-24.ogg",
      "message_vocal_maman_2024-01-01.ogg",
      "vocale_anniversaire_2024-03-15.ogg",
      "dernier_message_2024-06-10.ogg",
    ],
    amitie: [
      "vocal_soiree_vendredi.ogg",
      "fou_rire_vacances.ogg",
      "message_anniversaire_julien.ogg",
      "vocal_road_trip_2024.ogg",
      "message_groupe_noel.ogg",
    ],
    amour: [
      "bonne_nuit_cheri.ogg",
      "message_du_matin.ogg",
      "vocal_saint_valentin.ogg",
      "je_t_aime_2024.ogg",
    ],
  };
  const names = sets[theme] ?? sets.deuil;
  return names.map((name) => new File([], name, { type: "audio/ogg" }));
}
