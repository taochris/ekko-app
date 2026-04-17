import { storage } from "./firebase";
import { ref, uploadBytes, getBlob, listAll, deleteObject } from "firebase/storage";

/**
 * Upload une liste de fichiers audio vers Firebase Storage sous /temp/{uploadId}/
 * Retourne l'uploadId (UUID) permettant de récupérer les fichiers après paiement.
 */
export async function uploadAudiosToStorage(files: File[]): Promise<string> {
  const uploadId = crypto.randomUUID();
  await Promise.all(
    files.map((file, i) => {
      const idx = String(i).padStart(4, "0");
      const fileRef = ref(storage, `temp/${uploadId}/${idx}_${file.name}`);
      return uploadBytes(fileRef, file);
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
