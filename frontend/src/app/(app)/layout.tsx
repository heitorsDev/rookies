"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/AuthContext";
import { Sidebar } from "@/features/layout/Sidebar";
import { Loader2 } from "@/components/loader";

const publicPaths = ["/login", "/activate", "/"];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, member } = useAuth();

  const isPublicPath = publicPaths.some((path) =>
    pathname.startsWith(path)
  );

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !isPublicPath) {
      router.replace("/login");
    } else if (isAuthenticated && (pathname === "/login" || pathname === "/activate")) {
      router.replace("/inventory");
    }
  }, [isLoading, isAuthenticated, isPublicPath, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (isPublicPath) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pl-64 min-h-screen">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}