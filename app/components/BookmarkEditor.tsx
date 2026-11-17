"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import type { BookmarkDraftItem } from "../lib/capsules";

export interface SelectedAudioForBookmark {
  audioId: string;
  file: File;
  durationSec: number;
  startSecInMix: number;
  url?: string;
  customName?: string;
}

interface BookmarkEditorProps {
  selectedAudios: SelectedAudioForBookmark[];
  bookmarks: BookmarkDraftItem[];
  onChangeBookmarks: (next: BookmarkDraftItem[]) => void;
  onReorderAudios?: (newOrderedAudioIds: string[]) => void;
  accent: string;
}

const TAG_PALETTE = [
  { name: "Or ambré", hex: "#d4a857" },
  { name: "Émeraude", hex: "#57c88a" },
  { name: "Bleu azur", hex: "#5ea6e8" },
  { name: "Corail", hex: "#e4766c" },
  { name: "Violet doux", hex: "#a982e8" },
  { name: "Rose poudré", hex: "#de7eb2" },
  { name: "Turquoise", hex: "#54c8bf" },
  { name: "Jaune solaire", hex: "#e5c365" },
];

function formatMmSs(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m.toString().padStart(2, "0")}:${rem.toString().padStart(2, "0")}`;
}

export default function BookmarkEditor({
  selectedAudios,
  bookmarks,
  onChangeBookmarks,
  onReorderAudios,
  accent,
}: BookmarkEditorProps) {
  const [selectedAudioId, setSelectedAudioId] = useState<string>(selectedAudios[0]?.audioId ?? "");
  const [newTitle, setNewTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>(TAG_PALETTE[0].hex);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [draggedAudioId, setDraggedAudioId] = useState<string | null>(null);
  const [dragOverAudioId, setDragOverAudioId] = useState<string | null>(null);
  const [hoveredSegmentId, setHoveredSegmentId] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const effectiveAudioId =
    selectedAudios.some((a) => a.audioId === selectedAudioId)
      ? selectedAudioId
      : (selectedAudios[0]?.audioId ?? "");

  const currentAudio = selectedAudios.find((a) => a.audioId === effectiveAudioId);
  const totalMixDuration = selectedAudios.reduce((acc, a) => acc + Math.max(1, a.durationSec || 1), 0);

  // Pré-remplir automatiquement le nom de l'étiquette si l'audio a été nommé lors de la sélection IA
  useEffect(() => {
    const audio = selectedAudios.find((a) => a.audioId === effectiveAudioId);
    const existingBm = bookmarks.find((b) => b.audioId === effectiveAudioId);
    if (existingBm?.title) {
      setNewTitle(existingBm.title);
    } else if (audio?.customName) {
      setNewTitle(audio.customName);
    } else {
      setNewTitle("");
    }
  }, [effectiveAudioId, selectedAudios, bookmarks]);

  const getBookmarkColor = (bm: BookmarkDraftItem, idx: number) =>
    bm.color || TAG_PALETTE[idx % TAG_PALETTE.length].hex;

  const moveAudioInTimeline = (fromAudioId: string, toAudioId: string) => {
    if (!onReorderAudios || fromAudioId === toAudioId) return;
    const ids = selectedAudios.map((a) => a.audioId);
    const fromIdx = ids.indexOf(fromAudioId);
    const toIdx = ids.indexOf(toAudioId);
    if (fromIdx === -1 || toIdx === -1) return;
    const next = [...ids];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    onReorderAudios(next);
  };

  const handleAdd = () => {
    const title = newTitle.trim();
    if (!title || !effectiveAudioId) return;

    const existingIdx = bookmarks.findIndex((b) => b.audioId === effectiveAudioId);
    let nextBookmarks: BookmarkDraftItem[];
    if (existingIdx !== -1) {
      nextBookmarks = bookmarks.map((b, i) =>
        i === existingIdx ? { ...b, title: title.slice(0, 80), color: selectedColor } : b
      );
    } else {
      const created: BookmarkDraftItem = {
        id: `bm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: title.slice(0, 80),
        audioId: effectiveAudioId,
        offsetInAudioSec: 0,
        color: selectedColor,
      };
      nextBookmarks = [...bookmarks, created];
    }

    onChangeBookmarks(nextBookmarks);
    setNewTitle("");

    const usedColors = new Set(nextBookmarks.map((b) => b.color));
    const nextColor =
      TAG_PALETTE.find((p) => !usedColors.has(p.hex))?.hex ??
      TAG_PALETTE[nextBookmarks.length % TAG_PALETTE.length].hex;
    setSelectedColor(nextColor);

    const nextUntagged = selectedAudios.find(
      (a) => a.audioId !== effectiveAudioId && !nextBookmarks.some((b) => b.audioId === a.audioId)
    );
    if (nextUntagged) {
      setSelectedAudioId(nextUntagged.audioId);
    }
  };

  const handleDelete = (id: string) => {
    if (playingId === id && previewAudioRef.current) {
      previewAudioRef.current.pause();
      setPlayingId(null);
    }
    onChangeBookmarks(bookmarks.filter((b) => b.id !== id));
  };

  const handleSaveEdit = (id: string) => {
    const clean = editingTitle.trim().slice(0, 80);
    if (!clean) return;
    onChangeBookmarks(bookmarks.map((b) => (b.id === id ? { ...b, title: clean } : b)));
    setEditingId(null);
    setEditingTitle("");
  };

  const handlePreviewAudio = (audioId: string, playKey: string, offsetSec = 0) => {
    const target = selectedAudios.find((a) => a.audioId === audioId);
    if (!target?.url) return;

    if (playingId === playKey && previewAudioRef.current) {
      previewAudioRef.current.pause();
      setPlayingId(null);
      return;
    }

    if (!previewAudioRef.current) {
      previewAudioRef.current = new Audio();
      previewAudioRef.current.onended = () => setPlayingId(null);
    }
    const player = previewAudioRef.current;
    player.pause();
    player.src = target.url;
    player.currentTime = Math.max(0, offsetSec);
    player.play().catch(() => {});
    setPlayingId(playKey);
  };

  const enrichedBookmarks = bookmarks
    .map((bm, rawIdx) => {
      const idx = selectedAudios.findIndex((a) => a.audioId === bm.audioId);
      const audio = idx >= 0 ? selectedAudios[idx] : undefined;
      const futureTimeSec = audio ? audio.startSecInMix + (bm.offsetInAudioSec || 0) : 0;
      const color = getBookmarkColor(bm, rawIdx);
      return { bm, audio, orderIndex: idx, futureTimeSec, color };
    })
    .filter((item) => item.audio !== undefined)
    .sort((a, b) => a.futureTimeSec - b.futureTimeSec);

  return (
    <div style={{ marginTop: 36, marginBottom: 40 }}>
      {/* En-tête supérieur */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        <h3 style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 400, color: "#f0e8d8", margin: 0 }}>
          Les repères de vos souvenirs
        </h3>
        <span style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "rgba(240,232,216,0.45)" }}>
          {enrichedBookmarks.length} étiquette{enrichedBookmarks.length > 1 ? "s" : ""} · {formatMmSs(totalMixDuration)}
        </span>
      </div>

      {selectedAudios.length === 0 ? (
        <div
          style={{
            padding: "24px",
            borderRadius: 16,
            background: "rgba(18, 13, 14, 0.72)",
            border: "1px solid rgba(255,255,255,0.09)",
          }}
        >
          <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "rgba(240,232,216,0.45)", fontStyle: "italic", margin: 0 }}>
            Ajoutez d&apos;abord au moins un message vocal dans votre montage ci-dessus pour créer vos étiquettes.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* ═══════════════════════════════════════════════════════════════════════
              PORTION 1 — CRÉER UNE ÉTIQUETTE (ALIGNEMENT EXACT SUR LA MAQUETTE)
             ═══════════════════════════════════════════════════════════════════════ */}
          <div
            style={{
              padding: "24px 28px",
              borderRadius: 16,
              background: "rgba(18, 13, 12, 0.78)",
              border: "1px solid rgba(255,255,255,0.09)",
            }}
          >
            {/* En-tête bloc 1 */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 22 }}>
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: "rgba(201,169,110,0.22)",
                  color: "#e6c786",
                  fontFamily: "Georgia, serif",
                  fontSize: 14,
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                1
              </span>
              <div>
                <p style={{ fontFamily: "Georgia, serif", fontSize: 18, color: "#f0e8d8", margin: 0, fontWeight: 400 }}>
                  Créer une étiquette
                </p>
                <p style={{ fontFamily: "sans-serif", fontSize: 13, color: "rgba(240,232,216,0.48)", margin: "3px 0 0" }}>
                  Choisissez un audio, un nom et une couleur.
                </p>
              </div>
            </div>

            {/* Grille alignée 3 lignes */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Ligne 1 : Audio source */}
              <div className="bm-form-row" style={{ display: "grid", gridTemplateColumns: "155px 1fr", alignItems: "center", gap: 16 }}>
                <label style={{ fontFamily: "sans-serif", fontSize: 13, color: "rgba(240,232,216,0.78)" }}>
                  Audio source
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => handlePreviewAudio(effectiveAudioId, `select_${effectiveAudioId}`)}
                    title="Écouter cet audio"
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      border: `1.5px solid ${accent}80`,
                      background: "rgba(201,169,110,0.08)",
                      color: accent,
                      cursor: "pointer",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                    }}
                  >
                    {playingId === `select_${effectiveAudioId}` ? "❚❚" : "▶"}
                  </button>

                  <div style={{ position: "relative", flex: 1 }}>
                    <select
                      value={effectiveAudioId}
                      onChange={(e) => setSelectedAudioId(e.target.value)}
                      style={{
                        width: "100%",
                        appearance: "none",
                        WebkitAppearance: "none",
                        padding: "11px 78px 11px 16px",
                        borderRadius: 10,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: "#f0e8d8",
                        fontFamily: "sans-serif",
                        fontSize: 13.5,
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      {selectedAudios.map((a, idx) => {
                        const clean = a.file.name.replace(/\.(mp3|wav|ogg|oga|m4a|aac|opus|flac|weba|webm|3gp|amr|mp4|mpeg)$/i, "");
                        const existingBm = bookmarks.find((b) => b.audioId === a.audioId);
                        const displayName = existingBm?.title || a.customName || clean;
                        return (
                          <option key={a.audioId} value={a.audioId} style={{ background: "#181316", color: "#f0e8d8" }}>
                            Audio {idx + 1} · {displayName}
                          </option>
                        );
                      })}
                    </select>
                    <div
                      style={{
                        position: "absolute",
                        right: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        pointerEvents: "none",
                        color: "rgba(240,232,216,0.55)",
                        fontFamily: "ui-monospace, monospace",
                        fontSize: 12,
                      }}
                    >
                      <span>{formatMmSs(currentAudio?.durationSec ?? 0)}</span>
                      <span style={{ fontSize: 11 }}>⌄</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ligne 2 : Nom de l'étiquette */}
              <div className="bm-form-row" style={{ display: "grid", gridTemplateColumns: "155px 1fr", alignItems: "center", gap: 16 }}>
                <label style={{ fontFamily: "sans-serif", fontSize: 13, color: "rgba(240,232,216,0.78)" }}>
                  Nom de l&apos;étiquette
                </label>
                <input
                  type="text"
                  value={newTitle}
                  maxLength={80}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAdd();
                    }
                  }}
                  placeholder="Ex : Passage ASSR2, Anniversaire maman…"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "11px 16px",
                    borderRadius: 10,
                    background: `${selectedColor}10`,
                    border: `1.5px solid ${selectedColor}85`,
                    boxShadow: `0 0 14px ${selectedColor}25`,
                    color: "#f0e8d8",
                    fontFamily: "sans-serif",
                    fontSize: 13.5,
                    outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
                  }}
                />
              </div>

              {/* Ligne 3 : Couleur + Bouton Ajouter l'étiquette à droite */}
              <div className="bm-form-row" style={{ display: "grid", gridTemplateColumns: "155px 1fr", alignItems: "center", gap: 16 }}>
                <label style={{ fontFamily: "sans-serif", fontSize: 13, color: "rgba(240,232,216,0.78)" }}>
                  Couleur
                </label>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    {TAG_PALETTE.map((c) => {
                      const active = selectedColor === c.hex;
                      return (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setSelectedColor(c.hex)}
                          title={c.name}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            padding: 0,
                            background: c.hex,
                            border: active ? "2.5px solid #fff" : "2px solid rgba(0,0,0,0.35)",
                            boxShadow: active ? `0 0 14px ${c.hex}, 0 0 0 2px ${c.hex}55` : "none",
                            transform: active ? "scale(1.16)" : "scale(1)",
                            cursor: "pointer",
                            transition: "transform 0.15s, box-shadow 0.15s",
                          }}
                        />
                      );
                    })}
                  </div>

                  <motion.button
                    type="button"
                    whileHover={newTitle.trim() ? { scale: 1.02 } : {}}
                    whileTap={newTitle.trim() ? { scale: 0.98 } : {}}
                    onClick={handleAdd}
                    disabled={!newTitle.trim()}
                    style={{
                      padding: "11px 22px",
                      borderRadius: 10,
                      border: `1.5px solid ${selectedColor}`,
                      background: newTitle.trim() ? selectedColor : `${selectedColor}28`,
                      boxShadow: newTitle.trim() ? `0 0 18px ${selectedColor}66` : `0 0 10px ${selectedColor}25`,
                      color: newTitle.trim() ? "#141012" : "#f0e8d8",
                      fontFamily: "sans-serif",
                      fontSize: 13.5,
                      fontWeight: 600,
                      cursor: newTitle.trim() ? "pointer" : "not-allowed",
                      whiteSpace: "nowrap",
                      transition: "all 0.2s",
                    }}
                  >
                    + Ajouter l&apos;étiquette
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════════
              PORTION 2 — BANDE CHRONOLOGIQUE & ÉTIQUETTES CRÉÉES
             ═══════════════════════════════════════════════════════════════════════ */}
          <div
            style={{
              padding: "24px 28px",
              borderRadius: 16,
              background: "rgba(18, 13, 12, 0.78)",
              border: "1px solid rgba(255,255,255,0.09)",
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            {/* En-tête bloc 2 */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <span
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "rgba(201,169,110,0.22)",
                    color: "#e6c786",
                    fontFamily: "Georgia, serif",
                    fontSize: 14,
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  2
                </span>
                <div>
                  <p style={{ fontFamily: "Georgia, serif", fontSize: 18, color: "#f0e8d8", margin: 0, fontWeight: 400 }}>
                    Organiser sur la bande chronologique
                  </p>
                  <p style={{ fontFamily: "sans-serif", fontSize: 13, color: "rgba(240,232,216,0.48)", margin: "3px 0 0" }}>
                    Glissez les couleurs pour ordonner vos souvenirs · Survolez une couleur pour voir le nom du fichier.
                  </p>
                </div>
              </div>
            </div>

            {/* Étiquettes créées (badges colorés épurés) */}
            {enrichedBookmarks.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {enrichedBookmarks.map(({ bm, orderIndex, futureTimeSec, color }) => {
                  const isEditing = editingId === bm.id;
                  const isPlaying = playingId === bm.id;
                  return (
                    <div
                      key={bm.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = "move";
                        setDraggedAudioId(bm.audioId);
                      }}
                      onDragEnd={() => {
                        setDraggedAudioId(null);
                        setDragOverAudioId(null);
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 9,
                        padding: "7px 12px",
                        borderRadius: 10,
                        background: "rgba(255,255,255,0.04)",
                        border: `1px solid ${color}75`,
                        cursor: "grab",
                      }}
                    >
                      <span
                        style={{
                          width: 11,
                          height: 11,
                          borderRadius: "50%",
                          background: color,
                          flexShrink: 0,
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => handlePreviewAudio(bm.audioId, bm.id, bm.offsetInAudioSec)}
                        title="Écouter"
                        style={{
                          background: "none",
                          border: "none",
                          color: "rgba(240,232,216,0.75)",
                          cursor: "pointer",
                          fontSize: 10,
                          padding: 0,
                        }}
                      >
                        {isPlaying ? "❚❚" : "▶"}
                      </button>

                      {isEditing ? (
                        <input
                          type="text"
                          value={editingTitle}
                          maxLength={80}
                          autoFocus
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={() => handleSaveEdit(bm.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit(bm.id);
                          }}
                          style={{
                            width: 130,
                            padding: "2px 6px",
                            borderRadius: 6,
                            background: "#141018",
                            border: `1px solid ${color}`,
                            color: "#f0e8d8",
                            fontFamily: "sans-serif",
                            fontSize: 12.5,
                            outline: "none",
                          }}
                        />
                      ) : (
                        <span
                          onClick={() => {
                            setEditingId(bm.id);
                            setEditingTitle(bm.title);
                          }}
                          title="Cliquer pour renommer"
                          style={{ fontFamily: "sans-serif", fontSize: 13, color: "#f0e8d8", fontWeight: 500, cursor: "text" }}
                        >
                          {bm.title}
                        </span>
                      )}

                      <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11.5, color: "rgba(240,232,216,0.48)" }}>
                        #{orderIndex + 1} · {formatMmSs(futureTimeSec)}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDelete(bm.id)}
                        title="Supprimer l'étiquette"
                        style={{
                          background: "none",
                          border: "none",
                          color: "rgba(240,232,216,0.4)",
                          cursor: "pointer",
                          fontSize: 14,
                          padding: 0,
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bande chronologique de temps global : uniquement les blocs de couleur, nom visible au survol */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11.5, color: "rgba(240,232,216,0.45)" }}>
                  00:00
                </span>
                <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11.5, color: "rgba(240,232,216,0.45)" }}>
                  {formatMmSs(totalMixDuration)}
                </span>
              </div>

              <div
                style={{
                  position: "relative",
                  display: "flex",
                  width: "100%",
                  height: 42,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.035)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  gap: 4,
                  padding: 4,
                  boxSizing: "border-box",
                  userSelect: "none",
                }}
              >
                {selectedAudios.map((a, idx) => {
                  const dur = Math.max(1, a.durationSec || 1);
                  const widthPct = Math.max(6, (dur / Math.max(1, totalMixDuration)) * 100);
                  const bmIdx = bookmarks.findIndex((b) => b.audioId === a.audioId);
                  const bm = bmIdx >= 0 ? bookmarks[bmIdx] : undefined;
                  const segColor = bm ? getBookmarkColor(bm, bmIdx) : "rgba(255,255,255,0.13)";
                  const isHovered = hoveredSegmentId === a.audioId;
                  const isSelected = a.audioId === effectiveAudioId;
                  const isDragOver = dragOverAudioId === a.audioId && draggedAudioId !== a.audioId;
                  const cleanFileName = a.file.name.replace(/\.(mp3|wav|ogg|oga|m4a|aac|opus|flac|weba|webm|3gp|amr|mp4|mpeg)$/i, "");

                  return (
                    <div
                      key={a.audioId}
                      draggable
                      onMouseEnter={() => setHoveredSegmentId(a.audioId)}
                      onMouseLeave={() => setHoveredSegmentId((prev) => (prev === a.audioId ? null : prev))}
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = "move";
                        setDraggedAudioId(a.audioId);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (dragOverAudioId !== a.audioId) setDragOverAudioId(a.audioId);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedAudioId) moveAudioInTimeline(draggedAudioId, a.audioId);
                        setDraggedAudioId(null);
                        setDragOverAudioId(null);
                      }}
                      onDragEnd={() => {
                        setDraggedAudioId(null);
                        setDragOverAudioId(null);
                      }}
                      onClick={() => {
                        setSelectedAudioId(a.audioId);
                        setHoveredSegmentId((prev) => (prev === a.audioId ? null : a.audioId));
                      }}
                      style={{
                        position: "relative",
                        flex: `${widthPct} 1 0%`,
                        minWidth: 24,
                        height: "100%",
                        borderRadius: 8,
                        cursor: "grab",
                        background: segColor,
                        opacity: isHovered ? 1 : bm ? 0.9 : 0.5,
                        border: isDragOver
                          ? "2px dashed #fff"
                          : isSelected
                            ? "1.5px solid rgba(255,255,255,0.85)"
                            : "1px solid rgba(0,0,0,0.2)",
                        transition: "all 0.15s",
                      }}
                    >
                      {isHovered && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            position: "absolute",
                            bottom: "calc(100% + 10px)",
                            left: "50%",
                            transform: "translateX(-50%)",
                            padding: "8px 12px",
                            borderRadius: 10,
                            background: "#161113",
                            border: `1px solid ${bm ? segColor : "rgba(255,255,255,0.2)"}`,
                            boxShadow: "0 8px 24px rgba(0,0,0,0.8)",
                            whiteSpace: "nowrap",
                            zIndex: 30,
                            textAlign: "center",
                          }}
                        >
                          {bm && (
                            <div style={{ fontFamily: "sans-serif", fontSize: 12.5, fontWeight: 600, color: segColor, marginBottom: 2 }}>
                              {bm.title}
                            </div>
                          )}
                          <div style={{ fontFamily: "sans-serif", fontSize: 11.5, color: "#f0e8d8" }}>
                            Audio {idx + 1} · {cleanFileName}
                          </div>
                          <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10.5, color: "rgba(240,232,216,0.55)", marginTop: 2 }}>
                            Début : {formatMmSs(a.startSecInMix)} · Durée : {formatMmSs(a.durationSec)}
                          </div>
                          {selectedAudios.length > 1 && (
                            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 6 }}>
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => moveAudioInTimeline(a.audioId, selectedAudios[idx - 1].audioId)}
                                  style={{ padding: "2px 8px", borderRadius: 6, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)", color: "#f0e8d8", fontSize: 10.5, cursor: "pointer" }}
                                >
                                  ◀ Déplacer
                                </button>
                              )}
                              {idx < selectedAudios.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => moveAudioInTimeline(a.audioId, selectedAudios[idx + 1].audioId)}
                                  style={{ padding: "2px 8px", borderRadius: 6, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)", color: "#f0e8d8", fontSize: 10.5, cursor: "pointer" }}
                                >
                                  Déplacer ▶
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <style>{`
            @media (max-width: 600px) {
              .bm-form-row { grid-template-columns: 1fr !important; gap: 8px !important; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
