"use client";

import { useState } from "react";
import { Plus, X, Copy, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateMember } from "../hooks/useMembers";

export function AddMemberForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("member");
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const createMember = useCreateMember();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setToken(null);

    try {
      const result = await createMember.mutateAsync({ name, username, role });
      setToken(result.token);
      setName("");
      setUsername("");
      setRole("member");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create member");
    }
  };

  const handleCopyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setName("");
    setUsername("");
    setRole("member");
    setToken(null);
    setError(null);
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {!isOpen ? (
        <div className="p-4">
          <Button onClick={() => setIsOpen(true)} variant="outline" className="w-full">
            <Plus className="h-4 w-4" />
            Add Team Member
          </Button>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Add New Member</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {token ? (
            <div className="space-y-3">
              <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Member Created!</span>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-green-600 dark:text-green-500">
                    <strong>What is this token?</strong> This is a one-time activation code. Share it with the new member so they can set their own password. They must visit the <code className="font-mono bg-green-100 dark:bg-green-900/50 px-1 rounded">/activate</code> page and enter this token along with their username.
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500">
                    <strong>Important:</strong> This token can only be used once. If it's lost, you can generate a new one from the member list.
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <code className="flex-1 rounded bg-white dark:bg-black px-3 py-2 text-xs font-mono text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800 break-all">
                    {token}
                  </code>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleCopyToken}
                    className="shrink-0"
                  >
                    {isCopied ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Button onClick={() => setToken(null)} variant="outline" size="sm" className="w-full">
                Add Another Member
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 border border-red-200 dark:border-red-800">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                  <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. João Silva"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""))}
                  placeholder="e.g. joaosilva"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <Button
                type="submit"
                disabled={createMember.isPending}
                className="w-full"
              >
                {createMember.isPending ? "Creating..." : "Create Member"}
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}