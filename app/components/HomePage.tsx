"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BlobBackground from "./BlobBackground";
import ThemeCard from "./ThemeCard";

/* ─── Navigation ─────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { text: "Comment ça marche", href: "/comment-ca-marche" },
  { text: "Idées cadeaux", href: "/idees-cadeaux" },
  { text: "FAQ", href: "/faq" },
  { text: "Blog", href: "/blog" },
];

const PRODUITS_DROPDOWN = [
  { text: "Fichier numérique", href: "/numerique" },
  { text: "Porte-clé", href: "/produit" },
];

const MOBILE_NAV_CATEGORIES = [
  {
    label: "Produits",
    links: [
      { text: "Fichier numérique", href: "/numerique" },
      { text: "Porte-clé", href: "/produit" },
    ],
  },
  {
    label: "Explorer",
    links: [
      { text: "Comment ça marche", href: "/comment-ca-marche" },
      { text: "Idées cadeaux", href: "/idees-cadeaux" },
    ],
  },
  {
    label: "Aide",
    links: [
      { text: "FAQ", href: "/faq" },
      { text: "Blog", href: "/blog" },
    ],
  },
  {
    label: "Compte",
    links: [
      { text: "Mon espace", href: "/compte" },
    ],
  },
];

/* ─── Features bar ───────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none" style={{ width: 28, height: 28 }}>
        <rect x="4" y="4" width="24" height="24" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <rect x="8" y="8" width="6" height="6" rx="1" fill="currentColor" opacity="0.6" />
        <rect x="18" y="8" width="6" height="6" rx="1" fill="currentColor" opacity="0.6" />
        <rect x="8" y="18" width="6" height="6" rx="1" fill="currentColor" opacity="0.6" />
        <rect x="18" y="18" width="4" height="4" rx="1" fill="currentColor" opacity="0.3" />
      </svg>
    ),
    title: "QR gravé",
    desc: "Gravé dans le bois. Toujours lisible.",
  },
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none" style={{ width: 28, height: 28 }}>
        <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 16 C12 12 20 12 20 16 C20 20 12 20 12 16" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <circle cx="16" cy="16" r="3" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
    title: "NFC intégré",
    desc: "Approchez. Écoutez. Aucune app nécessaire.",
  },
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none" style={{ width: 28, height: 28 }}>
        <path d="M8 28 L8 8 C8 6 10 4 12 4 L20 4 C22 4 24 6 24 8 L24 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M6 28 L26 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="12" y="10" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      </svg>
    ),
    title: "Fabriqué pour durer",
    desc: "Bois massif, finitions premium. Conçu pour vous accompagner.",
  },
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none" style={{ width: 28, height: 28 }}>
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5" />
        <polygon points="13,10 23,16 13,22" fill="currentColor" opacity="0.6" />
      </svg>
    ),
    title: "Réécoute instantanée",
    desc: "Vos vocaux, disponibles à tout moment.",
  },
];

/* ─── Étapes ─────────────────────────────────────────────────────────── */
const STEPS_PORTE_CLEF = [
  {
    number: "1",
    title: "Sélectionnez vos vocaux",
    desc: "Choisissez les messages vocaux qui comptent le plus pour vous.",
    img: "/images/steps/ChatGPT Image 20 mai 2026, 19_52_10.png",
  },
  {
    number: "2",
    title: "Nous créons votre vocapsule",
    desc: "Nous sécurisons vos enregistrements et les associons à votre porte-clé unique.",
    img: "/images/steps/step2_gravure.png",
  },
  {
    number: "3",
    title: "Recevez votre porte-clé à scanner",
    desc: "Scannez le QR code ou approchez le NFC. Écoutez. Ressentez.",
    img: "/images/steps/ChatGPT Image 20 mai 2026, 19_46_58.png",
  },
];

const STEPS_NUMERIQUE = [
  {
    number: "1",
    title: "Sélectionnez vos fichiers audio",
    desc: "Choisissez les messages vocaux qui comptent le plus pour vous.",
    img: "/images/steps/ChatGPT Image 20 mai 2026, 19_52_10.png",
  },
  {
    number: "2",
    title: "Nous créons votre vocapsule numérique",
    desc: "Nous sécurisons vos enregistrements dans un fichier audio unique.",
    img: "/images/steps/step2_numerique (2).png",
  },
  {
    number: "3",
    title: "Recevez instantanément votre fichier",
    desc: "Écoutez. Téléchargez. Partagez. Offrez. Votre souvenir sonore est prêt.",
    img: "/images/steps/step3-numérique.png",
  },
];

