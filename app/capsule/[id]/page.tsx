"use client";
import { useEffect, useRef, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import BlobBackground from "../../components/BlobBackground";
import EkkoLogo from "../../components/EkkoLogo";
import { EchoRevealScreen } from "../../components/ThemePage";

type Status = "pending" | "paid" | "processing" | "ready" | "failed";

interface CapsuleState {
  id: string;
  status: Status;
  theme: string;
  accentColor: string;
  storageOption: number;
  echoId: string | null;
  audioUrl: string | null;
  expiresAt: string | null;
  error: string | null;
  uid: string;
}

const themeVariants: Record<string, "deuil" | "amitie" | "amour" | "home"> = {
  deuil: "deuil",
  amitie: "amitie",
  amour: "amour",
};

export default function CapsulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  const [capsule, setCapsule] = useState<CapsuleState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const claimedRef = useRef(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = async (): Promise<CapsuleState | null> => {
    const res = await fetch(`/api/capsules/${id}`, { cache: "no-store" });
    if (!res.ok) {
      if (res.status === 404) setLoadError("Capsule introuvable");
      return null;
    }
    const data = (await res.json()) as CapsuleState;
    setCapsule(data);
    return data;
  };

  // Poll tant que pas ready/failed
  useEffect(() => {
    let cancelled = false;

    const loop = async () => {
      const data = await fetchStatus();
      if (cancelled) return;
      if (!data) return;

      // Si on a un session_id et que la capsule est encore pending → déclencher le claim (fallback webhook)
      if (sessionId && data.status === "pending" && !claimedRef.current) {
        claimedRef.current = true;
        fetch(`/api/capsules/${id}/claim?session_id=${sessionId}`, { method: "POST" })
          .catch((e) => console.error("claim error:", e));
      }

      if (data.status === "ready" || data.status === "failed") {
        if (pollRef.current) clearInterval(pollRef.current);
        return;
      }
    };

    loop();
    pollRef.current = setInterval(loop, 2500);
    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, sessionId]);

  const handleRetry = async () => {
    if (retrying) return;
    setRetrying(true);
    try {
      await fetch(`/api/capsules/${id}/process`, { method: "POST" });
      await fetchStatus();
    } catch (err) {
      console.error("retry error:", err);
    } finally {
      setRetrying(false);
    }
  };

  const accent = capsule?.accentColor ?? "#c9a96e";
  const blobVariant = themeVariants[capsule?.theme ?? "deuil"] ?? "deuil";

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BlobBackground variant={blobVariant} />
      <div style={{ position: "relative", zIndex: 10, padding: "32px 20px", maxWidth: 520, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}>
          <EkkoLogo />
        </div>

        {loadError && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p className="ekko-serif" style={{ fontSize: 16, color: "rgba(240,232,216,0.7)", marginBottom: 16 }}>
              {loadError}
            </p>
            <button
              onClick={() => router.push("/")}
              className="ekko-serif"
              style={{
                padding: "10px 22px", borderRadius: 10,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#f0e8d8", cursor: "pointer", fontSize: 14,
              }}
            >
              Retour à l&apos;accueil
            </button>
          </div>
        )}

        {!loadError && !capsule && (
          <p className="ekko-serif" style={{ textAlign: "center", color: "rgba(240,232,216,0.4)", fontSize: 13, marginTop: 80 }}>
            Chargement…
          </p>
        )}

        {capsule && (capsule.status === "pending" || capsule.status === "paid" || capsule.status === "processing") && (
          <ProcessingScreen status={capsule.status} accent={accent} />
        )}

        {capsule && capsule.status === "failed" && (
          <FailedScreen
            accent={accent}
            error={capsule.error}
            onRetry={handleRetry}
            retrying={retrying}
          />
        )}

        {capsule && capsule.status === "ready" && capsule.echoId && capsule.audioUrl && (
          <EchoRevealScreen
            config={{ accent, accentDim: accent + "60" }}
            echoId={capsule.echoId}
            audioUrl={capsule.audioUrl}
          />
        )}
      </div>
    </div>
  );
}

