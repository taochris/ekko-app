"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface EkkoUser {
  email: string;
  name: string;
  createdAt: string;
  isAdmin?: boolean;
}

interface AuthContextValue {
  user: EkkoUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "ekko_session";
const USERS_KEY = "ekko_users";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<EkkoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch { /* ignore */ }
    setIsLoading(false);
  }, []);

  const getUsers = (): Record<string, { name: string; hash: string; createdAt: string }> => {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) ?? "{}"); } catch { return {}; }
  };

  const hashPassword = (pw: string) => btoa(encodeURIComponent(pw + "ekko_salt_2024"));

  const login = useCallback(async (email: string, password: string) => {
    const users = getUsers();
    const entry = users[email.toLowerCase()];
    if (!entry) return { ok: false, error: "Aucun compte trouvé avec cet email." };
    if (entry.hash !== hashPassword(password)) return { ok: false, error: "Mot de passe incorrect." };
    const u: EkkoUser = { email: email.toLowerCase(), name: entry.name, createdAt: entry.createdAt };
    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    return { ok: true };
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const users = getUsers();
    const key = email.toLowerCase();
    if (users[key]) return { ok: false, error: "Un compte existe déjà avec cet email." };
    if (password.length < 6) return { ok: false, error: "Le mot de passe doit contenir au moins 6 caractères." };
    const createdAt = new Date().toISOString();
    users[key] = { name, hash: hashPassword(password), createdAt };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    const u: EkkoUser = { email: key, name, createdAt };
    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
