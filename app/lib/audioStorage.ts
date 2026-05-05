import { storage } from "./firebase";
import { ref, uploadBytes, listAll, deleteObject } from "firebase/storage";

const ALLOWED_EXTENSIONS = new Set([
  "mp3", "wav", "ogg", "oga", "m4a", "aac", "opus", "flac", "weba", "3gp", "amr", "mp4",
]);

/**
 * Vérifie les magic bytes d'un fichier audio.
 * Retourne true si les premiers octets correspondent à un format audio connu.
 */
async function isValidAudioMagic(file: File): Promise<boolean> {
  const buf = await file.slice(0, 12).arrayBuffer();
  const b = new Uint8Array(buf);
  // MP3 : ID3 tag (49 44 33) ou frame sync (FF FB / FF F3 / FF F2)
  if (b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33) return true;
  if (b[0] === 0xFF && (b[1] === 0xFB || b[1] === 0xF3 || b[1] === 0xF2)) return true;
  // OGG (OggS) : 4F 67 67 53
  if (b[0] === 0x4F && b[1] === 0x67 && b[2] === 0x67 && b[3] === 0x53) return true;
  // RIFF/WAV : 52 49 46 46
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46) return true;
  // FLAC : 66 4C 61 43
  if (b[0] === 0x66 && b[1] === 0x4C && b[2] === 0x61 && b[3] === 0x43) return true;
  // MP4/M4A/AAC : ftyp box (offset 4) : 66 74 79 70
  if (b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70) return true;
  // WebM/WEBA : 1A 45 DF A3
  if (b[0] === 0x1A && b[1] === 0x45 && b[2] === 0xDF && b[3] === 0xA3) return true;
  // AMR : 23 21 41 4D 52
  if (b[0] === 0x23 && b[1] === 0x21 && b[2] === 0x41 && b[3] === 0x4D && b[4] === 0x52) return true;
  return false;
}

/**
 * Valide et upload une liste de fichiers audio vers Firebase Storage sous /temp/{uploadId}/
 * Retourne l'uploadId (UUID) permettant de récupérer les fichiers après paiement.
 * Lève une erreur explicite si un fichier est invalide.
 */
export async function uploadAudiosToStorage(files: File[]): Promise<string> {
  if (files.length === 0) throw new Error("Aucun fichier fourni.");

  for (const file of files) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTENSIONS.has(ext)) throw new Error(`Extension non autorisée : .${ext}`);

    // Sanitize le nom : supprimer tout ce qui n'est pas alphanumérique, tiret, underscore, point
    const safeName = file.name.replace(/[^a-zA-Z0-9._\-]/g, "_");
    if (safeName !== file.name) {
      Object.defineProperty(file, "name", { value: safeName });
    }

    const valid = await isValidAudioMagic(file);
    if (!valid) throw new Error(`Le fichier ${file.name} ne semble pas être un fichier audio valide.`);
  }

  const uploadId = crypto.randomUUID();
  await Promise.all(
    files.map((file, i) => {
      const idx = String(i).padStart(4, "0");
      const safeName = file.name.replace(/[^a-zA-Z0-9._\-]/g, "_");
      const fileRef = ref(storage, `temp/${uploadId}/${idx}_${safeName}`);
      return uploadBytes(fileRef, file, { contentType: file.type || "audio/octet-stream" });
    })
  );
  return uploadId;
}

/**
 * Récupère les fichiers audio depuis Firebase Storage via la route API Next.js
 * (évite les erreurs CORS du browser sur les requêtes directes).
 */
export async function downloadAudiosFromStorage(uploadId: string): Promise<File[]> {
  const res = await fetch(`/api/storage/download?upload_id=${uploadId}`);
  if (!res.ok) throw new Error(`Download API error: ${res.status}`);
  const data = await res.json();
  return (data.files as { name: string; b64: string; contentType: string }[]).map(
    ({ name, b64, contentType }) => {
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      return new File([bytes], name, { type: contentType });
    }
  );
}

/**
 * Supprime les fichiers temporaires après usage.
 */
export async function deleteAudiosFromStorage(uploadId: string): Promise<void> {
  const folderRef = ref(storage, `temp/${uploadId}`);
  const list = await listAll(folderRef);
  await Promise.all(list.items.map((itemRef) => deleteObject(itemRef)));
}
