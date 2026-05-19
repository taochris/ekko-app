"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BlobBackground from "./BlobBackground";
import ThemeCard from "./ThemeCard";

/* ─── Navigation ─────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { text: "Le porte-clé", href: "/produit" },
  { text: "Comment ça marche", href: "/comment-ca-marche" },
  { text: "Idées cadeaux", href: "/idees-cadeaux" },
  { text: "FAQ", href: "/faq" },
  { text: "Blog", href: "/blog" },
];

const MOBILE_NAV_CATEGORIES = [
  {
    label: "Explorer",
    links: [
      { text: "Le porte-clé", href: "/produit" },
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
const STEPS = [
  {
    number: "1",
    title: "Sélectionnez vos vocaux",
    desc: "Choisissez les messages vocaux qui comptent le plus pour vous.",
    img: "/images/steps/step_1_sel_ecran_smartphone.png",
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
    img: "/images/steps/qrcode_megane.png",
  },
];

/* ─── Thèmes ─────────────────────────────────────────────────────────── */
const THEMES = [
  {
    id: "amour",
    title: "Amour",
    tagline: "Et si sa voix vous suivait partout ?",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" style={{ width: 24, height: 24 }}>
        <path d="M16 28 C16 28 4 20 4 12 C4 8 7 4 11 4 C13.5 4 15.5 5.5 16 7 C16.5 5.5 18.5 4 21 4 C25 4 28 8 28 12 C28 20 16 28 16 28Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.15" />
      </svg>
    ),
    accent: "#c9a96e",
  },
  {
    id: "deuil",
    title: "Mémoire",
    tagline: "Et si un souvenir devenait un objet ?",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" style={{ width: 24, height: 24 }}>
        <path d="M16 4 L18 12 L26 12 L20 17 L22 26 L16 21 L10 26 L12 17 L6 12 L14 12Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.15" />
      </svg>
    ),
    accent: "#c9a96e",
  },
  {
    id: "amitie",
    title: "Amitié",
    tagline: "Et si vos fous rires restaient vivants ?",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" style={{ width: 24, height: 24 }}>
        <circle cx="10" cy="14" r="6" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="22" cy="14" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 28 C4 22 8 20 10 20 C12 20 14 21 16 21 C18 21 20 20 22 20 C24 20 28 22 28 28" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.1" />
      </svg>
    ),
    accent: "#c9a96e",
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
    title: "Produit",
    links: [
      { text: "Le porte-clé", href: "/produit" },
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
          .hp-hero-visual { display: none !important; }
          .hp-features-bar { flex-wrap: wrap !important; gap: 24px !important; padding: 40px 20px !important; }
          .hp-features-bar > div { flex: 1 1 140px !important; }
          .hp-steps-grid { flex-direction: column !important; gap: 32px !important; padding: 0 20px !important; }
          .hp-step-arrow { display: none !important; }
          .hp-themes-grid { grid-template-columns: 1fr !important; padding: 0 20px !important; }
          .hp-detail-inner { flex-direction: column !important; padding: 60px 20px !important; }
          .hp-detail-visual { display: none !important; }
          .hp-gift-inner { flex-direction: column !important; padding: 60px 20px !important; }
          .hp-footer-inner { flex-direction: column !important; gap: 32px !important; padding: 40px 20px !important; }
          .hp-footer-cols { flex-direction: column !important; gap: 24px !important; }
        }
      `}</style>
      <BlobBackground variant="home" />

      {/* ═══════════════ NAV ═══════════════ */}
      <nav style={{
        position: "relative", zIndex: 10, width: "100%",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 48px", boxSizing: "border-box",
      }} className="hp-nav">
        <a href="/">
          <img src="/ekko-logo.png" alt="EKKO" style={{ height: isMobile ? 50 : 60, width: "auto", objectFit: "contain", mixBlendMode: "screen" }} />
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }} className="hp-nav-links">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} style={{
              fontFamily: font, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
              color: "rgba(240,232,216,0.45)", textDecoration: "none", transition: "color 0.2s",
            }}>{l.text}</a>
          ))}
          <a href="/compte" style={{
            fontFamily: font, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
            color: "rgba(240,232,216,0.45)", textDecoration: "none", display: "flex", alignItems: "center", gap: 6,
          }}>
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
        position: "relative", zIndex: 10,
        width: "100%", minHeight: "88vh",
        overflow: "hidden",
        display: "flex", alignItems: "center",
      }}>
        {/* Image fond plein */}
        <img
          src="/images/hero/ChatGPT Image 19 mai 2026, 12_46_31.png"
          alt="Porte-clé EKKO"
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center",
          }}
        />
        {/* Dégradé gauche pour lisibilité du texte */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, rgba(10,8,12,0.92) 0%, rgba(10,8,12,0.7) 45%, rgba(10,8,12,0.1) 75%, transparent 100%)",
        }} />

        {/* Texte superposé */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          style={{
            position: "relative", zIndex: 2,
            maxWidth: 560, padding: "80px 56px",
            display: "flex", flexDirection: "column", gap: 24,
          }}
          className="hp-hero-text"
        >
          <p style={{
            fontFamily: font, fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase",
            color: "rgba(201,169,110,0.7)", margin: 0,
          }}>
            Vos émotions, à portée de main.
          </p>
          <h1 style={{
            fontFamily: font, fontWeight: 300,
            fontSize: "clamp(2.2rem, 5vw, 3.6rem)", lineHeight: 1.1,
            color: cream, margin: 0,
          }}>
            La voix<br />
            qu&apos;on garde<br />
            <em style={{ fontStyle: "italic", color: gold }}>sur soi.</em>
          </h1>
          <p style={{
            fontFamily: font, fontSize: 14, lineHeight: 1.8,
            color: "rgba(240,232,216,0.65)", maxWidth: 400, margin: 0,
          }}>
            EKKO transforme vos messages vocaux en un porte-clé en bois
            avec QR gravé et NFC intégré. Scannez ou approchez. Écoutez. Ressentez.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <a href="/produit" style={{
              display: "inline-block", padding: "16px 36px", borderRadius: 6,
              background: `linear-gradient(135deg, ${gold}, #b08940)`,
              fontFamily: font, fontSize: 12, fontWeight: 600, letterSpacing: "0.2em",
              textTransform: "uppercase", color: "#1a1418", textDecoration: "none",
              width: "fit-content",
            }}>
              Créer mon porte-clé
            </a>
            <a href="/comment-ca-marche" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontFamily: font, fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase",
              color: "rgba(240,232,216,0.5)", textDecoration: "none",
            }}>
              <span style={{
                width: 28, height: 28, borderRadius: "50%", border: "1px solid rgba(240,232,216,0.25)",
                display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14,
              }}>+</span>
              Découvrir comment ça marche
            </a>
          </div>
        </motion.div>

        {/* Note bas droite */}
        <p style={{
          position: "absolute", right: 32, bottom: 24, zIndex: 2, maxWidth: 180,
          fontFamily: font, fontSize: 11, fontStyle: "italic", lineHeight: 1.6,
          color: "rgba(240,232,216,0.3)", textAlign: "right", margin: 0,
        }}>
          Scannez le QR code ou approchez un smartphone compatible NFC pour ouvrir votre vocapsule.
        </p>
      </section>

      {/* ═══════════════ BARRE FEATURES ═══════════════ */}
      <section style={{
        position: "relative", zIndex: 10,
        borderTop: "1px solid rgba(201,169,110,0.08)",
        borderBottom: "1px solid rgba(201,169,110,0.08)",
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
            color: cream, marginBottom: 60,
          }}>
            Trois étapes, un souvenir éternel.
          </h2>
        </motion.div>

        <div style={{
          maxWidth: 1000, margin: "0 auto",
          display: "flex", alignItems: "stretch", justifyContent: "center", gap: 20,
        }} className="hp-steps-grid">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              style={{
                flex: 1, maxWidth: 320,
                borderRadius: 20, overflow: "hidden",
                display: "flex", flexDirection: "column",
                background: "rgba(10,8,12,0.95)",
                border: "1px solid rgba(201,169,110,0.1)",
              }}
            >
              {/* Bloc texte noir */}
              <div style={{
                padding: "28px 24px 20px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                textAlign: "center",
              }}>
                <span style={{
                  fontFamily: font, fontSize: 30, fontWeight: 300, color: gold, opacity: 0.7, lineHeight: 1,
                }}>{step.number}.</span>
                <h3 style={{
                  fontFamily: font, fontSize: 14, fontWeight: 600, letterSpacing: "0.12em",
                  textTransform: "uppercase", color: cream, margin: 0,
                }}>{step.title}</h3>
                <p style={{
                  fontFamily: font, fontSize: 14, lineHeight: 1.7,
                  color: "rgba(240,232,216,0.72)", margin: 0, marginTop: 20,
                }}>{step.desc}</p>
              </div>
              {/* Photo avec fondu seamless en haut */}
              <div style={{ flex: 1, minHeight: 300, position: "relative", overflow: "hidden" }}>
                <img
                  src={step.img}
                  alt={step.title}
                  style={{
                    width: "100%", height: "100%",
                    objectFit: "cover", objectPosition: "center center",
                    display: "block",
                  }}
                />
                {/* Fondu noir → transparent depuis le haut */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: "55%",
                  background: "linear-gradient(to bottom, rgba(10,8,12,0.95) 0%, rgba(10,8,12,0.5) 40%, transparent 100%)",
                  pointerEvents: "none",
                }} />
              </div>
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
        >
          <p style={{
            fontFamily: font, fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase",
            color: "rgba(201,169,110,0.5)", marginBottom: 16,
          }}>Vos univers. Vos émotions.</p>
        </motion.div>

        <div style={{
          maxWidth: 1000, margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20,
        }} className="hp-themes-grid">
          {THEMES.map((theme, i) => (
            <motion.a
              key={theme.id}
              href={`/theme/${theme.id}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              style={{
                display: "flex", flexDirection: "column",
                borderRadius: 20, overflow: "hidden",
                background: "rgba(20,16,24,0.6)", border: "1px solid rgba(201,169,110,0.12)",
                textDecoration: "none", transition: "border-color 0.3s, transform 0.3s",
              }}
            >
              {/* Image placeholder */}
              <div style={{
                width: "100%", aspectRatio: "16/10",
                background: "linear-gradient(135deg, rgba(201,169,110,0.08), rgba(20,16,24,0.4))",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontFamily: font, fontSize: 10, fontStyle: "italic", color: `${gold}30` }}>
                  Photo à venir
                </span>
              </div>
              <div style={{ padding: "20px 24px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ color: gold }}>{theme.icon}</span>
                  <h3 style={{
                    fontFamily: font, fontSize: 18, fontWeight: 500, color: cream,
                    margin: 0, letterSpacing: "0.1em", textTransform: "uppercase",
                  }}>{theme.title}</h3>
                </div>
                <p style={{
                  fontFamily: font, fontSize: 13, fontStyle: "italic", lineHeight: 1.6,
                  color: "rgba(240,232,216,0.5)", margin: "0 0 16px",
                }}>{theme.tagline}</p>
                <span style={{
                  fontFamily: font, fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase",
                  color: gold, display: "inline-flex", alignItems: "center", gap: 6,
                }}>
                  Découvrir →
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* ═══════════════ L'ART DU DÉTAIL ═══════════════ */}
      <section style={{
        position: "relative", zIndex: 10,
        borderTop: "1px solid rgba(201,169,110,0.08)",
        padding: "100px 56px",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "flex", alignItems: "center", gap: 60,
        }} className="hp-detail-inner">
          {/* Texte */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ flex: 1 }}
          >
            <p style={{
              fontFamily: font, fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase",
              color: "rgba(201,169,110,0.5)", marginBottom: 16,
            }}>L&apos;art du détail</p>
            <h2 style={{
              fontFamily: font, fontWeight: 300, fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
              lineHeight: 1.2, color: cream, marginBottom: 20,
            }}>
              Un objet tangible.<br />
              Une émotion durable.
            </h2>
            <p style={{
              fontFamily: font, fontSize: 14, lineHeight: 1.8,
              color: "rgba(240,232,216,0.5)", maxWidth: 420, marginBottom: 32,
            }}>
              Bois noble soigneusement sélectionné, gravure laser précise, NFC intégré sans altérer le design.
              Chaque porte-clé EKKO est fabriqué avec exigence pour traverser le temps à vos côtés.
            </p>
            <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
              {PRODUCT_SPECS.map((spec, i) => (
                <div key={i} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  minWidth: 100,
                }}>
                  <span style={{ color: gold }}>{spec.icon}</span>
                  <span style={{
                    fontFamily: font, fontSize: 10, textAlign: "center",
                    color: "rgba(240,232,216,0.5)", lineHeight: 1.4,
                  }}>{spec.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Visuel placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
            }}
            className="hp-detail-visual"
          >
            <div style={{
              width: "100%", maxWidth: 400, aspectRatio: "4/3", borderRadius: 24,
              background: "linear-gradient(135deg, rgba(201,169,110,0.08), rgba(20,16,24,0.4))",
              border: "1px solid rgba(201,169,110,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontFamily: font, fontSize: 12, fontStyle: "italic", color: `${gold}30` }}>
                Photo porte-clé à venir
              </span>
            </div>
            <div style={{
              padding: "16px 24px", borderRadius: 14,
              background: "rgba(201,169,110,0.04)", border: "1px solid rgba(201,169,110,0.1)",
              maxWidth: 300, textAlign: "left",
            }}>
              <p style={{
                fontFamily: font, fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase",
                color: `${gold}80`, marginBottom: 8,
              }}>NFC intégré</p>
              <p style={{
                fontFamily: font, fontSize: 12, lineHeight: 1.7,
                color: "rgba(240,232,216,0.45)", margin: 0,
              }}>
                La technologie NFC est intégrée à l&apos;intérieur du bois pour un design pur et épuré.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ CADEAU + TÉMOIGNAGE ═══════════════ */}
      <section style={{
        position: "relative", zIndex: 10,
        borderTop: "1px solid rgba(201,169,110,0.08)",
        padding: "80px 56px",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "flex", alignItems: "center", gap: 48,
        }} className="hp-gift-inner">
          {/* Visuel cadeau */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <div style={{
              width: 200, height: 200, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(201,169,110,0.1), transparent 70%)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg viewBox="0 0 80 80" fill="none" style={{ width: 80, height: 80 }}>
                <rect x="10" y="20" width="60" height="50" rx="8" stroke={gold} strokeWidth="1.5" fill="rgba(201,169,110,0.08)" />
                <rect x="15" y="30" width="20" height="20" rx="3" stroke={`${gold}60`} strokeWidth="0.8" />
                <text x="40" y="60" textAnchor="middle" fill={gold} fontFamily={font} fontSize="6" letterSpacing="2" opacity="0.5">EKKO</text>
              </svg>
            </div>
          </motion.div>

          {/* Texte cadeau */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{ flex: 1 }}
          >
            <h2 style={{
              fontFamily: font, fontWeight: 300, fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)",
              lineHeight: 1.3, color: cream, marginBottom: 12,
            }}>
              Le cadeau qui reste.<br />
              Bien plus qu&apos;un objet.
            </h2>
            <p style={{
              fontFamily: font, fontSize: 13, lineHeight: 1.8,
              color: "rgba(240,232,216,0.45)", marginBottom: 24,
            }}>
              Offrez une émotion, un souvenir, une voix. Un geste simple, pour un impact éternel.
            </p>
            <a href="/idees-cadeaux" style={{
              display: "inline-block", padding: "12px 28px", borderRadius: 6,
              border: `1px solid ${gold}60`, background: "transparent",
              fontFamily: font, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
              color: gold, textDecoration: "none", transition: "background 0.2s",
            }}>
              Idées cadeaux
            </a>
          </motion.div>

          {/* Témoignage */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{
              flex: 1, padding: "28px 24px", borderRadius: 20,
              background: "rgba(201,169,110,0.04)", border: "1px solid rgba(201,169,110,0.1)",
            }}
          >
            <div style={{ display: "flex", gap: 3, marginBottom: 12 }}>
              {[1,2,3,4,5].map((s) => (
                <span key={s} style={{ color: gold, fontSize: 14 }}>★</span>
              ))}
            </div>
            <p style={{
              fontFamily: font, fontSize: 13, fontStyle: "italic", lineHeight: 1.7,
              color: "rgba(240,232,216,0.6)", marginBottom: 16,
            }}>
              &ldquo;J&apos;ai offert ce porte-clé à ma maman avec la voix de mon papa.
              Elle l&apos;écoute tous les jours. Merci EKKO pour cette merveilleuse idée.&rdquo;
            </p>
            <div>
              <p style={{
                fontFamily: font, fontSize: 13, fontWeight: 600, color: cream, margin: 0,
              }}>Claire D.</p>
              <p style={{
                fontFamily: font, fontSize: 10, color: "rgba(240,232,216,0.35)",
                display: "flex", alignItems: "center", gap: 4, margin: "2px 0 0",
              }}>
                Cliente vérifiée
                <svg viewBox="0 0 14 14" fill="none" style={{ width: 12, height: 12 }}>
                  <circle cx="7" cy="7" r="6" fill={gold} opacity="0.3" />
                  <path d="M4 7 L6 9 L10 5" stroke={gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </p>
            </div>
          </motion.div>
        </div>
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
