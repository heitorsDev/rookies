"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/features/auth/api";

export function SetupRedirect() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const result = await authApi.checkMembersExist();
        if (!result.exists) {
          router.replace("/setup");
        } else {
          router.replace("/inventory");
        }
      } catch {
        router.replace("/login");
      } finally {
        setIsChecking(false);
      }
    };

    checkSetup();
  }, [router]);

  if (isChecking) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return null;
}
