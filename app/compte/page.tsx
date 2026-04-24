"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import EkkoLogo from "../components/EkkoLogo";
import BlobBackground from "../components/BlobBackground";
import { useAuth } from "../context/AuthContext";

const accent = "#c9a96e";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 16px", borderRadius: 12, fontSize: 15,
  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,169,110,0.2)",
  color: "#f0e8d8", outline: "none", fontFamily: "Georgia, serif", boxSizing: "border-box",
};

export default function ComptePage() {
  const router = useRouter();
  const { user, isLoading, login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && user) router.push("/account");
  }, [user, isLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = mode === "login"
      ? await login(email, password)
      : await register(name, email, password, phone);
    if (res.ok) {
      router.push("/account");
    } else {
      setError(res.error ?? "Une erreur est survenue.");
    }
    setLoading(false);
  }

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    const res = await loginWithGoogle();
    if (res.ok) {
      router.push("/account");
    } else {
      setError(res.error ?? "Connexion Google échouée.");
    }
    setLoading(false);
  }

  if (isLoading) return null;

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "#0d0a0f" }}>
      <BlobBackground variant="deuil" />

      <nav className="relative z-10 flex items-center justify-between px-8 py-7 md:px-14">
        <EkkoLogo size="md" glow={true} />
        <button
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              router.back();
            } else {
              router.push("/");
            }
          }}
          className="text-sm px-4 py-2 rounded-full ekko-serif transition-all duration-200"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(240,232,216,0.5)" }}
        >
          ← Retour
        </button>
      </nav>

      <div className="relative z-10 px-6 pb-24 max-w-md mx-auto pt-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", color: `${accent}70`, fontFamily: "Georgia, serif", marginBottom: 12 }}>
            {mode === "login" ? "Connexion" : "Créer un compte"}
          </p>
          <h1 style={{ fontSize: 30, fontWeight: 300, color: "#f0e8d8", fontFamily: "Georgia, serif", marginBottom: 6 }}>
            {mode === "login" ? "Bon retour" : "Rejoignez Ekko"}
          </h1>
          <p style={{ fontSize: 14, color: "rgba(240,232,216,0.35)", fontFamily: "Georgia, serif", fontStyle: "italic", marginBottom: 36 }}>
            {mode === "login" ? "Accédez à vos échos sauvegardés." : "Créez votre espace personnel."}
          </p>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 ekko-serif text-sm transition-all duration-200"
            style={{ padding: "12px 20px", borderRadius: 12, border: "1px solid rgba(201,169,110,0.2)", background: "rgba(255,255,255,0.04)", color: "rgba(240,232,216,0.7)", cursor: "pointer", marginBottom: 20 }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuer avec Google
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
            <span style={{ fontSize: 11, color: "rgba(240,232,216,0.25)", fontFamily: "Georgia, serif" }}>ou</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "register" && (
              <>
                <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} type="text" placeholder="Votre prénom" required />
                <input value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} type="tel" placeholder="Téléphone (optionnel)" />
              </>
            )}
            <input value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} type="email" placeholder="Email" required />
            <div style={{ position: "relative" }}>
              <input value={password} onChange={e => setPassword(e.target.value)} style={{ ...inputStyle, paddingRight: 44 }} type={showPassword ? "text" : "password"} placeholder="Mot de passe" required />
              <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(240,232,216,0.4)", padding: 0, display: "flex", alignItems: "center" }}>
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>

            {error && (
              <p style={{ fontSize: 13, color: "#c96e6e", fontFamily: "Georgia, serif", margin: 0 }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="ekko-serif text-sm transition-all duration-200"
              style={{ padding: "13px 20px", borderRadius: 12, border: "none", background: accent, color: "#0d0a0f", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, marginTop: 4 }}
            >
              {loading ? "…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, fontFamily: "Georgia, serif", color: "rgba(240,232,216,0.35)" }}>
            {mode === "login" ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
            <button
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(null); }}
              style={{ background: "none", border: "none", color: accent, cursor: "pointer", fontFamily: "Georgia, serif", fontSize: 13 }}
            >
              {mode === "login" ? "Créer un compte" : "Se connecter"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function VocapsuleList({ accent }: { accent: string }) {
  const [items] = useState(() => {
    if (typeof window === "undefined") return [];
    const result: { id: string; created: number }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("ekko_v_")) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const { created } = JSON.parse(raw);
            result.push({ id: key.replace("ekko_v_", ""), created });
          }
        } catch { /* ignore */ }
      }
    }
    return result.sort((a, b) => b.created - a.created);
  });

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

  if (items.length === 0) {
    return (
      <div style={{
        padding: "40px 32px", borderRadius: 20, textAlign: "center",
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
      }}>
        <svg viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.2" style={{ width: 36, height: 36, opacity: 0.35, margin: "0 auto 16px" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
        <p style={{ fontFamily: "Georgia, serif", fontSize: 14, color: "rgba(240,232,216,0.35)", fontStyle: "italic" }}>
          Aucune vocapsule sauvegardée pour le moment.
        </p>
        <p style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "rgba(240,232,216,0.2)", marginTop: 8 }}>
          Fusionnez des audios et générez un QR code pour les retrouver ici.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={{ fontFamily: "Georgia, serif", fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(240,232,216,0.25)", marginBottom: 4 }}>
        {items.length} vocapsule{items.length > 1 ? "s" : ""} sauvegardée{items.length > 1 ? "s" : ""}
      </p>
      {items.map((item) => (
        <VocapsuleCard key={item.id} id={item.id} created={item.created} accent={accent} formatDate={formatDate} />
      ))}
    </div>
  );
}

function VocapsuleCard({ id, created, accent, formatDate }: {
  id: string; created: number; accent: string; formatDate: (ts: number) => string;
}) {
  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/v/${id}` : `/v/${id}`;

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        padding: "16px 20px", borderRadius: 16,
        background: hovered ? `${accent}0a` : "rgba(255,255,255,0.03)",
        border: `1px solid ${hovered ? accent + "30" : "rgba(255,255,255,0.07)"}`,
        transition: "all 0.2s",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.5" style={{ width: 14, height: 14, opacity: 0.7 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <span style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "#f0e8d8", letterSpacing: "0.05em" }}>
            {id}
          </span>
        </div>
        <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: "rgba(240,232,216,0.3)", margin: 0 }}>
          {formatDate(created)}
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <a
          href={`/v/${id}`}
          style={{
            padding: "6px 12px", borderRadius: 8, textDecoration: "none",
            background: `${accent}18`, border: `1px solid ${accent}30`,
            fontFamily: "Georgia, serif", fontSize: 11, color: accent,
          }}
        >
          Écouter
        </a>
        <button
          onClick={copy}
          style={{
            padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.04)", cursor: "pointer",
            fontFamily: "Georgia, serif", fontSize: 11, color: copied ? accent : "rgba(240,232,216,0.4)",
          }}
        >
          {copied ? "Copié ✓" : "Lien"}
        </button>
      </div>
    </motion.div>
  );
}
