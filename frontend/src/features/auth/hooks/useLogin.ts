"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";

export function useLogin() {
  const router = useRouter();
  const { login } = useAuth();

  return useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      await login(data.username, data.password);
    },
    onSuccess: () => {
      router.push("/inventory");
    },
    onError: () => {
      // Error is handled in AuthContext
    },
  });
}