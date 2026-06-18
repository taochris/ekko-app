"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BlobBackground from "../components/BlobBackground";

const gold = "#c9a96e";
const cream = "#f0e8d8";
const coral = "#ff8a5c";
const font = "Georgia, serif";

// ── Types ─────────────────────────────────────────────────────────────────────
type CategoryId = "couple" | "parent-enfant" | "enfant-parent" | "ami" | "famille" | "occasion";

interface SubCategory {
  title: string;
  examples: string[];
}

interface BlockData {
  intro?: string;
  examples: string[];
  subCategories?: SubCategory[];
  starterPhrases?: string[];
}

interface CategoryData {
  label: string;
  emoji: string;
  description: string;
  bloc1: BlockData;
  bloc2: BlockData;
  bloc3: BlockData;
  bloc4: BlockData;
  bloc5: BlockData;
  bloc6: BlockData;
}

// ── Shared content ────────────────────────────────────────────────────────────
const GENERIC_STARTERS_BLOC4 = [
  "Juste avant ce message…",
  "Ce jour-là…",
  "À ce moment-là, nous ne savions pas encore que…",
  "Quelques minutes après cet audio…",
  "Ce que l'on n'entend pas dans ce message…",
  "Pour comprendre cet audio, il faut savoir que…",
];

const GENERIC_STARTERS_BLOC5 = [
  "Je ne te l'ai jamais vraiment dit, mais…",
  "Ce que tu ne savais pas…",
  "En réalité, j'avais peur que…",
  "J'espérais secrètement que…",
  "Aujourd'hui, je comprends que…",
  "Avec le recul…",
  "Si je pouvais revivre ce moment…",
  "Ce que j'aurais aimé te répondre…",
];

const GENERIC_BLOC6_EXAMPLES = [
  "Cette Vocapsule ne contient qu'une petite partie de notre histoire, mais elle contient quelques-uns des moments que je préfère.",
  "J'espère que tu réécouteras ces voix chaque fois que tu auras envie de retrouver un peu de nous.",
  "Les messages s'arrêtent ici, mais notre histoire continue.",
  "Je ne te dis peut-être pas assez souvent ce que tu représentes pour moi. Alors j'ai voulu te le laisser ici.",
];

const GENERIC_BLOC2_SUBCATS: SubCategory[] = [
  {
    title: "Ce que je ressentais",
    examples: [
      "Ce que tu vas entendre m'a complètement bouleversé à l'époque.",
      "J'avais l'air sûr de moi, mais en réalité, je tremblais en te parlant.",
      "Quand tu m'as répondu ça, j'étais terrifié par ce que tu allais décider.",
    ],
  },
  {
    title: "Ce que tu ne savais pas",
    examples: [
      "Ce que tu ne savais pas, c'est que j'avais réécouté ton message au moins dix fois.",
      "J'avais préparé ma réponse plusieurs fois avant de te l'envoyer.",
      "Je faisais semblant de plaisanter parce que je ne savais pas comment te parler sérieusement.",
    ],
  },
  {
    title: "Pourquoi j'ai choisi cet audio",
    examples: [
      "Cet audio est dans la Vocapsule parce qu'il représente exactement la personne que tu es.",
      "J'ai choisi ce message parce qu'il résume parfaitement notre manière de nous parler.",
      "Ce message paraît banal, mais pour moi il ne l'a jamais été.",
    ],
  },
  {
    title: "Ce qui s'était passé autour",
    examples: [
      "Juste avant ce message, nous venions de nous disputer pour une raison complètement ridicule.",
      "Tu m'as envoyé cet audio après notre première vraie soirée ensemble.",
      "Ce jour-là, j'attendais ta réponse depuis le matin.",
    ],
  },
];

const GENERIC_BLOC3_SUBCATS: SubCategory[] = [
  {
    title: "Avec le recul",
    examples: [
      "Aujourd'hui, je comprends enfin ce que tu essayais de me dire.",
      "À l'époque, je n'avais pas compris toute l'importance de tes mots.",
      "Quand je réécoute ça aujourd'hui, je me rends compte à quel point nous avons changé.",
    ],
  },
  {
    title: "Ce que ce message représente aujourd'hui",
    examples: [
      "Ce message me rappelle une version de nous que je ne veux jamais oublier.",
      "Même des années plus tard, ton rire dans cet audio me fait toujours sourire.",
      "Je crois que ce moment dit beaucoup plus sur nous que nous ne le pensions.",
    ],
  },
  {
    title: "Ce que j'aurais aimé dire",
    examples: [
      "Je n'ai jamais osé te dire à quel point ces mots m'avaient rassuré.",
      "J'aurais aimé te répondre autrement ce jour-là.",
      "Ce message m'a beaucoup plus touché que je ne te l'ai montré.",
    ],
  },
];

