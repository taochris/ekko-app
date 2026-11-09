"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import type { BookmarkDraftItem } from "../lib/capsules";

export interface SelectedAudioForBookmark {
  audioId: string;
  file: File;
  durationSec: number;
  startSecInMix: number;
  url?: string;
}

interface BookmarkEditorProps {
  selectedAudios: SelectedAudioForBookmark[];
  bookmarks: BookmarkDraftItem[];
  onChangeBookmarks: (next: BookmarkDraftItem[]) => void;
  accent: string;
}

const BOOKMARK_SUGGESTIONS = [
  "Anniversaire maman",
  "Déclaration d'amour",
  "Nos vacances",
  "Un message de papa",
  "Notre plus beau souvenir",
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
  accent,
}: BookmarkEditorProps) {
  const [selectedAudioId, setSelectedAudioId] = useState<string>(selectedAudios[0]?.audioId ?? "");
  const [newTitle, setNewTitle] = useState("");
  const [newOffsetSec, setNewOffsetSec] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const effectiveAudioId =
    selectedAudios.some((a) => a.audioId === selectedAudioId)
      ? selectedAudioId
      : (selectedAudios[0]?.audioId ?? "");

  const currentAudio = selectedAudios.find((a) => a.audioId === effectiveAudioId);

  const handleAdd = () => {
    const title = newTitle.trim();
    if (!title || !effectiveAudioId) return;
    const maxOffset = currentAudio ? Math.max(0, Math.floor(currentAudio.durationSec - 1)) : 0;
    const clampedOffset = Math.min(Math.max(0, Number(newOffsetSec) || 0), maxOffset);
    const created: BookmarkDraftItem = {
      id: `bm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: title.slice(0, 80),
      audioId: effectiveAudioId,
      offsetInAudioSec: clampedOffset,
    };
    onChangeBookmarks([...bookmarks, created]);
    setNewTitle("");
    setNewOffsetSec(0);
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

  const handlePreview = (bm: BookmarkDraftItem) => {
    const target = selectedAudios.find((a) => a.audioId === bm.audioId);
    if (!target?.url) return;

    if (playingId === bm.id && previewAudioRef.current) {
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
    player.currentTime = Math.max(0, bm.offsetInAudioSec || 0);
    player.play().catch(() => {});
    setPlayingId(bm.id);
  };

  // Trier les marque-pages par leur position temporelle future dans la Vocapsule
  const enrichedBookmarks = bookmarks
    .map((bm) => {
      const idx = selectedAudios.findIndex((a) => a.audioId === bm.audioId);
      const audio = idx >= 0 ? selectedAudios[idx] : undefined;
      const futureTimeSec = audio ? audio.startSecInMix + (bm.offsetInAudioSec || 0) : 0;
      return { bm, audio, orderIndex: idx, futureTimeSec };
    })
    .filter((item) => item.audio !== undefined)
    .sort((a, b) => a.futureTimeSec - b.futureTimeSec);

  return (
    <div
      style={{
        marginTop: 24,
        marginBottom: 28,
        padding: "22px 20px",
        borderRadius: 18,
        background: `linear-gradient(135deg, ${accent}0c, rgba(255,255,255,0.02))`,
        border: `1px solid ${accent}35`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
        <span style={{ fontFamily: "Georgia, serif", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: accent }}>
          ✦ Souvenirs intelligents · Marque-pages
        </span>
        <span style={{ fontFamily: "Georgia, serif", fontSize: 11, color: "rgba(240,232,216,0.45)" }}>
          {enrichedBookmarks.length} repère{enrichedBookmarks.length > 1 ? "s" : ""} créé{enrichedBookmarks.length > 1 ? "s" : ""}
        </span>
      </div>

      <h3 style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 300, color: "#f0e8d8", margin: "0 0 6px" }}>
        Créez les repères de vos souvenirs
      </h3>
      <p style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "rgba(240,232,216,0.5)", margin: "0 0 18px", lineHeight: 1.6 }}>
        Associez un titre aux moments forts de votre sélection. Ces repères apparaîtront sur la barre de lecture et dans la liste des chapitres sur téléphone. Si vous réorganisez l&apos;ordre du montage, les temps sont recalculés automatiquement.
      </p>

      {selectedAudios.length === 0 ? (
        <p style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "rgba(240,232,216,0.35)", fontStyle: "italic", margin: 0 }}>
          Ajoutez d&apos;abord au moins un message vocal dans votre montage ci-dessus pour y placer des marque-pages.
        </p>
      ) : (
        <>
          {/* Suggestions rapides */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
            {BOOKMARK_SUGGESTIONS.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => setNewTitle(sug)}
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: 11,
                  padding: "4px 11px",
                  borderRadius: 16,
                  cursor: "pointer",
                  background: newTitle === sug ? `${accent}25` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${newTitle === sug ? accent + "60" : "rgba(255,255,255,0.08)"}`,
                  color: newTitle === sug ? accent : "rgba(240,232,216,0.6)",
                }}
              >
                + {sug}
              </button>
            ))}
          </div>

          {/* Formulaire d'ajout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10, marginBottom: 18 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <select
                value={effectiveAudioId}
                onChange={(e) => {
                  setSelectedAudioId(e.target.value);
                  setNewOffsetSec(0);
                }}
                style={{
                  flex: "1 1 220px",
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "#141018",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#f0e8d8",
                  fontFamily: "Georgia, serif",
                  fontSize: 12,
                  outline: "none",
                }}
              >
                {selectedAudios.map((a, idx) => {
                  const clean = a.file.name.replace(/\.(mp3|wav|ogg|oga|m4a|aac|opus|flac|weba|webm|3gp|amr|mp4|mpeg)$/i, "");
                  return (
                    <option key={a.audioId} value={a.audioId}>
                      #{idx + 1} · {clean} (début à {formatMmSs(a.startSecInMix)})
                    </option>
                  );
                })}
              </select>

              <input
                type="text"
                value={newTitle}
                maxLength={80}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
                placeholder="Titre du repère (ex : Anniversaire maman)"
                style={{
                  flex: "2 1 240px",
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${newTitle.trim() ? accent + "50" : "rgba(255,255,255,0.12)"}`,
                  color: "#f0e8d8",
                  fontFamily: "Georgia, serif",
                  fontSize: 13,
                  outline: "none",
                }}
              />

              {currentAudio && currentAudio.durationSec > 5 && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.03)", padding: "6px 10px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)" }}>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: 11, color: "rgba(240,232,216,0.45)" }}>Décalage (s) :</span>
                  <input
                    type="number"
                    min={0}
                    max={Math.max(0, Math.floor(currentAudio.durationSec - 1))}
                    value={newOffsetSec}
                    onChange={(e) => setNewOffsetSec(Math.max(0, Number(e.target.value) || 0))}
                    style={{
                      width: 54,
                      background: "transparent",
                      border: "none",
                      color: "#f0e8d8",
                      fontFamily: "Georgia, serif",
                      fontSize: 12,
                      outline: "none",
                    }}
                  />
                </div>
              )}

              <motion.button
                type="button"
                whileHover={newTitle.trim() ? { scale: 1.02 } : {}}
                whileTap={newTitle.trim() ? { scale: 0.97 } : {}}
                onClick={handleAdd}
                disabled={!newTitle.trim()}
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  border: `1px solid ${newTitle.trim() ? accent + "60" : "rgba(255,255,255,0.08)"}`,
                  background: newTitle.trim() ? `${accent}28` : "rgba(255,255,255,0.04)",
                  color: newTitle.trim() ? "#f0e8d8" : "rgba(240,232,216,0.3)",
                  fontFamily: "Georgia, serif",
                  fontSize: 12,
                  cursor: newTitle.trim() ? "pointer" : "not-allowed",
                }}
              >
                Ajouter le marque-page
              </motion.button>
            </div>
          </div>

          {/* Liste des marque-pages créés */}
          {enrichedBookmarks.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {enrichedBookmarks.map(({ bm, audio, orderIndex, futureTimeSec }) => {
                const isEditing = editingId === bm.id;
                const isPlaying = playingId === bm.id;
                const cleanFileName = audio?.file.name.replace(/\.(mp3|wav|ogg|oga|m4a|aac|opus|flac|weba|webm|3gp|amr|mp4|mpeg)$/i, "") ?? "";
                return (
                  <div
                    key={bm.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.035)",
                      border: `1px solid ${isPlaying ? accent + "65" : "rgba(255,255,255,0.08)"}`,
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handlePreview(bm)}
                      title="Prévisualiser ce repère"
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        border: "none",
                        cursor: "pointer",
                        background: `${accent}30`,
                        color: accent,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {isPlaying ? "❚❚" : "▶"}
                    </button>

                    <span
                      style={{
                        fontFamily: "ui-monospace, monospace",
                        fontSize: 11,
                        padding: "3px 8px",
                        borderRadius: 6,
                        background: `${accent}18`,
                        color: accent,
                        flexShrink: 0,
                      }}
                    >
                      {formatMmSs(futureTimeSec)}
                    </span>

                    <div style={{ flex: 1, minWidth: 160 }}>
                      {isEditing ? (
                        <div style={{ display: "flex", gap: 6 }}>
                          <input
                            type="text"
                            value={editingTitle}
                            maxLength={80}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleSaveEdit(bm.id); }}
                            style={{
                              flex: 1,
                              padding: "4px 8px",
                              borderRadius: 6,
                              background: "#141018",
                              border: `1px solid ${accent}50`,
                              color: "#f0e8d8",
                              fontFamily: "Georgia, serif",
                              fontSize: 13,
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(bm.id)}
                            style={{
                              padding: "4px 10px",
                              borderRadius: 6,
                              background: `${accent}30`,
                              border: "none",
                              color: "#f0e8d8",
                              fontFamily: "Georgia, serif",
                              fontSize: 11,
                              cursor: "pointer",
                            }}
                          >
                            OK
                          </button>
                        </div>
                      ) : (
                        <>
                          <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "#f0e8d8", margin: 0 }}>
                            {bm.title}
                          </p>
                          <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: "rgba(240,232,216,0.4)", margin: "2px 0 0" }}>
                            Audio #{orderIndex + 1} ({cleanFileName})
                            {bm.offsetInAudioSec > 0 ? ` · +${bm.offsetInAudioSec}s dans le message` : ""}
                          </p>
                        </>
                      )}
                    </div>

                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(bm.id);
                          setEditingTitle(bm.title);
                        }}
                        style={{
                          background: "none",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 8,
                          padding: "4px 9px",
                          fontSize: 11,
                          fontFamily: "Georgia, serif",
                          color: "rgba(240,232,216,0.6)",
                          cursor: "pointer",
                        }}
                      >
                        Renommer
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(bm.id)}
                      title="Supprimer ce marque-page"
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "rgba(240,232,216,0.45)",
                        cursor: "pointer",
                        fontSize: 13,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
