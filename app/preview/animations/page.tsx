"use client";
import { useState } from "react";
import BlobBackground from "../../components/BlobBackground";
import { SealedCapsule, RevealCapsule } from "../../components/CapsuleAnimations";

const THEMES = {
  deuil:  { label: "Deuil",   accent: "#4db8c8", blob: "deuil"  as const },
  amitie: { label: "Amitié",  accent: "#f0a855", blob: "amitie" as const },
  amour:  { label: "Amour",   accent: "#e05580", blob: "amour"  as const },
};
type ThemeKey = keyof typeof THEMES;

export default function AnimationsPreview() {
  const [theme, setTheme] = useState<ThemeKey>("deuil");
  const [anim, setAnim] = useState<"sealed" | "reveal">("sealed");
  const [revealKey, setRevealKey] = useState(0);
  const t = THEMES[theme];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BlobBackground variant={t.blob} />
      <div style={{ position: "relative", zIndex: 10, maxWidth: 720, margin: "0 auto", padding: "32px 20px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <p className="ekko-serif" style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(240,232,216,0.35)", margin: 0 }}>
            Preview · Animations
          </p>
          <h1 className="ekko-serif" style={{ fontSize: 28, color: "#f0e8d8", fontWeight: 300, margin: "8px 0 0" }}>
            Nouvelles animations EKKO
          </h1>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20 }}>
          {([{ k: "sealed", label: "Capsule scellée" }, { k: "reveal", label: "Révélation" }] as const).map((b) => (
            <button
              key={b.k}
              onClick={() => { setAnim(b.k); if (b.k === "reveal") setRevealKey((v) => v + 1); }}
              className="ekko-serif"
              style={{
                padding: "8px 18px", borderRadius: 999,
                background: anim === b.k ? `${t.accent}20` : "rgba(255,255,255,0.04)",
                border: `1px solid ${anim === b.k ? t.accent + "60" : "rgba(255,255,255,0.08)"}`,
                color: anim === b.k ? "#f0e8d8" : "rgba(240,232,216,0.55)",
                fontSize: 13, cursor: "pointer",
              }}
            >
              {b.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 32 }}>
          {(Object.keys(THEMES) as ThemeKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setTheme(k)}
              className="ekko-serif"
              style={{
                padding: "6px 14px", borderRadius: 999,
                background: theme === k ? `${THEMES[k].accent}18` : "transparent",
                border: `1px solid ${theme === k ? THEMES[k].accent + "70" : "rgba(255,255,255,0.08)"}`,
                color: theme === k ? THEMES[k].accent : "rgba(240,232,216,0.4)",
                fontSize: 11, letterSpacing: "0.1em", cursor: "pointer",
              }}
            >
              {THEMES[k].label}
            </button>
          ))}
        </div>

        <div style={{
          position: "relative", background: "rgba(10,8,14,0.4)", borderRadius: 24,
          border: "1px solid rgba(255,255,255,0.06)", padding: "60px 24px", minHeight: 520,
          display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)",
        }}>
          {anim === "sealed" ? (
            <SealedCapsule accent={t.accent} size={280} />
          ) : (
            <RevealCapsule key={revealKey} accent={t.accent} size={320} />
          )}
        </div>

        {anim === "reveal" && (
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button
              onClick={() => setRevealKey((v) => v + 1)}
              className="ekko-serif"
              style={{
                padding: "10px 22px", borderRadius: 12,
                background: `linear-gradient(135deg, ${t.accent}25, ${t.accent}40)`,
                border: `1px solid ${t.accent}50`, color: "#f0e8d8", fontSize: 13, cursor: "pointer",
              }}
            >
              ↻ Rejouer l&apos;animation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
