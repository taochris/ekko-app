"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

interface AuthModalProps {
  accent: string;
  onSuccess: () => void;
}

export default function AuthModal({ accent, onSuccess }: AuthModalProps) {
  const { login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    const result = await loginWithGoogle();
    setGoogleLoading(false);
    if (!result.ok) setError(result.error ?? "Erreur Google.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "register" && password !== passwordConfirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    const fullName = mode === "register" ? `${firstName} ${lastName}`.trim() : "";
    const result = mode === "login"
      ? await login(email, password)
      : await register(fullName, email, password);
    setLoading(false);
    if (result.ok) {
      onSuccess();
    } else {
      setError(result.error ?? "Une erreur est survenue.");
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError("");
    setFirstName(""); setLastName(""); setPhone("");
    setPassword(""); setPasswordConfirm("");
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
      <div style={{ textAlign: "center", marginBottom: 28 }}>
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

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <AnimatePresence mode="wait">
          {mode === "register" && (
            <motion.div
              key="register-fields"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: "hidden", display: "flex", flexDirection: "column", gap: 12 }}
            >
              {/* Prénom + Nom */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <input
                  type="text"
                  placeholder="Prénom"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="Nom"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
              {/* Téléphone */}
              <input
                type="tel"
                placeholder="Téléphone (optionnel)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={inputStyle}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email */}
        <input
          type="email"
          placeholder="Adresse email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />

        {/* Mot de passe */}
        <input
          type="password"
          placeholder={mode === "register" ? "Mot de passe (6 caractères min.)" : "Mot de passe"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />

        {/* Confirmation mot de passe (inscription uniquement) */}
        <AnimatePresence>
          {mode === "register" && (
            <motion.div
              key="confirm-pw"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: "hidden" }}
            >
              <input
                type="password"
                placeholder="Confirmer le mot de passe"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                style={inputStyle}
              />
            </motion.div>
          )}
        </AnimatePresence>

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

      {/* Séparateur */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0 16px" }}>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
        <span style={{ fontFamily: "Georgia, serif", fontSize: 11, color: "rgba(240,232,216,0.2)", letterSpacing: "0.15em" }}>ou</span>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
      </div>

      {/* Google */}
      <motion.button
        whileHover={{ scale: googleLoading ? 1 : 1.02 }}
        whileTap={{ scale: googleLoading ? 1 : 0.97 }}
        onClick={handleGoogle}
        disabled={googleLoading}
        style={{
          width: "100%", padding: "13px 0", borderRadius: 14, cursor: googleLoading ? "not-allowed" : "pointer",
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(240,232,216,0.7)", fontFamily: "Georgia, serif", fontSize: 14,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        } as React.CSSProperties}
      >
        {!googleLoading && (
          <svg viewBox="0 0 24 24" style={{ width: 18, height: 18 }} xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )}
        {googleLoading ? "…" : "Continuer avec Google"}
      </motion.button>

      {/* Switch mode */}
      <p style={{ textAlign: "center", marginTop: 20, fontFamily: "Georgia, serif", fontSize: 12, color: "rgba(240,232,216,0.3)" }}>
        {mode === "login" ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
        <button
          onClick={switchMode}
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
