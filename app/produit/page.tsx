"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import BlobBackground from "../components/BlobBackground";

// ─── Types d'objets ──────────────────────────────────────────────────────
const PRODUCTS = [
  {
    id: "porte-clef",
    name: "Porte-clés",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" style={{ width: 32, height: 32 }}>
        <circle cx="18" cy="18" r="10" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="18" cy="18" r="4" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <path d="M26 26 L42 42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M36 36 L40 32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M39 39 L43 35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    description: "Compact et discret, votre QR code gravé vous accompagne partout. Il suffit de le scanner pour réécouter vos souvenirs.",
    specs: ["Format compact", "Anneau inox inclus", "Gravure laser HD", "Résistant aux chocs"],
    available: true,
  },
  {
    id: "pendentif",
    name: "Pendentif",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" style={{ width: 32, height: 32 }}>
        <path d="M24 6 L24 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="24" cy="28" r="12" stroke="currentColor" strokeWidth="1.5" />
        <rect x="18" y="22" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <path d="M12 6 Q24 10 36 6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      </svg>
    ),
    description: "Un bijou-souvenir à porter sur soi. Le QR code est gravé avec finesse sur une pièce légère et élégante.",
    specs: ["Léger et fin", "Cordon ou chaîne", "Gravure fine", "Unisexe"],
    available: true,
  },
  {
    id: "support-telephone",
    name: "Support téléphone",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" style={{ width: 32, height: 32 }}>
        <rect x="14" y="4" width="20" height="36" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <rect x="18" y="8" width="12" height="24" rx="1" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        <circle cx="24" cy="36" r="2" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <path d="M8 44 L40 44 L36 34 L12 34 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      </svg>
    ),
    description: "Posez votre téléphone et scannez : le QR code est en vue, prêt à lancer votre vocapsule. Idéal sur un bureau ou une table de nuit.",
    specs: ["Stable et incliné", "Compatible tout smartphone", "QR code face visible", "Décoratif"],
    available: true,
  },
];

// ─── Matériaux ───────────────────────────────────────────────────────────
const MATERIALS = [
  {
    id: "bouleau",
    name: "Bouleau / Peuplier",
    available: true,
    description:
      "Bois clair au grain fin, léger et résistant. Le bouleau et le peuplier offrent un rendu épuré avec une gravure nette et précise.",
    specs: ["Bois clair naturel", "Grain fin", "Léger", "Gravure laser HD"],
    price: "à venir",
    image: null,
    accent: "#c9a96e",
  },
  {
    id: "bambou",
    name: "Bambou",
    available: true,
    description:
      "Matériau écologique et solide. Le bambou offre une texture chaleureuse et un contraste naturel idéal pour la gravure laser.",
    specs: ["Éco-responsable", "Très résistant", "Teinte chaude", "Gravure contrastée"],
    price: "à venir",
    image: null,
    accent: "#a8b060",
  },
  {
    id: "plexi",
    name: "Plexiglas",
    available: false,
    description:
      "Découpe et gravure sur plexiglas transparent ou teinté. Un rendu moderne et épuré, idéal pour un intérieur contemporain.",
    specs: ["Transparent ou teinté", "Très léger", "Moderne", "Gravure + découpe"],
    price: "bientôt",
    image: null,
    accent: "#7eb8d8",
  },
];

