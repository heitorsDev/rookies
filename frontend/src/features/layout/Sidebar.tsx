"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  const sidebarStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    width: "256px",
    height: "100vh",
    backgroundColor: "#201658",
    position: "fixed",
    left: 0,
    top: 0,
    borderRight: "1px solid rgba(255,255,255,0.08)",
    color: "#f9e8c9",
    zIndex: 50,
  };

  const activeLinkStyle = {
    backgroundColor: "#2a1f6b",
    color: "#98abee",
  };

  const inactiveLinkStyle = {
    color: "rgba(249, 232, 201, 0.7)",
  };

  const hoverLinkStyle = {
    backgroundColor: "rgba(42, 31, 107, 0.5)",
    color: "#f9e8c9",
  };

  return (
    <aside style={sidebarStyle}>
      <div style={{ padding: "1.5rem" }}>
        <Link
          href="/inventory"
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "#f9e8c9",
            letterSpacing: "-0.025em",
          }}
        >
          Rookies
        </Link>
        <p style={{ fontSize: "0.75rem", color: "rgba(249,232,201,0.6)", marginTop: "0.25rem" }}>
          Component Registry
        </p>
      </div>

      <nav style={{ flex: 1, padding: "0 0.75rem" }}>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.625rem 0.75rem",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                transition: "all 0.2s",
                marginBottom: "0.25rem",
                ...(isActive ? activeLinkStyle : inactiveLinkStyle),
              }}
            >
              <item.icon style={{ width: "1.25rem", height: "1.25rem", color: isActive ? "#98abee" : "inherit" }} />
              {item.title}
            </Link>
          );
        })}

        {member?.role === "admin" && (
          <>
            <div style={{ paddingTop: "1rem", paddingBottom: "0.5rem" }}>
              <p style={{ padding: "0 0.75rem", fontSize: "0.75rem", fontWeight: 500, color: "rgba(249,232,201,0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Admin
              </p>
            </div>
            {adminNavItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.625rem 0.75rem",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    transition: "all 0.2s",
                    marginBottom: "0.25rem",
                    ...(isActive ? activeLinkStyle : inactiveLinkStyle),
                  }}
                >
                  <item.icon style={{ width: "1.25rem", height: "1.25rem", color: isActive ? "#98abee" : "inherit" }} />
                  {item.title}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div style={{ padding: "1rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "2rem", height: "2rem", borderRadius: "9999px", backgroundColor: "#2a1f6b", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#98abee" }}>
                {member?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#f9e8c9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {member?.name}
              </p>
              <p style={{ fontSize: "0.75rem", color: "rgba(249,232,201,0.5)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                @{member?.username}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              padding: "0.5rem",
              borderRadius: "0.5rem",
              color: "rgba(249,232,201,0.5)",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
            }}
            title="Log out"
          >
            <Icons.logout style={{ width: "1.25rem", height: "1.25rem" }} />
          </button>
        </div>
      </div>
    </aside>
  );
}