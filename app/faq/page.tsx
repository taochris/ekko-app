"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import BlobBackground from "../components/BlobBackground";

const accent = "#c9a96e";

// ── Types ──────────────────────────────────────────────────────────────────
type OS = "iphone" | "android";

interface StepList {
  iphone: string[];
  android: string[];
  shared?: string[]; // mêmes étapes pour les deux
}

interface AppGuide {
  emoji: string;
  name: string;
  color: string;
  steps: StepList;
}

// ── Données ────────────────────────────────────────────────────────────────
const APP_GUIDES: AppGuide[] = [
  {
    emoji: "🟢",
    name: "WhatsApp",
    color: "#25D366",
    steps: {
      iphone: [
        "Ouvrez la conversation WhatsApp",
        "Appuyez sur le nom ou la photo du contact en haut",
        "Faites défiler vers le bas → \"Exporter la discussion\"",
        "Choisissez \"Avec médias\" pour inclure les messages vocaux",
        "WhatsApp affiche une feuille de partage :",
        "→ Sur iPhone directement : appuyez sur \"Enregistrer dans Fichiers\" sur votre appareil, puis ouvrez EKKO depuis Safari et importez le ZIP via l'appli Fichiers",
        "→ Pour passer sur PC : choisissez iCloud Drive, Google Drive ou Dropbox comme destination, synchronisez, puis récupérez le ZIP sur votre ordinateur et glissez-le dans EKKO",
      ],
      android: [
        "Ouvrez la conversation WhatsApp",
        "Appuyez sur ⋮ (en haut à droite) → Plus → Exporter la discussion",
        "Choisissez \"Avec les médias\" pour inclure les messages vocaux",
        "⚠️ Limitation Android : WhatsApp peut tronquer l'export si la conversation est très longue ou si les médias sont trop volumineux. Dans ce cas, l'export sera partiel — les audios les plus anciens risquent d'être absents.",
        "💡 Solution : si votre export est incomplet, refaites l'export depuis un iPhone — Apple n'impose pas cette limitation",
        "Envoyez le fichier ZIP par email, Google Drive ou autre, puis importez-le dans EKKO",
      ],
    },
  },
  {
    emoji: "🔵",
    name: "Messenger",
    color: "#0084FF",
    steps: {
      iphone: [],
      android: [],
      shared: [
        "ℹ️ Messenger distingue deux types de conversations — comme pour les messages texte, les audios suivent le même régime : les conversations classiques sont exportables via Facebook, les conversations chiffrées de bout en bout (E2E) nécessitent une procédure séparée.",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "🔓 SOLUTION 1 — Conversation classique (non chiffrée)",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "Sur iPhone : ouvrez l'app Facebook → photo de profil en haut à gauche → flèche déroulante à côté de votre nom → tout en bas \"Espace compte\"",
        "Sur Android : ouvrez Facebook → menu ☰ → \"Paramètres et confidentialité\" → \"Paramètres\"",
        "Puis (commun) : \"Vos informations et autorisations\" → \"Exporter vos informations\" → \"Créer une exportation\"",
        "Sélectionnez votre compte Facebook si demandé",
        "Choisissez la période souhaitée",
        "\"Personnaliser les informations\" → décochez ABSOLUMENT TOUT → cochez uniquement \"Messages\"",
        "Format : JSON (obligatoire pour extraire les audios) — Qualité multimédia : Supérieure",
        "Lancez l'exportation — vous recevrez une notification quand le ZIP est prêt",
        "Téléchargez le ZIP et importez-le dans EKKO — les audios des conversations classiques y sont inclus",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "🔒 SOLUTION 2 — Conversation chiffrée de bout en bout (E2E)",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "Si vos audios n'apparaissent pas dans l'export Facebook ci-dessus, c'est que la conversation est chiffrée E2E. Les données chiffrées ne transitent pas par les serveurs Facebook et nécessitent une procédure dédiée.",
        "Ouvrez Messenger sur PC/Mac (Messenger Desktop) : https://www.messenger.com/",
        "Cliquez sur votre icône de profil → \"Confidentialité et sécurité\"",
        "\"Discussions chiffrées de bout en bout\" → \"Stockage des messages\"",
        "\"Télécharger les données de stockage sécurisé\" (code PIN de sauvegarde requis)",
        "Importez l'archive reçue dans EKKO",
      ],
    },
  },
  {
    emoji: "🟣",
    name: "Instagram",
    color: "#C13584",
    steps: {
      iphone: [],
      android: [],
      shared: [
        "Ouvrez Instagram → appuyez sur les 3 barres horizontales (☰) en haut à droite",
        "\"Paramètres et activité\" → \"Espace compte\"",
        "\"Vos informations et autorisations\" → \"Exporter vos informations\"",
        "\"Créer une exportation\"",
        "Choisissez votre compte Instagram",
        "\"Exporter sur mon appareil\"",
        "\"Choisir les informations spécifiques à exporter\"",
        "Décochez tout sauf \"Messages\" et \"Contenu multimédia\"",
        "Choisissez la période souhaitée",
        "Format : JSON — Qualité multimédia : Supérieure",
        "Lancez l'exportation — vous recevrez une notification quand c'est prêt",
        "Téléchargez le ZIP et importez-le dans EKKO",
      ],
    },
  },
  {
    emoji: "🔷",
    name: "Telegram",
    color: "#2AABEE",
    steps: {
      iphone: [],
      android: [],
      shared: [
        "⚠️ Telegram Web (web.telegram.org) et l'app mobile NE permettent PAS l'export des messages — cette fonctionnalité est réservée à l'application desktop. Téléchargez Telegram Desktop (PC/Mac) ici : https://desktop.telegram.org/",
        "Une fois installé, connectez-vous avec le même numéro de téléphone que votre compte Telegram",
        "Ouvrez la conversation dont vous souhaitez exporter les messages vocaux",
        "Cliquez sur les ⋮ (3 points) en haut à droite de la conversation → \"Exporter l'historique des échanges\"",
        "Dans la fenêtre d'export : décochez TOUT, cochez uniquement ☑ \"Messages vocaux\"",
        "Format : JSON — augmentez la limite de taille si besoin (ex : 500 MB pour les longues conversations)",
        "Cliquez sur \"Exporter\" — ⚠️ Telegram envoie une confirmation sur votre téléphone mobile, acceptez-la",
        "Une fois l'export terminé, cliquez sur \"Afficher mes données\" : vous obtenez un dossier contenant result.json et un sous-dossier voice_messages/ avec les fichiers .ogg",
        "Déposez directement les fichiers .ogg du dossier voice_messages/ dans EKKO (pas besoin du fichier JSON)",
      ],
    },
  },
];

