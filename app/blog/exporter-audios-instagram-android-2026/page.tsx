"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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

export default function ArticleInstagramAndroid() {
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
              <span className="ekko-serif" style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: insta, padding: "3px 10px", borderRadius: 20, background: `${insta}18`, border: `1px solid ${insta}30` }}>
                Guide Instagram · Android
              </span>
              <span className="ekko-serif" style={{ fontSize: 11, color: "rgba(240,232,216,0.3)" }}>Avril 2026 · 5 min de lecture</span>
            </div>
            <h1 className="ekko-serif" style={{ fontSize: 30, fontWeight: 300, color: "#f0e8d8", lineHeight: 1.35, marginBottom: 20 }}>
              Comment exporter les audios d&apos;une conversation Instagram sur Android en 2026
            </h1>
            <P>
              Vous avez reçu des messages vocaux importants sur Instagram et vous souhaitez les récupérer ?
              Un vocal amoureux, un fou rire en DM, la voix d&apos;un proche, ou simplement des souvenirs que vous ne voulez plus laisser perdus dans l&apos;application ?
            </P>
            <P>
              Bonne nouvelle : sur Android, il est possible de récupérer les audios Instagram grâce à la méthode officielle de téléchargement des données Meta.
            </P>
            <P>
              Mais contrairement à WhatsApp, Instagram ne propose pas un simple bouton &ldquo;Exporter cette conversation&rdquo;.
              Une fois le fichier téléchargé, les audios peuvent être présents… mais souvent noyés dans une archive remplie de dossiers.
            </P>

            {/* Phrase mise en valeur */}
            <div style={{ margin: "28px 0", padding: "20px 24px", borderRadius: 16, background: `${insta}0d`, border: `1px solid ${insta}30` }}>
              <p className="ekko-serif" style={{ fontSize: 16, lineHeight: 1.7, margin: 0 }}>
                C&apos;est justement là que <a href="https://vosekko.com" style={{ color: accent, fontWeight: 400, textDecoration: "underline", textUnderlineOffset: 3 }}>EKKO</a> devient utile : retrouver et extraire facilement vos audios importants, sans fouiller manuellement partout.{" "}
                <span style={{ color: accent, fontWeight: 400 }}>Vous pouvez même l&apos;utiliser gratuitement pour voir quels audios sont récupérables.</span>
              </p>
            </div>
          </div>

          <Separator />

          {/* Pourquoi */}
          <H2>Pourquoi exporter ses audios Instagram sur Android ?</H2>
          <P>Les raisons les plus fréquentes :</P>
          <BulletList items={[
            "récupérer des vocaux reçus en DM",
            "conserver la voix d'un proche",
            "sauvegarder les débuts d'une relation",
            "retrouver d'anciens messages audio oubliés",
            "garder les souvenirs d'une amitié",
            "réécouter la voix d'une personne disparue",
            "transformer plusieurs vocaux en capsule souvenir avec EKKO",
          ]} />
          <P>Car parfois, quelques secondes de voix valent énormément.</P>

          <Separator />

          {/* Marques */}
          <H2>Fonctionne sur quelles marques Android ?</H2>
          <P>Ce guide fonctionne sur la majorité des smartphones Android :</P>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, margin: "16px 0 24px" }}>
            {["Samsung", "Xiaomi / Redmi", "Google Pixel", "OnePlus", "Motorola", "Oppo", "Realme", "Honor", "Huawei", "Sony", "Nokia", "Asus"].map((brand) => (
              <div key={brand} style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", textAlign: "center" }}>
                <span className="ekko-serif" style={{ fontSize: 13, color: "rgba(240,232,216,0.7)" }}>{brand}</span>
              </div>
            ))}
          </div>
          <P>Les menus changent légèrement selon la marque, mais la méthode reste la même.</P>

          <Separator />

          {/* Guide */}
          <H2>Comment récupérer ses audios Instagram sur Android</H2>

          <H3>1. Ouvrez Instagram</H3>
          <Step n={1}>Lancez l&apos;application Instagram.</Step>

          <H3>2. Allez sur votre profil</H3>
          <Step n={2}>Touchez votre photo de profil en bas à droite.</Step>

          <H3>3. Ouvrez le menu</H3>
          <Step n={3}>Touchez les trois lignes en haut à droite.</Step>

          <H3>4. Entrez dans l&apos;Espace Comptes</H3>
          <Step n={4}>
            Cherchez <strong style={{ color: "#f0e8d8" }}>Espace Comptes</strong> puis{" "}
            <strong style={{ color: "#f0e8d8" }}>Vos informations et autorisations</strong>.
          </Step>

          <H3>5. Sélectionnez &ldquo;Télécharger vos informations&rdquo;</H3>
          <Step n={5}>Instagram vous redirige vers l&apos;outil officiel Meta.</Step>

          <H3>6. Choisissez votre compte Instagram</H3>
          <Step n={6}>Si plusieurs comptes sont reliés, sélectionnez le bon.</Step>

          <H3>7. Sélectionnez &ldquo;Certaines de vos informations&rdquo; puis cochez Messages</H3>
          <Step n={7}>
            Choisissez <strong style={{ color: "#f0e8d8" }}>Certaines de vos informations</strong>, puis cochez{" "}
            <strong style={{ color: "#f0e8d8" }}>Messages</strong>. C&apos;est la partie essentielle pour récupérer les conversations.
          </Step>

          <H3>8. Choisissez le format JSON</H3>
          <Step n={8}>
            Le format <strong style={{ color: "#f0e8d8" }}>JSON</strong> est souvent le plus utile pour retrouver les conversations et les médias.
          </Step>

          <H3>9. Créez le fichier</H3>
          <Step n={9}>
            Meta prépare votre archive. Cela peut prendre de quelques minutes à plusieurs heures selon le volume de données.
          </Step>

          <Separator />

          {/* Où retrouver */}
          <H2>Où retrouver le fichier sur Android ?</H2>
          <P>Le fichier téléchargé est souvent un <strong style={{ color: "#f0e8d8" }}>.zip</strong>. Regardez dans :</P>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "8px 0 20px" }}>
            {["Téléchargements", "Mes fichiers", "Gestionnaire de fichiers", "Files by Google"].map((loc) => (
              <div key={loc} style={{ padding: "12px 18px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: accent, fontSize: 14 }}>📁</span>
                <span className="ekko-serif" style={{ fontSize: 15, color: "#f0e8d8" }}>{loc}</span>
              </div>
            ))}
          </div>

          <Separator />

          {/* Pourquoi compliqué */}
          <H2>Pourquoi c&apos;est compliqué ensuite ?</H2>
          <P>L&apos;archive Instagram contient souvent de nombreux dossiers :</P>
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
          <P>Il faut ensuite trouver la bonne conversation, repérer les bons fichiers audio, comprendre quels audios correspondent à quels messages.</P>
          <P>Pour beaucoup de personnes, c&apos;est vite décourageant.</P>

          <Separator />

          {/* EKKO */}
          <H2>C&apos;est là que EKKO simplifie tout</H2>
          <P>EKKO a été pensé pour éviter de fouiller dans des dizaines de dossiers.</P>

          <EkkoBlock>
            <p className="ekko-serif" style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: accent, marginBottom: 16 }}>
              Avec EKKO
            </p>
            <BulletList items={[
              "importez votre archive Instagram en quelques secondes",
              "les audios disponibles sont identifiés automatiquement",
              "écoutez chaque vocal avant de décider de l'inclure",
              "créez ensuite une capsule souvenir si vous le souhaitez",
            ]} />
            {/* Phrase mise en valeur */}
            <p className="ekko-serif" style={{ fontSize: 16, color: accent, lineHeight: 1.65, margin: "8px 0 20px", fontStyle: "italic" }}>
              Vous pouvez l&apos;utiliser gratuitement pour vérifier quels vocaux sont récupérables avant toute création.
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
            "un hommage",
            "une compilation d'amitié",
          ]} />
          <p className="ekko-serif" style={{ fontSize: 15, color: "rgba(240,232,216,0.65)", lineHeight: 1.7, fontStyle: "italic" }}>
            Au lieu de rester perdus dans un zip oublié.
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
            { q: "Cela marche sur Samsung ?", a: "Oui." },
            { q: "Et sur Xiaomi ?", a: "Oui." },
            { q: "Et sur Google Pixel ?", a: "Oui." },
            { q: "Est-ce officiel ?", a: "Oui, cela passe par l'outil Meta de téléchargement des données." },
            { q: "Peut-on choisir une seule conversation directement ?", a: "Pas toujours simplement. L'archive contient généralement plusieurs données, puis vous sélectionnez ensuite ce qui vous intéresse." },
          ].map((item) => (
            <div key={item.q} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="ekko-serif" style={{ fontSize: 16, color: "#f0e8d8", fontWeight: 400, marginBottom: 8 }}>{item.q}</p>
              <p className="ekko-serif" style={{ fontSize: 15, color: "rgba(240,232,216,0.65)", lineHeight: 1.65 }}>{item.a}</p>
            </div>
          ))}

          <Separator />

          {/* Conclusion */}
          <H2>Conclusion</H2>
          <P>Exporter ses audios Instagram sur Android est possible.</P>
          <P>
            Le vrai problème n&apos;est pas le téléchargement.
            Le vrai problème, c&apos;est retrouver les bons audios dans une archive complexe.
          </P>
          <P>
            Et c&apos;est exactement pour cela que <span style={{ color: accent }}>EKKO</span> existe : simplifier la récupération de vos souvenirs audio et leur redonner de la valeur.
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
