"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function PaymentSuccess() {
  const params = useSearchParams();

  useEffect(() => {
    const sessionId = params.get("session_id");
    if (sessionId) {
      localStorage.setItem("ekko_stripe_sid", sessionId);
    }
    // Fermer cet onglet automatiquement
    window.close();
    // Fallback si window.close() est bloqué (certains navigateurs)
    setTimeout(() => {
      document.body.innerHTML = `
        <div style="font-family:Georgia,serif;text-align:center;padding:80px 24px;background:#0a0a14;min-height:100vh;color:#f0e8d8;">
          <p style="font-size:22px;margin-bottom:12px;">Paiement confirmé ✓</p>
          <p style="font-size:14px;opacity:0.5;">Vous pouvez fermer cet onglet et retourner sur EKKO.</p>
        </div>
      `;
    }, 300);
  }, [params]);

  return (
    <div style={{
      fontFamily: "Georgia, serif", textAlign: "center",
      padding: "80px 24px", background: "#0a0a14",
      minHeight: "100vh", color: "#f0e8d8",
    }}>
      <p style={{ fontSize: 22, marginBottom: 12 }}>Paiement confirmé ✓</p>
      <p style={{ fontSize: 14, opacity: 0.5 }}>Fermeture en cours…</p>
    </div>
  );
}
