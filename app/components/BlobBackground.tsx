"use client";
import { motion } from "framer-motion";

interface BlobBackgroundProps {
  variant?: "home" | "deuil" | "amitie" | "amour";
}

const variants = {
  home: {
    blob1: "rgba(42, 20, 8, 0.8)",
    blob2: "rgba(26, 15, 30, 0.9)",
    blob3: "rgba(20, 10, 5, 0.7)",
    center: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(80, 40, 10, 0.35) 0%, transparent 70%)",
  },
  deuil: {
    blob1: "rgba(5, 20, 35, 0.9)",
    blob2: "rgba(10, 30, 20, 0.8)",
    blob3: "rgba(5, 15, 40, 0.7)",
    center: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(10, 40, 60, 0.4) 0%, transparent 70%)",
  },
  amitie: {
    blob1: "rgba(40, 25, 5, 0.9)",
    blob2: "rgba(50, 20, 5, 0.8)",
    blob3: "rgba(35, 15, 3, 0.7)",
    center: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(80, 45, 10, 0.4) 0%, transparent 70%)",
  },
  amour: {
    blob1: "rgba(35, 5, 15, 0.9)",
    blob2: "rgba(30, 8, 20, 0.8)",
    blob3: "rgba(25, 5, 10, 0.7)",
    center: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(70, 15, 30, 0.4) 0%, transparent 70%)",
  },
};

export default function BlobBackground({ variant = "home" }: BlobBackgroundProps) {
  const v = variants[variant];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Deep base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #0d0a0f 0%, #1a0f0a 40%, #0f0a1a 70%, #0d0a0f 100%)",
        }}
      />

      {/* Central halo */}
      <div
        className="absolute inset-0"
        style={{ background: v.center }}
      />

      {/* Animated blobs */}
      <motion.div
        className="absolute blob-1"
        style={{
          width: "60vw",
          height: "60vw",
          top: "-10%",
          left: "-15%",
          background: `radial-gradient(circle, ${v.blob1} 0%, transparent 70%)`,
          filter: "blur(60px)",
        }}
        animate={{
          scale: [1, 1.08, 1],
          x: [0, 20, 0],
          y: [0, -15, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute blob-2"
        style={{
          width: "55vw",
          height: "55vw",
          bottom: "-10%",
          right: "-10%",
          background: `radial-gradient(circle, ${v.blob2} 0%, transparent 70%)`,
          filter: "blur(70px)",
        }}
        animate={{
          scale: [1, 1.1, 1],
          x: [0, -25, 0],
          y: [0, 20, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <motion.div
        className="absolute blob-3"
        style={{
          width: "40vw",
          height: "40vw",
          top: "30%",
          left: "40%",
          background: `radial-gradient(circle, ${v.blob3} 0%, transparent 70%)`,
          filter: "blur(50px)",
        }}
        animate={{
          scale: [1, 1.15, 1],
          x: [0, 15, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />

      {/* Subtle horizontal line / horizon */}
      <div
        className="absolute left-0 right-0"
        style={{
          top: "55%",
          height: "1px",
          background: "linear-gradient(90deg, transparent 0%, rgba(201, 169, 110, 0.06) 30%, rgba(201, 169, 110, 0.12) 50%, rgba(201, 169, 110, 0.06) 70%, transparent 100%)",
        }}
      />
    </div>
  );
}
