"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useActivate } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState, useId } from "react";
import { Eye, EyeOff, Loader2, KeyRound, Check, X } from "lucide-react";

const activateSchema = z
  .object({
    username: z.string().min(1, "Username is required"),
    token: z.string().min(1, "Activation token is required"),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .max(128, "Password is too long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ActivateFormData = z.infer<typeof activateSchema>;

function PasswordRequirement({
  met,
  label,
}: {
  met: boolean;
  label: string;
}) {
  return (
    <span
      className={cn(
        "flex items-center gap-1.5 text-xs transition-colors duration-200",
        met ? "text-emerald-500" : "text-muted-foreground/60"
      )}
    >
      {met ? (
        <Check className="size-3 shrink-0" />
      ) : (
        <X className="size-3 shrink-0" />
      )}
      {label}
    </span>
  );
}

export function ActivateForm() {
  const activate = useActivate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const fieldId = useId();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ActivateFormData>({
    resolver: zodResolver(activateSchema),
    defaultValues: { username: "", token: "", password: "", confirmPassword: "" },
  });

  const password = watch("password", "");
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasMinLen = password.length >= 8;

  const onSubmit = (data: ActivateFormData) => {
    activate.mutate({
      username: data.username,
      token: data.token,
      password: data.password,
    });
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
        {errors.username && (
          <p className="text-xs text-destructive">{errors.username.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor={`${fieldId}-token`}
          className="text-sm font-medium text-foreground/90"
        >
          Activation token
        </label>
        <div className="relative">
          <input
            id={`${fieldId}-token`}
            type="text"
            autoComplete="off"
            placeholder="Paste the token from your admin"
            spellCheck={false}
            {...register("token")}
            className={cn(
              "block h-10 w-full rounded-xl border bg-background px-3.5 pl-10 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 font-mono tracking-wider",
              "focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring",
              errors.token
                ? "border-destructive ring-1 ring-destructive/30"
                : "border-border hover:border-foreground/20"
            )}
          />
          <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
        </div>
        {errors.token && (
          <p className="text-xs text-destructive">{errors.token.message}</p>
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
            autoComplete="new-password"
            placeholder="Create a strong password"
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
        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
          <PasswordRequirement met={hasMinLen} label="8+ characters" />
          <PasswordRequirement met={hasUpper} label="Uppercase" />
          <PasswordRequirement met={hasLower} label="Lowercase" />
          <PasswordRequirement met={hasDigit} label="Number" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor={`${fieldId}-confirm`}
          className="text-sm font-medium text-foreground/90"
        >
          Confirm password
        </label>
        <div className="relative">
          <input
            id={`${fieldId}-confirm`}
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            {...register("confirmPassword")}
            className={cn(
              "block h-10 w-full rounded-xl border bg-background px-3.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground/30 transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring",
              errors.confirmPassword
                ? "border-destructive ring-1 ring-destructive/30"
                : watch("confirmPassword") && watch("confirmPassword") === password
                  ? "border-emerald-500/50 ring-1 ring-emerald-500/20"
                  : "border-border hover:border-foreground/20"
            )}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors hover:text-foreground"
            tabIndex={-1}
            aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
          >
            {showConfirm ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="relative h-10 w-full overflow-hidden rounded-xl text-sm font-medium shadow-sm transition-all duration-300 active:scale-[0.98]"
        disabled={activate.isPending}
      >
        {activate.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <span className="relative z-10 flex items-center justify-center gap-2">
            Activate account
            <KeyRound className="size-4" />
          </span>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline underline-offset-2 transition-colors hover:text-primary"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
