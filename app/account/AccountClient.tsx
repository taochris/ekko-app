"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth, EkkoUser } from "../context/AuthContext";
import BlobBackground from "../components/BlobBackground";
import EkkoLogo from "../components/EkkoLogo";
import { updateProfile, updateEmail, getAuth } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

const THEME_LABELS: Record<string, string> = {
  deuil: "Memoire - Deuil",
  amour: "Amour - Lien",
  amitie: "Amitie - Gratitude",
  famille: "Famille - Heritage",
};

const THEME_ACCENTS: Record<string, string> = {
  deuil: "#c9a96e",
  amour: "#c96e8a",
  amitie: "#6e9bc9",
  famille: "#8ac96e",
};

function storageBadge(opt: number): { label: string; color: string } {
  if (opt === 100) return { label: "1 an", color: "#8ac96e" };
  if (opt === 200) return { label: "2 ans", color: "#c9a96e" };
  return { label: "7 jours", color: "#c96e6e" };
}

function formatDate(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function daysLeft(expiresAt: string | null): number {
  if (!expiresAt) return 0;
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (24 * 3600 * 1000)));
}

interface Echo {
  echoId: string;
  theme: string;
  accentColor: string;
  storageOption: number;
  expiresAt: string | null;
  createdApprox: string | null;
}

interface Invoice {
  id: string;
  date: string;
  amount: string;
  description: string;
  status: "payee" | "en_attente";
}

const STORAGE_PRICES: Record<number, string> = { 100: "10,99 €", 200: "11,99 €", 7: "9,99 €" };
const STORAGE_LABELS_INV: Record<number, string> = { 100: "1 an", 200: "2 ans", 7: "7 jours" };

function SectionLabel({ children, accent }: { children: string; accent: string }) {
  return (
    <p className="ekko-serif" style={{ fontSize: 12, letterSpacing: "0.35em", textTransform: "uppercase", color: accent + "60", marginBottom: 20, marginTop: 40 }}>
      {children}
    </p>
  );
}

