"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  User,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { getFirestore, doc, setDoc } from "firebase/firestore";

export interface EkkoUser {
  uid: string;
  email: string;
  name: string;
  photoURL?: string;
}

interface AuthContextValue {
  user: EkkoUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ ok: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toEkkoUser(u: User): EkkoUser {
  return {
    uid: u.uid,
    email: u.email ?? "",
    name: u.displayName ?? u.email?.split("@")[0] ?? "Utilisateur",
    photoURL: u.photoURL ?? undefined,
  };
}

const firebaseErrorMsg: Record<string, string> = {
  "auth/user-not-found": "Aucun compte trouvé avec cet email.",
  "auth/wrong-password": "Mot de passe incorrect.",
  "auth/invalid-credential": "Email ou mot de passe incorrect.",
  "auth/email-already-in-use": "Un compte existe déjà avec cet email.",
  "auth/weak-password": "Le mot de passe doit contenir au moins 6 caractères.",
  "auth/invalid-email": "Adresse email invalide.",
  "auth/popup-closed-by-user": "Connexion annulée.",
  "auth/cancelled-popup-request": "Connexion annulée.",
};

const SESSION_KEY = "ekko_auth_user";

function readCachedUser(): EkkoUser | null {
  if (typeof window === "undefined") return null;
  try {
    const v = sessionStorage.getItem(SESSION_KEY);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<EkkoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Récupérer le résultat du redirect Google si l'utilisateur revient d'une auth Google mobile
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        const u = toEkkoUser(result.user);
        try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(u)); } catch {}
        setUser(u);
        setIsLoading(false);
      }
    }).catch(() => {});

    let resolved = false;
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      const u = firebaseUser ? toEkkoUser(firebaseUser) : null;
      if (u) {
        try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(u)); } catch {}
      }
      setUser(u);
      if (!resolved) {
        resolved = true;
        setIsLoading(false);
      }
    });
    return () => { resolved = true; unsub(); };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { ok: true };
    } catch (e: unknown) {
      const code = (e as { code?: string }).code ?? "";
      return { ok: false, error: firebaseErrorMsg[code] ?? "Une erreur est survenue." };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, phone?: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      const db = getFirestore();
      await setDoc(doc(db, "users", cred.user.uid), { name, email, phone: phone ?? "" }, { merge: true });
      setUser(toEkkoUser({ ...cred.user, displayName: name }));
      return { ok: true };
    } catch (e: unknown) {
      const code = (e as { code?: string }).code ?? "";
      return { ok: false, error: firebaseErrorMsg[code] ?? "Une erreur est survenue." };
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider();
      const isMobile = typeof window !== "undefined" &&
        /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
      if (isMobile) {
        await signInWithRedirect(auth, provider);
        return { ok: true };
      }
      try {
        await signInWithPopup(auth, provider);
      } catch (popupErr: unknown) {
        const code = (popupErr as { code?: string }).code ?? "";
        if (code === "auth/popup-blocked" || code === "auth/cancelled-popup-request") {
          await signInWithRedirect(auth, provider);
          return { ok: true };
        }
        throw popupErr;
      }
      return { ok: true };
    } catch (e: unknown) {
      const code = (e as { code?: string }).code ?? "";
      return { ok: false, error: firebaseErrorMsg[code] ?? "Une erreur est survenue." };
    }
  }, []);

  const logout = useCallback(() => {
    try { sessionStorage.removeItem(SESSION_KEY); } catch {}
    signOut(auth);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
