"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import EkkoLogo from "../../components/EkkoLogo";
import BlobBackground from "../../components/BlobBackground";

const accent = "#c9a96e";
const rose = "#e8637a";

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="ekko-serif" style={{ fontSize: 24, fontWeight: 400, color: "#f0e8d8", marginTop: 52, marginBottom: 16, lineHeight: 1.35 }}>
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="ekko-serif" style={{ fontSize: 18, fontWeight: 400, color: accent, marginTop: 28, marginBottom: 10, lineHeight: 1.4 }}>
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="ekko-serif" style={{ fontSize: 16, color: "rgba(240,232,216,0.88)", lineHeight: 1.75, marginBottom: 16 }}>
      {children}
    </p>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: "12px 0 20px", paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ color: accent, fontSize: 14, marginTop: 3, flexShrink: 0 }}>✦</span>
          <span className="ekko-serif" style={{ fontSize: 16, color: "rgba(240,232,216,0.82)", lineHeight: 1.65 }}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Separator() {
  return <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "40px 0" }} />;
}

function RankCard({ rank, title, price, children }: { rank: number; title: string; price: string; children: React.ReactNode }) {
  const isTop1 = rank === 1;
  return (
    <div style={{
      padding: "24px 28px",
      borderRadius: 18,
      background: isTop1 ? `${accent}0a` : "rgba(255,255,255,0.03)",
      border: `1px solid ${isTop1 ? accent + "40" : "rgba(255,255,255,0.08)"}`,
      marginBottom: 20,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: isTop1 ? `${accent}25` : `${rose}15`,
          border: `1px solid ${isTop1 ? accent + "50" : rose + "35"}`,
          color: isTop1 ? accent : rose,
          fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 600,
        }}>
          {rank}
        </div>
        <div>
          <p className="ekko-serif" style={{ fontSize: 17, fontWeight: 400, color: "#f0e8d8", margin: 0, lineHeight: 1.3 }}>{title}</p>
          <p className="ekko-serif" style={{ fontSize: 13, color: isTop1 ? accent : "rgba(240,232,216,0.4)", margin: "3px 0 0", fontStyle: "italic" }}>{price}</p>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function EkkoBlock({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: "22px 26px", borderRadius: 16, background: `${accent}0d`, border: `1px solid ${accent}35`, margin: "28px 0" }}>
      <p className="ekko-serif" style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: accent, marginBottom: 12 }}>
        ✦ EKKO
      </p>
      <div className="ekko-serif" style={{ fontSize: 16, color: "rgba(240,232,216,0.88)", lineHeight: 1.75 }}>
        {children}
      </div>
    </div>
  );
}

