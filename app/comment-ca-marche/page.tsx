"use client";
import React from "react";
import { motion } from "framer-motion";
import BlobBackground from "../components/BlobBackground";

const font = "Georgia, serif";
const gold = "#c9a96e";
const cream = "#f0e8d8";


export default function CommentCamarchePage() {
  return (
    <div style={{ position: "relative", minHeight: "100vh", width: "100%", overflowX: "hidden" }}>
      <BlobBackground variant="home" />

      {/* ── Nav ── */}
      <nav style={{ position: "relative", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid rgba(201,169,110,0.08)" }} className="main-nav">
        <a href="/" style={{ textDecoration: "none" }}>
          <img src="/ekko-logo.png" alt="EKKO" style={{ height: 52, width: "auto", objectFit: "contain", mixBlendMode: "screen" }} />
        </a>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "flex-end" }} className="nav-links">
          {[{ label: "La vocapsule", href: "/comment-ca-marche" }, { label: "L'objet", href: "/produit" }, { label: "Les usages", href: "/produit/themes" }, { label: "Créer", href: "/" }].map(({ label, href }) => (
            <a key={href} href={href} style={{ fontFamily: font, fontSize: 12, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(187,178,156,0.88)", textDecoration: "none" }}>{label}</a>
          ))}
        </div>
      </nav>

      {/* ── 1. Définition ── */}
      <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}
        style={{ position: "relative", zIndex: 10, maxWidth: 960, margin: "0 auto", padding: "72px 24px 80px" }}>
        {/* Titre pleine largeur */}
        <p style={{ fontFamily: font, fontSize: 10, letterSpacing: "0.6em", textTransform: "uppercase", color: `${gold}99`, marginBottom: 20, textAlign: "center" }}>La vocapsule</p>
        <h1 style={{ fontFamily: font, fontWeight: 300, fontSize: "clamp(2.2rem, 5vw, 3.6rem)", lineHeight: 1.15, color: cream, marginBottom: 40, textAlign: "center" }}>
          Une vocapsule,{" "}<em style={{ fontStyle: "italic", color: gold }}>c'est quoi ?</em>
        </h1>
        {/* Onde audio centrée - adaptative */}
        <svg viewBox="0 0 120 24" fill="none" preserveAspectRatio="xMidYMid meet" style={{ width: "100%", maxWidth: 280, height: 24, margin: "40px auto", display: "block" }}>
          {[6,2,10,4,14,2,10,6,12,3,8,5,12,2,8,4,14,2,10,6].map((h, i) => (
            <rect key={i} x={i * 6 + 1} y={(24 - h) / 2} width={4} height={h} rx={2} fill={i % 2 === 0 ? `${gold}cc` : `${gold}55`} />
          ))}
        </svg>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 40, alignItems: "start" }} className="section1-grid">
          {/* Texte gauche */}
          <div>
            <p style={{ fontFamily: font, fontSize: 16, fontWeight: 500, color: cream, marginBottom: 16 }}>Un concentré de souvenirs audio, accessible en une seconde.</p>
            <p style={{ fontFamily: font, fontSize: 14, lineHeight: 1.85, color: "rgba(240,232,216,0.55)", marginBottom: 32 }}>
              Une vocapsule rassemble les voix que vous voulez garder : des messages vocaux existants, des souvenirs retrouvés dans vos conversations, ou un message enregistré spécialement pour quelqu'un. Jusqu'à <strong style={{ color: cream }}>2 heures d'audio</strong>, pour créer un souvenir sonore unique, facile à retrouver, à écouter et à offrir.
            </p>
            <p style={{ fontFamily: font, fontSize: 15, fontStyle: "italic", color: gold, lineHeight: 1.6 }}>
              "Une voix importante ne devrait pas rester perdue dans des années de messages."
            </p>
          </div>
          {/* Vidéo droite */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, flexShrink: 0 }} className="section1-video">
            <div style={{ width: 190, height: 240, borderRadius: 20, background: "linear-gradient(160deg, #1a1218, #0e0a12)", border: `1px solid ${gold}22`, overflow: "hidden" }}>
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster="/images/video/vignette-ekko.jpg"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: "inherit" }}
              >
                <source src="/images/video/Replace_name_on_smartphone_screen_202606022004.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── 2. Le problème ── */}
      <motion.section initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7 }}
        style={{ position: "relative", zIndex: 10, maxWidth: 960, margin: "60px auto", padding: "60px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }} className="two-col-grid">
          <div>
            <p style={{ fontFamily: font, fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase", color: `${gold}88`, marginBottom: 24 }}>Le problème</p>
            <div style={{ display: "flex", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
              {["#25D366","#E1306C","#0099FF","#6C63FF","#FF7043"].map((c, i) => (
                <div key={i} style={{ width: 38, height: 38, borderRadius: 10, background: c, opacity: 0.75, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${(i-2)*4}deg) translateY(${Math.abs(i-2)*2}px)` }}>
                  <svg viewBox="0 0 24 24" fill="white" style={{ width: 18, height: 18 }}><path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z"/></svg>
                </div>
              ))}
            </div>
            <h2 style={{ fontFamily: font, fontWeight: 300, fontSize: "clamp(1.5rem, 2.5vw, 2.1rem)", color: cream, lineHeight: 1.3 }}>
              Les voix importantes<br />se perdent trop facilement
            </h2>
          </div>
          <div>
            <p style={{ fontFamily: font, fontSize: 14, lineHeight: 1.85, color: "rgba(240,232,216,0.55)", marginBottom: 28 }}>
              Un message romantique, une blague entre amis, un vocal d'anniversaire, la voix d'un proche disparu… Ces audios existent quelque part, mais ils sont souvent noyés dans WhatsApp, Messenger, Instagram, Telegram, dans des groupes, des archives ou d'anciens téléphones.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {["On sait qu'ils existent.", "On ne sait plus toujours où les retrouver.", "Alors on finit parfois par ne plus jamais les réécouter."].map((line) => (
                <div key={line} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontFamily: font, fontSize: 14, color: gold, fontStyle: "italic" }}>
                  <span style={{ flexShrink: 0, marginTop: 2 }}>›</span>{line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── 3. Le bénéfice ── */}
      <motion.section initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7 }}
        style={{ position: "relative", zIndex: 10, maxWidth: 900, margin: "60px auto", padding: "60px 24px", textAlign: "center" }}>
        <p style={{ fontFamily: font, fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase", color: `${gold}88`, marginBottom: 20 }}>Le bénéfice</p>
        <h2 style={{ fontFamily: font, fontWeight: 300, fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", color: cream, marginBottom: 16 }}>
          Retrouver une voix <em style={{ fontStyle: "italic", color: gold }}>immédiatement</em>
        </h2>
        <p style={{ fontFamily: font, fontSize: 14, lineHeight: 1.8, color: "rgba(240,232,216,0.5)", maxWidth: 580, margin: "0 auto 36px" }}>
          Avec Ekko, vous gardez seulement ce qui compte vraiment. Vous supprimez les audios parasites et créez un souvenir audio propre, clair et unique.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
          {["Jusqu'à 2 h d'audio", "Audios réunis au même endroit", "QR code + NFC sur le support", "Écoute en une seconde"].map((label) => (
            <div key={label} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 40, background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.2)", fontFamily: font, fontSize: 13, color: cream }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: gold, display: "inline-block", flexShrink: 0 }} />{label}
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── 4. Avant / Après ── */}
      <motion.section initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7 }}
        style={{ position: "relative", zIndex: 10, maxWidth: 960, margin: "80px auto", padding: "60px 24px" }}>
        <p style={{ fontFamily: font, fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase", color: `${gold}88`, marginBottom: 20, textAlign: "center" }}>La différence</p>
        <h2 style={{ fontFamily: font, fontWeight: 300, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: cream, marginBottom: 48, textAlign: "center", lineHeight: 1.3 }}>
          Avant, il fallait chercher.{" "}<em style={{ fontStyle: "italic", color: gold }}>Maintenant, il suffit d'écouter.</em>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "stretch", marginBottom: 32 }} className="avant-grid">
          <div style={{ background: "rgba(28,24,24,0.85)", border: "2px solid rgba(220,60,60,0.45)", borderRadius: 20, padding: "24px 20px" }}>
            <p style={{ fontFamily: font, fontSize: 13, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(252,157,157,0.85)", marginBottom: 20, textAlign: "center", fontWeight: 600 }}>Avant Ekko</p>
            {["Chercher dans plusieurs applications", "Faire défiler des années de messages", "Devoir écouter les audios 1 par 1", "Ouvrir des audios inutiles", "Dépendre d'un ancien téléphone", "Risque de perte ou de suppression"].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 12, fontFamily: font, fontSize: 13, color: "rgb(252,157,157)", lineHeight: 1.5 }}>
                <span style={{ flexShrink: 0, minWidth: 14, marginTop: 3, color: "rgba(252,157,157,0.45)", display: "inline-block" }}>—</span>{item}
              </div>
            ))}
          </div>
          <div style={{ background: "rgba(22,28,26,0.85)", border: "2px solid rgba(72,231,204,0.5)", borderRadius: 20, padding: "24px 20px", boxShadow: "0 0 18px rgba(72,231,204,0.07)" }}>
            <p style={{ fontFamily: font, fontSize: 13, letterSpacing: "0.25em", textTransform: "uppercase", color: "#4ee6d1", marginBottom: 20, textAlign: "center", fontWeight: 600 }}>Avec Ekko</p>
            {["Les bons audios sont réunis", "Le souvenir reste toujours au même endroit", "Le QR code ouvre directement l'écoute", "La puce NFC fonctionne en approchant le téléphone", "Toujours avec soi, partout où vous allez", "Une seconde suffit"].map((item, idx) => (
              <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 12, fontFamily: font, fontSize: 13, color: "#c8ffe9", lineHeight: 1.5 }}>
                <span style={{ minWidth: 14, display: "inline-flex", alignItems: "center", justifyContent: "flex-start", flexShrink: 0, marginTop: 4 }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: idx === 4 ? "#ff9f7a" : "#4ee6d1", display: "inline-block" }} /></span>{item}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: font, fontSize: 13, color: "rgba(240,232,216,0.45)" }}>
            <svg viewBox="0 0 24 24" fill="none" style={{ width: 18, height: 18 }}>
              <rect x="2" y="2" width="8" height="8" rx="1" stroke={`${gold}77`} strokeWidth="1.5"/>
              <rect x="14" y="2" width="8" height="8" rx="1" stroke={`${gold}77`} strokeWidth="1.5"/>
              <rect x="2" y="14" width="8" height="8" rx="1" stroke={`${gold}77`} strokeWidth="1.5"/>
              <rect x="14" y="14" width="8" height="8" rx="1" stroke={`${gold}77`} strokeWidth="1.5"/>
            </svg>
            Scannez le QR code ou approchez le support du téléphone.
          </div>
          <p style={{ fontFamily: font, fontSize: 14, fontStyle: "italic", color: cream }}>Le souvenir n'est plus à chercher.{" "}<span style={{ color: "#ffb48a" }}>Il est là.</span></p>
        </div>
      </motion.section>

      {/* ── 5. L'accès QR + NFC ── */}
      <motion.section initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7 }}
        style={{ position: "relative", zIndex: 10, maxWidth: 960, margin: "0 auto", padding: "0 24px 80px" }}>
        <p style={{ fontFamily: font, fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase", color: `${gold}88`, marginBottom: 20, textAlign: "center" }}>L'accès</p>
        <h2 style={{ fontFamily: font, fontWeight: 300, fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", color: cream, marginBottom: 16, textAlign: "center" }}>
          Deux accès, <em style={{ fontStyle: "italic", color: gold }}>un seul souvenir</em>
        </h2>
        <p style={{ fontFamily: font, fontSize: 14, lineHeight: 1.8, color: "rgba(240,232,216,0.5)", textAlign: "center", maxWidth: 620, margin: "0 auto 40px" }}>
          Sur le support physique (porte-clés en bois, par exemple), vous avez un QR code gravé et une puce NFC intégrée. À vous de choisir la façon qui vous convient le mieux pour écouter.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }} className="two-col-grid access-grid">
          {[
            { title: "QR code", desc: "Scannez avec l'appareil photo et ouvrez instantanément la vocapsule.", icon: (<svg viewBox="0 0 32 32" fill="none" style={{ width: 40, height: 40, flexShrink: 0 }}><rect x="2" y="2" width="12" height="12" rx="1" stroke={gold} strokeWidth="1.5"/><rect x="5" y="5" width="6" height="6" rx="0.5" fill={gold} opacity="0.55"/><rect x="18" y="2" width="12" height="12" rx="1" stroke={gold} strokeWidth="1.5"/><rect x="21" y="5" width="6" height="6" rx="0.5" fill={gold} opacity="0.55"/><rect x="2" y="18" width="12" height="12" rx="1" stroke={gold} strokeWidth="1.5"/><rect x="5" y="21" width="6" height="6" rx="0.5" fill={gold} opacity="0.55"/><rect x="18" y="18" width="4" height="4" fill={gold} opacity="0.45"/><rect x="24" y="18" width="4" height="4" fill={gold} opacity="0.45"/><rect x="18" y="24" width="4" height="4" fill={gold} opacity="0.45"/><rect x="24" y="24" width="4" height="4" fill={gold} opacity="0.45"/></svg>) },
            { title: "NFC", desc: "Approchez votre téléphone du support et la vocapsule s'ouvre en une seconde.", icon: (<svg viewBox="0 0 32 32" fill="none" style={{ width: 40, height: 40, flexShrink: 0 }}><path d="M6 16a10 10 0 0 1 10-10" stroke={gold} strokeWidth="1.5" strokeLinecap="round" opacity="0.35"/><path d="M9.5 16a6.5 6.5 0 0 1 6.5-6.5" stroke={gold} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/><path d="M13 16a3 3 0 0 1 3-3" stroke={gold} strokeWidth="1.5" strokeLinecap="round"/><circle cx="16" cy="16" r="1.8" fill={gold}/></svg>) },
          ].map((item) => (
            <div key={item.title} style={{ display: "flex", gap: 20, alignItems: "flex-start", background: "rgba(255,255,255,0.02)", border: `1px solid ${gold}22`, borderRadius: 16, padding: "24px 20px" }}>
              {item.icon}
              <div>
                <p style={{ fontFamily: font, fontSize: 15, fontWeight: 600, color: gold, marginBottom: 8 }}>{item.title}</p>
                <p style={{ fontFamily: font, fontSize: 13, lineHeight: 1.7, color: "rgba(240,232,216,0.5)", margin: 0 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontFamily: font, fontSize: 14, fontStyle: "italic", color: "rgba(240,232,216,0.4)", textAlign: "center" }}>Même vocapsule. Deux façons de l'écouter.</p>
      </motion.section>

      {/* ── 6. Les usages ── */}
      <motion.section initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7 }}
        style={{ position: "relative", zIndex: 10, maxWidth: 960, margin: "0 auto", padding: "0 24px 80px" }}>
        <p style={{ fontFamily: font, fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase", color: `${gold}88`, marginBottom: 20, textAlign: "center" }}>Les usages</p>
        <h2 style={{ fontFamily: font, fontWeight: 300, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: cream, marginBottom: 40, textAlign: "center" }}>
          Une même idée, <em style={{ fontStyle: "italic", color: gold }}>plusieurs souvenirs possibles</em>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }} className="usage-grid">
          {[
            { label: "Couple", desc: "Regrouper les messages importants et les vocaux romantiques.", icon: <svg viewBox="0 0 24 24" fill="none" style={{ width: 22, height: 22 }}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke={gold} strokeWidth="1.5" strokeLinejoin="round"/></svg> },
            { label: "Amitié", desc: "Créer un concentré de fous rires et de blagues.", icon: <svg viewBox="0 0 24 24" fill="none" style={{ width: 22, height: 22 }}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={gold} strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke={gold} strokeWidth="1.5"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={gold} strokeWidth="1.5" strokeLinecap="round"/></svg> },
            { label: "Deuil", desc: "Garder près de soi la vraie voix d'un être disparu.", icon: <svg viewBox="0 0 24 24" fill="none" style={{ width: 22, height: 22 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={gold} strokeWidth="1.5" strokeLinejoin="round"/></svg> },
            { label: "Message offert", desc: "Enregistrer une parole comme une lettre orale.", icon: <svg viewBox="0 0 24 24" fill="none" style={{ width: 22, height: 22 }}><rect x="3" y="5" width="18" height="14" rx="2" stroke={gold} strokeWidth="1.5"/><path d="M3 7l9 6 9-6" stroke={gold} strokeWidth="1.5" strokeLinecap="round"/></svg> },
          ].map((item) => (
            <div key={item.label} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${gold}1a`, borderRadius: 16, padding: "20px 16px" }}>
              <div style={{ marginBottom: 12 }}>{item.icon}</div>
              <p style={{ fontFamily: font, fontSize: 14, fontWeight: 600, color: gold, marginBottom: 8 }}>{item.label}</p>
              <p style={{ fontFamily: font, fontSize: 12, lineHeight: 1.7, color: "rgba(240,232,216,0.45)", margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── 7. Importer / Enregistrer ── */}
      <motion.section initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7 }}
        style={{ position: "relative", zIndex: 10, maxWidth: 960, margin: "0 auto", padding: "0 24px 80px" }}>
        <p style={{ fontFamily: font, fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase", color: `${gold}88`, marginBottom: 20, textAlign: "center" }}>Deux façons de créer</p>
        <h2 style={{ fontFamily: font, fontWeight: 300, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: cream, marginBottom: 40, textAlign: "center" }}>
          À partir d'anciens vocaux <em style={{ fontStyle: "italic", color: gold }}>ou d'un nouveau message</em>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }} className="two-col-grid">
          {[
            { label: "Importer vos anciens audios", desc: "Sélectionnez les messages vocaux qui comptent dans vos conversations et ajoutez-les à votre vocapsule.", icon: (<svg viewBox="0 0 24 24" fill="none" style={{ width: 32, height: 32, flexShrink: 0 }}><polyline points="16 16 12 12 8 16" stroke={gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="12" x2="12" y2="21" stroke={gold} strokeWidth="1.5" strokeLinecap="round"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 104 16.3" stroke={gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>) },
            { label: "Enregistrer un nouveau message", desc: "Enregistrez directement votre voix pour créer un souvenir ou un message à offrir.", icon: (<svg viewBox="0 0 24 24" fill="none" style={{ width: 32, height: 32, flexShrink: 0 }}><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" stroke={gold} strokeWidth="1.5" strokeLinecap="round"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" stroke={gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>) },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", gap: 20, alignItems: "flex-start", background: `${gold}06`, border: `1px solid ${gold}22`, borderRadius: 16, padding: "28px 24px" }}>
              {item.icon}
              <div>
                <p style={{ fontFamily: font, fontSize: 14, fontWeight: 600, color: gold, marginBottom: 10 }}>{item.label}</p>
                <p style={{ fontFamily: font, fontSize: 13, lineHeight: 1.75, color: "rgba(240,232,216,0.5)", margin: 0 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontFamily: font, fontSize: 14, fontStyle: "italic", color: "rgba(240,232,216,0.45)", textAlign: "center" }}>
          Une vocapsule peut être un souvenir retrouvé ou un message créé pour être offert.
        </p>
      </motion.section>

      {/* ── 8. L'objet ── */}
      <motion.section initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7 }}
        style={{ position: "relative", zIndex: 10, maxWidth: 960, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }} className="two-col-grid">
          <div>
            <p style={{ fontFamily: font, fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase", color: `${gold}88`, marginBottom: 20 }}>L'objet</p>
            <h2 style={{ fontFamily: font, fontWeight: 300, fontSize: "clamp(1.5rem, 2.5vw, 2rem)", color: cream, marginBottom: 20, lineHeight: 1.3 }}>
              Un souvenir numérique <em style={{ fontStyle: "italic", color: gold }}>dans un objet réel</em>
            </h2>
            <p style={{ fontFamily: font, fontSize: 14, lineHeight: 1.85, color: "rgba(240,232,216,0.55)", marginBottom: 24 }}>
              Votre vocapsule prend vie dans un support physique, pensé pour durer et se transmettre.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
              {["Un QR code gravé", "Une puce NFC intégrée", "Un accès direct à votre vocapsule"].map((line) => (
                <div key={line} style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: font, fontSize: 14, color: "rgba(240,232,216,0.7)" }}>
                  <span style={{ color: gold, fontWeight: 700, fontSize: 16 }}>✓</span>{line}
                </div>
              ))}
            </div>
            <p style={{ fontFamily: font, fontSize: 15, fontStyle: "italic", color: gold }}>
              Un objet que l'on garde avec soi. Une voix que l'on retrouve en une seconde.
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: 320, aspectRatio: "1", borderRadius: 24, overflow: "hidden", background: "rgba(20,14,18,0.8)", border: `1px solid ${gold}22` }}>
              <img src={encodeURI("/images/produit/porteclef_format_arrondie/etiquette_dimension.png")} alt="Porte-clé EKKO en bois gravé"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── 9. CTA unique ── */}
      <motion.section initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
        style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "20px 24px 100px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ width: 60, height: 1, background: `linear-gradient(to right, transparent, ${gold}44)`, margin: "0 auto 48px" }} />
          <h2 style={{ fontFamily: font, fontWeight: 300, fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", color: cream, marginBottom: 20, lineHeight: 1.35 }}>
            Quel souvenir voulez-vous{" "}<em style={{ fontStyle: "italic", color: gold }}>rendre accessible ?</em>
          </h2>
          <p style={{ fontFamily: font, fontSize: 14, lineHeight: 1.8, color: "rgba(240,232,216,0.5)", marginBottom: 36 }}>
            Choisissez vos audios, créez votre vocapsule, puis associez-la à un support que vous pourrez garder, offrir ou partager.
          </p>
          <a href="/" style={{ display: "inline-block", padding: "16px 48px", borderRadius: 50, background: `linear-gradient(135deg, ${gold}55, ${gold}99)`, border: `1px solid ${gold}66`, fontFamily: font, fontSize: 15, fontWeight: 500, color: cream, textDecoration: "none", letterSpacing: "0.08em" }}>
            Créer ma vocapsule
          </a>
          <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 20 }}>
            <span style={{ fontFamily: font, fontSize: 11, color: "rgba(240,232,216,0.25)", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: `${gold}44`, display: "inline-block" }} />Jusqu'à 2 heures d'audio.
            </span>
            <span style={{ fontFamily: font, fontSize: 11, color: "rgba(240,232,216,0.25)", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: `${gold}44`, display: "inline-block" }} />QR code et NFC inclus sur le support.
            </span>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer style={{ position: "relative", zIndex: 10, borderTop: "1px solid rgba(201,169,110,0.08)", padding: "24px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <img src="/ekko-logo.png" alt="EKKO" style={{ height: 32, mixBlendMode: "screen" }} />
        <p style={{ fontFamily: font, fontSize: 11, color: "rgba(240,232,216,0.25)" }}>© 2025 EKKO. Tous droits réservés.</p>
      </footer>

      <style>{`
        @media (max-width: 760px) {
          .two-col-grid, .avant-grid { grid-template-columns: 1fr !important; }
          .usage-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .section1-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .section1-video { align-items: center !important; }
          .nav-links { gap: 12px !important; }
          .nav-links a { font-size: 9px !important; }
        }
        @media (max-width: 540px) {
          .nav-links { display: none !important; }
          .usage-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .usage-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
