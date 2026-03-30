"use client";
import { motion } from "framer-motion";
import Link from "next/link";

interface EkkoLogoProps {
  size?: "sm" | "md" | "lg";
  glow?: boolean;
}

export default function EkkoLogo({ size = "md", glow = true }: EkkoLogoProps) {
  const sizes = {
    sm: "text-2xl tracking-[0.3em]",
    md: "text-4xl tracking-[0.35em]",
    lg: "text-6xl tracking-[0.4em]",
  };

  return (
    <Link href="/" className="inline-block group">
      <motion.div
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-start"
      >
        <span
          className={`ekko-title font-bold ${sizes[size]} ${
            glow ? "glow-gold" : ""
          } bg-gradient-to-r from-[#c9a96e] via-[#e8d5a3] to-[#c9a96e] bg-clip-text text-transparent`}
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          EKKO
        </span>
        <span
          className="text-[0.55rem] tracking-[0.45em] text-[#c9a96e]/60 uppercase mt-0.5"
          style={{ fontFamily: "Georgia, serif", letterSpacing: "0.45em" }}
        >
          mémoire sonore
        </span>
      </motion.div>
    </Link>
  );
}
