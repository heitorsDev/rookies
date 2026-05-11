"use client";

import { Search, X } from "lucide-react";
import type { ComponentType } from "@/features/component-types/api";
import { cn } from "@/lib/utils";

const STATUSES = [
  { value: "", label: "All" },
  { value: "available", label: "Available" },
  { value: "in_use", label: "In Use" },
  { value: "loaned", label: "Loaned" },
  { value: "under_maintenance", label: "Maintenance" },
  { value: "decommissioned", label: "Decommissioned" },
];

interface InventoryFiltersProps {
  filters: {
    status: string;
    type_slug: string;
    q: string;
  };
  onFiltersChange: (filters: { status: string; type_slug: string; q: string }) => void;
  componentTypes: ComponentType[];
}

export function InventoryFilters({
  filters,
  onFiltersChange,
  componentTypes,
}: InventoryFiltersProps) {
  const handleStatusChange = (status: string) => {
    onFiltersChange({ ...filters, status });
  };

  const handleTypeChange = (type_slug: string) => {
    onFiltersChange({ ...filters, type_slug });
  };

  const handleSearchChange = (q: string) => {
    onFiltersChange({ ...filters, q });
  };

  const clearSearch = () => {
    onFiltersChange({ ...filters, q: "" });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((status) => (
            <button
              key={status.value}
              onClick={() => handleStatusChange(status.value)}
              className={cn(
                "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                filters.status === status.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:border-primary/50 hover:bg-muted"
              )}
            >
              {status.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <select
            value={filters.type_slug}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="h-8 rounded-lg border border-input bg-background px-3 text-xs font-medium text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
          >
            <option value="">All Types</option>
            {componentTypes.map((type) => (
              <option key={type.slug} value={type.slug}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by code or notes..."
          value={filters.q}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50"
        />
        {filters.q && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
