"use client";

import { useState } from "react";
import { User, Shield, ShieldOff, Clock, CheckCircle, Copy, MoreHorizontal, RefreshCw, ArrowUp, ArrowDown } from "lucide-react";
import type { MemberResponse } from "@/features/auth/api";
import { authApi } from "@/features/auth/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MemberTableProps {
  members: MemberResponse[];
  isLoading: boolean;
  currentUsername: string;
  onRefresh: () => void;
}

export function MemberTable({ members, isLoading, currentUsername, onRefresh }: MemberTableProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [newToken, setNewToken] = useState<{ username: string; token: string } | null>(null);

  async function handleToggleActive(member: MemberResponse) {
    setActionLoading(member.username);
    setOpenMenu(null);
    try {
      if (member.is_active) {
        await authApi.deactivateMember(member.username);
        toast.success(`${member.name} has been deactivated`);
      } else {
        await authApi.activateMemberAccount(member.username);
        toast.success(`${member.name} has been activated`);
      }
      onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRegenerateToken(member: MemberResponse) {
    setActionLoading(member.username);
    setOpenMenu(null);
    try {
      const result = await authApi.regenerateToken(member.username);
      setNewToken({ username: member.username, token: result.token });
      toast.success(`New token generated for ${member.name}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate token");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleToggleRole(member: MemberResponse) {
    setActionLoading(member.username);
    setOpenMenu(null);
    const newRole = member.role === "admin" ? "member" : "admin";
    try {
      await authApi.updateMemberRole(member.username, newRole);
      toast.success(`${member.name} is now ${newRole === "admin" ? "an admin" : "a member"}`);
      onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setActionLoading(null);
    }
  }

  function handleCopyToken() {
    if (newToken?.token) {
      navigator.clipboard.writeText(newToken.token);
      toast.success("Token copied to clipboard");
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <User className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">No team members</p>
          <p className="text-xs text-muted-foreground">
            Add your first team member to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {newToken && (
        <div className="mb-4 rounded-lg bg-green-50 dark:bg-green-950/30 p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">New Token for @{newToken.username}</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="rounded bg-white dark:bg-black px-3 py-1.5 text-xs font-mono text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800 break-all">
                {newToken.token}
              </code>
              <Button size="icon" variant="outline" onClick={handleCopyToken}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setNewToken(null)}>
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Username
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Created
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.map((member) => (
                <tr
                  key={member.username}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent">
                        <span className="text-sm font-medium text-sidebar-accent-foreground">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {member.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted-foreground">
                      @{member.username}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {member.role === "admin" ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                        <Shield className="h-3.5 w-3.5" />
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        Member
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {member.is_active ? (
                        member.is_activated ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                            <Clock className="h-3.5 w-3.5" />
                            Pending
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                          <ShieldOff className="h-3.5 w-3.5" />
                          Inactive
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted-foreground">
                      {new Date(member.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="relative">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => setOpenMenu(openMenu === member.username ? null : member.username)}
                        disabled={actionLoading === member.username}
                      >
                        {actionLoading === member.username ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreHorizontal className="h-4 w-4" />
                        )}
                      </Button>

                      {openMenu === member.username && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenu(null)}
                          />
                          <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-lg border border-border bg-background shadow-lg overflow-hidden">
                            <div className="py-1">
                              {!member.is_activated && (
                                <button
                                  onClick={() => handleRegenerateToken(member)}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                >
                                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                                  Regenerate Token
                                </button>
                              )}
                              <button
                                onClick={() => handleToggleRole(member)}
                                disabled={member.username === currentUsername}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title={member.username === currentUsername ? "You cannot change your own role" : undefined}
                              >
                                {member.role === "admin" ? (
                                  <>
                                    <ArrowDown className="h-4 w-4 text-muted-foreground" />
                                    Demote to Member
                                  </>
                                ) : (
                                  <>
                                    <ArrowUp className="h-4 w-4 text-muted-foreground" />
                                    Promote to Admin
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleToggleActive(member)}
                                disabled={member.username === currentUsername}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title={member.username === currentUsername ? "You cannot deactivate yourself" : undefined}
                              >
                                {member.is_active ? (
                                  <>
                                    <ShieldOff className="h-4 w-4 text-red-500" />
                                    <span className="text-red-600 dark:text-red-400">Deactivate</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-green-600 dark:text-green-400">Activate</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
