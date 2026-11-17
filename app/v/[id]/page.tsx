"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";

interface PlayerBookmark {
  id: string;
  title: string;
  timeSec: number;
  audioId?: string;
  displayOrder?: number;
  color?: string;
}

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
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<PlayerBookmark[]>([]);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const skipBy = (deltaSec: number) => {
    const a = audioRef.current;
    if (!a) return;
    const total = duration || a.duration || 0;
    const next = Math.max(0, Math.min(total > 0 ? total : Infinity, a.currentTime + deltaSec));
    a.currentTime = next;
    if (total > 0) setProgress((next / total) * 100);
  };

  const cyclePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 2];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length] ?? 1;
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const resetHideTimer = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setShowControls(true);
    hideTimerRef.current = setTimeout(() => setShowControls(false), 2000);
  };

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
          if (data.coverUrl) setCoverUrl(data.coverUrl);
          if (Array.isArray(data.bookmarks)) {
            const sorted = [...data.bookmarks].sort((a, b) => Number(a.timeSec) - Number(b.timeSec));
            setBookmarks(sorted);
          }
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true));
  }, [id]);

  useEffect(() => {
    const onPopState = () => {
      if (fullscreen) setFullscreen(false);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [fullscreen]);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (isPlaying) {
      a.pause();
      setShowControls(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    } else {
      a.play();
      if (!fullscreen) {
        try {
          window.history.pushState({ ekkoFullscreen: true }, "");
        } catch {
          // ignore
        }
        setFullscreen(true);
      }
      resetHideTimer();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (s: number) => {
    if (!isFinite(s) || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    return `${m}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
  };

  const currentSec = duration > 0 ? (duration * progress) / 100 : 0;

  const activeBookmarkId = (() => {
    if (bookmarks.length === 0) return null;
    let active: string | null = null;
    for (const bm of bookmarks) {
      if (currentSec + 0.35 >= bm.timeSec) {
        active = bm.id;
      } else {
        break;
      }
    }
    return active;
  })();

  const jumpToBookmark = (timeSec: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, timeSec);
    if (duration > 0) {
      setProgress((Math.max(0, timeSec) / duration) * 100);
    }
    a.play().catch(() => {});
    setIsPlaying(true);
  };

  const daysLeft = expiresAt
    ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (24 * 3600 * 1000)))
    : null;

  const handleShare = async () => {
    const url = window.location.href;
    // Sur mobile, utiliser l'API Web Share native
    if (navigator.share) {
      try {
        await navigator.share({ title: "Vocapsule sonore · VOSEKKO", url });
        return;
      } catch { /* annulé par l'utilisateur */ }
    }
    // Fallback : copier dans le presse-papier
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback iOS ancien : sélection + copie
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
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
            Vocapsule introuvable
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
          Découvrir VOSEKKO
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

        {/* Logo — lien retour site */}
        <a href="/" style={{
          textDecoration: "none", marginBottom: 36,
          padding: "8px 20px", borderRadius: 20,
          background: `${accent}12`, border: `1px solid ${accent}30`,
        }}>
          <p style={{ fontSize: 11, letterSpacing: "0.5em", textTransform: "uppercase", color: accent, margin: 0, fontWeight: 500 }}>
            VOSEKKO
          </p>
        </a>

        {/* Card principale */}
        <div className="player-card" style={{
          width: "100%", maxWidth: 400,
          borderRadius: 32, overflow: "hidden",
          background: "rgba(255,255,255,0.025)",
          border: `1px solid ${accent}20`,
          boxShadow: `0 32px 80px rgba(0,0,0,0.7), 0 0 60px ${accent}06`,
          position: "relative",
        }}>

          {/* Photo souvenir en fond de toute la carte */}
          {coverUrl && (
            <>
              <img
                src={coverUrl}
                alt="Photo souvenir"
                style={{
                  position: "absolute", inset: 0, width: "100%", height: "100%",
                  objectFit: "cover", objectPosition: "center", display: "block",
                }}
              />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to bottom, rgba(13,10,15,0.45) 0%, rgba(13,10,15,0.82) 60%, rgba(13,10,15,0.92) 100%)",
              }} />
            </>
          )}

          {/* Header */}
          <div style={{
            padding: "32px 28px 24px",
            background: coverUrl
              ? "transparent"
              : `linear-gradient(160deg, ${accent}18 0%, ${accent}06 50%, transparent 100%)`,
            borderBottom: `1px solid ${accent}12`,
            position: "relative",
          }}>
            <div style={{ position: "relative", zIndex: 1 }}>
              {theme && (
                <p style={{ fontSize: 9, letterSpacing: "0.45em", textTransform: "uppercase", color: `${accent}`, margin: "0 0 10px" }}>
                  {THEME_LABELS[theme] ?? theme}
                </p>
              )}
              <h1 style={{ fontSize: 24, fontWeight: 300, color: "#f0e8d8", margin: "0 0 6px", lineHeight: 1.2 }}>
                Vocapsule sonore
              </h1>
              <p style={{ fontSize: 13, color: `${accent}`, margin: 0, fontStyle: "italic" }}>
                Un souvenir vous attend
              </p>
            </div>
          </div>

          {/* Zone de lecture */}
          <div style={{ padding: "28px 28px 24px", position: "relative", zIndex: 1 }}>

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
                <p style={{ fontSize: 15, color: isPlaying ? "#f0e8d8" : "rgba(240,232,216,0.9)", margin: "0 0 4px", transition: "color 0.3s" }}>
                  {isPlaying ? "En cours de lecture…" : "Appuyer pour écouter"}
                </p>
                <p style={{ fontSize: 12, color: "rgba(240,232,216,0.7)", margin: 0 }}>
                  {formatTime(duration * progress / 100)} · {formatTime(duration)}
                </p>
              </div>
            </div>

            {/* Barre de progression — curseur glissable tactile/souris + repères des marque-pages */}
            <div
              style={{ position: "relative", height: 26, display: "flex", alignItems: "center", cursor: "pointer", marginBottom: 14, touchAction: "none" }}
              onClick={(e) => {
                const a = audioRef.current;
                if (!a || !duration) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                a.currentTime = ratio * duration;
                setProgress(ratio * 100);
              }}
            >
              <div style={{ position: "relative", width: "100%", height: 6, borderRadius: 999, background: "rgba(255,255,255,0.12)" }}>
                <div style={{
                  height: "100%", borderRadius: 999,
                  background: `linear-gradient(90deg, ${accent}70, ${accent})`,
                  width: `${progress}%`,
                }} />
                {/* Curseur rond visible pour avancer / reculer librement */}
                <span
                  style={{
                    position: "absolute",
                    left: `${progress}%`,
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: "#f0e8d8",
                    border: `2px solid ${accent}`,
                    boxShadow: `0 0 10px ${accent}`,
                    pointerEvents: "none",
                    zIndex: 2,
                  }}
                />
              </div>
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={duration > 0 ? (duration * progress) / 100 : 0}
                onChange={(e) => {
                  const a = audioRef.current;
                  const val = Number(e.target.value);
                  if (a && duration > 0) {
                    a.currentTime = val;
                    setProgress((val / duration) * 100);
                  }
                }}
                aria-label="Position de lecture"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  opacity: 0,
                  cursor: "pointer",
                  margin: 0,
                  zIndex: 2,
                }}
              />
              {duration > 0 && bookmarks.map((bm) => {
                const pct = Math.min(99, Math.max(1, (bm.timeSec / duration) * 100));
                const isActive = activeBookmarkId === bm.id;
                const bmColor = bm.color || accent;
                return (
                  <button
                    key={bm.id}
                    type="button"
                    title={`${bm.title} (${formatTime(bm.timeSec)})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      jumpToBookmark(bm.timeSec);
                    }}
                    style={{
                      position: "absolute",
                      left: `${pct}%`,
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      width: 22,
                      height: 24,
                      background: "transparent",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 3,
                    }}
                  >
                    <span
                      style={{
                        width: isActive ? 6 : 4,
                        height: isActive ? 15 : 12,
                        borderRadius: 3,
                        background: isActive ? "#ffffff" : bmColor,
                        boxShadow: `0 0 8px ${bmColor}`,
                        transition: "all 0.2s",
                      }}
                    />
                  </button>
                );
              })}
            </div>

            {/* Contrôles d'avance rapide (-15s / +15s) et de vitesse de lecture (1x / 1.25x / 1.5x / 2x) */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 24 }}>
              <button
                type="button"
                onClick={() => skipBy(-15)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  color: "#f0e8d8",
                  fontFamily: "sans-serif",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                ↺ -15 s
              </button>
              <button
                type="button"
                onClick={cyclePlaybackRate}
                title="Changer la vitesse de lecture"
                style={{
                  padding: "6px 14px",
                  borderRadius: 999,
                  background: playbackRate !== 1 ? `${accent}28` : "rgba(255,255,255,0.06)",
                  border: `1px solid ${playbackRate !== 1 ? accent : "rgba(255,255,255,0.14)"}`,
                  color: playbackRate !== 1 ? accent : "#f0e8d8",
                  fontFamily: "sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Vitesse {playbackRate}×
              </button>
              <button
                type="button"
                onClick={() => skipBy(15)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  color: "#f0e8d8",
                  fontFamily: "sans-serif",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                +15 s ↻
              </button>
            </div>

            {/* Section Mes marque-pages (affichée uniquement lorsqu'il y a des marque-pages) */}
            {bookmarks.length > 0 && (
              <div style={{
                marginBottom: 24,
                padding: "14px 14px",
                borderRadius: 16,
                background: "rgba(13,10,15,0.65)",
                border: `1px solid ${accent}28`,
              }}>
                <p style={{
                  fontSize: 10,
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: accent,
                  margin: "0 0 10px",
                }}>
                  ✦ Mes marque-pages
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 190, overflowY: "auto" }}>
                  {bookmarks.map((bm) => {
                    const isActive = activeBookmarkId === bm.id;
                    const bmColor = bm.color || accent;
                    return (
                      <button
                        key={bm.id}
                        type="button"
                        onClick={() => jumpToBookmark(bm.timeSec)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 10,
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: 11,
                          cursor: "pointer",
                          textAlign: "left",
                          background: isActive ? `${bmColor}22` : "rgba(255,255,255,0.04)",
                          border: `1px solid ${isActive ? bmColor : bmColor + "45"}`,
                          color: "#f0e8d8",
                          fontFamily: "Georgia, serif",
                          transition: "all 0.2s",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0, flex: 1 }}>
                          <span
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              background: bmColor,
                              boxShadow: `0 0 8px ${bmColor}`,
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {isActive ? "▶ " : ""}{bm.title}
                          </span>
                        </span>
                        <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: bmColor, flexShrink: 0 }}>
                          {formatTime(bm.timeSec)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 10 }}>
              <a
                className="action-btn"
                href={`/api/storage/proxy?echoId=${id}&download=1`}
                download={`vosekko-${id.slice(0, 8)}.mp4`}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "14px 0", borderRadius: 14, textDecoration: "none",
                  background: `${accent}25`, border: `1px solid ${accent}50`,
                  fontSize: 14, fontWeight: 500, color: accent, transition: "opacity 0.15s",
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                Télécharger
              </a>
              <button
                className="action-btn"
                onClick={handleShare}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "14px 0", borderRadius: 14, cursor: "pointer",
                  background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)",
                  fontSize: 14, fontWeight: 500, color: copied ? "#8ac96e" : "#f0e8d8",
                  transition: "color 0.3s, opacity 0.15s",
                }}
              >
                {copied ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
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
              <p style={{ fontSize: 11, color: daysLeft <= 7 ? "#c96e6e" : "rgba(240,232,216,0.7)", margin: 0, textAlign: "center", letterSpacing: "0.05em" }}>
                {daysLeft === 0 ? "Expire aujourd'hui" : `Disponible encore ${daysLeft} jour${daysLeft > 1 ? "s" : ""}`}
              </p>
            </div>
          )}
        </div>

        <p style={{ marginTop: 32, fontSize: 9, color: "rgba(240,232,216,0.4)", letterSpacing: "0.3em", textTransform: "uppercase" }}>
          VOSEKKO · Mémoires Sonores
        </p>

        {/* Mode plein écran immersif */}
        {fullscreen && (
          <div
            onClick={togglePlay}
            style={{
              position: "fixed", inset: 0, zIndex: 9999,
              background: "#0d0a0f",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {coverUrl && (
              <>
                <img src={coverUrl} alt="Photo souvenir" style={{
                  position: "absolute", inset: 0, width: "100%", height: "100%",
                  objectFit: "contain", objectPosition: "center", display: "block",
                }} />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "radial-gradient(ellipse at center, rgba(13,10,15,0.2) 0%, rgba(13,10,15,0.7) 100%)",
                }} />
              </>
            )}

            {/* Bouton fermer */}
            <button
              onClick={(e) => { e.stopPropagation(); setFullscreen(false); }}
              style={{
                position: "absolute", top: 20, right: 20, zIndex: 2,
                width: 44, height: 44, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer",
                background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#f0e8d8",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 20, height: 20 }}>
                <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>

            {/* Lien retour site */}
            <a
              href="/"
              style={{
                position: "absolute", bottom: 56, zIndex: 2,
                padding: "10px 24px", borderRadius: 20,
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
                color: "#f0e8d8", fontSize: 13, fontFamily: "Georgia, serif",
                textDecoration: "none", letterSpacing: "0.05em",
              }}
            >
              Découvrir VOSEKKO
            </a>

            {/* Contrôles — masqués après 2s, réapparaissent au toucher */}
            <div
              style={{
                position: "relative", zIndex: 1,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 32,
                width: "100%", maxWidth: 360, padding: "0 28px",
                opacity: showControls ? 1 : 0,
                transition: "opacity 0.4s ease",
                pointerEvents: showControls ? "auto" : "none",
              }}
            >
              {/* Icône play/pause — sans fond ni contour */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                {isPlaying ? (
                  <svg viewBox="0 0 24 24" fill="white" style={{ width: 56, height: 56, filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.8))" }}>
                    <rect x="6" y="4" width="4" height="16" rx="1.5"/>
                    <rect x="14" y="4" width="4" height="16" rx="1.5"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="white" style={{ width: 56, height: 56, marginLeft: 6, filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.8))" }}>
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </div>

              <div style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "rgba(240,232,216,0.8)", fontFamily: "Georgia, serif" }}>
                    {formatTime(duration * progress / 100)}
                  </span>
                  <span style={{ fontSize: 12, color: "rgba(240,232,216,0.8)", fontFamily: "Georgia, serif" }}>
                    {formatTime(duration)}
                  </span>
                </div>
                <div
                  style={{ position: "relative", height: 26, display: "flex", alignItems: "center", cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const a = audioRef.current;
                    if (!a || !duration) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    a.currentTime = ratio * duration;
                    setProgress(ratio * 100);
                    resetHideTimer();
                  }}
                >
                  <div style={{ position: "relative", width: "100%", height: 6, borderRadius: 999, background: "rgba(255,255,255,0.2)" }}>
                    <div style={{ height: "100%", borderRadius: 999, background: `linear-gradient(90deg, ${accent}80, ${accent})`, width: `${progress}%` }} />
                    <span
                      style={{
                        position: "absolute",
                        left: `${progress}%`,
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        background: "#f0e8d8",
                        border: `2px solid ${accent}`,
                        boxShadow: `0 0 10px ${accent}`,
                        pointerEvents: "none",
                        zIndex: 2,
                      }}
                    />
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={0.1}
                    value={duration > 0 ? (duration * progress) / 100 : 0}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      e.stopPropagation();
                      const a = audioRef.current;
                      const val = Number(e.target.value);
                      if (a && duration > 0) {
                        a.currentTime = val;
                        setProgress((val / duration) * 100);
                      }
                      resetHideTimer();
                    }}
                    aria-label="Position de lecture"
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      opacity: 0,
                      cursor: "pointer",
                      margin: 0,
                      zIndex: 2,
                    }}
                  />
                  {duration > 0 && bookmarks.map((bm) => {
                    const pct = Math.min(99, Math.max(1, (bm.timeSec / duration) * 100));
                    const isActive = activeBookmarkId === bm.id;
                    const bmColor = bm.color || accent;
                    return (
                      <button
                        key={bm.id}
                        type="button"
                        title={`${bm.title} (${formatTime(bm.timeSec)})`}
                        onClick={(e) => {
                          e.stopPropagation();
                          jumpToBookmark(bm.timeSec);
                          resetHideTimer();
                        }}
                        style={{
                          position: "absolute",
                          left: `${pct}%`,
                          top: "50%",
                          transform: "translate(-50%, -50%)",
                          width: 22,
                          height: 24,
                          background: "transparent",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 3,
                        }}
                      >
                        <span
                          style={{
                            width: isActive ? 6 : 4,
                            height: isActive ? 15 : 12,
                            borderRadius: 3,
                            background: isActive ? "#ffffff" : bmColor,
                            boxShadow: `0 0 8px ${bmColor}`,
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 12 }}
                >
                  <button
                    type="button"
                    onClick={() => { skipBy(-15); resetHideTimer(); }}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 999,
                      background: "rgba(0,0,0,0.55)",
                      border: "1px solid rgba(255,255,255,0.22)",
                      color: "#f0e8d8",
                      fontFamily: "sans-serif",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    ↺ -15 s
                  </button>
                  <button
                    type="button"
                    onClick={() => { cyclePlaybackRate(); resetHideTimer(); }}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 999,
                      background: playbackRate !== 1 ? `${accent}35` : "rgba(0,0,0,0.55)",
                      border: `1px solid ${playbackRate !== 1 ? accent : "rgba(255,255,255,0.22)"}`,
                      color: playbackRate !== 1 ? accent : "#f0e8d8",
                      fontFamily: "sans-serif",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Vitesse {playbackRate}×
                  </button>
                  <button
                    type="button"
                    onClick={() => { skipBy(15); resetHideTimer(); }}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 999,
                      background: "rgba(0,0,0,0.55)",
                      border: "1px solid rgba(255,255,255,0.22)",
                      color: "#f0e8d8",
                      fontFamily: "sans-serif",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    +15 s ↻
                  </button>
                </div>
                {bookmarks.length > 0 && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxHeight: 140, overflowY: "auto" }}
                  >
                    {bookmarks.map((bm) => {
                      const bmColor = bm.color || accent;
                      const isActive = activeBookmarkId === bm.id;
                      return (
                        <button
                          key={bm.id}
                          type="button"
                          onClick={() => {
                            jumpToBookmark(bm.timeSec);
                            resetHideTimer();
                          }}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "6px 11px",
                            borderRadius: 999,
                            background: isActive ? `${bmColor}30` : "rgba(0,0,0,0.55)",
                            border: `1px solid ${bmColor}`,
                            color: "#f0e8d8",
                            fontFamily: "Georgia, serif",
                            fontSize: 11.5,
                            cursor: "pointer",
                          }}
                        >
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: bmColor }} />
                          <span>{bm.title}</span>
                          <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color: bmColor }}>
                            {formatTime(bm.timeSec)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <p style={{ position: "absolute", bottom: 20, fontSize: 9, letterSpacing: "0.4em", color: "rgba(240,232,216,0.4)", textTransform: "uppercase", fontFamily: "Georgia, serif" }}>
              VOSEKKO · Mémoire sonore
            </p>
          </div>
        )}

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
