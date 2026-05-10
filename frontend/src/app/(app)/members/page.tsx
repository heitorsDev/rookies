"use client";

import { useAuth } from "@/features/auth/hooks/AuthContext";
import { MemberTable } from "@/features/members/components/MemberTable";
import { AddMemberForm } from "@/features/members/components/AddMemberForm";
import { useMembers } from "@/features/members/hooks/useMembers";
import { ShieldOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";

export default function MembersPage() {
  const { member, isLoading: isAuthLoading } = useAuth();
  const { data: members, isLoading: isMembersLoading } = useMembers();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && member?.role !== "admin") {
      router.replace("/inventory");
    }
  }, [isAuthLoading, member, router]);

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen bg-[#faf7f2]">
        <Sidebar />
        <main className="flex-1 ml-64 p-6 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </main>
      </div>
    );
  }

  if (member?.role !== "admin") {
    return (
      <div className="flex min-h-screen bg-[#faf7f2]">
        <Sidebar />
        <main className="flex-1 ml-64 p-6 flex flex-col items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <ShieldOff className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Access Denied</p>
            <p className="text-xs text-muted-foreground">
              You need admin privileges to view this page
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#faf7f2]">
      <Sidebar />
      <main className="flex-1 ml-64 p-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Team Members
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your team&apos;s access and permissions
            </p>
          </div>

          <AddMemberForm />

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">All Members</h2>
            <MemberTable members={members ?? []} isLoading={isMembersLoading} />
          </div>
        </div>
      </main>
    </div>
  );
}
