"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

interface AuthModalProps {
  accent: string;
  onSuccess: () => void;
}

export default function AuthModal({ accent, onSuccess }: AuthModalProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = mode === "login"
      ? await login(email, password)
      : await register(name, email, password);
    setLoading(false);
    if (result.ok) {
      onSuccess();
    } else {
      setError(result.error ?? "Une erreur est survenue.");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px", borderRadius: 12,
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    color: "#f0e8d8", fontFamily: "Georgia, serif", fontSize: 14,
    outline: "none", boxSizing: "border-box",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{ maxWidth: 420, margin: "0 auto", paddingTop: 24 }}
    >
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <p style={{
          fontFamily: "Georgia, serif", fontSize: 11, letterSpacing: "0.45em",
          textTransform: "uppercase", color: `${accent}60`, marginBottom: 6,
        }}>
          EKKO
        </p>
        <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 300, fontSize: 28, color: "#f0e8d8", marginBottom: 6 }}>
          {mode === "login" ? "Connexion" : "Créer un compte"}
        </h2>
        <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "rgba(240,232,216,0.35)" }}>
          {mode === "login"
            ? "Accédez à vos vocapsules sauvegardées."
            : "Rejoignez EKKO pour préserver vos souvenirs."}
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <AnimatePresence mode="wait">
          {mode === "register" && (
            <motion.div
              key="name-field"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: "hidden" }}
            >
              <input
                type="text"
                placeholder="Votre prénom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={inputStyle}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <input
          type="email"
          placeholder="Adresse email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />

        <input
          type="password"
          placeholder={mode === "register" ? "Mot de passe (6 caractères min.)" : "Mot de passe"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                fontFamily: "Georgia, serif", fontSize: 12, color: "#ff8888",
                padding: "10px 14px", borderRadius: 10,
                background: "rgba(200,50,50,0.08)", border: "1px solid rgba(200,50,50,0.2)",
                margin: 0,
              }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          type="submit"
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.97 }}
          disabled={loading}
          style={{
            padding: "14px 0", borderRadius: 14, border: "none", cursor: loading ? "not-allowed" : "pointer",
            background: loading
              ? "rgba(255,255,255,0.06)"
              : `linear-gradient(135deg, ${accent}40, ${accent}70)`,
            color: loading ? "rgba(240,232,216,0.3)" : "#f0e8d8",
            fontFamily: "Georgia, serif", fontSize: 15,
            marginTop: 4,
          } as React.CSSProperties}
        >
          {loading ? "…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
        </motion.button>
      </form>

      {/* Switch mode */}
      <p style={{ textAlign: "center", marginTop: 20, fontFamily: "Georgia, serif", fontSize: 12, color: "rgba(240,232,216,0.3)" }}>
        {mode === "login" ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
        <button
          onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: accent, fontFamily: "Georgia, serif", fontSize: 12,
            textDecoration: "underline", textUnderlineOffset: 3,
          }}
        >
          {mode === "login" ? "Créer un compte" : "Se connecter"}
        </button>
      </p>

    </motion.div>
  );
}
