"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import EkkoLogo from "../components/EkkoLogo";
import BlobBackground from "../components/BlobBackground";

const accent = "#c9a96e";

const ARTICLES = [
  {
    slug: "exporter-whatsapp-iphone-2026",
    tag: "Guide WhatsApp",
    tagColor: "#25d366",
    title: "Comment exporter une conversation WhatsApp avec audios sur iPhone en 2026",
    excerpt: "Vos messages vocaux sont précieux. Voix d'un proche, fous rires entre amis, premiers mots d'amour — voici comment les récupérer et leur donner une vraie seconde vie.",
    date: "Avril 2026",
    readTime: "5 min",
  },
];

export default function BlogPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "#0d0a0f" }}>
      <BlobBackground variant="deuil" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-7 md:px-14">
        <button onClick={() => router.push("/")} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <EkkoLogo size="md" glow={true} />
        </button>
        <button
          onClick={() => router.push("/")}
          className="text-sm px-4 py-2 rounded-full ekko-serif transition-all duration-200"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(240,232,216,0.5)", cursor: "pointer" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(201,169,110,0.12)"; e.currentTarget.style.color = "rgba(201,169,110,0.9)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(240,232,216,0.5)"; }}
        >
          ← Retour
        </button>
      </nav>

      {/* Header */}
      <div className="relative z-10 px-6 pt-8 pb-16 max-w-3xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="ekko-serif" style={{ fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", color: `${accent}70`, marginBottom: 14 }}>
            Le blog EKKO
          </p>
          <h1 className="ekko-serif" style={{ fontSize: 36, fontWeight: 300, color: "#f0e8d8", marginBottom: 12 }}>
            Guides &amp; inspirations
          </h1>
          <p className="ekko-serif" style={{ fontSize: 15, color: "rgba(240,232,216,0.45)", fontStyle: "italic", maxWidth: 480, margin: "0 auto" }}>
            Conseils pratiques pour exporter, conserver et transformer vos souvenirs vocaux.
          </p>
        </motion.div>
      </div>

      {/* Articles */}
      <div className="relative z-10 px-6 pb-32 max-w-3xl mx-auto">
        {ARTICLES.map((a, i) => (
          <motion.article
            key={a.slug}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            onClick={() => router.push(`/blog/${a.slug}`)}
            style={{
              cursor: "pointer",
              padding: "28px 32px",
              borderRadius: 20,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              marginBottom: 20,
              transition: "border-color 0.25s, background 0.25s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = `${accent}35`;
              (e.currentTarget as HTMLElement).style.background = "rgba(201,169,110,0.04)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <span className="ekko-serif" style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: a.tagColor, padding: "3px 10px", borderRadius: 20, background: `${a.tagColor}18`, border: `1px solid ${a.tagColor}30` }}>
                {a.tag}
              </span>
              <span className="ekko-serif" style={{ fontSize: 11, color: "rgba(240,232,216,0.3)" }}>{a.date}</span>
              <span className="ekko-serif" style={{ fontSize: 11, color: "rgba(240,232,216,0.3)" }}>· {a.readTime} de lecture</span>
            </div>
            <h2 className="ekko-serif" style={{ fontSize: 20, fontWeight: 400, color: "#f0e8d8", lineHeight: 1.4, marginBottom: 12 }}>
              {a.title}
            </h2>
            <p className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.55)", lineHeight: 1.65 }}>
              {a.excerpt}
            </p>
            <p className="ekko-serif" style={{ fontSize: 13, color: accent, marginTop: 16 }}>
              Lire l&apos;article →
            </p>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
