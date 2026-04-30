"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import EkkoLogo from "../components/EkkoLogo";
import BlobBackground from "../components/BlobBackground";

const accent = "#c9a96e";

const ARTICLES = [
  {
    slug: "conversations-numeriques-memoire-2026",
    tag: "Mémoire · Psychologie",
    tagColor: "#7b9ec9",
    title: "Nos conversations sont-elles devenues une nouvelle forme de mémoire ?",
    excerpt: "Mémoire autobiographique, esprit étendu, paradoxe de l'archive numérique… Ce que la recherche dit sur nos messages vocaux et pourquoi la voix garde une puissance que le texte ne peut pas transmettre.",
    date: "Avril 2026",
    readTime: "12 min",
  },
  {
    slug: "cadeau-pas-cher-couple-moins-10-euros",
    tag: "Idées cadeaux · Couple",
    tagColor: "#e8637a",
    title: "🎁 10 idées de cadeaux pas chers pour son ou sa chérie (moins de 10€ mais inoubliables)",
    excerpt: "Tu cherches un cadeau pour ton ou ta chérie sans exploser ton budget ? Les meilleurs cadeaux ne coûtent presque rien — ils sont juste plus personnels, plus vrais, plus marquants.",
    date: "Avril 2026",
    readTime: "5 min",
  },
  {
    slug: "exporter-whatsapp-iphone-2026",
    tag: "Guide WhatsApp · iPhone",
    tagColor: "#25d366",
    title: "Comment exporter une conversation WhatsApp avec audios sur iPhone en 2026",
    excerpt: "Vos messages vocaux sont précieux. Voix d'un proche, fous rires entre amis, premiers mots d'amour — voici comment les récupérer et leur donner une vraie seconde vie.",
    date: "Avril 2026",
    readTime: "5 min",
  },
  {
    slug: "exporter-whatsapp-android-2026",
    tag: "Guide WhatsApp · Android",
    tagColor: "#25d366",
    title: "Comment exporter une conversation WhatsApp avec audios sur Android en 2026",
    excerpt: "Samsung, Xiaomi, Google, OnePlus… Ce guide concerne tous les smartphones Android. Récupérez vos messages vocaux et transformez-les en souvenir avec EKKO.",
    date: "Avril 2026",
    readTime: "5 min",
  },
  {
    slug: "exporter-audios-telegram-android-2026",
    tag: "Guide Telegram · Android",
    tagColor: "#2AABEE",
    title: "Comment exporter les audios d'une conversation Telegram sur Android en 2026",
    excerpt: "Samsung, Xiaomi, Google… Telegram Desktop uniquement, pas Telegram Web. Le guide complet pour récupérer vos vocaux depuis Android via ordinateur.",
    date: "Avril 2026",
    readTime: "5 min",
  },
  {
    slug: "exporter-audios-telegram-iphone-2026",
    tag: "Guide Telegram · iPhone",
    tagColor: "#2AABEE",
    title: "Comment exporter les audios d'une conversation Telegram sur iPhone en 2026",
    excerpt: "Telegram Desktop uniquement — pas Telegram Web. Tout comprendre pour récupérer vos vocaux depuis iPhone via ordinateur, et comment EKKO simplifie la suite.",
    date: "Avril 2026",
    readTime: "5 min",
  },
  {
    slug: "exporter-audios-messenger-android-2026",
    tag: "Guide Messenger · Android",
    tagColor: "#0084ff",
    title: "Comment exporter les audios d'une conversation Messenger sur Android en 2026",
    excerpt: "Samsung, Xiaomi, Google… Conversations classiques ou chiffrées E2E — les deux méthodes expliquées pas à pas pour récupérer vos vocaux Messenger.",
    date: "Avril 2026",
    readTime: "6 min",
  },
  {
    slug: "exporter-audios-messenger-iphone-2026",
    tag: "Guide Messenger · iPhone",
    tagColor: "#0084ff",
    title: "Comment exporter les audios d'une conversation Messenger sur iPhone en 2026",
    excerpt: "Conversations classiques ou chiffrées E2E — deux méthodes très différentes. Tout comprendre pour retrouver vos vocaux Messenger et les transformer en souvenir.",
    date: "Avril 2026",
    readTime: "6 min",
  },
  {
    slug: "exporter-audios-instagram-android-2026",
    tag: "Guide Instagram · Android",
    tagColor: "#e1306c",
    title: "Comment exporter les audios d'une conversation Instagram sur Android en 2026",
    excerpt: "Samsung, Xiaomi, Google… La méthode officielle Meta expliquée pas à pas. Et comment EKKO vous aide à retrouver facilement vos audios dans l'archive.",
    date: "Avril 2026",
    readTime: "5 min",
  },
  {
    slug: "exporter-audios-instagram-iphone-2026",
    tag: "Guide Instagram · iPhone",
    tagColor: "#e1306c",
    title: "Comment exporter les audios d'une conversation Instagram sur iPhone en 2026",
    excerpt: "Instagram ne permet pas d'exporter une conversation directement. Voici comment récupérer vos audios via l'archive Meta, et comment EKKO simplifie toute cette étape.",
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