function AccountInner({ user, logout }: { user: EkkoUser; logout: () => void }) {
  const router = useRouter();
  const accent = "#c9a96e";

  const [echos, setEchos] = useState<Echo[]>([]);
  const [echosLoading, setEchosLoading] = useState(true);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editPhone, setEditPhone] = useState("");

  useEffect(() => {
    const loadPhone = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists() && snap.data().phone) {
          setEditPhone(snap.data().phone);
        } else {
          const local = localStorage.getItem("ekko_phone_" + user.uid) ?? "";
          setEditPhone(local);
        }
      } catch {
        try { setEditPhone(localStorage.getItem("ekko_phone_" + user.uid) ?? ""); } catch { /* */ }
      }
    };
    loadPhone();
  }, [user.uid]);
  const [editSaving, setEditSaving] = useState(false);
  const [editMsg, setEditMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const invoices: Invoice[] = echos
    .filter(e => e.createdApprox)
    .map((e, i) => ({
      id: "INV-" + String(i + 1).padStart(3, "0"),
      date: e.createdApprox as string,
      amount: STORAGE_PRICES[e.storageOption] ?? "—",
      description: "Echo Sonore — " + (STORAGE_LABELS_INV[e.storageOption] ?? ""),
      status: "payee" as const,
    }));

  useEffect(() => {
    const uid = user.uid;
    const key = "ekko_echos_" + uid;
    let stored: Echo[] | null = null;
    try {
      const v = sessionStorage.getItem(key);
      stored = v ? JSON.parse(v) : null;
    } catch { stored = null; }
    if (stored && Array.isArray(stored)) {
      setEchos(stored);
      setEchosLoading(false);
      return;
    }
    fetch("/api/account/echos?uid=" + uid)
      .then(r => r.json())
      .then(d => {
        const list: Echo[] = d.echos ?? [];
        try { sessionStorage.setItem(key, JSON.stringify(list)); } catch {}
        setEchos(list);
        setEchosLoading(false);
      })
      .catch(() => setEchosLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSaveProfile() {
    setEditSaving(true);
    setEditMsg(null);
    try {
      const fbAuth = getAuth();
      const fbUser = fbAuth.currentUser;
      if (!fbUser) throw new Error("Non connecte");
      if (editName !== user.name) await updateProfile(fbUser, { displayName: editName });
      if (editEmail !== user.email) await updateEmail(fbUser, editEmail);
      try { localStorage.setItem("ekko_phone_" + user.uid, editPhone); } catch {}
      await setDoc(doc(db, "users", user.uid), { phone: editPhone, email: user.email, name: editName }, { merge: true });
      setEditMsg({ ok: true, text: "Informations mises a jour." });
      setEditOpen(false);
    } catch {
      setEditMsg({ ok: false, text: "Erreur lors de la mise a jour. Reconnectez-vous si necessaire." });
    } finally {
      setEditSaving(false);
    }
  }

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 15,
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,169,110,0.2)",
    color: "#f0e8d8", outline: "none", fontFamily: "Georgia, serif", boxSizing: "border-box" as const,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d0a0f", color: "#f0e8d8", position: "relative", overflow: "hidden" }}>
      <BlobBackground />

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 24px",
          background: "rgba(13,10,15,0.85)", backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(201,169,110,0.1)",
        }}>
        <button onClick={() => router.push("/")} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <EkkoLogo size="sm" />
        </button>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={() => router.push("/")} className="ekko-serif"
            style={{ background: "none", border: "1px solid " + accent + "30", borderRadius: 8, padding: "6px 16px", color: accent + "80", cursor: "pointer", fontSize: 14 }}>
            Retour
          </button>
          <button onClick={logout} className="ekko-serif"
            style={{ background: "none", border: "1px solid " + accent + "30", borderRadius: 8, padding: "6px 16px", color: accent + "80", cursor: "pointer", fontSize: 14 }}>
            Deconnexion
          </button>
        </div>
      </motion.div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "100px 20px 80px", position: "relative", zIndex: 1 }}>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%", margin: "0 auto 18px",
            background: "linear-gradient(135deg, " + accent + "40, " + accent + "80)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, border: "1px solid " + accent + "40",
          }}>
            {user.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <h1 className="ekko-serif" style={{ fontSize: 28, fontWeight: 300, color: "#f0e8d8", margin: "0 0 6px" }}>
            {user.name}
          </h1>
          <p className="ekko-serif" style={{ fontSize: 15, color: accent + "70", margin: 0 }}>{user.email}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }}>

          {/* INFOS PERSONNELLES */}
          <SectionLabel accent={accent}>Informations personnelles</SectionLabel>
          <div style={{ borderRadius: 20, border: "1px solid rgba(201,169,110,0.12)", background: "rgba(255,255,255,0.02)", overflow: "hidden" }}>
            {[
              { label: "Nom", value: user.name },
              { label: "Email", value: user.email },
              { label: "Telephone", value: editPhone || "Non renseigne" },
            ].map((row, i) => (
              <div key={row.label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "14px 20px",
                borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none",
              }}>
                <span className="ekko-serif" style={{ fontSize: 13, color: accent + "60", minWidth: 100 }}>{row.label}</span>
                <span className="ekko-serif" style={{ fontSize: 15, color: "#f0e8d8", textAlign: "right", flex: 1 }}>{row.value}</span>
              </div>
            ))}
            <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <button onClick={() => { setEditOpen(!editOpen); setEditMsg(null); }} className="ekko-serif"
                style={{ fontSize: 14, color: accent, background: "none", border: "1px solid " + accent + "30", borderRadius: 8, padding: "7px 18px", cursor: "pointer" }}>
                {editOpen ? "Annuler" : "Modifier"}
              </button>
            </div>
            <AnimatePresence>
              {editOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: "hidden" }}>
                  <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <label className="ekko-serif" style={{ fontSize: 12, color: accent + "60", display: "block", marginBottom: 6 }}>Nom</label>
                      <input value={editName} onChange={e => setEditName(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label className="ekko-serif" style={{ fontSize: 12, color: accent + "60", display: "block", marginBottom: 6 }}>Email</label>
                      <input value={editEmail} onChange={e => setEditEmail(e.target.value)} style={inputStyle} type="email" />
                    </div>
                    <div>
                      <label className="ekko-serif" style={{ fontSize: 12, color: accent + "60", display: "block", marginBottom: 6 }}>Telephone</label>
                      <input value={editPhone} onChange={e => setEditPhone(e.target.value)} style={inputStyle} type="tel" placeholder="+33 6 00 00 00 00" />
                    </div>
                    {editMsg && (
                      <p className="ekko-serif" style={{ fontSize: 13, color: editMsg.ok ? "#8ac96e" : "#c96e6e", margin: 0 }}>{editMsg.text}</p>
                    )}
                    <button onClick={handleSaveProfile} disabled={editSaving} className="ekko-serif"
                      style={{ padding: "10px 24px", borderRadius: 10, cursor: editSaving ? "wait" : "pointer", fontSize: 14,
                        background: accent + "25", border: "1px solid " + accent + "50", color: accent, alignSelf: "flex-start" }}>
                      {editSaving ? "Enregistrement..." : "Enregistrer"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* MES ECHOS */}
          <SectionLabel accent={accent}>Mes echos sonores</SectionLabel>
          {echosLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                style={{ width: 26, height: 26, border: "1.5px solid " + accent + "30", borderTop: "1.5px solid " + accent, borderRadius: "50%" }} />
            </div>
          ) : echos.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
              <p className="ekko-serif" style={{ fontSize: 16, color: "rgba(240,232,216,0.3)", fontStyle: "italic" }}>
                Aucun echo cree pour l instant.
              </p>
              <button onClick={() => router.push("/")} className="ekko-serif"
                style={{ marginTop: 16, padding: "10px 24px", borderRadius: 12, cursor: "pointer", background: accent + "20", border: "1px solid " + accent + "40", color: accent, fontSize: 15 }}>
                Creer mon premier echo
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {echos.map((echo, i) => {
                const a = echo.accentColor || THEME_ACCENTS[echo.theme] || accent;
                const storage = storageBadge(echo.storageOption);
                const days = daysLeft(echo.expiresAt);
                return (
                  <motion.div key={echo.echoId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
                    style={{ borderRadius: 18, padding: "20px 22px", background: "linear-gradient(135deg, " + a + "08, rgba(255,255,255,0.02))", border: "1px solid " + a + "20" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <span style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: a + "80" }} className="ekko-serif">
                            {THEME_LABELS[echo.theme] ?? echo.theme}
                          </span>
                          <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 20, background: storage.color + "20", color: storage.color, border: "1px solid " + storage.color + "40" }} className="ekko-serif">
                            {storage.label}
                          </span>
                        </div>
                        <p className="ekko-serif" style={{ fontSize: 14, color: "rgba(240,232,216,0.6)", margin: "0 0 4px" }}>
                          Cree le {formatDate(echo.createdApprox)}
                        </p>
                        <p className="ekko-serif" style={{ fontSize: 13, color: days <= 3 ? "#c96e6e" : "rgba(240,232,216,0.35)", margin: 0 }}>
                          Expire dans {days} jour{days > 1 ? "s" : ""} — {formatDate(echo.expiresAt)}
                        </p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, alignItems: "center" }}>
                        <button onClick={() => router.push("/v/" + echo.echoId)}
                          style={{ padding: "8px 16px", borderRadius: 10, cursor: "pointer", fontSize: 13, background: a + "20", border: "1px solid " + a + "35", color: a, fontFamily: "Georgia, serif", width: "100%" }}>
                          Ecouter
                        </button>
                        <a href={typeof window !== "undefined" ? window.location.origin + "/v/" + echo.echoId : "/v/" + echo.echoId} target="_blank" rel="noreferrer"
                          style={{ display: "block", padding: 6, borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=${encodeURIComponent((typeof window !== "undefined" ? window.location.origin : "") + "/v/" + echo.echoId)}&bgcolor=1a1520&color=${a.replace("#", "")}&margin=4`}
                            alt="QR Code"
                            width={64} height={64}
                            style={{ borderRadius: 6, display: "block" }}
                          />
                        </a>
                      </div>
                    </div>
                    <div style={{ marginTop: 14, height: 2, borderRadius: 1, background: "rgba(255,255,255,0.06)" }}>
                      <div style={{ height: "100%", borderRadius: 1, background: "linear-gradient(90deg, " + a + "50, " + a + ")",
                        width: Math.min(100, (days / (echo.storageOption === 100 ? 365 : echo.storageOption === 200 ? 730 : 7)) * 100) + "%" }} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* FACTURES */}
          <SectionLabel accent={accent}>Factures et paiements</SectionLabel>
          <div style={{ borderRadius: 20, border: "1px solid rgba(201,169,110,0.12)", background: "rgba(255,255,255,0.02)", overflow: "hidden" }}>
            {invoices.length === 0 ? (
              <p className="ekko-serif" style={{ padding: "24px 20px", fontSize: 15, color: "rgba(240,232,216,0.3)", fontStyle: "italic", margin: 0 }}>
                Aucune facture disponible.
              </p>
            ) : (
              invoices.map((inv, i) => (
                <div key={inv.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 20px",
                  borderBottom: i < invoices.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  gap: 12,
                }}>
                  <div style={{ flex: 1 }}>
                    <p className="ekko-serif" style={{ fontSize: 15, color: "#f0e8d8", margin: "0 0 3px" }}>{inv.description}</p>
                    <p className="ekko-serif" style={{ fontSize: 13, color: accent + "50", margin: 0 }}>{formatDate(inv.date)} · {inv.id}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                    <span className="ekko-serif" style={{ fontSize: 15, color: "#f0e8d8", fontWeight: 500 }}>{inv.amount}</span>
                    <span className="ekko-serif" style={{
                      fontSize: 12, padding: "3px 10px", borderRadius: 20,
                      background: inv.status === "payee" ? "#8ac96e20" : "#c9a96e20",
                      color: inv.status === "payee" ? "#8ac96e" : "#c9a96e",
                      border: "1px solid " + (inv.status === "payee" ? "#8ac96e40" : "#c9a96e40"),
                    }}>
                      {inv.status === "payee" ? "Payee" : "En attente"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

        </motion.div>
      </div>
    </div>
  );
}

export default function AccountClient() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !isLoading && !user) router.push("/compte");
  }, [mounted, isLoading, user, router]);

  if (!mounted || isLoading || !user) {
    return (
      <div style={{ minHeight: "100vh", background: "#0d0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          style={{ width: 28, height: 28, border: "1.5px solid #c9a96e30", borderTop: "1.5px solid #c9a96e", borderRadius: "50%" }} />
      </div>
    );
  }

  return <AccountInner user={user} logout={logout} />;
}
