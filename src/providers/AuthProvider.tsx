"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  apiFetch,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
  type StoredPortalUser,
} from "@/lib/api";

export type PortalUser = StoredPortalUser;

type AuthState = {
  token: string | null;
  user: PortalUser | null;
  ready: boolean;
  setSession: (token: string, user: PortalUser) => void;
  logout: () => void;
  login: (email: string, password: string) => Promise<PortalUser>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<PortalUser | null>(() => getStoredUser());
  const [ready] = useState(true);

  const setSession = useCallback((t: string, u: PortalUser) => {
    setStoredToken(t);
    setStoredUser(u);
    setToken(t);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    setStoredUser(null);
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    type Res = { token: string; user: PortalUser };
    const res = await apiFetch<Res>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setSession(res.token, res.user);
    return res.user;
  }, [setSession]);

  const value = useMemo(
    () => ({ token, user, ready, setSession, logout, login }),
    [token, user, ready, setSession, logout, login]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const v = useContext(AuthContext);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