// ── Category content data ─────────────────────────────────────────────────────
const DATA: Record<CategoryId, CategoryData> = {
  couple: {
    label: "Couple",
    emoji: "♡",
    description: "Messages échangés, premiers instants, histoire commune.",
    bloc1: {
      intro: "Racontez le début, les premiers échanges, les sentiments cachés derrière les mots.",
      examples: [
        "Dans certains de ces messages, je faisais semblant d'être détendu alors que j'attendais chacune de tes réponses.",
        "J'ai choisi ces audios parce qu'ils racontent comment nous sommes devenus nous.",
        "J'ai rassemblé ces messages parce qu'ils racontent une partie de notre histoire que je ne veux jamais oublier.",
        "Certains de ces messages te sembleront peut-être ordinaires. Pour moi, ils ne l'ont jamais été.",
        "Cette Vocapsule est une manière de te faire réécouter notre histoire, mais aussi de te raconter ce que je ressentais vraiment.",
      ],
    },
    bloc2: {
      examples: [
        "Dans cet audio, je fais comme si tout était normal, mais je savais déjà que je tombais amoureux de toi.",
        "J'avais enregistré trois versions avant de t'envoyer celle-ci.",
        "Quand tu m'as répondu ça, j'ai compris que quelque chose venait de changer entre nous.",
      ],
      subCategories: GENERIC_BLOC2_SUBCATS,
    },
    bloc3: {
      examples: [
        "Je n'ai jamais osé te dire à quel point j'avais peur de te perdre.",
        "Ce message m'avait touché bien plus que je ne te l'avais montré.",
        "Je crois que c'est à ce moment-là que j'ai commencé à te voir autrement.",
      ],
      subCategories: GENERIC_BLOC3_SUBCATS,
    },
    bloc4: {
      starterPhrases: GENERIC_STARTERS_BLOC4,
      examples: [
        "Juste avant ce message, nous venions de nous disputer pour une raison complètement ridicule.",
        "Tu m'as envoyé cet audio après notre première vraie soirée ensemble.",
        "Ce jour-là, j'attendais ta réponse depuis le matin.",
        "Pour comprendre cet audio, il faut savoir que je n'avais pas dormi de la nuit.",
      ],
    },
    bloc5: {
      starterPhrases: GENERIC_STARTERS_BLOC5,
      examples: [
        "Je ne te l'ai jamais vraiment dit, mais chacun de tes messages comptait infiniment plus que tu ne le pensais.",
        "En réalité, j'avais peur que tu ne ressentes pas la même chose.",
        "J'espérais secrètement que tu relèves quelque chose dans ma réponse.",
        "Avec le recul, je réalise que c'est à ce moment-là que tout a vraiment commencé.",
      ],
    },
    bloc6: {
      examples: [
        "Cette Vocapsule contient quelques morceaux de notre histoire, mais surtout tout ce que ces moments représentaient pour moi.",
        ...GENERIC_BLOC6_EXAMPLES,
      ],
    },
  },

  "parent-enfant": {
    label: "Parent offrant à un enfant",
    emoji: "✦",
    description: "Sa voix d'enfant, ses bêtises, son évolution, un message pour plus tard.",
    bloc1: {
      intro: "Conservez sa voix, racontez son évolution, révélez ce que les parents pensaient vraiment.",
      examples: [
        "J'ai gardé ces audios parce qu'ils racontent qui tu étais à un moment de ta vie que tu n'as peut-être plus en mémoire.",
        "Dans ces messages, on entend une version de toi que tu n'entendras nulle part ailleurs.",
        "J'ai rassemblé ces messages parce qu'ils racontent une partie de ton histoire que je ne veux jamais oublier.",
        "Certains de ces messages te sembleront peut-être ordinaires. Pour nous, ils ne l'ont jamais été.",
        "Cette Vocapsule est une manière de te faire réécouter ton histoire, mais aussi de te raconter ce que je ressentais vraiment.",
      ],
    },
    bloc2: {
      examples: [
        "Tu avais envoyé ce message après avoir juré que tu n'avais rien fait. Nous savions déjà que ce n'était pas vrai.",
        "Dans cet audio, tu essayais de négocier avec beaucoup de sérieux quelque chose de complètement impossible.",
        "J'ai conservé ce message parce qu'on y entend encore ta voix d'enfant.",
      ],
      subCategories: GENERIC_BLOC2_SUBCATS,
    },
    bloc3: {
      examples: [
        "À l'époque, cette histoire nous avait épuisés. Aujourd'hui, elle nous fait énormément rire.",
        "Tu ne pouvais pas le savoir, mais nous avions fait écouter cet audio à toute la famille.",
        "Ce message paraît banal, mais il raconte parfaitement la personne que tu étais à ce moment-là.",
      ],
      subCategories: GENERIC_BLOC3_SUBCATS,
    },
    bloc4: {
      starterPhrases: GENERIC_STARTERS_BLOC4,
      examples: [
        "Juste avant ce message, nous venions de passer une longue journée ensemble.",
        "Ce jour-là, tu étais convaincu d'avoir raison. Tu n'avais pas tout à fait tort.",
        "Pour comprendre cet audio, il faut savoir que toute la famille l'a écouté au moins trois fois.",
        "À ce moment-là, nous ne savions pas encore que cet échange deviendrait l'une de nos anecdotes préférées.",
      ],
    },
    bloc5: {
      starterPhrases: GENERIC_STARTERS_BLOC5,
      examples: [
        "Je ne te l'ai jamais vraiment dit, mais cet audio a beaucoup compté pour moi.",
        "Ce que tu ne savais pas, c'est que ta voix d'enfant nous manquera toujours un peu.",
        "Avec le recul, je réalise que ces moments ordinaires étaient souvent les plus précieux.",
        "J'espère qu'en réécoutant ça, tu te souviendras de la personne que tu étais.",
      ],
    },
    bloc6: {
      examples: [
        "Ta voix a changé depuis, mais ces petits morceaux de ton enfance sont restés ici.",
        ...GENERIC_BLOC6_EXAMPLES,
      ],
    },
  },

  "enfant-parent": {
    label: "Enfant offrant à un parent",
    emoji: "◇",
    description: "Remercier, raconter les bêtises, rappeler les moments de confiance.",
    bloc1: {
      intro: "Rappeler les messages de l'enfance ou l'adolescence, remercier, raconter ce qu'on cachait.",
      examples: [
        "En réécoutant nos anciens messages, je me suis rendu compte du nombre de fois où je t'appelais pour des choses qui semblaient catastrophiques uniquement pour moi.",
        "J'ai choisi ces audios parce qu'ils racontent toutes les fois où je savais que je pouvais compter sur toi.",
        "Certains de ces messages te sembleront peut-être ordinaires. Pour moi, ils ne l'ont jamais été.",
        "Cette Vocapsule est une manière de te faire réécouter notre histoire, mais aussi de te raconter ce que je ressentais vraiment.",
        "J'ai rassemblé ces messages parce qu'ils racontent une partie de notre histoire que je ne veux jamais oublier.",
      ],
    },
    bloc2: {
      examples: [
        "Quand je t'ai envoyé ce message, je venais en réalité de faire une énorme bêtise.",
        "Tu vas entendre que j'avais pris ma voix la plus innocente. Ce n'était clairement pas un hasard.",
        "Dans cet audio, je te demande simplement où tu es. En réalité, j'avais surtout besoin de savoir combien de temps il me restait pour tout ranger.",
      ],
      subCategories: GENERIC_BLOC2_SUBCATS,
    },
    bloc3: {
      examples: [
        "Je faisais souvent semblant de ne pas avoir besoin de toi, mais ta voix me rassurait toujours.",
        "À l'époque, je ne te remerciais pas assez.",
        "Aujourd'hui, je comprends mieux certaines de tes réponses.",
      ],
      subCategories: GENERIC_BLOC3_SUBCATS,
    },
    bloc4: {
      starterPhrases: GENERIC_STARTERS_BLOC4,
      examples: [
        "Juste avant ce message, j'avais essayé de régler la situation seul. Ça n'avait pas fonctionné.",
        "Ce jour-là, j'avais besoin de t'entendre même si je ne te l'aurais jamais dit.",
        "Pour comprendre cet audio, il faut savoir que j'étais loin de te dire toute la vérité.",
        "Quelques minutes après cet audio, tu avais déjà tout compris.",
      ],
    },
    bloc5: {
      starterPhrases: GENERIC_STARTERS_BLOC5,
      examples: [
        "Je ne te l'ai jamais vraiment dit, mais chacun de tes messages comptait bien plus que je ne te le laissais paraître.",
        "Ce que tu ne savais pas, c'est que ta voix suffisait souvent à me rassurer.",
        "Avec le recul, je réalise à quel point tu as été présent sans jamais me le faire sentir comme une obligation.",
        "J'aurais aimé te remercier davantage à l'époque.",
      ],
    },
    bloc6: {
      examples: [
        "Tous ces messages me rappellent que, même pour les petites choses, tu as toujours été là.",
        ...GENERIC_BLOC6_EXAMPLES,
      ],
    },
  },

  ami: {
    label: "Ami",
    emoji: "✧",
    description: "Blagues privées, soutien discret, souvenirs que personne d'autre ne comprendrait.",
    bloc1: {
      intro: "Raconter la première rencontre, les blagues internes, les messages les plus absurdes.",
      examples: [
        "Ces messages résument assez bien notre amitié : beaucoup d'absurde et, parfois, quelque chose de sincère au milieu.",
        "J'ai choisi ces audios parce qu'ils racontent les fois où tu étais là, souvent sans que je te le demande.",
        "J'ai rassemblé ces messages parce qu'ils racontent une partie de notre histoire que je ne veux jamais oublier.",
        "Certains de ces messages te sembleront peut-être ordinaires. Pour moi, ils ne l'ont jamais été.",
        "Cette Vocapsule est une manière de te faire réécouter notre histoire, mais aussi de te raconter ce que je ressentais vraiment.",
      ],
    },
    bloc2: {
      examples: [
        "Pour comprendre cet audio, il faut savoir que nous étions perdus depuis presque deux heures.",
        "Dans ce message, nous affirmons que tout est sous contrôle. Absolument rien n'était sous contrôle.",
        "Cette blague n'a probablement aucun sens pour les autres, mais elle nous fait rire depuis des années.",
      ],
      subCategories: GENERIC_BLOC2_SUBCATS,
    },
    bloc3: {
      examples: [
        "Je plaisantais dans ma réponse, mais ton message était arrivé exactement au moment où j'en avais besoin.",
        "Je ne t'ai jamais vraiment remercié d'avoir été là ce jour-là.",
        "Cet audio résume parfaitement notre amitié : beaucoup de bruit, très peu de sérieux et toujours beaucoup de soutien.",
      ],
      subCategories: GENERIC_BLOC3_SUBCATS,
    },
    bloc4: {
      starterPhrases: GENERIC_STARTERS_BLOC4,
      examples: [
        "Pour comprendre cet audio, il faut savoir que la situation était bien plus chaotique qu'elle n'en avait l'air.",
        "Ce jour-là, nous étions convaincus d'avoir une bonne idée. Nous avions tort.",
        "Juste avant ce message, nous venions de passer deux heures à débattre de quelque chose de complètement secondaire.",
        "À ce moment-là, nous ne savions pas encore que cette histoire allait devenir l'une de nos blagues préférées.",
      ],
    },
    bloc5: {
      starterPhrases: GENERIC_STARTERS_BLOC5,
      examples: [
        "Je ne te l'ai jamais vraiment dit, mais ton message était arrivé exactement au bon moment.",
        "Ce que tu ne savais pas, c'est que j'avais relu notre conversation plusieurs fois ce soir-là.",
        "Avec le recul, je réalise que tu as souvent été là sans jamais en faire toute une histoire.",
        "J'aurais aimé te dire à quel point certains de ces moments comptaient vraiment pour moi.",
      ],
    },
    bloc6: {
      examples: [
        "Nous oublierons peut-être certains détails, mais certainement pas les rires.",
        ...GENERIC_BLOC6_EXAMPLES,
      ],
    },
  },

  famille: {
    label: "Famille",
    emoji: "◈",
    description: "Traditions, voix de tous les membres, disputes devenues drôles, messages de groupe.",
    bloc1: {
      intro: "Raconter les traditions, présenter les voix, expliquer les disputes devenues drôles.",
      examples: [
        "Ces audios racontent les fois où nous étions tous là, parfois en désaccord, toujours ensemble.",
        "J'ai choisi ces messages parce qu'ils capturent quelque chose que les photos ne montrent jamais : nos voix.",
        "J'ai rassemblé ces messages parce qu'ils racontent une partie de notre histoire que je ne veux jamais oublier.",
        "Certains de ces messages vous sembleront peut-être ordinaires. Pour moi, ils ne l'ont jamais été.",
        "Cette Vocapsule est une manière de faire réécouter notre histoire, mais aussi de raconter ce que ces moments représentaient vraiment.",
      ],
    },
    bloc2: {
      examples: [
        "Avant d'écouter cet audio, il faut savoir que toute la famille parlait en même temps autour du téléphone.",
        "Ce jour-là, nous essayions d'organiser quelque chose de simple. Comme toujours, cela a pris des proportions absurdes.",
        "J'ai gardé ce message parce qu'on y entend toutes les petites expressions propres à notre famille.",
      ],
      subCategories: GENERIC_BLOC2_SUBCATS,
    },
    bloc3: {
      examples: [
        "Derrière cette conversation ordinaire, il y a l'un de mes souvenirs préférés de nous tous réunis.",
        "Aujourd'hui, je comprends que ces moments simples étaient souvent les plus précieux.",
        "Cette phrase a été répétée des dizaines de fois dans notre famille, mais elle me fait toujours le même effet.",
      ],
      subCategories: GENERIC_BLOC3_SUBCATS,
    },
    bloc4: {
      starterPhrases: GENERIC_STARTERS_BLOC4,
      examples: [
        "Pour comprendre cet audio, il faut savoir que tout le monde avait un avis différent.",
        "Ce jour-là, nous essayions tous de parler en même temps. Comme toujours.",
        "Juste avant ce message, il y avait eu un silence que personne ne savait très bien comment rompre.",
        "À ce moment-là, nous ne savions pas encore que cet échange deviendrait l'une de nos anecdotes préférées.",
      ],
    },
    bloc5: {
      starterPhrases: GENERIC_STARTERS_BLOC5,
      examples: [
        "Je ne vous l'ai jamais vraiment dit, mais ces moments en famille comptent bien plus que je ne le montre.",
        "Ce que vous ne saviez pas, c'est que ces conversations ordinaires me manquent parfois énormément.",
        "Avec le recul, je réalise que les moments les plus simples étaient souvent les plus précieux.",
        "J'aurais aimé profiter davantage de ces instants à l'époque.",
      ],
    },
    bloc6: {
      examples: [
        "Nos voix racontent notre histoire mieux que n'importe quel album.",
        ...GENERIC_BLOC6_EXAMPLES,
      ],
    },
  },

  occasion: {
    label: "Occasion particulière",
    emoji: "◉",
    description: "Anniversaire, mariage, naissance, départ, retraite, réussite, retrouvailles.",
    bloc1: {
      intro: "Introduire la Vocapsule en lien avec le moment particulier que vous souhaitez marquer.",
      examples: [
        "J'ai choisi ces messages parce qu'ils racontent plusieurs versions de toi au fil des années.",
        "Cette Vocapsule est une manière de marquer ce moment avec quelque chose qui durera.",
        "J'ai rassemblé ces messages parce qu'ils racontent une partie de notre histoire que je ne veux jamais oublier.",
        "Certains de ces messages te sembleront peut-être ordinaires. Pour moi, ils ne l'ont jamais été.",
      ],
    },
    bloc2: {
      examples: [
        "Avant d'écouter cet audio, il faut savoir que c'est la première fois que tu m'avais parlé de cette personne.",
        "Ce message semblait banal à l'époque, mais il prend aujourd'hui une tout autre valeur.",
        "J'ai gardé cet audio parce qu'il résume parfaitement ce que nous traversions à ce moment-là.",
      ],
      subCategories: GENERIC_BLOC2_SUBCATS,
    },
    bloc3: {
      examples: [
        "Aujourd'hui, je comprends mieux ce que ce message représentait vraiment.",
        "En réécoutant ça, je me rends compte à quel point les choses ont changé depuis.",
        "Ce message me rappelle exactement qui nous étions à ce moment précis.",
      ],
      subCategories: GENERIC_BLOC3_SUBCATS,
    },
    bloc4: {
      starterPhrases: GENERIC_STARTERS_BLOC4,
      examples: [
        "Pour comprendre cet audio, il faut replacer le contexte de cette période.",
        "Juste avant ce message, quelque chose d'important venait de se passer.",
        "Ce jour-là marquait le début de quelque chose que nous ne mesurions pas encore.",
        "À ce moment-là, nous ne savions pas encore que ce serait un souvenir aussi fort.",
      ],
    },
    bloc5: {
      starterPhrases: GENERIC_STARTERS_BLOC5,
      examples: [
        "Je ne te l'ai jamais vraiment dit, mais ce moment a compté bien plus que je ne te l'ai montré.",
        "Ce que tu ne savais pas, c'est que j'avais beaucoup réfléchi avant de trouver les bons mots.",
        "Avec le recul, je réalise l'importance de ce que nous vivions à ce moment-là.",
        "J'aurais aimé pouvoir te dire tout ça à l'époque.",
      ],
    },
    bloc6: {
      examples: [
        "Cette Vocapsule marque ce moment d'une manière que les mots seuls ne pourraient pas.",
        ...GENERIC_BLOC6_EXAMPLES,
      ],
    },
  },
};