/* ─── Thèmes ─────────────────────────────────────────────────────────── */
const THEMES = [
  {
    id: "amour",
    title: "Amour & intimité",
    tagline: "Et si vous lui offriez vos plus beaux instants à réécouter ?",
    desc: "Ces vocaux qu’on réécoute, ces messages du soir, ces premiers « je t’aime » qu’on n’oublie pas. Créez un souvenir audio de votre histoire, rien que pour vous deux.",
    img: "/images/themes/theme_couple.png",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" style={{ width: 24, height: 24 }}>
        <path d="M16 28 C16 28 4 20 4 12 C4 8 7 4 11 4 C13.5 4 15.5 5.5 16 7 C16.5 5.5 18.5 4 21 4 C25 4 28 8 28 12 C28 20 16 28 16 28Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.15" />
      </svg>
    ),
    accent: "#c4407a",
  },
  {
    id: "deuil",
    title: "Mémoire éternelle",
    tagline: "Et si vous pouviez garder sa voix pour toujours ?",
    desc: "Créez une capsule audio avec les messages d’une personne qui compte, pour pouvoir la réécouter quand vous en ressentez le besoin.",
    img: "/images/themes/theme_deuil.png",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" style={{ width: 24, height: 24 }}>
        <path d="M16 4 L18 12 L26 12 L20 17 L22 26 L16 21 L10 26 L12 17 L6 12 L14 12Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.15" />
      </svg>
    ),
    accent: "#1fa896",
  },
  {
    id: "amitie",
    title: "Amitiés & joie",
    tagline: "Et si vos fous rires ne disparaissaient jamais ?",
    desc: "Gardez vos délires, vos fous rires et vos moments cultes dans une capsule audio à partager entre amis.",
    img: "/images/themes/theme_amitie.png",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" style={{ width: 24, height: 24 }}>
        <circle cx="10" cy="14" r="6" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="22" cy="14" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 28 C4 22 8 20 10 20 C12 20 14 21 16 21 C18 21 20 20 22 20 C24 20 28 22 28 28" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.1" />
      </svg>
    ),
    accent: "#d4752a",
  },
];

/* ─── Specs produit ──────────────────────────────────────────────────── */
const PRODUCT_SPECS = [
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none" style={{ width: 24, height: 24 }}>
        <path d="M4 28 L4 8 C4 6 6 4 8 4 L24 4 C26 4 28 6 28 8 L28 28 L4 28Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 14 L22 14" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        <path d="M10 18 L18 18" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      </svg>
    ),
    label: "Bois massif naturel",
  },
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none" style={{ width: 24, height: 24 }}>
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 8 L16 16 L22 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    label: "Gravure laser haute précision",
  },
  {
    icon: (
      <svg viewBox="0 0 32 32" fill="none" style={{ width: 24, height: 24 }}>
        <circle cx="16" cy="16" r="6" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1" opacity="0.3" />
        <circle cx="16" cy="16" r="2" fill="currentColor" opacity="0.5" />
      </svg>
    ),
    label: "NFC intégré invisible",
  },
];

/* ─── Footer links ───────────────────────────────────────────────────── */
const FOOTER_COLS = [
  {
    title: "Produits",
    links: [
      { text: "Fichier numérique", href: "/numerique" },
      { text: "Porte-clé", href: "/produit" },
      { text: "Comment ça marche", href: "/comment-ca-marche" },
      { text: "Idées cadeaux", href: "/idees-cadeaux" },
    ],
  },
  {
    title: "Aide",
    links: [
      { text: "FAQ", href: "/faq" },
      { text: "Livraison & retours", href: "/livraison" },
      { text: "Nous contacter", href: "mailto:vosekko@outlook.com" },
    ],
  },
  {
    title: "À propos",
    links: [
      { text: "Notre histoire", href: "/a-propos" },
      { text: "Blog", href: "/blog" },
      { text: "CGV", href: "/cgv" },
      { text: "Mentions légales", href: "/rgpd" },
    ],
  },
];

