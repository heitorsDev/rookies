"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi, type LoginRequest, type ActivateRequest } from "../api";
import { setToken, clearToken } from "@/lib/api";

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (res) => {
      setToken(res.access_token);
      router.push("/inventory");
    },
    onError: () => {
      toast.error("Invalid username or password");
    },
  });
}

export function useActivate() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: ActivateRequest) => authApi.activate(data),
    onSuccess: () => {
      toast.success("Account activated. You can now log in.");
      router.push("/login");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
}

export function useLogout() {
  const router = useRouter();

  return () => {
    clearToken();
    router.push("/login");
  };
}
