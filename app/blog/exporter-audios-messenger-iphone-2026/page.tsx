"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import BlobBackground from "../../components/BlobBackground";

const accent = "#c9a96e";
const messenger = "#0084ff";

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
      <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `${messenger}18`, border: `1px solid ${messenger}40`, color: messenger, fontFamily: "Georgia, serif", fontSize: 13 }}>
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

function Separator() {
  return <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "40px 0" }} />;
}

function SolutionBlock({ type, children }: { type: "open" | "encrypted"; children: React.ReactNode }) {
  const color = type === "open" ? "#4ade80" : "#facc15";
  const label = type === "open" ? "🔓 SOLUTION 1 — Conversation classique (non chiffrée)" : "🔒 SOLUTION 2 — Conversation chiffrée de bout en bout (E2E)";
  return (
    <div style={{ margin: "32px 0", borderRadius: 20, border: `1px solid ${color}30`, overflow: "hidden" }}>
      <div style={{ background: `${color}12`, padding: "14px 24px", borderBottom: `1px solid ${color}20` }}>
        <p className="ekko-serif" style={{ fontSize: 13, color: color, letterSpacing: "0.05em", margin: 0 }}>{label}</p>
      </div>
      <div style={{ padding: "24px" }}>{children}</div>
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

export default function ArticleMessengerIphone() {
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

          {/* Header */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <span className="ekko-serif" style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: messenger, padding: "3px 10px", borderRadius: 20, background: `${messenger}18`, border: `1px solid ${messenger}30` }}>
                Guide Messenger · iPhone
              </span>
              <span className="ekko-serif" style={{ fontSize: 11, color: "rgba(240,232,216,0.3)" }}>Avril 2026 · 6 min de lecture</span>
            </div>
            <h1 className="ekko-serif" style={{ fontSize: 30, fontWeight: 300, color: "#f0e8d8", lineHeight: 1.35, marginBottom: 20 }}>
              Comment exporter les audios d&apos;une conversation Messenger sur iPhone en 2026
            </h1>
            <P>
              Vous avez reçu des messages vocaux importants sur Messenger et vous souhaitez les récupérer ?
              La voix d&apos;un proche, des souvenirs de couple, des délires entre amis… ou simplement des messages que vous ne voulez plus laisser perdus dans l&apos;application ?
            </P>
            <P>Bonne nouvelle : c&apos;est possible.</P>
            <P>Mais il faut comprendre une chose essentielle 👇</P>
          </div>

          <Separator />

          {/* Différence types */}
          <H2>Messenger ne fonctionne pas comme WhatsApp</H2>
          <P>Messenger distingue <strong style={{ color: "#f0e8d8" }}>deux types de conversations</strong> :</P>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, margin: "20px 0 28px" }}>
            <div style={{ padding: "18px 20px", borderRadius: 16, background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.2)" }}>
              <p style={{ fontSize: 20, marginBottom: 8 }}>🔓</p>
              <p className="ekko-serif" style={{ fontSize: 15, color: "#4ade80", marginBottom: 6 }}>Conversations classiques</p>
              <p className="ekko-serif" style={{ fontSize: 13, color: "rgba(240,232,216,0.6)", lineHeight: 1.55 }}>Export via Facebook possible</p>
            </div>
            <div style={{ padding: "18px 20px", borderRadius: 16, background: "rgba(250,204,21,0.06)", border: "1px solid rgba(250,204,21,0.2)" }}>
              <p style={{ fontSize: 20, marginBottom: 8 }}>🔒</p>
              <p className="ekko-serif" style={{ fontSize: 15, color: "#facc15", marginBottom: 6 }}>Conversations chiffrées E2E</p>
              <p className="ekko-serif" style={{ fontSize: 13, color: "rgba(240,232,216,0.6)", lineHeight: 1.55 }}>Procédure séparée obligatoire</p>
            </div>
          </div>

          <div style={{ padding: "16px 20px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="ekko-serif" style={{ fontSize: 15, color: "rgba(240,232,216,0.75)", lineHeight: 1.65, margin: 0 }}>
              👉 Les audios ne se récupèrent <strong style={{ color: "#f0e8d8" }}>pas du tout de la même manière</strong>.
              Si vous ne comprenez pas cette différence, vous risquez de penser que vos audios ont disparu… alors qu&apos;ils sont simplement ailleurs.
            </p>
          </div>

          <Separator />

          {/* SOLUTION 1 */}
          <SolutionBlock type="open">
            <H3>Étapes sur iPhone</H3>
            <Step n={1}>Ouvrez l&apos;app Facebook.</Step>
            <Step n={2}>Touchez votre photo de profil en haut à gauche.</Step>
            <Step n={3}>Appuyez sur la flèche à côté de votre nom.</Step>
            <Step n={4}>Descendez tout en bas → <strong style={{ color: "#f0e8d8" }}>Espace comptes</strong>.</Step>

            <H3>Ensuite</H3>
            <Step n={5}><strong style={{ color: "#f0e8d8" }}>Vos informations et autorisations</strong></Step>
            <Step n={6}><strong style={{ color: "#f0e8d8" }}>Exporter vos informations</strong></Step>
            <Step n={7}><strong style={{ color: "#f0e8d8" }}>Créer une exportation</strong></Step>

            <H3>Configuration importante</H3>
            <BulletList items={[
              "Sélectionnez votre compte Facebook",
              "Choisissez la période souhaitée",
              "Cliquez sur Personnaliser les informations",
            ]} />
            <div style={{ padding: "14px 18px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", margin: "8px 0 20px" }}>
              <p className="ekko-serif" style={{ fontSize: 15, color: "rgba(240,232,216,0.75)", lineHeight: 1.65, margin: 0 }}>
                👉 Décochez absolument <strong style={{ color: "#f0e8d8" }}>TOUT</strong>, puis cochez uniquement{" "}
                <strong style={{ color: accent }}>Messages</strong>.
              </p>
            </div>

            <H3>Paramètres à ne pas rater</H3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "8px 0 20px" }}>
              <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="ekko-serif" style={{ fontSize: 12, color: "rgba(240,232,216,0.4)", marginBottom: 4 }}>Format</p>
                <p className="ekko-serif" style={{ fontSize: 15, color: accent }}>JSON — obligatoire</p>
              </div>
              <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="ekko-serif" style={{ fontSize: 12, color: "rgba(240,232,216,0.4)", marginBottom: 4 }}>Qualité multimédia</p>
                <p className="ekko-serif" style={{ fontSize: 15, color: accent }}>Supérieure</p>
              </div>
            </div>

            <H3>Téléchargement — recommandation</H3>
            <P>Téléchargez de préférence sur <strong style={{ color: "#f0e8d8" }}>ordinateur (PC / Mac)</strong> :</P>
            <BulletList items={[
              "fichier souvent volumineux",
              "plus facile à ouvrir",
              "navigation beaucoup plus simple",
              "tri des audios beaucoup plus rapide",
            ]} />
            <P>Puis importez le fichier dans <a href="https://vosekko.com" style={{ color: accent, textDecoration: "underline", textUnderlineOffset: 3 }}>EKKO</a> — les audios des conversations classiques sont inclus directement.</P>
          </SolutionBlock>

          <Separator />

          {/* SOLUTION 2 */}
          <SolutionBlock type="encrypted">
            <P>Si vos audios ne sont pas dans l&apos;export précédent, ce n&apos;est pas une erreur.</P>
            <P>👉 Cela signifie que la conversation est <strong style={{ color: "#f0e8d8" }}>chiffrée de bout en bout</strong>.</P>

            <H3>Depuis quand les conversations sont chiffrées ?</H3>
            <P>
              Les conversations Messenger sont progressivement passées en chiffrement de bout en bout par défaut{" "}
              <strong style={{ color: "#f0e8d8" }}>à partir de fin 2023 – début 2024</strong>.
            </P>
            <BulletList items={[
              "les conversations récentes sont souvent chiffrées",
              "certaines anciennes conversations restent non chiffrées",
              "vous pouvez avoir les deux types sur un même compte",
            ]} />

            <H3>Comment reconnaître une conversation chiffrée ?</H3>
            <BulletList items={[
              "un message indiquant que la discussion est sécurisée",
              "des paramètres spécifiques liés au chiffrement",
              "parfois une icône de cadenas selon les versions",
            ]} />

            <div style={{ padding: "14px 18px", borderRadius: 12, background: "rgba(250,204,21,0.06)", border: "1px solid rgba(250,204,21,0.2)", margin: "8px 0 24px" }}>
              <p className="ekko-serif" style={{ fontSize: 15, color: "rgba(240,232,216,0.75)", lineHeight: 1.65, margin: 0 }}>
                ⚠️ Vous ne pouvez <strong style={{ color: "#f0e8d8" }}>pas</strong> récupérer ces conversations via l&apos;export Facebook classique.
                Elles passent par un système séparé appelé <strong style={{ color: "#facc15" }}>stockage sécurisé</strong>.
              </p>
            </div>

            <H3>Étapes obligatoires</H3>
            <Step n={1}>
              Ouvrez Messenger sur <strong style={{ color: "#f0e8d8" }}>PC ou Mac</strong> :{" "}
              <a href="https://www.messenger.com/" target="_blank" rel="noopener noreferrer" style={{ color: accent, textDecoration: "underline", textUnderlineOffset: 3 }}>
                messenger.com
              </a>
            </Step>
            <Step n={2}>Cliquez sur votre photo de profil → <strong style={{ color: "#f0e8d8" }}>Confidentialité et sécurité</strong>.</Step>
            <Step n={3}>Ouvrez <strong style={{ color: "#f0e8d8" }}>Discussions chiffrées de bout en bout</strong>.</Step>
            <Step n={4}>Puis <strong style={{ color: "#f0e8d8" }}>Stockage des messages</strong>.</Step>
            <Step n={5}>
              Cliquez sur <strong style={{ color: "#f0e8d8" }}>Télécharger les données de stockage sécurisé</strong> et entrez votre code PIN (ou clé de récupération).
            </Step>
            <p className="ekko-serif" style={{ fontSize: 16, color: "rgba(240,232,216,0.65)", lineHeight: 1.75, marginTop: 8 }}>
              Vous obtenez une archive contenant les messages chiffrés, y compris les audios.
            </p>
          </SolutionBlock>

          <Separator />

          {/* Pourquoi compliqué */}
          <H2>Pourquoi c&apos;est souvent compliqué</H2>
          <P>Dans les deux cas, vous récupérez :</P>
          <div style={{ margin: "16px 0 24px", padding: "20px 24px", borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {["un fichier .zip", "avec de nombreux dossiers", "des fichiers JSON", "des médias séparés", "des noms peu lisibles"].map((f) => (
              <div key={f} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                <span style={{ color: "rgba(240,232,216,0.25)", fontSize: 13 }}>📄</span>
                <span className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.6)", fontFamily: "ui-monospace, monospace" }}>{f}</span>
              </div>
            ))}
          </div>
          <P>👉 Retrouver un vocal précis peut vite devenir un casse-tête.</P>

          <Separator />

          {/* EKKO */}
          <H2>C&apos;est là que EKKO fait toute la différence</H2>
          <P>EKKO a été conçu pour éviter de fouiller dans des dizaines de dossiers.</P>

          <EkkoBlock>
            <p className="ekko-serif" style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: accent, marginBottom: 16 }}>
              Avec EKKO
            </p>
            <BulletList items={[
              "vous importez votre archive Messenger",
              "vous visualisez directement les audios disponibles",
              "vous repérez les vocaux importants",
            ]} />
            <p className="ekko-serif" style={{ fontSize: 16, color: accent, lineHeight: 1.7, margin: "8px 0 20px", fontStyle: "italic" }}>
              Vous pouvez même écouter gratuitement vos audios et les retrouver facilement sur votre espace VosEkko, avant de créer un souvenir — sans engagement, simplement pour retrouver ce qui compte.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/")}
              style={{ padding: "12px 28px", borderRadius: 50, background: `linear-gradient(135deg, ${accent}33, ${accent}55)`, border: `1px solid ${accent}50`, color: "#f0e8d8", fontFamily: "Georgia, serif", fontSize: 14, cursor: "pointer", letterSpacing: "0.05em" }}
            >
              Vérifier mes audios gratuitement →
            </motion.button>
          </EkkoBlock>

          <Separator />

          {/* Après */}
          <H2>Et après ? Transformez vos audios en souvenir</H2>
          <P>Une fois retrouvés, vos vocaux peuvent devenir :</P>
          <BulletList items={[
            "une capsule audio fluide",
            "un souvenir de couple",
            "une mémoire familiale",
            "une compilation d'amitié",
            "un moment à réécouter",
          ]} />
          <p className="ekko-serif" style={{ fontSize: 15, color: "rgba(240,232,216,0.65)", lineHeight: 1.7, fontStyle: "italic" }}>
            Au lieu de rester perdus dans un fichier zip.
          </p>

          <Separator />

          {/* Exemples */}
          <H2>Exemples réels</H2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, margin: "16px 0" }}>
            {[
              { emoji: "💑", label: "Couple", desc: "Retrouver les premiers messages timides, les vocaux envoyés tard le soir, les hésitations du début, le premier \"je t'aime\"." },
              { emoji: "🤝", label: "Amitié", desc: "Rassembler les meilleurs délires, fous rires et messages spontanés." },
              { emoji: "👨‍👩‍👧", label: "Famille", desc: "Conserver la voix d'un parent ou d'un proche." },
              { emoji: "🕯️", label: "Deuil", desc: "Réentendre la voix d'un être disparu, garder quelques mots précieux, retrouver une présence." },
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

          {/* FAQ */}
          <H2>FAQ rapide</H2>
          {[
            { q: "Pourquoi mes audios ne sont pas dans l'export ?", a: "Probablement parce que la conversation est chiffrée. Utilisez la Solution 2 (stockage sécurisé)." },
            { q: "Peut-on tout faire sur iPhone ?", a: "La demande d'export oui, mais la récupération est beaucoup plus simple sur ordinateur." },
            { q: "Le format JSON est-il obligatoire ?", a: "Oui, c'est celui qui permet de relier correctement messages et audios." },
          ].map((item) => (
            <div key={item.q} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="ekko-serif" style={{ fontSize: 16, color: "#f0e8d8", fontWeight: 400, marginBottom: 8 }}>{item.q}</p>
              <p className="ekko-serif" style={{ fontSize: 15, color: "rgba(240,232,216,0.65)", lineHeight: 1.65 }}>{item.a}</p>
            </div>
          ))}

          <Separator />

          {/* Conclusion */}
          <H2>Conclusion</H2>
          <P>Exporter ses audios Messenger sur iPhone est possible.</P>
          <P>Mais il faut comprendre une chose essentielle :</P>
          <div style={{ padding: "16px 20px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", margin: "8px 0 20px" }}>
            <p className="ekko-serif" style={{ fontSize: 16, color: "#f0e8d8", lineHeight: 1.65, margin: 0 }}>
              👉 tout dépend du type de conversation — classique ou chiffrée
            </p>
          </div>
          <P>Une fois cette différence comprise, tout devient beaucoup plus simple.</P>
          <P>
            Et c&apos;est exactement là que <a href="https://vosekko.com" style={{ color: accent, textDecoration: "underline", textUnderlineOffset: 3 }}>EKKO</a> intervient :
            retrouver vos audios facilement… et leur redonner de la valeur.
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
