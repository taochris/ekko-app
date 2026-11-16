"use client";

import { useState } from "react";
import SmartScene3D from "../../components/SmartScene3D";

const font = "Georgia, serif";
const gold = "#c9a96e";
const cream = "#f0e8d8";
const green = "#57d493";

const ATOUTS = [
  { icon: "▦", label: "QR gravé" },
  { icon: "◉", label: "Lecture NFC" },
  { icon: "❖", label: "Bois massif" },
  { icon: "▶", label: "Réécoute instantanée" },
];

const THEMES = [
  { title: "Amour & intimité", tag: "Et si vous lui offriez vos plus beaux instants à réécouter ?", img: "/images/themes/theme_couple.png", accent: "#c4407a" },
  { title: "Mémoire éternelle", tag: "Et si vous pouviez garder sa voix pour toujours ?", img: "/images/themes/theme_deuil.png", accent: "#1fa896" },
  { title: "Amitiés & joie", tag: "Et si vos fous rires ne disparaissaient jamais ?", img: "/images/themes/theme_amitie.png", accent: "#d4752a" },
];

const STEPS = [
  { n: "1", t: "Sélectionnez vos vocaux", d: "Importez vos messages WhatsApp ou Instagram, ou enregistrez-vous directement." },
  { n: "2", t: "Nous créons votre vocapsule", d: "Vos enregistrements sont sécurisés et associés à votre porte-clé unique." },
  { n: "3", t: "Scannez ou approchez", d: "QR code gravé, ou puce NFC : aucune application à installer." },
];

