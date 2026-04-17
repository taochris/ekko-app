"use client";
import { motion } from "framer-motion";
import BlobBackground from "./BlobBackground";
import EkkoLogo from "./EkkoLogo";
import ThemeCard from "./ThemeCard";

const S = {
  page: {
    position: "relative" as const,
    minHeight: "100vh",
    width: "100%",
    overflowX: "hidden" as const,
  },
  nav: {
    position: "relative" as const,
    zIndex: 10,
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "28px 56px",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: 32,
  },
  navLink: {
    fontSize: 12,
    letterSpacing: "0.2em",
    textTransform: "uppercase" as const,
    color: "rgba(240,232,216,0.35)",
    textDecoration: "none",
    fontFamily: "Georgia, serif",
    transition: "color 0.2s",
  },
  hero: {
    position: "relative" as const,
    zIndex: 10,
    width: "100%",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center" as const,
    padding: "16px 24px 40px",
  },
  heroLine: {
    width: 1,
    height: 40,
    marginBottom: 20,
    background: "linear-gradient(to bottom, transparent, rgba(201,169,110,0.4))",
  },
  heroTag: {
    fontSize: 11,
    letterSpacing: "0.5em",
    textTransform: "uppercase" as const,
    color: "rgba(201,169,110,0.65)",
    marginBottom: 16,
    fontFamily: "Georgia, serif",
  },
  heroTitle: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontWeight: 300,
    fontSize: "clamp(1.4rem, 3.5vw, 2.4rem)",
    lineHeight: 1.25,
    maxWidth: 640,
    marginBottom: 16,
    color: "#f0e8d8",
  },
  heroEm: {
    fontStyle: "italic",
    fontWeight: 400,
    color: "#c9a96e",
  },
  heroSub: {
    fontFamily: "Georgia, serif",
    fontStyle: "italic",
    fontSize: 14,
    lineHeight: 1.7,
    maxWidth: 520,
    marginBottom: 24,
    color: "rgba(240,232,216,0.60)",
  },
  scrollHint: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 8,
  },
  scrollLabel: {
    fontSize: 10,
    letterSpacing: "0.4em",
    textTransform: "uppercase" as const,
    color: "rgba(201,169,110,0.60)",
    fontFamily: "Georgia, serif",
  },
  scrollLine: {
    width: 1,
    height: 32,
    background: "linear-gradient(to bottom, rgba(201,169,110,0.4), transparent)",
  },
  cardsSection: {
    position: "relative" as const,
    zIndex: 10,
    width: "100%",
    padding: "0 56px 64px",
    boxSizing: "border-box" as const,
  },
  cardsGrid: {
    width: "100%",
    maxWidth: 1200,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 20,
  },
  howSection: {
    position: "relative" as const,
    zIndex: 10,
    width: "100%",
    padding: "80px 56px",
    boxSizing: "border-box" as const,
  },
  howInner: {
    width: "100%",
    maxWidth: 900,
    margin: "0 auto",
    textAlign: "center" as const,
  },
  howTag: {
    fontSize: 11,
    letterSpacing: "0.5em",
    textTransform: "uppercase" as const,
    color: "rgba(201,169,110,0.5)",
    marginBottom: 16,
    fontFamily: "Georgia, serif",
  },
  howTitle: {
    fontFamily: "Georgia, serif",
    fontWeight: 300,
    fontSize: 30,
    marginBottom: 56,
    color: "#f0e8d8",
  },
  howGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 40,
  },
  howStep: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 16,
  },
  howCircle: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(201,169,110,0.08)",
    border: "1px solid rgba(201,169,110,0.2)",
  },
  howNum: {
    fontFamily: "Georgia, serif",
    fontSize: 18,
    fontWeight: 300,
    color: "#c9a96e",
  },
  howDivider: {
    height: 1,
    width: 120,
    background: "linear-gradient(90deg, transparent, rgba(201,169,110,0.2), transparent)",
  },
  howStepTitle: {
    fontFamily: "Georgia, serif",
    fontSize: 20,
    fontWeight: 500,
    color: "#f0e8d8",
  },
  howStepDesc: {
    fontFamily: "Georgia, serif",
    fontSize: 13,
    lineHeight: 1.7,
    color: "rgba(240,232,216,0.45)",
    maxWidth: 240,
    margin: "0 auto",
  },
  footer: {
    position: "relative" as const,
    zIndex: 10,
    width: "100%",
    borderTop: "1px solid rgba(201,169,110,0.08)",
    padding: "32px 56px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxSizing: "border-box" as const,
  },
  footerCopy: {
    fontFamily: "Georgia, serif",
    fontSize: 11,
    color: "rgba(240,232,216,0.2)",
  },
  footerPrivacy: {
    fontFamily: "Georgia, serif",
    fontSize: 10,
    letterSpacing: "0.3em",
    textTransform: "uppercase" as const,
    color: "rgba(201,169,110,0.3)",
  },
};

