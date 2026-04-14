"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface AudioSelectorProps {
  audios: File[];
  config: { accent: string; accentDim: string };
  onSelect: (files: File[]) => void;
  onVocapsule: () => void;
  onLivre: () => void;
  ctaVocapsule: string;
  ctaLivre: string;
  showLivre?: boolean;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function extractDateKey(file: File): string {
  const m = file.name.match(/(\d{4})[-_.](\d{2})[-_.](\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  if (file.lastModified) {
    const d = new Date(file.lastModified);
    return d.toISOString().slice(0, 10);
  }
  return "";
}

function friendlyDate(dateKey: string): string {
  if (!dateKey) return "Date inconnue";
  const d = new Date(dateKey + "T12:00:00");
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function inferSource(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.includes("whatsapp") || lower.includes("wa_")) return "WhatsApp";
  if (lower.includes("instagram") || lower.includes("ig_")) return "Instagram";
  if (lower.includes("telegram") || lower.includes("tg_")) return "Telegram";
  if (lower.includes("messenger") || lower.includes("fb_")) return "Messenger";
  return "Audio";
}

const sourceColors: Record<string, string> = {
  WhatsApp: "#25d366",
  Instagram: "#e1306c",
  Telegram: "#2aabee",
  Messenger: "#0084ff",
  Audio: "#c9a96e",
};

export default function AudioSelector({
  audios, config, onSelect, onVocapsule, onLivre, ctaVocapsule, ctaLivre, showLivre = true,
}: AudioSelectorProps) {
  const [selected, setSelected] = useState<Set<number>>(
    new Set(Array.from({ length: audios.length }, (_, i) => i))
  );
  const [filterSource, setFilterSource] = useState("all");

  useEffect(() => {
    onSelect(audios);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [durations, setDurations] = useState<Record<number, number>>({});
  const [audioUrls, setAudioUrls] = useState<Record<number, string>>({});
  const urlsRef = useRef<Record<number, string>>({});

  useEffect(() => {
    const load = async () => {
      const results: Record<number, number> = {};
      for (let i = 0; i < audios.length; i++) {
        try {
          const url = URL.createObjectURL(audios[i]);
          urlsRef.current[i] = url;
          await new Promise<void>((resolve) => {
            const a = new Audio();
            a.preload = "metadata";
            a.onloadedmetadata = () => { results[i] = isFinite(a.duration) ? a.duration : 0; resolve(); };
            a.onerror = () => { results[i] = 0; resolve(); };
            a.src = url;
          });
        } catch { results[i] = 0; }
      }
      setDurations(results);
      setAudioUrls({ ...urlsRef.current });
    };
    if (audios.length > 0) load();
    return () => { Object.values(urlsRef.current).forEach(URL.revokeObjectURL); };
  }, [audios]);

  const sources = useMemo(() => Array.from(new Set(audios.map((f) => inferSource(f.name)))), [audios]);

  // Group by date, sorted desc
  const groups = useMemo(() => {
    const map = new Map<string, { file: File; index: number }[]>();
    audios.forEach((file, index) => {
      if (filterSource !== "all" && inferSource(file.name) !== filterSource) return;
      const key = extractDateKey(file);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push({ file, index });
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => (b || "0").localeCompare(a || "0"))
      .map(([date, items]) => ({ date, items }));
  }, [audios, filterSource]);

  const toggleSelect = (index: number) => {
    const next = new Set(selected);
    next.has(index) ? next.delete(index) : next.add(index);
    setSelected(next);
    onSelect(Array.from(next).map((i) => audios[i]));
  };

  const selectAll = () => {
    const all = new Set(audios.map((_, i) => i).filter(i =>
      filterSource === "all" || inferSource(audios[i].name) === filterSource
    ));
    setSelected(all);
    onSelect(Array.from(all).map((i) => audios[i]));
  };

  const deselectAll = () => { setSelected(new Set()); onSelect([]); };

  const MAX_DURATION = 3600; // 1h
  const WARN_DURATION = 3000; // 50 min

  const totalDuration = Array.from(selected).reduce((s, i) => s + (durations[i] ?? 0), 0);
  const durationPercent = Math.min((totalDuration / MAX_DURATION) * 100, 100);
  const isOverLimit = totalDuration > MAX_DURATION;
  const isNearLimit = !isOverLimit && totalDuration >= WARN_DURATION;

  const durationBarColor = isOverLimit
    ? "#e05580"
    : isNearLimit
    ? "#f0a855"
    : config.accent;

  function formatDurationLong(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}h${m.toString().padStart(2, "0")}m${s.toString().padStart(2, "0")}s`;
    return `${m}m${s.toString().padStart(2, "0")}s`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{ maxWidth: 760, margin: "0 auto", paddingTop: 24 }}
    >
      {/* Header */}
      <p style={{ fontFamily: "Georgia, serif", fontSize: 11, letterSpacing: "0.4em", textTransform: "uppercase", color: `${config.accent}80`, marginBottom: 8 }}>
        Sélection des audios
      </p>
      <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 300, fontSize: 28, color: "#f0e8d8", marginBottom: 6 }}>
        Choisissez vos souvenirs
      </h2>
      <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "rgba(240,232,216,0.4)", marginBottom: 24 }}>
        {audios.length} audio{audios.length > 1 ? "s" : ""} · {selected.size} sélectionné{selected.size > 1 ? "s" : ""}
        {totalDuration > 0 && ` · ${formatDuration(totalDuration)} au total`}
      </p>

      {/* Filter bar */}
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {sources.length > 1 && (
          <>
            {["all", ...sources].map((src) => (
              <button
                key={src}
                onClick={() => setFilterSource(src)}
                style={{
                  fontFamily: "Georgia, serif", fontSize: 11, padding: "5px 14px", borderRadius: 20,
                  background: filterSource === src
                    ? src === "all" ? config.accentDim : `${sourceColors[src]}20`
                    : "rgba(255,255,255,0.04)",
                  border: `1px solid ${filterSource === src
                    ? src === "all" ? config.accent + "50" : sourceColors[src] + "50"
                    : "rgba(255,255,255,0.06)"}`,
                  color: filterSource === src
                    ? src === "all" ? config.accent : sourceColors[src]
                    : "rgba(240,232,216,0.4)",
                  cursor: "pointer",
                }}
              >
                {src === "all" ? "Tous" : src}
              </button>
            ))}
            <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.08)" }} />
          </>
        )}
        <button onClick={selectAll} style={{ fontFamily: "Georgia, serif", fontSize: 11, color: `${config.accent}b0`, background: "none", border: "none", cursor: "pointer" }}>
          Tout sélectionner
        </button>
        <span style={{ color: "rgba(240,232,216,0.15)" }}>·</span>
        <button onClick={deselectAll} style={{ fontFamily: "Georgia, serif", fontSize: 11, color: "rgba(240,232,216,0.3)", background: "none", border: "none", cursor: "pointer" }}>
          Tout désélectionner
        </button>
      </div>

      {/* Cards grouped by date */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24, maxHeight: 520, overflowY: "auto", paddingRight: 4, marginBottom: 20 }}>
        {groups.map(({ date, items }) => (
          <div key={date || "nodate"}>
            {/* Date separator */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.06)" }} />
              <span style={{
                fontFamily: "Georgia, serif", fontSize: 10, letterSpacing: "0.3em",
                textTransform: "uppercase", color: `${config.accent}90`,
              }}>
                {date ? friendlyDate(date) : "Date inconnue"}
              </span>
              <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.06)" }} />
            </div>

            {/* Cards grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
              {items.map(({ file, index }, ci) => {
                const isSelected = selected.has(index);
                const source = inferSource(file.name);
                const srcColor = sourceColors[source] ?? config.accent;
                const ext = file.name.split(".").pop()?.toUpperCase() ?? "";
                const cleanName = file.name.replace(/\.(mp3|wav|ogg|oga|m4a|aac|opus|flac|weba|3gp|amr|mp4|mpeg)$/i, "");
                const dur = durations[index];
                const url = audioUrls[index];

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: ci * 0.04, duration: 0.3 }}
                    style={{
                      borderRadius: 16,
                      padding: "12px 14px 10px",
                      background: isSelected ? `${config.accent}0e` : "rgba(255,255,255,0.04)",
                      border: `1px solid ${isSelected ? config.accent + "35" : "rgba(255,255,255,0.07)"}`,
                      display: "flex", flexDirection: "column", gap: 8,
                      transition: "background 0.2s, border-color 0.2s",
                      cursor: "default",
                    }}
                  >
                    {/* Top row: checkbox + name + badges */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleSelect(index)}
                        style={{
                          width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                          background: isSelected ? config.accent : "transparent",
                          border: `1.5px solid ${isSelected ? config.accent : "rgba(255,255,255,0.2)"}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", padding: 0,
                        }}
                      >
                        {isSelected && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" style={{ width: 9, height: 9 }}>
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>

                      {/* Name + meta */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontFamily: "Georgia, serif", fontSize: 12, margin: 0,
                          color: isSelected ? "#f0e8d8" : "rgba(240,232,216,0.7)",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {cleanName}
                        </p>
                        <div style={{ display: "flex", gap: 5, marginTop: 4, alignItems: "center" }}>
                          <span style={{
                            fontFamily: "Georgia, serif", fontSize: 9, padding: "1px 5px",
                            borderRadius: 4, background: `${srcColor}18`, color: srcColor,
                            letterSpacing: "0.1em",
                          }}>{ext || source}</span>
                          {dur !== undefined && dur > 0 && (
                            <span style={{ fontFamily: "Georgia, serif", fontSize: 10, color: "rgba(240,232,216,0.3)" }}>
                              {formatDuration(dur)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Audio player */}
                    {url ? (
                      <audio
                        src={url}
                        controls
                        style={{ width: "100%", height: 28, borderRadius: 8, accentColor: config.accent }}
                      />
                    ) : (
                      <div style={{
                        height: 28, borderRadius: 8, background: "rgba(255,255,255,0.03)",
                        border: "1px dashed rgba(255,255,255,0.07)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{ fontFamily: "Georgia, serif", fontSize: 10, color: "rgba(240,232,216,0.2)", fontStyle: "italic" }}>
                          chargement…
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Duration bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 8,
        }}>
          <span style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "rgba(240,232,216,0.4)" }}>
            {selected.size} audio{selected.size > 1 ? "s" : ""} sélectionné{selected.size > 1 ? "s" : ""}
          </span>
          <span style={{ fontFamily: "Georgia, serif", fontSize: 12, color: durationBarColor, transition: "color 0.3s" }}>
            {totalDuration > 0 ? formatDurationLong(totalDuration) : "calcul en cours…"}
            <span style={{ color: "rgba(240,232,216,0.2)", marginLeft: 6 }}>/ 1h max</span>
          </span>
        </div>

        {/* Barre de progression */}
        <div style={{
          height: 4, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden",
        }}>
          <motion.div
            animate={{ width: `${durationPercent}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              height: "100%", borderRadius: 4,
              background: durationBarColor,
              boxShadow: isOverLimit ? `0 0 8px ${durationBarColor}80` : "none",
            }}
          />
        </div>

        {/* Messages d'alerte */}
        {isNearLimit && (
          <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: "#f0a855", margin: "8px 0 0", fontStyle: "italic" }}>
            ⚠️ Vous approchez de la limite — moins de 10 minutes restantes.
          </p>
        )}
        {isOverLimit && (
          <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: "#e05580", margin: "8px 0 0", fontStyle: "italic" }}>
            La sélection dépasse 1h. Retirez des audios ou créez plusieurs vocapsules.
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: "grid", gridTemplateColumns: showLivre ? "1fr 1fr" : "1fr", gap: 12 }}>
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { onSelect(Array.from(selected).map(i => audios[i])); onVocapsule(); }}
          disabled={selected.size === 0 || isOverLimit}
          style={{
            padding: "20px 20px", borderRadius: 18, textAlign: "left", cursor: selected.size === 0 || isOverLimit ? "not-allowed" : "pointer",
            background: `linear-gradient(135deg, ${config.accent}20, ${config.accent}40)`,
            border: `1px solid ${config.accent}40`,
            opacity: selected.size === 0 || isOverLimit ? 0.5 : 1,
            boxShadow: `0 8px 30px ${config.accent}15`,
          } as React.CSSProperties}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 22, height: 22, color: config.accent, display: "block", marginBottom: 8 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
          </svg>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 500, color: "#f0e8d8", margin: "0 0 4px" }}>{ctaVocapsule}</p>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: "rgba(240,232,216,0.4)", margin: 0 }}>Fusion audio · MP3 · QR code</p>
        </motion.button>

        {showLivre && (
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { onSelect(Array.from(selected).map(i => audios[i])); onLivre(); }}
            disabled={selected.size === 0}
            style={{
              padding: "20px 20px", borderRadius: 18, textAlign: "left", cursor: selected.size === 0 ? "not-allowed" : "pointer",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              opacity: selected.size === 0 ? 0.5 : 1,
            } as React.CSSProperties}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 22, height: 22, color: "rgba(240,232,216,0.6)", display: "block", marginBottom: 8 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 500, color: "#f0e8d8", margin: "0 0 4px" }}>{ctaLivre}</p>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: "rgba(240,232,216,0.4)", margin: 0 }}>Transcription · texte · téléchargeable</p>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