export default function AccueilPreview() {
  const [infoOpen, setInfoOpen] = useState(false);
  return (
    <main style={{ background: "#0a080c", color: cream, fontFamily: font, minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        .pv-hero{position:relative;z-index:5;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:center;max-width:1200px;margin:0 auto;padding:40px 56px 150px;min-height:520px}
        .pv-btn-primary{display:inline-block;padding:20px 48px;border-radius:6px;background:linear-gradient(135deg,#c9a96e,#b08940);font-family:Georgia,serif;font-size:13px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:#1a1418;text-decoration:none;width:100%;text-align:center;transition:opacity .2s;box-sizing:border-box}
        .pv-btn-primary:hover{opacity:.88}
        .pv-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:1000px;margin:0 auto}
        .pv-strip{display:flex;justify-content:center;gap:56px;flex-wrap:wrap}
        .pv-btn{display:inline-block;text-align:center;text-decoration:none;font-family:${font};transition:transform .2s,box-shadow .2s}
        .pv-btn:hover{transform:translateY(-2px)}
        @media(max-width:820px){
          .pv-nav{padding:14px 20px!important}
          .pv-logo{height:93px!important}
          .pv-nav-links{display:none!important}
          .pv-bg{width:100%!important;transform:none!important;opacity:.48;object-position:65% center!important}
          .pv-overlay{background:linear-gradient(180deg,rgba(10,8,12,.55) 0%,rgba(10,8,12,.72) 45%,rgba(10,8,12,.94) 100%)!important}
          .pv-hero{grid-template-columns:1fr;padding:24px 22px 90px;text-align:center;min-height:0}
          .pv-hero-spacer{display:none}
          .pv-hero>div{margin:0 auto}
          .pv-links{justify-content:center!important;flex-direction:column}
          .pv-demo{grid-template-columns:1fr!important;gap:36px!important;padding:60px 22px 20px!important;text-align:center}
          .pv-demo p{margin-left:auto!important;margin-right:auto!important}
          .pv-hero-actions{align-items:center!important}
          .pv-grid3{grid-template-columns:1fr}
          .pv-strip{gap:26px}
        }
      `}</style>

      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "#c9a96e", color: "#1a130c", fontSize: 12.5, textAlign: "center", padding: "8px 12px", letterSpacing: "0.04em" }}>
        APERÇU · proposition de nouvelle page d&apos;accueil · la vraie page n&apos;est pas modifiée
      </div>

      <div style={{ position: "relative", overflow: "hidden", background: "#000" }}>
        <img
          src="/images/hero/ChatGPT Image 4 juin 2026, 20_00_09.png"
          alt="Un smartphone affiche le lecteur VOSEKKO avec le visage d'une jeune femme, posé à côté d'un porte-clé en bois gravé d'un QR code"
          className="pv-bg"
          style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "96%", height: "100%", objectFit: "cover", objectPosition: "35% center", transform: "translateX(15%)", zIndex: 0 }}
        />
        <div className="pv-overlay" style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(90deg, #000 0%, rgba(0,0,0,0.94) 24%, rgba(5,4,6,0.7) 46%, rgba(10,8,12,0.18) 72%, transparent 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", zIndex: 1, background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.28) 38%, rgba(0,0,0,0.82) 76%, #000 100%)" }} />

        <nav className="pv-nav" style={{ position: "relative", zIndex: 5, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 48px" }}>
          <img src="/vosekko-logo.png" alt="VOSEKKO" className="pv-logo" style={{ height: 146, width: "auto", objectFit: "contain", mixBlendMode: "screen", opacity: 0.9 }} />
          <div className="pv-nav-links" style={{ display: "flex", gap: 28, fontSize: 12, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(243,227,190,0.88)" }}>
            <span>Produits</span>
            <span>Inspirations</span>
            <span>Comment ça marche</span>
            <span>FAQ</span>
            <span>Blog</span>
          </div>
        </nav>

        <section className="pv-hero">
          <div style={{ width: "100%", maxWidth: 460 }}>
            <p style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(201,169,110,0.8)", margin: "0 0 22px" }}>
              Porte-clé en bois gravé · Messages vocaux
            </p>
            <h1 style={{ fontWeight: 300, fontSize: "clamp(2.6rem, 5.4vw, 4.2rem)", lineHeight: 1.08, margin: "0 0 24px", textShadow: "0 2px 18px rgba(0,0,0,0.7)" }}>
              La voix qu&apos;on garde{" "}
              <em style={{ fontStyle: "italic", background: "linear-gradient(135deg, #ecd5a0 0%, #c9a96e 50%, #b08940 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: gold }}>sur soi.</em>
            </h1>
            <p style={{ fontSize: 20, lineHeight: 1.6, color: "rgba(240,232,216,0.92)", margin: "0 0 20px", maxWidth: 400, textShadow: "0 1px 8px rgba(0,0,0,0.7)" }}>
              Transformez vos messages vocaux préférés en porte-clés gravés.
            </p>
            <div style={{ width: 46, height: 1, background: "linear-gradient(90deg, #c9a96e, transparent)", margin: "0 0 18px" }} />
            <p style={{ fontSize: 16, lineHeight: 1.7, fontStyle: "italic", color: "rgba(236,213,160,0.85)", margin: "0 0 " + (infoOpen ? 16 : 40) + "px", textShadow: "0 1px 8px rgba(0,0,0,0.7)" }}>
              La voix de ceux qu&apos;on aime s&apos;écoute en un{" "}
              <span style={{ whiteSpace: "nowrap" }}>geste.<button
                type="button"
                onClick={() => setInfoOpen((v) => !v)}
                aria-expanded={infoOpen}
                aria-label="Information"
                title="Information"
                style={{ marginLeft: 3, background: "none", border: "none", padding: 0, cursor: "pointer", color: gold, fontFamily: font, fontSize: 20, lineHeight: 1, verticalAlign: "super" }}
              >
                *
              </button></span>
            </p>
            {infoOpen && (
              <div style={{ margin: "0 0 30px", padding: "18px 20px", borderRadius: 16, background: "rgba(0,0,0,0.58)", border: "1px solid rgba(201,169,110,0.18)", boxShadow: "0 16px 45px rgba(0,0,0,0.28)", backdropFilter: "blur(10px)", textAlign: "left" }}>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.8, color: "rgba(240,232,216,0.92)" }}>
                  Choisissez les voix qui comptent. Grâce à une IA qui comprend le contenu de vos messages, retrouvez en quelques mots les audios que vous cherchez, sans fouiller pendant des heures. Transformez vos messages vocaux préférés en{" "}
                  <a href="/comment-ca-marche" style={{ color: "rgb(87, 212, 147)", textDecoration: "none", fontWeight: 600, borderBottom: "1px solid rgba(87, 212, 147, 0.45)" }}>vocapsule</a>
                  {" "}: un souvenir sonore à télécharger ou à garder sur un porte-clé en bois gravé.
                </p>
              </div>
            )}
            <div className="pv-hero-actions" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <a href="#" className="pv-btn-primary">Créer mon porte-clé</a>
              <div className="pv-links" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <a href="#" style={{ color: "rgba(240,232,216,0.7)", fontSize: 13.5, textDecoration: "none", borderBottom: "1px solid rgba(240,232,216,0.25)", paddingBottom: 2 }}>
                  ou en fichier numérique, dès 9,99 € →
                </a>
                <a href="#demo" style={{ color: green, fontSize: 13.5, textDecoration: "none" }}>
                  ▶ Voir la démo
                </a>
              </div>
            </div>
          </div>
          <div className="pv-hero-spacer" />
        </section>
      </div>

      {/* BANDE D'ATOUTS */}
      <section style={{ borderTop: "1px solid rgba(201,169,110,0.14)", borderBottom: "1px solid rgba(201,169,110,0.14)", padding: "22px 24px", background: "rgba(255,255,255,0.015)" }}>
        <div className="pv-strip">
          {ATOUTS.map((a) => (
            <div key={a.label} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(240,232,216,0.85)" }}>
              <span style={{ color: gold, fontSize: 16 }}>{a.icon}</span>
              {a.label}
            </div>
          ))}
        </div>
      </section>

      {/* DÉMO VIDÉO */}
      <section id="demo" className="pv-demo" style={{ maxWidth: 980, margin: "0 auto", padding: "84px 40px 30px", display: "grid", gridTemplateColumns: "minmax(0,1fr) 270px", gap: 64, alignItems: "center" }}>
        <div>
          <p style={{ fontSize: 11, letterSpacing: "0.42em", textTransform: "uppercase", color: "rgba(201,169,110,0.8)", margin: "0 0 16px" }}>Ce que reçoit la personne</p>
          <h2 style={{ fontWeight: 300, fontSize: "clamp(1.9rem, 4.4vw, 2.6rem)", lineHeight: 1.2, margin: "0 0 18px" }}>
            Un geste, et <em style={{ color: gold }}>la voix revient.</em>
          </h2>
          <p style={{ fontSize: 15.5, lineHeight: 1.8, color: "rgba(240,232,216,0.68)", margin: 0, maxWidth: 440 }}>
            Il suffit de scanner le QR code gravé ou d&apos;approcher le téléphone de la puce NFC. Le lecteur s&apos;ouvre aussitôt, sans application à installer, avec la photo, les messages et les repères que vous avez choisis.
          </p>
        </div>
        <div style={{ position: "relative", justifySelf: "center", width: 250 }}>
          <div style={{ position: "absolute", inset: -30, background: "radial-gradient(circle, rgba(201,169,110,0.2), transparent 65%)", filter: "blur(10px)" }} />
          <div style={{ position: "relative", aspectRatio: "240 / 290", borderRadius: 24, overflow: "hidden", border: "1px solid rgba(201,169,110,0.3)", boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}>
            <video autoPlay muted loop playsInline preload="metadata" aria-label="Démonstration : le lecteur VOSEKKO s'ouvre sur un smartphone après le scan du porte-clé" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}>
              <source src="/images/video/Replace_name_on_smartphone_screen_202606022004.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      {/* SECTION IA */}
      <section style={{ padding: "84px 24px 70px", maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
        <p style={{ fontSize: 11, letterSpacing: "0.42em", textTransform: "uppercase", color: green, margin: "0 0 16px" }}>✦ Souvenirs intelligents</p>
        <h2 style={{ fontWeight: 300, fontSize: "clamp(1.9rem, 4.4vw, 2.6rem)", lineHeight: 1.2, margin: "0 0 18px" }}>
          Retrouvez le bon vocal <em style={{ color: gold }}>en quelques mots</em>
        </h2>
        <p style={{ fontSize: 15.5, lineHeight: 1.75, color: "rgba(240,232,216,0.65)", margin: "0 0 34px" }}>
          Des centaines de messages ? Tapez un mot ou un prénom prononcé dans le vocal : notre IA retrouve les bons messages et vous placez des repères colorés sur la piste de lecture.
        </p>
        <SmartScene3D />
        <p style={{ fontSize: 12.5, color: "rgba(240,232,216,0.4)", margin: "14px 0 0" }}>Option à +3 €, jusqu&apos;à 100 h d&apos;audio analysées.</p>
      </section>

      {/* UNIVERS */}
      <section style={{ padding: "40px 24px 80px", textAlign: "center" }}>
        <p style={{ fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase", color: "rgba(201,169,110,0.55)", margin: "0 0 14px" }}>Vos univers. Vos émotions.</p>
        <h2 style={{ fontWeight: 300, fontSize: "clamp(1.8rem, 4vw, 2.4rem)", margin: "0 0 26px" }}>Pour quelle occasion ?</h2>
        <a href="/inspirations" style={{ display: "inline-flex", alignItems: "center", gap: 14, margin: "0 0 44px", fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgb(87, 212, 147)", textDecoration: "none" }}>
          <span style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid rgba(87,212,147,0.45)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>+</span>
          Mille &amp; une occasions
        </a>
        <div className="pv-grid3">
          {THEMES.map((t) => (
            <div key={t.title} style={{ borderRadius: 20, overflow: "hidden", background: "rgba(20,16,24,0.7)", border: `1px solid ${t.accent}40`, textAlign: "left" }}>
              <div style={{ height: 190, background: `url(${t.img}) center/cover` }} />
              <div style={{ padding: "22px 22px 26px" }}>
                <h3 style={{ margin: "0 0 10px", fontWeight: 400, fontSize: 20, color: t.accent }}>{t.title}</h3>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, fontStyle: "italic", color: "rgba(240,232,216,0.7)" }}>{t.tag}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ÉTAPES */}
      <section style={{ padding: "20px 24px 84px", textAlign: "center" }}>
        <h2 style={{ fontWeight: 300, fontSize: "clamp(1.8rem, 4vw, 2.4rem)", margin: "0 0 44px" }}>Trois étapes simples</h2>
        <div className="pv-grid3">
          {STEPS.map((s) => (
            <div key={s.n} style={{ padding: "6px 18px" }}>
              <div style={{ width: 46, height: 46, borderRadius: "50%", margin: "0 auto 16px", border: `1px solid ${gold}`, color: gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19 }}>{s.n}</div>
              <h3 style={{ margin: "0 0 8px", fontWeight: 400, fontSize: 18 }}>{s.t}</h3>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: "rgba(240,232,216,0.6)" }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* APPEL À L'ACTION FINAL */}
      <section style={{ padding: "70px 24px 84px", textAlign: "center", background: "radial-gradient(ellipse at 50% 0%, rgba(201,169,110,0.12), transparent 70%)", borderTop: "1px solid rgba(201,169,110,0.14)" }}>
        <h2 style={{ fontWeight: 300, fontSize: "clamp(1.9rem, 4.4vw, 2.8rem)", margin: "0 0 26px" }}>
          Offrez une voix, <em style={{ color: gold }}>pas un objet de plus.</em>
        </h2>
        <a href="#" className="pv-btn" style={{ padding: "17px 38px", borderRadius: 999, background: `linear-gradient(135deg, #d9b878, ${gold})`, color: "#1a130c", fontSize: 15, fontWeight: 600, letterSpacing: "0.05em" }}>
          Créer mon porte-clé
        </a>
      </section>

      <footer style={{ padding: "26px 24px 34px", textAlign: "center", fontSize: 12, color: "rgba(240,232,216,0.35)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        © 2026 VOSEKKO. Tous droits réservés.
      </footer>
    </main>
  );
}
