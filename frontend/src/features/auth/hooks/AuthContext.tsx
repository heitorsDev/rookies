"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { api, getToken, setToken, clearToken } from "@/lib/api";
import { toast } from "sonner";
import { authApi } from "../api";

interface Member {
  name: string;
  username: string;
  role: "member" | "admin";
  is_active: boolean;
  is_activated: boolean;
  created_at: string;
  created_by: string;
}

interface AuthState {
  member: Member | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

async function fetchCurrentMember(): Promise<Member | null> {
  try {
    const response = await authApi.getCurrentMember();
    return response;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const user = await fetchCurrentMember();
      setMember(user);
      if (!user) {
        clearToken();
      }
    } catch {
      clearToken();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username: string, password: string) => {
    const response = await api.post<{ access_token: string; member: Member }>("/auth/login", {
      username,
      password,
    });
    setToken(response.access_token);
    setMember(response.member);
    toast.success(`Welcome back, ${response.member.name}!`);
  };

  const logout = () => {
    clearToken();
    setMember(null);
  };

  return (
    <AuthContext.Provider
      value={{
        member,
        isLoading,
        isAuthenticated: !!member,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}