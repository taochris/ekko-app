"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import BlobBackground from "../../components/BlobBackground";

const accent = "#c9a96e";
const rose = "#e8637a";

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="ekko-serif" style={{ fontSize: 24, fontWeight: 400, color: accent, marginTop: 52, marginBottom: 16, lineHeight: 1.35 }}>
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="ekko-serif" style={{ fontSize: 18, fontWeight: 400, color: "rgba(240,232,216,0.75)", marginTop: 28, marginBottom: 10, lineHeight: 1.4, fontStyle: "italic" }}>
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="ekko-serif" style={{ fontSize: 16, color: "rgba(240,232,216,0.88)", lineHeight: 1.75, marginBottom: 20 }}>
      {children}
    </p>
  );
}

function Quote({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ borderLeft: `3px solid ${accent}60`, paddingLeft: 20, margin: "24px 0" }}>
      <p className="ekko-serif" style={{ fontSize: 15, color: "rgba(240,232,216,0.7)", lineHeight: 1.75, fontStyle: "italic", margin: 0 }}>
        {children}
      </p>
    </div>
  );
}

function Separator() {
  return <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "44px 0" }} />;
}

export default function FlirterSelonGenerationsPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "#0d0a0f" }}>
      <BlobBackground variant="amour" />

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

      {/* Hero */}
      <div className="relative z-10 px-6 pt-4 pb-8 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
            <span className="ekko-serif" style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: rose, padding: "3px 10px", borderRadius: 20, background: `${rose}18`, border: `1px solid ${rose}30` }}>
              Amour · Séduction
            </span>
            <span className="ekko-serif" style={{ fontSize: 11, color: "rgba(240,232,216,0.3)" }}>Mai 2026</span>
            <span className="ekko-serif" style={{ fontSize: 11, color: "rgba(240,232,216,0.3)" }}>· 8 min de lecture</span>
          </div>
          <h1 className="ekko-serif" style={{ fontSize: 34, fontWeight: 300, color: "#f0e8d8", lineHeight: 1.35, marginBottom: 20 }}>
            Qu'est-ce que flirter selon les générations ?
            <span style={{ display: "block", fontSize: 18, color: "rgba(240,232,216,0.5)", marginTop: 12, fontStyle: "italic", fontWeight: 300 }}>
              Du bal au vocal, chaque époque a ses codes — mais certaines choses ne changent jamais.
            </span>
          </h1>
        </motion.div>
      </div>

      {/* Contenu */}
      <div className="relative z-10 px-6 pb-32 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>

          <P>Au fil du temps et des générations, la drague et la séduction ont pris des formes différentes. Les approches changent, les lieux aussi, tout comme les moyens de communication : à un bal, dans un bar, par téléphone, par message privé ou même via un vocal envoyé un peu trop vite.</P>
          <P>Chaque génération a ses habitudes, ses codes, ses maladresses et ses façons d'oser. À 18 ans comme à 79 ans, flirter reste une expérience très personnelle, mais le contexte change tout : on ne séduit pas tout à fait de la même manière avec une danse, un regard, un SMS ou un message vocal.</P>

          <Separator />

          <H2>Les baby-boomers : 61 à 79 ans</H2>
          <H3>Le conseil de drague : "Sois toi-même et sois respectueux."</H3>

          <P>Pour <strong style={{ color: "#f0e8d8" }}>Jean Morel</strong>, coach en développement personnel de 64 ans, rester authentique lorsqu'on flirte est essentiel.</P>
          <Quote>Essayez de ne pas imiter la façon dont on flirte dans les films et à la télévision. Ce n'est ni naturel ni authentique, et c'est beaucoup plus difficile à faire que ça n'y paraît à l'écran.</Quote>
          <P>De son côté, <strong style={{ color: "#f0e8d8" }}>Paul Santini</strong>, ancien restaurateur de plus de 70 ans, a souvent constaté que les personnes les plus à l'aise en amour ne sont pas forcément celles qui cherchent à impressionner.</P>
          <P>Selon lui, celles qui créent le plus de lien sont souvent celles qui posent de vraies questions, qui écoutent sincèrement la réponse et qui montrent un intérêt réel pour l'autre personne.</P>
          <P>À cette génération, le flirt passe souvent par la présence, la courtoisie, la patience et l'attention portée aux détails. Un compliment simple, une conversation bien menée ou une invitation formulée avec délicatesse peuvent avoir beaucoup plus d'effet qu'une grande démonstration.</P>

          <Separator />

          <H2>La génération X : 45 à 60 ans</H2>
          <H3>Le conseil de drague : "Sois drôle, intéressant et intéressé."</H3>

          <P><strong style={{ color: "#f0e8d8" }}>Claire Dumas</strong>, 51 ans, estime que le plus important est de rester soi-même.</P>
          <Quote>Pour moi, le mieux, c'est d'être soi-même en matière de flirt. Si ce n'est pas possible, par peur, timidité ou pour toute autre raison, concentrez-vous sur un intérêt sincère. Posez une question pertinente et écoutez attentivement la réponse. Si vous vous souvenez d'un détail et que vous le mentionnez plus tard, ce sera toujours apprécié.</Quote>
          <P><strong style={{ color: "#f0e8d8" }}>Marc Bellanger</strong>, 47 ans, raconte quant à lui que les meilleures "stratégies" de séduction consistent souvent à ne pas trop en avoir.</P>
          <P>S'intéresser sincèrement à ce que pense l'autre personne, faire rire sans forcer, rebondir naturellement dans la conversation : voilà ce qui crée une vraie complicité.</P>
          <P>Pour <strong style={{ color: "#f0e8d8" }}>Sophie Laurent</strong>, coach en relations amoureuses, le point de départ essentiel reste l'écoute active.</P>
          <Quote>Il s'agit de percevoir la réceptivité et l'ouverture de l'autre personne à la séduction. Il n'y a rien de plus gênant que quelqu'un qui flirte avec vous sans se rendre compte que vous n'appréciez pas.</Quote>
          <P>La génération X a connu les rencontres sans applications, les appels fixes, les débuts du téléphone portable, puis les messages instantanés. Elle a donc souvent une approche hybride : assez directe pour oser, mais encore très attachée au ton, au regard et à la qualité de l'échange.</P>

          <Separator />

          <H2>Les millennials : 29 à 44 ans</H2>
          <H3>Le conseil de drague : "Sois amical et spirituel."</H3>

          <P>Pour <strong style={{ color: "#f0e8d8" }}>Lina Martin</strong>, spécialiste des rencontres, les millennials accordent beaucoup d'importance à l'humour et aux discussions longues. Les échanges permettent de dévoiler davantage la personnalité, les références communes, la sensibilité et la façon de voir le monde.</P>
          <P><strong style={{ color: "#f0e8d8" }}>Élodie Perrin</strong>, 38 ans, voit le flirt comme quelque chose de simple et naturel.</P>
          <Quote>Pour moi, flirter, c'est surtout être amicale. J'essaie de créer une ambiance détendue, où l'échange peut devenir plus léger, plus complice, sans pression.</Quote>
          <P><strong style={{ color: "#f0e8d8" }}>Maya Legrand</strong>, organisatrice d'événements pour célibataires, apprécie les approches simples et attentionnées. Elle donne l'exemple d'une phrase directe, mais respectueuse :</P>
          <Quote>J'espère que tu ne m'en voudras pas, mais je t'ai remarqué et je voulais te donner mes coordonnées au cas où tu voudrais qu'on se recontacte. On pourrait peut-être prendre un café un de ces jours ?</Quote>
          <P>Aujourd'hui, il est d'ailleurs devenu courant de partager son compte Instagram plutôt qu'un numéro de téléphone. C'est une manière plus discrète de rester en contact, tout en laissant à chacun la possibilité de découvrir un peu l'univers de l'autre.</P>
          <P>Pour les millennials, le flirt passe souvent par un mélange d'humour, de second degré, de messages bien placés et de petites attentions numériques. Un simple vocal, une story qui fait réagir ou une private joke peuvent parfois créer plus de proximité qu'un long discours.</P>

          <Separator />

          <H2>La génération Z : 13 à 28 ans</H2>
          <H3>Le conseil de drague : "Complimente, sois impertinent et authentique."</H3>

          <P>La génération Z privilégie souvent une approche plus ludique. Les mèmes, les références à TikTok, les messages vocaux spontanés ou les petites blagues absurdes font partie de ses codes.</P>
          <P>Pour <strong style={{ color: "#f0e8d8" }}>Nora Vidal</strong>, spécialiste des relations sociales, les jeunes générations recherchent surtout quelque chose qui sonne vrai, plutôt qu'un message trop préparé ou trop parfait.</P>
          <P>Un flirt trop lisse peut vite sembler artificiel. À l'inverse, une phrase spontanée, une petite maladresse assumée ou un vocal envoyé sur le ton de l'humour peut créer une vraie accroche.</P>
          <P>Mais pour flirter sans mettre l'autre mal à l'aise, le contexte reste essentiel. Le ton, le consentement, la réceptivité et le langage corporel comptent autant que les mots employés.</P>
          <P><strong style={{ color: "#f0e8d8" }}>Camille Renard</strong>, 24 ans, explique être très attentive à la façon dont ses avances peuvent être perçues.</P>
          <Quote>Je suis consciente que des avances non désirées peuvent mettre quelqu'un mal à l'aise. Cela rend parfois la séduction un peu compliquée, surtout quand on n'est pas très extraverti. Mais le respect et la sécurité doivent toujours passer avant le reste.</Quote>
          <P>Pour la génération Z, le flirt est souvent rapide, créatif, parfois drôle, parfois très codé. Mais derrière les écrans, les emojis et les références virales, le besoin reste le même : sentir qu'un échange est sincère.</P>

          <Separator />

          <H2>Les conseils qui fonctionnent à toutes les générations</H2>

          <P>Au fond, les codes changent, mais certaines choses restent les mêmes.</P>
          <P>Que l'on flirte à un bal, dans un bar, par message, sur Instagram ou avec un vocal envoyé en tremblant un peu, ce qui touche vraiment l'autre personne reste souvent très simple : l'attention, l'humour, la sincérité et l'écoute.</P>
          <P>Flirter, ce n'est pas forcément sortir une phrase parfaite. C'est parfois poser une vraie question. Se souvenir d'un détail. Faire rire sans forcer. Oser dire quelque chose, même maladroitement. Et surtout, sentir si l'autre personne est réceptive.</P>
          <P>Le meilleur conseil, toutes générations confondues, pourrait donc être celui-ci : ne cherchez pas à jouer un rôle. Cherchez plutôt à créer un vrai moment.</P>

          <Separator />

          <H2>La voix, un fil qui traverse toutes les générations</H2>

          <P>Et parmi tous les moyens de créer ce moment, il y en a un qui traverse les âges : la voix.</P>
          <P>Un message écrit peut être relu. Une photo peut être regardée. Mais une voix, elle, se ressent. On y entend l'hésitation, le sourire, la gêne, la tendresse, parfois même le petit silence avant d'oser dire quelque chose d'important.</P>
          <P>C'est souvent dans ces audios spontanés que se cachent les souvenirs les plus forts : un premier "je t'aime", une invitation maladroite, un fou rire, une déclaration à moitié assumée, ou simplement une voix qu'on aime entendre encore et encore.</P>

          <div style={{ padding: "28px 30px", borderRadius: 18, background: `${accent}0d`, border: `1px solid ${accent}35`, margin: "36px 0" }}>
            <p className="ekko-serif" style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: accent, marginBottom: 14 }}>
              ✦ EKKO
            </p>
            <p className="ekko-serif" style={{ fontSize: 16, color: "rgba(240,232,216,0.88)", lineHeight: 1.75, marginBottom: 14 }}>
              Aujourd'hui, une application permet justement de conserver ces instants autrement. Avec{" "}
              <a href="https://vosekko.com" target="_blank" rel="noopener noreferrer" style={{ color: accent, textDecoration: "underline", textUnderlineOffset: 3 }}>
                Ekko
              </a>
              , il est possible de transformer des messages vocaux en véritables capsules audio à garder, réécouter ou offrir.
            </p>
            <p className="ekko-serif" style={{ fontSize: 16, color: "rgba(240,232,216,0.88)", lineHeight: 1.75, marginBottom: 14 }}>
              L'idée est simple : sélectionner les audios qui comptent vraiment, ceux qui racontent une histoire, une rencontre, une relation ou un moment fort, puis les réunir dans une capsule à part. Pas au milieu de centaines de messages oubliés dans une conversation, mais dans un souvenir vivant, facile à retrouver.
            </p>
            <p className="ekko-serif" style={{ fontSize: 16, color: "rgba(240,232,216,0.88)", lineHeight: 1.75 }}>
              Parce que la voix a quelque chose de particulier. Elle garde l'émotion brute. Elle transporte les silences, les rires, les hésitations, les accents, les respirations. Elle ne montre pas seulement ce qui a été dit, elle fait ressentir comment cela a été dit.
            </p>
          </div>

          <P>Et finalement, peu importe la génération : ce qui touche le plus, ce n'est pas toujours la phrase parfaite. C'est parfois la voix qui tremble un peu avant de dire "je t'aime".</P>

        </motion.div>
      </div>
    </div>
  );
}