// ── Composants utilitaires ─────────────────────────────────────────────────

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      style={{ width: 16, height: 16, transition: "transform 0.3s", transform: open ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function Accordion({ title, children, defaultOpen = false }: { title: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderRadius: 14, border: "1px solid rgba(201,169,110,0.12)", overflow: "hidden", background: "rgba(255,255,255,0.02)", marginBottom: 10 }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "none", border: "none", cursor: "pointer", color: open ? accent : "rgba(240,232,216,0.75)", textAlign: "left", gap: 12 }}
      >
        <span className="ekko-serif" style={{ fontSize: 15, fontWeight: 400 }}>{title}</span>
        <Chevron open={open} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 20px 20px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OSToggle({ os, setOs }: { os: OS; setOs: (v: OS) => void }) {
  return (
    <div style={{ display: "flex", gap: 8, margin: "14px 0 18px" }}>
      {(["iphone", "android"] as OS[]).map(v => (
        <button
          key={v}
          onClick={() => setOs(v)}
          className="ekko-serif"
          style={{
            padding: "6px 16px", borderRadius: 20, fontSize: 13, cursor: "pointer", border: "none",
            background: os === v ? accent : "rgba(255,255,255,0.06)",
            color: os === v ? "#0d0a0f" : "rgba(240,232,216,0.5)",
            fontWeight: os === v ? 600 : 400,
            transition: "all 0.2s",
          }}
        >
          {v === "iphone" ? "📱 iPhone" : "🤖 Android"}
        </button>
      ))}
    </div>
  );
}

function renderStepText(text: string) {
  const urlRegex = /(https?:\/\/[^\s)]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) =>
    urlRegex.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer"
        style={{ color: accent, textDecoration: "underline", textUnderlineOffset: 3 }}>
        {part}
      </a>
    ) : part
  );
}

