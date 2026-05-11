"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href: string;
}

function isDynamicSegment(segment: string): boolean {
  return segment.startsWith("[") && segment.endsWith("]");
}

function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  breadcrumbs.push({ label: "Home", href: "/inventory" });

  let currentPath = "";
  for (const segment of segments) {
    currentPath += `/${segment}`;

    if (isDynamicSegment(segment)) {
      continue;
    }

    const labelMap: Record<string, string> = {
      inventory: "Inventory",
      register: "Register",
      types: "Component Types",
      members: "Team Members",
    };

    const label = labelMap[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({ label, href: currentPath });
  }

  return breadcrumbs;
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1 text-sm text-muted-foreground">
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;

        return (
          <div key={item.href} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
            {isLast ? (
              <span className="text-foreground font-medium">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export function PageHeader({
  breadcrumbs = true,
  children,
}: {
  breadcrumbs?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      {breadcrumbs && <Breadcrumbs />}
      {children}
    </div>
  );
}