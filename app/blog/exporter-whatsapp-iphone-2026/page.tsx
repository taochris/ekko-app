"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import BlobBackground from "../../components/BlobBackground";

const accent = "#c9a96e";
const green = "#25d366";

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

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `${green}18`, border: `1px solid ${green}40`, color: green, fontFamily: "Georgia, serif", fontSize: 13 }}>
        {n}
      </div>
      <p className="ekko-serif" style={{ fontSize: 16, color: "rgba(240,232,216,0.88)", lineHeight: 1.7, margin: 0 }}>
        {children}
      </p>
    </div>
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

function Callout({ children, emoji = "💡" }: { children: React.ReactNode; emoji?: string }) {
  return (
    <div style={{ margin: "24px 0", padding: "18px 22px", borderRadius: 16, background: `${accent}0a`, border: `1px solid ${accent}25` }}>
      <p className="ekko-serif" style={{ fontSize: 15, color: "rgba(240,232,216,0.75)", lineHeight: 1.7, margin: 0 }}>
        {emoji} {children}
      </p>
    </div>
  );
}

function EkkoBlock({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ margin: "32px 0", padding: "24px 28px", borderRadius: 20, background: `${accent}0d`, border: `1px solid ${accent}35` }}>
      {children}
    </div>
  );
}

function Separator() {
  return <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "40px 0" }} />;
}

