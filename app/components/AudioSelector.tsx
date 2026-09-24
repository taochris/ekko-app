"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);
  return isMobile;
}

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
  const name = file.name;
  // 1. Telegram : audio_N@DD-MM-YYYY_HH-MM-SS.ogg
  const mTg = name.match(/@(\d{2})-(\d{2})-(\d{4})_/);
  if (mTg) return `${mTg[3]}-${mTg[2]}-${mTg[1]}`;
  // 2. WhatsApp : PTT-YYYYMMDD-WA / AUD-YYYYMMDD-WA
  const mWa = name.match(/(?:PTT|AUD)[_\-](\d{4})(\d{2})(\d{2})[_\-]WA/i);
  if (mWa) return `${mWa[1]}-${mWa[2]}-${mWa[3]}`;
  // 3. Format ISO YYYY-MM-DD générique
  const mIso = name.match(/(20\d{2})[-_.](\d{2})[-_.](\d{2})/);
  if (mIso) {
    const month = parseInt(mIso[2]);
    const day = parseInt(mIso[3]);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${mIso[1]}-${mIso[2]}-${mIso[3]}`;
    }
  }
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

function MobileAudioPlayer({ url, accent }: { url: string; accent: string }) {
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLAudioElement>(null);
  const toggle = () => {
    const a = ref.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play().catch(() => {}); setPlaying(true); }
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, height: 28 }}>
      <audio ref={ref} src={url} onEnded={() => setPlaying(false)} preload="none" />
      <button
        onClick={toggle}
        style={{
          width: 28, height: 28, borderRadius: "50%", border: "none", cursor: "pointer",
          background: `${accent}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}
      >
        {playing ? (
          <svg viewBox="0 0 24 24" fill={accent} style={{ width: 10, height: 10 }}>
            <rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill={accent} style={{ width: 10, height: 10, marginLeft: 2 }}>
            <path d="M8 5v14l11-7z"/>
          </svg>
        )}
      </button>
      <span style={{ fontFamily: "Georgia, serif", fontSize: 10, color: `${accent}80` }}>
        {playing ? "en cours…" : "écouter"}
      </span>
    </div>
  );
}

function DropSlot({ accent, active, onDragOver, onDrop }: {
  accent: string; active: boolean; onDragOver: () => void; onDrop: () => void;
}) {
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); onDragOver(); }}
      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onDrop(); }}
      style={{
        height: active ? 38 : 6, borderRadius: 8, margin: "2px 0",
        background: active ? `${accent}15` : "transparent",
        border: `2px dashed ${active ? accent + "60" : "transparent"}`,
        transition: "all 0.15s ease",
        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
      }}
    >
      {active && (
        <span style={{ fontFamily: "Georgia, serif", fontSize: 10, color: accent, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          Déposer ici
        </span>
      )}
    </div>
  );
}

