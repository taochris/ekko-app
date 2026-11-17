import { getAdminBucket, getAdminFirestore } from "./firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Quotas configurables côté serveur via variables d'environnement pour maîtriser les coûts GPU Serverless.
 */
export const SMART_SEARCH_QUOTAS = {
  // Volume max d'audios analysables par commande (défaut : 100 heures = 360 000 s)
  maxTotalIndexedDurationSec: Number(process.env.SMART_SEARCH_MAX_DURATION_SEC ?? 360000),
  // Nombre max de fichiers vocaux analysables par commande (défaut : 15 000 vocaux)
  maxIndexedFiles: Number(process.env.SMART_SEARCH_MAX_FILES ?? 15000),
  // Nombre max de recherches par commande (défaut : 150 recherches)
  maxQueriesPerCapsule: Number(process.env.SMART_SEARCH_MAX_QUERIES ?? 150),
};

export interface StoredSegmentVector {
  startSec: number;
  endSec: number;
  vector: number[];
}

export interface StoredIndexedAudio {
  audioId: string;
  filename: string;
  durationSec: number;
  segmentVectors: StoredSegmentVector[];
}

export interface StoredVectorIndex {
  capsuleId: string;
  uid: string;
  updatedAt: string;
  totalDurationSec: number;
  audios: Record<string, StoredIndexedAudio>;
}

const globalForVectors = globalThis as unknown as {
  __vosekkoVectorCache?: Map<string, StoredVectorIndex>;
  __vosekkoPendingSaves?: Map<string, Promise<void>>;
};

const memoryCache =
  globalForVectors.__vosekkoVectorCache ??
  (globalForVectors.__vosekkoVectorCache = new Map<string, StoredVectorIndex>());

const pendingSaves =
  globalForVectors.__vosekkoPendingSaves ??
  (globalForVectors.__vosekkoPendingSaves = new Map<string, Promise<void>>());

function getIndexStoragePath(capsuleId: string): string {
  return `temp-vectors/${capsuleId}/index.json`;
}

/**
 * Charge l'index vectoriel temporaire depuis le cache mémoire (instantané entre deux lots)
 * ou depuis Firebase Storage.
 */
export async function loadVectorIndex(capsuleId: string, uid: string): Promise<StoredVectorIndex> {
  const cached = memoryCache.get(capsuleId);
  if (cached) {
    return cached;
  }
  try {
    const pending = pendingSaves.get(capsuleId);
    if (pending) {
      await pending.catch(() => {});
    }
    const bucket = getAdminBucket();
    const file = bucket.file(getIndexStoragePath(capsuleId));
    const [exists] = await file.exists();
    if (!exists) {
      const empty: StoredVectorIndex = {
        capsuleId,
        uid,
        updatedAt: new Date().toISOString(),
        totalDurationSec: 0,
        audios: {},
      };
      memoryCache.set(capsuleId, empty);
      return empty;
    }
    const [buf] = await file.download();
    const parsed = JSON.parse(buf.toString("utf8")) as StoredVectorIndex;
    memoryCache.set(capsuleId, parsed);
    return parsed;
  } catch {
    const empty: StoredVectorIndex = {
      capsuleId,
      uid,
      updatedAt: new Date().toISOString(),
      totalDurationSec: 0,
      audios: {},
    };
    memoryCache.set(capsuleId, empty);
    return empty;
  }
}

async function persistIndexToStorage(capsuleId: string, uid: string, index: StoredVectorIndex): Promise<void> {
  const bucket = getAdminBucket();
  const file = bucket.file(getIndexStoragePath(capsuleId));
  const payload = JSON.stringify(index);
  await file.save(payload, {
    resumable: false,
    metadata: {
      contentType: "application/json",
      metadata: {
        capsuleId,
        uid,
        updatedAt: index.updatedAt,
      },
    },
  });
}

/**
 * Sauvegarde / fusionne un lot de vecteurs dans l'index en mémoire,
 * et persiste sur Firebase Storage (en arrière-plan entre les lots pour ne pas bloquer Modal,
 * et de façon synchrone sur le dernier lot).
 */
