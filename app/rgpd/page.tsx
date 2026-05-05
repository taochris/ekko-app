"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import BlobBackground from "../components/BlobBackground";

const accent = "#c9a96e";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2
        className="ekko-serif"
        style={{ fontSize: 18, fontWeight: 400, color: accent, marginBottom: 16, letterSpacing: "0.05em" }}
      >
        {title}
      </h2>
      <div style={{ fontSize: 15, color: "rgba(240,232,216,0.78)", lineHeight: 1.85, fontFamily: "Georgia, 'Times New Roman', serif" }}>
        {children}
      </div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ marginBottom: 14 }}>{children}</p>;
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
      <span style={{ color: accent, flexShrink: 0, marginTop: 4 }}>✦</span>
      <span>{children}</span>
    </li>
  );
}

function Ul({ children }: { children: React.ReactNode }) {
  return <ul style={{ listStyle: "none", padding: 0, margin: "12px 0" }}>{children}</ul>;
}

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: "20px 24px", borderRadius: 14, background: `${accent}0d`, border: `1px solid ${accent}35`, margin: "20px 0" }}>
      {children}
    </div>
  );
}

export default function RGPDPage() {
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
          onClick={() => router.back()}
          className="text-sm px-4 py-2 rounded-full ekko-serif transition-all duration-200"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(240,232,216,0.5)", cursor: "pointer" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(201,169,110,0.12)"; e.currentTarget.style.color = "rgba(201,169,110,0.9)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(240,232,216,0.5)"; }}
        >
          ← Retour
        </button>
      </nav>

      {/* Contenu */}
      <div className="relative z-10 px-6 pb-32 max-w-2xl mx-auto pt-8">

        {/* En-tête */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ marginBottom: 52 }}>
            <p className="ekko-serif" style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: accent, marginBottom: 16 }}>
              Protection des données · RGPD
            </p>
            <h1 className="ekko-serif" style={{ fontSize: 28, fontWeight: 300, color: "#f0e8d8", lineHeight: 1.35, marginBottom: 16 }}>
              Politique de confidentialité
            </h1>
            <p className="ekko-serif" style={{ fontSize: 13, color: "rgba(240,232,216,0.35)" }}>
              En vigueur au 5 mai 2026 — Service EKKO · vosekko.com
            </p>
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginTop: 28 }} />
          </div>
        </motion.div>

        {/* Argument confiance — voix */}
        <div style={{
          padding: "28px 30px",
          borderRadius: 18,
          background: "linear-gradient(135deg, rgba(201,169,110,0.08), rgba(201,169,110,0.04))",
          border: `1px solid ${accent}40`,
          marginBottom: 52,
        }}>
          <p className="ekko-serif" style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: accent, marginBottom: 16 }}>
            ✦ Votre voix, votre contrôle
          </p>
          <p className="ekko-serif" style={{ fontSize: 18, fontWeight: 300, color: "#f0e8d8", lineHeight: 1.55, marginBottom: 16 }}>
            Contrairement aux messageries, vos audios ne sont pas perdus dans un flux.
            Ils sont sécurisés, sélectionnés… et vous gardez le contrôle total.
          </p>
          <p style={{ fontSize: 15, color: "rgba(240,232,216,0.7)", lineHeight: 1.75, fontFamily: "Georgia, serif" }}>
            La voix est intime. Un message vocal contient bien plus qu'un texte : une hésitation, un sourire, une émotion brute.
            C'est précisément parce que vos audios ont cette valeur que nous ne les traitons que pour vous, ne les partageons jamais,
            et vous laissons en décider le destin — y compris les supprimer à tout moment.
          </p>
        </div>

        <Section title="1 — Responsable du traitement">
          <P>
            Le service EKKO est édité et exploité par <strong style={{ color: "#f0e8d8" }}>VosEkko</strong>, accessible à l'adresse{" "}
            <a href="https://vosekko.com" style={{ color: accent, textDecoration: "underline", textUnderlineOffset: 2 }}>vosekko.com</a>.
          </P>
          <P>
            Contact délégué à la protection des données :{" "}
            <a href="mailto:vosekko@outlook.com" style={{ color: accent, textDecoration: "underline", textUnderlineOffset: 2 }}>vosekko@outlook.com</a>
          </P>
        </Section>

        <Section title="2 — Données collectées, finalités et lieux de stockage">
          <Ul>
            <Li>
              <div>
                <strong style={{ color: "#f0e8d8" }}>Adresse email</strong><br />
                Finalité : création de compte, authentification, envoi de la confirmation de commande.<br />
                Stockage : Firebase Authentication (Google Cloud, serveurs région europe-west, UE).<br />
                Durée : jusqu'à suppression du compte ou 3 ans d'inactivité.
              </div>
            </Li>
            <Li>
              <div>
                <strong style={{ color: "#f0e8d8" }}>Fichiers audio importés (bruts)</strong><br />
                Finalité : assemblage et encodage de la vocapsule MP3.<br />
                Stockage : Google Cloud Storage, région europe-west, chiffrement au repos (AES-256).<br />
                Durée : supprimés automatiquement dès la vocapsule créée (généralement quelques minutes après le paiement).
              </div>
            </Li>
            <Li>
              <div>
                <strong style={{ color: "#f0e8d8" }}>Vocapsule MP3 finale</strong><br />
                Finalité : mise à disposition du client via lien sécurisé et QR code.<br />
                Stockage : Google Cloud Storage, région europe-west, chiffrement au repos (AES-256).<br />
                Durée : 7 jours (offre de base), 1 an ou 2 ans (options payantes), puis suppression automatique.
              </div>
            </Li>
            <Li>
              <div>
                <strong style={{ color: "#f0e8d8" }}>Métadonnées de commande</strong><br />
                Finalité : gestion du service, suivi des statuts de capsule, service client.<br />
                Contenu : identifiant de capsule, thème choisi, date de création, statut de traitement.<br />
                Stockage : Firestore (Google Cloud, région europe-west).<br />
                Aucune donnée de carte bancaire — le paiement est géré exclusivement par Stripe (certifié PCI-DSS).
              </div>
            </Li>
            <Li>
              <div>
                <strong style={{ color: "#f0e8d8" }}>Identifiant de transaction Stripe</strong><br />
                Finalité : justification comptable, traçabilité en cas de litige.<br />
                Durée : 10 ans (obligation légale française).
              </div>
            </Li>
          </Ul>
        </Section>

        <Section title="3 — Base légale des traitements">
          <Ul>
            <Li><strong style={{ color: "#f0e8d8" }}>Exécution du contrat (art. 6.1.b RGPD)</strong> — création du compte, traitement des audios, livraison de la vocapsule.</Li>
            <Li><strong style={{ color: "#f0e8d8" }}>Obligation légale (art. 6.1.c RGPD)</strong> — conservation des données comptables (10 ans).</Li>
            <Li><strong style={{ color: "#f0e8d8" }}>Intérêt légitime (art. 6.1.f RGPD)</strong> — sécurité de la plateforme, prévention des abus.</Li>
          </Ul>
        </Section>

        <Section title="4 — Sous-traitants et destinataires">
          <P>Vos données ne sont jamais vendues, cédées ou partagées à des fins publicitaires ou commerciales.</P>
          <P>Elles sont transmises uniquement aux sous-traitants suivants, dans le cadre strict de leur mission :</P>
          <Ul>
            <Li><strong style={{ color: "#f0e8d8" }}>Firebase / Google Cloud (UE)</strong> — authentification, base de données, stockage des fichiers audio et vocapsules.</Li>
            <Li><strong style={{ color: "#f0e8d8" }}>Stripe (UE, certifié PCI-DSS)</strong> — traitement sécurisé des paiements. VosEkko ne voit jamais vos données de carte.</Li>
            <Li><strong style={{ color: "#f0e8d8" }}>Resend</strong> — envoi de l'email de confirmation de commande uniquement.</Li>
            <Li><strong style={{ color: "#f0e8d8" }}>Vercel</strong> — hébergement de l'application web (infrastructure serverless, sans accès aux données utilisateurs).</Li>
          </Ul>
        </Section>

        <Section title="5 — Vos droits">
          <P>Conformément au RGPD, vous disposez à tout moment des droits suivants :</P>
          <Ul>
            <Li><strong style={{ color: "#f0e8d8" }}>Droit d'accès</strong> — obtenir une copie de vos données personnelles détenues par VosEkko.</Li>
            <Li><strong style={{ color: "#f0e8d8" }}>Droit de rectification</strong> — corriger des informations inexactes (email, nom de profil).</Li>
            <Li><strong style={{ color: "#f0e8d8" }}>Droit à l'effacement</strong> — demander la suppression de votre compte et de toutes vos données, y compris vocapsules et audios hébergés, quel que soit votre abonnement en cours (7 jours, 1 an ou 2 ans). Suppression effective sous 72 heures.</Li>
            <Li><strong style={{ color: "#f0e8d8" }}>Droit à la portabilité</strong> — recevoir vos données dans un format structuré et lisible par machine.</Li>
            <Li><strong style={{ color: "#f0e8d8" }}>Droit d'opposition</strong> — vous opposer à certains traitements fondés sur l'intérêt légitime.</Li>
            <Li><strong style={{ color: "#f0e8d8" }}>Droit à la limitation</strong> — demander la suspension d'un traitement le temps d'un examen.</Li>
          </Ul>

          <Highlight>
            <p style={{ fontSize: 14, color: "#f0e8d8", lineHeight: 1.7, fontFamily: "Georgia, serif", marginBottom: 10 }}>
              <strong>Supprimer votre compte et vos audios à tout moment</strong>
            </p>
            <p style={{ fontSize: 14, color: "rgba(240,232,216,0.82)", lineHeight: 1.75, fontFamily: "Georgia, serif" }}>
              Envoyez un email à{" "}
              <a href="mailto:vosekko@outlook.com" style={{ color: accent, textDecoration: "underline", textUnderlineOffset: 2 }}>vosekko@outlook.com</a>{" "}
              avec l'objet <strong>"Suppression de compte"</strong>.<br />
              Nous supprimerons l'intégralité de vos données (profil, vocapsules, fichiers audio hébergés) sous 72 heures,
              quel que soit votre abonnement en cours. Aucun remboursement n'est dû pour la période de conservation restante.
            </p>
          </Highlight>

          <P>
            Pour exercer ces droits :{" "}
            <a href="mailto:vosekko@outlook.com" style={{ color: accent, textDecoration: "underline", textUnderlineOffset: 2 }}>vosekko@outlook.com</a>.
            Vous disposez également du droit d'introduire une réclamation auprès de la{" "}
            <strong style={{ color: "#f0e8d8" }}>CNIL</strong>{" "}
            (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: accent, textDecoration: "underline", textUnderlineOffset: 2 }}>cnil.fr</a>).
          </P>
        </Section>

        <Section title="6 — Sécurité">
          <P>VosEkko met en œuvre les mesures techniques et organisationnelles suivantes pour protéger vos données :</P>
          <Ul>
            <Li>Chiffrement des données au repos (AES-256) et en transit (TLS 1.2+) sur Google Cloud Storage.</Li>
            <Li>Accès aux données restreint au strict nécessaire (principe du moindre privilège).</Li>
            <Li>Authentification Firebase avec tokens sécurisés — aucun mot de passe stocké en clair.</Li>
            <Li>Paiements traités exclusivement par Stripe (certifié PCI-DSS niveau 1) — VosEkko ne voit jamais les données de carte.</Li>
            <Li>Suppression automatique des fichiers audio bruts dès la fin du traitement.</Li>
          </Ul>
        </Section>

        <Section title="7 — Cookies et traceurs">
          <P>
            EKKO n'utilise pas de cookies publicitaires ni de traceurs tiers à des fins marketing.
            Les seuls éléments de session utilisés sont les tokens d'authentification Firebase, nécessaires au fonctionnement du service.
          </P>
        </Section>

        <Section title="8 — Modifications de la politique">
          <P>
            VosEkko se réserve le droit de modifier la présente politique à tout moment. En cas de modification substantielle,
            vous serez informé par email. La version en vigueur est toujours accessible à l'adresse{" "}
            <a href="https://vosekko.com/rgpd" style={{ color: accent, textDecoration: "underline", textUnderlineOffset: 2 }}>vosekko.com/rgpd</a>.
          </P>
        </Section>

        {/* Footer */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 24 }} />
        <p className="ekko-serif" style={{ fontSize: 12, color: "rgba(240,232,216,0.25)", textAlign: "center" }}>
          Politique de confidentialité en vigueur au 5 mai 2026 · VosEkko ·{" "}
          <a href="mailto:vosekko@outlook.com" style={{ color: "rgba(240,232,216,0.35)" }}>vosekko@outlook.com</a>
        </p>

      </div>
    </div>
  );
}
