"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState, useId } from "react";
import { Eye, EyeOff, Loader2, Wrench, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authApi } from "../api";
import { cn } from "@/lib/utils";

const setupSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be at most 30 characters")
      .regex(
        /^[a-z0-9]+(-[a-z0-9]+)*$/,
        "Username must be lowercase letters, numbers, and hyphens only"
      ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SetupFormData = z.infer<typeof setupSchema>;

export function SetupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fieldId = useId();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
  });

  const onSubmit = async (data: SetupFormData) => {
    setIsSubmitting(true);
    try {
      await authApi.seedFirstAdmin({
        name: data.name,
        username: data.username,
        password: data.password,
      });
      toast.success("Admin account created! You can now sign in.");
      router.push("/login?setup_success=true");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create admin account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5">
      <div className="space-y-1.5">
        <label
          htmlFor={`${fieldId}-name`}
          className="text-sm font-medium text-foreground/90"
        >
          Full Name
        </label>
        <div className="relative">
          <input
            id={`${fieldId}-name`}
            type="text"
            autoComplete="name"
            placeholder="e.g. João Silva"
            {...register("name")}
            className={cn(
              "block h-10 w-full rounded-xl border bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring",
              errors.name
                ? "border-destructive ring-1 ring-destructive/30"
                : "border-border hover:border-foreground/20"
            )}
          />
        </div>
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

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
            autoComplete="new-password"
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

      <div className="space-y-1.5">
        <label
          htmlFor={`${fieldId}-confirm-password`}
          className="text-sm font-medium text-foreground/90"
        >
          Confirm Password
        </label>
        <div className="relative">
          <input
            id={`${fieldId}-confirm-password`}
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
            {...register("confirmPassword")}
            className={cn(
              "block h-10 w-full rounded-xl border bg-background px-3.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground/30 transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring",
              errors.confirmPassword
                ? "border-destructive ring-1 ring-destructive/30"
                : "border-border hover:border-foreground/20"
            )}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors hover:text-foreground"
            tabIndex={-1}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="relative h-10 w-full overflow-hidden rounded-xl text-sm font-medium shadow-sm transition-all duration-300 active:scale-[0.98]"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <>
            <span className="relative z-10 flex items-center justify-center gap-2">
              Create Admin Account
              <ShieldCheck className="size-4" />
            </span>
          </>
        )}
      </Button>
    </form>
  );
}