export async function upsertVectorIndexBatch(
  capsuleId: string,
  uid: string,
  items: StoredIndexedAudio[],
  existingIndex?: StoredVectorIndex,
  waitForStorage = false
): Promise<{ totalFiles: number; totalDurationSec: number; quotaExceeded?: string }> {
  const index = existingIndex ?? (await loadVectorIndex(capsuleId, uid));

  for (const item of items) {
    index.audios[item.audioId] = item;
  }

  const allAudios = Object.values(index.audios);
  const totalFiles = allAudios.length;
  const totalDurationSec = Number(
    allAudios.reduce((acc, a) => acc + (Number(a.durationSec) || 0), 0).toFixed(2)
  );

  if (totalFiles > SMART_SEARCH_QUOTAS.maxIndexedFiles) {
    return {
      totalFiles,
      totalDurationSec,
      quotaExceeded: `Quota dépassé : maximum ${SMART_SEARCH_QUOTAS.maxIndexedFiles} fichiers analysables par commande.`,
    };
  }
  if (totalDurationSec > SMART_SEARCH_QUOTAS.maxTotalIndexedDurationSec) {
    const maxHours = Math.round(SMART_SEARCH_QUOTAS.maxTotalIndexedDurationSec / 3600);
    return {
      totalFiles,
      totalDurationSec,
      quotaExceeded: `Quota dépassé : volume maximal d'analyse atteint (${maxHours}h d'audio par commande).`,
    };
  }

  index.updatedAt = new Date().toISOString();
  index.totalDurationSec = totalDurationSec;
  memoryCache.set(capsuleId, index);

  const prevSave = pendingSaves.get(capsuleId) ?? Promise.resolve();
  const nextSave = prevSave
    .catch(() => {})
    .then(() => persistIndexToStorage(capsuleId, uid, index));
  pendingSaves.set(capsuleId, nextSave);

  if (waitForStorage) {
    await nextSave;
  }

  return { totalFiles, totalDurationSec };
}

/**
 * Supprime définitivement l'index vectoriel temporaire de Firebase Storage
 * une fois la Vocapsule validée (maîtrise des coûts et confidentialité RGPD).
 */
export async function deleteVectorIndex(capsuleId: string): Promise<void> {
  memoryCache.delete(capsuleId);
  pendingSaves.delete(capsuleId);
  try {
    const bucket = getAdminBucket();
    await bucket.file(getIndexStoragePath(capsuleId)).delete({ ignoreNotFound: true });
  } catch {
    // ignore
  }
}

/**
 * Vérifie et incrémente le compteur de requêtes de recherche pour protéger contre les abus.
 */
export async function checkAndIncrementSearchQuota(capsuleId: string): Promise<{ allowed: boolean; count: number }> {
  const db = getAdminFirestore();
  const ref = db.collection("capsules").doc(capsuleId);
  const snap = await ref.get();
  const current = Number(snap.data()?.smartSearchQueryCount ?? 0);
  if (current >= SMART_SEARCH_QUOTAS.maxQueriesPerCapsule) {
    return { allowed: false, count: current };
  }
  await ref.update({
    smartSearchQueryCount: FieldValue.increment(1),
    smartSearchLastQueryAt: new Date().toISOString(),
  });
  return { allowed: true, count: current + 1 };
}

function computeRelevanceLabel(
  score: number,
  bestScore: number,
  gapFromMedian: number,
  zScore: number
): "Très pertinent" | "Pertinent" | "Piste possible" | null {
  if (score < 0.655 || gapFromMedian < 0.032 || zScore < 1.35) {
    return null;
  }
  if ((score >= 0.70 && gapFromMedian >= 0.055) || (score >= bestScore - 0.015 && zScore >= 2.2)) {
    return "Très pertinent";
  }
  if (score >= 0.675 || gapFromMedian >= 0.042 || zScore >= 1.75) {
    return "Pertinent";
  }
  return "Piste possible";
}

/**
 * Recherche vectorielle cosinus exécutée directement en Node.js sur l'index stocké,
 * sans avoir besoin de rallumer un GPU ni de renvoyer les audios !
 */