const CATEGORIES: { id: CategoryId; label: string; emoji: string; description: string }[] = [
  { id: "couple", label: "Couple", emoji: "♡", description: "Messages échangés, premiers instants, histoire commune." },
  { id: "parent-enfant", label: "Parent offrant à un enfant", emoji: "✦", description: "Sa voix d'enfant, ses bêtises, son évolution." },
  { id: "enfant-parent", label: "Enfant offrant à un parent", emoji: "◇", description: "Remercier, raconter, se souvenir ensemble." },
  { id: "ami", label: "Ami", emoji: "✧", description: "Blagues privées, soutien discret, souvenirs partagés." },
  { id: "famille", label: "Famille", emoji: "◈", description: "Traditions, voix de tous, moments réunis." },
  { id: "occasion", label: "Occasion particulière", emoji: "◉", description: "Anniversaire, mariage, départ, réussite…" },
];

// ── Vivid colors + icons (inspirés de "comment ça marche") ──────────────────────
const CAT_COLORS: Record<CategoryId, string> = {
  couple: "#ff6b9d",
  "parent-enfant": "#5b9dff",
  "enfant-parent": "#b07cff",
  ami: "#34d8c0",
  famille: "#ff9f5a",
  occasion: "#ffce4d",
};

function CategoryIcon({ id, size = 22, color }: { id: CategoryId; size?: number; color: string }) {
  const p = { width: size, height: size, fill: "none", viewBox: "0 0 24 24" } as const;
  const sw = 1.6;
  switch (id) {
    case "couple":
      return (<svg {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={color} strokeWidth={sw} strokeLinejoin="round" /></svg>);
    case "parent-enfant":
      return (<svg {...p}><path d="M12 2.5l2.4 6.3 6.6.3-5.2 4 1.9 6.4L12 18.9l-5.6 3.6L8.2 16 3 12l6.6-.3L12 2.5z" stroke={color} strokeWidth={sw} strokeLinejoin="round" /></svg>);
    case "enfant-parent":
      return (<svg {...p}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke={color} strokeWidth={sw} strokeLinejoin="round" /></svg>);
    case "ami":
      return (<svg {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={color} strokeWidth={sw} strokeLinecap="round" /><circle cx="9" cy="7" r="4" stroke={color} strokeWidth={sw} /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={color} strokeWidth={sw} strokeLinecap="round" /></svg>);
    case "famille":
      return (<svg {...p}><path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" stroke={color} strokeWidth={sw} strokeLinejoin="round" /><path d="M9 21v-6h6v6" stroke={color} strokeWidth={sw} strokeLinejoin="round" /></svg>);
    case "occasion":
      return (<svg {...p}><rect x="3" y="8" width="18" height="4" rx="1" stroke={color} strokeWidth={sw} /><path d="M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8M12 8v13" stroke={color} strokeWidth={sw} strokeLinejoin="round" /><path d="M12 8S10.7 3.5 8 4.7 9.5 8 12 8zm0 0s1.3-4.5 4-3.3S14.5 8 12 8z" stroke={color} strokeWidth={sw} strokeLinejoin="round" /></svg>);
    default:
      return null;
  }
}

const BLOC_COLORS = ["#ff8a5c", "#5b9dff", "#ff6b9d", "#34d8c0", "#b07cff", "#ffce4d"];

function BlocIcon({ index, color, size = 18 }: { index: number; color: string; size?: number }) {
  const p = { width: size, height: size, fill: "none", viewBox: "0 0 24 24" } as const;
  const sw = 1.7;
  switch (index) {
    case 0: // Introduire — drapeau de départ
      return (<svg {...p}><path d="M5 21V4M5 4h11l-2 4 2 4H5" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></svg>);
    case 1: // Présenter un ancien message — bulle vocale
      return (<svg {...p}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke={color} strokeWidth={sw} strokeLinejoin="round" /></svg>);
    case 2: // Confidence après — coeur
      return (<svg {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={color} strokeWidth={sw} strokeLinejoin="round" /></svg>);
    case 3: // Contexte — couches
      return (<svg {...p}><path d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></svg>);
    case 4: // Confidence personnelle — clé
      return (<svg {...p}><circle cx="8" cy="8" r="5" stroke={color} strokeWidth={sw} /><path d="m11.5 11.5 9 9M16 16l2-2M19 19l2-2" stroke={color} strokeWidth={sw} strokeLinecap="round" /></svg>);
    default: // Terminer — coche dans un cercle
      return (<svg {...p}><circle cx="12" cy="12" r="9" stroke={color} strokeWidth={sw} /><path d="m8.5 12 2.5 2.5 4.5-5" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></svg>);
  }
}

const OCCASIONS = [
  "Anniversaire", "Mariage", "Naissance", "Départ", "Retraite", "Réussite", "Retrouvailles",
];

const NO_IDEA_BLOCKS = [
  {
    title: "Parler de ce que je ressentais",
    phrases: [
      "J'avais l'air calme, mais…",
      "À ce moment-là, j'espérais…",
      "Ce message m'avait…",
      "Je n'osais pas te dire…",
    ],
  },
  {
    title: "Raconter ce que l'autre ignorait",
    phrases: [
      "Ce que tu ne savais pas…",
      "J'avais recommencé cet audio…",
      "Après ton message, j'ai…",
      "J'attendais ta réponse depuis…",
    ],
  },
  {
    title: "Expliquer pourquoi j'ai choisi l'audio",
    phrases: [
      "Cet audio est ici parce que…",
      "J'ai gardé ce message parce que…",
      "Ce moment représente…",
      "Lorsque je l'écoute aujourd'hui…",
    ],
  },
  {
    title: "Commenter avec le recul",
    phrases: [
      "Aujourd'hui, je comprends…",
      "Avec le recul…",
      "Je ne savais pas encore que…",
      "Si je pouvais revivre ce moment…",
    ],
  },
  {
    title: "Dire ce que je n'ai jamais dit",
    phrases: [
      "Je ne te l'ai jamais vraiment dit, mais…",
      "J'aurais aimé te répondre…",
      "Ce que ce message avait provoqué chez moi…",
      "La vérité, c'est que…",
    ],
  },
];

const CONSTRUCTION_EXAMPLES = [
  {
    title: "Une Vocapsule simple",
    steps: [
      "Introduction personnelle",
      "Présentation du premier message",
      "Ancien audio",
      "Petite confidence",
      "Deuxième ancien audio",
      "Conclusion",
    ],
  },
  {
    title: "Une histoire racontée",
    steps: [
      "Comment tout a commencé",
      "Premier ancien message",
      "Ce que je ressentais",
      "Message suivant",
      "Ce que l'autre ne savait pas",
      "Ce que je comprends aujourd'hui",
      "Conclusion",
    ],
  },
  {
    title: "Une Vocapsule légère et drôle",
    steps: [
      "Introduction",
      "Contexte de la première anecdote",
      "Ancien audio",
      "Commentaire avec le recul",
      "Deuxième anecdote",
      "Ancien audio",
      "Conclusion affectueuse",
    ],
  },
  {
    title: "Une Vocapsule très personnelle",
    steps: [
      "Pourquoi j'ai créé cette Vocapsule",
      "Un ancien message important",
      "Une confidence jamais dite",
      "Un deuxième message",
      "Ce que ce moment a changé",
      "Un message pour aujourd'hui",
      "Conclusion",
    ],
  },
];

// ── UI Components ─────────────────────────────────────────────────────────────
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      style={{ width: 14, height: 14, transition: "transform 0.3s", transform: open ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function ExampleCard({ text }: { text: string }) {
  return (
    <div style={{
      padding: "13px 16px",
      borderLeft: `2px solid ${gold}50`,
      background: `${gold}07`,
      borderRadius: "0 8px 8px 0",
      marginBottom: 8,
    }}>
      <p className="ekko-serif" style={{ fontSize: 15, color: `${cream}cc`, lineHeight: 1.65, margin: 0, fontStyle: "italic" }}>
        « {text} »
      </p>
    </div>
  );
}

function StarterGrid({ phrases }: { phrases: string[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16, marginTop: 4 }}>
      {phrases.map((p) => (
        <span
          key={p}
          className="ekko-serif"
          style={{
            display: "inline-block", padding: "6px 13px", borderRadius: 20,
            border: `1px solid ${gold}28`, background: `${gold}09`,
            fontSize: 15, color: `${gold}cc`,
          }}
        >
          {p}
        </span>
      ))}
    </div>
  );
}

function SubAccordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 6 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "9px 13px", borderRadius: 8,
          background: open ? `${gold}0e` : "rgba(255,255,255,0.025)",
          border: `1px solid ${open ? gold + "28" : "rgba(255,255,255,0.06)"}`,
          cursor: "pointer", color: open ? gold : "rgba(240,232,216,0.75)",
          textAlign: "left", gap: 8, transition: "all 0.2s",
        }}
      >
        <span className="ekko-serif" style={{ fontSize: 14, letterSpacing: "0.06em" }}>{title}</span>
        <Chevron open={open} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="sub"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ paddingTop: 8, paddingLeft: 2 }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BlockAccordion({
  number, title, description, children, accent, index,
}: {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
  accent: string;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderRadius: 14,
      border: `1px solid ${open ? accent + "55" : "rgba(255,255,255,0.07)"}`,
      overflow: "hidden",
      background: open ? `${accent}0d` : "rgba(255,255,255,0.015)",
      marginBottom: 10,
      transition: "border-color 0.3s, background 0.3s",
      boxShadow: open ? `0 0 22px ${accent}12` : "none",
    }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          padding: "17px 20px", background: "none", border: "none",
          cursor: "pointer", color: open ? cream : "rgba(240,232,216,0.8)",
          textAlign: "left", gap: 14,
        }}
      >
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flex: 1 }}>
          <span style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: `${accent}1a`, border: `1px solid ${accent}3a`,
          }}>
            <BlocIcon index={index} color={accent} />
          </span>
          <div>
            <span className="ekko-serif" style={{
              display: "block", fontSize: 10, letterSpacing: "0.35em", textTransform: "uppercase",
              color: accent, marginBottom: 3, fontWeight: 600,
            }}>
              {number}
            </span>
            <p className="ekko-serif" style={{ fontSize: 16, fontWeight: 400, margin: 0, marginBottom: 2, lineHeight: 1.3 }}>
              {title}
            </p>
            <p className="ekko-serif" style={{ fontSize: 12, color: "rgba(240,232,216,0.4)", margin: 0, fontStyle: "italic" }}>
              {description}
            </p>
          </div>
        </div>
        <div style={{ paddingTop: 4, color: open ? accent : "rgba(240,232,216,0.45)" }}>
          <Chevron open={open} />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="bloc"
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

