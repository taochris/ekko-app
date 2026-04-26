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
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const MobileImport = dynamic(() => import("./MobileImport"), { ssr: false });

interface MobileLandingProps {
  config: { accent: string; accentDim: string; label: string };
  onAudiosImported: (files: File[]) => void;
}

export default function MobileLanding({ config, onAudiosImported }: MobileLandingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-lg mx-auto pt-8 px-4"
    >
      <MobileImport
        config={config}
        onAudiosImported={onAudiosImported}
        onClose={() => {}}
      />
    </motion.div>
  );
}
