"use client";

import { useEffect, useState } from "react";

const TAGS = [
  { label: "Anniversaire maman", time: "00:12", color: "#d4a857", pos: 8 },
  { label: "Je t'aime", time: "01:45", color: "#57c88a", pos: 34 },
  { label: "Vacances", time: "03:20", color: "#5ea6e8", pos: 61 },
  { label: "Fou rire", time: "05:02", color: "#e4766c", pos: 84 },
];

const WORDS = ["Anniversaire maman", "Je t'aime", "Vacances"];

const cardStyle = (accent: string): React.CSSProperties => ({
  padding: "32px 24px",
  borderRadius: 20,
  background: "#120d0e",
  border: `1px solid ${accent}45`,
  boxShadow: "0 14px 36px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)",
  display: "flex",
  flexDirection: "column",
  gap: 24,
});

const kicker = (accent: string): React.CSSProperties => ({
  fontFamily: "Georgia, serif",
  fontSize: 16,
  letterSpacing: "0.26em",
  textTransform: "uppercase",
  color: accent,
  fontWeight: 600,
  textAlign: "center",
  margin: "0 0 18px",
});

const h3: React.CSSProperties = { fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 400, color: "#f0e8d8", margin: "0 0 14px", lineHeight: 1.35 };
const body: React.CSSProperties = { fontFamily: "sans-serif", fontSize: 14, color: "rgba(240,232,216,0.65)", margin: 0, lineHeight: 1.7 };
const panel: React.CSSProperties = { padding: "18px 16px", borderRadius: 14, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)" };