export default function ProduitPage() {
  const [selectedProduct, setSelectedProduct] = useState("porte-clef");
  const [selectedMaterial, setSelectedMaterial] = useState("bouleau");
  const currentProduct = PRODUCTS.find((p) => p.id === selectedProduct) ?? PRODUCTS[0];
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
          ← Retour à l'accueil
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
            Le produit
          </p>
          <h1 style={{
            fontFamily: "Georgia, serif", fontWeight: 300,
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)", lineHeight: 1.25,
            color: "#f0e8d8", marginBottom: 20,
          }}>
            Un souvenir qui se <em style={{ fontStyle: "italic", color: "#c9a96e" }}>touche</em>
          </h1>
          <p style={{
            fontFamily: "Georgia, serif", fontStyle: "italic",
            fontSize: 16, lineHeight: 1.8,
            color: "rgba(240,232,216,0.65)", maxWidth: 560, margin: "0 auto 48px",
          }}>
            Votre vocapsule gravée sur un support physique.
            Scannez le QR code, et la voix de ceux que vous aimez reprend vie.
          </p>
        </motion.div>

        {/* ── 1. Sélecteur d'objet ── */}
        <div style={{ marginBottom: 40 }}>
          <p style={{
            fontFamily: "Georgia, serif", fontSize: 12, letterSpacing: "0.3em",
            textTransform: "uppercase", color: "rgba(201,169,110,0.5)", marginBottom: 16,
          }}>
            Choisissez la forme
          </p>
          <div style={{
            display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap",
          }}>
            {PRODUCTS.map((prod) => (
              <button
                key={prod.id}
                onClick={() => prod.available && setSelectedProduct(prod.id)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  padding: "16px 24px", borderRadius: 20, cursor: prod.available ? "pointer" : "default",
                  background: selectedProduct === prod.id ? "rgba(201,169,110,0.08)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${selectedProduct === prod.id ? "rgba(201,169,110,0.4)" : "rgba(255,255,255,0.06)"}`,
                  color: selectedProduct === prod.id ? "#c9a96e" : "rgba(240,232,216,0.5)",
                  transition: "all 0.2s", minWidth: 120,
                  opacity: prod.available ? 1 : 0.5,
                }}
              >
                <span style={{ color: "inherit" }}>{prod.icon}</span>
                <span style={{
                  fontFamily: "Georgia, serif", fontSize: 12, letterSpacing: "0.05em",
                  fontWeight: selectedProduct === prod.id ? 600 : 400,
                }}>
                  {prod.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── 2. Sélecteur de matériau ── */}
        <div style={{ marginBottom: 48 }}>
          <p style={{
            fontFamily: "Georgia, serif", fontSize: 12, letterSpacing: "0.3em",
            textTransform: "uppercase", color: "rgba(201,169,110,0.5)", marginBottom: 16,
          }}>
            Choisissez le matériau
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
      </section>

      {/* Détail de la sélection : objet + matériau */}
      <section style={{
        position: "relative", zIndex: 10,
        maxWidth: 900, margin: "0 auto", padding: "0 24px 80px",
      }}>
        <motion.div
          key={`${currentProduct.id}-${currentMaterial.id}`}
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
            {currentMaterial.image ? (
              <img src={currentMaterial.image} alt={`${currentProduct.name} en ${currentMaterial.name}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ textAlign: "center", padding: 40 }}>
                <svg viewBox="0 0 120 140" fill="none" style={{ width: 120, height: 140, marginBottom: 16 }}>
                  <rect x="10" y="10" width="100" height="120" rx="6" fill={`${currentMaterial.accent}10`} stroke={`${currentMaterial.accent}40`} strokeWidth="1.5" />
                  <rect x="25" y="20" width="70" height="70" rx="2" fill="none" stroke={`${currentMaterial.accent}60`} strokeWidth="1" />
                  {[0,1,2,3,4,5,6].map((row) =>
                    [0,1,2,3,4,5,6].map((col) => {
                      const on = (row + col) % 3 !== 0;
                      return on ? (
                        <rect key={`${row}-${col}`} x={28 + col * 9.2} y={23 + row * 9.2} width={8} height={8} rx="1" fill={`${currentMaterial.accent}50`} />
                      ) : null;
                    })
                  )}
                  <text x="60" y="110" textAnchor="middle" fill={currentMaterial.accent} fontFamily="Georgia, serif" fontSize="10" letterSpacing="3" opacity="0.7">
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

          {/* Infos combinées */}
          <div>
            <h2 style={{
              fontFamily: "Georgia, serif", fontWeight: 400, fontSize: 26,
              color: "#f0e8d8", marginBottom: 8,
            }}>
              {currentProduct.name}
            </h2>
            <p style={{
              fontFamily: "Georgia, serif", fontSize: 13, fontStyle: "italic",
              color: currentMaterial.accent, marginBottom: 16, letterSpacing: "0.05em",
            }}>
              en {currentMaterial.name}
            </p>
            <p style={{
              fontFamily: "Georgia, serif", fontSize: 14, lineHeight: 1.8,
              color: "rgba(240,232,216,0.6)", marginBottom: 24,
            }}>
              {currentProduct.description}
            </p>

            {/* Specs objet */}
            <p style={{
              fontFamily: "Georgia, serif", fontSize: 10, letterSpacing: "0.3em",
              textTransform: "uppercase", color: "rgba(201,169,110,0.5)", marginBottom: 8,
            }}>
              Caractéristiques objet
            </p>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20,
            }}>
              {currentProduct.specs.map((spec: string) => (
                <div key={spec} style={{
                  padding: "8px 12px", borderRadius: 10,
                  background: "rgba(201,169,110,0.05)", border: "1px solid rgba(201,169,110,0.12)",
                  fontFamily: "Georgia, serif", fontSize: 11, color: "rgba(240,232,216,0.6)",
                }}>
                  {spec}
                </div>
              ))}
            </div>

            {/* Specs matériau */}
            <p style={{
              fontFamily: "Georgia, serif", fontSize: 10, letterSpacing: "0.3em",
              textTransform: "uppercase", color: `${currentMaterial.accent}80`, marginBottom: 8,
            }}>
              Caractéristiques matériau
            </p>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24,
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
                color: currentMaterial.available ? currentMaterial.accent : "rgba(240,232,216,0.3)",
              }}>
                {currentMaterial.price}
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Section processus résumé */}
      <section style={{
        position: "relative", zIndex: 10,
        maxWidth: 800, margin: "0 auto", padding: "0 24px 80px", textAlign: "center",
      }}>
        <h2 style={{
          fontFamily: "Georgia, serif", fontWeight: 300, fontSize: 24,
          color: "#f0e8d8", marginBottom: 12,
        }}>
          Du numérique au physique
        </h2>
        <p style={{
          fontFamily: "Georgia, serif", fontSize: 14, fontStyle: "italic",
          color: "rgba(240,232,216,0.5)", marginBottom: 40,
        }}>
          Votre vocapsule est d'abord créée en ligne, puis gravée sur le support de votre choix.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
          {[
            { num: "01", label: "Créez votre vocapsule", desc: "Importez vos audios et assemblez-les sur le site" },
            { num: "02", label: "Choisissez le support", desc: "Bois, plexiglas, métal — sélectionnez votre matériau" },
            { num: "03", label: "Recevez votre objet", desc: "Gravure laser de précision, expédié chez vous" },
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
              <h3 style={{
                fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 500, color: "#f0e8d8",
              }}>
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
      </section>

      {/* CTA */}
      <section style={{
        position: "relative", zIndex: 10,
        textAlign: "center", padding: "0 24px 80px",
      }}>
        <a
          href="/"
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
