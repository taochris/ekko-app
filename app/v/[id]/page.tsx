"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";

export default function VocapsulePage() {
  const params = useParams();
  const id = params?.id as string;

  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [accent, setAccent] = useState("#c9a96e");
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!id) return;
    try {
      const raw = localStorage.getItem(`ekko_v_${id}`);
      if (!raw) { setNotFound(true); return; }
      const { b64, theme } = JSON.parse(raw);
      if (theme) setAccent(theme);
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: "audio/wav" });
      setAudioSrc(URL.createObjectURL(blob));
    } catch {
      setNotFound(true);
    }
  }, [id]);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (isPlaying) { a.pause(); } else { a.play(); }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (s: number) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    return `${m}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
  };

  if (notFound) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0d0a0f", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 16, padding: 32,
      }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.5" style={{ width: 40, height: 40, opacity: 0.4 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p style={{ fontFamily: "Georgia, serif", fontSize: 15, color: "rgba(240,232,216,0.5)", textAlign: "center" }}>
          Cette vocapsule est introuvable ou a expiré.
        </p>
        <a href="/" style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "#c9a96e", textDecoration: "none", opacity: 0.7 }}>
          ← Retour à Ekko
        </a>
      </div>
    );
  }

  if (!audioSrc) {
    return (
      <div style={{ minHeight: "100vh", background: "#0d0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          border: "2px solid rgba(201,169,110,0.2)", borderTop: "2px solid #c9a96e",
          animation: "spin 1s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#0d0a0f",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "32px 20px", fontFamily: "Georgia, serif",
    }}>
      {/* Logo */}
      <a href="/" style={{ textDecoration: "none", marginBottom: 48 }}>
        <p style={{ fontSize: 11, letterSpacing: "0.45em", textTransform: "uppercase", color: `${accent}60`, margin: 0 }}>
          EKKO
        </p>
      </a>

      {/* Card player */}
      <div style={{
        width: "100%", maxWidth: 380,
        borderRadius: 28, overflow: "hidden",
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${accent}25`,
        boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${accent}08`,
      }}>
        {/* Header */}
        <div style={{
          padding: "28px 28px 20px",
          background: `linear-gradient(160deg, ${accent}14 0%, transparent 60%)`,
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}>
          <p style={{ fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase", color: `${accent}80`, margin: "0 0 8px" }}>
            Vocapsule audio
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 300, color: "#f0e8d8", margin: 0 }}>
            Souvenir partagé
          </h1>
        </div>

        {/* Waveform / play area */}
        <div style={{ padding: "24px 28px" }}>
          {/* Big play button */}
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 20 }}>
            <button
              onClick={togglePlay}
              style={{
                width: 52, height: 52, borderRadius: "50%", border: "none", cursor: "pointer",
                background: `linear-gradient(135deg, ${accent}50, ${accent}90)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 4px 20px ${accent}40`,
                flexShrink: 0,
              }}
            >
              {isPlaying ? (
                <svg viewBox="0 0 24 24" fill="white" style={{ width: 20, height: 20 }}>
                  <rect x="6" y="4" width="4" height="16" rx="1"/>
                  <rect x="14" y="4" width="4" height="16" rx="1"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="white" style={{ width: 20, height: 20, marginLeft: 3 }}>
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, color: "rgba(240,232,216,0.8)", margin: "0 0 2px" }}>
                {isPlaying ? "En cours de lecture…" : "Appuyez pour écouter"}
              </p>
              <p style={{ fontSize: 11, color: "rgba(240,232,216,0.3)", margin: 0 }}>
                {formatTime(duration * progress / 100)} · {formatTime(duration)}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div
            style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)", cursor: "pointer", marginBottom: 20 }}
            onClick={(e) => {
              const a = audioRef.current;
              if (!a || !duration) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = (e.clientX - rect.left) / rect.width;
              a.currentTime = ratio * duration;
            }}
          >
            <div style={{
              height: "100%", borderRadius: 2,
              background: `linear-gradient(90deg, ${accent}80, ${accent})`,
              width: `${progress}%`, transition: "width 0.1s linear",
            }} />
          </div>

          {/* Download */}
          <a
            href={audioSrc}
            download="vocapsule-ekko.wav"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "10px 0", borderRadius: 12, textDecoration: "none",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              fontSize: 12, color: "rgba(240,232,216,0.5)",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Télécharger
          </a>
        </div>
      </div>

      <p style={{ marginTop: 32, fontSize: 10, color: "rgba(240,232,216,0.15)", letterSpacing: "0.2em" }}>
        EKKO · MÉMOIRES SONORES
      </p>

      {/* Hidden audio element */}
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
  );
}
