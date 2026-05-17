"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import BlobBackground from "../components/BlobBackground";

const MATERIALS = [
  {
    id: "bois",
    name: "Bois naturel",
    available: true,
    description:
      "Gravure laser sur bois de hêtre massif. Le grain naturel du bois rend chaque pièce unique. Le QR code est gravé avec précision pour un rendu élégant et durable.",
    specs: ["Hêtre massif", "40 × 45 mm", "Épaisseur 3 mm", "Gravure laser HD"],
    price: "à venir",
    image: null, // TODO: remplacer par le chemin vers la photo du produit fini
    accent: "#c9a96e",
  },
  {
    id: "plexi",
    name: "Plexiglas",
    available: false,
    description:
      "Découpe et gravure sur plexiglas transparent ou teinté. Un rendu moderne et épuré, parfait pour un intérieur contemporain.",
    specs: ["Plexiglas 3mm", "Format carte", "Gravure + découpe", "Plusieurs teintes"],
    price: "bientôt",
    image: null,
    accent: "#7eb8d8",
  },
  {
    id: "metal",
    name: "Métal brossé",
    available: false,
    description:
      "Gravure sur plaque d'aluminium anodisé. L'option premium pour un objet indestructible qui traversera les décennies.",
    specs: ["Aluminium anodisé", "Format carte", "Gravure profonde", "Résistant à l'eau"],
    price: "bientôt",
    image: null,
    accent: "#b0b8c0",
  },
];

export default function ProduitPage() {
  const [selected, setSelected] = useState("bois");
  const current = MATERIALS.find((m) => m.id === selected) ?? MATERIALS[0];

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

        {/* Sélecteur de matériau */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 12, marginBottom: 48, flexWrap: "wrap",
        }}>
          {MATERIALS.map((mat) => (
            <button
              key={mat.id}
              onClick={() => mat.available && setSelected(mat.id)}
              style={{
                fontFamily: "Georgia, serif", fontSize: 13, letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "12px 24px", borderRadius: 50, cursor: mat.available ? "pointer" : "default",
                background: selected === mat.id ? `${mat.accent}20` : "rgba(255,255,255,0.03)",
                border: `1px solid ${selected === mat.id ? `${mat.accent}50` : "rgba(255,255,255,0.08)"}`,
                color: selected === mat.id ? mat.accent : mat.available ? "rgba(240,232,216,0.5)" : "rgba(240,232,216,0.2)",
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
      </section>

      {/* Détail du matériau sélectionné */}
      <section style={{
        position: "relative", zIndex: 10,
        maxWidth: 900, margin: "0 auto", padding: "0 24px 80px",
      }}>
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40,
            alignItems: "center",
          }}
        >
          {/* Visuel produit */}
          <div style={{
            aspectRatio: "1", borderRadius: 24,
            background: `linear-gradient(135deg, rgba(20,16,24,0.8), rgba(30,24,36,0.6))`,
            border: `1px solid ${current.accent}20`,
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
          }}>
            {current.image ? (
              <img src={current.image} alt={current.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ textAlign: "center", padding: 40 }}>
                {/* Placeholder SVG — représentation schématique du produit */}
                <svg viewBox="0 0 120 140" fill="none" style={{ width: 120, height: 140, marginBottom: 16 }}>
                  {/* Plaque */}
                  <rect x="10" y="10" width="100" height="120" rx="6" fill={`${current.accent}10`} stroke={`${current.accent}40`} strokeWidth="1.5" />
                  {/* QR Code simplifié */}
                  <rect x="25" y="20" width="70" height="70" rx="2" fill="none" stroke={`${current.accent}60`} strokeWidth="1" />
                  {[0,1,2,3,4,5,6].map((row) =>
                    [0,1,2,3,4,5,6].map((col) => {
                      const on = (row + col) % 3 !== 0;
                      return on ? (
                        <rect key={`${row}-${col}`} x={28 + col * 9.2} y={23 + row * 9.2} width={8} height={8} rx="1" fill={`${current.accent}50`} />
                      ) : null;
                    })
                  )}
                  {/* EKKO text */}
                  <text x="60" y="110" textAnchor="middle" fill={current.accent} fontFamily="Georgia, serif" fontSize="10" letterSpacing="3" opacity="0.7">
                    EKKO
                  </text>
                </svg>
                <p style={{
                  fontFamily: "Georgia, serif", fontSize: 12, fontStyle: "italic",
                  color: `${current.accent}60`,
                }}>
                  Photo du produit fini à venir
                </p>
              </div>
            )}
          </div>

          {/* Infos */}
          <div>
            <h2 style={{
              fontFamily: "Georgia, serif", fontWeight: 400, fontSize: 28,
              color: "#f0e8d8", marginBottom: 16,
            }}>
              {current.name}
            </h2>
            <p style={{
              fontFamily: "Georgia, serif", fontSize: 15, lineHeight: 1.8,
              color: "rgba(240,232,216,0.6)", marginBottom: 28,
            }}>
              {current.description}
            </p>

            {/* Specs */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28,
            }}>
              {current.specs.map((spec) => (
                <div key={spec} style={{
                  padding: "10px 14px", borderRadius: 12,
                  background: `${current.accent}08`, border: `1px solid ${current.accent}15`,
                  fontFamily: "Georgia, serif", fontSize: 12, color: current.accent,
                  letterSpacing: "0.05em",
                }}>
                  {spec}
                </div>
              ))}
            </div>

            {/* Prix */}
            <div style={{
              padding: "16px 20px", borderRadius: 16,
              background: "rgba(255,255,255,0.03)", border: `1px solid ${current.accent}20`,
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
                color: current.available ? current.accent : "rgba(240,232,216,0.3)",
              }}>
                {current.price}
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
          section > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
