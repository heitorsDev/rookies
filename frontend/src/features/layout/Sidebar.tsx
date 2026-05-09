"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks/AuthContext";
import { Icons } from "./icons";

const navItems = [
  {
    title: "Inventory",
    href: "/inventory",
    icon: Icons.inventory,
  },
  {
    title: "Register",
    href: "/register",
    icon: Icons.register,
  },
  {
    title: "Component Types",
    href: "/types",
    icon: Icons.types,
  },
];

const adminNavItems = [
  {
    title: "Team Members",
    href: "/members",
    icon: Icons.members,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { member, logout } = useAuth();

  return (
    <aside className="flex flex-col w-64 h-screen bg-sidebar fixed left-0 top-0 border-r border-sidebar-border">
      <div className="p-6">
        <Link
          href="/inventory"
          className="text-xl font-bold text-sidebar-foreground tracking-tight"
        >
          Rookies
        </Link>
        <p className="text-xs text-sidebar-foreground/60 mt-1">Component Registry</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "text-sidebar-ring")} />
              {item.title}
            </Link>
          );
        })}

        {member?.role === "admin" && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-3 text-xs font-medium text-sidebar-foreground/40 uppercase tracking-wider">
                Admin
              </p>
            </div>
            {adminNavItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive && "text-sidebar-ring")} />
                  {item.title}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
              <span className="text-sm font-medium text-sidebar-accent-foreground">
                {member?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {member?.name}
              </p>
              <p className="text-xs text-sidebar-foreground/50 truncate">
                @{member?.username}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
            title="Log out"
          >
            <Icons.logout className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}