"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authApi } from "../api";
import { toast } from "sonner";

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
  logout: () => Promise<void>;
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
    try {
      const user = await fetchCurrentMember();
      setMember(user);
    } catch {
      setMember(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username: string, password: string) => {
    const response = await authApi.login({ username, password });
    setMember(response);
    toast.success(`Welcome back, ${response.name}!`);
  };

  const logout = async () => {
    await authApi.logout();
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