export default function ArticleWhatsAppIphone() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "#0d0a0f" }}>
      <BlobBackground variant="deuil" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-7 md:px-14">
        <button onClick={() => router.push("/")} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <img src="/ekko-logo.png" alt="EKKO" style={{ height: 180, width: "auto", objectFit: "contain", mixBlendMode: "screen" }} />
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

      {/* Article */}
      <div className="relative z-10 px-6 pb-32 max-w-2xl mx-auto pt-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

          {/* Header article */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <span className="ekko-serif" style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: green, padding: "3px 10px", borderRadius: 20, background: `${green}18`, border: `1px solid ${green}30` }}>
                Guide WhatsApp
              </span>
              <span className="ekko-serif" style={{ fontSize: 11, color: "rgba(240,232,216,0.3)" }}>Avril 2026 · 5 min de lecture</span>
            </div>
            <h1 className="ekko-serif" style={{ fontSize: 30, fontWeight: 300, color: "#f0e8d8", lineHeight: 1.35, marginBottom: 20 }}>
              Comment exporter une conversation WhatsApp avec audios sur iPhone en 2026
            </h1>
            <P>
              Vous avez des messages vocaux précieux sur WhatsApp et vous souhaitez les conserver ?
              La voix d&apos;un proche, des fous rires entre amis, les premiers messages d&apos;amour, ou simplement des souvenirs que vous ne voulez plus laisser dormir dans un téléphone ?
            </P>
            <P>
              Bonne nouvelle : sur iPhone, WhatsApp permet toujours d&apos;exporter une conversation avec ses contenus.
            </P>
            <P>
              Et une fois récupérés, ces audios peuvent même devenir quelque chose de plus beau : un souvenir vivant à réécouter grâce à{" "}
              <a href="https://vosekko.com" style={{ color: accent, fontWeight: 400, textDecoration: "underline", textUnderlineOffset: 3 }}>EKKO</a>.
            </P>
          </div>

          <Separator />

          {/* Section 1 */}
          <H2>Pourquoi exporter une conversation WhatsApp ?</H2>
          <P>Beaucoup de personnes découvrent cette fonction trop tard.</P>
          <P>On exporte souvent pour :</P>
          <BulletList items={[
            "sauvegarder des vocaux importants avant de changer de téléphone",
            "conserver la voix d'un parent ou d'un proche",
            "archiver une relation ou une période de vie marquante",
            "récupérer des messages audio perdus dans des années de discussion",
            "préparer un cadeau émotionnel",
            "transformer plusieurs vocaux en une capsule audio souvenir avec EKKO",
          ]} />
          <P>Car certains messages valent bien plus qu&apos;un simple fichier.</P>

          <Separator />

          {/* Section 2 */}
          <H2>Comment exporter WhatsApp avec audios sur iPhone</H2>

          <H3>1. Ouvrez la conversation concernée</H3>
          <Step n={1}>Lancez WhatsApp puis ouvrez la discussion que vous souhaitez conserver.</Step>

          <H3>2. Touchez le nom du contact en haut</H3>
          <Step n={2}>Appuyez sur le nom du contact ou du groupe en haut de la conversation.</Step>

          <H3>3. Descendez jusqu&apos;à &ldquo;Exporter discussion&rdquo;</H3>
          <Step n={3}>
            Faites défiler la page d&apos;informations puis touchez{" "}
            <strong style={{ color: "#f0e8d8" }}>Exporter discussion</strong>.
          </Step>

          <H3>4. Choisissez l&apos;option importante</H3>
          <P>Deux choix apparaissent :</P>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, margin: "16px 0 24px" }}>
            <div style={{ padding: "16px 18px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="ekko-serif" style={{ fontSize: 13, color: "rgba(240,232,216,0.45)", marginBottom: 6, letterSpacing: "0.05em" }}>Sans médias</p>
              <p className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.65)", lineHeight: 1.5 }}>Seulement les messages texte — version allégée.</p>
            </div>
            <div style={{ padding: "16px 18px", borderRadius: 14, background: `${green}0d`, border: `1px solid ${green}30` }}>
              <p className="ekko-serif" style={{ fontSize: 13, color: green, marginBottom: 6, letterSpacing: "0.05em" }}>Joindre médias ✓</p>
              <p className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.8)", lineHeight: 1.5 }}>Inclut photos, vidéos, documents et <strong>messages vocaux</strong>.</p>
            </div>
          </div>
          <Callout emoji="👉">
            Pour récupérer les vocaux, choisissez impérativement <strong style={{ color: accent }}>Joindre médias</strong>.
          </Callout>

          <H3>5. Enregistrez le fichier</H3>
          <P>Vous pourrez ensuite l&apos;envoyer vers :</P>
          <BulletList items={["l'app Fichiers", "iCloud Drive", "Google Drive", "Mail", "AirDrop vers un Mac"]} />

          <Separator />

          {/* Section 3 */}
          <H2>Où retrouver vos audios exportés ?</H2>
          <P>Le plus souvent, WhatsApp génère un fichier compressé <strong style={{ color: "#f0e8d8" }}>.zip</strong>. À l&apos;intérieur :</P>
          <BulletList items={["le texte de la conversation", "les médias exportés", "les audios disponibles"]} />
          <P>Sur iPhone, regardez dans :</P>
          <div style={{ padding: "14px 20px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", margin: "8px 0 20px" }}>
            <p className="ekko-serif" style={{ fontSize: 16, color: "#f0e8d8" }}>App Fichiers › Récents</p>
            <p className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.45)", marginTop: 4 }}>ou dans le dossier choisi lors de l&apos;export.</p>
          </div>

          <Separator />

          {/* Section 4 */}
          <H2>Si les vocaux n&apos;apparaissent pas</H2>
          <P>Cela peut arriver sur les discussions très longues ou trop lourdes.</P>

          <H3>Solutions simples</H3>
          <BulletList items={[
            "Exporter une conversation plus récente — les échanges immenses peuvent être limités.",
            "Sauvegarder les audios un par un : appui long sur un vocal › Partager › Enregistrer dans Fichiers.",
            "Vérifier l'espace libre sur l'iPhone — un stockage saturé bloque parfois la création du ZIP.",
          ]} />

          <Separator />

          {/* Section 5 */}
          <H2>Peut-on exporter toutes les conversations d&apos;un coup ?</H2>
          <P>Non. WhatsApp fonctionne conversation par conversation.</P>
          <P>Mais pour beaucoup de personnes, une seule discussion suffit à retrouver l&apos;essentiel.</P>

          <Separator />

          {/* Section EKKO */}
          <H2>Et après ? Donnez une vraie seconde vie à vos audios</H2>
          <P>Exporter un vocal, c&apos;est bien.</P>
          <P>Mais écouter 83 fichiers séparés dans un dossier oublié… soyons honnêtes, presque personne ne le fait.</P>

          <EkkoBlock>
            <p className="ekko-serif" style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: accent, marginBottom: 16 }}>
              EKKO transforme vos exports WhatsApp en souvenir émotionnel
            </p>
            <BulletList items={[
              "plusieurs vocaux deviennent une seule capsule audio fluide",
              "les meilleurs messages sont réunis dans un seul souvenir",
              "écoute facile depuis mobile",
              "partage par QR code",
              "cadeau unique pour anniversaire, couple, famille ou hommage",
            ]} />
            <p className="ekko-serif" style={{ fontSize: 15, color: "rgba(240,232,216,0.7)", lineHeight: 1.7, marginTop: 12, fontStyle: "italic" }}>
              Vos messages cessent d&apos;être des fichiers.<br />
              Ils redeviennent des émotions.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/")}
              style={{ marginTop: 20, padding: "12px 28px", borderRadius: 50, background: `linear-gradient(135deg, ${accent}33, ${accent}55)`, border: `1px solid ${accent}50`, color: "#f0e8d8", fontFamily: "Georgia, serif", fontSize: 14, cursor: "pointer", letterSpacing: "0.05em" }}
            >
              Créer ma vocapsule →
            </motion.button>
          </EkkoBlock>

          <Separator />

          {/* Section usages */}
          <H2>Exemples d&apos;utilisation réels</H2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, margin: "16px 0" }}>
            {[
              { emoji: "💑", label: "Couple", desc: "Rassembler 4 ans de vocaux amoureux en un souvenir audio." },
              { emoji: "👨‍👩‍👧", label: "Famille", desc: "Conserver la voix d'un parent ou grand-parent." },
              { emoji: "🤝", label: "Amitié", desc: "Créer une capsule pleine de délires et de rires." },
              { emoji: "🕯️", label: "Hommage", desc: "Garder une voix précieuse toujours accessible." },
            ].map((u) => (
              <div key={u.label} style={{ padding: "18px 20px", borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p style={{ fontSize: 22, marginBottom: 8 }}>{u.emoji}</p>
                <p className="ekko-serif" style={{ fontSize: 14, color: accent, marginBottom: 6 }}>{u.label}</p>
                <p className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.65)", lineHeight: 1.55 }}>{u.desc}</p>
              </div>
            ))}
          </div>

          <Separator />

          {/* FAQ */}
          <H2>FAQ rapide</H2>

          {[
            {
              q: "Est-ce légal d'exporter ses propres conversations ?",
              a: "Oui, lorsqu'il s'agit de vos échanges personnels et de votre usage privé.",
            },
            {
              q: "Les audios restent-ils privés ?",
              a: "Oui. Et avec EKKO, l'objectif est justement de les valoriser sans les exposer publiquement.",
            },
            {
              q: "L'export fonctionne toujours en 2026 ?",
              a: "Oui, au moment de la rédaction de cet article, la fonction est toujours disponible sur WhatsApp iPhone.",
            },
          ].map((item) => (
            <div key={item.q} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="ekko-serif" style={{ fontSize: 16, color: "#f0e8d8", fontWeight: 400, marginBottom: 8 }}>
                {item.q}
              </p>
              <p className="ekko-serif" style={{ fontSize: 15, color: "rgba(240,232,216,0.65)", lineHeight: 1.65 }}>
                {item.a}
              </p>
            </div>
          ))}

          <Separator />

          {/* Conclusion */}
          <H2>Conclusion</H2>
          <P>Vous cherchiez peut-être simplement à exporter une conversation.</P>
          <P>Mais parfois, derrière un simple bouton &ldquo;Exporter&rdquo;, il y a :</P>
          <BulletList items={[
            "une voix qu'on ne veut pas perdre",
            "des souvenirs qu'on croyait oubliés",
            "des moments qui méritent mieux qu'un dossier zip",
          ]} />
          <P>Et c&apos;est exactement pour cela que <span style={{ color: accent }}>EKKO</span> existe.</P>

          <div style={{ marginTop: 40, display: "flex", justifyContent: "center" }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/")}
              style={{ padding: "14px 36px", borderRadius: 50, background: `linear-gradient(135deg, ${accent}33, ${accent}55)`, border: `1px solid ${accent}50`, color: "#f0e8d8", fontFamily: "Georgia, serif", fontSize: 15, cursor: "pointer", letterSpacing: "0.05em" }}
            >
              Créer ma vocapsule EKKO →
            </motion.button>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