function StepsList({ steps }: { steps: string[] }) {
  if (steps.length === 0) return (
    <p className="ekko-serif" style={{ fontSize: 13, color: "rgba(240,232,216,0.3)", fontStyle: "italic", marginTop: 10 }}>
      Guide à venir…
    </p>
  );
  return (
    <ol style={{ margin: "10px 0 0", paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
      {steps.map((s, i) => (
        <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span className="ekko-serif" style={{ fontSize: 11, minWidth: 22, height: 22, borderRadius: "50%", border: `1px solid ${accent}40`, color: accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
            {i + 1}
          </span>
          <span className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.75)", lineHeight: 1.5 }}>{renderStepText(s)}</span>
        </li>
      ))}
    </ol>
  );
}

function AppGuideAccordion({ guide }: { guide: AppGuide }) {
  const [os, setOs] = useState<OS>("iphone");
  const isShared = !!(guide.steps.shared && guide.steps.shared.length > 0);
  const steps = isShared ? guide.steps.shared! : (os === "iphone" ? guide.steps.iphone : guide.steps.android);

  return (
    <Accordion title={<span style={{ display: "flex", alignItems: "center", gap: 8 }}>{guide.emoji} <span style={{ color: guide.color }}>{guide.name}</span></span>}>
      <p className="ekko-serif" style={{ fontSize: 13, color: "rgba(240,232,216,0.4)", margin: "14px 0 0" }}>
        Comment récupérer mes audios {guide.name} ?
      </p>
      {isShared ? (
        <p className="ekko-serif" style={{ fontSize: 12, color: "rgba(240,232,216,0.3)", fontStyle: "italic", margin: "6px 0 4px" }}>
          iPhone &amp; Android — même procédure
        </p>
      ) : (
        <OSToggle os={os} setOs={setOs} />
      )}
      <StepsList steps={steps} />
    </Accordion>
  );
}

// ── Sondage générique ──────────────────────────────────────────────────────
function Survey({ question, options }: { question: string; options: { id: string; label: string }[] }) {
  const [vote, setVote] = useState<string | null>(null);
  return (
    <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
      <p className="ekko-serif" style={{ fontSize: 13, color: "rgba(240,232,216,0.5)", marginBottom: 4 }}>
        {question}
      </p>
      {options.map(o => (
        <button
          key={o.id}
          onClick={() => setVote(o.id)}
          className="ekko-serif"
          style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 10,
            border: `1px solid ${vote === o.id ? accent + "60" : "rgba(255,255,255,0.08)"}`,
            background: vote === o.id ? accent + "12" : "rgba(255,255,255,0.03)",
            color: vote === o.id ? accent : "rgba(240,232,216,0.6)",
            cursor: "pointer", fontSize: 14, textAlign: "left", transition: "all 0.2s",
          }}
        >
          <span style={{
            width: 16, height: 16, borderRadius: "50%", flexShrink: 0, transition: "all 0.2s",
            border: `1.5px solid ${vote === o.id ? accent : "rgba(255,255,255,0.2)"}`,
            background: vote === o.id ? accent : "transparent", display: "inline-block",
          }} />
          {o.label}
        </button>
      ))}
      {vote && (
        <p className="ekko-serif" style={{ fontSize: 12, color: accent + "90", marginTop: 4, fontStyle: "italic" }}>
          Merci pour votre retour ✦
        </p>
      )}
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────────────────
export default function FaqPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "#0d0a0f" }}>
      <BlobBackground variant="deuil" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-7 md:px-14">
        <img src="/ekko-logo.png" alt="EKKO" style={{ height: 56, width: "auto", objectFit: "contain", mixBlendMode: "screen" }} />
        <button
          onClick={() => router.back()}
          className="text-sm px-4 py-2 rounded-full ekko-serif transition-all duration-200"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(240,232,216,0.5)" }}
        >
          ← Retour
        </button>
      </nav>

      {/* Content */}
      <div className="relative z-10 px-6 pb-32 max-w-2xl mx-auto pt-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

          {/* Header */}
          <p className="ekko-serif text-center" style={{ fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", color: `${accent}70`, marginBottom: 12 }}>
            Aide &amp; Questions fréquentes
          </p>
          <h1 className="ekko-serif text-center" style={{ fontSize: 32, fontWeight: 300, color: "#f0e8d8", marginBottom: 8 }}>
            FAQ
          </h1>
          <p className="ekko-serif text-center" style={{ fontSize: 14, color: "rgba(240,232,216,0.35)", fontStyle: "italic", marginBottom: 48 }}>
            Tout ce qu'il faut savoir pour utiliser EKKO.
          </p>

          {/* ── Section 1 : Comprendre EKKO ── */}
          <SectionAccordion title="🎵 Comprendre EKKO">

          <Accordion title="Qu'est-ce qu'une vocapsule ?">
            <p className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.65)", lineHeight: 1.7, marginTop: 14 }}>
              Une vocapsule est un fichier audio unique créé en fusionnant plusieurs messages vocaux récupérés depuis WhatsApp, Instagram, Messenger ou Telegram.
              C'est une capsule sonore — un souvenir vocal que vous pouvez écouter, télécharger sur n'importe quel appareil, et partager via un QR code.
            </p>
          </Accordion>

          <Accordion title="Puis-je écouter ma vocapsule sans connexion internet ?">
            <p className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.65)", lineHeight: 1.7, marginTop: 14 }}>
              Oui. Une fois le fichier téléchargé sur votre appareil (téléphone, ordinateur, tablette), il vous appartient complètement.
              Vous pouvez l'écouter à tout moment, autant de fois que vous le souhaitez, même sans connexion. Le téléchargement est inclus dans le prix.
            </p>
          </Accordion>

          <Accordion title="Puis-je écouter mes audios avant de valider ?">
            <p className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.65)", lineHeight: 1.7, marginTop: 14 }}>
              Oui. Sur l'écran de sélection, chaque audio dispose d'un bouton play pour l'écouter directement avant de décider de l'inclure ou non dans votre vocapsule.
            </p>
          </Accordion>

          <Accordion title="Combien de fichiers audio puis-je fusionner ?">
            <p className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.65)", lineHeight: 1.7, marginTop: 14 }}>
              Il n'y a pas de limite en nombre. Vous sélectionnez les audios que vous souhaitez parmi ceux importés — la seule limite est la durée totale, plafonnée à <span style={{ color: accent }}>1 heure</span>. Un compteur vous indique en temps réel où vous en êtes.
            </p>
            <Survey
              question="👉 Pour nous aider à calibrer l'outil, combien d'audios utiliseriez-vous typiquement ?"
              options={[
                { id: "lt10", label: "Moins de 10" },
                { id: "10to30", label: "Entre 10 et 30" },
                { id: "30to100", label: "Entre 30 et 100" },
                { id: "gt100", label: "Plus de 100" },
              ]}
            />
          </Accordion>

          </SectionAccordion>

          {/* ── Section 2 : Paiement & stockage ── */}
          <SectionAccordion title="💳 Paiement &amp; stockage" marginTop={8}>

          <Accordion title="Combien coûte une vocapsule ?">
            <p className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.65)", lineHeight: 1.7, marginTop: 14 }}>
              La création d'une vocapsule coûte <span style={{ color: accent }}>9,99 €</span>. Ce tarif inclut la fusion de vos audios, le téléchargement du fichier audio, le QR code et un accès en ligne pendant 7 jours.
            </p>
          </Accordion>

          <Accordion title="Que se passe-t-il après 7 jours ?">
            <p className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.65)", lineHeight: 1.7, marginTop: 14 }}>
              Le lien en ligne et le QR code expirent — le fichier est supprimé de nos serveurs. Mais si vous avez <span style={{ color: accent }}>téléchargé le fichier</span> sur votre appareil, il reste accessible pour toujours.
            </p>
            <p className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.65)", lineHeight: 1.7, marginTop: 10 }}>
              Si vous souhaitez conserver le lien et le QR code actifs plus longtemps, vous pouvez choisir une conservation d'<span style={{ color: accent }}>1 an (10,99 €)</span> ou <span style={{ color: accent }}>2 ans (11,99 €)</span> au moment de la création.
            </p>
          </Accordion>

          <Accordion title="Puis-je prolonger la durée de stockage après coup ?">
            <p className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.65)", lineHeight: 1.7, marginTop: 14 }}>
              Non, la durée se choisit uniquement au moment du paiement. En revanche, si vous téléchargez votre fichier immédiatement après la création, vous l'avez pour toujours — sans limite de temps.
            </p>
          </Accordion>

          <Accordion title="Mon paiement est-il sécurisé ?">
            <p className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.65)", lineHeight: 1.7, marginTop: 14 }}>
              Oui. Le paiement est traité par <span style={{ color: accent }}>Stripe</span>, référence mondiale des paiements en ligne. EKKO ne stocke jamais vos données bancaires.
            </p>
          </Accordion>

          <Accordion title="Que se passe-t-il si j'annule le paiement ?">
            <p className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.65)", lineHeight: 1.7, marginTop: 14 }}>
              Rien n'est créé, rien n'est facturé. Vous pouvez recommencer à tout moment.
            </p>
          </Accordion>

          </SectionAccordion>

          {/* ── Section 3 : Accès & partage ── */}
          <SectionAccordion title="🔗 Accès &amp; partage" marginTop={8}>

          <Accordion title="Comment retrouver ma vocapsule rapidement ?">
            <p className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.65)", lineHeight: 1.7, marginTop: 14 }}>
              Si vous êtes connecté, cliquez sur <span style={{ color: accent }}>✦ Mes échos</span> dans la navigation — une fenêtre s'ouvre immédiatement avec vos QR codes, les liens d'écoute et les dates d'expiration.
              Vous pouvez aussi tout retrouver dans <span style={{ color: accent }}>Mon compte</span>.
            </p>
          </Accordion>

          <Accordion title="Peut-on partager le QR code avec quelqu'un sans compte EKKO ?">
            <p className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.65)", lineHeight: 1.7, marginTop: 14 }}>
              Oui. Le QR code redirige vers une page d'écoute accessible <span style={{ color: accent }}>sans inscription</span>. N'importe qui peut le scanner et écouter la vocapsule, tant qu'elle n'a pas expiré.
            </p>
          </Accordion>

          <Accordion title="Que voit-on quand on scanne le QR code ?">
            <p className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.65)", lineHeight: 1.7, marginTop: 14 }}>
              Une page épurée avec le lecteur audio. Pas de publicité, pas d'inscription — juste l'écoute.
            </p>
          </Accordion>

          </SectionAccordion>

          {/* ── Section 4 : Confidentialité ── */}
          <SectionAccordion title="🔐 Confidentialité" marginTop={8}>

          <Accordion title="Mes messages vocaux originaux sont-ils conservés ?">
            <p className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.65)", lineHeight: 1.7, marginTop: 14 }}>
              Non. Vos fichiers audio d'origine sont utilisés uniquement pendant la création (quelques secondes à quelques minutes). Seul le fichier fusionné final est conservé, pour la durée que vous avez choisie.
            </p>
          </Accordion>

          <Accordion title="Faut-il un compte pour créer une vocapsule ?">
            <p className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.65)", lineHeight: 1.7, marginTop: 14 }}>
              Un compte est requis uniquement au moment du paiement. Vous pouvez importer et sélectionner vos audios sans être connecté — la connexion est demandée juste avant de payer.
            </p>
          </Accordion>

          </SectionAccordion>

          {/* ── Section 5 : Importer mes audios ── */}
          <SectionAccordion title="📥 Importer mes audios" marginTop={8}>

          <Accordion title="Puis-je importer autre chose que des audios ?">
            <p className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.65)", lineHeight: 1.7, marginTop: 14 }}>
              Actuellement non — EKKO est conçu autour du son et de la voix.
            </p>
            <p className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.65)", lineHeight: 1.7, marginTop: 10 }}>
              Mais nous travaillons activement sur une nouvelle fonctionnalité :<br />
              <span style={{ color: accent }}>👉 associer des photos à vos audios</span> pour créer une expérience encore plus immersive.
            </p>
            <Survey
              question="👉 Est-ce que ça vous plairait ?"
              options={[
                { id: "yes", label: "Oui, clairement" },
                { id: "maybe", label: "Pourquoi pas" },
                { id: "no", label: "Non" },
              ]}
            />
          </Accordion>

          </SectionAccordion>

          {/* ── Section 6 : Guides par app ── */}
          <SectionLabel style={{ marginTop: 40 }}>📲 Comment récupérer mes audios selon mon application ?</SectionLabel>

          {APP_GUIDES.map(g => (
            <AppGuideAccordion key={g.name} guide={g} />
          ))}

          {/* ── Astuce ── */}
          <div style={{ marginTop: 32, padding: "18px 22px", borderRadius: 16, background: `${accent}0a`, border: `1px solid ${accent}20` }}>
            <p className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.65)", lineHeight: 1.7, margin: 0 }}>
              💡 <span style={{ color: accent }}>Astuce EKKO</span><br />
              Plus vous importez de médias, plus vous aurez de choix pour créer une vocapsule riche et émotionnelle.
            </p>
          </div>

        </motion.div>
      </div>
    </div>
  );
}

function SectionLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p className="ekko-serif" style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: `${accent}80`, marginBottom: 14, ...style }}>
      {children}
    </p>
  );
}

function SectionAccordion({ title, children, defaultOpen = false, marginTop = 0 }: {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  marginTop?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginTop, marginBottom: 10 }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 0", background: "none", border: "none", borderBottom: `1px solid ${open ? accent + "30" : "rgba(255,255,255,0.07)"}`,
          cursor: "pointer", textAlign: "left", gap: 12, transition: "border-color 0.2s",
        }}
      >
        <span className="ekko-serif" style={{
          fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase",
          color: open ? accent : `${accent}e6`,
          transition: "color 0.2s",
        }}>
          {title}
        </span>
        <Chevron open={open} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ paddingTop: 16 }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
