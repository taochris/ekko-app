"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import BlobBackground from "../components/BlobBackground";

// ─── Formats de porte-clés ──────────────────────────────────────────────
const FORMATS = [
  {
    id: "etiquette-rect",
    name: "Rectangulaire",
    tagline: "Élégant, fin et vertical.",
    icon: (
      <svg viewBox="0 0 48 56" fill="none" style={{ width: 32, height: 36 }}>
        <rect x="6" y="6" width="36" height="46" rx="4" stroke="currentColor" strokeWidth="1.5" />
        <rect x="13" y="16" width="22" height="22" rx="2" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
        <circle cx="24" cy="2" r="2.5" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
    dimensions: "90 × 30 mm",
    description: "Grand format rectangulaire aux coins arrondis. Surface généreuse pour un QR code lisible et un prénom gravé en dessous.",
    image: "/images/produit/etiquette%20rectangulaire.png",
    carousel: [
      "/images/produit/porteclef_format_rectangulaire/etiquette rectangulaire.png",
      "/images/produit/porteclef_format_rectangulaire/ChatGPT Image 31 mai 2026, 11_59_03 (1).png",
      "/images/produit/porteclef_format_rectangulaire/ChatGPT Image 31 mai 2026, 11_59_04 (2).png",
      "/images/produit/porteclef_format_rectangulaire/ChatGPT Image 31 mai 2026, 11_59_04 (3).png",
    ],
    outOfStock: false,
  },
  {
    id: "etiquette-arrondie",
    name: "Arrondie",
    tagline: "Doux, discret et symbolique.",
    icon: (
      <svg viewBox="0 0 40 56" fill="none" style={{ width: 28, height: 36 }}>
        <rect x="4" y="8" width="32" height="42" rx="16" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="18" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
        <circle cx="20" cy="2" r="2.5" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
    dimensions: "50,8 × 31,8 mm",
    description: "Format compact aux extrémités en demi-cercle. Élégant et doux en main, idéal comme bijou du quotidien.",
    image: "/images/produit/etiquette_dimension.png",
    carousel: [
      "/images/produit/porteclef_format_arrondie/etiquette_dimension.png",
      "/images/produit/porteclef_format_arrondie/ChatGPT Image 30 mai 2026, 12_43_04 (1).png",
      "/images/produit/porteclef_format_arrondie/ChatGPT Image 30 mai 2026, 12_43_05 (2).png",
      "/images/produit/porteclef_format_arrondie/ChatGPT Image 30 mai 2026, 12_43_05 (3).png",
    ],
    outOfStock: false,
  },
  {
    id: "carre",
    name: "Carré",
    tagline: "Sobre, compact et lisible.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" style={{ width: 36, height: 36 }}>
        <rect x="8" y="8" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="1.5" />
        <rect x="14" y="14" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
        <circle cx="24" cy="4" r="2.5" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
    dimensions: "40 × 40 mm",
    description: "Format classique et épuré. Surface maximale pour un QR code lisible au premier coup d'œil.",
    image: "/images/produit/etiquette%20carre.png",
    carousel: [
      "/images/produit/porteclef_format_carré/etiquette carre.png",
      "/images/produit/porteclef_format_carré/ChatGPT Image 30 mai 2026, 12_36_56 (1).png",
      "/images/produit/porteclef_format_carré/ChatGPT Image 30 mai 2026, 12_36_56 (2).png",
      "/images/produit/porteclef_format_carré/ChatGPT Image 30 mai 2026, 12_36_57 (3).png",
    ],
    outOfStock: false,
  },
];

// ─── Matériaux (extensible — d'autres arriveront plus tard) ─────────────
const MATERIALS = [
  {
    id: "bois",
    name: "Bois",
    available: true,
    description:
      "Bois clair découpé et gravé au laser. Rendu chaleureux, toucher naturel, léger et résistant.",
    specs: ["Bois naturel", "Gravure laser", "Léger", "Toucher doux"],
    price: "24,90 €",
    image: null,
    accent: "#c9a96e",
  },
  // À venir :
  // { id: "bambou", name: "Bambou", available: false, ... },
  // { id: "plexi", name: "Plexiglas", available: false, ... },
];

export default function ProduitPage() {
  const [selectedFormat, setSelectedFormat] = useState("etiquette-rect");
  const [selectedMaterial, setSelectedMaterial] = useState("bois");
  const [imgIndex, setImgIndex] = useState(0);
  const currentFormat = FORMATS.find((f) => f.id === selectedFormat) ?? FORMATS[0];
  const currentMaterial = MATERIALS.find((m) => m.id === selectedMaterial) ?? MATERIALS[0];
  const carouselImages = currentFormat.carousel ?? [];

  const chooseFormat = (id: string) => {
    setSelectedFormat(id);
    setImgIndex(0);
  };
  const nextImage = () => setImgIndex((i) => (i + 1) % carouselImages.length);
  const prevImage = () => setImgIndex((i) => (i - 1 + carouselImages.length) % carouselImages.length);

  return (
    <div style={{ position: "relative", minHeight: "100vh", width: "100%", overflowX: "hidden" }}>
      <BlobBackground variant="home" />

      {/* Nav retour */}
      <nav style={{
        position: "relative", zIndex: 10,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "24px 40px",
      }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <img src="/ekko-logo.png" alt="EKKO" style={{ height: 60, width: "auto", objectFit: "contain", mixBlendMode: "screen" }} />
        </a>
        <a href="/" style={{
          fontFamily: "Georgia, serif", fontSize: 12, letterSpacing: "0.2em",
          textTransform: "uppercase", color: "rgba(240,232,216,0.5)",
          textDecoration: "none", transition: "color 0.2s",
        }}>
          ← Retour à l&apos;accueil
        </a>
      </nav>

      {/* Hero */}
      <section style={{
        position: "relative", zIndex: 10,
        maxWidth: 900, margin: "0 auto", padding: "40px 24px 60px",
        textAlign: "center",
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p style={{
            fontFamily: "Georgia, serif", fontSize: 11, letterSpacing: "0.5em",
            textTransform: "uppercase", color: "rgba(201,169,110,0.6)", marginBottom: 16,
          }}>
            Porte-clés EKKO
          </p>
          <h1 style={{
            fontFamily: "Georgia, serif", fontWeight: 300,
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)", lineHeight: 1.25,
            color: "#f0e8d8", marginBottom: 20,
          }}>
            Votre voix, gravée dans le <em style={{ fontStyle: "italic", color: "#c9a96e" }}>bois</em>
          </h1>
          <p style={{
            fontFamily: "Georgia, serif", fontStyle: "italic",
            fontSize: 16, lineHeight: 1.8,
            color: "rgba(240,232,216,0.65)", maxWidth: 560, margin: "0 auto 32px",
          }}>
            Un porte-clés en bois gravé au laser avec votre QR code unique.
            Scannez-le, et la voix de ceux que vous aimez reprend vie.
          </p>
        </motion.div>

        {/* ── Étapes ── */}
        <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap", marginBottom: 56 }}>
          {[
            { num: "01", label: "Choisissez le format", desc: "Rectangulaire ou arrondie — trouvez votre étiquette" },
            { num: "02", label: "Créez votre vocapsule", desc: "Importez vos audios et assemblez-les sur le site" },
            { num: "03", label: "Recevez votre objet", desc: "Gravure laser, anneau inox, expédié chez vous" },
          ].map((s) => (
            <div key={s.num} style={{
              flex: "1 1 200px", maxWidth: 220,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "Georgia, serif", fontSize: 16, color: "#c9a96e",
              }}>
                {s.num}
              </div>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 500, color: "#f0e8d8" }}>
                {s.label}
              </h3>
              <p style={{
                fontFamily: "Georgia, serif", fontSize: 12, lineHeight: 1.7,
                color: "rgba(240,232,216,0.45)", maxWidth: 200,
              }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        {/* ── Séparateur décoratif ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48, justifyContent: "center" }}>
          <div style={{ width: 60, height: 1, background: "linear-gradient(to right, transparent, rgba(201,169,110,0.3))" }} />
          <span style={{ color: "rgba(201,169,110,0.4)", fontSize: 10 }}>✦</span>
          <div style={{ width: 60, height: 1, background: "linear-gradient(to left, transparent, rgba(201,169,110,0.3))" }} />
        </div>

        {/* ── Sélecteur de format ── */}
        <div style={{ marginBottom: 48 }}>
          <p style={{
            fontFamily: "Georgia, serif", fontSize: 12, letterSpacing: "0.3em",
            textTransform: "uppercase", color: "rgba(201,169,110,0.5)", marginBottom: 20,
          }}>
            Choisissez le format
          </p>
          {/* Holder full-bleed : fond pleine largeur écran couleur de l'image */}
          <div style={{
            position: "relative",
            width: "100vw", left: "50%", right: "50%", marginLeft: "-50vw", marginRight: "-50vw",
            background: "#120b09",
            overflow: "hidden",
          }}>
            {/* Image comparative 16/9 centrée */}
            <div style={{ position: "relative", width: "100%", maxWidth: 900, margin: "0 auto", aspectRatio: "16/9" }}>
              <img
                src="/images/produit/formats_differents.png"
                alt="Comparatif des formats"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              {/* Overlay sombre général */}
              <div style={{ position: "absolute", inset: 0, background: "rgba(10,8,12,0.3)", pointerEvents: "none" }} />
              {/* Dégradés latéraux : l'image fond dans le fond pleine largeur */}
              <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "20%", background: "linear-gradient(to right, #120b09 0%, transparent 100%)", zIndex: 2, pointerEvents: "none" }} />
              <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "20%", background: "linear-gradient(to left, #120b09 0%, transparent 100%)", zIndex: 2, pointerEvents: "none" }} />
            </div>
          </div>

          {/* Conteneur boutons full-bleed — même couleur que l'image, dégradé vers le fond de page */}
          <div style={{
            position: "relative",
            width: "100vw", left: "50%", marginLeft: "-50vw",
            background: "linear-gradient(to bottom, #120b09 0%, #0d0909 40%, #0a0608 70%, transparent 100%)",
            padding: "24px 0 56px",
          }}>
            {/* Zone centrée alignée sur l'image (maxWidth 900) — boutons remontés de 30px */}
            <div style={{
              maxWidth: 900, margin: "0 auto",
              display: "flex", justifyContent: "center", gap: 16, padding: "0 24px",
            }}>
            {(["carre", "etiquette-rect", "etiquette-arrondie"] as const).map((id) => {
              const fmt = FORMATS.find(f => f.id === id)!;
              return (
              <motion.button
                key={fmt.id}
                onClick={() => chooseFormat(fmt.id)}
                whileHover={{ scale: 1.08, boxShadow: "0 12px 40px rgba(201,169,110,0.25), 0 0 0 1px rgba(201,169,110,0.35)" }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  flex: "1 1 0", maxWidth: 220,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  padding: "16px 20px", borderRadius: 16,
                  cursor: "pointer",
                  background: selectedFormat === fmt.id ? "rgba(201,169,110,0.12)" : "rgba(10,8,12,0.6)",
                  border: `1px solid ${selectedFormat === fmt.id ? "rgba(201,169,110,0.5)" : "rgba(255,255,255,0.08)"}`,
                  color: selectedFormat === fmt.id ? "#c9a96e" : "rgba(240,232,216,0.55)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <span style={{
                  fontFamily: "Georgia, serif", fontSize: 14, letterSpacing: "0.05em",
                  fontWeight: selectedFormat === fmt.id ? 600 : 400,
                }}>
                  {fmt.name}
                </span>
                <span style={{
                  fontFamily: "Georgia, serif", fontSize: 12, fontStyle: "italic",
                  color: selectedFormat === fmt.id ? "rgba(201,169,110,0.85)" : "rgba(240,232,216,0.4)",
                  letterSpacing: "0.03em",
                }}>
                  {fmt.tagline}
                </span>
              </motion.button>
              );
            })}
            </div>
          </div>
        </div>

        {/* ── Sélecteur de matériau (prêt pour extension) ── */}
        {MATERIALS.length > 1 && (
          <div style={{ marginBottom: 48 }}>
            <p style={{
              fontFamily: "Georgia, serif", fontSize: 12, letterSpacing: "0.3em",
              textTransform: "uppercase", color: "rgba(201,169,110,0.5)", marginBottom: 16,
            }}>
              Matériau
            </p>
            <div style={{
              display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap",
            }}>
              {MATERIALS.map((mat) => (
                <button
                  key={mat.id}
                  onClick={() => mat.available && setSelectedMaterial(mat.id)}
                  style={{
                    fontFamily: "Georgia, serif", fontSize: 13, letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    padding: "12px 24px", borderRadius: 50, cursor: mat.available ? "pointer" : "default",
                    background: selectedMaterial === mat.id ? `${mat.accent}20` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${selectedMaterial === mat.id ? `${mat.accent}50` : "rgba(255,255,255,0.08)"}`,
                    color: selectedMaterial === mat.id ? mat.accent : mat.available ? "rgba(240,232,216,0.5)" : "rgba(240,232,216,0.2)",
                    transition: "all 0.2s",
                    opacity: mat.available ? 1 : 0.5,
                  }}
                >
                  {mat.name}
                  {!mat.available && (
                    <span style={{
                      marginLeft: 8, fontSize: 9, padding: "2px 8px", borderRadius: 8,
                      background: "rgba(255,255,255,0.06)", color: "rgba(240,232,216,0.4)",
                    }}>
                      Bientôt
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Détail du format sélectionné */}
      <section style={{
        position: "relative", zIndex: 10,
        maxWidth: 900, margin: "0 auto", padding: "20px 24px 80px",
        borderTop: "1px solid rgba(201,169,110,0.08)",
      }}>
        <motion.div
          key={`${currentFormat.id}-${currentMaterial.id}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40,
            alignItems: "center",
          }}
          className="produit-detail-grid"
        >
          {/* Visuel produit */}
          <div style={{
            aspectRatio: "1", borderRadius: 24,
            background: `linear-gradient(135deg, rgba(20,16,24,0.8), rgba(30,24,36,0.6))`,
            border: `1px solid ${currentMaterial.accent}20`,
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
          }}>
            {carouselImages.length > 0 ? (
              <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <img
                  src={encodeURI(carouselImages[imgIndex] ?? carouselImages[0])}
                  alt={`Porte-clés ${currentFormat.name} en ${currentMaterial.name}`}
                  onClick={carouselImages.length > 1 ? nextImage : undefined}
                  style={{ width: "100%", height: "100%", objectFit: "cover", cursor: carouselImages.length > 1 ? "pointer" : "default", display: "block" }}
                />
                {carouselImages.length > 1 && (
                  <>
                    <button onClick={prevImage} aria-label="Image précédente" style={{
                      position: "absolute", top: "50%", left: 12, transform: "translateY(-50%)", zIndex: 3,
                      width: 38, height: 38, borderRadius: "50%", cursor: "pointer",
                      background: "rgba(10,8,12,0.6)", border: "1px solid rgba(201,169,110,0.3)",
                      color: "#c9a96e", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
                      backdropFilter: "blur(6px)",
                    }}>‹</button>
                    <button onClick={nextImage} aria-label="Image suivante" style={{
                      position: "absolute", top: "50%", right: 12, transform: "translateY(-50%)", zIndex: 3,
                      width: 38, height: 38, borderRadius: "50%", cursor: "pointer",
                      background: "rgba(10,8,12,0.6)", border: "1px solid rgba(201,169,110,0.3)",
                      color: "#c9a96e", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
                      backdropFilter: "blur(6px)",
                    }}>›</button>
                    <div style={{ position: "absolute", bottom: 14, left: 0, right: 0, zIndex: 3, display: "flex", justifyContent: "center", gap: 8 }}>
                      {carouselImages.map((_, i) => (
                        <button key={i} onClick={() => setImgIndex(i)} aria-label={`Image ${i + 1}`} style={{
                          width: 8, height: 8, borderRadius: "50%", cursor: "pointer", border: "none", padding: 0,
                          background: i === imgIndex ? "#c9a96e" : "rgba(240,232,216,0.3)",
                        }} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 40 }}>
                {/* Placeholder SVG adapté au format */}
                <svg viewBox="0 0 120 140" fill="none" style={{ width: 120, height: 140, marginBottom: 16 }}>
                  {currentFormat.id === "carre" && (
                    <>
                      <rect x="20" y="20" width="80" height="80" rx="8" fill={`${currentMaterial.accent}08`} stroke={`${currentMaterial.accent}40`} strokeWidth="1.5" />
                      <circle cx="60" cy="12" r="5" stroke={`${currentMaterial.accent}40`} strokeWidth="1" fill="none" />
                    </>
                  )}
                  {currentFormat.id === "etiquette-rect" && (
                    <>
                      <rect x="25" y="10" width="70" height="110" rx="6" fill={`${currentMaterial.accent}08`} stroke={`${currentMaterial.accent}40`} strokeWidth="1.5" />
                      <circle cx="60" cy="4" r="5" stroke={`${currentMaterial.accent}40`} strokeWidth="1" fill="none" />
                    </>
                  )}
                  {currentFormat.id === "etiquette-arrondie" && (
                    <>
                      <rect x="25" y="10" width="70" height="110" rx="35" fill={`${currentMaterial.accent}08`} stroke={`${currentMaterial.accent}40`} strokeWidth="1.5" />
                      <circle cx="60" cy="4" r="5" stroke={`${currentMaterial.accent}40`} strokeWidth="1" fill="none" />
                    </>
                  )}
                  {/* QR code simplifié */}
                  <rect x="40" y="50" width="40" height="40" rx="2" fill="none" stroke={`${currentMaterial.accent}50`} strokeWidth="0.8" />
                  {[0,1,2,3].map((row) =>
                    [0,1,2,3].map((col) => {
                      const on = (row + col) % 2 !== 0;
                      return on ? (
                        <rect key={`${row}-${col}`} x={42 + col * 9.5} y={52 + row * 9.5} width={8} height={8} rx="1" fill={`${currentMaterial.accent}40`} />
                      ) : null;
                    })
                  )}
                  <text x="60" y="105" textAnchor="middle" fill={currentMaterial.accent} fontFamily="Georgia, serif" fontSize="8" letterSpacing="2" opacity="0.6">
                    EKKO
                  </text>
                </svg>
                <p style={{
                  fontFamily: "Georgia, serif", fontSize: 12, fontStyle: "italic",
                  color: `${currentMaterial.accent}60`,
                }}>
                  Photo du produit fini à venir
                </p>
              </div>
            )}
          </div>

          {/* Infos */}
          <div>
            <h2 style={{
              fontFamily: "Georgia, serif", fontWeight: 400, fontSize: 26,
              color: "#f0e8d8", marginBottom: 8,
            }}>
              Porte-clés {currentFormat.name}
            </h2>
            <p style={{
              fontFamily: "Georgia, serif", fontSize: 13, fontStyle: "italic",
              color: currentMaterial.accent, marginBottom: 16, letterSpacing: "0.05em",
            }}>
              {currentFormat.dimensions} — {currentMaterial.name}
            </p>
            <p style={{
              fontFamily: "Georgia, serif", fontSize: 14, lineHeight: 1.8,
              color: "rgba(240,232,216,0.6)", marginBottom: 24,
            }}>
              {currentFormat.description}
            </p>

            {/* Specs */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20,
            }}>
              {currentMaterial.specs.map((spec: string) => (
                <div key={spec} style={{
                  padding: "8px 12px", borderRadius: 10,
                  background: `${currentMaterial.accent}08`, border: `1px solid ${currentMaterial.accent}15`,
                  fontFamily: "Georgia, serif", fontSize: 11, color: currentMaterial.accent,
                }}>
                  {spec}
                </div>
              ))}
            </div>

            {/* Inclus */}
            <div style={{
              padding: "14px 18px", borderRadius: 14,
              background: "rgba(201,169,110,0.04)", border: "1px solid rgba(201,169,110,0.12)",
              marginBottom: 24,
            }}>
              <p style={{
                fontFamily: "Georgia, serif", fontSize: 10, letterSpacing: "0.2em",
                textTransform: "uppercase", color: "rgba(201,169,110,0.5)", marginBottom: 8,
              }}>
                Inclus
              </p>
              <ul style={{
                listStyle: "none", padding: 0, margin: 0,
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4,
              }}>
                {["Anneau inox", "Gravure laser", "QR code unique", "Vocapsule liée"].map((item) => (
                  <li key={item} style={{
                    fontFamily: "Georgia, serif", fontSize: 11, color: "rgba(240,232,216,0.55)",
                  }}>
                    ✦ {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Prix */}
            <div style={{
              padding: "16px 20px", borderRadius: 16,
              background: "rgba(255,255,255,0.03)", border: `1px solid ${currentMaterial.accent}20`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{
                fontFamily: "Georgia, serif", fontSize: 13,
                color: "rgba(240,232,216,0.5)", letterSpacing: "0.1em", textTransform: "uppercase",
              }}>
                Prix
              </span>
              <span style={{
                fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 300,
                color: currentMaterial.accent,
              }}>
                {currentMaterial.price}
              </span>
              <span style={{
                fontFamily: "Georgia, serif", fontSize: 11, fontStyle: "italic",
                color: "rgba(240,232,216,0.4)", letterSpacing: "0.05em",
              }}>
                Expédition gratuite
              </span>
            </div>
          </div>
        </motion.div>
      </section>


      {/* CTA */}
      <section style={{
        position: "relative", zIndex: 10,
        textAlign: "center", padding: "0 24px 80px",
      }}>
        <a
          href="/produit/themes"
          style={{
            display: "inline-block", padding: "16px 40px", borderRadius: 50,
            background: "linear-gradient(135deg, rgba(201,169,110,0.3), rgba(201,169,110,0.5))",
            border: "1px solid rgba(201,169,110,0.4)",
            fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 500,
            color: "#f0e8d8", textDecoration: "none", letterSpacing: "0.1em",
          }}
        >
          Créer ma vocapsule
        </a>
      </section>

      {/* Footer */}
      <footer style={{
        position: "relative", zIndex: 10,
        borderTop: "1px solid rgba(201,169,110,0.08)",
        padding: "24px 40px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <img src="/ekko-logo.png" alt="EKKO" style={{ height: 32, mixBlendMode: "screen" }} />
        <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: "rgba(240,232,216,0.25)" }}>
          © 2025 EKKO. Tous droits réservés.
        </p>
      </footer>

      <style>{`
        @media (max-width: 700px) {
          .produit-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
