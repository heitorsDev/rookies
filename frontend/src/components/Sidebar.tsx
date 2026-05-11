"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/AuthContext";

const navItems = [
  { title: "Inventory", href: "/inventory" },
  { title: "Register", href: "/register" },
  { title: "Component Types", href: "/types" },
  { title: "New Type", href: "/types/new" },
];

const adminNavItems = [{ title: "Team Members", href: "/members" }];

export function Sidebar() {
  const pathname = usePathname();
  const { member, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] flex flex-col z-50">
      <div className="p-6">
        <Link
          href="/"
          className="text-xl font-bold text-[var(--sidebar-foreground)] tracking-tight"
        >
          Rookies
        </Link>
        <p className="text-xs text-white/50 mt-1">Component Registry</p>
      </div>

      <nav className="flex-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-all ${
                isActive
                  ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]"
                  : "text-white/60 hover:bg-white/5 hover:text-[var(--sidebar-foreground)]"
              }`}
            >
              {item.title}
            </Link>
          );
        })}

        {member?.role === "admin" && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-3 text-xs font-medium text-white/30 uppercase tracking-wider">
                Admin
              </p>
            </div>
            {adminNavItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]"
                      : "text-white/60 hover:bg-white/5 hover:text-[var(--sidebar-foreground)]"
                  }`}
                >
                  {item.title}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-[var(--sidebar-border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--sidebar-accent)] flex items-center justify-center">
              <span className="text-sm font-medium text-[var(--sidebar-accent-foreground)]">
                {member?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--sidebar-foreground)] truncate">
                {member?.name}
              </p>
              <p className="text-xs text-white/40 truncate">@{member?.username}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 text-white/40 hover:text-white/70 transition-colors"
            title="Log out"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
