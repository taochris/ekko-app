"use client";
/**
 * MobileLanding.tsx
 * Page d'accueil mobile dédiée — totalement isolée du flux PC.
 *
 * Affiche :
 * 1. Le message "Disponible sur ordinateur" par défaut
 * 2. Le bouton discret "Essayer quand même"
 * 3. Bascule vers <MobileImport /> sur clic
 *
 * Aucune logique métier mobile ne doit vivre en dehors de ce fichier
 * et de MobileImport.tsx.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import MobileImport from "./MobileImport";

interface MobileLandingProps {
  config: { accent: string; accentDim: string; label: string };
  onAudiosImported: (files: File[]) => void;
}

export default function MobileLanding({ config, onAudiosImported }: MobileLandingProps) {
  const [showImport, setShowImport] = useState(false);

  if (showImport) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg mx-auto pt-8 px-4"
      >
        <MobileImport
          config={config}
          onAudiosImported={(files) => {
            setShowImport(false);
            onAudiosImported(files);
          }}
          onClose={() => setShowImport(false)}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-lg mx-auto pt-12 px-6 text-center"
    >
      <div className="text-5xl mb-6">💻</div>
      <h2 className="ekko-serif font-light text-2xl mb-4" style={{ color: "#f0e8d8" }}>
        Disponible sur ordinateur
      </h2>
      <p className="ekko-serif text-sm leading-relaxed mb-8" style={{ color: "rgba(240,232,216,0.55)" }}>
        L&apos;import de vos souvenirs vocaux fonctionne actuellement sur ordinateur (PC ou Mac).
        Certains navigateurs mobiles ne supportent pas encore tous les formats d&apos;import nécessaires.
      </p>
      <div
        className="rounded-2xl px-6 py-5 mb-6"
        style={{ background: "rgba(201,169,110,0.06)", border: "1px solid rgba(201,169,110,0.15)" }}
      >
        <p
          className="ekko-serif text-xs leading-relaxed mobile-info-italic"
          style={{ color: "rgba(240,232,216,0.4)", fontStyle: "italic" }}
        >
          Nos applications iOS et Android sont en cours de développement et arriveront très prochainement.
          En attendant, rendez-vous sur{" "}
          <strong style={{ color: "rgba(240,232,216,0.65)" }}>vosekko.com</strong> depuis votre ordinateur
          pour créer votre vocapsule.
        </p>
      </div>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setShowImport(true)}
        style={{
          width: "100%",
          padding: "14px 0",
          borderRadius: 14,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(240,232,216,0.5)",
          fontFamily: "Georgia, serif",
          fontSize: 13,
          cursor: "pointer",
          letterSpacing: "0.03em",
        }}
      >
        Essayer quand même depuis ce téléphone
      </motion.button>
    </motion.div>
  );
}
