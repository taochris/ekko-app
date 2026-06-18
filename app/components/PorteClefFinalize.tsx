"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AuthModal from "./AuthModal";
import { useAuth } from "../context/AuthContext";
import { uploadAudiosToStorage } from "../lib/audioStorage";

// ─── Formats de porte-clé (alignés sur /produit) ────────────────────────────
const FORMATS = [
  {
    id: "etiquette-rect",
    name: "Rectangulaire",
    tagline: "Élégant, fin et vertical.",
    dimensions: "50 × 30 mm",
    radius: 35,   // ≈ 9 mm — coins arrondis visibles (photo produit)
    ratio: 30 / 50,
  },
  {
    id: "etiquette-arrondie",
    name: "Arrondie",
    tagline: "Doux, discret et symbolique.",
    dimensions: "50,8 × 31,8 mm",
    radius: 60,   // = largeur/2 (120px/2) → forme pillule exacte (photo produit)
    ratio: 31.8 / 50.8,
  },
  {
    id: "carre",
    name: "Carré",
    tagline: "Sobre, compact et lisible.",
    dimensions: "40 × 40 mm",
    radius: 38,   // ≈ 10 mm — coins très arrondis (photo produit)
    ratio: 1,
  },
] as const;

type FormatId = (typeof FORMATS)[number]["id"];

// ─── Polices de gravure disponibles ─────────────────────────────────────────
const ENGRAVING_FONTS = [
  { id: "classique", name: "Classique",  family: "Georgia, serif",              previewSize: 18 },
  { id: "romain",    name: "Romain",     family: "'Cinzel', serif",             previewSize: 17 },
  { id: "cursif",    name: "Cursif",     family: "'Dancing Script', cursive",   previewSize: 22 },
  { id: "impact",    name: "Bold",       family: "'Bebas Neue', sans-serif",    previewSize: 22 },
  { id: "arrondi",   name: "Arrondi",    family: "'Pacifico', cursive",         previewSize: 15 },
] as const;

const PRICE_EUR = 24.9;
const PRICE_CENTS = 2490;

interface PorteClefFinalizeProps {
  config: {
    accent: string;
    accentDim: string;
    label: string;
    blobVariant?: string;
  };
  audios: File[];
  theme: string;
  coverPhoto?: File | null;
  initialFormat?: string;
}

/** QR code SVG réaliste avec les 3 détecteurs de coins */
function QRPattern({ px, woodBg }: { px: number; woodBg: string }) {
  const c = px / 21;
  const dark = "rgba(22,10,0,0.88)";

  const finder = (ox: number, oy: number) => (
    <g key={`f${ox}${oy}`}>
      <rect x={ox} y={oy} width={7 * c} height={7 * c} rx={c * 0.4} fill={dark} />
      <rect x={ox + c} y={oy + c} width={5 * c} height={5 * c} rx={c * 0.2} fill={woodBg} />
      <rect x={ox + 2 * c} y={oy + 2 * c} width={3 * c} height={3 * c} rx={c * 0.2} fill={dark} />
    </g>
  );

  const bits: [number, number][] = [
    // ── Timing strip row 6 (cols 8‑12, dark at even) ──
    [8,6],[10,6],[12,6],
    // ── Timing strip col 6 (rows 8‑12, dark at even) ──
    [6,8],[6,10],[6,12],
    // ── Row 7 ──────────────────────────────────────────
    [8,7],[9,7],[11,7],[13,7],[15,7],[17,7],[19,7],[20,7],
    // ── Row 8 ──────────────────────────────────────────
    [7,8],[9,8],[11,8],[14,8],[16,8],[18,8],[20,8],
    // ── Row 9 ──────────────────────────────────────────
    [8,9],[10,9],[12,9],[13,9],[15,9],[17,9],[19,9],
    // ── Row 10 ─────────────────────────────────────────
    [7,10],[9,10],[11,10],[14,10],[16,10],[18,10],[20,10],
    // ── Row 11 ─────────────────────────────────────────
    [8,11],[10,11],[12,11],[15,11],[17,11],[19,11],
    // ── Row 12 ─────────────────────────────────────────
    [7,12],[9,12],[11,12],[13,12],[14,12],[16,12],[18,12],[20,12],
    // ── Row 13 ─────────────────────────────────────────
    [8,13],[10,13],[12,13],[14,13],[16,13],[18,13],[20,13],
    // ── Row 14 ─────────────────────────────────────────
    [7,14],[9,14],[11,14],[13,14],[15,14],[17,14],[19,14],
    // ── Row 15 ─────────────────────────────────────────
    [8,15],[10,15],[12,15],[14,15],[17,15],[19,15],[20,15],
    // ── Row 16 ─────────────────────────────────────────
    [7,16],[9,16],[11,16],[13,16],[16,16],[18,16],[20,16],
    // ── Row 17 ─────────────────────────────────────────
    [8,17],[10,17],[13,17],[15,17],[17,17],[19,17],
    // ── Row 18 ─────────────────────────────────────────
    [7,18],[9,18],[11,18],[12,18],[14,18],[16,18],[18,18],[20,18],
    // ── Row 19 ─────────────────────────────────────────
    [8,19],[10,19],[12,19],[15,19],[17,19],[19,19],
    // ── Row 20 ─────────────────────────────────────────
    [7,20],[9,20],[11,20],[13,20],[15,20],[17,20],[19,20],[20,20],
  ];

  return (
    <svg width={px} height={px} viewBox={`0 0 ${px} ${px}`} style={{ display: "block" }}>
      {finder(0, 0)}
      {finder(14 * c, 0)}
      {finder(0, 14 * c)}
      {bits.map(([col, row]) => (
        <rect key={`${col}-${row}`} x={col * c + 0.4} y={row * c + 0.4} width={c - 0.8} height={c - 0.8} rx={0.4} fill={dark} />
      ))}
    </svg>
  );
}

