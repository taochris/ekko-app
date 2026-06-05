"use client";
import { motion } from "framer-motion";
import BlobBackground from "../../components/BlobBackground";

const font = "Georgia, serif";
const gold = "#c9a96e";
const cream = "#f0e8d8";

const STEPS = [
  {
    number: "01",
    title: "Choisissez le format",
    desc: "Rectangulaire ou arrondie — trouvez votre étiquette en bois gravée.",
  },
  {
    number: "02",
    title: "Créez votre vocapsule",
    desc: "Importez vos messages vocaux et assemblez-les en une capsule unique.",
  },
  {
    number: "03",
    title: "Recevez votre objet",
    desc: "Gravure laser, anneau inox, expédié directement chez vous.",
  },
];

const THEMES = [
  {
    id: "deuil",
    title: "Mémoire éternelle",
    tagline: "Et si vous pouviez garder sa voix pour toujours ?",
    desc: "Créez une capsule audio avec les messages d\u2019une personne qui compte, pour pouvoir la réécouter quand vous en ressentez le besoin.",
    img: "/images/themes/theme_deuil.png",
    bgGradient: "linear-gradient(135deg, #0a1a2e 0%, #0d2a1a 50%, #081525 100%)",
    blobColor: "rgba(20, 80, 120, 0.3)",
    borderColor: "rgba(40, 130, 160, 0.2)",
    accentColor: "#4db8c8",
    ctaGradient: "linear-gradient(135deg, #1e6487, #2a9d8f)",
  },
  {
    id: "amitie",
    title: "Amitiés & joie",
    tagline: "Et si vos fous rires ne disparaissaient jamais ?",
    desc: "Gardez vos délires, vos fous rires et vos moments cultes dans une capsule audio à partager entre amis.",
    img: "/images/themes/theme_amitie.png",
    bgGradient: "linear-gradient(135deg, #2a1200 0%, #3d1a00 50%, #241000 100%)",
    blobColor: "rgba(160, 70, 10, 0.3)",
    borderColor: "rgba(200, 110, 30, 0.2)",
    accentColor: "#f0a855",
    ctaGradient: "linear-gradient(135deg, #c85a00, #e8913a)",
  },
  {
    id: "amour",
    title: "Amour & intimité",
    tagline: "Et si vous lui offriez vos plus beaux instants à réécouter ?",
    desc: "Ces vocaux qu\u2019on réécoute, ces messages du soir, ces premiers \u00ab\u00a0je t\u2019aime\u00a0\u00bb qu\u2019on n\u2019oublie pas. Créez un souvenir audio de votre histoire, rien que pour vous deux.",
    img: "/images/themes/theme_couple.png",
    bgGradient: "linear-gradient(135deg, #200a15 0%, #2e0a1a 50%, #180710 100%)",
    blobColor: "rgba(140, 20, 60, 0.3)",
    borderColor: "rgba(180, 40, 80, 0.2)",
    accentColor: "#e05580",
    ctaGradient: "linear-gradient(135deg, #8b1a3a, #c94070)",
  },
];

const SCENES = [
  {
    id: "joie",
    eyebrow: "La joie",
    hook: "Vos fous rires ne s’effacent jamais.",
    desc: "Un concentré de vos meilleurs moments — les vannes, les délires, les voix qu’on aime. Toujours dans votre poche, prêts à être réécoutés.",
    points: [
      "Vos messages les plus drôles réunis",
      "Un cadeau complice entre amis",
      "À réécouter quand le moral flanche",
    ],
    accent: "#f0a855",
    media: { type: "image", src: "/images/themes/theme_amitie.png" },
  },
  {
    id: "deuil",
    eyebrow: "La mémoire",
    hook: "Ne plus jamais appeler son répondeur juste pour entendre sa voix.",
    desc: "Garder la voix de l’être disparu tout près de soi, sur ses clés. Choisissez les audios qui comptent — ils restent accessibles à tout moment, pour toujours.",
    points: [
      "Sa voix, sur vous, en permanence",
      "Vous choisissez les enregistrements",
      "Accessible d’un simple scan, à vie",
    ],
    accent: "#4db8c8",
    media: { type: "video", src: "" },
  },
  {
    id: "offrir",
    eyebrow: "Offrir",
    hook: "Une lettre, mais dite. Et qu’on n’égare jamais.",
    desc: "Enregistrez un message rien que pour elle, pour lui. Gravé dans le bois, il devient un objet qu’on garde — bien plus qu’un audio perdu dans un téléphone.",
    points: [
      "Votre message, dit avec vos mots",
      "Gravé dans le bois pour durer",
      "Toujours là, toujours accessible",
    ],
    accent: "#e05580",
    media: { type: "image", src: "/images/themes/theme_couple.png" },
  },
];

