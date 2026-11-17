"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import SmartOptionShowcase from "./SmartOptionShowcase";

const SmartScene3D = dynamic(() => import("./SmartScene3D"), { ssr: false });

interface SmartOptionModalProps {
  accent: string;
  audioCount: number;
  variant: "numerique" | "porteClef";
  onContinueWithoutOption: () => void;
  onActivateSmartOption: (config: {
    storageOption: 0 | 100 | 200;
    engraveName?: string;
    format?: string;
    engravingFont?: string;
    nfcEnabled?: boolean;
  }) => Promise<void>;
  onOpenKeychainCustomizer?: () => void;
  initialFormat?: string;
}

const KEYCHAIN_FORMATS = [
  { id: "etiquette-rect", name: "Rectangulaire · 50×30 mm", maxLen: 18 },
  { id: "etiquette-arrondie", name: "Arrondie · 50,8×31,8 mm", maxLen: 10 },
  { id: "carre", name: "Carré · 40×40 mm", maxLen: 18 },
];

const KEYCHAIN_FONTS = [
  { label: "Classique", family: "Georgia, serif" },
  { label: "Romain", family: "'Cinzel', serif" },
  { label: "Cursif", family: "'Dancing Script', cursive" },
  { label: "Bold", family: "'Bebas Neue', sans-serif" },
  { label: "Arrondi", family: "'Pacifico', cursive" },
];