/** Aperçu porte-clé photo-réaliste : vraie image produit + prénom gravé superposé */
function KeychainPreview({ format, name, accent, font }: { format: typeof FORMATS[number]; name: string; accent: string; font: string }) {
  const hasName = name.trim().length > 0;
  const trimmed = name.trim();

  // height = hauteur totale image (anneau inclus)
  // nameTopPx = position absolue en px depuis le haut de l'image
  // maxChars = nombre de caractères max raisonnables pour ce format
  // baseFontSize = taille de base; réduite auto si prénom long
  const photoParams: Record<string, { src: string; height: number; nameTopPx: number; baseFontSize: number; spacing: string; maxChars: number; nameWidth: string }> = {
    "etiquette-rect":     { src: "/images/preview/keychain-rect1.png",    height: 300, nameTopPx: 213, baseFontSize: 14, spacing: "0.08em", maxChars: 10, nameWidth: "52%" },
    "etiquette-arrondie": { src: "/images/preview/keychain-arrondie.png", height: 320, nameTopPx: 222, baseFontSize: 14, spacing: "0.08em", maxChars: 8, nameWidth: "58%" },
    "carre":              { src: "/images/preview/keychain-carre.png",     height: 280, nameTopPx: 207, baseFontSize: 15, spacing: "0.12em", maxChars: 12, nameWidth: "60%" },
  };
  const p = photoParams[format.id] ?? photoParams["etiquette-arrondie"];
  const imgWidth = p.height;

  // Réduction automatique de police selon la longueur
  const len = trimmed.length;
  const scaledFontSize = len <= 6
    ? p.baseFontSize
    : len <= 9
      ? p.baseFontSize - 1
      : len <= 12
        ? p.baseFontSize - 2.5
        : p.baseFontSize - 4;

  const tooLong = len > p.maxChars + 2;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
      {/* Conteneur image + prénom */}
      <div style={{ position: "relative", width: imgWidth, height: p.height }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.src}
          alt={`Aperçu porte-clé ${format.name}`}
          style={{ width: imgWidth, height: p.height, display: "block", userSelect: "none" }}
          draggable={false}
        />

        {/* Prénom gravé superposé — position absolue en px */}
        <div style={{
          position: "absolute",
          top: p.nameTopPx,
          left: "50%",
          transform: "translateX(-50%)",
          width: p.nameWidth,
          textAlign: "center",
          pointerEvents: "none",
        }}>
          {hasName ? (
            <motion.span
              key={trimmed}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                display: "block",
                fontFamily: font,
                fontSize: scaledFontSize,
                letterSpacing: p.spacing,
                fontWeight: 700,
                color: "rgba(72, 34, 4, 0.85)",
                textShadow: "0 1px 0 rgba(255,200,100,0.12)",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100%",
              }}
            >
              {trimmed}
            </motion.span>
          ) : (
            <span style={{
              display: "block",
              fontFamily: font,
              fontSize: p.baseFontSize - 2,
              letterSpacing: p.spacing,
              fontWeight: 400,
              color: "rgba(72,34,4,0.28)",
              fontStyle: "italic",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}>
              prénom
            </span>
          )}
        </div>
      </div>

      {/* Avertissement si trop long */}
      {tooLong && (
        <p style={{
          fontFamily: "Georgia, serif", fontSize: 10, fontStyle: "italic",
          color: "#e07040", marginTop: 6, textAlign: "center",
          letterSpacing: "0.05em",
        }}>
          Prénom trop long — max {p.maxChars + 2} caractères pour ce format
        </p>
      )}

      <span style={{ fontFamily: "Georgia, serif", fontSize: 11, fontStyle: "italic", color: `${accent}90`, marginTop: tooLong ? 4 : 10 }}>
        Aperçu indicatif · {format.dimensions}
      </span>
    </div>
  );
}

