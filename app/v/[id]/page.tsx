"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";

const THEME_LABELS: Record<string, string> = {
  deuil: "Mémoire · Deuil",
  amour: "Amour · Lien",
  amitie: "Amitié · Gratitude",
  famille: "Famille · Héritage",
};

export default function VocapsulePage() {
  const params = useParams();
  const id = params?.id as string;

  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [accent, setAccent] = useState("#c9a96e");
  const [theme, setTheme] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/storage/echo?echo_id=${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.audioUrl) {
          setAudioSrc(data.audioUrl);
          if (data.accentColor) setAccent(data.accentColor);
          if (data.theme) setTheme(data.theme);
          if (data.expiresAt) setExpiresAt(data.expiresAt);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true));
  }, [id]);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (isPlaying) { a.pause(); } else { a.play(); }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (s: number) => {
    if (!isFinite(s) || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    return `${m}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
  };

  const daysLeft = expiresAt
    ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (24 * 3600 * 1000)))
    : null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (notFound) {
    return (
      <div style={{
        minHeight: "100dvh", background: "#0d0a0f", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 20, padding: "32px 24px",
      }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.5" style={{ width: 24, height: 24, opacity: 0.6 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
          </svg>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 17, color: "rgba(240,232,216,0.7)", margin: "0 0 8px" }}>
            Écho introuvable
          </p>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "rgba(240,232,216,0.35)", margin: 0, fontStyle: "italic" }}>
            Ce lien a peut-être expiré ou n&apos;existe pas.
          </p>
        </div>
        <a href="/" style={{
          fontFamily: "Georgia, serif", fontSize: 13, color: "#c9a96e",
          textDecoration: "none", padding: "10px 24px", borderRadius: 12,
          border: "1px solid rgba(201,169,110,0.3)", background: "rgba(201,169,110,0.06)",
        }}>
          Découvrir Ekko
        </a>
      </div>
    );
  }

  if (!audioSrc) {
    return (
      <div style={{ minHeight: "100dvh", background: "#0d0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          border: "2px solid rgba(201,169,110,0.15)", borderTop: "2px solid #c9a96e",
          animation: "spin 1s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        body { margin: 0; background: #0d0a0f; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .player-card { animation: fadeIn 0.6s ease both; }
        .play-btn:active { transform: scale(0.93); }
        .action-btn:active { opacity: 0.6; }
      `}</style>

      <div style={{
        minHeight: "100dvh", background: "#0d0a0f",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "env(safe-area-inset-top, 20px) 20px env(safe-area-inset-bottom, 20px)",
        fontFamily: "Georgia, serif",
      }}>

        {/* Logo */}
        <a href="/" style={{ textDecoration: "none", marginBottom: 36 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase", color: `${accent}50`, margin: 0 }}>
            EKKO
          </p>
        </a>

        {/* Card principale */}
        <div className="player-card" style={{
          width: "100%", maxWidth: 400,
          borderRadius: 32, overflow: "hidden",
          background: "rgba(255,255,255,0.025)",
          border: `1px solid ${accent}20`,
          boxShadow: `0 32px 80px rgba(0,0,0,0.7), 0 0 60px ${accent}06`,
        }}>

          {/* Header avec gradient */}
          <div style={{
            padding: "32px 28px 24px",
            background: `linear-gradient(160deg, ${accent}18 0%, ${accent}06 50%, transparent 100%)`,
            borderBottom: `1px solid ${accent}12`,
          }}>
            {theme && (
              <p style={{ fontSize: 9, letterSpacing: "0.45em", textTransform: "uppercase", color: `${accent}70`, margin: "0 0 10px" }}>
                {THEME_LABELS[theme] ?? theme}
              </p>
            )}
            <h1 style={{ fontSize: 24, fontWeight: 300, color: "#f0e8d8", margin: "0 0 6px", lineHeight: 1.2 }}>
              Écho sonore
            </h1>
            <p style={{ fontSize: 13, color: `${accent}60`, margin: 0, fontStyle: "italic" }}>
              Un souvenir vous attend
            </p>
          </div>

          {/* Zone de lecture */}
          <div style={{ padding: "28px 28px 24px" }}>

            {/* Bouton play central — grand pour mobile */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, marginBottom: 28 }}>
              <button
                className="play-btn"
                onClick={togglePlay}
                style={{
                  width: 80, height: 80, borderRadius: "50%", border: "none", cursor: "pointer",
                  background: `linear-gradient(135deg, ${accent}60, ${accent})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 8px 32px ${accent}50`,
                  transition: "transform 0.15s ease",
                  flexShrink: 0,
                }}
              >
                {isPlaying ? (
                  <svg viewBox="0 0 24 24" fill="white" style={{ width: 28, height: 28 }}>
                    <rect x="6" y="4" width="4" height="16" rx="1.5"/>
                    <rect x="14" y="4" width="4" height="16" rx="1.5"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="white" style={{ width: 28, height: 28, marginLeft: 4 }}>
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>

              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 15, color: isPlaying ? "#f0e8d8" : "rgba(240,232,216,0.6)", margin: "0 0 4px", transition: "color 0.3s" }}>
                  {isPlaying ? "En cours de lecture…" : "Appuyer pour écouter"}
                </p>
                <p style={{ fontSize: 12, color: "rgba(240,232,216,0.3)", margin: 0 }}>
                  {formatTime(duration * progress / 100)} · {formatTime(duration)}
                </p>
              </div>
            </div>

            {/* Barre de progression — plus haute pour mobile */}
            <div
              style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.07)", cursor: "pointer", marginBottom: 28, touchAction: "none" }}
              onClick={(e) => {
                const a = audioRef.current;
                if (!a || !duration) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = (e.clientX - rect.left) / rect.width;
                a.currentTime = ratio * duration;
              }}
            >
              <div style={{
                height: "100%", borderRadius: 3,
                background: `linear-gradient(90deg, ${accent}70, ${accent})`,
                width: `${progress}%`, transition: "width 0.1s linear",
              }} />
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10 }}>
              <a
                className="action-btn"
                href={`/api/storage/proxy?echoId=${id}&download=1`}
                download={`echo-ekko-${id.slice(0, 8)}.mp4`}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "13px 0", borderRadius: 14, textDecoration: "none",
                  background: `${accent}14`, border: `1px solid ${accent}30`,
                  fontSize: 13, color: accent, transition: "opacity 0.15s",
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                Télécharger
              </a>
              <button
                className="action-btn"
                onClick={handleCopy}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "13px 0", borderRadius: 14, cursor: "pointer",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
                  fontSize: 13, color: copied ? "#8ac96e" : "rgba(240,232,216,0.45)",
                  transition: "color 0.3s, opacity 0.15s",
                }}
              >
                {copied ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                )}
                {copied ? "Copié !" : "Partager"}
              </button>
            </div>
          </div>

          {/* Footer expiration */}
          {daysLeft !== null && (
            <div style={{
              padding: "14px 28px",
              borderTop: `1px solid ${accent}10`,
              background: "rgba(0,0,0,0.15)",
            }}>
              <p style={{ fontSize: 11, color: daysLeft <= 7 ? "#c96e6e" : "rgba(240,232,216,0.2)", margin: 0, textAlign: "center", letterSpacing: "0.05em" }}>
                {daysLeft === 0 ? "Expire aujourd'hui" : `Disponible encore ${daysLeft} jour${daysLeft > 1 ? "s" : ""}`}
              </p>
            </div>
          )}
        </div>

        <p style={{ marginTop: 32, fontSize: 9, color: "rgba(240,232,216,0.1)", letterSpacing: "0.3em", textTransform: "uppercase" }}>
          Ekko · Mémoires Sonores
        </p>

        <audio
          ref={audioRef}
          src={audioSrc}
          onTimeUpdate={() => {
            const a = audioRef.current;
            if (a && a.duration) setProgress((a.currentTime / a.duration) * 100);
          }}
          onLoadedMetadata={() => { if (audioRef.current) setDuration(audioRef.current.duration); }}
          onEnded={() => setIsPlaying(false)}
        />
      </div>
    </>
  );
}
