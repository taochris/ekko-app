"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import BlobBackground from "../components/BlobBackground";

// ─── Formats de porte-clés ──────────────────────────────────────────────
const FORMATS = [
  {
    id: "etiquette-rect",
    name: "Étiquette rectangulaire",
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
    outOfStock: false,
  },
  {
    id: "etiquette-arrondie",
    name: "Étiquette arrondie",
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
    outOfStock: false,
  },
  {
    id: "carre",
    name: "Carré",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" style={{ width: 36, height: 36 }}>
        <rect x="8" y="8" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="1.5" />
        <rect x="14" y="14" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
        <circle cx="24" cy="4" r="2.5" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
    dimensions: "40 × 40 mm",
    description: "Format classique et épuré. Surface maximale pour un QR code lisible au premier coup d'œil.",
    image: undefined,
    outOfStock: true,
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
    price: "à venir",
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
  const currentFormat = FORMATS.find((f) => f.id === selectedFormat) ?? FORMATS[0];
  const currentMaterial = MATERIALS.find((m) => m.id === selectedMaterial) ?? MATERIALS[0];

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
          <div style={{
            display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap",
          }}>
            {FORMATS.map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => !fmt.outOfStock && setSelectedFormat(fmt.id)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                  padding: "24px 32px", borderRadius: 20,
                  cursor: fmt.outOfStock ? "not-allowed" : "pointer",
                  background: selectedFormat === fmt.id ? "rgba(201,169,110,0.08)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${selectedFormat === fmt.id ? "rgba(201,169,110,0.4)" : fmt.outOfStock ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.06)"}`,
                  color: fmt.outOfStock ? "rgba(240,232,216,0.25)" : selectedFormat === fmt.id ? "#c9a96e" : "rgba(240,232,216,0.5)",
                  opacity: fmt.outOfStock ? 0.55 : 1,
                  transition: "all 0.2s", minWidth: 130, position: "relative",
                }}
              >
                <span style={{ color: "inherit" }}>{fmt.icon}</span>
                <span style={{
                  fontFamily: "Georgia, serif", fontSize: 13, letterSpacing: "0.05em",
                  fontWeight: selectedFormat === fmt.id ? 600 : 400,
                }}>
                  {fmt.name}
                </span>
                <span style={{
                  fontFamily: "Georgia, serif", fontSize: 10, color: "rgba(240,232,216,0.35)",
                }}>
                  {fmt.dimensions}
                </span>
                {fmt.outOfStock && (
                  <span style={{
                    fontSize: 9, padding: "2px 8px", borderRadius: 8,
                    background: "rgba(255,100,80,0.12)", color: "rgba(255,140,120,0.7)",
                    fontFamily: "Georgia, serif", letterSpacing: "0.05em",
                  }}>
                    Rupture de stock
                  </span>
                )}
              </button>
            ))}
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
            {(currentFormat.image || currentMaterial.image) ? (
              <img src={(currentFormat.image || currentMaterial.image)!} alt={`Porte-clés ${currentFormat.name} en ${currentMaterial.name}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
