"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import EkkoLogo from "../../components/EkkoLogo";
import BlobBackground from "../../components/BlobBackground";

const accent = "#c9a96e";
const insta = "#e1306c";

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
      <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `${insta}18`, border: `1px solid ${insta}40`, color: insta, fontFamily: "Georgia, serif", fontSize: 13 }}>
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

function Callout({ children, emoji = "💡", color = accent }: { children: React.ReactNode; emoji?: string; color?: string }) {
  return (
    <div style={{ margin: "24px 0", padding: "18px 22px", borderRadius: 16, background: `${color}0a`, border: `1px solid ${color}25` }}>
      <p className="ekko-serif" style={{ fontSize: 15, color: "rgba(240,232,216,0.82)", lineHeight: 1.7, margin: 0 }}>
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

export default function ArticleInstagramIphone() {
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

          {/* Header */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <span className="ekko-serif" style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: insta, padding: "3px 10px", borderRadius: 20, background: `${insta}18`, border: `1px solid ${insta}30` }}>
                Guide Instagram · iPhone
              </span>
              <span className="ekko-serif" style={{ fontSize: 11, color: "rgba(240,232,216,0.3)" }}>Avril 2026 · 5 min de lecture</span>
            </div>
            <h1 className="ekko-serif" style={{ fontSize: 30, fontWeight: 300, color: "#f0e8d8", lineHeight: 1.35, marginBottom: 20 }}>
              Comment exporter les audios d&apos;une conversation Instagram sur iPhone en 2026
            </h1>
            <P>
              Vous avez reçu des messages vocaux importants sur Instagram et vous souhaitez les récupérer ?
              Un vocal amoureux, un rire envoyé en DM, la voix d&apos;un proche, ou un souvenir que vous ne voulez plus laisser perdu dans Instagram ?
            </P>
            <P>
              Contrairement à WhatsApp, Instagram ne permet pas d&apos;exporter directement une seule conversation avec ses audios depuis le fil de discussion.
            </P>
            <P>
              La méthode officielle consiste à demander une archive de vos données Instagram depuis l&apos;Espace Comptes Meta.
              Une fois le fichier téléchargé, vos messages et médias sont bien présents — mais ils se trouvent dans une archive avec de nombreux dossiers.
            </P>
            <Callout emoji="👉" color={insta}>
              C&apos;est justement là qu&apos;<strong style={{ color: accent }}>EKKO</strong> devient utile : l&apos;application vous aide à retrouver et extraire facilement les audios importants, sans fouiller manuellement dans tous les fichiers.{" "}
              <strong style={{ color: "#f0e8d8" }}>Vous pouvez même l&apos;utiliser gratuitement pour voir quels audios sont récupérables avant d&apos;aller plus loin.</strong>
            </Callout>
          </div>

          <Separator />

          {/* Pourquoi */}
          <H2>Pourquoi exporter ses audios Instagram sur iPhone ?</H2>
          <P>Les raisons les plus fréquentes :</P>
          <BulletList items={[
            "récupérer des vocaux envoyés en DM",
            "conserver la voix d'un proche",
            "sauvegarder les premiers messages d'une relation",
            "retrouver des audios noyés dans des années de conversation",
            "garder les souvenirs d'une amitié",
            "réentendre la voix d'une personne disparue",
            "transformer ces audios en capsule souvenir avec EKKO",
          ]} />
          <P>Car parfois, un simple vocal contient bien plus qu&apos;un message.</P>

          <Separator />

          {/* Guide */}
          <H2>Comment récupérer ses données Instagram sur iPhone</H2>

          <H3>1. Ouvrez Instagram</H3>
          <Step n={1}>Depuis votre iPhone, ouvrez l&apos;application Instagram.</Step>

          <H3>2. Allez sur votre profil</H3>
          <Step n={2}>Touchez votre photo de profil en bas à droite.</Step>

          <H3>3. Ouvrez le menu</H3>
          <Step n={3}>Touchez les trois lignes en haut à droite.</Step>

          <H3>4. Allez dans l&apos;Espace Comptes</H3>
          <Step n={4}>
            Cherchez <strong style={{ color: "#f0e8d8" }}>Espace Comptes</strong> puis{" "}
            <strong style={{ color: "#f0e8d8" }}>Vos informations et autorisations</strong>.
          </Step>

          <H3>5. Sélectionnez &ldquo;Télécharger vos informations&rdquo;</H3>
          <Step n={5}>Instagram vous redirige vers l&apos;outil Meta de téléchargement des données.</Step>

          <H3>6. Choisissez votre compte Instagram</H3>
          <Step n={6}>Si plusieurs comptes sont associés, sélectionnez celui qui contient la conversation recherchée.</Step>

          <H3>7. Choisissez les informations à télécharger</H3>
          <Step n={7}>
            Prenez de préférence <strong style={{ color: "#f0e8d8" }}>Certaines de vos informations</strong>, puis cochez{" "}
            <strong style={{ color: "#f0e8d8" }}>Messages</strong>. C&apos;est cette partie qui contient les conversations Instagram.
          </Step>

          <H3>8. Choisissez le format JSON</H3>
          <Step n={8}>
            Pour une meilleure récupération technique, le format <strong style={{ color: "#f0e8d8" }}>JSON</strong> est préférable.
          </Step>

          <H3>9. Créez le fichier</H3>
          <Step n={9}>
            Meta prépare votre archive. Cela peut prendre quelques minutes ou plus selon le volume de données. Vous recevrez une notification quand le fichier est prêt.
          </Step>

          <Separator />

          {/* Où sont les audios */}
          <H2>Une fois le fichier téléchargé, où sont les audios ?</H2>
          <P>Sur iPhone, vous récupérez généralement un fichier compressé <strong style={{ color: "#f0e8d8" }}>.zip</strong>.</P>
          <P>Le problème : l&apos;archive Instagram contient beaucoup de dossiers.</P>

          <div style={{ margin: "16px 0 24px", padding: "20px 24px", borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="ekko-serif" style={{ fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,232,216,0.3)", marginBottom: 14 }}>
              Contenu typique de l&apos;archive
            </p>
            {["messages /", "inbox /", "médias /", "conversations /", "fichiers JSON", "images", "vidéos", "audios éventuels"].map((f) => (
              <div key={f} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                <span style={{ color: "rgba(240,232,216,0.25)", fontSize: 13 }}>📄</span>
                <span className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.6)", fontFamily: "ui-monospace, monospace" }}>{f}</span>
              </div>
            ))}
          </div>

          <P>
            Il faut ensuite identifier la bonne conversation, retrouver les bons fichiers, puis comprendre quels audios correspondent à quel échange.
          </P>
          <P>
            Pour une personne à l&apos;aise avec les fichiers, c&apos;est faisable.
            Pour la majorité des utilisateurs, c&apos;est vite pénible.
          </P>

          <Separator />

          {/* EKKO simplifie */}
          <H2>C&apos;est là qu&apos;EKKO simplifie tout</H2>
          <P>EKKO est conçu pour éviter de passer une heure à fouiller dans une archive Instagram.</P>

          <EkkoBlock>
            <p className="ekko-serif" style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: accent, marginBottom: 16 }}>
              Avec EKKO
            </p>
            <BulletList items={[
              "importez votre fichier Instagram en quelques secondes",
              "les audios disponibles sont identifiés automatiquement",
              "écoutez chaque vocal avant de décider de l'inclure",
              "gratuit pour vérifier vos audios récupérables",
              "créez ensuite une capsule souvenir si vous le souhaitez",
            ]} />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/")}
              style={{ marginTop: 20, padding: "12px 28px", borderRadius: 50, background: `linear-gradient(135deg, ${accent}33, ${accent}55)`, border: `1px solid ${accent}50`, color: "#f0e8d8", fontFamily: "Georgia, serif", fontSize: 14, cursor: "pointer", letterSpacing: "0.05em" }}
            >
              Vérifier mes audios gratuitement →
            </motion.button>
          </EkkoBlock>

          <Separator />

          {/* Transformer */}
          <H2>Et après ? Transformez vos audios Instagram en souvenir</H2>
          <P>Une fois les vocaux retrouvés, EKKO peut vous aider à créer une capsule audio fluide :</P>
          <BulletList items={[
            "plusieurs vocaux réunis dans un seul souvenir",
            "écoute simple sur mobile",
            "partage par QR code",
            "souvenir de couple, famille, amitié ou deuil",
            "accès plus facile qu'un dossier rempli de fichiers",
          ]} />
          <p className="ekko-serif" style={{ fontSize: 15, color: "rgba(240,232,216,0.65)", lineHeight: 1.7, fontStyle: "italic" }}>
            Vos audios ne restent plus perdus dans une archive.<br />
            Ils redeviennent des moments à écouter.
          </p>

          <Separator />

          {/* Exemples */}
          <H2>Exemples réels</H2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, margin: "16px 0" }}>
            {[
              { emoji: "💑", label: "Couple", desc: "Retrouver les premiers vocaux timides, les hésitations du début, les messages envoyés tard le soir, le premier \"je t'aime\"." },
              { emoji: "🤝", label: "Amitié", desc: "Rassembler les meilleurs délires vocaux, les fous rires et les messages spontanés." },
              { emoji: "👨‍👩‍👧", label: "Famille", desc: "Conserver des messages vocaux précieux, parfois oubliés au fond d'une conversation." },
              { emoji: "🕯️", label: "Deuil", desc: "Réentendre la voix d'un être disparu, garder quelques mots importants, retrouver une présence que l'on croyait perdue." },
            ].map((u) => (
              <div key={u.label} style={{ padding: "20px 22px", borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", gap: 16, alignItems: "flex-start" }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{u.emoji}</span>
                <div>
                  <p className="ekko-serif" style={{ fontSize: 14, color: accent, marginBottom: 6 }}>{u.label}</p>
                  <p className="ekko-serif" style={{ fontSize: 15, color: "rgba(240,232,216,0.72)", lineHeight: 1.6 }}>{u.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Conclusion */}
          <H2>Conclusion</H2>
          <P>
            Exporter ses audios Instagram sur iPhone est possible, mais ce n&apos;est pas aussi simple que sur WhatsApp.
          </P>
          <P>
            Instagram fournit une archive complète, avec beaucoup de dossiers et de fichiers.
            EKKO sert justement à rendre cette étape plus simple : retrouver vos audios, les écouter, les sélectionner, puis les transformer en souvenir.
          </P>

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
