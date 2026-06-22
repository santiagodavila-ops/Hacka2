import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { api, TOKEN_KEY } from "../lib/api";
import type { AuthResponse, User } from "../types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  login: (teamCode: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  // Al cargar la app: si hay token guardado, restauramos la sesión con /auth/me.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setStatus("unauthenticated");
      return;
    }
    let cancelled = false;
    api
      .get<User>("/auth/me")
      .then((res) => {
        if (cancelled) return;
        setUser(res.data);
        setStatus("authenticated");
      })
      .catch(() => {
        if (cancelled) return;
        localStorage.removeItem(TOKEN_KEY);
        setStatus("unauthenticated");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function login(teamCode: string, email: string, password: string): Promise<void> {
    const res = await api.post<AuthResponse>("/auth/login", { teamCode, email, password });
    localStorage.setItem(TOKEN_KEY, res.data.token);
    setUser(res.data.user);
    setStatus("authenticated");
  }

  function logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setStatus("unauthenticated");
  }

  return (
    <AuthContext.Provider value={{ user, status, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return ctx;
}
