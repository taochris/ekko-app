"use client";
import { motion } from "framer-motion";
import BlobBackground from "../components/BlobBackground";

const STEPS = [
  {
    number: "01",
    title: "Importez vos archives vocales",
    description:
      "Exportez vos conversations depuis WhatsApp, Instagram, Telegram ou Messenger. L'archive contient tous vos messages vocaux. Déposez-la simplement sur EKKO.",
    details: [
      "Formats supportés : ZIP (WhatsApp), fichiers audio individuels",
      "Compatible : MP3, WAV, OGG, OPUS, M4A, AAC, FLAC",
      "Fonctionne sur mobile et ordinateur",
    ],
    videoPlaceholder: true, // TODO: remplacer par l'URL de la vidéo
  },
  {
    number: "02",
    title: "Sélectionnez les messages qui comptent",
    description:
      "EKKO extrait automatiquement chaque message vocal. Écoutez-les un par un, sélectionnez ceux que vous souhaitez garder, et réorganisez-les dans l'ordre qui vous touche.",
    details: [
      "Pré-écoute instantanée de chaque message",
      "Sélection par simple clic",
      "Réorganisation par glisser-déposer",
    ],
    videoPlaceholder: true,
  },
  {
    number: "03",
    title: "Créez votre vocapsule",
    description:
      "EKKO fusionne vos messages vocaux sélectionnés en un seul fichier audio fluide. Un QR code unique est généré : il suffit de le scanner pour réécouter votre souvenir.",
    details: [
      "Fusion automatique haute qualité",
      "QR code unique et permanent",
      "Téléchargement MP3 inclus",
      "Lien de partage sécurisé",
    ],
    videoPlaceholder: true,
  },
  {
    number: "04",
    title: "Gravez-le sur un objet",
    description:
      "Choisissez un support physique pour votre QR code. Le bois d'abord, bientôt le plexiglas et le métal. Gravure laser de précision, expédié chez vous.",
    details: [
      "Bois de hêtre massif (disponible)",
      "Plexiglas transparent (bientôt)",
      "Métal brossé aluminium (bientôt)",
      "Gravure laser HD — scannable à vie",
    ],
    videoPlaceholder: true,
    isNew: true,
  },
];

export default function CommentCamarchePage() {
  return (
    <div style={{ position: "relative", minHeight: "100vh", width: "100%", overflowX: "hidden" }}>
      <BlobBackground variant="home" />

      {/* Nav */}
      <nav style={{
        position: "relative", zIndex: 10,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "24px 40px",
      }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <img src="/ekko-logo.png" alt="EKKO" style={{ height: 60, width: "auto", objectFit: "contain", mixBlendMode: "screen" }} />
        </a>
        <div style={{ display: "flex", gap: 20 }}>
          <a href="/produit" style={{
            fontFamily: "Georgia, serif", fontSize: 12, letterSpacing: "0.2em",
            textTransform: "uppercase", color: "rgba(240,232,216,0.4)",
            textDecoration: "none",
          }}>
            Le produit
          </a>
          <a href="/" style={{
            fontFamily: "Georgia, serif", fontSize: 12, letterSpacing: "0.2em",
            textTransform: "uppercase", color: "rgba(240,232,216,0.4)",
            textDecoration: "none",
          }}>
            Accueil
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        position: "relative", zIndex: 10,
        maxWidth: 800, margin: "0 auto", padding: "40px 24px 60px",
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
            Le processus
          </p>
          <h1 style={{
            fontFamily: "Georgia, serif", fontWeight: 300,
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)", lineHeight: 1.25,
            color: "#f0e8d8", marginBottom: 20,
          }}>
            Comment ça <em style={{ fontStyle: "italic", color: "#c9a96e" }}>marche</em>
          </h1>
          <p style={{
            fontFamily: "Georgia, serif", fontStyle: "italic",
            fontSize: 16, lineHeight: 1.8,
            color: "rgba(240,232,216,0.6)", maxWidth: 520, margin: "0 auto",
          }}>
            De vos messages vocaux à un objet-souvenir,
            en quelques minutes.
          </p>
        </motion.div>
      </section>

      {/* Étapes */}
      <section style={{
        position: "relative", zIndex: 10,
        maxWidth: 900, margin: "0 auto", padding: "0 24px 80px",
      }}>
        {STEPS.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: i * 0.1 }}
            style={{
              display: "grid",
              gridTemplateColumns: i % 2 === 0 ? "1fr 1fr" : "1fr 1fr",
              gap: 40, alignItems: "center",
              marginBottom: 80,
            }}
          >
            {/* Vidéo / Placeholder — alternance gauche/droite */}
            <div style={{
              order: i % 2 === 0 ? 0 : 1,
              aspectRatio: "16/9", borderRadius: 20,
              background: "linear-gradient(135deg, rgba(20,16,24,0.8), rgba(30,24,36,0.5))",
              border: "1px solid rgba(201,169,110,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden",
            }}>
              {/* TODO: remplacer par <video> quand les vidéos seront prêtes */}
              <div style={{ textAlign: "center", padding: 24 }}>
                <svg viewBox="0 0 64 64" fill="none" style={{ width: 48, height: 48, marginBottom: 12 }}>
                  <circle cx="32" cy="32" r="28" stroke="rgba(201,169,110,0.3)" strokeWidth="1.5" />
                  <path d="M26 22 L44 32 L26 42 Z" fill="rgba(201,169,110,0.4)" />
                </svg>
                <p style={{
                  fontFamily: "Georgia, serif", fontSize: 11, fontStyle: "italic",
                  color: "rgba(201,169,110,0.4)",
                }}>
                  Vidéo démonstrative à venir
                </p>
              </div>
            </div>

            {/* Contenu texte */}
            <div style={{ order: i % 2 === 0 ? 1 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <span style={{
                  fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 200,
                  color: "#c9a96e",
                }}>
                  {step.number}
                </span>
                {step.isNew && (
                  <span style={{
                    fontSize: 9, padding: "3px 10px", borderRadius: 8,
                    background: "rgba(201,169,110,0.15)", border: "1px solid rgba(201,169,110,0.3)",
                    color: "#c9a96e", fontFamily: "Georgia, serif", fontWeight: 600,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                  }}>
                    Nouveau
                  </span>
                )}
              </div>

              <h2 style={{
                fontFamily: "Georgia, serif", fontWeight: 400, fontSize: 22,
                color: "#f0e8d8", marginBottom: 14, lineHeight: 1.3,
              }}>
                {step.title}
              </h2>

              <p style={{
                fontFamily: "Georgia, serif", fontSize: 14, lineHeight: 1.8,
                color: "rgba(240,232,216,0.55)", marginBottom: 20,
              }}>
                {step.description}
              </p>

              {/* Détails */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {step.details.map((detail) => (
                  <div key={detail} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    fontFamily: "Georgia, serif", fontSize: 12,
                    color: "rgba(240,232,216,0.45)",
                  }}>
                    <span style={{
                      width: 5, height: 5, borderRadius: "50%",
                      background: "rgba(201,169,110,0.5)", flexShrink: 0,
                    }} />
                    {detail}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* CTA final */}
      <section style={{
        position: "relative", zIndex: 10,
        textAlign: "center", padding: "0 24px 80px",
      }}>
        <p style={{
          fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 18,
          color: "rgba(240,232,216,0.5)", marginBottom: 24,
        }}>
          Prêt à créer votre souvenir ?
        </p>
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
          Commencer maintenant
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
          section > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
          section > div > div[style*="order: 1"] {
            order: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
