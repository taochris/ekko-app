"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

interface AdminOrderItem {
  capsuleId: string;
  status: string;
  engraveName: string;
  engravingFont: string;
  format: string;
  nfcEnabled: boolean;
  smartSearchEnabled: boolean;
  shippingName: string;
  shippingAddress: string;
  customerPhone: string;
  customerEmail: string;
  createdAt: string;
  paidAt: string;
  shipped: boolean;
  shippedAt: string | null;
  shortUrl: string;
}

const FORMAT_NAMES: Record<string, string> = {
  "etiquette-rect": "Rectangulaire · 50×30 mm",
  "etiquette-arrondie": "Arrondie · 50,8×31,8 mm",
  carre: "Carré · 40×40 mm",
};

const FONT_NAMES: Record<string, string> = {
  "Georgia, serif": "Classique (Georgia)",
  "'Cinzel', serif": "Romain (Cinzel)",
  "'Dancing Script', cursive": "Cursif (Dancing Script)",
  "'Bebas Neue', sans-serif": "Bold (Bebas Neue)",
  "'Pacifico', cursive": "Arrondi (Pacifico)",
};

export default function AdminKeychainPanel({ accent }: { accent: string }) {
  const [orders, setOrders] = useState<AdminOrderItem[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"todo" | "done">("todo");
  const [telegramConfigured, setTelegramConfigured] = useState(false);
  const [telegramBotName, setTelegramBotName] = useState<string | null>(null);
  const [showTgSetup, setShowTgSetup] = useState(false);
  const [botTokenInput, setBotTokenInput] = useState("");
  const [tgStatusMsg, setTgStatusMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [tgBusy, setTgBusy] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getIdToken = async () => {
    const u = getAuth().currentUser;
    return u ? await u.getIdToken() : "";
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const token = await getIdToken();
      const res = await fetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders ?? []);
        setPendingCount(data.pendingCount ?? 0);
        setTelegramConfigured(Boolean(data.telegramConfigured));
        setTelegramBotName(data.telegramBotName ?? null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleToggleShipped = async (capsuleId: string, nextShipped: boolean) => {
    const token = await getIdToken();
    const res = await fetch("/api/admin/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: "toggleShipped", capsuleId, shipped: nextShipped }),
    });
    if (res.ok) {
      setOrders((prev) => {
        const updated = prev.map((o) =>
          o.capsuleId === capsuleId ? { ...o, shipped: nextShipped } : o
        );
        setPendingCount(updated.filter((o) => !o.shipped).length);
        return updated;
      });
    }
  };

  const handleDownloadSvg = async (capsuleId: string) => {
    const token = await getIdToken();
    const res = await fetch("/api/admin/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: "downloadSvg", capsuleId }),
    });
    if (!res.ok) return;
    const data = await res.json();
    if (!data.svg) return;
    const blob = new Blob([data.svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = data.filename || `lightburn-${capsuleId.slice(0, 8)}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleConnectTelegram = async () => {
    setTgBusy(true);
    setTgStatusMsg(null);
    try {
      const token = await getIdToken();
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "connectTelegram", botToken: botTokenInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTgStatusMsg({ ok: false, text: data.error || "Erreur lors de la connexion Telegram." });
      } else {
        setTelegramConfigured(true);
        setTelegramBotName(data.botUsername ?? null);
        setTgStatusMsg({
          ok: true,
          text: `Connecté à @${data.botUsername} ! Un message de confirmation vient d'être envoyé sur votre téléphone.`,
        });
        setShowTgSetup(false);
      }
    } finally {
      setTgBusy(false);
    }
  };

  const handleTestTelegram = async () => {
    setTgBusy(true);
    setTgStatusMsg(null);
    try {
      const token = await getIdToken();
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "testTelegram" }),
      });
      if (res.ok) {
        setTgStatusMsg({ ok: true, text: "Notification de test envoyée sur votre Telegram !" });
      } else {
        setTgStatusMsg({ ok: false, text: "Impossible d'envoyer le test Telegram." });
      }
    } finally {
      setTgBusy(false);
    }
  };

  const filtered = orders.filter((o) => (tab === "todo" ? !o.shipped : o.shipped));

  return (
    <div
      style={{
        marginBottom: 42,
        padding: "22px 20px",
        borderRadius: 20,
        background: "#130e10",
        border: `1.5px solid ${pendingCount > 0 ? "#e4766c" : accent + "55"}`,
        boxShadow: pendingCount > 0 ? "0 12px 36px rgba(228,118,108,0.18)" : "0 12px 32px rgba(0,0,0,0.45)",
      }}
    >
      {/* En-tête + Compteur rouge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 34,
              height: 34,
              padding: "0 10px",
              borderRadius: 999,
              background: pendingCount > 0 ? "#e4766c" : "rgba(87,200,138,0.2)",
              color: pendingCount > 0 ? "#1a0c0b" : "#57c88a",
              fontFamily: "sans-serif",
              fontSize: 15,
              fontWeight: 800,
              boxShadow: pendingCount > 0 ? "0 0 14px rgba(228,118,108,0.65)" : "none",
            }}
          >
            {pendingCount}
          </span>
          <div>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 17, color: "#f0e8d8", margin: 0 }}>
              🔑 Porte-clés à fabriquer
            </p>
            <p style={{ fontFamily: "sans-serif", fontSize: 12, color: "rgba(240,232,216,0.55)", margin: "2px 0 0" }}>
              {pendingCount > 0
                ? `${pendingCount} commande${pendingCount > 1 ? "s" : ""} physique${pendingCount > 1 ? "s" : ""} en attente de gravure`
                : "Aucune commande en attente de gravure"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowTgSetup((v) => !v)}
          style={{
            padding: "8px 13px",
            borderRadius: 10,
            cursor: "pointer",
            background: telegramConfigured ? "rgba(87,200,138,0.14)" : `${accent}20`,
            border: `1px solid ${telegramConfigured ? "rgba(87,200,138,0.55)" : accent}`,
            color: telegramConfigured ? "#57c88a" : accent,
            fontFamily: "sans-serif",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {telegramConfigured
            ? `📱 Push Telegram actif${telegramBotName ? ` (@${telegramBotName})` : ""}`
            : "📱 Activer les alertes Push Telegram"}
        </button>
      </div>

      {/* Panneau de configuration Telegram en 1 clic */}
      {showTgSetup && (
        <div
          style={{
            marginBottom: 18,
            padding: "16px 16px",
            borderRadius: 14,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <p style={{ fontFamily: "Georgia, serif", fontSize: 14, color: "#f0e8d8", margin: 0 }}>
            Recevoir une alerte instantanée sur Telegram à chaque commande de porte-clé :
          </p>
          <ol style={{ fontFamily: "sans-serif", fontSize: 12.5, color: "rgba(240,232,216,0.72)", margin: 0, paddingLeft: 18, lineHeight: 1.65 }}>
            <li>Dans Telegram, ouvrez <strong>@BotFather</strong> et envoyez <code>/newbot</code> (donnez-lui un nom, ex. <em>VosEkko Commandes</em>).</li>
            <li>Copiez le <strong>Token</strong> qu&apos;il vous donne (ex. <code>123456:ABC-DEF...</code>), collez-le ci-dessous.</li>
            <li>Ouvrez votre nouveau bot dans Telegram et appuyez sur <strong>Démarrer</strong> (<em>Start</em>), puis cliquez sur <strong>Connecter &amp; Tester</strong>.</li>
          </ol>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
            <input
              type="text"
              value={botTokenInput}
              onChange={(e) => setBotTokenInput(e.target.value)}
              placeholder="Collez ici le Token @BotFather (ex: 7123456:AAH...)"
              style={{
                flex: "1 1 220px",
                padding: "9px 12px",
                borderRadius: 9,
                background: "#090607",
                border: "1px solid rgba(255,255,255,0.16)",
                color: "#f0e8d8",
                fontFamily: "ui-monospace, monospace",
                fontSize: 12,
                outline: "none",
              }}
            />
            <button
              type="button"
              disabled={tgBusy}
              onClick={handleConnectTelegram}
              style={{
                padding: "9px 16px",
                borderRadius: 9,
                cursor: "pointer",
                background: accent,
                border: "none",
                color: "#1a130c",
                fontFamily: "sans-serif",
                fontSize: 12.5,
                fontWeight: 700,
              }}
            >
              {tgBusy ? "Connexion…" : "Connecter & Tester"}
            </button>
            {telegramConfigured && (
              <button
                type="button"
                disabled={tgBusy}
                onClick={handleTestTelegram}
                style={{
                  padding: "9px 14px",
                  borderRadius: 9,
                  cursor: "pointer",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  color: "#f0e8d8",
                  fontFamily: "sans-serif",
                  fontSize: 12,
                }}
              >
                Envoyer un push test
              </button>
            )}
          </div>
          {tgStatusMsg && (
            <p style={{ fontFamily: "sans-serif", fontSize: 12, color: tgStatusMsg.ok ? "#57c88a" : "#e4766c", margin: 0 }}>
              {tgStatusMsg.text}
            </p>
          )}
        </div>
      )}

      {/* Onglets À fabriquer / Expédiés */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button
          type="button"
          onClick={() => setTab("todo")}
          style={{
            padding: "7px 14px",
            borderRadius: 999,
            cursor: "pointer",
            background: tab === "todo" ? `${accent}25` : "rgba(255,255,255,0.04)",
            border: `1px solid ${tab === "todo" ? accent : "rgba(255,255,255,0.1)"}`,
            color: tab === "todo" ? "#f0e8d8" : "rgba(240,232,216,0.55)",
            fontFamily: "sans-serif",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          À fabriquer ({orders.filter((o) => !o.shipped).length})
        </button>
        <button
          type="button"
          onClick={() => setTab("done")}
          style={{
            padding: "7px 14px",
            borderRadius: 999,
            cursor: "pointer",
            background: tab === "done" ? `${accent}25` : "rgba(255,255,255,0.04)",
            border: `1px solid ${tab === "done" ? accent : "rgba(255,255,255,0.1)"}`,
            color: tab === "done" ? "#f0e8d8" : "rgba(240,232,216,0.55)",
            fontFamily: "sans-serif",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Expédiés ({orders.filter((o) => o.shipped).length})
        </button>
      </div>

      {loading ? (
        <p style={{ fontFamily: "sans-serif", fontSize: 13, color: "rgba(240,232,216,0.5)", margin: 0 }}>
          Chargement des commandes…
        </p>
      ) : filtered.length === 0 ? (
        <p style={{ fontFamily: "sans-serif", fontSize: 13, color: "rgba(240,232,216,0.45)", margin: 0 }}>
          {tab === "todo" ? "Tous les porte-clés ont été fabriqués et expédiés." : "Aucune commande marquée comme expédiée."}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((o) => (
            <div
              key={o.capsuleId}
              style={{
                padding: "16px 16px",
                borderRadius: 14,
                background: "#0b0809",
                border: `1px solid ${o.nfcEnabled ? "rgba(87,200,138,0.45)" : "rgba(201,169,110,0.3)"}`,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: 16, color: "#f0e8d8", fontWeight: 600 }}>
                    {o.engraveName ? `« ${o.engraveName} »` : "Sans prénom (QR seul)"}
                  </span>
                  <span style={{ fontFamily: "sans-serif", fontSize: 12, color: "rgba(240,232,216,0.55)", marginLeft: 10 }}>
                    {FORMAT_NAMES[o.format] ?? o.format} · {FONT_NAMES[o.engravingFont] ?? o.engravingFont}
                  </span>
                </div>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: 999,
                    fontFamily: "sans-serif",
                    fontSize: 11,
                    fontWeight: 700,
                    background: o.nfcEnabled ? "rgba(87,200,138,0.16)" : "rgba(201,169,110,0.15)",
                    border: `1px solid ${o.nfcEnabled ? "#57c88a" : accent}`,
                    color: o.nfcEnabled ? "#57c88a" : accent,
                  }}
                >
                  {o.nfcEnabled ? "⚡ QR + PUCE NFC" : "QR SEUL"}
                </span>
              </div>

              <div style={{ fontFamily: "sans-serif", fontSize: 12.5, color: "rgba(240,232,216,0.78)", lineHeight: 1.55 }}>
                <strong>Livraison :</strong> {o.shippingName || "Non renseigné"} —{" "}
                <span style={{ whiteSpace: "pre-line" }}>{o.shippingAddress || "Voir Stripe"}</span>
                {o.customerPhone ? ` · 📞 ${o.customerPhone}` : ""}
                {o.customerEmail ? ` · ✉️ ${o.customerEmail}` : ""}
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 2 }}>
                <button
                  type="button"
                  onClick={() => handleDownloadSvg(o.capsuleId)}
                  style={{
                    padding: "7px 12px",
                    borderRadius: 8,
                    cursor: "pointer",
                    background: `${accent}24`,
                    border: `1px solid ${accent}`,
                    color: "#f0e8d8",
                    fontFamily: "sans-serif",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  ⬇ SVG LightBurn
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(o.shortUrl);
                    setCopiedId(o.capsuleId);
                    setTimeout(() => setCopiedId(null), 2000);
                  }}
                  style={{
                    padding: "7px 12px",
                    borderRadius: 8,
                    cursor: "pointer",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    color: copiedId === o.capsuleId ? "#57c88a" : "#f0e8d8",
                    fontFamily: "sans-serif",
                    fontSize: 12,
                  }}
                >
                  {copiedId === o.capsuleId ? "✓ Lien copié !" : "📋 Copier lien NFC / QR"}
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleShipped(o.capsuleId, !o.shipped)}
                  style={{
                    marginLeft: "auto",
                    padding: "7px 13px",
                    borderRadius: 8,
                    cursor: "pointer",
                    background: o.shipped ? "rgba(255,255,255,0.05)" : "rgba(87,200,138,0.16)",
                    border: `1px solid ${o.shipped ? "rgba(255,255,255,0.15)" : "#57c88a"}`,
                    color: o.shipped ? "rgba(240,232,216,0.65)" : "#57c88a",
                    fontFamily: "sans-serif",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {o.shipped ? "↩ Remettre à fabriquer" : "✓ Marquer comme expédié"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
