"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "../hooks/useLogin";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState, useId } from "react";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const fieldId = useId();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5">
      <div className="space-y-1.5">
        <label
          htmlFor={`${fieldId}-username`}
          className="text-sm font-medium text-foreground/90"
        >
          Username
        </label>
        <div className="relative">
          <input
            id={`${fieldId}-username`}
            type="text"
            autoComplete="username"
            placeholder="e.g. joaosilva"
            {...register("username")}
            className={cn(
              "block h-10 w-full rounded-xl border bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring",
              errors.username
                ? "border-destructive ring-1 ring-destructive/30"
                : "border-border hover:border-foreground/20"
            )}
          />
        </div>
        {errors.username && (
          <p className="text-xs text-destructive">{errors.username.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor={`${fieldId}-password`}
          className="text-sm font-medium text-foreground/90"
        >
          Password
        </label>
        <div className="relative">
          <input
            id={`${fieldId}-password`}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
            {...register("password")}
            className={cn(
              "block h-10 w-full rounded-xl border bg-background px-3.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground/30 transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring",
              errors.password
                ? "border-destructive ring-1 ring-destructive/30"
                : "border-border hover:border-foreground/20"
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors hover:text-foreground"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="relative h-10 w-full overflow-hidden rounded-xl text-sm font-medium shadow-sm transition-all duration-300 active:scale-[0.98]"
        disabled={login.isPending}
      >
        {login.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <>
            <span className="relative z-10 flex items-center justify-center gap-2">
              Sign in
              <LogIn className="size-4" />
            </span>
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/activate"
          className="font-medium text-foreground underline underline-offset-2 transition-colors hover:text-primary"
        >
          Activate your account
        </Link>
      </p>
    </form>
  );
}
