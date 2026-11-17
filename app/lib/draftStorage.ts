"use client";

import { computeStableAudioId } from "./audioStorage";
import type { BookmarkDraftItem } from "./capsules";

const DB_NAME = "vosekko_drafts_db";
const DB_VERSION = 1;
const STORE_FILES = "audio_files";
const STORE_STATE = "draft_state";

export interface StoredDraftState {
  key: string; // ex: capsuleId ou "current"
  capsuleId?: string | null;
  theme: string;
  variant: "numerique" | "porteClef";
  smartSearchEnabled: boolean;
  orderedAudioIds: string[];
  bookmarks: BookmarkDraftItem[];
  storageOption?: number;
  engraveName?: string;
  engravingFont?: string;
  format?: string;
  nfcEnabled?: boolean;
  updatedAt: number;
}

interface StoredAudioFileRecord {
  id: string; // `${draftKey}::${audioId}`
  draftKey: string;
  audioId: string;
  name: string;
  type: string;
  lastModified: number;
  buffer: ArrayBuffer;
}

function openDraftDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      reject(new Error("IndexedDB non disponible"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_FILES)) {
        const filesStore = db.createObjectStore(STORE_FILES, { keyPath: "id" });
        filesStore.createIndex("by_draft", "draftKey", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_STATE)) {
        db.createObjectStore(STORE_STATE, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveDraftAudios(draftKey: string, files: File[]): Promise<void> {
  try {
    const db = await openDraftDb();
    const records: StoredAudioFileRecord[] = [];
    for (let idx = 0; idx < files.length; idx++) {
      const f = files[idx];
      try {
        const buffer = await f.arrayBuffer();
        const audioId = computeStableAudioId(f, idx);
        records.push({
          id: `${draftKey}::${audioId}`,
          draftKey,
          audioId,
          name: f.name,
          type: f.type || "audio/ogg",
          lastModified: f.lastModified || Date.now(),
          buffer,
        });
      } catch (fileErr) {
        console.warn("[draftStorage] impossible de lire le fichier:", f.name, fileErr);
      }
    }

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_FILES, "readwrite");
      const store = tx.objectStore(STORE_FILES);
      const idx = store.index("by_draft");
      const clearReq = idx.openKeyCursor(IDBKeyRange.only(draftKey));
      clearReq.onsuccess = () => {
        const cursor = clearReq.result;
        if (cursor) {
          store.delete(cursor.primaryKey);
          cursor.continue();
        } else {
          for (const rec of records) {
            store.put(rec);
          }
        }
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (e) {
    console.warn("[draftStorage] saveDraftAudios warning:", e);
  }
}

export async function loadDraftAudios(draftKey: string): Promise<File[]> {
  try {
    const db = await openDraftDb();
    const records = await new Promise<StoredAudioFileRecord[]>((resolve, reject) => {
      const tx = db.transaction(STORE_FILES, "readonly");
      const store = tx.objectStore(STORE_FILES);
      const idx = store.index("by_draft");
      const req = idx.getAll(IDBKeyRange.only(draftKey));
      req.onsuccess = () => resolve((req.result as StoredAudioFileRecord[]) ?? []);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return records.map(
      (r) => new File([r.buffer], r.name, { type: r.type, lastModified: r.lastModified })
    );
  } catch (e) {
    console.warn("[draftStorage] loadDraftAudios warning:", e);
    return [];
  }
}

export async function copyDraftAudiosKey(fromKey: string, toKey: string): Promise<void> {
  if (fromKey === toKey) return;
  const files = await loadDraftAudios(fromKey);
  if (files.length > 0) {
    await saveDraftAudios(toKey, files);
  }
}

export async function saveDraftState(state: StoredDraftState): Promise<void> {
  try {
    const db = await openDraftDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_STATE, "readwrite");
      tx.objectStore(STORE_STATE).put({ ...state, updatedAt: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (e) {
    console.warn("[draftStorage] saveDraftState warning:", e);
  }
}

export async function loadDraftState(key: string): Promise<StoredDraftState | null> {
  try {
    const db = await openDraftDb();
    const res = await new Promise<StoredDraftState | null>((resolve, reject) => {
      const tx = db.transaction(STORE_STATE, "readonly");
      const req = tx.objectStore(STORE_STATE).get(key);
      req.onsuccess = () => resolve((req.result as StoredDraftState) ?? null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return res;
  } catch {
    return null;
  }
}

export async function clearDraft(draftKey: string): Promise<void> {
  try {
    const db = await openDraftDb();
    await new Promise<void>((resolve) => {
      const tx = db.transaction([STORE_FILES, STORE_STATE], "readwrite");
      tx.objectStore(STORE_STATE).delete(draftKey);
      const filesStore = tx.objectStore(STORE_FILES);
      const idx = filesStore.index("by_draft");
      const req = idx.openKeyCursor(IDBKeyRange.only(draftKey));
      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          filesStore.delete(cursor.primaryKey);
          cursor.continue();
        }
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
    db.close();
  } catch {
    // ignore
  }
}
