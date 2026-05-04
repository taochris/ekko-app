"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BlobBackground from "../components/BlobBackground";

const accent = "#c9a96e";

type Article = {
  slug: string;
  tag: string;
  tagColor: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
};

const ARTICLES: Article[] = [
  // ── Inspirations & souvenirs ──────────────────────────────────────────────
  {
    slug: "conversations-numeriques-memoire-2026",
    tag: "Mémoire · Psychologie",
    tagColor: "#7b9ec9",
    title: "Nos conversations sont-elles devenues une nouvelle forme de mémoire ?",
    excerpt: "Mémoire autobiographique, esprit étendu, paradoxe de l'archive numérique… Ce que la recherche dit sur nos messages vocaux et pourquoi la voix garde une puissance que le texte ne peut pas transmettre.",
    date: "Avril 2026",
    readTime: "12 min",
    category: "inspiration",
  },
  {
    slug: "cadeau-pas-cher-couple-moins-10-euros",
    tag: "Idées cadeaux · Couple",
    tagColor: "#e8637a",
    title: "🎁 10 idées de cadeaux pas chers pour son ou sa chérie (moins de 10€ mais inoubliables)",
    excerpt: "Tu cherches un cadeau pour ton ou ta chérie sans exploser ton budget ? Les meilleurs cadeaux ne coûtent presque rien — ils sont juste plus personnels, plus vrais, plus marquants.",
    date: "Avril 2026",
    readTime: "5 min",
    category: "inspiration",
  },
  // ── Guides WhatsApp ───────────────────────────────────────────────────────
  {
    slug: "exporter-whatsapp-iphone-2026",
    tag: "Guide WhatsApp · iPhone",
    tagColor: "#25d366",
    title: "Comment exporter une conversation WhatsApp avec audios sur iPhone en 2026",
    excerpt: "Vos messages vocaux sont précieux. Voix d'un proche, fous rires entre amis, premiers mots d'amour — voici comment les récupérer et leur donner une vraie seconde vie.",
    date: "Avril 2026",
    readTime: "5 min",
    category: "guides",
  },
  {
    slug: "exporter-whatsapp-android-2026",
    tag: "Guide WhatsApp · Android",
    tagColor: "#25d366",
    title: "Comment exporter une conversation WhatsApp avec audios sur Android en 2026",
    excerpt: "Samsung, Xiaomi, Google, OnePlus… Ce guide concerne tous les smartphones Android. Récupérez vos messages vocaux et transformez-les en souvenir avec EKKO.",
    date: "Avril 2026",
    readTime: "5 min",
    category: "guides",
  },
  // ── Guides Telegram ───────────────────────────────────────────────────────
  {
    slug: "exporter-audios-telegram-iphone-2026",
    tag: "Guide Telegram · iPhone",
    tagColor: "#2AABEE",
    title: "Comment exporter les audios d'une conversation Telegram sur iPhone en 2026",
    excerpt: "Telegram Desktop uniquement — pas Telegram Web. Tout comprendre pour récupérer vos vocaux depuis iPhone via ordinateur, et comment EKKO simplifie la suite.",
    date: "Avril 2026",
    readTime: "5 min",
    category: "guides",
  },
  {
    slug: "exporter-audios-telegram-android-2026",
    tag: "Guide Telegram · Android",
    tagColor: "#2AABEE",
    title: "Comment exporter les audios d'une conversation Telegram sur Android en 2026",
    excerpt: "Samsung, Xiaomi, Google… Telegram Desktop uniquement, pas Telegram Web. Le guide complet pour récupérer vos vocaux depuis Android via ordinateur.",
    date: "Avril 2026",
    readTime: "5 min",
    category: "guides",
  },
  // ── Guides Messenger ──────────────────────────────────────────────────────
  {
    slug: "exporter-audios-messenger-iphone-2026",
    tag: "Guide Messenger · iPhone",
    tagColor: "#0084ff",
    title: "Comment exporter les audios d'une conversation Messenger sur iPhone en 2026",
    excerpt: "Conversations classiques ou chiffrées E2E — deux méthodes très différentes. Tout comprendre pour retrouver vos vocaux Messenger et les transformer en souvenir.",
    date: "Avril 2026",
    readTime: "6 min",
    category: "guides",
  },
  {
    slug: "exporter-audios-messenger-android-2026",
    tag: "Guide Messenger · Android",
    tagColor: "#0084ff",
    title: "Comment exporter les audios d'une conversation Messenger sur Android en 2026",
    excerpt: "Samsung, Xiaomi, Google… Conversations classiques ou chiffrées E2E — les deux méthodes expliquées pas à pas pour récupérer vos vocaux Messenger.",
    date: "Avril 2026",
    readTime: "6 min",
    category: "guides",
  },
  // ── Guides Instagram ──────────────────────────────────────────────────────
  {
    slug: "exporter-audios-instagram-iphone-2026",
    tag: "Guide Instagram · iPhone",
    tagColor: "#e1306c",
    title: "Comment exporter les audios d'une conversation Instagram sur iPhone en 2026",
    excerpt: "Instagram ne permet pas d'exporter une conversation directement. Voici comment récupérer vos audios via l'archive Meta, et comment EKKO simplifie toute cette étape.",
    date: "Avril 2026",
    readTime: "5 min",
    category: "guides",
  },
  {
    slug: "exporter-audios-instagram-android-2026",
    tag: "Guide Instagram · Android",
    tagColor: "#e1306c",
    title: "Comment exporter les audios d'une conversation Instagram sur Android en 2026",
    excerpt: "Samsung, Xiaomi, Google… La méthode officielle Meta expliquée pas à pas. Et comment EKKO vous aide à retrouver facilement vos audios dans l'archive.",
    date: "Avril 2026",
    readTime: "5 min",
    category: "guides",
  },
];