export default function HomePage() {
  const [isMobile, setIsMobile] = useState(false);
  const [openCat, setOpenCat] = useState<number | null>(null);
  const [openProduits, setOpenProduits] = useState(false);
  const [selectedMode, setSelectedMode] = useState<"porte-clef" | "numerique">("porte-clef");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 700);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const font = "Georgia, serif";
  const gold = "#c9a96e";
  const cream = "#f0e8d8";

  return (
    <div style={{ position: "relative", minHeight: "100vh", width: "100%", overflowX: "hidden" }}>
      <style>{`
        @media (max-width: 768px) {
          .hp-nav-links { display: none !important; }
          .hp-hero-inner { flex-direction: column !important; text-align: center !important; padding: 40px 20px !important; }
          .hp-hero-text { align-items: center !important; }
          .hp-hero-visual { justify-content: center !important; }
          .hp-features-bar { flex-wrap: wrap !important; gap: 24px !important; padding: 40px 20px !important; }
          .hp-features-bar > div { flex: 1 1 140px !important; }
          .hp-steps-grid { flex-direction: column !important; gap: 32px !important; padding: 0 20px !important; }
          .hp-step-arrow { display: none !important; }
        }
        .hp-step-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease !important;
        }
        .hp-step-card:hover {
          transform: translateY(-8px) !important;
          box-shadow: 0 20px 60px rgba(201,169,110,0.22), 0 0 0 1px rgba(201,169,110,0.3) !important;
          border-color: rgba(201,169,110,0.32) !important;
        }
        .hp-steps-cta {
          transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease !important;
        }
        .hp-steps-cta:hover {
          transform: translateY(-2px) scale(1.015) !important;
          box-shadow: 0 6px 20px rgba(201,169,110,0.25) !important;
          filter: brightness(1.06) !important;
        }
        .hp-steps-cta:active {
          transform: translateY(0) scale(0.98) !important;
        }
        .hp-mode-toggle {
          transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease, background 0.2s ease !important;
        }
        .hp-mode-toggle:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 20px rgba(201,169,110,0.22) !important;
          filter: brightness(1.06) !important;
        }
        .hp-mode-toggle:active {
          transform: translateY(0) !important;
        }
        @media (max-width: 768px) {
          .hp-reviews-grid { grid-template-columns: 1fr !important; padding: 0 20px !important; }
          .hp-themes-grid { grid-template-columns: 1fr !important; padding: 0 20px !important; }
          .hp-detail-inner { flex-direction: column !important; padding: 60px 20px !important; }
          .hp-detail-visual { display: none !important; }
          .hp-gift-inner { flex-direction: column !important; padding: 60px 20px !important; }
          .hp-footer-inner { flex-direction: column !important; gap: 32px !important; padding: 40px 20px !important; }
          .hp-footer-cols { flex-direction: column !important; gap: 24px !important; }
        }
        .voca-wrap { position: relative; display: inline; }
        .voca-sup { font-size: 9px; color: #c9a96e; cursor: help; vertical-align: super; line-height: 0; }
        .voca-tooltip {
          display: none;
          position: absolute; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%);
          background: rgba(18,14,22,0.98); border: 1px solid rgba(201,169,110,0.3);
          padding: 10px 14px; border-radius: 10px; width: 240px;
          font-size: 11px; font-style: italic; color: rgba(240,232,216,0.8); line-height: 1.6;
          white-space: normal; z-index: 200;
          pointer-events: none;
        }
        .voca-tooltip::after {
          content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
          border: 6px solid transparent; border-top-color: rgba(201,169,110,0.3);
        }
        .voca-wrap:hover .voca-tooltip { display: block; }
        .hp-hero-btn-primary {
          display: inline-block; padding: 20px 48px; border-radius: 6px;
          background: linear-gradient(135deg, #c9a96e, #b08940);
          font-family: Georgia, serif; font-size: 13px; font-weight: 600; letter-spacing: 0.2em;
          text-transform: uppercase; color: #1a1418; text-decoration: none;
          width: 100%; text-align: center; transition: opacity 0.2s;
          box-sizing: border-box;
        }
        .hp-hero-btn-primary:hover { opacity: 0.88; }
        .hp-hero-btn-secondary-outline {
          display: inline-block; padding: 20px 48px; border-radius: 6px;
          border: 1px solid rgba(201,169,110,0.55);
          font-family: Georgia, serif; font-size: 13px; font-weight: 600; letter-spacing: 0.2em;
          text-transform: uppercase; color: #c9a96e; text-decoration: none;
          width: 100%; text-align: center; transition: background 0.2s, opacity 0.2s;
          background: rgba(201,169,110,0.06);
          box-sizing: border-box;
        }
        .hp-hero-btn-secondary-outline:hover { background: rgba(201,169,110,0.13); }
      `}</style>
      <BlobBackground variant="home" />

      {/* ═══ BLOC UNIFIÉ : nav + hero + features sur même fond ═══ */}
      <div style={{ position: "relative", zIndex: 10, overflow: "hidden", background: "rgb(10,8,12)" }}>
        {/* Image de fond — droite, décalage léger */}
        <img
          src="/images/hero/hero-ekko-porteclef.jpg"
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute", top: 0, right: 0, bottom: 0,
            width: "72%", height: "100%",
            objectFit: "cover", objectPosition: "left center",
            zIndex: 0,
          }}
        />
        {/* Fondu de transition gauche → image droite */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: "linear-gradient(90deg, rgba(10,8,12,1) 0%, rgba(10,8,12,1) 28%, rgba(10,8,12,0.82) 44%, rgba(10,8,12,0.2) 65%, transparent 100%)",
        }} />
        {/* Fondu bas */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "25%", zIndex: 1,
          background: "linear-gradient(to bottom, transparent 0%, rgba(10,8,12,0.7) 70%, rgba(10,8,12,1) 100%)",
        }} />

      {/* ═══════════════ NAV ═══════════════ */}
      <nav style={{
        position: "relative", zIndex: 500, width: "100%",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 48px", boxSizing: "border-box",
      }} className="hp-nav">
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            <span style={{
              fontFamily: "Georgia, serif", fontSize: isMobile ? 22 : 28,
              fontWeight: 400, letterSpacing: "0.12em", textTransform: "uppercase",
              color: "#c9a96e", lineHeight: 1,
            }}>VOS</span>
            <img src="/ekko-logo.png" alt="EKKO" style={{ height: isMobile ? 50 : 70, width: "auto", objectFit: "contain", mixBlendMode: "screen" }} />
          </a>
          <p style={{ fontFamily: font, fontSize: 9, letterSpacing: "0.38em", textTransform: "uppercase", color: "rgba(201,169,110,0.55)", margin: 0, paddingLeft: 4 }}>
            Vos émotions, à portée de main.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }} className="hp-nav-links">
          {/* Dropdown Produits */}
          <div
            style={{ position: "relative" }}
            onMouseEnter={() => setOpenProduits(true)}
            onMouseLeave={() => setOpenProduits(false)}
          >
            <button style={{
              fontFamily: font, fontSize: 12, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase",
              color: openProduits ? "#e8c98a" : "rgba(187,178,156,0.88)",
              background: "none", border: "none", cursor: "pointer",
              padding: 0, transition: "color 0.2s", display: "flex", alignItems: "center", gap: 5,
            }}>
              Produits
              <svg viewBox="0 0 10 6" fill="none" style={{ width: 8, height: 8, transition: "transform 0.2s", transform: openProduits ? "rotate(180deg)" : "rotate(0deg)" }}>
                <path d="M1 1 L5 5 L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <AnimatePresence>
              {openProduits && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: "absolute", top: "calc(100% + 10px)", left: "50%",
                    transform: "translateX(-50%)",
                    background: "rgb(18,14,22)",
                    border: "1px solid rgba(201,169,110,0.25)", borderRadius: 12,
                    padding: "8px 6px", minWidth: 180,
                    display: "flex", flexDirection: "column", gap: 2,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                    zIndex: 600,
                  }}
                >
                  {PRODUITS_DROPDOWN.map((item) => (
                    <a key={item.href} href={item.href} style={{
                      fontFamily: font, fontSize: 12, fontWeight: 600, letterSpacing: "0.16em",
                      textTransform: "uppercase", color: "rgba(187,178,156,0.88)",
                      textDecoration: "none", padding: "10px 16px", borderRadius: 8,
                      transition: "background 0.15s, color 0.15s",
                      display: "block",
                    }}
                    onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "rgba(201,169,110,0.08)"; (e.target as HTMLElement).style.color = "#c9a96e"; }}
                    onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "transparent"; (e.target as HTMLElement).style.color = "rgba(187,178,156,0.88)"; }}
                    >{item.text}</a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} style={{
              fontFamily: font, fontSize: 12, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase",
              color: "rgba(187,178,156,0.88)", textDecoration: "none", transition: "color 0.2s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#e8c98a"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(187,178,156,0.88)"; }}
            >{l.text}</a>
          ))}
          <a href="/compte" style={{
            fontFamily: font, fontSize: 12, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase",
            color: "rgba(187,178,156,0.88)", textDecoration: "none", display: "flex", alignItems: "center", gap: 6,
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#e8c98a"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(187,178,156,0.88)"; }}
          >
            <svg viewBox="0 0 20 20" fill="none" style={{ width: 14, height: 14 }}>
              <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
              <path d="M2 18 C2 14 6 12 10 12 C14 12 18 14 18 18" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            Mon compte
          </a>
        </div>
      </nav>

      {/* Nav mobile */}
      {isMobile && (
        <div style={{
          position: "relative", zIndex: 200, width: "100%",
          display: "flex", justifyContent: "center", gap: 16,
          padding: "0 16px", marginTop: 4,
        }}>
          {MOBILE_NAV_CATEGORIES.map((cat, i) => (
            <div key={cat.label} style={{ position: "relative" }}>
              <button
                onClick={() => setOpenCat(openCat === i ? null : i)}
                style={{
                  fontFamily: font, fontSize: 13, fontWeight: 500, letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: openCat === i ? gold : "rgba(240,232,216,0.8)",
                  background: "none", border: "none", padding: "8px 12px",
                  cursor: "pointer", transition: "color 0.2s",
                  display: "block",
                }}
              >{cat.label}</button>
              <AnimatePresence>
                {openCat === i && (
                  /* Wrapper positionneur — séparé de l'animation pour ne pas écraser translateX */
                  <div style={{
                    position: "absolute", top: "100%", left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 200,
                  }}>
                    <motion.div
                      initial={{ opacity: 0, scaleY: 0.9 }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      exit={{ opacity: 0, scaleY: 0.9 }}
                      transition={{ duration: 0.18 }}
                      style={{
                        transformOrigin: "top center",
                        background: "rgb(18,14,22)",
                        border: "1px solid rgba(201,169,110,0.3)", borderRadius: 14,
                        padding: "8px 6px", minWidth: 170,
                        display: "flex", flexDirection: "column", gap: 2,
                        boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
                      }}
                    >
                      {cat.links.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          onClick={() => setOpenCat(null)}
                          style={{
                            fontFamily: font, fontSize: 14,
                            color: "rgba(240,232,216,0.9)",
                            textDecoration: "none", padding: "12px 16px", borderRadius: 10,
                            display: "block",
                          }}
                        >{link.text}</a>
                      ))}
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════ HERO ═══════════════ */}
      <section style={{
        position: "relative", zIndex: 2,
        width: "100%", minHeight: "72vh",
        display: "flex", alignItems: "center",
      }}>

        {/* Conteneur héro */}
        <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 1200, margin: "0" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 32, padding: "60px 56px", alignItems: "flex-end" }} className="hp-hero-inner">
            {/* Ligne 1 : vidéo + texte côte à côte, même taille */}
            <div style={{ display: "flex", gap: 24, alignItems: "stretch" }}>
              {/* Vidéo */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9 }}
                className="hp-hero-visual"
                style={{ flexShrink: 0 }}
              >
                <div style={{
                  width: 240, height: 290, borderRadius: 20, overflow: "hidden",
                  border: "1px solid rgba(201,169,110,0.22)",
                  boxShadow: "0 0 40px rgba(201,169,110,0.08)",
                }}>
                  <video
                    autoPlay muted loop playsInline preload="metadata"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  >
                    <source src="/images/video/Replace_name_on_smartphone_screen_202606022004.mp4" type="video/mp4" />
                  </video>
                </div>
              </motion.div>
              {/* Texte — même largeur et hauteur que le conteneur vidéo, fond transparent sans bordure */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9 }}
                className="hp-hero-text"
                style={{ flexShrink: 0 }}
              >
                <div style={{
                  width: 240, height: 290,
                  display: "flex", alignItems: "center", padding: "0 8px",
                  boxSizing: "border-box",
                }}>
                  <p style={{
                    fontFamily: font, fontSize: 14, lineHeight: 1.8,
                    color: "rgba(240,232,216,0.65)", margin: 0,
                  }}>
                    Choisissez les voix qui comptent. Transformez vos messages vocaux préférés en{" "}
                    <span className="voca-wrap">
                      vocapsule
                      <span className="voca-sup">*</span>
                      <span className="voca-tooltip">
                        Découvrez ce qu&apos;est une vocapsule dans la page &laquo;&nbsp;Comment ça marche&nbsp;&raquo;.
                      </span>
                    </span>
                    {" "}: un souvenir sonore à télécharger ou à garder sur un porte-clé en bois gravé.
                  </p>
                </div>
              </motion.div>
            </div>
            {/* Ligne 2 : boutons centrés sous les deux conteneurs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: 12, width: 504, alignItems: "stretch" }}
            >
              <a href="/produit" className="hp-hero-btn-primary">
                Créer mon porte-clé
              </a>
              <a href="/numerique" className="hp-hero-btn-secondary-outline">
                Créer mon fichier numérique
              </a>
              <a href="/comment-ca-marche" style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                fontFamily: font, fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase",
                color: "rgba(240,232,216,0.5)", textDecoration: "none", marginTop: 4,
              }}>
                <span style={{
                  width: 28, height: 28, borderRadius: "50%", border: "1px solid rgba(240,232,216,0.25)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                }}>+</span>
                Découvrir comment ça marche
              </a>
            </motion.div>
          </div>
        </div>

        {/* Note bas droite */}
        <p style={{
          position: "absolute", right: 32, bottom: 24, zIndex: 2, maxWidth: 180,
          fontFamily: font, fontSize: 11, fontStyle: "italic", lineHeight: 1.6,
          color: "rgba(240,232,216,0.3)", textAlign: "right", margin: 0,
        }}>
          Scannez le QR code ou approchez un smartphone compatible NFC pour ouvrir votre vocapsule.
        </p>
      </section>
      </div>{/* fin bloc unifié */}

      {/* ═══════════════ BARRE FEATURES — transition couleur ═══════════════ */}
      <section style={{
        position: "relative", zIndex: 10,
        background: "linear-gradient(to bottom, rgba(10,8,12,1) 0%, rgba(10,8,12,0.85) 35%, rgba(10,8,12,0.45) 65%, rgba(10,8,12,0) 100%)",
        borderBottom: "1px solid rgba(201,169,110,0.06)",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          padding: "48px 56px", gap: 40,
        }} className="hp-features-bar">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                textAlign: "center", gap: 10,
              }}
            >
              <span style={{ color: gold }}>{f.icon}</span>
              <h3 style={{
                fontFamily: font, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
                color: cream, fontWeight: 500, margin: 0,
              }}>{f.title}</h3>
              <p style={{
                fontFamily: font, fontSize: 11, lineHeight: 1.6,
                color: "rgba(240,232,216,0.35)", margin: 0,
              }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════ THÈMES : VOS UNIVERS ═══════════════ */}
      <section style={{
        position: "relative", zIndex: 10,
        padding: "80px 56px", textAlign: "center",
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: 48 }}
        >
          <h2 style={{
            fontFamily: font, fontWeight: 300,
            fontSize: "clamp(2.2rem, 5vw, 3.2rem)", lineHeight: 1.15,
            color: cream, margin: "0 0 12px",
          }}>
            La voix qu&apos;on garde{" "}
            <em style={{ fontStyle: "italic", color: gold }}>sur soi.</em>
          </h2>
          <p style={{
            fontFamily: font, fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase",
            color: "rgba(201,169,110,0.5)", marginBottom: 0,
          }}>Vos univers. Vos émotions.</p>
        </motion.div>

        <div style={{
          maxWidth: 1000, margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20,
        }} className="hp-themes-grid">
          {THEMES.map((theme, i) => (
            <motion.div
              key={theme.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              style={{
                display: "flex", flexDirection: "column",
                borderRadius: 20, overflow: "hidden",
                background: "rgba(20,16,24,0.6)", border: "1px solid rgba(201,169,110,0.12)",
              }}
            >
              {/* Image thème */}
              <div style={{
                width: "100%", aspectRatio: "16/10", overflow: "hidden", position: "relative",
              }}>
                {theme.img ? (
                  <img
                    src={theme.img}
                    alt={theme.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
                  />
                ) : (
                  <div style={{
                    width: "100%", height: "100%",
                    background: "linear-gradient(135deg, rgba(201,169,110,0.08), rgba(20,16,24,0.4))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontFamily: font, fontSize: 10, fontStyle: "italic", color: `${gold}30` }}>Photo à venir</span>
                  </div>
                )}
              </div>
              <div style={{ padding: "20px 24px 28px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                <p style={{
                  fontFamily: font, fontSize: 13, fontStyle: "italic", lineHeight: 1.55,
                  color: theme.accent, margin: 0, minHeight: "2.6em",
                }}>{theme.tagline}</p>
                <h3 style={{
                  fontFamily: font, fontSize: 17, fontWeight: 700, color: cream,
                  margin: 0,
                }}>{theme.title}</h3>
                <p style={{
                  fontFamily: font, fontSize: 13, lineHeight: 1.65,
                  color: "rgba(240,232,216,0.6)", margin: 0, flex: 1,
                }}>{theme.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════ COMMENT ÇA MARCHE ═══════════════ */}
      <section style={{
        position: "relative", zIndex: 10,
        padding: "100px 56px 80px", textAlign: "center",
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p style={{
            fontFamily: font, fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase",
            color: "rgba(201,169,110,0.5)", marginBottom: 16,
          }}>Comment ça marche</p>
          <h2 style={{
            fontFamily: font, fontWeight: 300, fontSize: "clamp(1.4rem, 3vw, 2rem)",
            color: cream, marginBottom: 32,
          }}>
            Trois étapes, un souvenir éternel.
          </h2>
        </motion.div>

        {/* Toggle boutons */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 12,
          marginBottom: 48,
        }}>
          <button
            onClick={() => setSelectedMode("porte-clef")}
            style={{
              padding: "12px 28px",
              fontFamily: font, fontSize: 12, fontWeight: 500,
              letterSpacing: "0.12em", textTransform: "uppercase",
              background: selectedMode === "porte-clef" ? "linear-gradient(135deg, #c9a96e, #b08940)" : "rgba(201,169,110,0.08)",
              color: selectedMode === "porte-clef" ? "#1a1418" : "#c9a96e",
              border: selectedMode === "porte-clef" ? "none" : "1px solid rgba(201,169,110,0.4)",
              borderRadius: 6,
              cursor: "pointer",
            }}
            className="hp-mode-toggle"
          >
            Porte-clé
          </button>
          <button
            onClick={() => setSelectedMode("numerique")}
            style={{
              padding: "12px 28px",
              fontFamily: font, fontSize: 12, fontWeight: 500,
              letterSpacing: "0.12em", textTransform: "uppercase",
              background: selectedMode === "numerique" ? "linear-gradient(135deg, #c9a96e, #b08940)" : "rgba(201,169,110,0.08)",
              color: selectedMode === "numerique" ? "#1a1418" : "#c9a96e",
              border: selectedMode === "numerique" ? "none" : "1px solid rgba(201,169,110,0.4)",
              borderRadius: 6,
              cursor: "pointer",
            }}
            className="hp-mode-toggle"
          >
            Vocapsule numérique
          </button>
        </div>

        <div style={{
          maxWidth: 1000, margin: "0 auto",
          display: "flex", alignItems: "stretch", justifyContent: "center", gap: 20,
        }} className="hp-steps-grid">
          {(selectedMode === "porte-clef" ? STEPS_PORTE_CLEF : STEPS_NUMERIQUE).map((step: { number: string; title: string; desc: string; img: string }, i: number) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              style={{
                flex: 1, maxWidth: 320,
                borderRadius: 20,
                display: "flex", flexDirection: "column",
                background: "rgba(10,8,12,0.95)",
                border: "1px solid rgba(201,169,110,0.1)",
                cursor: "default",
                overflow: "hidden",
              }}
              className="hp-step-card"
            >
              {/* Cas spécial : image en fond (card 2 numérique avec espace visuel en haut) */}
              {selectedMode === "numerique" && i === 1 && step.img ? (
                <div style={{ position: "relative", flex: 1, minHeight: 420 }}>
                  <img src={step.img} alt={step.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,8,12,0.88) 0%, rgba(10,8,12,0.6) 45%, rgba(10,8,12,0.1) 100%)", pointerEvents: "none" }} />
                  <div style={{ position: "relative", zIndex: 2, padding: "28px 24px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center" }}>
                    <span style={{ fontFamily: font, fontSize: 30, fontWeight: 300, color: gold, opacity: 0.7, lineHeight: 1 }}>{step.number}.</span>
                    <h3 style={{ fontFamily: font, fontSize: 14, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: cream, margin: 0 }}>{step.title}</h3>
                    <p style={{ fontFamily: font, fontSize: 14, lineHeight: 1.7, color: "rgba(240,232,216,0.72)", margin: 0, marginTop: 20 }}>{step.desc}</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Bloc texte en haut */}
                  <div style={{ padding: "28px 24px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center" }}>
                    <span style={{ fontFamily: font, fontSize: 30, fontWeight: 300, color: gold, opacity: 0.7, lineHeight: 1 }}>{step.number}.</span>
                    <h3 style={{ fontFamily: font, fontSize: 14, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: cream, margin: 0 }}>{step.title}</h3>
                    <p style={{ fontFamily: font, fontSize: 14, lineHeight: 1.7, color: "rgba(240,232,216,0.72)", margin: 0, marginTop: 20 }}>{step.desc}</p>
                  </div>
                  {/* Image en bas si elle existe */}
                  {step.img && (
                    <div style={{ flex: 1, minHeight: 300, position: "relative", overflow: "hidden" }}>
                      <img src={step.img} alt={step.title} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center", display: "block" }} />
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "55%", background: "linear-gradient(to bottom, rgba(10,8,12,0.95) 0%, rgba(10,8,12,0.5) 40%, transparent 100%)", pointerEvents: "none" }} />
                    </div>
                  )}
                  {/* Card sans image : fond stylisé */}
                  {!step.img && (
                    <div style={{ flex: 1, minHeight: 300, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 60% 70%, rgba(201,169,110,0.07) 0%, transparent 70%)" }} />
                      <svg viewBox="0 0 80 80" fill="none" style={{ width: 64, height: 64, opacity: 0.18 }}>
                        <circle cx="40" cy="40" r="38" stroke="#c9a96e" strokeWidth="1"/>
                        <path d="M28 40h24M40 28v24" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          ))}
        </div>

        {selectedMode === "porte-clef" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ textAlign: "center", marginTop: 48 }}
          >
            <a href="/produit" className="hp-steps-cta" style={{
              display: "inline-block", padding: "18px 52px", borderRadius: 6,
              background: "linear-gradient(135deg, #c9a96e, #b08940)",
              fontFamily: font, fontSize: 13, fontWeight: 600,
              letterSpacing: "0.2em", textTransform: "uppercase",
              color: "#1a1418", textDecoration: "none",
            }}>
              Créer mon porte-clé
            </a>
          </motion.div>
        )}
        {selectedMode === "numerique" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ textAlign: "center", marginTop: 48 }}
          >
            <a href="/numerique" className="hp-steps-cta" style={{
              display: "inline-block", padding: "18px 52px", borderRadius: 6,
              background: "linear-gradient(135deg, #c9a96e, #b08940)",
              fontFamily: font, fontSize: 13, fontWeight: 600,
              letterSpacing: "0.2em", textTransform: "uppercase",
              color: "#1a1418", textDecoration: "none",
            }}>
              Créer ma vocapsule numérique
            </a>
          </motion.div>
        )}
      </section>

      {/* ═══════════════ AVIS CLIENTS ═══════════════ */}
      <section style={{
        position: "relative", zIndex: 10,
        borderTop: "1px solid rgba(201,169,110,0.08)",
        padding: "100px 56px 80px", textAlign: "center",
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: 56 }}
        >
          <p style={{
            fontFamily: font, fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase",
            color: "rgba(201,169,110,0.5)", marginBottom: 16,
          }}>Témoignages</p>
          <h2 style={{
            fontFamily: font, fontWeight: 300, fontSize: "clamp(1.4rem, 3vw, 2rem)",
            color: cream, margin: 0,
          }}>Ils ont créé leur souvenir.</h2>
        </motion.div>

        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20,
        }} className="hp-reviews-grid">
          {[
            {
              name: "Sophie M.",
              role: "Offert à sa mère",
              text: "Ma mère a fondu en larmes quand elle a scanné le QR code et entendu les voix de toute la famille. Un cadeau qu'elle garde précieusement.",
              stars: 5,
            },
            {
              name: "Thomas R.",
              role: "Anniversaire de mariage",
              text: "J'ai rassemblé les messages vocaux de nos proches pour l'anniversaire de nos 10 ans. Le résultat est magnifique, le bois est d'une qualité exceptionnelle.",
              stars: 5,
            },
            {
              name: "Camille D.",
              role: "En souvenir d'un proche",
              text: "Après le décès de mon père, j'ai créé une vocapsule avec ses derniers messages. Ce porte-clé me permet de garder sa voix pour toujours.",
              stars: 5,
            },
            {
              name: "Lucas B.",
              role: "Cadeau d'équipe",
              text: "On a offert une vocapsule à notre manager pour son départ. Tous ses collègues ont enregistré un message. Elle en parle encore des mois après.",
              stars: 5,
            },
          ].map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              style={{
                borderRadius: 20, padding: "28px 24px",
                background: "rgba(10,8,12,0.8)",
                border: "1px solid rgba(201,169,110,0.1)",
                display: "flex", flexDirection: "column", gap: 16,
                textAlign: "left",
              }}
            >
              {/* Étoiles */}
              <div style={{ display: "flex", gap: 3 }}>
                {Array.from({ length: review.stars }).map((_, s) => (
                  <svg key={s} viewBox="0 0 16 16" fill="#c9a96e" style={{ width: 14, height: 14 }}>
                    <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7z"/>
                  </svg>
                ))}
              </div>
              {/* Texte */}
              <p style={{
                fontFamily: font, fontSize: 13, lineHeight: 1.8,
                fontStyle: "italic", color: "rgba(240,232,216,0.65)", margin: 0, flex: 1,
              }}>
                &ldquo;{review.text}&rdquo;
              </p>
              {/* Auteur */}
              <div style={{ borderTop: "1px solid rgba(201,169,110,0.08)", paddingTop: 14 }}>
                <p style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: cream, margin: "0 0 2px" }}>
                  {review.name}
                </p>
                <p style={{ fontFamily: font, fontSize: 11, color: "rgba(201,169,110,0.55)", margin: 0, letterSpacing: "0.05em" }}>
                  {review.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════ CADEAU ═══════════════ */}
      <section style={{
        position: "relative", zIndex: 10,
        borderTop: "1px solid rgba(201,169,110,0.08)",
        padding: "80px 56px",
        textAlign: "center",
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}
        >
          {/* Logo EKKO */}
          <img
            src="/ekko-logo.png"
            alt="EKKO"
            style={{ height: 108, width: "auto", opacity: 0.7, marginBottom: 4 }}
          />
          <h2 style={{
            fontFamily: font, fontWeight: 300, fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)",
            lineHeight: 1.3, color: cream, margin: 0,
          }}>
            Le cadeau qui reste.<br />
            Bien plus qu&apos;un objet.
          </h2>
        </motion.div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer style={{
        position: "relative", zIndex: 10,
        borderTop: "1px solid rgba(201,169,110,0.08)",
        background: "rgba(10,8,12,0.5)",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          padding: "56px 56px 40px", gap: 48,
        }} className="hp-footer-inner">
          {/* Branding */}
          <div style={{ flex: "0 0 240px" }}>
            <img src="/ekko-logo.png" alt="EKKO" style={{ height: 40, mixBlendMode: "screen", marginBottom: 16 }} />
            <p style={{
              fontFamily: font, fontSize: 12, lineHeight: 1.6,
              color: "rgba(240,232,216,0.3)",
            }}>
              La voix qu&apos;on garde sur soi.<br />
              Des vocaux. Un objet. Une émotion.
            </p>
            <p style={{
              fontFamily: font, fontSize: 10, color: "rgba(240,232,216,0.2)", marginTop: 20,
            }}>
              © 2025 EKKO. Tous droits réservés.
            </p>
          </div>

          {/* Colonnes de liens */}
          <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }} className="hp-footer-cols">
            {FOOTER_COLS.map((col) => (
              <div key={col.title} style={{ minWidth: 120 }}>
                <p style={{
                  fontFamily: font, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
                  color: "rgba(240,232,216,0.4)", marginBottom: 16, fontWeight: 500,
                }}>{col.title}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {col.links.map((l) => (
                    <a key={l.href} href={l.href} style={{
                      fontFamily: font, fontSize: 12, color: "rgba(240,232,216,0.3)",
                      textDecoration: "none", transition: "color 0.2s",
                    }}>{l.text}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Réseaux sociaux */}
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", paddingTop: 4 }}>
            {[
              { label: "Instagram", path: "M7.5 2h9A5.5 5.5 0 0122 7.5v9a5.5 5.5 0 01-5.5 5.5h-9A5.5 5.5 0 012 16.5v-9A5.5 5.5 0 017.5 2zm4.5 5a5 5 0 100 10 5 5 0 000-10zm5.5-.5a1 1 0 110 2 1 1 0 010-2z" },
              { label: "Facebook", path: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
              { label: "TikTok", path: "M9 12a4 4 0 104 4V4a5 5 0 005 5" },
            ].map((s) => (
              <a key={s.label} href="#" aria-label={s.label} style={{ color: "rgba(240,232,216,0.3)", transition: "color 0.2s" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