const steps = [
  {
    number: "01",
    title: "Importez",
    desc: "Déposez vos archives WhatsApp, Instagram, Telegram ou Messenger directement depuis votre appareil.",
  },
  {
    number: "02",
    title: "Sélectionnez",
    desc: "Choisissez les messages vocaux qui comptent. Filtrez par date, durée, source.",
  },
  {
    number: "03",
    title: "Créez",
    desc: "Générez un QR code unique qui lance instantanément votre audio, depuis n'importe quel appareil.",
  },
];

export default function HomePage() {
  return (
    <div style={S.page}>
      <style>{`
        @media (max-width: 700px) {
          .home-nav { padding: 20px 20px !important; }
          .home-nav-links { gap: 16px !important; }
          .home-nav-links a { font-size: 10px !important; letter-spacing: 0.1em !important; }
          .home-cards-section { padding: 0 16px 48px !important; }
          .home-cards-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .home-how-section { padding: 60px 20px !important; }
          .home-how-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .home-footer { padding: 24px 20px !important; flex-wrap: wrap; gap: 12px; }
        }
      `}</style>
      <BlobBackground variant="home" />

      {/* Nav */}
      <nav style={S.nav} className="home-nav">
        <EkkoLogo size="lg" glow={true} />
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={S.navLinks}
          className="home-nav-links"
        >
          <a href="#produit" style={S.navLink}>Le produit</a>
          <a href="#comment" style={S.navLink}>Comment ça marche</a>
        </motion.div>
      </nav>

      {/* Hero */}
      <section style={S.hero}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          style={S.heroLine}
        />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={S.heroTag}
        >
          Mémoire · Son · Éternité
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          style={S.heroTitle}
        >
          Fusionnez vos souvenirs,<br />
          <em style={S.heroEm}>réécoutez vos émotions.</em>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          style={S.heroSub}
        >
          Transformez vos messages vocaux en vocapsules audio.
          Des instants éphémères devenus objets éternels.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          style={S.scrollHint}
        >
          <span style={S.scrollLabel}>Choisissez votre univers</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            style={S.scrollLine}
          />
        </motion.div>
      </section>

      {/* Cards */}
      <section id="produit" style={S.cardsSection} className="home-cards-section">
        <div style={S.cardsGrid} className="home-cards-grid">
          <ThemeCard theme="deuil" index={0} />
          <ThemeCard theme="amitie" index={1} />
          <ThemeCard theme="amour" index={2} />
        </div>
      </section>

      {/* How it works */}
      <section id="comment" style={S.howSection} className="home-how-section">
        <div style={S.howInner}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p style={S.howTag}>Le processus</p>
            <h2 style={S.howTitle}>En trois gestes simples</h2>
          </motion.div>
          <div style={S.howGrid} className="home-how-grid">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                style={S.howStep}
              >
                <div style={S.howCircle}>
                  <span style={S.howNum}>{step.number}</span>
                </div>
                <div style={S.howDivider} />
                <h3 style={S.howStepTitle}>{step.title}</h3>
                <p style={S.howStepDesc}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Prix */}
      <section style={{ textAlign: "center", padding: "32px 24px 40px", position: "relative", zIndex: 10 }}>
        <div
          style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "12px 24px", borderRadius: 50, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <span style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "rgba(240,232,216,0.25)", textDecoration: "line-through" }}>19,90 €</span>
          <span style={{ fontFamily: "Georgia, serif", fontSize: 15, color: "#c9a96e" }}>9,90 €</span>
          <span style={{ fontFamily: "Georgia, serif", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,232,216,0.3)" }}>offre de lancement</span>
        </div>
      </section>

      {/* Footer */}
      <footer style={S.footer} className="home-footer">
        <EkkoLogo size="sm" glow={false} />
        <p style={S.footerCopy}>© 2025 EKKO. Tous droits réservés.</p>
        <p style={S.footerPrivacy}>Vos données restent sur votre appareil</p>
      </footer>
    </div>
  );
}