export default function SmartOptionModal({
  accent,
  audioCount,
  variant,
  onContinueWithoutOption,
  onActivateSmartOption,
  onOpenKeychainCustomizer,
  initialFormat,
}: SmartOptionModalProps) {
  const [step, setStep] = useState<"choice" | "configure">("choice");
  const [storageOption, setStorageOption] = useState<0 | 100 | 200>(0);
  const [format, setFormat] = useState(initialFormat || "etiquette-rect");
  const [engraveName, setEngraveName] = useState("");
  const [engravingFont, setEngravingFont] = useState("Georgia, serif");
  const [nfcEnabled, setNfcEnabled] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isPorteClef = variant === "porteClef";
  const basePriceCents = isPorteClef ? (nfcEnabled ? 2790 : 2490) : 999 + storageOption;
  const totalCents = basePriceCents + 300; // +3,00 € TTC Souvenirs intelligents
  const totalFormatted = (totalCents / 100).toFixed(2).replace(".", ",") + " €";

  const canPay =
    consentChecked &&
    !submitting &&
    (!isPorteClef || engraveName.trim().length > 0);

  const handleConfirmPay = async () => {
    if (!canPay) return;
    setSubmitting(true);
    try {
      await onActivateSmartOption({
        storageOption: isPorteClef ? 200 : storageOption,
        ...(isPorteClef
          ? {
              engraveName: engraveName.trim(),
              format,
              engravingFont,
              nfcEnabled,
            }
          : {}),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ maxWidth: 470, margin: "44px auto 64px", padding: "0 16px" }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* 1. Bandeau du nombre d'audios importés (descendu et bien espacé) */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "10px 22px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.035)",
            border: "1px solid rgba(255,255,255,0.1)",
            marginBottom: 32,
          }}
        >
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: "#45d483",
              boxShadow: "0 0 10px #45d483",
            }}
          />
          <span style={{ fontFamily: "Georgia, serif", fontSize: 14, color: "#f0e8d8" }}>
            Vous avez importé <strong style={{ color: accent, fontSize: 15.5 }}>{audioCount}</strong> audio{audioCount > 1 ? "s" : ""}
          </span>
        </div>

        {/* 2. Badge de l'option + Titre bien aéré */}
        <div style={{ textAlign: "center", marginBottom: 42 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 20px",
              borderRadius: 999,
              background: `${accent}14`,
              border: `1px solid ${accent}55`,
              marginBottom: 30,
            }}
          >
            <span style={{ fontFamily: "Georgia, serif", fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", color: accent, fontWeight: 600 }}>
              ✦ Option · Souvenirs intelligents (+3 €)
            </span>
          </div>

          <h2
            style={{
              fontFamily: "Georgia, serif",
              fontWeight: 400,
              fontSize: 31,
              color: "#f0e8d8",
              margin: "0 0 20px",
              lineHeight: 1.32,
            }}
          >
            Ne fouillez plus pendant des heures dans vos vocaux
          </h2>
          <p
            style={{
              fontFamily: "sans-serif",
              fontSize: 14.5,
              color: "rgba(240,232,216,0.6)",
              margin: "0 auto",
              maxWidth: 370,
              lineHeight: 1.65,
            }}
          >
            Découvrez en direct ce que <strong style={{ color: "#f0e8d8", fontWeight: 600 }}>l&apos;option change</strong> pour votre Vocapsule :
          </p>
        </div>

        <div style={{ width: "100%", marginBottom: 36 }}>
          <SmartScene3D />
        </div>

        <SmartOptionShowcase accent={accent} audioCount={audioCount} />

        {/* Mention temps d'analyse (sans mention quasi instantanée) */}
        <div
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "16px 20px",
            borderRadius: 14,
            background: "#120d0e",
            border: "1px solid rgba(255,255,255,0.09)",
            marginBottom: 32,
            textAlign: "center",
          }}
        >
          <p style={{ fontFamily: "sans-serif", fontSize: 13, color: "rgba(240,232,216,0.7)", margin: 0, lineHeight: 1.6 }}>
            ⏱ <strong style={{ color: "#f0e8d8", fontWeight: 600 }}>Analyse rapide</strong> (~15 s pour 1 h de vocaux, jusqu&apos;à ~2 min pour 10 h d&apos;audios) — la recherche de vos mots est ensuite <strong style={{ color: "#f0e8d8", fontWeight: 600 }}>extrêmement rapide</strong>.
          </p>
        </div>

        {step === "choice" ? (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
            <motion.button
              type="button"
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => {
                if (isPorteClef && onOpenKeychainCustomizer) {
                  onOpenKeychainCustomizer();
                } else {
                  setStep("configure");
                }
              }}
              style={{
                width: "100%",
                padding: "16px 20px",
                borderRadius: 16,
                cursor: "pointer",
                background: `linear-gradient(135deg, ${accent}50, ${accent}85)`,
                border: `1px solid ${accent}`,
                color: "#fff",
                fontFamily: "Georgia, serif",
                fontSize: 15,
                fontWeight: 500,
                letterSpacing: "0.03em",
                boxShadow: `0 8px 28px ${accent}30`,
              }}
            >
              Activer Souvenirs intelligents — +3 €
            </motion.button>

            <button
              type="button"
              onClick={onContinueWithoutOption}
              style={{
                width: "100%",
                padding: "14px 20px",
                borderRadius: 16,
                cursor: "pointer",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(240,232,216,0.7)",
                fontFamily: "Georgia, serif",
                fontSize: 14,
              }}
            >
              Continuer sans cette option
            </button>
          </div>
        ) : (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20 }}>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "rgba(240,232,216,0.6)", margin: 0 }}>
              Pour débloquer immédiatement l&apos;analyse IA de votre bibliothèque, configurez votre commande (vous ne paierez rien de plus lors de la validation finale de votre sélection) :
            </p>

            {isPorteClef ? (
              <>
                <div>
                  <label style={{ fontFamily: "Georgia, serif", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(240,232,216,0.45)", display: "block", marginBottom: 6 }}>
                    Format du porte-clé
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {KEYCHAIN_FORMATS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFormat(f.id)}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 10,
                          textAlign: "left",
                          cursor: "pointer",
                          background: format === f.id ? `${accent}18` : "rgba(255,255,255,0.03)",
                          border: `1px solid ${format === f.id ? accent + "60" : "rgba(255,255,255,0.08)"}`,
                          color: "#f0e8d8",
                          fontFamily: "Georgia, serif",
                          fontSize: 13,
                        }}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontFamily: "Georgia, serif", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(240,232,216,0.45)", display: "block", marginBottom: 6 }}>
                    Prénom à graver (modifiable avant validation finale)
                  </label>
                  <input
                    type="text"
                    maxLength={format === "etiquette-arrondie" ? 10 : 18}
                    value={engraveName}
                    onChange={(e) => setEngraveName(e.target.value)}
                    placeholder="Ex. : Maman, Léa, Papi…"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "11px 14px",
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.04)",
                      border: `1px solid ${engraveName.trim() ? accent + "50" : "rgba(255,255,255,0.12)"}`,
                      color: "#f0e8d8",
                      fontFamily: engravingFont,
                      fontSize: 14,
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontFamily: "Georgia, serif", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(240,232,216,0.45)", display: "block", marginBottom: 6 }}>
                    Police de gravure
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {KEYCHAIN_FONTS.map((f) => (
                      <button
                        key={f.family}
                        type="button"
                        onClick={() => setEngravingFont(f.family)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 8,
                          cursor: "pointer",
                          background: engravingFont === f.family ? `${accent}20` : "rgba(255,255,255,0.03)",
                          border: `1px solid ${engravingFont === f.family ? accent + "60" : "rgba(255,255,255,0.08)"}`,
                          color: "#f0e8d8",
                          fontFamily: "Georgia, serif",
                          fontSize: 11,
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontFamily: "Georgia, serif", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(240,232,216,0.45)", display: "block", marginBottom: 6 }}>
                    Accès au porte-clé
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setNfcEnabled(false)}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 10,
                        cursor: "pointer",
                        background: !nfcEnabled ? `${accent}18` : "rgba(255,255,255,0.03)",
                        border: `1px solid ${!nfcEnabled ? accent + "60" : "rgba(255,255,255,0.08)"}`,
                        color: "#f0e8d8",
                        fontFamily: "Georgia, serif",
                        fontSize: 12,
                      }}
                    >
                      QR code gravé · 24,90 €
                    </button>
                    <button
                      type="button"
                      onClick={() => setNfcEnabled(true)}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 10,
                        cursor: "pointer",
                        background: nfcEnabled ? `${accent}18` : "rgba(255,255,255,0.03)",
                        border: `1px solid ${nfcEnabled ? accent + "60" : "rgba(255,255,255,0.08)"}`,
                        color: "#f0e8d8",
                        fontFamily: "Georgia, serif",
                        fontSize: 12,
                      }}
                    >
                      QR + NFC au dos · 27,90 €
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label style={{ fontFamily: "Georgia, serif", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(240,232,216,0.45)", display: "block", marginBottom: 8 }}>
                  Durée de conservation de la Vocapsule
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {([
                    { value: 0 as const, label: "Conservation 7 jours (incluse)", price: "9,99 €" },
                    { value: 100 as const, label: "Conservation 1 an", price: "10,99 € (+1 €)" },
                    { value: 200 as const, label: "Conservation 2 ans", price: "11,99 € (+2 €)" },
                  ]).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setStorageOption(opt.value)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "11px 14px",
                        borderRadius: 10,
                        cursor: "pointer",
                        background: storageOption === opt.value ? `${accent}18` : "rgba(255,255,255,0.03)",
                        border: `1px solid ${storageOption === opt.value ? accent + "60" : "rgba(255,255,255,0.08)"}`,
                        color: "#f0e8d8",
                        fontFamily: "Georgia, serif",
                        fontSize: 13,
                      }}
                    >
                      <span>{opt.label}</span>
                      <span style={{ color: accent }}>{opt.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Récapitulatif détaillé prix incluant +3 € */}
            <div
              style={{
                padding: "16px 18px",
                borderRadius: 14,
                background: "linear-gradient(145deg, rgba(13,10,15,0.82), rgba(201,169,110,0.10))",
                border: `1.5px solid ${accent}55`,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <span style={{ fontFamily: "Georgia, serif", fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: `${accent}cc` }}>
                Récapitulatif
              </span>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "#f0e8d8" }}>
                  {isPorteClef
                    ? `Porte-clé bois (${nfcEnabled ? "QR code + NFC" : "QR code gravé"})`
                    : `Vocapsule numérique (${storageOption === 0 ? "7 jours" : storageOption === 100 ? "1 an" : "2 ans"})`}
                </span>
                <span style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "#f0e8d8", whiteSpace: "nowrap" }}>
                  {(basePriceCents / 100).toFixed(2).replace(".", ",")} €
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "#f0e8d8" }}>
                  Recherche intelligente et chapitres sur Vocapsule
                </span>
                <span style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "#f0e8d8", whiteSpace: "nowrap" }}>
                  3,00 €
                </span>
              </div>
              <div style={{ height: 1, background: `linear-gradient(to right, ${accent}45, rgba(255,255,255,0.08))`, margin: "2px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                <div>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 600, color: "#f0e8d8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Total TTC
                  </span>
                  <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: "rgba(240,232,216,0.45)", margin: "2px 0 0" }}>
                    Paiement unique · Aucun second paiement à la validation
                  </p>
                </div>
                <span style={{ fontFamily: "Georgia, serif", fontSize: 22, color: accent, fontWeight: 600, whiteSpace: "nowrap" }}>
                  {totalFormatted}
                </span>
              </div>
            </div>

            {/* Consentement non précoché */}
            <label
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                cursor: "pointer",
                padding: "12px 14px",
                borderRadius: 12,
                background: consentChecked ? `${accent}0a` : "rgba(255,255,255,0.02)",
                border: `1px solid ${consentChecked ? accent + "40" : "rgba(255,255,255,0.08)"}`,
              }}
            >
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                style={{ accentColor: accent, marginTop: 3 }}
              />
              <span style={{ fontFamily: "Georgia, serif", fontSize: 11, color: "rgba(240,232,216,0.6)", lineHeight: 1.6 }}>
                J&apos;accepte les{" "}
                <a href="/cgv" target="_blank" rel="noopener noreferrer" style={{ color: accent, textDecoration: "underline" }}>
                  CGV
                </a>{" "}
                et demande l&apos;activation immédiate de l&apos;option Souvenirs intelligents après paiement, en renonçant expressément à mon droit de rétractation (art. L.221-28 du Code de la consommation).
              </span>
            </label>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setStep("choice")}
                style={{
                  padding: "13px 18px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(240,232,216,0.6)",
                  fontFamily: "Georgia, serif",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                ← Retour
              </button>
              <motion.button
                type="button"
                whileHover={canPay ? { scale: 1.015 } : {}}
                whileTap={canPay ? { scale: 0.985 } : {}}
                onClick={handleConfirmPay}
                disabled={!canPay}
                style={{
                  flex: 1,
                  padding: "13px 18px",
                  borderRadius: 12,
                  background: canPay ? `linear-gradient(135deg, ${accent}60, ${accent}95)` : "rgba(255,255,255,0.05)",
                  border: `1px solid ${canPay ? accent : "rgba(255,255,255,0.08)"}`,
                  color: canPay ? "#fff" : "rgba(240,232,216,0.3)",
                  fontFamily: "Georgia, serif",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: canPay ? "pointer" : "not-allowed",
                }}
              >
                {submitting ? "Validation de votre commande…" : `Commander ma vocapsule (+ option IA) — ${totalFormatted}`}
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