// ─── Processing (paiement validé, fusion en cours) ──────────────────────────
function ProcessingScreen({ status, accent }: { status: Status; accent: string }) {
  const message =
    status === "pending" ? "Confirmation du paiement…" :
    status === "paid"    ? "Préparation de votre écho…" :
                           "Assemblage de vos voix…";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, minHeight: "55vh", justifyContent: "center", textAlign: "center" }}
    >
      <style>{`
        @keyframes pr-pulse { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.08);opacity:1} }
        @keyframes pr-halo  { 0%,100%{opacity:.18} 50%{opacity:.42} }
        @keyframes pr-spin  { to{transform:rotate(360deg)} }
        .pr-pulse { animation: pr-pulse 2.6s ease-in-out infinite; will-change:transform,opacity; }
        .pr-halo  { animation: pr-halo 4.8s ease-in-out infinite; will-change:opacity; }
        .pr-spin  { animation: pr-spin 1.2s linear infinite; will-change:transform; }
      `}</style>

      <svg width="120" height="120" viewBox="0 0 120 120" style={{ overflow: "visible", display: "block" }}>
        <defs>
          <radialGradient id="pr-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.4"/>
            <stop offset="60%" stopColor={accent} stopOpacity="0.1"/>
            <stop offset="100%" stopColor={accent} stopOpacity="0"/>
          </radialGradient>
          <filter id="pr-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="7"/>
          </filter>
        </defs>
        <circle className="pr-halo" cx="60" cy="60" r="56" fill="url(#pr-grad)" filter="url(#pr-blur)"/>
        <circle className="pr-pulse" cx="60" cy="60" r="10" fill={accent} fillOpacity="0.85"
          style={{ transformOrigin: "60px 60px" }}/>
        <circle cx="60" cy="60" r="42" fill="none" stroke={accent} strokeWidth="0.8" strokeOpacity="0.35"/>
      </svg>

      <div>
        <p className="ekko-serif" style={{ fontSize: 18, color: "#f0e8d8", fontWeight: 300, margin: "0 0 8px" }}>
          {message}
        </p>
        <p className="ekko-serif" style={{ fontSize: 13, color: "rgba(240,232,216,0.45)", fontStyle: "italic", margin: 0 }}>
          Paiement validé · Votre écho sera prêt dans quelques instants.
        </p>
      </div>

      <div className="pr-spin"
        style={{ width: 20, height: 20, border: `1.5px solid ${accent}30`, borderTop: `1.5px solid ${accent}`, borderRadius: "50%" }}
      />

      <p className="ekko-serif" style={{ fontSize: 11, color: "rgba(240,232,216,0.25)", margin: 0, maxWidth: 340 }}>
        Vous pouvez fermer cette page, votre écho sera disponible depuis votre compte.
      </p>
    </motion.div>
  );
}

// ─── Failed (fusion a planté, possibilité de réessayer) ─────────────────────
function FailedScreen({ accent, error, onRetry, retrying }: {
  accent: string; error: string | null; onRetry: () => void; retrying: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22, minHeight: "55vh", justifyContent: "center", textAlign: "center" }}
    >
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(224, 85, 128, 0.12)", border: "1px solid rgba(224,85,128,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#e05580" strokeWidth="1.5" style={{ width: 28, height: 28 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.73-3L13.73 4.02a2 2 0 00-3.46 0L3.2 16c-.77 1.33.19 3 1.73 3z"/>
        </svg>
      </div>

      <div>
        <p className="ekko-serif" style={{ fontSize: 18, color: "#f0e8d8", fontWeight: 300, margin: "0 0 10px" }}>
          L&apos;assemblage n&apos;a pas pu aboutir
        </p>
        <p className="ekko-serif" style={{ fontSize: 13, color: "rgba(240,232,216,0.55)", margin: "0 0 6px", fontStyle: "italic" }}>
          Votre paiement est bien enregistré. Vous pouvez relancer l&apos;assemblage.
        </p>
        {error && (
          <p className="ekko-serif" style={{ fontSize: 11, color: "rgba(240,232,216,0.3)", margin: 0, maxWidth: 400 }}>
            Détail technique : {error}
          </p>
        )}
      </div>

      <button
        onClick={onRetry}
        disabled={retrying}
        className="ekko-serif"
        style={{
          padding: "12px 28px", borderRadius: 12, cursor: retrying ? "wait" : "pointer",
          background: `linear-gradient(135deg, ${accent}25, ${accent}40)`,
          border: `1px solid ${accent}50`,
          color: "#f0e8d8", fontSize: 14,
          opacity: retrying ? 0.6 : 1,
        }}
      >
        {retrying ? "Relance en cours…" : "Réessayer l'assemblage"}
      </button>
    </motion.div>
  );
}
