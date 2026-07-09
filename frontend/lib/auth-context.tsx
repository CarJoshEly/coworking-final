"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getToken, clearToken } from "./api-client";
import { authService } from "./services/auth";
import type { LoginDto } from "./types";

interface SessionUser {
  userId: number;
  email: string;
  role: string;
}

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  login: (dto: LoginDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      Promise.resolve().then(() => setLoading(false));
      return;
    }
    authService
      .me()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  async function login(dto: LoginDto) {
    await authService.login(dto);
    const me = await authService.me();
    setUser(me);
  }

  function logout() {
    authService.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
