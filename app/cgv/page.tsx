"use client";
import { useRouter } from "next/navigation";
import EkkoLogo from "../components/EkkoLogo";
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
  return <p style={{ marginBottom: 12 }}>{children}</p>;
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
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
    <div
      style={{
        padding: "16px 20px",
        borderRadius: 12,
        background: `${accent}0d`,
        border: `1px solid ${accent}30`,
        marginTop: 16,
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

export default function CGVPage() {
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
          onClick={() => router.back()}
          className="text-sm px-4 py-2 rounded-full ekko-serif transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(240,232,216,0.5)",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(201,169,110,0.12)";
            e.currentTarget.style.color = "rgba(201,169,110,0.9)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            e.currentTarget.style.color = "rgba(240,232,216,0.5)";
          }}
        >
          ← Retour
        </button>
      </nav>

      {/* Contenu */}
      <div className="relative z-10 px-6 pb-32 max-w-2xl mx-auto pt-8">

        {/* En-tête */}
        <div style={{ marginBottom: 52 }}>
          <p
            className="ekko-serif"
            style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: accent, marginBottom: 16 }}
          >
            Mentions légales & conditions
          </p>
          <h1 className="ekko-serif" style={{ fontSize: 28, fontWeight: 300, color: "#f0e8d8", lineHeight: 1.35, marginBottom: 16 }}>
            Conditions Générales de Vente
          </h1>
          <p className="ekko-serif" style={{ fontSize: 13, color: "rgba(240,232,216,0.35)" }}>
            En vigueur au 28 avril 2026 — Service EKKO · vosekko.com
          </p>
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginTop: 28 }} />
        </div>

        {/* Article 1 */}
        <Section title="Article 1 — Identification de l'entreprise">
          <P>
            Le service EKKO est édité et exploité par <strong style={{ color: "#f0e8d8" }}>VosEkko</strong>, accessible à l&apos;adresse{" "}
            <a href="https://vosekko.com" style={{ color: accent, textDecoration: "underline", textUnderlineOffset: 2 }}>
              vosekko.com
            </a>.
          </P>
          <P>
            Pour toute question ou réclamation :{" "}
            <a href="mailto:contact@vosekko.com" style={{ color: accent, textDecoration: "underline", textUnderlineOffset: 2 }}>
              contact@vosekko.com
            </a>
          </P>
        </Section>

        {/* Article 2 */}
        <Section title="Article 2 — Objet">
          <P>
            Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre VosEkko et tout client effectuant un achat sur la plateforme vosekko.com.
          </P>
          <P>
            Toute commande implique l&apos;acceptation pleine et entière des présentes CGV.
          </P>
        </Section>

        {/* Article 3 */}
        <Section title="Article 3 — Services proposés">
          <P>EKKO propose les services numériques personnalisés suivants :</P>
          <Ul>
            <Li>
              <strong style={{ color: "#f0e8d8" }}>Création d&apos;une vocapsule</strong> : assemblage et fusion de messages vocaux fournis par le client, livraison sous forme de fichier audio MP3, accompagné d&apos;un QR code d&apos;accès.
            </Li>
            <Li>
              <strong style={{ color: "#f0e8d8" }}>Option de conservation</strong> : hébergement sécurisé de la vocapsule pendant 1 ou 2 ans selon l&apos;option choisie, avec accès multi-appareils via un lien permanent.
            </Li>
            <Li>
              <strong style={{ color: "#f0e8d8" }}>Accès libre à l&apos;interface</strong> : exploration et écoute des audios récupérables, sans obligation d&apos;achat.
            </Li>
          </Ul>
          <P>
            Ces services sont fournis sous forme de prestations numériques entièrement dématérialisées.
          </P>
        </Section>

        {/* Article 4 */}
        <Section title="Article 4 — Prix">
          <P>Les tarifs en vigueur sont affichés sur la page de commande avant toute validation d&apos;achat.</P>
          <Ul>
            <Li>Vocapsule (accès complet + MP3 + QR code) : <strong style={{ color: "#f0e8d8" }}>9,99 €</strong> TTC</Li>
            <Li>Option conservation 1 an : <strong style={{ color: "#f0e8d8" }}>+1,00 €</strong> TTC</Li>
            <Li>Option conservation 2 ans : <strong style={{ color: "#f0e8d8" }}>+2,00 €</strong> TTC</Li>
          </Ul>
          <P>
            Tous les prix sont exprimés en euros toutes taxes comprises (TTC). VosEkko se réserve le droit de modifier ses tarifs à tout moment. Toute commande est facturée au prix affiché au moment de la validation.
          </P>
        </Section>

        {/* Article 5 */}
        <Section title="Article 5 — Commande et paiement">
          <P>La commande est validée après :</P>
          <Ul>
            <Li>Téléchargement des fichiers audio par le client</Li>
            <Li>Sélection de l&apos;option de conservation souhaitée</Li>
            <Li>Acceptation expresse des présentes CGV et de la renonciation au droit de rétractation</Li>
            <Li>Paiement sécurisé via la plateforme Stripe</Li>
          </Ul>
          <P>
            Le paiement est effectué en une seule fois, par carte bancaire, via la solution de paiement sécurisée Stripe. VosEkko ne conserve aucune donnée de carte bancaire.
          </P>
          <P>
            La commande est définitivement enregistrée dès réception de la confirmation de paiement de Stripe.
          </P>
        </Section>

        {/* Article 6 — Droit de rétractation — le plus important */}
        <Section title="Article 6 — Droit de rétractation">
          <P>
            Conformément aux articles L.221-18 et suivants du Code de la consommation, le consommateur dispose en principe d&apos;un délai de 14 jours pour exercer son droit de rétractation.
          </P>

          <Highlight>
            <p style={{ fontSize: 14, color: "#f0e8d8", lineHeight: 1.7, marginBottom: 10, fontFamily: "Georgia, serif" }}>
              <strong>Exception applicable — Article L.221-28 12° du Code de la consommation</strong>
            </p>
            <p style={{ fontSize: 14, color: "rgba(240,232,216,0.82)", lineHeight: 1.75, fontFamily: "Georgia, serif" }}>
              Le droit de rétractation ne peut être exercé pour les contrats de fourniture d&apos;un contenu numérique non fourni sur un support matériel dont l&apos;exécution a commencé{" "}
              <strong style={{ color: accent }}>après accord préalable exprès du consommateur</strong> et{" "}
              <strong style={{ color: accent }}>renoncement exprès à son droit de rétractation</strong>.
            </p>
          </Highlight>

          <P>
            En cochant la case dédiée avant le paiement, le client donne son accord exprès pour que la création de sa vocapsule commence immédiatement après le paiement et reconnaît expressément renoncer à son droit de rétractation, conformément à l&apos;article L.221-28 12° du Code de la consommation.
          </P>
          <P>
            Cette renonciation est valide uniquement si la case a été cochée par le client avant la validation du paiement.
          </P>
          <P>
            En cas de problème technique imputable à VosEkko empêchant la livraison du service, le client peut contacter{" "}
            <a href="mailto:contact@vosekko.com" style={{ color: accent, textDecoration: "underline", textUnderlineOffset: 2 }}>
              contact@vosekko.com
            </a>{" "}
            pour un examen de sa situation.
          </P>
        </Section>

        {/* Article 7 */}
        <Section title="Article 7 — Livraison et accès au service">
          <P>
            Après confirmation du paiement, la création de la vocapsule démarre automatiquement. Le délai de traitement est généralement de <strong style={{ color: "#f0e8d8" }}>quelques minutes</strong>.
          </P>
          <P>
            Une fois la vocapsule créée, le client peut :
          </P>
          <Ul>
            <Li>Télécharger le fichier MP3 directement depuis la page de confirmation</Li>
            <Li>Accéder au QR code personnel pour un partage ou un réécoute futur</Li>
            <Li>Retrouver la vocapsule depuis son compte VosEkko (si option conservation souscrite)</Li>
          </Ul>
          <P>
            En cas de dysfonctionnement technique, le client est invité à contacter{" "}
            <a href="mailto:contact@vosekko.com" style={{ color: accent, textDecoration: "underline", textUnderlineOffset: 2 }}>
              contact@vosekko.com
            </a>.
          </P>
        </Section>

        {/* Article 8 */}
        <Section title="Article 8 — Données personnelles">
          <P>
            Dans le cadre de l&apos;utilisation du service, VosEkko collecte et traite les données personnelles suivantes :
          </P>
          <Ul>
            <Li>Adresse email (nécessaire à la création du compte et à l&apos;envoi de la confirmation de commande)</Li>
            <Li>Fichiers audio fournis par le client (traités uniquement pour la création de la vocapsule)</Li>
            <Li>Identifiant de paiement Stripe (aucune donnée de carte bancaire n&apos;est conservée par VosEkko)</Li>
          </Ul>
          <P>
            Les fichiers audio temporaires sont supprimés des serveurs dès la création de la vocapsule terminée. La vocapsule finale est conservée selon l&apos;option choisie (7 jours sans conservation, 1 ou 2 ans avec option payante).
          </P>
          <P>
            Conformément au Règlement Général sur la Protection des Données (RGPD), le client dispose d&apos;un droit d&apos;accès, de rectification, de suppression et de portabilité de ses données. Pour exercer ces droits :{" "}
            <a href="mailto:contact@vosekko.com" style={{ color: accent, textDecoration: "underline", textUnderlineOffset: 2 }}>
              contact@vosekko.com
            </a>.
          </P>
        </Section>

        {/* Article 9 */}
        <Section title="Article 9 — Propriété intellectuelle">
          <P>
            Les fichiers audio fournis par le client restent sa propriété exclusive. Le client garantit être titulaire des droits sur les contenus qu&apos;il importe et dégage VosEkko de toute responsabilité à cet égard.
          </P>
          <P>
            L&apos;interface, les textes, les visuels et le code de la plateforme vosekko.com sont la propriété de VosEkko et sont protégés par le droit de la propriété intellectuelle.
          </P>
        </Section>

        {/* Article 10 */}
        <Section title="Article 10 — Responsabilité">
          <P>
            VosEkko s&apos;engage à fournir le service avec tout le soin raisonnablement attendu. Cependant, la responsabilité de VosEkko ne saurait être engagée en cas de :
          </P>
          <Ul>
            <Li>Perte ou corruption des fichiers imputable au client (fichiers corrompus, formats non supportés…)</Li>
            <Li>Indisponibilité temporaire du service pour maintenance</Li>
            <Li>Force majeure</Li>
          </Ul>
        </Section>

        {/* Article 11 */}
        <Section title="Article 11 — Loi applicable et litiges">
          <P>
            Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en priorité via{" "}
            <a href="mailto:contact@vosekko.com" style={{ color: accent, textDecoration: "underline", textUnderlineOffset: 2 }}>
              contact@vosekko.com
            </a>.
          </P>
          <P>
            Conformément aux articles L.611-1 et suivants du Code de la consommation, le client peut recourir gratuitement à un médiateur de la consommation. En cas d&apos;échec, les tribunaux français seront seuls compétents.
          </P>
        </Section>

        {/* Footer */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 24 }} />
        <p className="ekko-serif" style={{ fontSize: 12, color: "rgba(240,232,216,0.25)", textAlign: "center" }}>
          CGV en vigueur au 28 avril 2026 · VosEkko ·{" "}
          <a href="mailto:contact@vosekko.com" style={{ color: "rgba(240,232,216,0.35)" }}>
            contact@vosekko.com
          </a>
        </p>
      </div>
    </div>
  );
}