export default function CadeauPasCherCouplePage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "#0d0a0f" }}>
      <BlobBackground variant="amour" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-7 md:px-14">
        <button onClick={() => router.push("/")} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <EkkoLogo size="md" glow={true} />
        </button>
        <button
          onClick={() => router.push("/blog")}
          className="text-sm px-4 py-2 rounded-full ekko-serif transition-all duration-200"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(240,232,216,0.5)", cursor: "pointer" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(201,169,110,0.12)"; e.currentTarget.style.color = "rgba(201,169,110,0.9)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(240,232,216,0.5)"; }}
        >
          ← Blog
        </button>
      </nav>

      {/* Hero */}
      <div className="relative z-10 px-6 pt-10 pb-8 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
            <span className="ekko-serif" style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: rose, padding: "3px 10px", borderRadius: 20, background: `${rose}18`, border: `1px solid ${rose}30` }}>
              Idées cadeaux · Couple
            </span>
            <span className="ekko-serif" style={{ fontSize: 11, color: "rgba(240,232,216,0.3)" }}>Avril 2026</span>
            <span className="ekko-serif" style={{ fontSize: 11, color: "rgba(240,232,216,0.3)" }}>· 5 min de lecture</span>
          </div>
          <h1 className="ekko-serif" style={{ fontSize: 34, fontWeight: 300, color: "#f0e8d8", lineHeight: 1.35, marginBottom: 20 }}>
            🎁 10 idées de cadeaux pas chers pour son ou sa chérie
            <span style={{ display: "block", fontSize: 20, color: "rgba(240,232,216,0.55)", marginTop: 10, fontStyle: "italic" }}>
              Moins de 10€ — mais inoubliables
            </span>
          </h1>
        </motion.div>
      </div>

      {/* Contenu */}
      <div className="relative z-10 px-6 pb-32 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>

          <P>Tu cherches une idée de cadeau pour ton ou ta chérie… mais sans exploser ton budget ?</P>
          <P>Bonne nouvelle :</P>
          <P>👉 les meilleurs cadeaux ne coûtent presque rien.</P>
          <P>Ils sont juste plus personnels, plus vrais, plus marquants.</P>
          <P>Voici 10 idées à moins de 10€, classées de 10 à 1… avec la dernière qui fait vraiment la différence ❤️</P>

          <Separator />

          <RankCard rank={10} title="Une lettre manuscrite" price="0€">
            <P>Oui, ça peut paraître simple.</P>
            <P>Mais écrire à la main :</P>
            <BulletList items={["ce que tu ressens", "ce que tu n'as jamais dit", "vos souvenirs"]} />
            <P>👉 c'est rare aujourd'hui… et donc très puissant.</P>
          </RankCard>

          <RankCard rank={9} title="Un bocal à souvenirs" price="~5€">
            <P>Un petit pot + des papiers à l'intérieur.</P>
            <P>Écris :</P>
            <BulletList items={["des souvenirs", "des compliments", "des moments vécus"]} />
            <P>👉 C'est un cadeau qui dure dans le temps.</P>
          </RankCard>

          <RankCard rank={8} title="Une playlist personnalisée" price="0€">
            <P>Crée une playlist avec :</P>
            <BulletList items={["vos chansons", "vos moments", "les musiques importantes"]} />
            <P>👉 Ajoute un petit message pour chaque titre.</P>
          </RankCard>

          <RankCard rank={7} title="Une photo imprimée avec message caché" price="2–5€">
            <P>Imprime une photo de vous.</P>
            <P>Au dos :</P>
            <P>👉 écris quelque chose de personnel, drôle ou touchant.</P>
          </RankCard>

          <RankCard rank={6} title="Une boîte « nos moments »" price="5–10€">
            <P>Une petite boîte avec :</P>
            <BulletList items={["tickets", "souvenirs", "objets"]} />
            <P>👉 Un mini résumé de votre histoire.</P>
          </RankCard>

          <RankCard rank={5} title="Un message pour le futur" price="0€">
            <P>Écris ou enregistre :</P>
            <BulletList items={["un message à ouvrir dans 1 an", "ou à une date spéciale"]} />
            <P>👉 Effet émotionnel garanti.</P>
          </RankCard>

          <RankCard rank={4} title="Une journée surprise simple" price="< 10€">
            <P>Pas besoin de luxe :</P>
            <BulletList items={["balade", "pique-nique", "lieu symbolique"]} />
            <P>👉 Ce qui compte, c'est le moment.</P>
          </RankCard>

          <RankCard rank={3} title="Une vidéo souvenir" price="0€">
            <P>Avec ton téléphone :</P>
            <BulletList items={["photos", "vidéos", "souvenirs"]} />
            <P>👉 Tu peux créer quelque chose de très fort en quelques minutes.</P>
          </RankCard>

          <RankCard rank={2} title="Une capsule de souvenirs" price="< 10€">
            <P>Rassemble :</P>
            <BulletList items={["photos", "mots", "objets"]} />
            <P>👉 Et présente ça comme une capsule de votre histoire.</P>
          </RankCard>

          <Separator />

          <div style={{ textAlign: "center", margin: "12px 0 36px" }}>
            <p className="ekko-serif" style={{ fontSize: 15, color: "rgba(240,232,216,0.5)", fontStyle: "italic" }}>Mais il manque encore quelque chose…</p>
          </div>

          <RankCard rank={1} title="Le cadeau le plus fort : un souvenir audio ❤️" price="gratuit pour commencer">
            <P>C'est le seul cadeau qui permet de réentendre une émotion.</P>
            <P>Imagine :</P>
            <BulletList items={[
              "vos premiers messages timides",
              "vos vocaux envoyés tard le soir",
              "vos fous rires",
              "le premier « je t'aime »",
            ]} />
            <P>👉 Tout ça réuni en un seul souvenir.</P>

            <EkkoBlock>
              <p style={{ marginBottom: 12 }}>
                C'est exactement ce que propose{" "}
                <a href="https://vosekko.com" target="_blank" rel="noopener noreferrer" style={{ color: accent, textDecoration: "underline", textUnderlineOffset: 3, fontWeight: 500 }}>
                  EKKO
                </a>{" "}:
              </p>
              <BulletList items={[
                "récupérer vos anciens messages vocaux",
                "les rassembler",
                "créer une capsule audio unique",
              ]} />
              <p style={{ marginTop: 8 }}>👉 Tu peux même commencer simplement : écouter gratuitement tes audios et voir ce que tu peux retrouver sur ton espace{" "}
                <a href="https://vosekko.com" target="_blank" rel="noopener noreferrer" style={{ color: accent, textDecoration: "underline", textUnderlineOffset: 3 }}>
                  VosEkko
                </a>
                , avant de créer quoi que ce soit.
              </p>
            </EkkoBlock>
          </RankCard>

          <Separator />

          <H2>Pourquoi ces cadeaux fonctionnent vraiment</H2>

          <P>On oublie :</P>
          <BulletList items={["le prix", "l'objet", "le moment d'achat"]} />

          <P>Mais on n'oublie jamais :</P>
          <BulletList items={["une phrase", "un souvenir", "une voix"]} />

          <Separator />

          <H2>Conclusion</H2>

          <P>Si tu cherches un cadeau pas cher pour ton ou ta chérie…</P>
          <P>👉 ne cherche pas « moins cher »</P>
          <P>Cherche <em>plus sincère</em>.</P>
          <P>Et parfois, le plus beau cadeau…</P>
          <P>👉 c'est simplement de faire revivre ce que vous avez déjà vécu.</P>

          <H3>À lire aussi sur le blog EKKO</H3>
          <BulletList items={[
            "Comment exporter une conversation WhatsApp avec audios sur iPhone",
            "Comment exporter les audios Messenger sur Android",
            "Comment récupérer ses vocaux Telegram",
          ]} />

        </motion.div>
      </div>
    </div>
  );
}
