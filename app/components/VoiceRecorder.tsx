"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceRecorderProps {
  accent: string;
  onRecorded: (file: File) => void;
}

const MIME_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];

const formatTime = (s: number) =>
  `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

export default function VoiceRecorder({ accent, onRecorded }: VoiceRecorderProps) {
  const [open, setOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [time, setTime] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const previewUrl = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const clearTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  useEffect(() => () => {
    clearTimer();
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const start = async () => {
    setError(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Votre navigateur ne permet pas l'enregistrement audio. Utilisez la sélection de fichiers.");
      return;
    }
    const mimeType = MIME_TYPES.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        setBlob(new Blob(chunksRef.current, { type: mr.mimeType || mimeType || "audio/webm" }));
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      setBlob(null);
      setTime(0);
      setIsRecording(true);
      timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/Permission|NotAllowed|denied/i.test(msg)) setError("Accès au micro refusé. Autorisez le micro dans les réglages de votre navigateur.");
      else if (/NotFound|Devices/i.test(msg)) setError("Aucun micro détecté sur cet appareil.");
      else setError(`Impossible d'accéder au micro : ${msg}`);
    }
  };

  const stop = () => {
    recorderRef.current?.stop();
    setIsRecording(false);
    clearTimer();
  };

  const reset = () => { setBlob(null); setTime(0); };

  const validate = () => {
    if (!blob) return;
    const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
    const ext = blob.type.includes("mp4") ? "mp4" : blob.type.includes("ogg") ? "ogg" : "webm";
    onRecorded(new File([blob], `enregistrement-${ts}.${ext}`, { type: blob.type || "audio/webm" }));
    reset();
    setOpen(false);
  };

  return (
    <div style={{ marginTop: 20 }}>
      <button
        type="button"
        onClick={() => { if (open && isRecording) stop(); reset(); setOpen(!open); }}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderRadius: 14, cursor: "pointer",
          background: open ? `${accent}15` : "rgba(255,255,255,0.04)",
          border: `1px solid ${open ? accent + "50" : "rgba(255,255,255,0.07)"}`,
          color: open ? accent : "rgba(240,232,216,0.6)",
          fontFamily: "Georgia, serif", fontSize: 14,
        }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18, flexShrink: 0 }}>
          <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 14a8 8 0 0 0 8-8h-2a6 6 0 0 1-12 0H4a8 8 0 0 0 8 8zm-1 3v2h2v-2a10 10 0 0 0 0-20v2a8 8 0 0 1 0 16v2z" />
        </svg>
        <span style={{ flex: 1, textAlign: "center" }}>Enregistrer mon message directement</span>
        <span style={{ fontSize: 10, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ marginTop: 12, borderRadius: 14, padding: "20px 16px", background: `${accent}08`, border: `1px solid ${accent}25` }}>
              <p style={{ fontFamily: "Georgia, serif", fontSize: 14, color: "rgba(240,232,216,0.72)", lineHeight: 1.6, textAlign: "center", margin: "0 0 16px" }}>
                Enregistrez un message avec le micro de votre téléphone.
              </p>

              {(isRecording || time > 0) && (
                <p style={{ fontFamily: "Georgia, serif", fontSize: 30, letterSpacing: "0.15em", textAlign: "center", margin: "0 0 16px", color: isRecording ? "#e07070" : accent, fontVariantNumeric: "tabular-nums" }}>
                  {formatTime(time)}
                </p>
              )}

              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                <button
                  type="button"
                  onClick={isRecording ? stop : start}
                  aria-label={isRecording ? "Arrêter l'enregistrement" : "Démarrer l'enregistrement"}
                  style={{
                    width: 72, height: 72, borderRadius: "50%", cursor: "pointer",
                    background: isRecording ? "rgba(220,60,60,0.15)" : "rgba(220,60,60,0.12)",
                    border: isRecording ? "2px solid #dc3c3c" : "2px solid rgba(220,60,60,0.45)",
                    boxShadow: isRecording ? "0 0 22px rgba(220,60,60,0.35)" : "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <div style={isRecording ? { width: 22, height: 22, borderRadius: 4, background: "#dc3c3c" } : { width: 28, height: 28, borderRadius: "50%", background: "#dc3c3c" }} />
                </button>
              </div>

              <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: "rgba(240,232,216,0.4)", textAlign: "center", margin: "0 0 12px" }}>
                {isRecording ? "Appuyez pour arrêter" : blob ? "Enregistrement terminé" : "Appuyez pour enregistrer"}
              </p>

              {error && (
                <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 10, background: "rgba(220,60,60,0.1)", border: "1px solid rgba(220,60,60,0.3)" }}>
                  <p style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "#e07070", lineHeight: 1.5, textAlign: "center", margin: 0 }}>{error}</p>
                </div>
              )}

              {blob && !isRecording && previewUrl && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <audio controls src={previewUrl} style={{ width: "100%" }} />
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      type="button"
                      onClick={reset}
                      style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(240,232,216,0.5)", fontFamily: "Georgia, serif", fontSize: 13, cursor: "pointer" }}
                    >
                      Recommencer
                    </button>
                    <button
                      type="button"
                      onClick={validate}
                      style={{ flex: 2, padding: "12px 0", borderRadius: 12, border: `1px solid ${accent}50`, background: `${accent}25`, color: "#f0e8d8", fontFamily: "Georgia, serif", fontSize: 13, cursor: "pointer" }}
                    >
                      Utiliser cet enregistrement
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
