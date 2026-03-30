"use client";
import { AuthProvider as Provider } from "../context/AuthContext";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <Provider>{children}</Provider>;
}