const CATEGORIES = [
  { id: "all", label: "Tous les articles", count: ARTICLES.length },
  { id: "inspiration", label: "✦ Inspirations & mémoire", count: ARTICLES.filter(a => a.category === "inspiration").length },
  { id: "guides", label: "📱 Guides pratiques", count: ARTICLES.filter(a => a.category === "guides").length },
];

function ArticleCard({ a, i, onClick }: { a: Article; i: number; onClick: () => void }) {
  return (
    <motion.article
      key={a.slug}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: i * 0.06 }}
      onClick={onClick}
      style={{
        cursor: "pointer",
        padding: "26px 30px",
        borderRadius: 20,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        marginBottom: 16,
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
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <span className="ekko-serif" style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: a.tagColor, padding: "3px 10px", borderRadius: 20, background: `${a.tagColor}18`, border: `1px solid ${a.tagColor}30` }}>
          {a.tag}
        </span>
        <span className="ekko-serif" style={{ fontSize: 11, color: "rgba(240,232,216,0.3)" }}>{a.date} · {a.readTime} de lecture</span>
      </div>
      <h2 className="ekko-serif" style={{ fontSize: 19, fontWeight: 400, color: "#f0e8d8", lineHeight: 1.4, marginBottom: 10 }}>
        {a.title}
      </h2>
      <p className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.5)", lineHeight: 1.65, marginBottom: 0 }}>
        {a.excerpt}
      </p>
      <p className="ekko-serif" style={{ fontSize: 13, color: accent, marginTop: 14 }}>
        Lire l&apos;article →
      </p>
    </motion.article>
  );
}

export default function BlogPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = activeCategory === "all"
    ? ARTICLES
    : ARTICLES.filter(a => a.category === activeCategory);

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "#0d0a0f" }}>
      <BlobBackground variant="deuil" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-7 md:px-14">
        <button onClick={() => router.push("/")} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <img src="/ekko-logo.png" alt="EKKO" style={{ height: 180, width: "auto", objectFit: "contain", mixBlendMode: "screen" }} />
        </button>
        <button
          onClick={() => router.push("/")}
          className="text-sm px-4 py-2 rounded-full ekko-serif transition-all duration-200"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(240,232,216,0.5)", cursor: "pointer" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(201,169,110,0.12)"; e.currentTarget.style.color = "rgba(201,169,110,0.9)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(240,232,216,0.5)"; }}
        >
          ← Accueil
        </button>
      </nav>

      {/* Header */}
      <div className="relative z-10 px-6 pt-6 pb-10 max-w-3xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="ekko-serif" style={{ fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", color: `${accent}70`, marginBottom: 14 }}>
            Le blog EKKO
          </p>
          <h1 className="ekko-serif" style={{ fontSize: 36, fontWeight: 300, color: "#f0e8d8", marginBottom: 12 }}>
            Guides &amp; inspirations
          </h1>
          <p className="ekko-serif" style={{ fontSize: 15, color: "rgba(240,232,216,0.4)", fontStyle: "italic", maxWidth: 480, margin: "0 auto" }}>
            Conseils pratiques pour exporter vos vocaux, inspirations autour de la mémoire et des souvenirs.
          </p>
        </motion.div>
      </div>

      {/* Onglets catégories */}
      <div className="relative z-10 px-6 pb-8 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
        >
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="ekko-serif"
                style={{
                  fontSize: 13,
                  padding: "8px 18px",
                  borderRadius: 50,
                  border: `1px solid ${active ? accent + "60" : "rgba(255,255,255,0.08)"}`,
                  background: active ? `${accent}15` : "rgba(255,255,255,0.03)",
                  color: active ? accent : "rgba(240,232,216,0.45)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                {cat.label}
                <span style={{
                  fontSize: 10,
                  padding: "1px 7px",
                  borderRadius: 20,
                  background: active ? `${accent}25` : "rgba(255,255,255,0.06)",
                  color: active ? accent : "rgba(240,232,216,0.3)",
                }}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </motion.div>
      </div>

      {/* Articles */}
      <div className="relative z-10 px-6 pb-32 max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {filtered.map((a, i) => (
              <ArticleCard
                key={a.slug}
                a={a}
                i={i}
                onClick={() => router.push(`/blog/${a.slug}`)}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
