"use client";
import { useEffect, useRef, useState, useMemo, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import BlobBackground from "../../components/BlobBackground";
import EkkoLogo from "../../components/EkkoLogo";
import AudioSelector from "../../components/AudioSelector";
import ImportGuide from "../../components/ImportGuide";
import PorteClefFinalize from "../../components/PorteClefFinalize";
import { EchoRevealScreen } from "../../components/ThemePage";
import { useAuth } from "../../context/AuthContext";
import { uploadAudiosToStorage } from "../../lib/audioStorage";
import { loadDraftAudios, saveDraftAudios, saveDraftState, loadDraftState, clearDraft } from "../../lib/draftStorage";
import type { CapsuleManifest, CapsuleBookmark } from "../../lib/capsules";

type Status = "pending" | "paid_awaiting_selection" | "paid" | "processing" | "ready" | "failed";

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
  productType?: "numerique" | "porteClef";
  engraveName?: string | null;
  engravingFont?: string | null;
  format?: string | null;
  nfcEnabled?: boolean;
  shippingStatus?: string | null;
  smartSearchEnabled?: boolean;
  advancePayment?: boolean;
  manifest?: CapsuleManifest | null;
  bookmarks?: CapsuleBookmark[];
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
  const { user, isLoading: authLoading } = useAuth();
  const sessionId = searchParams.get("session_id");
  const modeParam = searchParams.get("mode");

  const [capsule, setCapsule] = useState<CapsuleState | null>(null);
  const [forceEditSelection, setForceEditSelection] = useState(false);
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

    // Si ready et photo en sessionStorage → uploader AVANT de rendre EchoRevealScreen
    if (data.status === "ready" && data.echoId && data.uid) {
      try {
        const photoData = sessionStorage.getItem("ekko_cover_photo");
        const photoName = sessionStorage.getItem("ekko_cover_photo_name");
        const photoType = sessionStorage.getItem("ekko_cover_photo_type");
        if (photoData && photoName) {
          const blobRes = await fetch(photoData);
          const blob = await blobRes.blob();
          const file = new File([blob], photoName, { type: photoType || "image/jpeg" });
          const form = new FormData();
          form.append("file", file);
          form.append("uid", data.uid);
          form.append("echoId", data.echoId);
          await fetch("/api/storage/cover", { method: "POST", body: form });
          sessionStorage.removeItem("ekko_cover_photo");
          sessionStorage.removeItem("ekko_cover_photo_name");
          sessionStorage.removeItem("ekko_cover_photo_type");
        }
      } catch (e) { console.error("[cover upload]", e); }
    }

    setCapsule(data);
    return data;
  };

  // Poll tant que pas ready/failed
  useEffect(() => {
    let cancelled = false;

    const loop = async () => {
      if (cancelled) return;
      const data = await fetchStatus();
      if (cancelled) return;
      if (!data) return;

      // Si on a un session_id et que la capsule est encore pending → déclencher le claim (fallback webhook)
      if (sessionId && data.status === "pending" && !claimedRef.current) {
        claimedRef.current = true;
        fetch(`/api/capsules/${id}/claim?session_id=${sessionId}`, { method: "POST" })
          .catch((e) => console.error("claim error:", e));
      }

      // Dev bypass : pas de session_id mais compte dev → court-circuiter le paiement
      const devUid = process.env.NEXT_PUBLIC_DEV_UID;
      const isDevBypass =
        process.env.NEXT_PUBLIC_DEV_BYPASS === "true" ||
        process.env.NODE_ENV === "development" ||
        (!!devUid && data.uid === devUid);
      if (!sessionId && data.status === "pending" && !claimedRef.current && isDevBypass) {
        claimedRef.current = true;
        fetch(`/api/capsules/${id}/dev-claim`, { method: "POST" })
          .catch((e) => console.error("[dev-claim] error:", e));
      }

      if (data.status === "ready" || data.status === "failed") {
        cancelled = true;
        if (pollRef.current) clearInterval(pollRef.current);
        return;
      }
      // Porte-clé : on continue de poller jusqu'à "ready" afin que le client
      // puisse vérifier le montage audio (fusion + qualité) via le lecteur numérique,
      // exactement comme pour une édition numérique.
    };

    loop().then(() => {
      if (!cancelled) {
        pollRef.current = setInterval(loop, 2500);
      }
    });
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
  const isAwaitingSelection =
    capsule?.status === "paid_awaiting_selection" ||
    forceEditSelection ||
    (modeParam === "select" && !!capsule && capsule.status !== "pending");

  const handleBackToPreviousStep = async () => {
    if (!capsule) return;
    setForceEditSelection(true);
    try {
      await fetch(`/api/capsules/${id}/selection`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reopen: true }),
      });
      await fetchStatus();
    } catch {
      // ignore
    }
  };

  // Le QR/NFC du porte-clé pointe ici : seul l'acheteur voit l'écran de commande,
  // le destinataire est redirigé vers le lecteur public.
  const isPorteClefScan =
    !!capsule && capsule.productType === "porteClef" && !sessionId && !isAwaitingSelection &&
    !authLoading && user?.uid !== capsule.uid;

  useEffect(() => {
    if (isPorteClefScan && capsule?.status === "ready" && capsule.echoId) {
      window.location.replace(`/v/${capsule.echoId}`);
    }
  }, [isPorteClefScan, capsule?.status, capsule?.echoId]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BlobBackground variant={blobVariant} />
      <div style={{ position: "relative", zIndex: 10, padding: "24px 20px 48px", maxWidth: isAwaitingSelection ? 840 : 520, margin: "0 auto" }}>
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
          <EkkoLogo />
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="ekko-serif"
              style={{
                padding: "7px 14px",
                borderRadius: 20,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(243,227,190,0.88)",
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Accueil
            </button>
            <button
              type="button"
              onClick={() => router.push("/account")}
              className="ekko-serif"
              style={{
                padding: "7px 14px",
                borderRadius: 20,
                background: `${accent}18`,
                border: `1px solid ${accent}45`,
                color: accent,
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Mon compte
            </button>
          </div>
        </nav>

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

        {/* ── Commande payée avec Souvenirs intelligents (+3 €) en attente de sélection finale ── */}
        {capsule && isAwaitingSelection && (
          <AdvanceSelectionWorkspace
            capsule={capsule}
            accent={accent}
            onFinalized={async () => {
              setForceEditSelection(false);
              if (modeParam === "select") {
                window.history.replaceState(null, "", `/capsule/${id}`);
              }
              return fetchStatus();
            }}
          />
        )}

        {/* ── Porte-clé : succès dès que paid OU session_id présent (hors mode awaiting_selection) ── */}
        {capsule && !isAwaitingSelection && capsule.productType === "porteClef" && (authLoading || isPorteClefScan) && !sessionId && capsule.status !== "failed" && (
          <ProcessingScreen status={capsule.status === "ready" ? "processing" : capsule.status} accent={accent} />
        )}
        {capsule && !isAwaitingSelection && capsule.productType === "porteClef" && !isPorteClefScan && !(authLoading && !sessionId) && capsule.status === "pending" && !sessionId && (
          <ProcessingScreen status={capsule.status} accent={accent} />
        )}
        {capsule && !isAwaitingSelection && capsule.productType === "porteClef" && !isPorteClefScan && !(authLoading && !sessionId) && (capsule.status !== "pending" || (!!sessionId && !capsule.advancePayment)) && capsule.status !== "failed" && (
          <KeychainSuccessScreen capsule={capsule} accent={accent} onBackToSelection={handleBackToPreviousStep} />
        )}
        {capsule && !isAwaitingSelection && capsule.productType === "porteClef" && !isPorteClefScan && !(authLoading && !sessionId) && capsule.status === "ready" && capsule.echoId && capsule.audioUrl && (
          <div id="montage-section" style={{ marginTop: 12, scrollMarginTop: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, maxWidth: 480, margin: "0 auto 4px" }}>
              <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.08)" }} />
              <span style={{ fontFamily: "Georgia, serif", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: `${accent}90`, whiteSpace: "nowrap" }}>
                Vérifiez votre montage
              </span>
              <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.08)" }} />
            </div>
            <EchoRevealScreen
              config={{ accent, accentDim: accent + "60" }}
              echoId={capsule.echoId}
              audioUrl={capsule.audioUrl}
              uid={capsule.uid}
              bookmarks={capsule.bookmarks}
            />
          </div>
        )}

        {/* ── Numérique : flux processing / ready / failed ── */}
        {capsule && !isAwaitingSelection && capsule.productType !== "porteClef" && (capsule.status === "pending" || capsule.status === "paid" || capsule.status === "processing") && (
          <ProcessingScreen status={capsule.status} accent={accent} />
        )}
        {capsule && !isAwaitingSelection && capsule.productType !== "porteClef" && capsule.status === "ready" && capsule.echoId && capsule.audioUrl && (
          <EchoRevealScreen
            config={{ accent, accentDim: accent + "60" }}
            echoId={capsule.echoId}
            audioUrl={capsule.audioUrl}
            uid={capsule.uid}
            bookmarks={capsule.bookmarks}
          />
        )}

        {capsule && capsule.status === "failed" && (
          <FailedScreen
            accent={accent}
            error={capsule.error}
            onRetry={handleRetry}
            retrying={retrying}
          />
        )}
      </div>
    </div>
  );
}

// ─── Espace de sélection et marque-pages après paiement anticipé (+3 €) ─────
function AdvanceSelectionWorkspace({
  capsule,
  accent,
  onFinalized,
}: {
  capsule: CapsuleState;
  accent: string;
  onFinalized: () => Promise<CapsuleState | null>;
}) {
  const [audios, setAudios] = useState<File[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentManifest, setCurrentManifest] = useState<CapsuleManifest | undefined>(
    capsule.manifest ?? undefined
  );
  const [subStep, setSubStep] = useState<"select" | "porteclef">("select");
  const [loadingLocal, setLoadingLocal] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [engraveName] = useState(capsule.engraveName ?? "");
  const [initialOrderedIds, setInitialOrderedIds] = useState<string[]>(
    capsule.manifest?.selectedAudios?.map((a) => a.audioId) ?? []
  );
  const [initialBookmarks, setInitialBookmarks] = useState(
    capsule.manifest?.bookmarks ?? []
  );
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;
    const restore = async () => {
      let restoredFiles = await loadDraftAudios(capsule.id);
      if (restoredFiles.length === 0) {
        restoredFiles = await loadDraftAudios("current");
        if (restoredFiles.length > 0) {
          await saveDraftAudios(capsule.id, restoredFiles);
        }
      }
      const draftState = (await loadDraftState(capsule.id)) ?? (await loadDraftState("current"));
      if (mounted) {
        setAudios(restoredFiles);
        if (draftState?.orderedAudioIds?.length && initialOrderedIds.length === 0) {
          setInitialOrderedIds(draftState.orderedAudioIds);
        }
        if (draftState?.bookmarks?.length && initialBookmarks.length === 0) {
          setInitialBookmarks(draftState.bookmarks);
        }
        setLoadingLocal(false);
      }
    };
    restore();
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capsule.id]);

  const handleManifestChange = (manifest: CapsuleManifest) => {
    setCurrentManifest(manifest);
    saveDraftState({
      key: capsule.id,
      capsuleId: capsule.id,
      theme: capsule.theme,
      variant: capsule.productType === "porteClef" ? "porteClef" : "numerique",
      smartSearchEnabled: true,
      orderedAudioIds: manifest.selectedAudios.map((a) => a.audioId),
      bookmarks: manifest.bookmarks,
      engraveName,
      updatedAt: Date.now(),
    });

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      fetch(`/api/capsules/${capsule.id}/selection`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manifest, engraveName }),
      }).catch(() => {});
    }, 1200);
  };

  const handleFinalize = async (
    manifest?: CapsuleManifest,
    keychainOverride?: {
      engraveName: string;
      format: string;
      engravingFont: string;
      nfcEnabled: boolean;
    },
    explicitFiles?: File[]
  ) => {
    const filesToUse = explicitFiles && explicitFiles.length > 0 ? explicitFiles : selectedFiles;
    if (submitting || filesToUse.length === 0) return;
    const finalEngrave = keychainOverride?.engraveName ?? engraveName;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const uploadId = await uploadAudiosToStorage(filesToUse);
      const res = await fetch(`/api/capsules/${capsule.id}/selection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploadId,
          manifest: manifest ?? currentManifest,
          ...(capsule.productType === "porteClef"
            ? {
                engraveName: finalEngrave.trim(),
                ...(keychainOverride?.format ? { format: keychainOverride.format } : {}),
                ...(keychainOverride?.engravingFont ? { engravingFont: keychainOverride.engravingFont } : {}),
              }
            : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la validation finale");
      }
      await saveDraftAudios(capsule.id, audios);
      await onFinalized();
      setSubmitting(false);
    } catch (err) {
      setSubmitError((err as Error).message);
      setSubmitting(false);
    }
  };

  if (loadingLocal) {
    return (
      <p className="ekko-serif" style={{ textAlign: "center", color: "rgba(240,232,216,0.5)", fontSize: 14, marginTop: 40 }}>
        Restauration de votre bibliothèque vocale…
      </p>
    );
  }

  return (
    <div>
      {/* Bandeau de confirmation paiement anticipé */}
      <div
        style={{
          marginBottom: 24,
          padding: "14px 18px",
          borderRadius: 16,
          background: `${accent}14`,
          border: `1px solid ${accent}45`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <p className="ekko-serif" style={{ fontSize: 13, color: "#f0e8d8", margin: 0, fontWeight: 500 }}>
            ✓ Commande réglée · Option « Souvenirs intelligents » activée
          </p>
          <p className="ekko-serif" style={{ fontSize: 11, color: "rgba(240,232,216,0.55)", margin: "2px 0 0" }}>
            Recherchez vos messages, organisez votre sélection (max 1h) et créez vos marque-pages. Aucun nouveau paiement ne vous sera demandé.
          </p>
        </div>
        <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: accent }}>
          Réf. {capsule.id.slice(0, 8)}
        </span>
      </div>

      {audios.length === 0 ? (
        <div>
          <p className="ekko-serif" style={{ textAlign: "center", fontSize: 13, color: "rgba(240,232,216,0.65)", marginBottom: 16 }}>
            Pour reprendre votre création sur cet appareil, importez à nouveau votre archive ou vos messages vocaux (votre paiement et vos marque-pages sont conservés) :
          </p>
          <ImportGuide
            theme={capsule.theme}
            config={{ accent, accentDim: `${accent}25`, label: "Reprise de votre commande" }}
            hideImageUpload={true}
            onAudiosImported={async (files) => {
              await saveDraftAudios(capsule.id, files);
              setAudios(files);
            }}
          />
        </div>
      ) : subStep === "porteclef" && capsule.productType === "porteClef" ? (
        <div>
          <div style={{ marginBottom: 16 }}>
            <button
              type="button"
              onClick={() => setSubStep("select")}
              className="ekko-serif"
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(240,232,216,0.8)",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              ← Retour à la sélection des vocaux
            </button>
          </div>
          <PorteClefFinalize
            config={{ accent, accentDim: `${accent}25`, label: capsule.theme }}
            audios={selectedFiles}
            theme={capsule.theme}
            initialFormat={capsule.format ?? undefined}
            manifest={currentManifest}
            alreadyPaidCapsuleId={capsule.id}
            initialEngraveName={capsule.engraveName ?? ""}
            initialEngravingFont={capsule.engravingFont ?? undefined}
            initialNfcEnabled={capsule.nfcEnabled ?? false}
            onAlreadyPaidFinalize={(cfg) => handleFinalize(currentManifest, cfg)}
          />
        </div>
      ) : (
        <>
          {submitError && (
            <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 12, background: "rgba(224,85,128,0.12)", border: "1px solid rgba(224,85,128,0.35)", color: "#ff8888", fontFamily: "Georgia, serif", fontSize: 13 }}>
              {submitError}
            </div>
          )}
          <AudioSelector
            audios={audios}
            config={{ accent, accentDim: `${accent}25` }}
            smartSearchEnabled={true}
            capsuleId={capsule.id}
            initialOrderedAudioIds={initialOrderedIds}
            initialBookmarks={initialBookmarks}
            onSelect={(files) => setSelectedFiles(files)}
            onManifestChange={handleManifestChange}
            onVocapsule={(manifest, chosenFiles) => {
              if (manifest) setCurrentManifest(manifest);
              if (chosenFiles) setSelectedFiles(chosenFiles);
              handleFinalize(manifest, undefined, chosenFiles);
            }}
            onLivre={() => {}}
            ctaVocapsule={
              submitting
                ? "Validation et lancement de la fusion…"
                : "Valider définitivement ma Vocapsule et mes marque-pages"
            }
            ctaLivre=""
            showLivre={false}
          />
        </>
      )}
    </div>
  );
}

// ─── Confetti ────────────────────────────────────────────────────────────────
function ConfettiRain({ accent }: { accent: string }) {
  const particles = useMemo(() => {
    const colors = [accent, "#f0e8d8", "#c9a96e", "#e8d5a8", "#ffffff", "#f5c518"];
    return Array.from({ length: 55 }, (_, i) => ({
      id: i,
      left: `${(i * 37 + 3) % 100}%`,
      delay: (i * 0.09) % 2.2,
      duration: 2.4 + (i * 0.08) % 1.8,
      color: colors[i % colors.length],
      w: 5 + (i % 6),
      h: 3 + (i % 4),
      dx: ((i % 18) - 9) * 10,
    }));
  }, [accent]);

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 200, overflow: "hidden" }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -24, x: 0, opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", x: p.dx, opacity: 0, rotate: 540 }}
          transition={{ duration: p.duration, delay: p.delay, ease: "linear" }}
          style={{
            position: "absolute", left: p.left, top: 0,
            width: p.w, height: p.h,
            background: p.color, borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
}

// ─── Page succès porte-clé ───────────────────────────────────────────────────
function KeychainSuccessScreen({
  capsule,
  accent,
  onBackToSelection,
}: {
  capsule: CapsuleState;
  accent: string;
  onBackToSelection?: () => void;
}) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 5500);
    return () => clearTimeout(t);
  }, []);

  const formatLabel: Record<string, string> = {
    "etiquette-rect":     "Rectangulaire · 50×30 mm",
    "etiquette-arrondie": "Arrondie · 50,8×31,8 mm",
    "carre":              "Carré · 40×40 mm",
  };

  return (
    <>
      {showConfetti && <ConfettiRain accent={accent} />}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        style={{ textAlign: "center", padding: "12px 0 32px" }}
      >
        {/* Checkmark animé */}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.25 }}
          style={{
            width: 76, height: 76, borderRadius: "50%",
            background: `linear-gradient(135deg, ${accent}25, ${accent}45)`,
            border: `2px solid ${accent}70`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.2">
            <motion.path
              strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            />
          </svg>
        </motion.div>

        <p style={{ fontFamily: "Georgia, serif", fontSize: 11, letterSpacing: "0.4em", textTransform: "uppercase", color: `${accent}90`, marginBottom: 8 }}>
          Commande confirmée
        </p>
        <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 300, fontSize: 27, color: "#f0e8d8", marginBottom: 10, lineHeight: 1.3 }}>
          Merci pour votre commande ✦
        </h2>
        <p style={{ fontFamily: "Georgia, serif", fontSize: 14, color: "rgba(240,232,216,0.5)", marginBottom: 32, maxWidth: 340, margin: "0 auto 32px", lineHeight: 1.75, fontStyle: "italic" }}>
          Votre porte-clé est en cours de fabrication. Un email de confirmation vous a été envoyé.
        </p>

        {/* Récap commande */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{
            maxWidth: 400, margin: "0 auto 28px",
            background: "rgba(18, 13, 12, 0.84)", border: `1px solid ${accent}35`,
            borderRadius: 16, padding: "22px 24px",
            display: "flex", flexDirection: "column", gap: 12, textAlign: "left",
          }}
        >
          {(() => {
            const baseCents = capsule.nfcEnabled ? 2790 : 2490;
            const smartCents = capsule.smartSearchEnabled ? 300 : 0;
            const totalEuros = ((baseCents + smartCents) / 100).toFixed(2).replace(".", ",") + " €";
            const baseEuros = (baseCents / 100).toFixed(2).replace(".", ",") + " €";
            const rows: [string, string][] = [
              ["Prénom gravé", capsule.engraveName?.trim() ? capsule.engraveName.toUpperCase() : "Sans prénom (QR code seul)"],
              ["Format", formatLabel[capsule.format ?? ""] ?? capsule.format ?? "—"],
              ["Matière", "Bois naturel · Gravure laser"],
              ["Porte-clé", capsule.nfcEnabled ? `QR code + puce NFC · ${baseEuros}` : `QR code gravé · ${baseEuros}`],
              ...(capsule.smartSearchEnabled
                ? ([["Option IA", "Recherche intelligente & chapitres · 3,00 €"]] as [string, string][])
                : []),
              ["Livraison", "5–7 jours ouvrés · Gratuite"],
            ];
            return (
              <>
                {rows.map(([label, value]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "rgba(240,232,216,0.45)", flexShrink: 0 }}>{label}</span>
                    <span style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "#f0e8d8", textAlign: "right" }}>{value}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, borderTop: `1px solid ${accent}25`, paddingTop: 10, marginTop: 2 }}>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 600, color: "#f0e8d8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Total réglé
                  </span>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 600, color: accent }}>
                    {totalEuros}
                  </span>
                </div>
              </>
            );
          })()}
          <div style={{ borderTop: `1px solid ${accent}18`, paddingTop: 12, marginTop: 2 }}>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 10, color: `${accent}55`, margin: "0 0 4px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Référence commande</p>
            <p style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: "rgba(240,232,216,0.38)", margin: 0 }}>{capsule.id}</p>
          </div>
        </motion.div>

        {/* Indicateur visuel intuitif vers le fichier audio & QR code en bas (avec flèche animée) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65 }}
          style={{ maxWidth: 400, margin: "0 auto 18px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}
        >
          {capsule.status === "ready" ? (
            <button
              type="button"
              onClick={() => {
                document.getElementById("montage-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              style={{
                width: "100%",
                padding: "14px 18px",
                borderRadius: 14,
                background: `linear-gradient(135deg, ${accent}28, ${accent}14)`,
                border: `1.5px solid ${accent}`,
                boxShadow: `0 0 22px ${accent}33`,
                color: "#f0e8d8",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ fontFamily: "sans-serif", fontSize: 13.5, fontWeight: 600, color: "#fff" }}>
                Écouter votre fichier audio &amp; voir le QR code ci-dessous
              </span>
              <span style={{ fontFamily: "sans-serif", fontSize: 11.5, color: "rgba(240,232,216,0.65)" }}>
                Votre Vocapsule, vos repères et le téléchargement sont disponibles juste en bas
              </span>
              <motion.div
                animate={{ y: [0, 6, 0], opacity: [0.65, 1, 0.65] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 2, color: accent }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 10l5 5 5-5M7 5l5 5 5-5" />
                </svg>
              </motion.div>
            </button>
          ) : (
            <div
              style={{
                width: "100%",
                padding: "14px 18px",
                borderRadius: 14,
                background: "rgba(18, 13, 12, 0.84)",
                border: `1px solid ${accent}45`,
                color: "#f0e8d8",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ fontFamily: "sans-serif", fontSize: 13, fontWeight: 500, color: accent }}>
                ⏳ Préparation de votre fichier audio et de votre QR code…
              </span>
              <span style={{ fontFamily: "sans-serif", fontSize: 11.5, color: "rgba(240,232,216,0.55)" }}>
                Le lecteur et le QR code vont s&apos;afficher juste ci-dessous dans quelques secondes ↓
              </span>
            </div>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
            <button
              type="button"
              onClick={() => { window.location.href = "/compte"; }}
              style={{
                padding: "9px 16px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.06)",
                border: `1px solid ${accent}55`,
                color: "#f0e8d8",
                fontFamily: "sans-serif",
                fontSize: 12.5,
                cursor: "pointer",
              }}
            >
              ✦ Voir mes commandes &amp; mes vocapsules
            </button>
            <button
              type="button"
              onClick={() => { window.location.href = "/"; }}
              style={{
                padding: "9px 16px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.14)",
                color: "rgba(240,232,216,0.78)",
                fontFamily: "sans-serif",
                fontSize: 12.5,
                cursor: "pointer",
              }}
            >
              ← Retour à l&apos;accueil
            </button>
          </div>
        </motion.div>

        <p style={{ fontFamily: "Georgia, serif", fontSize: 11, color: "rgba(240,232,216,0.25)", fontStyle: "italic", marginTop: 8 }}>
          Vous recevrez un second email lors de l&apos;expédition.
        </p>
      </motion.div>
    </>
  );
}

// ─── Processing (paiement validé, fusion en cours) ──────────────────────────
function ProcessingScreen({ status, accent }: { status: Status; accent: string }) {
  const message =
    status === "pending" ? "Confirmation du paiement…" :
    status === "paid"    ? "Préparation de votre vocapsule…" :
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
          Paiement validé · Votre vocapsule sera prête dans quelques instants.
        </p>
      </div>

      <div className="pr-spin"
        style={{ width: 20, height: 20, border: `1.5px solid ${accent}30`, borderTop: `1.5px solid ${accent}`, borderRadius: "50%" }}
      />

      <p className="ekko-serif" style={{ fontSize: 11, color: "rgba(240,232,216,0.25)", margin: 0, maxWidth: 340 }}>
        Vous pouvez fermer cette page, votre vocapsule sera disponible depuis votre compte.
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
