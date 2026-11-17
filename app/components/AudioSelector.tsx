"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { computeStableAudioId } from "../lib/audioStorage";
import BookmarkEditor from "./BookmarkEditor";
import type { BookmarkDraftItem, CapsuleManifest } from "../lib/capsules";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);
  return isMobile;
}

interface SearchHit {
  audioId: string;
  filename: string;
  durationSec: number;
  relevanceLabel: "Très pertinent" | "Pertinent" | "Piste possible";
  bestSegmentStartSec: number;
  bestSegmentEndSec: number;
  rank: number;
}

interface AudioSelectorProps {
  audios: File[];
  config: { accent: string; accentDim: string };
  onSelect: (files: File[]) => void;
  onVocapsule: (manifest?: CapsuleManifest, selectedFiles?: File[]) => void;
  onLivre: () => void;
  ctaVocapsule: string;
  ctaLivre: string;
  showLivre?: boolean;
  smartSearchEnabled?: boolean;
  capsuleId?: string | null;
  initialOrderedAudioIds?: string[];
  initialBookmarks?: BookmarkDraftItem[];
  onManifestChange?: (manifest: CapsuleManifest) => void;
  onRequestEnableSmartOption?: () => void;
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
  audios,
  config,
  onSelect,
  onVocapsule,
  onLivre,
  ctaVocapsule,
  ctaLivre,
  showLivre = true,
  smartSearchEnabled = false,
  capsuleId = null,
  initialOrderedAudioIds,
  initialBookmarks,
  onManifestChange,
  onRequestEnableSmartOption,
}: AudioSelectorProps) {
  const audioIds = useMemo(
    () => audios.map((f, idx) => computeStableAudioId(f, idx)),
    [audios]
  );
  const audioIdToIndex = useMemo(() => {
    const m = new Map<string, number>();
    audioIds.forEach((id, i) => m.set(id, i));
    return m;
  }, [audioIds]);

  const [orderedSelected, setOrderedSelected] = useState<number[]>(() => {
    if (!initialOrderedAudioIds || initialOrderedAudioIds.length === 0) return [];
    const indices: number[] = [];
    for (const id of initialOrderedAudioIds) {
      const idx = audioIds.indexOf(id);
      if (idx !== -1 && !indices.includes(idx)) indices.push(idx);
    }
    return indices;
  });
  const selectedSet = useMemo(() => new Set(orderedSelected), [orderedSelected]);
  const [bookmarks, setBookmarks] = useState<BookmarkDraftItem[]>(initialBookmarks ?? []);
  const [customAudioNames, setCustomAudioNames] = useState<Record<string, string>>(() =>
    Object.fromEntries((initialBookmarks ?? []).map((b) => [b.audioId, b.title]))
  );
  const [namingAudioId, setNamingAudioId] = useState<string | null>(null);
  const [namingDraft, setNamingDraft] = useState("");
  const [filterSource, setFilterSource] = useState("all");
  const [durations, setDurations] = useState<Record<number, number>>({});
  const [audioUrls, setAudioUrls] = useState<Record<number, string>>({});
  const urlsRef = useRef<Record<number, string>>({});

  // État Recherche intelligente EmbeddingGemma 2
  const [indexingStatus, setIndexingStatus] = useState<"idle" | "indexing" | "ready" | "error">("idle");
  const [indexedCount, setIndexedCount] = useState(0);
  const [visualIndexedCount, setVisualIndexedCount] = useState(0);
  const [currentBatchTarget, setCurrentBatchTarget] = useState(0);
  const [etaSeconds, setEtaSeconds] = useState<number | null>(null);
  const [demoProgressActive, setDemoProgressActive] = useState(false);
  const indexedAudioIdsRef = useRef<Set<string>>(new Set());
  const indexingStartRef = useRef<number>(0);
  const indexingAbortRef = useRef<AbortController | null>(null);
  const indexingStoppedByUserRef = useRef<boolean>(false);
  const pendingSearchQueryRef = useRef<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchHits, setSearchHits] = useState<SearchHit[] | null>(null);
  const [noRelevantMatch, setNoRelevantMatch] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Drag state
  const [dragging, setDragging] = useState<{ zone: "lib" | "order"; audioIdx: number } | null>(null);
  const [dropPos, setDropPos] = useState<number | null>(null);
  const [zone2Over, setZone2Over] = useState(false);

  // Restaurer la sélection si initialOrderedAudioIds arrive après le premier rendu
  useEffect(() => {
    if (initialOrderedAudioIds && initialOrderedAudioIds.length > 0 && orderedSelected.length === 0) {
      const indices: number[] = [];
      for (const id of initialOrderedAudioIds) {
        const idx = audioIds.indexOf(id);
        if (idx !== -1 && !indices.includes(idx)) indices.push(idx);
      }
      if (indices.length > 0) {
        setOrderedSelected(indices);
        onSelect(indices.map((i) => audios[i]));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOrderedAudioIds, audioIds]);

  useEffect(() => {
    if (initialBookmarks && initialBookmarks.length > 0 && bookmarks.length === 0) {
      setBookmarks(initialBookmarks);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBookmarks]);

  const [indexingTrigger, setIndexingTrigger] = useState(0);

  // Indexation automatique par lots vers EmbeddingGemma 2 dès que smartSearchEnabled est actif
  useEffect(() => {
    if (!smartSearchEnabled || !capsuleId || audios.length === 0) return;
    let cancelled = false;

    const runIndexing = async () => {
      if (indexingStoppedByUserRef.current && indexingTrigger === 0) {
        return;
      }
      indexingStoppedByUserRef.current = false;

      // 1. Récupérer les audioIds déjà indexés côté serveur (ou en sessionStorage)
      //    pour ne JAMAIS ré-analyser / ré-envoyer les 294 audios quand on revient sur la page !
      try {
        const cachedRaw = sessionStorage.getItem(`vosekko_indexed_${capsuleId}`);
        if (cachedRaw) {
          const parsed: string[] = JSON.parse(cachedRaw);
          parsed.forEach((id) => indexedAudioIdsRef.current.add(id));
        }
      } catch {}

      try {
        const checkRes = await fetch(`/api/smart-search/index?capsuleId=${encodeURIComponent(capsuleId)}`);
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          if (Array.isArray(checkData.indexedAudioIds)) {
            checkData.indexedAudioIds.forEach((id: string) => indexedAudioIdsRef.current.add(id));
            try {
              sessionStorage.setItem(
                `vosekko_indexed_${capsuleId}`,
                JSON.stringify(Array.from(indexedAudioIdsRef.current))
              );
            } catch {}
          }
        }
      } catch {}

      if (cancelled) return;

      const pendingIndices: number[] = [];
      audioIds.forEach((id, idx) => {
        if (!indexedAudioIdsRef.current.has(id)) pendingIndices.push(idx);
      });
      if (pendingIndices.length === 0) {
        setIndexingStatus("ready");
        setIndexedCount(audios.length);
        setVisualIndexedCount(audios.length);
        setEtaSeconds(0);
        return;
      }

      const alreadyDone = audios.length - pendingIndices.length;
      if (alreadyDone > 0) {
        setIndexedCount(alreadyDone);
        setVisualIndexedCount(alreadyDone);
      }

      setIndexingStatus("indexing");
      setSearchError(null);
      indexingStartRef.current = Date.now();
      // Estimation initiale : ~12 s de réveil GPU + ~0.18 s par vocal
      setEtaSeconds(Math.max(4, Math.round(12 + pendingIndices.length * 0.18)));

      // Découper en lots de max 25 fichiers ET max 3.8 Mo (limite requête Vercel = 4.5 Mo)
      const batches: number[][] = [];
      let curBatch: number[] = [];
      let curBytes = 0;
      const MAX_BATCH_FILES = 25;
      const MAX_BATCH_BYTES = 3.8 * 1024 * 1024;
      for (const idx of pendingIndices) {
        const fSize = audios[idx]?.size ?? 0;
        if (curBatch.length >= MAX_BATCH_FILES || (curBatch.length > 0 && curBytes + fSize > MAX_BATCH_BYTES)) {
          batches.push(curBatch);
          curBatch = [];
          curBytes = 0;
        }
        curBatch.push(idx);
        curBytes += fSize;
      }
      if (curBatch.length > 0) batches.push(curBatch);

      for (let bIdx = 0; bIdx < batches.length; bIdx++) {
        const slice = batches[bIdx];
        if (cancelled || indexingStoppedByUserRef.current) return;
        const batchIds = slice.map((i) => audioIds[i]);
        setCurrentBatchTarget(indexedAudioIdsRef.current.size + slice.length);
        const form = new FormData();
        form.append("capsuleId", capsuleId);
        form.append("audioIds", JSON.stringify(batchIds));
        form.append("isLastBatch", bIdx === batches.length - 1 ? "true" : "false");
        slice.forEach((i) => form.append("files", audios[i], audios[i].name));

        const abortCtrl = new AbortController();
        indexingAbortRef.current = abortCtrl;

        try {
          const res = await fetch("/api/smart-search/index", {
            method: "POST",
            body: form,
            signal: abortCtrl.signal,
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `Erreur indexation (${res.status})`);
          }
          batchIds.forEach((id) => indexedAudioIdsRef.current.add(id));
          try {
            sessionStorage.setItem(
              `vosekko_indexed_${capsuleId}`,
              JSON.stringify(Array.from(indexedAudioIdsRef.current))
            );
          } catch {}
          if (!cancelled && !indexingStoppedByUserRef.current) {
            const doneCount = indexedAudioIdsRef.current.size;
            setIndexedCount(doneCount);
            setVisualIndexedCount((prev) => Math.max(prev, doneCount));
            const remaining = Math.max(0, audios.length - doneCount);
            const elapsedSec = (Date.now() - indexingStartRef.current) / 1000;
            const secPerFile = doneCount > 0 ? Math.min(0.8, Math.max(0.12, elapsedSec / doneCount)) : 0.22;
            setEtaSeconds(remaining > 0 ? Math.max(2, Math.round(remaining * secPerFile)) : 0);
          }
        } catch (err) {
          if ((err as Error)?.name === "AbortError" || indexingStoppedByUserRef.current) {
            return;
          }
          if (!cancelled) {
            setIndexingStatus("error");
            setSearchError((err as Error).message);
          }
          return;
        }
      }

      if (!cancelled && !indexingStoppedByUserRef.current) {
        setIndexingStatus("ready");
        setVisualIndexedCount(audios.length);
        setEtaSeconds(0);
      }
    };

    runIndexing();
    return () => {
      cancelled = true;
      indexingAbortRef.current?.abort();
    };
  }, [smartSearchEnabled, capsuleId, audios, audioIds, indexingTrigger]);

  // Progression visuelle fluide entre les lots pour que le % et le compteur X / N avancent régulièrement
  useEffect(() => {
    if (indexingStatus !== "indexing" && !demoProgressActive) return;
    const total = Math.max(1, audios.length);
    const target = demoProgressActive ? total : Math.min(total - 1, Math.max(indexedCount, currentBatchTarget - 1));
    const timer = setInterval(() => {
      setVisualIndexedCount((prev) => {
        if (demoProgressActive) {
          const step = Math.max(1, Math.ceil(total / 35));
          const next = prev + step;
          if (next >= total) {
            setDemoProgressActive(false);
            setEtaSeconds(0);
            return total;
          }
          const rem = total - next;
          setEtaSeconds(Math.max(1, Math.round((rem / total) * 18)));
          return next;
        }
        if (prev < target) return prev + 1;
        return prev;
      });
      if (!demoProgressActive) {
        setEtaSeconds((prev) => (prev !== null && prev > 2 ? prev - 1 : prev));
      }
    }, 380);
    return () => clearInterval(timer);
  }, [indexingStatus, demoProgressActive, indexedCount, currentBatchTarget, audios.length]);

  const executeQueryNow = async (q: string) => {
    if (!q || !capsuleId) return;
    setSearching(true);
    setSearchError(null);
    try {
      const res = await fetch("/api/smart-search/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ capsuleId, query: q, topK: 20 }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la recherche");
      }
      setSearchHits(data.results ?? []);
      setNoRelevantMatch(Boolean(data.noRelevantMatch));
    } catch (err) {
      setSearchError((err as Error).message);
    } finally {
      setSearching(false);
    }
  };

  // Si l'utilisateur avait cliqué sur « Rechercher » pendant la 1re analyse, lancer la requête dès que l'analyse se termine
  useEffect(() => {
    if (indexingStatus === "ready" && pendingSearchQueryRef.current) {
      const q = pendingSearchQueryRef.current;
      pendingSearchQueryRef.current = null;
      executeQueryNow(q);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indexingStatus]);

  const handleRunSearch = async () => {
    const q = searchQuery.trim();
    if (!q || !capsuleId || !smartSearchEnabled) return;
    setSearchError(null);
    if (indexingStatus !== "ready") {
      pendingSearchQueryRef.current = q;
      setSearching(true);
      if (indexingStatus !== "indexing") {
        setIndexingTrigger((v) => v + 1);
      }
      return;
    }
    await executeQueryNow(q);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchHits(null);
    setNoRelevantMatch(false);
    setSearchError(null);
  };

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
    const targetAudioId = audioIds[audioIdx];
    const attachedBookmarks = bookmarks.filter((b) => b.audioId === targetAudioId);
    if (attachedBookmarks.length > 0 && typeof window !== "undefined") {
      const ok = window.confirm(
        `Ce message vocal possède ${attachedBookmarks.length} marque-page(s) (« ${attachedBookmarks.map((b) => b.title).join(", ")} »). En le retirant du montage, ses marque-pages seront également supprimés. Continuer ?`
      );
      if (!ok) return;
      setBookmarks((prev) => prev.filter((b) => b.audioId !== targetAudioId));
    }
    const next = orderedSelected.filter((i) => i !== audioIdx);
    setOrderedSelected(next);
    onSelect(next.map((i) => audios[i]));
  };

  // Liste enrichie des audios sélectionnés avec leur position de départ cumulée dans la Vocapsule
  const selectedAudiosForBookmarks = useMemo(() => {
    let runningSec = 0;
    return orderedSelected.map((audioIdx) => {
      const dur = durations[audioIdx] ?? 0;
      const id = audioIds[audioIdx];
      const item = {
        audioId: id,
        file: audios[audioIdx],
        durationSec: dur,
        startSecInMix: runningSec,
        url: audioUrls[audioIdx],
        customName: customAudioNames[id],
      };
      runningSec += dur;
      return item;
    });
  }, [orderedSelected, durations, audioIds, audios, audioUrls, customAudioNames]);

  const currentManifest: CapsuleManifest = useMemo(
    () => ({
      selectedAudios: orderedSelected.map((audioIdx, pos) => ({
        audioId: audioIds[audioIdx],
        filename: audios[audioIdx]?.name,
        position: pos,
        durationSec: Number((durations[audioIdx] ?? 0).toFixed(2)),
      })),
      bookmarks,
    }),
    [orderedSelected, audioIds, audios, durations, bookmarks]
  );

  useEffect(() => {
    if (onManifestChange) {
      onManifestChange(currentManifest);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentManifest]);

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

      {/* ═══ RECHERCHE INTELLIGENTE EMBEDDINGGEMMA 2 ═══ */}
      {smartSearchEnabled ? (
        <div
          style={{
            marginBottom: 28,
            padding: "24px 26px",
            borderRadius: 16,
            background: "rgba(18, 13, 12, 0.82)",
            border: "1px solid rgba(255,255,255,0.09)",
            boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            <span style={{ fontFamily: "Georgia, serif", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: config.accent }}>
              ✦ Souvenirs intelligents · Recherche vocale IA
            </span>
            <span style={{ fontFamily: "sans-serif", fontSize: 12, color: "rgba(240,232,216,0.5)" }}>
              {indexingStatus === "ready"
                ? `✓ ${audios.length} vocaux prêts pour la recherche`
                : indexingStatus === "error"
                  ? "Service cloud en reconnexion"
                  : ""}
            </span>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleRunSearch(); } }}
              placeholder="Rechercher un souvenir… (ex : Anniversaire maman, Déclaration d'amour, Webinaire Vega)"
              style={{
                flex: "1 1 260px",
                padding: "12px 16px",
                borderRadius: 10,
                background: "#0d090b",
                border: "1px solid rgba(255,255,255,0.13)",
                color: "#f0e8d8",
                fontFamily: "sans-serif",
                fontSize: 13.5,
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={handleRunSearch}
              disabled={searching || !searchQuery.trim()}
              style={{
                padding: "12px 22px",
                borderRadius: 10,
                border: "none",
                background: searching || !searchQuery.trim() ? "rgba(207,163,88,0.28)" : "#cfa358",
                color: searching || !searchQuery.trim() ? "rgba(240,232,216,0.4)" : "#1a130c",
                fontFamily: "sans-serif",
                fontSize: 13.5,
                fontWeight: 600,
                cursor: searching || !searchQuery.trim() ? "not-allowed" : "pointer",
              }}
            >
              {searching ? "Recherche…" : "Rechercher"}
            </button>
            {searchHits !== null && (
              <button
                type="button"
                onClick={clearSearch}
                style={{
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(240,232,216,0.75)",
                  fontFamily: "sans-serif",
                  fontSize: 12.5,
                  cursor: "pointer",
                }}
              >
                Effacer la recherche
              </button>
            )}
          </div>

          {/* Barre de progression fluide colorée (liée au nombre exact de vocaux en dessous) */}
          {(indexingStatus === "indexing" || demoProgressActive) && (() => {
            const total = Math.max(1, audios.length);
            const current = Math.min(total, Math.max(0, visualIndexedCount));
            const pct = Math.min(100, Math.round((current / total) * 100));
            const etaLabel =
              etaSeconds !== null && etaSeconds > 0
                ? etaSeconds >= 60
                  ? `~${Math.floor(etaSeconds / 60)} min ${String(etaSeconds % 60).padStart(2, "0")} s restantes`
                  : `~${etaSeconds} s restantes`
                : "Finalisation…";

            return (
              <div
                style={{
                  marginTop: 14,
                  padding: "14px 16px",
                  borderRadius: 14,
                  background: "rgba(13,10,15,0.55)",
                  border: `1px solid ${config.accent}35`,
                }}
              >
                {/* Barre colorée avec pourcentage à l'intérieur */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: 22,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.max(6, pct)}%`,
                      height: "100%",
                      borderRadius: 999,
                      background: `linear-gradient(90deg, ${config.accent}95, ${config.accent})`,
                      boxShadow: `0 0 16px ${config.accent}66`,
                      transition: "width 0.35s ease-out",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "Georgia, serif",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#fff",
                      textShadow: "0 1px 3px rgba(0,0,0,0.75)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {pct} %
                  </span>
                </div>

                {/* Nombre de vocaux relié au % + Temps restant estimé */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 8,
                    marginTop: 8,
                  }}
                >
                  <span style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "#f0e8d8" }}>
                    <strong>{current}</strong> sur <strong>{total}</strong> vocaux analysés ({pct} %)
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: "Georgia, serif", fontSize: 11, color: config.accent }}>
                      Temps estimé : {etaLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        indexingStoppedByUserRef.current = true;
                        indexingAbortRef.current?.abort();
                        setDemoProgressActive(false);
                        setIndexingStatus("ready");
                        setEtaSeconds(0);
                      }}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 999,
                        cursor: "pointer",
                        background: "rgba(228, 118, 108, 0.14)",
                        border: "1px solid rgba(228, 118, 108, 0.45)",
                        color: "#e4766c",
                        fontFamily: "sans-serif",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      ⏹ Stopper
                    </button>
                  </div>
                </div>

                {/* Mention rassurante : seule la 1re analyse prend du temps */}
                <p
                  style={{
                    fontFamily: "Georgia, serif",
                    fontSize: 11,
                    color: "rgba(240,232,216,0.55)",
                    margin: "8px 0 0",
                    lineHeight: 1.5,
                  }}
                >
                  ✦ Cette première analyse prépare tous vos vocaux (~15 s pour 1 h d&apos;audios, jusqu&apos;à ~2 min pour 10 h) — la recherche de vos mots sera ensuite extrêmement rapide.
                </p>
              </div>
            );
          })()}

          {/* Indicateur visuel quand une recherche est lancée après la 1re analyse */}
          {searching && indexingStatus !== "indexing" && !demoProgressActive && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: 14,
                padding: "14px 16px",
                borderRadius: 14,
                background: "rgba(13,10,15,0.6)",
                border: `1px solid ${config.accent}45`,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Ondes vocales animées */}
                <div style={{ display: "flex", alignItems: "center", gap: 3, height: 18 }}>
                  {[0, 1, 2, 3, 4].map((bar) => (
                    <motion.span
                      key={bar}
                      animate={{ height: [6, 18, 8, 16, 6] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: bar * 0.12, ease: "easeInOut" }}
                      style={{
                        width: 3,
                        borderRadius: 999,
                        background: config.accent,
                        display: "inline-block",
                      }}
                    />
                  ))}
                </div>
                <div>
                  <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "#f0e8d8", margin: 0, fontWeight: 500 }}>
                    Recherche dans vos vocaux en cours…
                  </p>
                  <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: "rgba(240,232,216,0.55)", margin: "2px 0 0" }}>
                    L&apos;IA compare le sens de « {searchQuery.trim()} » parmi vos {audios.length} messages vocaux.
                  </p>
                </div>
              </div>

              {/* Barre lumineuse de réflexion en mouvement */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: 6,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.07)",
                  overflow: "hidden",
                }}
              >
                <motion.div
                  animate={{ x: ["-40%", "140%"] }}
                  transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    width: "45%",
                    height: "100%",
                    borderRadius: 999,
                    background: `linear-gradient(90deg, transparent, ${config.accent}, transparent)`,
                  }}
                />
              </div>
            </motion.div>
          )}

          {searchError && (
            <p style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "#ff8888", margin: "10px 0 0" }}>
              {searchError}
            </p>
          )}

          {/* Résultats de recherche */}
          {searchHits !== null && (
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              {noRelevantMatch || searchHits.length === 0 ? (
                <p style={{ fontFamily: "sans-serif", fontSize: 13, color: "rgba(240,232,216,0.55)", fontStyle: "italic", margin: 0 }}>
                  Aucun message vocal pertinent n&apos;a été trouvé pour « {searchQuery} ». Essayez d&apos;autres mots-clés.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <p style={{ fontFamily: "sans-serif", fontSize: 12, color: "rgba(240,232,216,0.5)", margin: "0 0 4px" }}>
                    {searchHits.length} souvenir{searchHits.length > 1 ? "s" : ""} pertinent{searchHits.length > 1 ? "s" : ""} trouvé{searchHits.length > 1 ? "s" : ""} (classés du plus proche au moins proche) :
                  </p>
                  {searchHits.map((hit) => {
                    const idx = audioIdToIndex.get(hit.audioId);
                    if (idx === undefined) return null;
                    const file = audios[idx];
                    const inOrder = selectedSet.has(idx);
                    const dateKey = extractDateKey(file);
                    const dur = durations[idx] || hit.durationSec;
                    const url = audioUrls[idx];
                    const cleanName = file.name.replace(/\.(mp3|wav|ogg|oga|m4a|aac|opus|flac|weba|3gp|amr|mp4|mpeg)$/i, "");
                    const badgeColor =
                      hit.relevanceLabel === "Très pertinent"
                        ? "#57c88a"
                        : hit.relevanceLabel === "Pertinent"
                          ? "#cfa358"
                          : "rgba(240,232,216,0.55)";

                    return (
                      <div
                        key={hit.audioId}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: 12,
                          padding: "12px 16px",
                          borderRadius: 12,
                          background: "#151011",
                          border: `1px solid ${inOrder ? "rgba(87, 200, 138, 0.55)" : "rgba(201, 169, 110, 0.34)"}`,
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 12px rgba(0,0,0,0.28)",
                        }}
                      >
                        <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                            <span
                              style={{
                                fontFamily: "sans-serif",
                                fontSize: 11,
                                fontWeight: 500,
                                padding: "2px 9px",
                                borderRadius: 999,
                                background: `${badgeColor}18`,
                                border: `1px solid ${badgeColor}55`,
                                color: badgeColor,
                              }}
                            >
                              {hit.relevanceLabel}
                            </span>
                            <span style={{ fontFamily: "sans-serif", fontSize: 13.5, color: "#f0e8d8", fontWeight: 500 }}>
                              {customAudioNames[hit.audioId] ? (
                                <>
                                  <span style={{ color: config.accent, fontWeight: 600 }}>{customAudioNames[hit.audioId]}</span>
                                  <span style={{ color: "rgba(240,232,216,0.45)", fontSize: 12, marginLeft: 8 }}>({cleanName})</span>
                                </>
                              ) : (
                                cleanName
                              )}
                            </span>
                          </div>
                            <p style={{ fontFamily: "sans-serif", fontSize: 11.5, color: "rgba(240,232,216,0.45)", margin: "5px 0 0" }}>
                              {dateKey ? friendlyDate(dateKey) : "Date inconnue"} · Durée : {formatDuration(dur)}
                            </p>
                          </div>

                          {url && (
                            <div style={{ flexShrink: 0 }}>
                              {isMobile ? (
                                <MobileAudioPlayer url={url} accent={config.accent} />
                              ) : (
                                <audio
                                  src={url}
                                  controls
                                  style={{ width: 175, height: 30, borderRadius: 6, accentColor: config.accent }}
                                />
                              )}
                            </div>
                          )}

                        <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: 6, minWidth: 155 }}>
                          <button
                            type="button"
                            onClick={() => {
                              if (inOrder) {
                                removeFromOrder(idx);
                                if (namingAudioId === hit.audioId) setNamingAudioId(null);
                              } else {
                                const next = [...orderedSelected, idx];
                                setOrderedSelected(next);
                                onSelect(next.map((i) => audios[i]));
                              }
                            }}
                            style={{
                              padding: "8px 15px",
                              borderRadius: 9,
                              cursor: "pointer",
                              fontFamily: "sans-serif",
                              fontSize: 12.5,
                              fontWeight: 500,
                              background: inOrder ? "rgba(87, 200, 138, 0.14)" : "rgba(207, 163, 88, 0.16)",
                              border: `1px solid ${inOrder ? "rgba(87, 200, 138, 0.55)" : "#cfa358"}`,
                              color: inOrder ? "#57c88a" : "#f0e8d8",
                            }}
                          >
                            {inOrder ? "✓ Dans la sélection" : "+ Ajouter à la sélection"}
                          </button>

                          {inOrder && (
                            namingAudioId === hit.audioId ? (
                              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                <input
                                  type="text"
                                  autoFocus
                                  value={namingDraft}
                                  maxLength={60}
                                  placeholder="Nommer cet audio…"
                                  onChange={(e) => setNamingDraft(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      const val = namingDraft.trim();
                                      setCustomAudioNames((prev) => ({ ...prev, [hit.audioId]: val }));
                                      setBookmarks((prev) =>
                                        prev.some((b) => b.audioId === hit.audioId)
                                          ? prev.map((b) => (b.audioId === hit.audioId && val ? { ...b, title: val } : b))
                                          : prev
                                      );
                                      setNamingAudioId(null);
                                    } else if (e.key === "Escape") {
                                      setNamingAudioId(null);
                                    }
                                  }}
                                  style={{
                                    width: 125,
                                    padding: "6px 9px",
                                    borderRadius: 7,
                                    background: "#0b0809",
                                    border: `1px solid ${config.accent}80`,
                                    color: "#f0e8d8",
                                    fontFamily: "sans-serif",
                                    fontSize: 12,
                                    outline: "none",
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const val = namingDraft.trim();
                                    setCustomAudioNames((prev) => ({ ...prev, [hit.audioId]: val }));
                                    setBookmarks((prev) =>
                                      prev.some((b) => b.audioId === hit.audioId)
                                        ? prev.map((b) => (b.audioId === hit.audioId && val ? { ...b, title: val } : b))
                                        : prev
                                    );
                                    setNamingAudioId(null);
                                  }}
                                  style={{
                                    padding: "6px 9px",
                                    borderRadius: 7,
                                    cursor: "pointer",
                                    background: config.accent,
                                    border: "none",
                                    color: "#1a130c",
                                    fontFamily: "sans-serif",
                                    fontSize: 11.5,
                                    fontWeight: 700,
                                  }}
                                >
                                  OK
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setNamingAudioId(hit.audioId);
                                  setNamingDraft(customAudioNames[hit.audioId] ?? "");
                                }}
                                style={{
                                  padding: "6px 12px",
                                  borderRadius: 8,
                                  cursor: "pointer",
                                  fontFamily: "sans-serif",
                                  fontSize: 11.5,
                                  fontWeight: 500,
                                  background: customAudioNames[hit.audioId] ? `${config.accent}18` : "rgba(255,255,255,0.04)",
                                  border: `1px solid ${customAudioNames[hit.audioId] ? config.accent + "65" : "rgba(255,255,255,0.14)"}`,
                                  color: customAudioNames[hit.audioId] ? config.accent : "rgba(240,232,216,0.78)",
                                  textAlign: "center",
                                }}
                              >
                                {customAudioNames[hit.audioId] ? `✎ ${customAudioNames[hit.audioId]}` : "✎ Nommer"}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}

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
                        background: isDraggingThis ? "rgba(255,255,255,0.02)" : "rgba(18, 13, 12, 0.80)",
                        border: `1px solid ${inOrder ? config.accent + "85" : isDraggingThis ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.15)"}`,
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
            minHeight: 120, borderRadius: 18, padding: "20px 22px",
            background: zone2Over && orderedSelected.length === 0 ? `${config.accent}10` : "rgba(18, 13, 12, 0.84)",
            border: `1px solid ${zone2Over && orderedSelected.length === 0 ? config.accent + "60" : "rgba(255,255,255,0.11)"}`,
            boxShadow: "0 12px 32px rgba(0,0,0,0.42)",
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
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 16px", borderRadius: 12,
                        background: isDraggingThis ? "rgba(255,255,255,0.02)" : "#151011",
                        border: `1px solid ${isDraggingThis ? "rgba(255,255,255,0.06)" : "rgba(201, 169, 110, 0.34)"}`,
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 12px rgba(0,0,0,0.28)",
                        opacity: isDraggingThis ? 0.4 : 1,
                        cursor: "grab", userSelect: "none",
                        transition: "opacity 0.15s, border-color 0.15s",
                      }}
                    >
                      <div style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, background: `${config.accent}18`, border: `1.5px solid ${config.accent}60`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontFamily: "Georgia, serif", fontSize: 11.5, fontWeight: 700, color: config.accent }}>{pos + 1}</span>
                      </div>
                      <svg viewBox="0 0 16 16" fill="currentColor" style={{ width: 10, height: 10, color: "rgba(240,232,216,0.28)", flexShrink: 0 }}>
                        <rect x="2" y="3" width="12" height="1.5" rx="0.5"/><rect x="2" y="7" width="12" height="1.5" rx="0.5"/><rect x="2" y="11" width="12" height="1.5" rx="0.5"/>
                      </svg>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "Georgia, serif", fontSize: 13.5, margin: 0, color: "#f0e8d8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {customAudioNames[audioIds[audioIdx]] ? (
                            <>
                              <span style={{ color: config.accent, fontWeight: 600 }}>{customAudioNames[audioIds[audioIdx]]}</span>
                              <span style={{ color: "rgba(240,232,216,0.4)", fontSize: 11.5, marginLeft: 8 }}>({cleanName})</span>
                            </>
                          ) : (
                            cleanName
                          )}
                        </p>
                        <div style={{ display: "flex", gap: 6, marginTop: 3, alignItems: "center" }}>
                          <span style={{ fontFamily: "Georgia, serif", fontSize: 10, color: srcColor }}>{source}</span>
                          {dur !== undefined && dur > 0 && <span style={{ fontFamily: "Georgia, serif", fontSize: 10.5, color: "rgba(240,232,216,0.42)" }}>{formatDuration(dur)}</span>}
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

      {/* ═══ ZONE 3 — Marque-pages (si option Souvenirs intelligents activée, sinon proposition d'activation sous le montage) ═══ */}
      {smartSearchEnabled ? (
        <BookmarkEditor
          selectedAudios={selectedAudiosForBookmarks}
          bookmarks={bookmarks}
          onChangeBookmarks={setBookmarks}
          onReorderAudios={(newOrderedIds) => {
            const nextIndices = newOrderedIds
              .map((id) => audioIdToIndex.get(id))
              .filter((idx): idx is number => idx !== undefined);
            if (nextIndices.length === orderedSelected.length) {
              setOrderedSelected(nextIndices);
              onSelect(nextIndices.map((i) => audios[i]));
            }
          }}
          accent={config.accent}
        />
      ) : (
        onRequestEnableSmartOption && orderedSelected.length > 0 && (
          <div
            style={{
              marginBottom: 24,
              padding: "20px 22px",
              borderRadius: 18,
              background: "rgba(18, 13, 12, 0.84)",
              border: `1px solid ${config.accent}45`,
              boxShadow: "0 12px 32px rgba(0,0,0,0.42)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
              <div style={{ flex: "1 1 260px" }}>
                <p style={{ fontFamily: "Georgia, serif", fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", color: config.accent, margin: "0 0 6px", fontWeight: 600 }}>
                  ✦ Option · Repères sur la ligne de lecture (+3 €)
                </p>
                <p style={{ fontFamily: "Georgia, serif", fontSize: 17, color: "#f0e8d8", margin: "0 0 6px" }}>
                  Ajoutez des marque-pages colorés à votre vocapsule
                </p>
                <p style={{ fontFamily: "sans-serif", fontSize: 13, color: "rgba(240,232,216,0.62)", margin: 0, lineHeight: 1.6 }}>
                  Nommez chaque souvenir de votre montage et placez des repères de couleur sur la piste de lecture pour y accéder en un toucher (débloque aussi la recherche IA).
                </p>
              </div>
              <button
                type="button"
                onClick={onRequestEnableSmartOption}
                style={{
                  padding: "12px 18px",
                  borderRadius: 12,
                  cursor: "pointer",
                  background: `linear-gradient(135deg, ${config.accent}40, ${config.accent}80)`,
                  border: `1px solid ${config.accent}`,
                  color: "#fff",
                  fontFamily: "Georgia, serif",
                  fontSize: 13.5,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  boxShadow: `0 6px 20px ${config.accent}25`,
                }}
              >
                Ajouter les repères (+3 €)
              </button>
            </div>

            {/* Aperçu visuel de la bande chronologique colorée */}
            <div
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", height: 11, borderRadius: 999, background: "rgba(255,255,255,0.04)", padding: 2, gap: 4 }}>
                <div style={{ flex: 3, borderRadius: 999, background: "#d4a857" }} />
                <div style={{ flex: 3.5, borderRadius: 999, background: "#57c88a" }} />
                <div style={{ flex: 2.5, borderRadius: 999, background: "#5ea6e8" }} />
                <div style={{ flex: 3, borderRadius: 999, background: "#e4766c" }} />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                  { label: "Anniversaire maman", time: "00:12", color: "#d4a857" },
                  { label: "Je t'aime", time: "01:45", color: "#57c88a" },
                  { label: "Vacances", time: "03:20", color: "#5ea6e8" },
                ].map((tag) => (
                  <span
                    key={tag.label}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: `${tag.color}16`,
                      border: `1px solid ${tag.color}65`,
                      fontFamily: "sans-serif",
                      fontSize: 11,
                      color: "#f0e8d8",
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: tag.color }} />
                    <span>{tag.label}</span>
                    <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 10.5, color: tag.color, fontWeight: 600 }}>{tag.time}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )
      )}

      {/* Action buttons */}
      <div className="audio-cta-grid" style={{ display: "grid", gridTemplateColumns: showLivre ? "1fr 1fr" : "1fr", gap: 12 }}>
        <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.97 }}
          onClick={() => {
            const chosenFiles = orderedSelected.map((i) => audios[i]);
            onSelect(chosenFiles);
            onVocapsule(currentManifest, chosenFiles);
          }}
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
