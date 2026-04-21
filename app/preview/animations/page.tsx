"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BlobBackground from "../../components/BlobBackground";

// ─── Thèmes ──────────────────────────────────────────────────────────────────

const THEMES = {
  deuil:  { label: "Deuil",   accent: "#4db8c8", blob: "deuil"  as const },
  amitie: { label: "Amitié",  accent: "#f0a855", blob: "amitie" as const },
  amour:  { label: "Amour",   accent: "#e05580", blob: "amour"  as const },
};
type ThemeKey = keyof typeof THEMES;

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AnimationsPreview() {
  const [theme, setTheme] = useState<ThemeKey>("deuil");
  const [anim, setAnim] = useState<"sealed" | "reveal">("sealed");
  const [revealKey, setRevealKey] = useState(0);

  const t = THEMES[theme];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BlobBackground variant={t.blob} />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: 720,
          margin: "0 auto",
          padding: "32px 20px 80px",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <p
            className="ekko-serif"
            style={{
              fontSize: 11,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(240,232,216,0.35)",
              margin: 0,
            }}
          >
            Preview · Animations
          </p>
          <h1
            className="ekko-serif"
            style={{
              fontSize: 28,
              color: "#f0e8d8",
              fontWeight: 300,
              margin: "8px 0 0",
            }}
          >
            Nouvelles animations EKKO
          </h1>
        </div>

        {/* Tabs animation */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20 }}>
          {([
            { k: "sealed", label: "Capsule scellée" },
            { k: "reveal", label: "Révélation" },
          ] as const).map((b) => (
            <button
              key={b.k}
              onClick={() => {
                setAnim(b.k);
                if (b.k === "reveal") setRevealKey((v) => v + 1);
              }}
              className="ekko-serif"
              style={{
                padding: "8px 18px",
                borderRadius: 999,
                background: anim === b.k ? `${t.accent}20` : "rgba(255,255,255,0.04)",
                border: `1px solid ${anim === b.k ? t.accent + "60" : "rgba(255,255,255,0.08)"}`,
                color: anim === b.k ? "#f0e8d8" : "rgba(240,232,216,0.55)",
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Theme selector */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 32 }}>
          {(Object.keys(THEMES) as ThemeKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setTheme(k)}
              className="ekko-serif"
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                background: theme === k ? `${THEMES[k].accent}18` : "transparent",
                border: `1px solid ${theme === k ? THEMES[k].accent + "70" : "rgba(255,255,255,0.08)"}`,
                color: theme === k ? THEMES[k].accent : "rgba(240,232,216,0.4)",
                fontSize: 11,
                letterSpacing: "0.1em",
                cursor: "pointer",
              }}
            >
              {THEMES[k].label}
            </button>
          ))}
        </div>

        {/* Stage */}
        <div
          style={{
            position: "relative",
            background: "rgba(10,8,14,0.4)",
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.06)",
            padding: "60px 24px",
            minHeight: 520,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(8px)",
          }}
        >
          {anim === "sealed" ? (
            <SealedCapsule accent={t.accent} />
          ) : (
            <RevealCapsule key={revealKey} accent={t.accent} />
          )}
        </div>

        {/* Rejouer */}
        {anim === "reveal" && (
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button
              onClick={() => setRevealKey((v) => v + 1)}
              className="ekko-serif"
              style={{
                padding: "10px 22px",
                borderRadius: 12,
                background: `linear-gradient(135deg, ${t.accent}25, ${t.accent}40)`,
                border: `1px solid ${t.accent}50`,
                color: "#f0e8d8",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              ↻ Rejouer l&apos;animation
            </button>
          </div>
        )}

        {/* Info */}
        <p
          className="ekko-serif"
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "rgba(240,232,216,0.3)",
            marginTop: 32,
            fontStyle: "italic",
          }}
        >
          Cette page est un aperçu. Dis-moi ce que tu veux ajuster avant intégration.
        </p>
      </div>
    </div>
  );
}

// ─── Animation 1 : Capsule scellée avec cadenas ──────────────────────────────

