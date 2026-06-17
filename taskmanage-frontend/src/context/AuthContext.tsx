import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi, AuthUser } from "../api/authApi";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true while we verify stored token

  // On mount — restore session from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("tm_token");
    const storedUser = localStorage.getItem("tm_user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        clearStorage();
      }
    }
    setIsLoading(false);
  }, []);

  function persist(token: string, user: AuthUser) {
    localStorage.setItem("tm_token", token);
    localStorage.setItem("tm_user", JSON.stringify(user));
    setToken(token);
    setUser(user);
  }

  function clearStorage() {
    localStorage.removeItem("tm_token");
    localStorage.removeItem("tm_user");
  }

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    persist(res.token, res.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await authApi.register(name, email, password);
    persist(res.token, res.user);
  };

  const logout = () => {
    clearStorage();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
