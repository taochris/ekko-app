"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface ThemeCardProps {
  theme: "deuil" | "amitie" | "amour";
  index: number;
}

const themeConfig = {
  deuil: {
    title: "Mémoire éternelle",
    subtitle: "Écho d'eux",
    description: "Gardez la voix de ceux que vous aimez. Transformez leurs messages en un hommage durable, un souvenir sonore qui traverse le temps.",
    cta: "Créer un hommage",
    bgGradient: "linear-gradient(135deg, #0a1a2e 0%, #0d2a1a 50%, #081525 100%)",
    glowColor: "rgba(30, 100, 140, 0.35)",
    borderColor: "rgba(40, 130, 160, 0.2)",
    ctaGradient: "linear-gradient(135deg, #1e6487, #2a9d8f)",
    accentColor: "#4db8c8",
    blobColor: "rgba(20, 80, 120, 0.3)",
    icon: (
      <svg viewBox="0 0 60 60" fill="none" style={{ width: 56, height: 56 }}>
        <ellipse cx="30" cy="30" rx="28" ry="16" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4"/>
        <path d="M10 30 Q20 18 30 30 Q40 42 50 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <path d="M6 30 Q18 12 30 30 Q42 48 54 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
        <circle cx="30" cy="30" r="3" fill="currentColor" opacity="0.8"/>
        <circle cx="30" cy="30" r="8" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
      </svg>
    ),
  },
  amitie: {
    title: "Amitiés & joie",
    subtitle: "Écho de nous",
    description: "Vos vocaux d'amis, vos fous rires, vos aventures collectives. Fusionnez-les en une capsule sonore qui immortalise votre bande.",
    cta: "Partager un souvenir",
    bgGradient: "linear-gradient(135deg, #2a1200 0%, #3d1a00 50%, #241000 100%)",
    glowColor: "rgba(180, 90, 20, 0.35)",
    borderColor: "rgba(200, 110, 30, 0.2)",
    ctaGradient: "linear-gradient(135deg, #c85a00, #e8913a)",
    accentColor: "#f0a855",
    blobColor: "rgba(160, 70, 10, 0.3)",
    icon: (
      <svg viewBox="0 0 60 60" fill="none" style={{ width: 56, height: 56 }}>
        <path d="M30 8 L32.5 20 L44 20 L35 27.5 L38 40 L30 32.5 L22 40 L25 27.5 L16 20 L27.5 20 Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
        <circle cx="15" cy="15" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5"/>
        <circle cx="45" cy="15" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5"/>
        <circle cx="12" cy="44" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4"/>
        <circle cx="48" cy="44" r="2" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4"/>
        <path d="M20 52 Q30 46 40 52" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
      </svg>
    ),
  },
  amour: {
    title: "Amour & intimité",
    subtitle: "Écho de toi",
    description: "Ces mots doux, ces messages du soir, ces aveux murmurés. Créez un coffret sonore de votre histoire, rien que pour vous deux.",
    cta: "Ouvrir le coffret",
    bgGradient: "linear-gradient(135deg, #200a15 0%, #2e0a1a 50%, #180710 100%)",
    glowColor: "rgba(160, 30, 70, 0.35)",
    borderColor: "rgba(180, 40, 80, 0.2)",
    ctaGradient: "linear-gradient(135deg, #8b1a3a, #c94070)",
    accentColor: "#e05580",
    blobColor: "rgba(140, 20, 60, 0.3)",
    icon: (
      <svg viewBox="0 0 60 60" fill="none" style={{ width: 56, height: 56 }}>
        <path d="M30 48 C30 48 10 36 10 22 C10 16 15 12 22 14 C26 15 29 19 30 21 C31 19 34 15 38 14 C45 12 50 16 50 22 C50 36 30 48 30 48 Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
        <path d="M30 42 C30 42 15 32 15 22 C15 18 18 15 22 16" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4"/>
        <circle cx="30" cy="30" r="18" stroke="currentColor" strokeWidth="0.5" opacity="0.15" strokeDasharray="2 4"/>
      </svg>
    ),
  },
};

export default function ThemeCard({ theme, index }: ThemeCardProps) {
  const router = useRouter();
  const config = themeConfig[theme];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ scale: 1.03, y: -6 }}
      onClick={() => router.push(`/theme/${theme}`)}
      style={{
        position: "relative",
        cursor: "pointer",
        height: "100%",
      }}
    >
      {/* Card body */}
      <div
        style={{
          position: "relative",
          borderRadius: 32,
          overflow: "hidden",
          background: config.bgGradient,
          padding: 28,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          height: "100%",
          border: `1px solid ${config.borderColor}`,
          boxShadow: `0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)`,
          boxSizing: "border-box",
        }}
      >
        {/* Blob top right */}
        <div style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: config.blobColor,
          filter: "blur(48px)",
          transform: "translate(20%, -20%)",
          pointerEvents: "none",
        }} />
        {/* Blob bottom left */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: config.blobColor,
          filter: "blur(40px)",
          transform: "translate(-20%, 20%)",
          pointerEvents: "none",
        }} />

        {/* Icon */}
        <div style={{
          position: "relative",
          width: 64,
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: config.accentColor,
          flexShrink: 0,
          margin: "0 auto",
        }}>
          {config.icon}
        </div>

        {/* Text */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 10, flex: 1, textAlign: "center", alignItems: "center" }}>
          <p style={{
            fontSize: 22,
            letterSpacing: "0.08em",
            fontStyle: "italic",
            color: config.accentColor,
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontWeight: 400,
            margin: 0,
          }}>
            {config.subtitle}
          </p>
          <h3 style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 20,
            fontWeight: 600,
            lineHeight: 1.25,
            color: "#f0e8d8",
            margin: 0,
          }}>
            {config.title}
          </h3>
          <p style={{
            fontFamily: "Georgia, serif",
            fontSize: 13,
            lineHeight: 1.7,
            color: "rgba(240,232,216,0.55)",
            margin: 0,
          }}>
            {config.description}
          </p>
        </div>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          style={{
            position: "relative",
            width: "100%",
            padding: "14px 0",
            borderRadius: 16,
            border: "none",
            background: config.ctaGradient,
            color: "#fff",
            fontFamily: "Georgia, serif",
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: "0.05em",
            cursor: "pointer",
            marginTop: "auto",
            flexShrink: 0,
          }}
        >
          {config.cta}
        </motion.button>
      </div>
    </motion.div>
  );
}