function SealedCapsule({ accent }: { accent: string }) {
  // Particules flottantes déterministes (SSR-safe)
  const particles = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        x: 50 + Math.cos((i / 14) * Math.PI * 2) * (60 + (i % 3) * 15),
        y: 50 + Math.sin((i / 14) * Math.PI * 2) * (60 + (i % 3) * 15),
        size: 1.5 + (i % 3) * 0.6,
        delay: (i * 0.3) % 4,
        dur: 5 + (i % 4),
      })),
    []
  );

  return (
    <div style={{ position: "relative", width: 280, height: 280 }}>
      {/* Particules éthérées en CSS pur */}
      <style>{`
        @keyframes ekko-float {
          0%, 100% { transform: translate(0,0); opacity: 0; }
          20% { opacity: 0.7; }
          80% { opacity: 0.7; }
          50% { transform: translate(6px, -14px); }
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: accent,
            boxShadow: `0 0 ${p.size * 4}px ${accent}`,
            animation: `ekko-float ${p.dur}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
            pointerEvents: "none",
          }}
        />
      ))}

      <svg
        width="280"
        height="280"
        viewBox="0 0 280 280"
        style={{ overflow: "visible", display: "block" }}
      >
        <defs>
          {/* Halo externe */}
          <radialGradient id="sc-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.36" />
            <stop offset="55%" stopColor={accent} stopOpacity="0.08" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>

          {/* Verre de la capsule (sphère sombre uniforme) */}
          <radialGradient id="sc-glass" cx="50%" cy="50%" r="75%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.1" />
            <stop offset="60%" stopColor="#0a0810" stopOpacity="0.96" />
            <stop offset="100%" stopColor="#050308" stopOpacity="1" />
          </radialGradient>

          {/* Reflet du haut */}
          <radialGradient id="sc-shine-top" cx="50%" cy="20%" r="40%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {/* Reflet lumineux accent */}
          <radialGradient id="sc-inner-glow" cx="50%" cy="55%" r="40%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.44" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>

          {/* Or métallique du cadenas */}
          <linearGradient id="sc-metal" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fff4d4" />
            <stop offset="30%" stopColor={accent} />
            <stop offset="70%" stopColor={accent} stopOpacity="0.75" />
            <stop offset="100%" stopColor="#2a1a0a" />
          </linearGradient>
          <linearGradient id="sc-metal-shackle" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3a3a42" />
            <stop offset="100%" stopColor="#1a1a20" />
          </linearGradient>

          {/* Blurs */}
          <filter id="sc-blur-halo" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <filter id="sc-blur-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
          <filter id="sc-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>

          <clipPath id="sc-clip">
            <circle cx="140" cy="140" r="96" />
          </clipPath>
        </defs>

        {/* Styles d'animation */}
        <style>{`
          @keyframes sc-breath { 0%,100%{transform:scale(1)} 50%{transform:scale(1.03)} }
          @keyframes sc-halo   { 0%,100%{opacity:.35} 50%{opacity:.7} }
          @keyframes sc-ring   { 0%,100%{opacity:.4; transform:scale(1)} 50%{opacity:.85; transform:scale(1.02)} }
          @keyframes sc-rotate { to { transform: rotate(360deg); } }
          @keyframes sc-wave   { 0%,100%{transform:scaleY(.35)} 50%{transform:scaleY(1)} }
          @keyframes sc-keyhole{ 0%,100%{opacity:.6} 50%{opacity:1} }

          .sc-breath   { animation: sc-breath 5s ease-in-out infinite; transform-origin: 140px 140px; }
          .sc-halo     { animation: sc-halo 5s ease-in-out infinite; }
          .sc-ring     { animation: sc-ring 4s ease-in-out infinite; transform-origin: 140px 140px; }
          .sc-rotate   { animation: sc-rotate 28s linear infinite; transform-origin: 140px 140px; }
          .sc-wave     { animation: sc-wave 2s ease-in-out infinite; transform-origin: 50% 50%; }
          .sc-keyhole  { animation: sc-keyhole 2.4s ease-in-out infinite; }
        `}</style>

        {/* Halo externe flou */}
        <circle
          className="sc-halo"
          cx="140"
          cy="140"
          r="128"
          fill="url(#sc-halo)"
          filter="url(#sc-blur-halo)"
        />

        {/* Anneau orbital subtil en rotation */}
        <g className="sc-rotate" opacity="0.28">
          <circle
            cx="140"
            cy="140"
            r="112"
            fill="none"
            stroke={accent}
            strokeWidth="0.5"
            strokeDasharray="1 10"
          />
        </g>

        {/* Anneau lumineux pulsé */}
        <circle
          className="sc-ring"
          cx="140"
          cy="140"
          r="100"
          fill="none"
          stroke={accent}
          strokeWidth="0.8"
          strokeOpacity="0.44"
          filter="url(#sc-blur-soft)"
        />

        {/* Corps capsule avec respiration */}
        <g className="sc-breath">
          {/* Sphère de verre */}
          <circle cx="140" cy="140" r="96" fill="url(#sc-glass)" />
          <circle
            cx="140"
            cy="140"
            r="96"
            fill="none"
            stroke={accent}
            strokeWidth="0.8"
            strokeOpacity="0.5"
          />

          {/* Halo centré sur le cadenas */}
          <circle cx="140" cy="140" r="96" fill="url(#sc-inner-glow)" clipPath="url(#sc-clip)" />

          {/* Waveform scellée à l'intérieur */}
          <g clipPath="url(#sc-clip)" opacity="0.28">
            {[0.4, 0.6, 0.85, 0.7, 0.95, 0.6, 0.8, 0.5, 0.75, 0.45, 0.65].map((h, i) => {
              const barH = 70 * h;
              const x = 88 + i * 9.6;
              return (
                <rect
                  key={i}
                  className="sc-wave"
                  x={x}
                  y={140 - barH / 2}
                  width="4"
                  height={barH}
                  rx="2"
                  fill={accent}
                  style={{ animationDelay: `${i * 0.12}s` }}
                />
              );
            })}
          </g>

          {/* ───── Cadenas (épuré, centré) ───── */}
          {/* Ombre portée */}
          <ellipse
            cx="140"
            cy="170"
            rx="24"
            ry="3"
            fill="#000"
            fillOpacity="0.4"
            filter="url(#sc-shadow)"
          />

          {/* Halo de l'anse */}
          <path
            d="M 125 128 V 118 a 15 15 0 0 1 30 0 V 128"
            fill="none"
            stroke={accent}
            strokeOpacity="0.55"
            strokeWidth="11"
            strokeLinecap="round"
            filter="url(#sc-blur-soft)"
          />
          {/* Anse grise sombre */}
          <path
            d="M 125 128 V 118 a 15 15 0 0 1 30 0 V 128"
            fill="none"
            stroke="url(#sc-metal-shackle)"
            strokeWidth="5.5"
            strokeLinecap="round"
          />

          {/* Corps du cadenas */}
          <rect
            x="120"
            y="127"
            width="40"
            height="34"
            rx="5"
            fill="url(#sc-metal)"
            stroke={accent}
            strokeWidth="0.6"
            strokeOpacity="0.7"
          />

          {/* Trou de serrure */}
          <g className="sc-keyhole">
            <circle cx="140" cy="142" r="3" fill="#1a0f05" />
            <rect
              x="138.6"
              y="143.5"
              width="2.8"
              height="7"
              rx="1"
              fill="#1a0f05"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}

