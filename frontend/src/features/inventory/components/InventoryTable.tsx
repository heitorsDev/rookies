"use client";

import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import type { InventoryItem } from "../api";
import { StatusBadge } from "./StatusBadge";

interface InventoryTableProps {
  items: InventoryItem[];
  isLoading: boolean;
}

export function InventoryTable({ items, isLoading }: InventoryTableProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Package className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">No components found</p>
          <p className="text-xs text-muted-foreground">
            Try adjusting your filters or register a new component
          </p>
        </div>
        <Link
          href="/register"
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          Register a component
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Code
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Notes
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
            {items.map((item) => (
              <tr
                key={item.code}
                className="group transition-colors hover:bg-muted/30"
              >
                <td className="px-4 py-3">
                  <span className="font-mono text-sm font-medium text-foreground">
                    {item.code}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-foreground">
                    {item.component_type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-4 py-3">
                  <span
                    className="block max-w-xs truncate text-sm text-muted-foreground"
                    title={item.notes}
                  >
                    {item.notes || "-"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/inventory/${item.code}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100 hover:underline"
                  >
                    View
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
