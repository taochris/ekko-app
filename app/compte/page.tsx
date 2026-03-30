"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import EkkoLogo from "../components/EkkoLogo";
import BlobBackground from "../components/BlobBackground";

export default function ComptePage() {
  const router = useRouter();
  const [hoverBack, setHoverBack] = useState(false);
  const accent = "#c9a96e";

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "#0d0a0f" }}>
      <BlobBackground variant="deuil" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-7 md:px-14">
        <EkkoLogo size="md" glow={true} />
        <button
          onClick={() => router.back()}
          onMouseEnter={() => setHoverBack(true)}
          onMouseLeave={() => setHoverBack(false)}
          className="text-sm px-4 py-2 rounded-full transition-all duration-200 ekko-serif"
          style={{
            background: hoverBack ? `${accent}18` : "rgba(255,255,255,0.05)",
            border: `1px solid ${hoverBack ? accent + "45" : "rgba(255,255,255,0.08)"}`,
            color: hoverBack ? accent : "rgba(240,232,216,0.5)",
            transform: hoverBack ? "scale(1.03)" : "scale(1)",
          }}
        >
          ← Retour
        </button>
      </nav>

      {/* Content */}
      <div className="relative z-10 px-6 md:px-14 pb-24 max-w-2xl mx-auto pt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p style={{ fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", color: `${accent}70`, fontFamily: "Georgia, serif", marginBottom: 12 }}>
            Mon compte
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 300, color: "#f0e8d8", fontFamily: "Georgia, serif", marginBottom: 8 }}>
            Espace personnel
          </h1>
          <p style={{ fontSize: 14, color: "rgba(240,232,216,0.4)", fontFamily: "Georgia, serif", fontStyle: "italic", marginBottom: 40 }}>
            Vos vocapsules sauvegardées et vos accès.
          </p>

          {/* Vocapsules sauvegardées */}
          <VocapsuleList accent={accent} />
        </motion.div>
      </div>
    </div>
  );
}

function VocapsuleList({ accent }: { accent: string }) {
  const [items] = useState(() => {
    if (typeof window === "undefined") return [];
    const result: { id: string; created: number }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("ekko_v_")) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const { created } = JSON.parse(raw);
            result.push({ id: key.replace("ekko_v_", ""), created });
          }
        } catch { /* ignore */ }
      }
    }
    return result.sort((a, b) => b.created - a.created);
  });

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

  if (items.length === 0) {
    return (
      <div style={{
        padding: "40px 32px", borderRadius: 20, textAlign: "center",
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
      }}>
        <svg viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.2" style={{ width: 36, height: 36, opacity: 0.35, margin: "0 auto 16px" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
        <p style={{ fontFamily: "Georgia, serif", fontSize: 14, color: "rgba(240,232,216,0.35)", fontStyle: "italic" }}>
          Aucune vocapsule sauvegardée pour le moment.
        </p>
        <p style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "rgba(240,232,216,0.2)", marginTop: 8 }}>
          Fusionnez des audios et générez un QR code pour les retrouver ici.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={{ fontFamily: "Georgia, serif", fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(240,232,216,0.25)", marginBottom: 4 }}>
        {items.length} vocapsule{items.length > 1 ? "s" : ""} sauvegardée{items.length > 1 ? "s" : ""}
      </p>
      {items.map((item) => (
        <VocapsuleCard key={item.id} id={item.id} created={item.created} accent={accent} formatDate={formatDate} />
      ))}
    </div>
  );
}

function VocapsuleCard({ id, created, accent, formatDate }: {
  id: string; created: number; accent: string; formatDate: (ts: number) => string;
}) {
  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/v/${id}` : `/v/${id}`;

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        padding: "16px 20px", borderRadius: 16,
        background: hovered ? `${accent}0a` : "rgba(255,255,255,0.03)",
        border: `1px solid ${hovered ? accent + "30" : "rgba(255,255,255,0.07)"}`,
        transition: "all 0.2s",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.5" style={{ width: 14, height: 14, opacity: 0.7 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <span style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "#f0e8d8", letterSpacing: "0.05em" }}>
            {id}
          </span>
        </div>
        <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: "rgba(240,232,216,0.3)", margin: 0 }}>
          {formatDate(created)}
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <a
          href={`/v/${id}`}
          style={{
            padding: "6px 12px", borderRadius: 8, textDecoration: "none",
            background: `${accent}18`, border: `1px solid ${accent}30`,
            fontFamily: "Georgia, serif", fontSize: 11, color: accent,
          }}
        >
          Écouter
        </a>
        <button
          onClick={copy}
          style={{
            padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.04)", cursor: "pointer",
            fontFamily: "Georgia, serif", fontSize: 11, color: copied ? accent : "rgba(240,232,216,0.4)",
          }}
        >
          {copied ? "Copié ✓" : "Lien"}
        </button>
      </div>
    </motion.div>
  );
}
