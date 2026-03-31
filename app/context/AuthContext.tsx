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
  User,
} from "firebase/auth";
import { auth } from "../lib/firebase";

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
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<EkkoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ? toEkkoUser(firebaseUser) : null);
      setIsLoading(false);
    });
    return unsub;
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

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
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
      await signInWithPopup(auth, provider);
      return { ok: true };
    } catch (e: unknown) {
      const code = (e as { code?: string }).code ?? "";
      return { ok: false, error: firebaseErrorMsg[code] ?? "Une erreur est survenue." };
    }
  }, []);

  const logout = useCallback(() => {
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