export function rankStoredVectors(
  index: StoredVectorIndex,
  queryVector: number[],
  topK = 20
): {
  results: Array<{
    audioId: string;
    filename: string;
    durationSec: number;
    relevanceLabel: "Très pertinent" | "Pertinent" | "Piste possible";
    bestSegmentStartSec: number;
    bestSegmentEndSec: number;
    rank: number;
  }>;
  noRelevantMatch: boolean;
  totalIndexed: number;
} {
  const audioList = Object.values(index.audios);
  if (audioList.length === 0 || queryVector.length === 0) {
    return { results: [], noRelevantMatch: true, totalIndexed: 0 };
  }

  let qNorm = 0;
  for (let i = 0; i < queryVector.length; i++) qNorm += queryVector[i] * queryVector[i];
  qNorm = Math.sqrt(qNorm) || 1;

  const rawScores: Array<{
    audioId: string;
    filename: string;
    durationSec: number;
    score: number;
    bestSegmentStartSec: number;
    bestSegmentEndSec: number;
  }> = [];

  for (const audio of audioList) {
    let bestSegScore = -1;
    let bestStart = 0;
    let bestEnd = audio.durationSec;

    for (const seg of audio.segmentVectors || []) {
      const v = seg.vector;
      if (!v || v.length !== queryVector.length) continue;
      let dot = 0;
      let vNorm = 0;
      for (let i = 0; i < v.length; i++) {
        dot += queryVector[i] * v[i];
        vNorm += v[i] * v[i];
      }
      vNorm = Math.sqrt(vNorm) || 1;
      const sim = dot / (qNorm * vNorm);
      if (sim > bestSegScore) {
        bestSegScore = sim;
        bestStart = seg.startSec;
        bestEnd = seg.endSec;
      }
    }

    if (bestSegScore > -1) {
      rawScores.push({
        audioId: audio.audioId,
        filename: audio.filename,
        durationSec: audio.durationSec,
        score: bestSegScore,
        bestSegmentStartSec: bestStart,
        bestSegmentEndSec: bestEnd,
      });
    }
  }

  if (rawScores.length === 0) {
    return { results: [], noRelevantMatch: true, totalIndexed: 0 };
  }

  rawScores.sort((a, b) => b.score - a.score);
  const allVals = rawScores.map((x) => x.score);
  const bestScore = allVals[0];
  const sortedVals = [...allVals].sort((a, b) => a - b);
  const mid = Math.floor(sortedVals.length / 2);
  const medianScore =
    sortedVals.length % 2 !== 0
      ? sortedVals[mid]
      : (sortedVals[mid - 1] + sortedVals[mid]) / 2;

  const mean = allVals.reduce((a, b) => a + b, 0) / allVals.length;
  const variance = allVals.reduce((a, b) => a + (b - mean) * (b - mean), 0) / allVals.length;
  const stdScore = Math.sqrt(variance) || 0.02;

  if (bestScore < 0.655 || (allVals.length >= 4 && bestScore - medianScore < 0.035)) {
    return { results: [], noRelevantMatch: true, totalIndexed: rawScores.length };
  }

  const filtered: Array<{
    audioId: string;
    filename: string;
    durationSec: number;
    relevanceLabel: "Très pertinent" | "Pertinent" | "Piste possible";
    bestSegmentStartSec: number;
    bestSegmentEndSec: number;
    rank: number;
  }> = [];

  for (const item of rawScores.slice(0, topK)) {
    const gap = item.score - medianScore;
    const zScore = gap / Math.max(stdScore, 0.01);
    const label = computeRelevanceLabel(item.score, bestScore, gap, zScore);
    if (!label) continue;
    filtered.push({
      audioId: item.audioId,
      filename: item.filename,
      durationSec: item.durationSec,
      relevanceLabel: label,
      bestSegmentStartSec: item.bestSegmentStartSec,
      bestSegmentEndSec: item.bestSegmentEndSec,
      rank: filtered.length + 1,
    });
  }

  return {
    results: filtered,
    noRelevantMatch: filtered.length === 0,
    totalIndexed: rawScores.length,
  };
}