export default function ProduitThemesPage() {
  return (
    <div style={{ position: "relative", minHeight: "100vh", width: "100%", overflowX: "hidden" }}>
      <BlobBackground variant="home" />

      {/* Nav retour */}
      <nav style={{
        position: "relative", zIndex: 500,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "24px 40px",
      }}>
        <a href="/">
          <img src="/ekko-logo.png" alt="EKKO" style={{ height: 60, width: "auto", objectFit: "contain", mixBlendMode: "screen" }} />
        </a>
        <a href="/produit" style={{
          fontFamily: font, fontSize: 12, fontWeight: 600, letterSpacing: "0.16em",
          textTransform: "uppercase", color: "rgba(187,178,156,0.88)",
          textDecoration: "none",
        }}>
          ← Retour au porte-clé
        </a>
      </nav>

      {/* Hero */}
      <section style={{
        position: "relative", zIndex: 10,
        maxWidth: 800, margin: "0 auto", padding: "60px 24px 80px",
        textAlign: "center",
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p style={{
            fontFamily: font, fontSize: 11, letterSpacing: "0.5em",
            textTransform: "uppercase", color: `${gold}99`, marginBottom: 16,
          }}>
            Porte-clé EKKO
          </p>
          <h1 style={{
            fontFamily: font, fontWeight: 300,
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)", lineHeight: 1.3,
            color: cream, marginBottom: 24,
          }}>
            Choisissez votre{" "}
            <em style={{ fontStyle: "italic", color: gold }}>univers sonore</em>
          </h1>
          <p style={{
            fontFamily: font, fontStyle: "italic", fontSize: 16, lineHeight: 1.8,
            color: "rgba(240,232,216,0.65)", maxWidth: 520, margin: "0 auto 56px",
          }}>
            Sélectionnez un thème, importez vos messages vocaux et recevez votre porte-clé
            en bois gravé — avec votre vocapsule déjà liée.
          </p>
        </motion.div>
      </section>

      {/* Grille thèmes */}
      <div style={{
        position: "relative", zIndex: 10,
        maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px",
      }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24,
        }} className="produit-themes-grid">
          {THEMES.map((theme, i) => (
            <motion.a
              key={theme.id}
              href={`/theme-porteClef/${theme.id}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              style={{ position: "relative", textDecoration: "none", display: "block", height: "100%" }}
            >
              <div style={{
                position: "relative",
                borderRadius: 32,
                overflow: "hidden",
                background: theme.bgGradient,
                border: `1px solid ${theme.borderColor}`,
                boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
                padding: 28,
                display: "flex", flexDirection: "column", gap: 16,
                height: "100%", boxSizing: "border-box",
              }}>
                {/* Blob haut-droite */}
                <div style={{
                  position: "absolute", top: 0, right: 0,
                  width: 160, height: 160, borderRadius: "50%",
                  background: theme.blobColor, filter: "blur(48px)",
                  transform: "translate(20%,-20%)", pointerEvents: "none",
                }} />
                {/* Blob bas-gauche */}
                <div style={{
                  position: "absolute", bottom: 0, left: 0,
                  width: 120, height: 120, borderRadius: "50%",
                  background: theme.blobColor, filter: "blur(40px)",
                  transform: "translate(-20%,20%)", pointerEvents: "none",
                }} />

                {/* Titre */}
                <h3 style={{
                  fontFamily: font, fontSize: 20, fontWeight: 600, color: cream,
                  margin: 0, textAlign: "center", position: "relative",
                  minHeight: "3.2rem", display: "flex", alignItems: "center", justifyContent: "center",
                }}>{theme.title}</h3>

                {/* Photo */}
                <div style={{ width: "100%", aspectRatio: "4/3", overflow: "hidden", borderRadius: 16, position: "relative", flexShrink: 0 }}>
                  <img
                    src={theme.img}
                    alt={theme.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </div>

                {/* Texte */}
                <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 10, flex: 1, textAlign: "center", alignItems: "center" }}>
                  <p style={{
                    fontFamily: font, fontSize: 14, fontStyle: "italic", lineHeight: 1.5,
                    color: theme.accentColor, margin: 0,
                  }}>{theme.tagline}</p>
                  <p style={{
                    fontFamily: font, fontSize: 13, lineHeight: 1.7,
                    color: "rgba(240,232,216,0.55)", margin: 0,
                  }}>{theme.desc}</p>
                </div>

                {/* Bouton */}
                <div style={{
                  position: "relative",
                  width: "100%", padding: "14px 0", borderRadius: 16,
                  background: theme.ctaGradient,
                  color: "#fff", fontFamily: font, fontSize: 13,
                  fontWeight: 500, letterSpacing: "0.05em",
                  textAlign: "center", marginTop: "auto", flexShrink: 0,
                }}>
                  Choisir ce thème
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>

      {/* En trois gestes simples */}
      <section style={{ position: "relative", zIndex: 10, width: "100%", padding: "80px 56px", boxSizing: "border-box" }}>
        <div style={{ width: "100%", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p style={{ fontSize: 11, letterSpacing: "0.5em", textTransform: "uppercase", color: "rgba(201,169,110,0.5)", marginBottom: 16, fontFamily: font }}>
              Le processus
            </p>
            <h2 style={{ fontFamily: font, fontWeight: 300, fontSize: 30, marginBottom: 56, color: cream }}>
              En trois gestes simples
            </h2>
          </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 40 }} className="produit-steps-grid">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}
              >
                <div style={{ width: 56, height: 56, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.2)" }}>
                  <span style={{ fontFamily: font, fontSize: 18, fontWeight: 300, color: gold }}>{step.number}</span>
                </div>
                <div style={{ height: 1, width: 120, background: "linear-gradient(90deg, transparent, rgba(201,169,110,0.2), transparent)" }} />
                <h3 style={{ fontFamily: font, fontSize: 20, fontWeight: 500, color: cream }}>{step.title}</h3>
                <p style={{ fontFamily: font, fontSize: 13, lineHeight: 1.7, color: "rgba(240,232,216,0.45)", maxWidth: 240, margin: "0 auto" }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: "relative", zIndex: 10, width: "100%", borderTop: "1px solid rgba(201,169,110,0.08)", padding: "32px 56px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, boxSizing: "border-box" }}>
        <img src="/ekko-logo.png" alt="EKKO" style={{ height: 40, width: "auto", objectFit: "contain", mixBlendMode: "screen" }} />
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 20, justifyContent: "flex-end" }}>
          <a href="/cgv" style={{ fontFamily: font, fontSize: 11, color: "rgba(240,232,216,0.35)", textDecoration: "none", letterSpacing: "0.1em" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = gold; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(240,232,216,0.35)"; }}>CGV</a>
          <a href="/rgpd" style={{ fontFamily: font, fontSize: 11, color: "rgba(240,232,216,0.35)", textDecoration: "none", letterSpacing: "0.1em" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = gold; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(240,232,216,0.35)"; }}>Confidentialité</a>
          <p style={{ fontFamily: font, fontSize: 11, color: "rgba(240,232,216,0.25)", margin: 0 }}>© 2025 EKKO. Tous droits réservés.</p>
          <a href="mailto:vosekko@outlook.com" style={{ fontFamily: font, fontSize: 11, color: "rgba(240,232,216,0.35)", textDecoration: "none", letterSpacing: "0.1em" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = gold; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(240,232,216,0.35)"; }}>Contact</a>
        </div>
      </footer>

      <style>{`
        @media (max-width: 700px) {
          .produit-themes-grid {
            grid-template-columns: 1fr !important;
          }
          .produit-steps-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