export default function AudioSelector({
  audios, config, onSelect, onVocapsule, onLivre, ctaVocapsule, ctaLivre, showLivre = true,
}: AudioSelectorProps) {
  const [orderedSelected, setOrderedSelected] = useState<number[]>([]);
  const selectedSet = useMemo(() => new Set(orderedSelected), [orderedSelected]);
  const [filterSource, setFilterSource] = useState("all");
  const [durations, setDurations] = useState<Record<number, number>>({});
  const [audioUrls, setAudioUrls] = useState<Record<number, string>>({});
  const urlsRef = useRef<Record<number, string>>({});

  // Drag state
  const [dragging, setDragging] = useState<{ zone: "lib" | "order"; audioIdx: number } | null>(null);
  const [dropPos, setDropPos] = useState<number | null>(null);
  const [zone2Over, setZone2Over] = useState(false);

  useEffect(() => {
    const load = async () => {
      const results: Record<number, number> = {};
      // Charger séquentiellement avec une seule instance Audio réutilisée
      // iOS Safari crashe si on crée trop d'instances HTMLAudioElement en parallèle
      const a = new Audio();
      a.preload = "metadata";
      for (let i = 0; i < audios.length; i++) {
        try {
          const url = URL.createObjectURL(audios[i]);
          urlsRef.current[i] = url;
          await new Promise<void>((resolve) => {
            const onMeta = () => { results[i] = isFinite(a.duration) ? a.duration : 0; cleanup(); resolve(); };
            const onErr = () => { results[i] = 0; cleanup(); resolve(); };
            const onTimeout = () => { results[i] = 0; cleanup(); resolve(); };
            const timer = setTimeout(onTimeout, 4000);
            function cleanup() { clearTimeout(timer); a.onloadedmetadata = null; a.onerror = null; }
            a.onloadedmetadata = onMeta;
            a.onerror = onErr;
            a.src = url;
            a.load();
          });
          // Petite pause entre chaque fichier pour laisser respirer Safari
          await new Promise((r) => setTimeout(r, 50));
        } catch { results[i] = 0; }
      }
      setDurations(results);
      setAudioUrls({ ...urlsRef.current });
    };
    if (audios.length > 0) load();
    return () => { Object.values(urlsRef.current).forEach(URL.revokeObjectURL); };
  }, [audios]);

  const isMobile = useIsMobile();
  const sources = useMemo(() => Array.from(new Set(audios.map((f) => inferSource(f.name)))), [audios]);

  const groups = useMemo(() => {
    const map = new Map<string, { file: File; index: number }[]>();
    audios.forEach((file, index) => {
      if (filterSource !== "all" && inferSource(file.name) !== filterSource) return;
      const key = extractDateKey(file);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push({ file, index });
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => (a || "0").localeCompare(b || "0"))
      .map(([date, items]) => ({ date, items }));
  }, [audios, filterSource]);

  const MAX_DURATION = 3600;
  const WARN_DURATION = 3000;
  const totalDuration = orderedSelected.reduce((s, i) => s + (durations[i] ?? 0), 0);
  const durationPercent = Math.min((totalDuration / MAX_DURATION) * 100, 100);
  const isOverLimit = totalDuration > MAX_DURATION;
  const isNearLimit = !isOverLimit && totalDuration >= WARN_DURATION;
  const durationBarColor = isOverLimit ? "#e05580" : isNearLimit ? "#f0a855" : config.accent;

  function formatDurationLong(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}h${m.toString().padStart(2, "0")}m${s.toString().padStart(2, "0")}s`;
    return `${m}m${s.toString().padStart(2, "0")}s`;
  }

  // ── Drag handlers ──────────────────────────────────────────────────────
  const handleDrop = (targetPos: number) => {
    if (!dragging) return;
    const { zone, audioIdx } = dragging;
    if (zone === "lib") {
      if (selectedSet.has(audioIdx)) { setDragging(null); setDropPos(null); return; }
      const next = [...orderedSelected];
      next.splice(targetPos, 0, audioIdx);
      setOrderedSelected(next);
      onSelect(next.map((i) => audios[i]));
    } else {
      const fromPos = orderedSelected.indexOf(audioIdx);
      if (fromPos === -1) { setDragging(null); setDropPos(null); return; }
      const next = [...orderedSelected];
      next.splice(fromPos, 1);
      const insertAt = targetPos > fromPos ? targetPos - 1 : targetPos;
      next.splice(insertAt, 0, audioIdx);
      setOrderedSelected(next);
      onSelect(next.map((i) => audios[i]));
    }
    setDragging(null);
    setDropPos(null);
    setZone2Over(false);
  };

  const removeFromOrder = (audioIdx: number) => {
    const next = orderedSelected.filter((i) => i !== audioIdx);
    setOrderedSelected(next);
    onSelect(next.map((i) => audios[i]));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{ maxWidth: 760, margin: "0 auto", paddingTop: 24, paddingLeft: 12, paddingRight: 12 }}
    >
      {/* Header */}
      <p style={{ fontFamily: "Georgia, serif", fontSize: 11, letterSpacing: "0.4em", textTransform: "uppercase", color: `${config.accent}80`, marginBottom: 8 }}>
        Sélection des audios
      </p>
      <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 300, fontSize: 28, color: "#f0e8d8", marginBottom: 6 }}>
        Choisissez vos souvenirs
      </h2>
      <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "rgba(240,232,216,0.4)", marginBottom: 24 }}>
        {audios.length} audio{audios.length > 1 ? "s" : ""} · {orderedSelected.length} dans le montage
        {totalDuration > 0 && ` · ${formatDuration(totalDuration)} au total`}
      </p>

      {/* ═══ ZONE 1 — Bibliothèque ═══ */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
          <button
            onClick={() => {
              const visible = groups.flatMap((g) => g.items.map((it) => it.index));
              const toAdd = visible.filter((i) => !selectedSet.has(i));
              if (toAdd.length === 0) return;
              const next = [...orderedSelected, ...toAdd];
              setOrderedSelected(next);
              onSelect(next.map((i) => audios[i]));
            }}
            style={{ fontFamily: "Georgia, serif", fontSize: 11, color: `${config.accent}c0`, background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            Tout sélectionner
          </button>
          <span style={{ color: "rgba(240,232,216,0.15)", fontSize: 12 }}>·</span>
          <button
            onClick={() => { setOrderedSelected([]); onSelect([]); }}
            style={{ fontFamily: "Georgia, serif", fontSize: 11, color: "rgba(240,232,216,0.35)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            Tout désélectionner
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.06)" }} />
          <span style={{ fontFamily: "Georgia, serif", fontSize: 10, letterSpacing: "0.35em", textTransform: "uppercase", color: `${config.accent}70` }}>
            Bibliothèque — {audios.length} fichiers
          </span>
          <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.06)" }} />
        </div>
        {/* Source filter */}
        {sources.length > 1 && (
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            {["all", ...sources].map((src) => (
              <button key={src} onClick={() => setFilterSource(src)} style={{
                fontFamily: "Georgia, serif", fontSize: 11, padding: "5px 14px", borderRadius: 20, cursor: "pointer",
                background: filterSource === src ? (src === "all" ? config.accentDim : `${sourceColors[src]}20`) : "rgba(255,255,255,0.04)",
                border: `1px solid ${filterSource === src ? (src === "all" ? config.accent + "50" : sourceColors[src] + "50") : "rgba(255,255,255,0.06)"}`,
                color: filterSource === src ? (src === "all" ? config.accent : sourceColors[src]) : "rgba(240,232,216,0.4)",
              }}>
                {src === "all" ? "Tous" : src}
              </button>
            ))}
          </div>
        )}

        {/* Cards grid grouped by date */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxHeight: 480, overflowY: "auto", paddingRight: 4 }}>
          {groups.map(({ date, items }) => (
            <div key={date || "nodate"}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.05)" }} />
                <span style={{ fontFamily: "Georgia, serif", fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: `${config.accent}60` }}>
                  {date ? friendlyDate(date) : "Date inconnue"}
                </span>
                <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.05)" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 8 }}>
                {items.map(({ file, index }) => {
                  const inOrder = selectedSet.has(index);
                  const source = inferSource(file.name);
                  const srcColor = sourceColors[source] ?? config.accent;
                  const ext = file.name.split(".").pop()?.toUpperCase() ?? "";
                  const cleanName = file.name.replace(/\.(mp3|wav|ogg|oga|m4a|aac|opus|flac|weba|3gp|amr|mp4|mpeg)$/i, "");
                  const dur = durations[index];
                  const url = audioUrls[index];
                  const isDraggingThis = dragging?.audioIdx === index && dragging?.zone === "lib";
                  return (
                    <div
                      key={index}
                      draggable={!inOrder}
                      onClick={() => {
                        if (inOrder) {
                          removeFromOrder(index);
                        } else {
                          const next = [...orderedSelected, index];
                          setOrderedSelected(next);
                          onSelect(next.map((i) => audios[i]));
                        }
                      }}
                      onDragStart={(e) => {
                        if (inOrder) { e.preventDefault(); return; }
                        e.dataTransfer.effectAllowed = "move";
                        setDragging({ zone: "lib", audioIdx: index });
                      }}
                      onDragEnd={() => { setDragging(null); setDropPos(null); }}
                      style={{
                        borderRadius: 14, padding: inOrder ? "10px 42px 8px 12px" : "10px 12px 8px", position: "relative",
                        background: isDraggingThis ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${inOrder ? config.accent + "70" : isDraggingThis ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.07)"}`,
                        opacity: isDraggingThis ? 0.5 : 1,
                        cursor: "pointer",
                        transition: "opacity 0.2s, border-color 0.2s, padding 0.2s",
                        display: "flex", flexDirection: "column", gap: 6,
                      }}
                    >
                      {inOrder && (
                        <span aria-label="Fichier sélectionné" style={{
                          position: "absolute", top: 8, right: 8, zIndex: 2,
                          width: 22, height: 22, borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: config.accent, color: "#0d0a0f",
                          boxShadow: `0 0 14px ${config.accent}55`,
                          fontFamily: "Arial, sans-serif", fontSize: 13, fontWeight: 800,
                        }}>
                          ✓
                        </span>
                      )}
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                        {!inOrder && (
                          <svg viewBox="0 0 16 16" fill="currentColor" style={{ width: 10, height: 10, color: "rgba(240,232,216,0.18)", flexShrink: 0, marginTop: 3 }}>
                            <rect x="2" y="3" width="12" height="1.5" rx="0.5"/><rect x="2" y="7" width="12" height="1.5" rx="0.5"/><rect x="2" y="11" width="12" height="1.5" rx="0.5"/>
                          </svg>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: "Georgia, serif", fontSize: 12, margin: 0, color: "#f0e8d8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {cleanName}
                          </p>
                          <div style={{ display: "flex", gap: 5, marginTop: 3, alignItems: "center" }}>
                            <span style={{ fontFamily: "Georgia, serif", fontSize: 9, padding: "1px 5px", borderRadius: 4, background: `${srcColor}18`, color: srcColor, letterSpacing: "0.1em" }}>
                              {ext || source}
                            </span>
                            {dur !== undefined && dur > 0 && (
                              <span style={{ fontFamily: "Georgia, serif", fontSize: 10, color: "rgba(240,232,216,0.3)" }}>{formatDuration(dur)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {url && (
                        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                        <div onClick={(e) => e.stopPropagation()}>
                          {isMobile ? (
                            <MobileAudioPlayer url={url} accent={config.accent} />
                          ) : (
                            <audio src={url} controls style={{ width: "100%", height: 26, borderRadius: 6, accentColor: config.accent }} />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ ZONE 2 — Montage ═══ */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.06)" }} />
          <span style={{ fontFamily: "Georgia, serif", fontSize: 10, letterSpacing: "0.35em", textTransform: "uppercase", color: `${config.accent}70` }}>
            Montage — aperçu du résultat
          </span>
          <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.06)" }} />
        </div>
        <div
          onDragOver={(e) => { e.preventDefault(); setZone2Over(true); if (dropPos === null && orderedSelected.length === 0) setDropPos(0); }}
          onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) { setZone2Over(false); setDropPos(null); } }}
          onDrop={(e) => { e.preventDefault(); handleDrop(dropPos ?? orderedSelected.length); setZone2Over(false); }}
          style={{
            minHeight: 120, borderRadius: 18, padding: 16,
            background: zone2Over && orderedSelected.length === 0 ? `${config.accent}08` : "rgba(255,255,255,0.025)",
            border: `1px dashed ${zone2Over && orderedSelected.length === 0 ? config.accent + "50" : "rgba(255,255,255,0.08)"}`,
            transition: "background 0.2s, border-color 0.2s",
          }}
        >
          {orderedSelected.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 88, gap: 8 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ width: 26, height: 26, color: `${config.accent}35` }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m-4-4l4 4 4-4"/>
              </svg>
              <p style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "rgba(240,232,216,0.22)", margin: 0, textAlign: "center", fontStyle: "italic" }}>
                Glissez des audios depuis la bibliothèque pour composer votre montage
              </p>
            </div>
          ) : (
            <div>
              <DropSlot accent={config.accent} active={dropPos === 0} onDragOver={() => setDropPos(0)} onDrop={() => { handleDrop(0); setZone2Over(false); }} />
              {orderedSelected.map((audioIdx, pos) => {
                const file = audios[audioIdx];
                const cleanName = file.name.replace(/\.(mp3|wav|ogg|oga|m4a|aac|opus|flac|weba|webm|3gp|amr|mp4|mpeg)$/i, "");
                const dur = durations[audioIdx];
                const url = audioUrls[audioIdx];
                const isDraggingThis = dragging?.audioIdx === audioIdx && dragging?.zone === "order";
                const source = inferSource(file.name);
                const srcColor = sourceColors[source] ?? config.accent;
                return (
                  <div key={audioIdx}>
                    <div
                      draggable
                      onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; setDragging({ zone: "order", audioIdx }); setDropPos(null); }}
                      onDragEnd={() => { setDragging(null); setDropPos(null); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 12px", borderRadius: 12,
                        background: isDraggingThis ? "rgba(255,255,255,0.02)" : `${config.accent}08`,
                        border: `1px solid ${isDraggingThis ? "rgba(255,255,255,0.04)" : config.accent + "20"}`,
                        opacity: isDraggingThis ? 0.4 : 1,
                        cursor: "grab", userSelect: "none",
                        transition: "opacity 0.15s",
                      }}
                    >
                      <div style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, background: `${config.accent}22`, border: `1.5px solid ${config.accent}45`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontFamily: "Georgia, serif", fontSize: 11, fontWeight: 700, color: config.accent }}>{pos + 1}</span>
                      </div>
                      <svg viewBox="0 0 16 16" fill="currentColor" style={{ width: 10, height: 10, color: "rgba(240,232,216,0.18)", flexShrink: 0 }}>
                        <rect x="2" y="3" width="12" height="1.5" rx="0.5"/><rect x="2" y="7" width="12" height="1.5" rx="0.5"/><rect x="2" y="11" width="12" height="1.5" rx="0.5"/>
                      </svg>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "Georgia, serif", fontSize: 12, margin: 0, color: "#f0e8d8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cleanName}</p>
                        <div style={{ display: "flex", gap: 6, marginTop: 2, alignItems: "center" }}>
                          <span style={{ fontFamily: "Georgia, serif", fontSize: 9, color: srcColor }}>{source}</span>
                          {dur !== undefined && dur > 0 && <span style={{ fontFamily: "Georgia, serif", fontSize: 10, color: "rgba(240,232,216,0.3)" }}>{formatDuration(dur)}</span>}
                        </div>
                      </div>
                      {url && (
                        <div style={{ flexShrink: 0 }}>
                          {isMobile ? (
                            <MobileAudioPlayer url={url} accent={config.accent} />
                          ) : (
                            <audio src={url} controls style={{ width: 150, height: 26, borderRadius: 6, accentColor: config.accent }} />
                          )}
                        </div>
                      )}
                      <button onClick={() => removeFromOrder(audioIdx)} title="Retirer" style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(240,232,216,0.4)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, padding: 0 }}>×</button>
                    </div>
                    <DropSlot accent={config.accent} active={dropPos === pos + 1} onDragOver={() => setDropPos(pos + 1)} onDrop={() => { handleDrop(pos + 1); setZone2Over(false); }} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {orderedSelected.length > 0 && (
          <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: "rgba(240,232,216,0.18)", marginTop: 6, fontStyle: "italic" }}>
            Glissez pour réorganiser · × pour retirer
          </p>
        )}
      </div>

      {/* Duration bar */}
      {orderedSelected.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "rgba(240,232,216,0.4)" }}>
              {orderedSelected.length} audio{orderedSelected.length > 1 ? "s" : ""} dans le montage
            </span>
            <span style={{ fontFamily: "Georgia, serif", fontSize: 12, color: durationBarColor, transition: "color 0.3s" }}>
              {totalDuration > 0 ? formatDurationLong(totalDuration) : "calcul en cours…"}
              <span style={{ color: "rgba(240,232,216,0.2)", marginLeft: 6 }}>/ 1h max</span>
            </span>
          </div>
          <div style={{ height: 4, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <motion.div animate={{ width: `${durationPercent}%` }} transition={{ duration: 0.4, ease: "easeOut" }} style={{ height: "100%", borderRadius: 4, background: durationBarColor, boxShadow: isOverLimit ? `0 0 8px ${durationBarColor}80` : "none" }} />
          </div>
          {isNearLimit && <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: "#f0a855", margin: "8px 0 0", fontStyle: "italic" }}>⚠️ Moins de 10 minutes restantes.</p>}
          {isOverLimit && <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: "#e05580", margin: "8px 0 0", fontStyle: "italic" }}>La sélection dépasse 1h. Retirez des audios ou créez plusieurs vocapsules.</p>}
        </div>
      )}

      {/* Action buttons */}
      <div className="audio-cta-grid" style={{ display: "grid", gridTemplateColumns: showLivre ? "1fr 1fr" : "1fr", gap: 12 }}>
        <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.97 }}
          onClick={() => { onSelect(orderedSelected.map((i) => audios[i])); onVocapsule(); }}
          disabled={orderedSelected.length === 0 || isOverLimit}
          style={{ padding: "20px 20px", borderRadius: 18, textAlign: "left", cursor: orderedSelected.length === 0 || isOverLimit ? "not-allowed" : "pointer", background: `linear-gradient(135deg, ${config.accent}20, ${config.accent}40)`, border: `1px solid ${config.accent}40`, opacity: orderedSelected.length === 0 || isOverLimit ? 0.5 : 1, boxShadow: `0 8px 30px ${config.accent}15` } as React.CSSProperties}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 22, height: 22, color: config.accent, display: "block", marginBottom: 8 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
          </svg>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 500, color: "#f0e8d8", margin: "0 0 4px" }}>{ctaVocapsule}</p>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: "rgba(240,232,216,0.4)", margin: 0 }}>Fusion audio · MP3 · QR code</p>
        </motion.button>
        {showLivre && (
          <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.97 }}
            onClick={() => { onSelect(orderedSelected.map((i) => audios[i])); onLivre(); }}
            disabled={orderedSelected.length === 0}
            style={{ padding: "20px 20px", borderRadius: 18, textAlign: "left", cursor: orderedSelected.length === 0 ? "not-allowed" : "pointer", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", opacity: orderedSelected.length === 0 ? 0.5 : 1 } as React.CSSProperties}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 22, height: 22, color: "rgba(240,232,216,0.6)", display: "block", marginBottom: 8 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 500, color: "#f0e8d8", margin: "0 0 4px" }}>{ctaLivre}</p>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: "rgba(240,232,216,0.4)", margin: 0 }}>Transcription · texte · téléchargeable</p>
          </motion.button>
        )}
      </div>
      <style>{`
        @media (max-width: 560px) {
          .audio-cta-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </motion.div>
  );
}
