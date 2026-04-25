"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COOKIE_CONSENT_KEY = "ekko-cookie-consent";

export default function CookieBanner() {
  const [show, setShow] = useState(false);
  const [consent, setConsent] = useState<"accepted" | "rejected" | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY) as "accepted" | "rejected" | null;
    if (stored) {
      setConsent(stored);
    } else {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setConsent("accepted");
    setShow(false);
    // Recharger pour activer les analytics
    window.location.reload();
  };

  const handleReject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "rejected");
    setConsent("rejected");
    setShow(false);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4 }}
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            padding: "24px",
            background: "rgba(13, 10, 15, 0.95)",
            backdropFilter: "blur(12px)",
            borderTop: "1px solid rgba(201, 169, 110, 0.15)",
            boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div
            style={{
              maxWidth: 900,
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#f0e8d8",
                  marginBottom: 10,
                }}
              >
                Cookies et suivi
              </h3>
              <p
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "rgba(240, 232, 216, 0.7)",
                  marginBottom: 8,
                }}
              >
                Nous utilisons des cookies limités au suivi de votre navigation pour améliorer les performances du site.
                Vos données ne sont jamais partagées avec des sites ou organisations publicitaires.
              </p>
              <p
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: 12,
                  lineHeight: 1.5,
                  color: "rgba(240, 232, 216, 0.45)",
                  fontStyle: "italic",
                }}
              >
                Vous pouvez modifier votre choix à tout moment.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={handleReject}
                style={{
                  padding: "12px 24px",
                  borderRadius: 12,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  background: "rgba(255, 255, 255, 0.04)",
                  color: "rgba(240, 232, 216, 0.7)",
                  fontFamily: "Georgia, serif",
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                }}
              >
                Refuser
              </button>
              <button
                onClick={handleAccept}
                style={{
                  padding: "12px 24px",
                  borderRadius: 12,
                  border: "1px solid rgba(201, 169, 110, 0.3)",
                  background: "rgba(201, 169, 110, 0.15)",
                  color: "#c9a96e",
                  fontFamily: "Georgia, serif",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(201, 169, 110, 0.25)";
                  e.currentTarget.style.borderColor = "rgba(201, 169, 110, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(201, 169, 110, 0.15)";
                  e.currentTarget.style.borderColor = "rgba(201, 169, 110, 0.3)";
                }}
              >
                Accepter
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function getCookieConsent(): "accepted" | "rejected" | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(COOKIE_CONSENT_KEY) as "accepted" | "rejected" | null;
}