function SimpleAccordion({ title, children, defaultOpen = false }: {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      borderRadius: 12, border: `1px solid rgba(201,169,110,${open ? "0.18" : "0.08"})`,
      overflow: "hidden", background: "rgba(255,255,255,0.02)", marginBottom: 10,
      transition: "border-color 0.2s",
    }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 18px", background: "none", border: "none",
          cursor: "pointer", color: open ? gold : "rgba(240,232,216,0.75)", textAlign: "left", gap: 12,
        }}
      >
        <span className="ekko-serif" style={{ fontSize: 15, fontWeight: 400 }}>{title}</span>
        <Chevron open={open} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="simple"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 18px 18px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Block content renderer ────────────────────────────────────────────────────
function BlockContent({ data }: { data: BlockData }) {
  return (
    <div style={{ paddingTop: 16 }}>
      {data.intro && (
        <p className="ekko-serif" style={{ fontSize: 14, color: `${gold}99`, fontStyle: "italic", marginBottom: 14 }}>
          {data.intro}
        </p>
      )}
      {data.starterPhrases && (
        <>
          <p className="ekko-serif" style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,232,216,0.4)", marginBottom: 10 }}>
            Débuts de phrases
          </p>
          <StarterGrid phrases={data.starterPhrases} />
        </>
      )}
      {data.examples.length > 0 && (
        <>
          <p className="ekko-serif" style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,232,216,0.4)", marginBottom: 10 }}>
            Exemples
          </p>
          {data.examples.map((ex, i) => <ExampleCard key={i} text={ex} />)}
        </>
      )}
      {data.subCategories && data.subCategories.length > 0 && (
        <>
          <p className="ekko-serif" style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,232,216,0.4)", marginTop: 18, marginBottom: 10 }}>
            Affiner par thème
          </p>
          {data.subCategories.map((sub) => (
            <SubAccordion key={sub.title} title={sub.title}>
              {sub.examples.map((ex, i) => <ExampleCard key={i} text={ex} />)}
            </SubAccordion>
          ))}
        </>
      )}
    </div>
  );
}

