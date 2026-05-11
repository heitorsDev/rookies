"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Wrench, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authApi } from "@/features/auth/api";

export default function SetupPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [seedKey, setSeedKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkSystem() {
      try {
        const members = await authApi.listMembers();
        if (members && members.length > 0) {
          router.replace("/login");
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    }
    checkSystem();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      await authApi.seedAdmin(
        {
          name,
          username: username.toLowerCase().replace(/[^a-z0-9]/g, ""),
          password,
        },
        seedKey || undefined
      );
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create admin");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#201658]">
        <Loader2 className="h-8 w-8 animate-spin text-[#98abee]" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#201658]">
        <div className="mx-auto max-w-md px-6 text-center">
          <div className="flex justify-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle className="size-8 text-green-500" />
            </div>
          </div>
          <h1 className="mt-6 text-2xl font-bold text-[#f9e8c9]">
            Admin Account Created!
          </h1>
          <p className="mt-3 text-sm text-[#98abee]/70">
            Your admin account has been created. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#201658]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/4 h-[500px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1d24ca]/15 blur-[100px]" />
      </div>

      <div className="mx-auto w-full max-w-md px-6 py-12">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl border border-[#98abee]/20 bg-[#98abee]/10">
            <Wrench className="size-6 text-[#98abee]" />
          </div>
          <h1 className="text-2xl font-bold text-[#f9e8c9]">Setup Rookies</h1>
          <p className="mt-2 text-sm text-[#98abee]/70">
            Create the first admin account to get started
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#f9e8c9]">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. João Silva"
                className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-[#f9e8c9] placeholder:text-[#98abee]/30 focus:border-[#98abee]/50 focus:outline-none focus:ring-1 focus:ring-[#98abee]/50"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-[#f9e8c9]">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "")
                  )
                }
                placeholder="e.g. joaosilva"
                className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-[#f9e8c9] placeholder:text-[#98abee]/30 focus:border-[#98abee]/50 focus:outline-none focus:ring-1 focus:ring-[#98abee]/50"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-[#f9e8c9]">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-[#f9e8c9] placeholder:text-[#98abee]/30 focus:border-[#98abee]/50 focus:outline-none focus:ring-1 focus:ring-[#98abee]/50"
                required
              />
            </div>

<div className="space-y-2">
              <label className="text-xs font-medium text-[#f9e8c9]">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-[#f9e8c9] placeholder:text-[#98abee]/30 focus:border-[#98abee]/50 focus:outline-none focus:ring-1 focus:ring-[#98abee]/50"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-[#f9e8c9]">Seed Key (optional)</label>
              <input
                type="password"
                value={seedKey}
                onChange={(e) => setSeedKey(e.target.value)}
                placeholder="Enter seed key if configured"
                className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-[#f9e8c9] placeholder:text-[#98abee]/30 focus:border-[#98abee]/50 focus:outline-none focus:ring-1 focus:ring-[#98abee]/50"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Admin Account"
              )}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-[#98abee]/40">
          This account will have full admin permissions
        </p>
      </div>
    </div>
  );
}