"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import EkkoLogo from "../../components/EkkoLogo";
import BlobBackground from "../../components/BlobBackground";

const accent = "#c9a96e";
const telegram = "#2AABEE";

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
      <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `${telegram}18`, border: `1px solid ${telegram}40`, color: telegram, fontFamily: "Georgia, serif", fontSize: 13 }}>
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

function EkkoBlock({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ margin: "32px 0", padding: "24px 28px", borderRadius: 20, background: `${accent}0d`, border: `1px solid ${accent}35` }}>
      {children}
    </div>
  );
}

export default function ArticleTelegramAndroid() {
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
              <span className="ekko-serif" style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: telegram, padding: "3px 10px", borderRadius: 20, background: `${telegram}18`, border: `1px solid ${telegram}30` }}>
                Guide Telegram · Android
              </span>
              <span className="ekko-serif" style={{ fontSize: 11, color: "rgba(240,232,216,0.3)" }}>Avril 2026 · 5 min de lecture</span>
            </div>
            <h1 className="ekko-serif" style={{ fontSize: 30, fontWeight: 300, color: "#f0e8d8", lineHeight: 1.35, marginBottom: 20 }}>
              Comment exporter les audios d&apos;une conversation Telegram sur Android en 2026
            </h1>
            <P>
              Vous avez des messages vocaux importants sur Telegram et vous souhaitez les récupérer ?
              Des discussions longues, des vocaux précieux, des souvenirs que vous ne voulez plus laisser enfermés dans une application ?
            </P>
            <P>Bonne nouvelle : c&apos;est possible.</P>
            <P>
              Mais sur Telegram, il y a une particularité importante — et c&apos;est là que <a href="https://vosekko.com" style={{ color: accent, textDecoration: "underline", textUnderlineOffset: 3 }}>EKKO</a> simplifie tout une fois vos données récupérées.
            </P>
          </div>

          <Separator />

          {/* Avertissement Desktop vs Web */}
          <div style={{ padding: "20px 24px", borderRadius: 16, background: "rgba(250,204,21,0.06)", border: "1px solid rgba(250,204,21,0.25)", marginBottom: 40 }}>
            <p className="ekko-serif" style={{ fontSize: 13, letterSpacing: "0.15em", textTransform: "uppercase", color: "#facc15", marginBottom: 12 }}>⚠️ Important avant de commencer</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ color: "#4ade80", fontSize: 16, flexShrink: 0 }}>✓</span>
                <p className="ekko-serif" style={{ fontSize: 15, color: "rgba(240,232,216,0.85)", lineHeight: 1.6, margin: 0 }}>
                  Utilisez <strong style={{ color: "#f0e8d8" }}>Telegram Desktop</strong> (application à installer sur PC ou Mac)
                </p>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ color: "#f87171", fontSize: 16, flexShrink: 0 }}>✗</span>
                <p className="ekko-serif" style={{ fontSize: 15, color: "rgba(240,232,216,0.85)", lineHeight: 1.6, margin: 0 }}>
                  <strong style={{ color: "#f0e8d8" }}>Telegram Web</strong> ne permet pas d&apos;exporter correctement les conversations ni les fichiers audio
                </p>
              </div>
            </div>
          </div>

          {/* Marques Android */}
          <H2>Fonctionne sur quelles marques Android ?</H2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, margin: "16px 0 24px" }}>
            {["Samsung", "Xiaomi / Redmi", "Google Pixel", "OnePlus", "Motorola", "Oppo", "Realme", "Honor", "Huawei", "Sony", "Nokia", "Asus"].map((brand) => (
              <div key={brand} style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", textAlign: "center" }}>
                <span className="ekko-serif" style={{ fontSize: 13, color: "rgba(240,232,216,0.7)" }}>{brand}</span>
              </div>
            ))}
          </div>
          <P>👉 Les menus peuvent varier légèrement, mais la méthode reste la même.</P>

          <Separator />

          {/* Différence vs autres apps */}
          <H2>Telegram fonctionne différemment des autres applications</H2>
          <P>Contrairement à WhatsApp ou Messenger :</P>
          <P>
            👉 Telegram ne permet pas d&apos;exporter facilement une conversation complète avec ses audios directement depuis Android.
            La méthode officielle passe par <strong style={{ color: "#f0e8d8" }}>un ordinateur</strong>, via Telegram Desktop.
          </P>

          <Separator />

          {/* Pourquoi ordinateur */}
          <H2>Pourquoi passer par un ordinateur est indispensable</H2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, margin: "16px 0 24px" }}>
            <div style={{ padding: "18px 20px", borderRadius: 16, background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.2)" }}>
              <p className="ekko-serif" style={{ fontSize: 13, color: "#4ade80", marginBottom: 10, letterSpacing: "0.05em" }}>Sur Android — possible</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {["écouter les vocaux", "les transférer un par un"].map((t) => (
                  <div key={t} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ color: "#4ade80", fontSize: 13 }}>✓</span>
                    <span className="ekko-serif" style={{ fontSize: 13, color: "rgba(240,232,216,0.7)" }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: "18px 20px", borderRadius: 16, background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.2)" }}>
              <p className="ekko-serif" style={{ fontSize: 13, color: "#f87171", marginBottom: 10, letterSpacing: "0.05em" }}>Sur Android — impossible</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {["exporter une conversation complète", "récupérer tous les audios", "télécharger un historique structuré"].map((t) => (
                  <div key={t} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ color: "#f87171", fontSize: 13 }}>✗</span>
                    <span className="ekko-serif" style={{ fontSize: 13, color: "rgba(240,232,216,0.7)" }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <P>👉 Pour un vrai export, il faut utiliser Telegram Desktop.</P>

          <Separator />

          {/* Guide étapes */}
          <H2>Étapes pour exporter les audios Telegram (Android → ordinateur)</H2>

          <H3>1. Installer Telegram Desktop</H3>
          <Step n={1}>Téléchargez l&apos;application <strong style={{ color: "#f0e8d8" }}>Telegram Desktop</strong> sur votre ordinateur (PC ou Mac) depuis <a href="https://desktop.telegram.org/" target="_blank" rel="noopener noreferrer" style={{ color: accent, textDecoration: "underline", textUnderlineOffset: 3 }}>desktop.telegram.org</a>.</Step>

          <H3>2. Connectez votre compte</H3>
          <Step n={2}>Ouvrez Telegram Desktop, connectez-vous avec votre numéro, puis validez via votre smartphone Android.</Step>

          <H3>3. Ouvrez la conversation</H3>
          <Step n={3}>Accédez à la discussion contenant les audios que vous souhaitez récupérer.</Step>

          <H3>4. Accédez à l&apos;export</H3>
          <Step n={4}>
            Cliquez sur les <strong style={{ color: "#f0e8d8" }}>3 points en haut à droite</strong>, puis choisissez{" "}
            <strong style={{ color: accent }}>Exporter l&apos;historique de discussion</strong>.
          </Step>

          <H3>5. Configurez l&apos;export</H3>
          <Step n={5}>Sélectionnez : Messages, Fichiers, Médias</Step>
          <div style={{ padding: "14px 18px", borderRadius: 12, background: `${telegram}0d`, border: `1px solid ${telegram}30`, margin: "4px 0 20px" }}>
            <p className="ekko-serif" style={{ fontSize: 15, color: "rgba(240,232,216,0.85)", lineHeight: 1.65, margin: 0 }}>
              👉 Et surtout cochez <strong style={{ color: accent }}>Messages vocaux / audio</strong>
            </p>
          </div>

          <H3>6. Paramètres recommandés</H3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "8px 0 20px" }}>
            {[
              { label: "Format", value: "HTML ou JSON" },
              { label: "Qualité", value: "Maximale" },
              { label: "Inclure médias", value: "OUI" },
              { label: "Taille limite", value: "Augmenter si besoin" },
            ].map((p) => (
              <div key={p.label} style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="ekko-serif" style={{ fontSize: 12, color: "rgba(240,232,216,0.4)", marginBottom: 4 }}>{p.label}</p>
                <p className="ekko-serif" style={{ fontSize: 15, color: accent }}>{p.value}</p>
              </div>
            ))}
          </div>

          <H3>7. Lancez l&apos;export</H3>
          <Step n={7}>Telegram génère un dossier contenant messages, fichiers, audios et la structure de la conversation.</Step>

          <Separator />

          {/* Où sont les audios */}
          <H2>Où sont les audios dans Telegram ?</H2>
          <P>Une fois l&apos;export terminé, vous obtenez un dossier. Les audios sont souvent stockés dans :</P>
          <div style={{ margin: "16px 0 24px", padding: "20px 24px", borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {["`voice_messages`", "`audio`", "ou dans les médias généraux"].map((f) => (
              <div key={f} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                <span style={{ color: "rgba(240,232,216,0.25)", fontSize: 13 }}>📁</span>
                <span className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.6)", fontFamily: "ui-monospace, monospace" }}>{f}</span>
              </div>
            ))}
          </div>

          <Separator />

          {/* Pourquoi compliqué */}
          <H2>Pourquoi c&apos;est souvent compliqué</H2>
          <P>Même si Telegram permet un export complet :</P>
          <BulletList items={[
            "les fichiers sont nombreux",
            "les noms ne sont pas clairs",
            "les audios ne sont pas regroupés",
            "difficile de retrouver un moment précis",
          ]} />
          <P>👉 Vous avez les données… mais pas l&apos;expérience.</P>

          <Separator />

          {/* EKKO */}
          <H2>C&apos;est là que EKKO fait toute la différence</H2>
          <P>EKKO a été conçu pour simplifier cette étape.</P>

          <EkkoBlock>
            <p className="ekko-serif" style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: accent, marginBottom: 16 }}>
              Avec EKKO
            </p>
            <BulletList items={[
              "vous importez votre export Telegram",
              "vous visualisez directement les audios disponibles",
              "vous retrouvez facilement les vocaux importants",
            ]} />
            <p className="ekko-serif" style={{ fontSize: 16, color: accent, lineHeight: 1.7, margin: "8px 0 20px", fontStyle: "italic" }}>
              Vous pouvez même écouter gratuitement vos audios exportés et les retrouver facilement sur votre espace VosEkko, avant de créer un souvenir — sans engagement, simplement pour retrouver ce qui compte.
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
          <H2>Et après ? Transformez vos audios Telegram en souvenir</H2>
          <P>Une fois retrouvés, vos vocaux peuvent devenir :</P>
          <BulletList items={[
            "une capsule audio fluide",
            "un souvenir de couple",
            "une mémoire familiale",
            "une compilation d'amitié",
            "un moment à réécouter",
          ]} />
          <p className="ekko-serif" style={{ fontSize: 15, color: "rgba(240,232,216,0.65)", lineHeight: 1.7, fontStyle: "italic" }}>
            Au lieu de rester dispersés dans des dossiers.
          </p>

          <Separator />

          {/* Exemples */}
          <H2>Exemples réels</H2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, margin: "16px 0" }}>
            {[
              { emoji: "💑", label: "Couple", desc: "Retrouver les premiers vocaux timides, les hésitations du début, les messages tardifs, le premier \"je t'aime\"." },
              { emoji: "🤝", label: "Amitié", desc: "Rassembler les meilleurs délires, vocaux spontanés et fous rires." },
              { emoji: "👨‍👩‍👧", label: "Famille", desc: "Conserver des messages précieux qu'on croyait perdus." },
              { emoji: "🕯️", label: "Deuil", desc: "Réentendre la voix d'un être disparu, garder quelques mots importants, retrouver une présence." },
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
            { q: "Peut-on exporter Telegram directement sur Android ?", a: "Non, pas de manière complète. L'ordinateur est nécessaire." },
            { q: "Telegram Web fonctionne-t-il ?", a: "Non. Il faut utiliser Telegram Desktop (application à installer)." },
            { q: "Peut-on exporter une seule conversation ?", a: "Oui, via Telegram Desktop conversation par conversation." },
            { q: "Le format JSON est-il obligatoire ?", a: "Non, mais il est recommandé pour une meilleure exploitation des données." },
          ].map((item) => (
            <div key={item.q} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="ekko-serif" style={{ fontSize: 16, color: "#f0e8d8", fontWeight: 400, marginBottom: 8 }}>{item.q}</p>
              <p className="ekko-serif" style={{ fontSize: 15, color: "rgba(240,232,216,0.65)", lineHeight: 1.65 }}>{item.a}</p>
            </div>
          ))}

          <Separator />

          {/* Conclusion */}
          <H2>Conclusion</H2>
          <P>Exporter ses audios Telegram sur Android est possible.</P>
          <P>Mais contrairement aux autres applications :</P>
          <div style={{ padding: "16px 20px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", margin: "8px 0 20px" }}>
            <p className="ekko-serif" style={{ fontSize: 16, color: "#f0e8d8", lineHeight: 1.65, margin: 0 }}>
              👉 il faut passer par Telegram Desktop sur ordinateur
            </p>
          </div>
          <P>Une fois les données récupérées, le plus difficile reste de retrouver les bons audios.</P>
          <P>
            Et c&apos;est exactement là que <a href="https://vosekko.com" style={{ color: accent, textDecoration: "underline", textUnderlineOffset: 3 }}>EKKO</a> intervient :
            simplifier l&apos;accès à vos souvenirs… et leur redonner de la valeur.
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