// ─── Animation 2 : Révélation (cadenas s'ouvre, écho se révèle) ─────────────

function RevealCapsule({ accent }: { accent: string }) {
  // Phases : 0=scellé, 1=déverrouillage, 2=ouverture, 3=écho révélé
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 900);   // cadenas pulse intense
    const t2 = setTimeout(() => setPhase(2), 1900);  // anse se lève, burst
    const t3 = setTimeout(() => setPhase(3), 3000);  // capsule s'ouvre, écho
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div style={{ position: "relative", width: 320, height: 320 }}>
      <svg
        width="320"
        height="320"
        viewBox="0 0 320 320"
        style={{ overflow: "visible", display: "block" }}
      >
        <defs>
          <radialGradient id="rv-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.48" />
            <stop offset="55%" stopColor={accent} stopOpacity="0.08" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>

          <radialGradient id="rv-glass" cx="50%" cy="50%" r="75%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.1" />
            <stop offset="60%" stopColor="#0a0810" stopOpacity="0.96" />
            <stop offset="100%" stopColor="#050308" stopOpacity="1" />
          </radialGradient>

          <radialGradient id="rv-inner-glow" cx="50%" cy="55%" r="40%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.44" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>

          <radialGradient id="rv-burst" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="30%" stopColor={accent} stopOpacity="0.85" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>

          <radialGradient id="rv-echo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
            <stop offset="30%" stopColor={accent} stopOpacity="0.7" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>

          <linearGradient id="rv-metal" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fff4d4" />
            <stop offset="30%" stopColor={accent} />
            <stop offset="70%" stopColor={accent} stopOpacity="0.75" />
            <stop offset="100%" stopColor="#2a1a0a" />
          </linearGradient>
          <linearGradient id="rv-metal-shackle" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3a3a42" />
            <stop offset="100%" stopColor="#1a1a20" />
          </linearGradient>

          <filter id="rv-blur-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>

          <filter id="rv-blur-halo" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="16" />
          </filter>

          <clipPath id="rv-clip">
            <circle cx="160" cy="160" r="100" />
          </clipPath>
        </defs>

        {/* Halo qui s'intensifie à chaque phase */}
        <motion.circle
          cx="160"
          cy="160"
          r="140"
          fill="url(#rv-halo)"
          filter="url(#rv-blur-halo)"
          initial={{ opacity: 0.3 }}
          animate={{
            opacity: phase === 0 ? 0.3 : phase === 1 ? 0.55 : phase === 2 ? 0.9 : 0.7,
            scale: phase === 2 ? 1.15 : 1,
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ transformOrigin: "160px 160px" }}
        />

        {/* Rings d'expansion lors de la phase 2 (burst) */}
        <AnimatePresence>
          {phase >= 2 && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.circle
                  key={`ring-${i}`}
                  cx="160"
                  cy="160"
                  r="100"
                  fill="none"
                  stroke={accent}
                  strokeWidth="1.2"
                  initial={{ scale: 0.9, opacity: 0.9 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  transition={{ duration: 2, delay: i * 0.35, ease: "easeOut" }}
                  style={{ transformOrigin: "160px 160px" }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Capsule : présente en phases 0-2, fade out en phase 3 */}
        <motion.g
          animate={{
            opacity: phase === 3 ? 0 : 1,
            scale: phase === 3 ? 0.85 : phase === 2 ? 1.05 : 1,
          }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          style={{ transformOrigin: "160px 160px" }}
        >
          {/* Sphère */}
          <circle cx="160" cy="160" r="100" fill="url(#rv-glass)" />
          <circle
            cx="160"
            cy="160"
            r="100"
            fill="none"
            stroke={accent}
            strokeWidth="0.8"
            strokeOpacity="0.44"
          />

          {/* Halo centré sur le cadenas */}
          <circle cx="160" cy="160" r="100" fill="url(#rv-inner-glow)" clipPath="url(#rv-clip)" />

          {/* Waveform scellée à l'intérieur */}
          <g clipPath="url(#rv-clip)" opacity="0.28">
            {[0.4, 0.6, 0.85, 0.7, 0.95, 0.6, 0.8, 0.5, 0.75, 0.45, 0.65].map((h, i) => {
              const barH = 72 * h;
              const x = 108 + i * 10;
              return (
                <motion.rect
                  key={i}
                  x={x}
                  y={160 - barH / 2}
                  width="4"
                  height={barH}
                  rx="2"
                  fill={accent}
                  animate={{ scaleY: [h, 0.45, h] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.12,
                  }}
                  style={{ transformOrigin: `${x + 2}px 160px` }}
                />
              );
            })}
          </g>

          {/* Cadenas épuré, centré */}
          <motion.g
            animate={{
              scale: phase === 1 ? [1, 1.1, 1] : 1,
            }}
            transition={{ duration: 0.6, repeat: phase === 1 ? 1 : 0 }}
            style={{ transformOrigin: "160px 160px" }}
          >
            {/* Ombre */}
            <ellipse
              cx="160"
              cy="188"
              rx="26"
              ry="3"
              fill="#000"
              fillOpacity="0.35"
            />

            {/* Anse qui se lève en phase 2 */}
            <motion.g
              animate={{
                y: phase >= 2 ? -18 : 0,
                rotate: phase >= 2 ? -22 : 0,
              }}
              transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
              style={{ transformOrigin: "175px 148px" }}
            >
              {/* Halo de l'anse */}
              <path
                d="M 145 148 V 138 a 15 15 0 0 1 30 0 V 148"
                fill="none"
                stroke={accent}
                strokeOpacity="0.55"
                strokeWidth="11"
                strokeLinecap="round"
                filter="url(#rv-blur-soft)"
              />
              {/* Anse grise sombre */}
              <path
                d="M 145 148 V 138 a 15 15 0 0 1 30 0 V 148"
                fill="none"
                stroke="url(#rv-metal-shackle)"
                strokeWidth="5.5"
                strokeLinecap="round"
              />
            </motion.g>

            {/* Corps */}
            <rect
              x="140"
              y="147"
              width="40"
              height="34"
              rx="5"
              fill="url(#rv-metal)"
              stroke={accent}
              strokeWidth="0.6"
              strokeOpacity="0.7"
            />

            {/* Trou de serrure avec éclat intense en phase 1 */}
            <circle cx="160" cy="162" r="3" fill="#1a0f05" />
            <rect x="158.6" y="163.5" width="2.8" height="7" rx="1" fill="#1a0f05" />
            <motion.circle
              cx="160"
              cy="162"
              r={phase === 1 ? 5 : 1}
              fill={accent}
              animate={{
                opacity: phase === 1 ? [0.6, 1, 0.6] : 0.7,
                r: phase === 1 ? [1, 4, 1] : 1,
              }}
              transition={{ duration: 0.6, repeat: phase === 1 ? 1 : 0 }}
            />
          </motion.g>
        </motion.g>

        {/* Écho révélé en phase 3 : orbe lumineuse avec waveform active */}
        <AnimatePresence>
          {phase === 3 && (
            <motion.g
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              {/* Orbe pulsée */}
              <motion.circle
                cx="160"
                cy="160"
                r="88"
                fill="url(#rv-echo)"
                animate={{ opacity: [0.6, 0.95, 0.6], scale: [1, 1.05, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformOrigin: "160px 160px" }}
              />
              <circle
                cx="160"
                cy="160"
                r="72"
                fill="none"
                stroke={accent}
                strokeWidth="0.8"
                strokeOpacity="0.6"
              />

              {/* Waveform active */}
              <g clipPath="url(#rv-clip)">
                {[0.5, 0.75, 0.95, 0.65, 0.85, 0.55, 0.9, 0.6, 0.8, 0.45, 0.7].map((h, i) => {
                  const barH = 80 * h;
                  const x = 108 + i * 10;
                  return (
                    <motion.rect
                      key={i}
                      x={x}
                      y={160 - barH / 2}
                      width="4"
                      height={barH}
                      rx="2"
                      fill={accent}
                      animate={{ scaleY: [h, 0.4, h * 1.1, h * 0.6, h] }}
                      transition={{
                        duration: 1.2 + (i % 3) * 0.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.06,
                      }}
                      style={{ transformOrigin: `${x + 2}px 160px` }}
                    />
                  );
                })}
              </g>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>

      {/* Label sous l'animation */}
      <motion.p
        className="ekko-serif"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          position: "absolute",
          bottom: -40,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 13,
          color: `${accent}cc`,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        {phase === 0 && "Scellé"}
        {phase === 1 && "Déverrouillage…"}
        {phase === 2 && "Ouverture…"}
        {phase === 3 && "Votre écho"}
      </motion.p>
    </div>
  );
}