// ── Category blocks view ──────────────────────────────────────────────────────
function CategoryBlocks({ categoryId }: { categoryId: CategoryId }) {
  const d = DATA[categoryId];
  return (
    <div>
      <BlockAccordion index={0} accent={BLOC_COLORS[0]} number="Bloc 01" title="Introduire toute la Vocapsule" description="Un message avant le premier audio — pourquoi vous avez créé cette Vocapsule.">
        <BlockContent data={d.bloc1} />
      </BlockAccordion>
      <BlockAccordion index={1} accent={BLOC_COLORS[1]} number="Bloc 02" title="Présenter un ancien message" description="Juste avant un audio précis — pourquoi ce message est important.">
        <BlockContent data={d.bloc2} />
      </BlockAccordion>
      <BlockAccordion index={2} accent={BLOC_COLORS[2]} number="Bloc 03" title="Ajouter une confidence après le message" description="Ce que vous ressentez aujourd'hui en réécoutant ce souvenir.">
        <BlockContent data={d.bloc3} />
      </BlockAccordion>
      <BlockAccordion index={3} accent={BLOC_COLORS[3]} number="Bloc 04" title="Raconter le contexte" description="Ce qui s'est passé avant ou après — ce que l'on n'entend pas dans l'audio.">
        <BlockContent data={d.bloc4} />
      </BlockAccordion>
      <BlockAccordion index={4} accent={BLOC_COLORS[4]} number="Bloc 05" title="Ajouter une confidence personnelle" description="Indépendamment d'un audio — ce que vous n'avez jamais osé dire.">
        <BlockContent data={d.bloc5} />
      </BlockAccordion>
      <BlockAccordion index={5} accent={BLOC_COLORS[5]} number="Bloc 06" title="Terminer la Vocapsule" description="Un message de conclusion après le dernier audio.">
        <BlockContent data={d.bloc6} />
      </BlockAccordion>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function InspirationsPage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);

  const handleSelectCategory = (id: CategoryId) => {
    setSelectedCategory(id);
    setSelectedOccasion(null);
  };

  const handleBack = () => {
    if (selectedOccasion) {
      setSelectedOccasion(null);
    } else {
      setSelectedCategory(null);
    }
  };

  const categoryData = selectedCategory ? DATA[selectedCategory] : null;

  return (
    <div style={{ position: "relative", minHeight: "100vh", width: "100%", overflowX: "hidden" }}>
      <BlobBackground variant="home" />

      {/* ── Nav ── */}
      <nav style={{
        position: "relative", zIndex: 500,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 28px", borderBottom: "1px solid rgba(201,169,110,0.08)",
      }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <img src="/g.png" alt="VOSEKKO" style={{ height: 52, width: "auto", objectFit: "contain", mixBlendMode: "screen" }} />
        </a>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          {[
            { label: "Comment ça marche", href: "/comment-ca-marche" },
            { label: "FAQ", href: "/faq" },
            { label: "Blog", href: "/blog" },
          ].map(({ label, href }) => (
            <a key={href} href={href} style={{ fontFamily: font, fontSize: 12, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(243,227,190,0.75)", textDecoration: "none" }} className="insp-nav-link">
              {label}
            </a>
          ))}
          <a href="/" style={{
            fontFamily: font, fontSize: 12, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase",
            padding: "8px 18px", borderRadius: 50, border: `1px solid ${gold}44`,
            color: `${gold}dd`, textDecoration: "none", transition: "all 0.2s",
          }}>
            Créer
          </a>
        </div>
      </nav>

      {/* ── Content ── */}
      <div style={{ position: "relative", zIndex: 10, maxWidth: 760, margin: "0 auto", padding: "56px 24px 120px" }}>

        {/* ── 1. Introduction fixe ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <p className="ekko-serif" style={{ fontSize: 11, letterSpacing: "0.5em", textTransform: "uppercase", color: `${gold}88`, marginBottom: 16, textAlign: "center" }}>
            Guide d'enregistrement
          </p>
          <h1 className="ekko-serif" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 300, color: cream, marginBottom: 8, textAlign: "center", lineHeight: 1.2 }}>
            Inspirations
          </h1>
          <p className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.45)", fontStyle: "italic", marginBottom: 48, textAlign: "center" }}>
            Votre voix donnera à ces messages une valeur sentimentale extraordinaire.
          </p>

          {/* Intro quote — single card */}
          <div style={{
            position: "relative",
            marginBottom: 48,
            padding: "34px 36px",
            borderRadius: 18,
            border: `1px solid ${coral}3a`,
            background: `linear-gradient(135deg, ${coral}1c, ${coral}08 50%, rgba(255,138,92,0.02))`,
            boxShadow: `0 0 44px ${coral}14, inset 0 1px 0 ${coral}26`,
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0, width: 4, height: "100%",
              background: `linear-gradient(to bottom, ${coral}, ${coral}66)`,
            }} />
            {[
              ["Avant de faire écouter un ancien message, ", "racontez ce qu'il représente", ", ce que vous ressentiez ou ce que l'autre personne ignorait à l'époque."],
              ["Votre Vocapsule ne sera plus seulement une suite d'audios. Elle deviendra ", "une histoire racontée avec votre voix", "."],
              ["Quelques secondes suffisent parfois pour donner ", "un tout autre sens", " à un message."],
            ].map((parts, i) => (
              <p
                key={i}
                className="ekko-serif"
                style={{
                  fontSize: 17,
                  color: `${cream}d8`,
                  lineHeight: 1.8,
                  margin: 0,
                  paddingTop: i === 0 ? 0 : 18,
                  marginTop: i === 0 ? 0 : 18,
                  borderTop: i === 0 ? "none" : `1px solid ${coral}1f`,
                  fontWeight: 400,
                }}
              >
                {parts[0]}
                <span style={{ color: coral, fontWeight: 600 }}>{parts[1]}</span>
                {parts[2]}
              </p>
            ))}
          </div>
        </motion.div>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${gold}25, transparent)`, marginBottom: 48 }} />

        {/* ── 2. Step indicator ── */}
        <AnimatePresence mode="wait">
          {!selectedCategory ? (
            /* ── STEP 1: Choose category ── */
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
            >
              <p className="ekko-serif" style={{ fontSize: 11, letterSpacing: "0.4em", textTransform: "uppercase", color: `${gold}78`, marginBottom: 8 }}>
                Étape 1
              </p>
              <h2 className="ekko-serif" style={{ fontSize: 23, fontWeight: 300, color: cream, marginBottom: 6, lineHeight: 1.3 }}>
                Pour qui créez-vous cette Vocapsule ?
              </h2>
              <p className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.45)", marginBottom: 28, fontStyle: "italic" }}>
                Choisissez une relation pour voir les inspirations adaptées.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }} className="cat-grid">
                {CATEGORIES.map((cat) => {
                  const c = CAT_COLORS[cat.id];
                  return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 14,
                      padding: "18px 20px", borderRadius: 14, textAlign: "left",
                      background: "rgba(255,255,255,0.025)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      cursor: "pointer", transition: "all 0.22s",
                      color: cream,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = `${c}12`;
                      (e.currentTarget as HTMLButtonElement).style.borderColor = `${c}55`;
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 20px ${c}14`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.025)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                    }}
                  >
                    <span style={{
                      width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: `${c}1c`, border: `1px solid ${c}3a`,
                    }}>
                      <CategoryIcon id={cat.id} color={c} />
                    </span>
                    <div>
                      <p className="ekko-serif" style={{ fontSize: 14, fontWeight: 600, color: c, margin: 0, marginBottom: 4 }}>
                        {cat.label}
                      </p>
                      <p className="ekko-serif" style={{ fontSize: 12, color: "rgba(240,232,216,0.45)", margin: 0, fontStyle: "italic", lineHeight: 1.5 }}>
                        {cat.description}
                      </p>
                    </div>
                  </button>
                  );
                })}
              </div>
            </motion.div>

          ) : (
            /* ── STEP 2 & 3: Blocks for selected category ── */
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
            >
              {/* Back + category header */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
                <button
                  onClick={handleBack}
                  className="ekko-serif"
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 14px", borderRadius: 50,
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(240,232,216,0.65)", cursor: "pointer", fontSize: 12,
                    fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase",
                    transition: "all 0.2s",
                  }}
                >
                  ← Retour
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {selectedCategory && (
                    <span style={{
                      width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: `${CAT_COLORS[selectedCategory]}1c`, border: `1px solid ${CAT_COLORS[selectedCategory]}3a`,
                    }}>
                      <CategoryIcon id={selectedCategory} size={18} color={CAT_COLORS[selectedCategory]} />
                    </span>
                  )}
                  <span className="ekko-serif" style={{ fontSize: 16, color: selectedCategory ? CAT_COLORS[selectedCategory] : cream, fontWeight: 600 }}>{categoryData?.label}</span>
                  {selectedOccasion && (
                    <>
                      <span style={{ color: "rgba(240,232,216,0.35)", fontSize: 14 }}>›</span>
                      <span className="ekko-serif" style={{ fontSize: 14, color: `${gold}dd` }}>{selectedOccasion}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Occasion sub-selector */}
              {selectedCategory === "occasion" && !selectedOccasion && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="ekko-serif" style={{ fontSize: 11, letterSpacing: "0.4em", textTransform: "uppercase", color: `${gold}78`, marginBottom: 8 }}>
                    Étape 2
                  </p>
                  <h2 className="ekko-serif" style={{ fontSize: 21, fontWeight: 300, color: cream, marginBottom: 6 }}>
                    Quelle est l'occasion ?
                  </h2>
                  <p className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.45)", marginBottom: 24, fontStyle: "italic" }}>
                    Vous verrez ensuite les inspirations adaptées à ce moment.
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 32 }}>
                    {OCCASIONS.map((occ) => (
                      <button
                        key={occ}
                        onClick={() => setSelectedOccasion(occ)}
                        className="ekko-serif"
                        style={{
                          padding: "9px 20px", borderRadius: 50, fontSize: 14,
                          background: "rgba(255,255,255,0.03)", border: `1px solid ${gold}25`,
                          color: "rgba(240,232,216,0.75)", cursor: "pointer", transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = `${gold}12`;
                          (e.currentTarget as HTMLButtonElement).style.color = gold;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.03)";
                          (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,232,216,0.75)";
                        }}
                      >
                        {occ}
                      </button>
                    ))}
                  </div>
                  {/* Show generic blocks for occasion even without sub-selection */}
                  <p className="ekko-serif" style={{ fontSize: 12, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(240,232,216,0.3)", marginBottom: 18 }}>
                    Ou explorez les blocs généraux
                  </p>
                  <CategoryBlocks categoryId={selectedCategory} />
                </motion.div>
              )}

              {/* Blocks — for any category that isn't occasion mid-flow */}
              {(selectedCategory !== "occasion" || selectedOccasion) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="ekko-serif" style={{ fontSize: 11, letterSpacing: "0.4em", textTransform: "uppercase", color: `${gold}78`, marginBottom: 8 }}>
                    Étape {selectedCategory === "occasion" ? "3" : "2"}
                  </p>
                  <h2 className="ekko-serif" style={{ fontSize: 21, fontWeight: 300, color: cream, marginBottom: 6, lineHeight: 1.35 }}>
                    Que voulez-vous enregistrer ?
                  </h2>
                  <p className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.45)", marginBottom: 28, fontStyle: "italic" }}>
                    Ouvrez le bloc qui correspond à votre besoin du moment.
                  </p>
                  <CategoryBlocks categoryId={selectedCategory} />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${gold}20, transparent)`, margin: "52px 0 48px" }} />

        {/* ── 5. Je ne sais pas quoi dire ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.6 }}>
          <p className="ekko-serif" style={{ fontSize: 11, letterSpacing: "0.4em", textTransform: "uppercase", color: `${gold}78`, marginBottom: 10 }}>
            Toujours disponible
          </p>
          <h2 className="ekko-serif" style={{ fontSize: 21, fontWeight: 300, color: cream, marginBottom: 6 }}>
            Je ne sais pas quoi dire
          </h2>
          <p className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.45)", fontStyle: "italic", marginBottom: 24 }}>
            Des débuts de phrases pour vous lancer, quelle que soit la relation choisie.
          </p>
          {NO_IDEA_BLOCKS.map((block) => (
            <SimpleAccordion key={block.title} title={block.title}>
              <div style={{ paddingTop: 14 }}>
                <StarterGrid phrases={block.phrases} />
              </div>
            </SimpleAccordion>
          ))}
        </motion.div>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${gold}20, transparent)`, margin: "52px 0 48px" }} />

        {/* ── 6. Exemples de construction ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.6 }}>
          <p className="ekko-serif" style={{ fontSize: 11, letterSpacing: "0.4em", textTransform: "uppercase", color: `${gold}78`, marginBottom: 10 }}>
            Parcours complets
          </p>
          <h2 className="ekko-serif" style={{ fontSize: 21, fontWeight: 300, color: cream, marginBottom: 6 }}>
            Exemples de construction
          </h2>
          <p className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.45)", fontStyle: "italic", marginBottom: 24 }}>
            Quelques structures pour organiser votre Vocapsule du début à la fin.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }} className="const-grid">
            {CONSTRUCTION_EXAMPLES.map((ex, idx) => {
              const c = BLOC_COLORS[idx % BLOC_COLORS.length];
              return (
              <div
                key={ex.title}
                style={{
                  padding: "20px", borderRadius: 14,
                  background: `${c}08`,
                  border: `1px solid ${c}2a`,
                  borderTop: `3px solid ${c}`,
                }}
              >
                <p className="ekko-serif" style={{ fontSize: 10, letterSpacing: "0.35em", textTransform: "uppercase", color: c, marginBottom: 8, fontWeight: 600 }}>
                  Exemple {idx + 1}
                </p>
                <p className="ekko-serif" style={{ fontSize: 14, fontWeight: 500, color: cream, marginBottom: 16 }}>
                  {ex.title}
                </p>
                <ol style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                  {ex.steps.map((step, i) => (
                    <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span className="ekko-serif" style={{
                        fontSize: 11, minWidth: 20, height: 20, borderRadius: "50%",
                        background: `${c}1f`, border: `1px solid ${c}66`, color: c,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, marginTop: 1, fontWeight: 600,
                      }}>
                        {i + 1}
                      </span>
                      <span className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.7)", lineHeight: 1.5 }}>
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── 8. Final text ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8 }}
          style={{ marginTop: 72, textAlign: "center", padding: "48px 24px", borderRadius: 20, background: `${gold}06`, border: `1px solid ${gold}15` }}
        >
          <p className="ekko-serif" style={{ fontSize: 16, color: "rgba(240,232,216,0.65)", lineHeight: 1.9, marginBottom: 10 }}>
            Vos anciens messages font entendre ce qui s'est passé.
          </p>
          <p className="ekko-serif" style={{ fontSize: 16, color: "rgba(240,232,216,0.65)", lineHeight: 1.9, marginBottom: 24 }}>
            Votre voix raconte ce que cela représentait vraiment.
          </p>
          <p className="ekko-serif" style={{ fontSize: 17, color: cream, fontWeight: 500, lineHeight: 1.6, marginBottom: 32 }}>
            Enregistrez-vous.<br />
            <em style={{ fontStyle: "italic", color: gold }}>C'est votre histoire qui donnera à la Vocapsule toute sa valeur.</em>
          </p>
          <a
            href="/"
            style={{
              display: "inline-block", padding: "14px 40px", borderRadius: 50,
              background: `linear-gradient(135deg, ${gold}55, ${gold}99)`,
              border: `1px solid ${gold}66`, fontFamily: font, fontSize: 14, fontWeight: 500,
              color: cream, textDecoration: "none", letterSpacing: "0.08em",
              transition: "all 0.2s",
            }}
          >
            Créer ma Vocapsule
          </a>
        </motion.div>
      </div>

      {/* Footer */}
      <footer style={{ position: "relative", zIndex: 10, borderTop: "1px solid rgba(201,169,110,0.08)", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <img src="/g.png" alt="VOSEKKO" style={{ height: 32, width: "auto", objectFit: "contain", mixBlendMode: "screen" }} />
        <p className="ekko-serif" style={{ fontSize: 12, color: "rgba(240,232,216,0.32)" }}>© 2025 VOSEKKO. Tous droits réservés.</p>
      </footer>

      <style>{`
        @media (max-width: 640px) {
          .cat-grid { grid-template-columns: 1fr !important; }
          .const-grid { grid-template-columns: 1fr !important; }
          .insp-nav-link { display: none !important; }
        }
      `}</style>
    </div>
  );
}
