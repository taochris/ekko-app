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

export default function ArticleWhatsAppAndroid() {
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
              <span className="ekko-serif" style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: green, padding: "3px 10px", borderRadius: 20, background: `${green}18`, border: `1px solid ${green}30` }}>
                Guide WhatsApp
              </span>
              <span className="ekko-serif" style={{ fontSize: 11, color: "rgba(240,232,216,0.3)" }}>Avril 2026 · 5 min de lecture</span>
            </div>
            <h1 className="ekko-serif" style={{ fontSize: 30, fontWeight: 300, color: "#f0e8d8", lineHeight: 1.35, marginBottom: 20 }}>
              Comment exporter une conversation WhatsApp avec audios sur Android en 2026
            </h1>
            <P>
              Vous avez des messages vocaux précieux sur WhatsApp et vous souhaitez les conserver ?
              Un rire oublié, la voix d&apos;un proche, des souvenirs de couple, ou simplement des messages importants que vous ne voulez plus laisser se perdre dans votre téléphone ?
            </P>
            <P>
              Bonne nouvelle : sur Android, WhatsApp permet toujours d&apos;exporter une conversation avec ses médias.
            </P>
            <P>
              Et une fois récupérés, ces audios peuvent devenir bien plus que de simples fichiers grâce à{" "}
              <a href="https://vosekko.com" style={{ color: accent, fontWeight: 400, textDecoration: "underline", textUnderlineOffset: 3 }}>EKKO</a> : une capsule souvenir à réécouter quand vous le souhaitez.
            </P>
          </div>

          <Separator />

          {/* Section 1 */}
          <H2>Pourquoi exporter une conversation WhatsApp sur Android ?</H2>
          <P>Les raisons les plus fréquentes :</P>
          <BulletList items={[
            "sauvegarder ses messages vocaux avant de changer de téléphone",
            "conserver la voix d'un parent ou d'un proche",
            "transférer ses souvenirs sur ordinateur",
            "archiver une période importante de sa vie",
            "retrouver d'anciens audios perdus dans des années de discussion",
            "transformer plusieurs vocaux en souvenir audio avec EKKO",
          ]} />
          <P>Car certains messages valent plus qu&apos;un stockage interne.</P>

          <Separator />

          {/* Section marques */}
          <H2>Fonctionne sur quelles marques Android ?</H2>
          <P>Ce guide concerne la grande majorité des smartphones Android, notamment :</P>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, margin: "16px 0 24px" }}>
            {["Samsung", "Xiaomi / Redmi", "Google Pixel", "OnePlus", "Motorola", "Oppo", "Realme", "Honor", "Huawei", "Sony", "Nokia", "Asus"].map((brand) => (
              <div key={brand} style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", textAlign: "center" }}>
                <span className="ekko-serif" style={{ fontSize: 13, color: "rgba(240,232,216,0.7)" }}>{brand}</span>
              </div>
            ))}
          </div>
          <P>Les menus peuvent varier légèrement, mais la logique reste presque identique.</P>

          <Separator />

          {/* Section guide */}
          <H2>Comment exporter WhatsApp avec audios sur Android</H2>

          <H3>1. Ouvrez la conversation concernée</H3>
          <Step n={1}>Lancez WhatsApp puis ouvrez la discussion privée ou le groupe à sauvegarder.</Step>

          <H3>2. Touchez les 3 points en haut à droite</H3>
          <Step n={2}>Le menu principal de la conversation s&apos;ouvre.</Step>

          <H3>3. Sélectionnez &ldquo;Plus&rdquo; puis &ldquo;Exporter discussion&rdquo;</H3>
          <Step n={3}>
            Appuyez sur <strong style={{ color: "#f0e8d8" }}>Plus</strong> puis{" "}
            <strong style={{ color: "#f0e8d8" }}>Exporter discussion</strong>.{" "}
            Selon la version, vous pouvez voir : <em style={{ color: "rgba(240,232,216,0.5)" }}>Exporter chat</em> ou <em style={{ color: "rgba(240,232,216,0.5)" }}>Exporter discussion</em>.
          </Step>

          <H3>4. Choisissez l&apos;option importante</H3>
          <P>Deux possibilités :</P>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, margin: "16px 0 24px" }}>
            <div style={{ padding: "16px 18px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="ekko-serif" style={{ fontSize: 13, color: "rgba(240,232,216,0.45)", marginBottom: 6, letterSpacing: "0.05em" }}>Sans médias</p>
              <p className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.65)", lineHeight: 1.5 }}>Version légère, surtout texte.</p>
            </div>
            <div style={{ padding: "16px 18px", borderRadius: 14, background: `${green}0d`, border: `1px solid ${green}30` }}>
              <p className="ekko-serif" style={{ fontSize: 13, color: green, marginBottom: 6, letterSpacing: "0.05em" }}>Inclure médias ✓</p>
              <p className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.8)", lineHeight: 1.5 }}>Inclut photos, vidéos, documents et <strong>messages vocaux</strong>.</p>
            </div>
          </div>
          <Callout emoji="👉">
            Pour récupérer les vocaux, choisissez impérativement <strong style={{ color: accent }}>Inclure médias</strong> (ou &ldquo;Joindre médias&rdquo; selon la version).
          </Callout>

          <H3>5. Choisissez où envoyer le fichier</H3>
          <P>Selon votre smartphone :</P>
          <BulletList items={["Google Drive", "Gmail", "Bluetooth", "Nearby Share / Quick Share", "App Fichiers", "Carte SD", "Ordinateur via câble USB"]} />

          <Separator />

          {/* Où retrouver */}
          <H2>Où retrouver le fichier exporté ?</H2>
          <P>WhatsApp crée souvent un fichier <strong style={{ color: "#f0e8d8" }}>.zip</strong> contenant :</P>
          <BulletList items={["le texte de la conversation", "les images", "les vidéos", "les audios exportés"]} />
          <P>Cherchez dans :</P>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "8px 0 20px" }}>
            {["Mes fichiers / Gestionnaire de fichiers", "Téléchargements", "Le dossier choisi lors de l'export"].map((loc) => (
              <div key={loc} style={{ padding: "12px 18px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: accent, fontSize: 14 }}>📁</span>
                <span className="ekko-serif" style={{ fontSize: 15, color: "#f0e8d8" }}>{loc}</span>
              </div>
            ))}
          </div>

          <Separator />

          {/* Si vocaux absents */}
          <H2>Si les audios n&apos;apparaissent pas</H2>
          <P>Cela arrive parfois sur les longues conversations.</P>

          <H3>Solutions</H3>
          <BulletList items={[
            "Exporter une conversation plus récente — les discussions énormes peuvent être limitées.",
            "Sauvegarder les vocaux un par un : appui long sur un vocal › Partager › Enregistrer.",
            "Vérifier l'espace disponible — un téléphone saturé peut bloquer l'export.",
            "Vérifier les permissions stockage sur certaines surcouches Android.",
          ]} />

          <Separator />

          {/* Cas particuliers */}
          <H2>Cas particuliers selon marques</H2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, margin: "16px 0" }}>
            {[
              { brand: "Samsung", tip: "Utilisez souvent Mes fichiers ou Quick Share." },
              { brand: "Xiaomi / Redmi / Poco", tip: "Cherchez dans l'app Gestionnaire de fichiers." },
              { brand: "Google Pixel", tip: "Utilisez souvent Files by Google." },
              { brand: "Huawei", tip: "Selon version, utilisez stockage interne ou partage direct." },
            ].map((item) => (
              <div key={item.brand} style={{ display: "flex", gap: 14, padding: "14px 18px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <span className="ekko-serif" style={{ fontSize: 14, color: accent, flexShrink: 0, minWidth: 140 }}>{item.brand}</span>
                <span className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.7)", lineHeight: 1.55 }}>{item.tip}</span>
              </div>
            ))}
          </div>

          <Separator />

          {/* Exporter tout */}
          <H2>Peut-on exporter toutes les conversations d&apos;un coup ?</H2>
          <P>En général non. WhatsApp fonctionne discussion par discussion.</P>
          <P>Mais une seule conversation importante suffit parfois à retrouver l&apos;essentiel.</P>

          <Separator />

          {/* Section EKKO */}
          <H2>Et après ? Donnez une vraie vie à vos vocaux</H2>
          <P>Exporter 50 fichiers audio séparés dans un dossier… la plupart des gens ne les réécoutent jamais.</P>
          <P>EKKO change ça.</P>

          <EkkoBlock>
            <p className="ekko-serif" style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: accent, marginBottom: 16 }}>
              EKKO transforme vos exports WhatsApp en capsule émotionnelle
            </p>
            <BulletList items={[
              "plusieurs vocaux deviennent un seul souvenir audio fluide",
              "écoute facile sur mobile",
              "partage par QR code",
              "cadeau unique pour couple, famille, amitié",
              "conservation d'une voix importante",
            ]} />
            <p className="ekko-serif" style={{ fontSize: 15, color: "rgba(240,232,216,0.7)", lineHeight: 1.7, marginTop: 12, fontStyle: "italic" }}>
              Vos fichiers redeviennent des émotions.
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

          {/* Exemples */}
          <H2>Exemples réels</H2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, margin: "16px 0" }}>
            {[
              { emoji: "💑", label: "Couple", desc: "4 ans de messages vocaux réunis en un souvenir. Retrouver les premières phrases timides, les hésitations du début, le premier \"je t'aime\", les fous rires et l'évolution de votre histoire." },
              { emoji: "👨‍👩‍👧", label: "Famille", desc: "La voix d'un parent toujours accessible." },
              { emoji: "🤝", label: "Amitié", desc: "Les meilleurs délires réunis en une capsule." },
              { emoji: "🕯️", label: "Deuil", desc: "Réentendre la voix d'un être disparu, conserver une présence précieuse, garder quelques mots qui comptaient plus que tout." },
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
            { q: "Est-ce que cela marche sur Samsung ?", a: "Oui." },
            { q: "Et sur Xiaomi ?", a: "Oui." },
            { q: "Et sur Google Pixel ?", a: "Oui." },
            { q: "Les menus changent-ils ?", a: "Parfois légèrement selon la marque et la version Android." },
            { q: "Cela fonctionne toujours en 2026 ?", a: "Oui, au moment de la rédaction de cet article, la fonction d'export est toujours disponible." },
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
          <P>Vous cherchiez peut-être juste à exporter une conversation.</P>
          <P>Mais derrière cela, il y a parfois :</P>
          <BulletList items={[
            "des voix qu'on ne veut pas perdre",
            "des souvenirs qu'on croyait oubliés",
            "des messages qui méritent mieux qu'un dossier zip",
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