export default function PorteClefFinalize({
  config, audios, theme, coverPhoto, initialFormat,
}: PorteClefFinalizeProps) {
  const { user } = useAuth();
  const accent = config.accent;

  const [format, setFormat] = useState<FormatId>(
    (FORMATS.find((f) => f.id === initialFormat)?.id ?? "etiquette-rect") as FormatId
  );
  const [engraveName, setEngraveName] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "redirecting">("idle");
  const [showAuth, setShowAuth] = useState(false);
  const [previewZoomed, setPreviewZoomed] = useState(false);
  const [engravingFont, setEngravingFont] = useState<string>(ENGRAVING_FONTS[0].family);

  const currentFormat = FORMATS.find((f) => f.id === format) ?? FORMATS[0];

  useEffect(() => {
    if (user && showAuth) setShowAuth(false);
  }, [user, showAuth]);

  useEffect(() => {
    const id = "ekko-engraving-fonts";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Dancing+Script:wght@600;700&family=Bebas+Neue&family=Pacifico&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const handlePay = async () => {
    if (!user) { setShowAuth(true); return; }
    if (!consentChecked || !engraveName.trim()) return;
    setStatus("uploading");
    try {
      const uploadId = await uploadAudiosToStorage(audios);
      setStatus("redirecting");

      const payload = {
        theme,
        uploadId,
        product: "porteClef",
        engraveName: engraveName.trim(),
        engravingFont,
        format,
        material: "bois",
        // Conservation permanente incluse : le QR gravé doit rester valide
        storage: 200,
        storageLabel: "incluse",
        uid: user?.uid ?? "",
        accentColor: accent,
        email: user?.email ?? "",
      };

      const isDevUser =
        process.env.NODE_ENV === "development" ||
        (!!process.env.NEXT_PUBLIC_DEV_UID && user?.uid === process.env.NEXT_PUBLIC_DEV_UID);
      if (isDevUser) {
        const devRes = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, devBypass: true }),
        });
        const devData = await devRes.json();
        if (devData.capsuleId) {
          await storeCoverPhoto(coverPhoto);
          window.location.href = `/capsule/${devData.capsuleId}`;
          return;
        }
      }

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, coverPhotoName: coverPhoto?.name ?? null }),
      });
      const data = await res.json();
      if (data.url) {
        await storeCoverPhoto(coverPhoto);
        window.location.href = data.url;
      } else {
        setStatus("idle");
      }
    } catch (err) {
      console.error("PorteClefFinalize handlePay error:", err);
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
          Connectez-vous pour finaliser votre porte-clé
        </p>
        <AuthModal accent={accent} onSuccess={() => setShowAuth(false)} />
      </motion.div>
    );
  }

  const canPay = consentChecked && engraveName.trim().length > 0 && status === "idle";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      style={{ maxWidth: 880, margin: "0 auto", paddingTop: 24 }}
    >
      {/* Header */}
      <p style={{ fontFamily: "Georgia, serif", fontSize: 11, letterSpacing: "0.4em", textTransform: "uppercase", color: `${accent}90`, marginBottom: 8, textAlign: "center" }}>
        Finalisation du porte-clé
      </p>
      <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 300, fontSize: 30, color: "#f0e8d8", marginBottom: 8, textAlign: "center" }}>
        Gravez votre porte-clé
      </h2>
      <p style={{ fontFamily: "Georgia, serif", fontSize: 14, color: "rgba(240,232,216,0.45)", marginBottom: 36, textAlign: "center" }}>
        {audios.length} souvenir{audios.length > 1 ? "s" : ""} sélectionné{audios.length > 1 ? "s" : ""} · QR code unique gravé au laser
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }} className="pcf-grid">
        {/* Colonne gauche : aperçu */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 8 }}>
          <div
            onClick={() => setPreviewZoomed(true)}
            title="Cliquer pour agrandir"
            style={{ cursor: "zoom-in", position: "relative", display: "inline-flex" }}
          >
            <KeychainPreview format={currentFormat} name={engraveName} accent={accent} font={engravingFont} />
            <span style={{
              position: "absolute", bottom: 28, right: 0,
              fontSize: 14, opacity: 0.45, pointerEvents: "none", lineHeight: 1,
            }}>🔍</span>
          </div>
        </div>

        {/* Colonne droite : options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Format */}
          <div>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,232,216,0.4)", marginBottom: 10 }}>
              Format
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {FORMATS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 16px", borderRadius: 12, cursor: "pointer", textAlign: "left", width: "100%",
                    background: format === f.id ? `${accent}12` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${format === f.id ? accent + "55" : "rgba(255,255,255,0.07)"}`,
                    transition: "all 0.2s",
                  }}
                >
                  <span>
                    <span style={{ fontFamily: "Georgia, serif", fontSize: 14, color: format === f.id ? "#f0e8d8" : "rgba(240,232,216,0.7)", fontWeight: 500, display: "block" }}>
                      {f.name}
                    </span>
                    <span style={{ fontFamily: "Georgia, serif", fontSize: 11, fontStyle: "italic", color: "rgba(240,232,216,0.35)" }}>
                      {f.tagline} · {f.dimensions}
                    </span>
                  </span>
                  <span style={{
                    width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                    border: `1.5px solid ${format === f.id ? accent : "rgba(255,255,255,0.2)"}`,
                    background: format === f.id ? accent : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {format === f.id && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0d0a0f" }} />}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Prénom à graver */}
          <div>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,232,216,0.4)", marginBottom: 10 }}>
              Prénom à graver
            </p>
            <input
              type="text"
              value={engraveName}
              maxLength={format === "etiquette-arrondie" ? 10 : 18}
              onChange={(e) => setEngraveName(e.target.value)}
              placeholder="Ex. : Maman, Léa, Papi…"
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "13px 16px", borderRadius: 12,
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${engraveName.trim() ? accent + "45" : "rgba(255,255,255,0.1)"}`,
                color: "#f0e8d8", fontFamily: engravingFont, fontSize: 15,
                outline: "none",
              }}
            />
            <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: "rgba(240,232,216,0.3)", margin: "6px 0 0", textAlign: "right" }}>
              {engraveName.length}/18
            </p>
          </div>

          {/* Police de gravure */}
          <div>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,232,216,0.4)", marginBottom: 10 }}>
              Police de gravure
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ENGRAVING_FONTS.map((f) => {
                const selected = engravingFont === f.family;
                return (
                  <button
                    key={f.id}
                    onClick={() => setEngravingFont(f.family)}
                    style={{
                      flex: "1 1 0", minWidth: 68,
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                      padding: "10px 6px", borderRadius: 10, cursor: "pointer",
                      background: selected ? `${accent}12` : "rgba(255,255,255,0.03)",
                      border: `1px solid ${selected ? accent + "55" : "rgba(255,255,255,0.07)"}`,
                      transition: "all 0.2s",
                    }}
                  >
                    <span style={{
                      fontFamily: f.family,
                      fontSize: f.previewSize,
                      fontWeight: 700,
                      color: "#f0e8d8",
                      letterSpacing: "0.03em",
                      textTransform: "uppercase",
                      lineHeight: 1.3,
                      maxWidth: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {engraveName.trim() || "Emma"}
                    </span>
                    <span style={{
                      fontFamily: "Georgia, serif",
                      fontSize: 9,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: selected ? accent : "rgba(240,232,216,0.35)",
                      marginTop: 2,
                    }}>
                      {f.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prix + livraison */}
          <div style={{
            padding: "16px 18px", borderRadius: 14,
            background: "rgba(201,169,110,0.05)", border: "1px solid rgba(201,169,110,0.18)",
            display: "flex", flexDirection: "column", gap: 8,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "rgba(240,232,216,0.55)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Porte-clé {currentFormat.name} · bois
              </span>
              <span style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 300, color: accent }}>
                {PRICE_EUR.toFixed(2).replace(".", ",")} €
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {["Gravure laser", "Anneau inox", "QR code unique", "Conservation incluse", "Expédition gratuite"].map((t) => (
                <span key={t} style={{ fontFamily: "Georgia, serif", fontSize: 11, color: "rgba(240,232,216,0.5)" }}>✦ {t}</span>
              ))}
            </div>
          </div>

          {/* Consentement */}
          <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", padding: "14px 16px", borderRadius: 12, background: consentChecked ? `${accent}0a` : "rgba(255,255,255,0.03)", border: `1px solid ${consentChecked ? accent + "35" : "rgba(255,255,255,0.08)"}`, transition: "all 0.2s" }}>
            <span
              onClick={() => setConsentChecked((v) => !v)}
              style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1, border: `1.5px solid ${consentChecked ? accent : "rgba(255,255,255,0.25)"}`, background: consentChecked ? accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {consentChecked && (
                <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                  <path d="M1 4L4 7L10 1" stroke="#0d0a0f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <p className="ekko-serif" style={{ fontSize: 11, color: "rgba(240,232,216,0.55)", lineHeight: 1.65, margin: 0 }} onClick={() => setConsentChecked((v) => !v)}>
              J&apos;accepte que la fabrication de mon porte-clé personnalisé commence après le paiement et je reconnais que, ce produit étant gravé sur mesure, je renonce à mon{" "}
              <a href="/cgv" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: accent, textDecoration: "underline", textUnderlineOffset: 2 }}>
                droit de rétractation
              </a>{" "}
              conformément aux{" "}
              <a href="/cgv" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: accent, textDecoration: "underline", textUnderlineOffset: 2 }}>
                CGV
              </a>.
            </p>
          </label>

          {/* Bouton paiement */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <motion.button
              whileHover={canPay ? { scale: 1.02 } : {}}
              whileTap={canPay ? { scale: 0.98 } : {}}
              onClick={handlePay}
              disabled={!canPay}
              style={{
                width: "100%", padding: "16px 0", borderRadius: 16,
                background: canPay ? `linear-gradient(135deg, ${accent}60, ${accent}90)` : "rgba(255,255,255,0.05)",
                border: `1px solid ${canPay ? accent + "60" : "rgba(255,255,255,0.08)"}`,
                color: canPay ? "#fff" : "rgba(240,232,216,0.25)",
                fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 500, letterSpacing: "0.05em",
                cursor: !canPay ? "not-allowed" : "pointer",
                boxShadow: canPay ? `0 8px 32px ${accent}30` : "none",
                transition: "all 0.25s",
              }}
            >
              {status === "uploading"
                ? "Préparation de votre commande…"
                : status === "redirecting"
                  ? "Redirection vers le paiement…"
                  : `Commander mon porte-clé — ${PRICE_EUR.toFixed(2).replace(".", ",")} €`}
            </motion.button>
            <p className="ekko-serif" style={{ fontSize: 11, color: "rgba(240,232,216,0.25)", margin: 0, fontStyle: "italic", textAlign: "center" }}>
              Adresse de livraison demandée à l&apos;étape suivante · Paiement sécurisé
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {previewZoomed && (
          <motion.div
            key="zoom-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setPreviewZoomed(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 9999,
              background: "rgba(13,10,15,0.93)",
              backdropFilter: "blur(10px)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              cursor: "zoom-out",
            }}
          >
            <motion.div
              initial={{ scale: 0.72, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.72, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              style={{ display: "inline-block" }}
            >
              <div style={{ transform: "scale(1.85)", transformOrigin: "center center", display: "inline-block" }}>
                <KeychainPreview format={currentFormat} name={engraveName} accent={accent} font={engravingFont} />
              </div>
            </motion.div>
            <p style={{
              marginTop: 28,
              fontFamily: "Georgia, serif", fontSize: 11, fontStyle: "italic",
              letterSpacing: "0.14em", color: "rgba(240,232,216,0.28)",
              pointerEvents: "none",
            }}>
              Appuyer pour fermer
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 760px) {
          .pcf-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
        }
      `}</style>
    </motion.div>
  );
}

/** Stocke la photo de couverture en sessionStorage (uploadée après paiement) */
async function storeCoverPhoto(coverPhoto?: File | null) {
  if (!coverPhoto) return;
  try {
    const reader = new FileReader();
    await new Promise<void>((resolve) => {
      reader.onload = () => {
        sessionStorage.setItem("ekko_cover_photo", reader.result as string);
        sessionStorage.setItem("ekko_cover_photo_name", coverPhoto.name);
        sessionStorage.setItem("ekko_cover_photo_type", coverPhoto.type);
        resolve();
      };
      reader.readAsDataURL(coverPhoto);
    });
  } catch { /* ignore */ }
}