function SearchDemo({ accent }: { accent: string }) {
  const [wordIdx, setWordIdx] = useState(0);
  const [typed, setTyped] = useState(0);
  const [done, setDone] = useState(false);
  const word = WORDS[wordIdx];

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (typed < word.length) {
      timer = setTimeout(() => setTyped((n) => n + 1), 90);
    } else if (!done) {
      timer = setTimeout(() => setDone(true), 450);
    } else {
      timer = setTimeout(() => {
        setDone(false);
        setTyped(0);
        setWordIdx((i) => (i + 1) % WORDS.length);
      }, 2600);
    }
    return () => clearTimeout(timer);
  }, [typed, done, word]);

  return (
    <div style={{ ...panel, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 10px 9px 14px", borderRadius: 10, background: "#090607", border: `1px solid ${accent}45`, minHeight: 20 }}>
        <span style={{ fontFamily: "sans-serif", fontSize: 13, color: "#f0e8d8" }}>
          🔍 &nbsp;{word.slice(0, typed)}
          <span style={{ display: "inline-block", width: 1.5, height: 14, background: accent, marginLeft: 1, verticalAlign: "middle", animation: "smartBlink 1s steps(1) infinite" }} />
        </span>
        <span style={{ fontFamily: "sans-serif", fontSize: 11.5, padding: "5px 12px", borderRadius: 7, background: done ? "#57c88a" : "#cfa358", color: "#1a130c", fontWeight: 700, transition: "background .3s" }}>
          {done ? "3 trouvés" : "Rechercher"}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 138 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={`${wordIdx}-${i}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 10,
              background: "#0f0b0c",
              border: `1px solid ${accent}38`,
              opacity: done ? 1 : 0,
              transform: done ? "translateY(0)" : "translateY(8px)",
              transition: `opacity .4s ${i * 0.15}s, transform .4s ${i * 0.15}s`,
            }}
          >
            <span style={{ width: 24, height: 24, borderRadius: "50%", background: `${accent}25`, color: accent, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>▶</span>
            <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11.5, color: "rgba(240,232,216,0.7)", flex: 1 }}>PTT-2023{i + 1}0{i + 4}-WA00{i + 1}2</span>
            <span style={{ fontFamily: "sans-serif", fontSize: 11, color: "#57c88a", fontWeight: 600 }}>{96 - i * 7} %</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PhoneDemo({ accent }: { accent: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setProgress((p) => (p >= 100 ? 0 : p + 0.6)), 60);
    return () => clearInterval(id);
  }, []);

  const current = [...TAGS].reverse().find((t) => progress >= t.pos) ?? null;

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ width: 250, borderRadius: 34, padding: 9, background: "linear-gradient(160deg,#2a211d,#0c0809)", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 18px 40px rgba(0,0,0,0.55)" }}>
        <div style={{ borderRadius: 26, padding: "22px 16px 18px", background: "radial-gradient(ellipse at 50% 0%, #241a15, #0d0809 70%)", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ width: 54, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.12)", margin: "0 auto 4px" }} />
          <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "#f0e8d8", textAlign: "center", margin: 0, minHeight: 18 }}>
            {current ? current.label : "Pour toi, avec amour"}
          </p>
          <div style={{ position: "relative", height: 26, display: "flex", alignItems: "center" }}>
            <div style={{ position: "absolute", left: 0, right: 0, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.1)" }} />
            <div style={{ position: "absolute", left: 0, width: `${progress}%`, height: 5, borderRadius: 3, background: accent }} />
            {TAGS.map((t) => (
              <span key={t.label} style={{ position: "absolute", left: `${t.pos}%`, width: 11, height: 11, marginLeft: -5.5, borderRadius: "50%", background: t.color, border: "2px solid #0d0809", boxShadow: `0 0 ${current?.label === t.label ? 12 : 0}px ${t.color}` }} />
            ))}
            <span style={{ position: "absolute", left: `${progress}%`, width: 9, height: 9, marginLeft: -4.5, borderRadius: "50%", background: "#f0e8d8" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {TAGS.map((t) => {
              const active = current?.label === t.label;
              return (
                <div key={t.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 9, background: active ? `${t.color}22` : "rgba(255,255,255,0.03)", border: `1px solid ${active ? t.color : "rgba(255,255,255,0.07)"}`, transition: "all .3s" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: t.color }} />
                  <span style={{ fontFamily: "sans-serif", fontSize: 11.5, color: "#f0e8d8", flex: 1 }}>{t.label}</span>
                  <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 10.5, color: t.color }}>{t.time}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SmartOptionShowcase({ accent, audioCount }: { accent: string; audioCount: number }) {
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 36, marginBottom: 34 }}>
      <style>{`@keyframes smartBlink{50%{opacity:0}}`}</style>

      {/* Avant / Après */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ padding: "18px 14px", borderRadius: 16, background: "#0e0a0b", border: "1px solid rgba(255,255,255,0.09)", textAlign: "center" }}>
          <p style={{ fontFamily: "sans-serif", fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(240,232,216,0.45)", margin: "0 0 10px" }}>Sans l&apos;option</p>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 26, color: "#f0e8d8", margin: "0 0 6px" }}>{audioCount}</p>
          <p style={{ fontFamily: "sans-serif", fontSize: 12, color: "rgba(240,232,216,0.55)", margin: 0, lineHeight: 1.5 }}>vocaux à écouter un par un pour trouver les bons</p>
        </div>
        <div style={{ padding: "18px 14px", borderRadius: 16, background: `${accent}12`, border: `1px solid ${accent}70`, textAlign: "center" }}>
          <p style={{ fontFamily: "sans-serif", fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: accent, margin: "0 0 10px" }}>Avec l&apos;option</p>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 26, color: "#57c88a", margin: "0 0 6px" }}>1 mot</p>
          <p style={{ fontFamily: "sans-serif", fontSize: 12, color: "rgba(240,232,216,0.7)", margin: 0, lineHeight: 1.5 }}>et les bons messages s&apos;affichent</p>
        </div>
      </div>

      {/* Recherche IA */}
      <div style={cardStyle(accent)}>
        <div>
          <p style={kicker(accent)}>Recherche IA</p>
          <h3 style={h3}>Trouvez vos audios à partir de simples mots</h3>
          <p style={body}>
            Inutile d&apos;écouter vos {audioCount} vocaux un par un ! Tapez un mot ou un nom prononcé dans le vocal : notre IA écoute et retrouve les bons messages (jusqu&apos;à <strong style={{ color: "#f0e8d8" }}>100 h d&apos;audios</strong>).{" "}
            <span style={{ display: "inline-flex", alignItems: "center", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 999, background: "rgba(87,200,138,0.14)", border: "1px solid rgba(87,200,138,0.45)", color: "#57c88a", verticalAlign: "middle", marginTop: 8, marginLeft: 4 }}>
              ⚡ Gain de temps
            </span>
          </p>
        </div>
        <SearchDemo accent={accent} />
      </div>

      {/* Marque-pages + valeur du cadeau */}
      <div style={cardStyle(accent)}>
        <div>
          <p style={kicker(accent)}>Marque-pages</p>
          <h3 style={h3}>Créez des repères sur la piste de lecture</h3>
          <p style={body}>
            Nommez vos moments forts avec des étiquettes de couleur et placez-les sur la chronologie : la personne qui scanne le QR code ou la puce NFC y accède en un toucher, sans rien installer.
          </p>
        </div>
        <PhoneDemo accent={accent} />
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${accent}60, transparent)` }} />
        <div>
          <p style={{ ...kicker(accent), fontSize: 13, margin: "0 0 8px" }}>Un cadeau de plus grande valeur</p>
          <h3 style={{ ...h3, textAlign: "center", fontSize: 19, margin: 0 }}>Les repères ne servent pas qu&apos;à vous</h3>
        </div>
        <div style={{ display: "grid", gap: 14 }}>
          {[
            { icon: "🎁", title: "Ils vous aident à construire le cadeau", text: "Vous choisissez les moments forts, vous les nommez, vous les ordonnez : votre sélection prend la forme d'une vraie histoire." },
            { icon: "💎", title: "Ils donnent plus de valeur à ce qu'on offre", text: "Ce n'est plus un simple enregistrement : c'est un souvenir structuré, soigné, pensé pour la personne." },
            { icon: "👆", title: "Ils font plaisir à celui qui le reçoit", text: "Il revient en un toucher sur « Je t'aime » ou « Anniversaire maman », et le réécoute à volonté, des années après." },
          ].map((it) => (
            <div key={it.title} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "14px 14px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <span style={{ fontSize: 22, lineHeight: 1 }}>{it.icon}</span>
              <div>
                <p style={{ fontFamily: "Georgia, serif", fontSize: 15, color: "#f0e8d8", margin: "0 0 4px" }}>{it.title}</p>
                <p style={{ ...body, fontSize: 13 }}>{it.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
