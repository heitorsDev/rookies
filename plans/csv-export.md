# CSV Export for Filtered Inventory

## Problem Statement

Users need to export the current inventory view (including applied filters) to CSV for:
- Offline analysis in Excel/Google Sheets
- Sharing with team members who don't have access to Rookies
- Integration with other tools
- Bulk data processing

The export should respect the current filter state and include:
- Component code, type, status, notes
- All diagnostic data fields
- Timestamps
- Optionally: history log

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    InventoryPage                            │
│  ┌─────────────────┐    ┌───────────────────────────────┐   │
│  │ InventoryFilters│    │ FilterBuilder                  │   │
│  └────────┬────────┘    └──────────────┬──────────────┘   │
│           │                             │                    │
│           └──────────┬──────────────────┘                    │
│                      ▼                                      │
│           ┌───────────────────────┐                         │
│           │ useFilteredInventory   │                         │
│           └───────────┬───────────┘                         │
│                       │                                      │
│                       ▼                                      │
│           ┌───────────────────────┐                         │
│           │ ExportButton          │───► generateCSV()       │
│           │ (dropdown: all/filtered)│                      │
│           └───────────┬───────────┘                         │
│                       ▼                                      │
│              ┌─────────────────┐                            │
│              │ CSV Download    │                            │
│              └─────────────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

## Phase 1: Extend Inventory API Types

**File:** `frontend/src/features/inventory/api.ts`

Add export-specific types and methods:

```typescript
export interface InventoryItem {
  code: string;
  component_type: string;
  component_type_slug: string;
  status: string;
  notes?: string;
  diagnostic_data: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

// NEW: For export, we need full component data
export interface ExportableInventoryItem extends InventoryItem {
  loan_info?: {
    borrower_name: string;
    expected_return: string;
    notes: string;
  };
  attachments_count?: number;
}

export interface InventoryFilters {
  type_slug?: string;
  status?: string;
  q?: string;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_dir?: string;
}

// NEW: Add export method
export const inventoryApi = {
  list: (filters: InventoryFilters = {}) => { /* ... */ },

  // NEW: Fetch all items (no pagination) for export
  listAll: (filters: InventoryFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.set(key, String(value));
      }
    });
    return api.get<ExportableInventoryItem[]>(`/inventory/all?${params.toString()}`);
  },
};
```

## Phase 2: Create CSV Generation Utility

**New File:** `frontend/src/lib/csv-utils.ts`

```typescript
import type { ExportableInventoryItem } from "@/features/inventory/api";

interface CSVColumn {
  key: string;
  label: string;
  transform?: (value: unknown) => string;
}

export function generateCSV(
  items: ExportableInventoryItem[],
  columns: CSVColumn[]
): string {
  // 1. Build header row
  const headers = columns.map(col => col.label).join(",");
  const rows: string[] = [headers];

  // 2. Build data rows
  for (const item of items) {
    const values = columns.map(col => {
      let value: unknown;

      // Handle nested fields (e.g., loan_info.borrower_name)
      if (col.key.includes(".")) {
        const parts = col.key.split(".");
        value = parts.reduce((obj: unknown, part) => {
          return obj && typeof obj === "object"
            ? (obj as Record<string, unknown>)[part]
            : undefined;
        }, item);
      } else {
        value = (item as Record<string, unknown>)[col.key];
      }

      // Apply transform if exists
      if (col.transform) {
        return col.transform(value);
      }

      // Default transform: stringify, handle commas/newlines
      return sanitizeCSVValue(value);
    });

    rows.push(values.join(","));
  }

  return rows.join("\n");
}

function sanitizeCSVValue(value: unknown): string {
  if (value === null || value === undefined) return "";

  const str = String(value);

  // Escape quotes and wrap in quotes if contains comma, newline, or quote
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
```

## Phase 3: Create Export Button Component

**New File:** `frontend/src/features/inventory/components/ExportButton.tsx`

```tsx
"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { generateCSV, downloadCSV } from "@/lib/csv-utils";
import type { ExportableInventoryItem } from "../api";

interface ExportButtonProps {
  items: ExportableInventoryItem[];
  label?: string;
}

const DEFAULT_COLUMNS = [
  { key: "code", label: "Code" },
  { key: "component_type", label: "Component Type" },
  { key: "status", label: "Status" },
  { key: "notes", label: "Notes" },
  { key: "created_at", label: "Created At" },
];

export function ExportButton({ items, label = "Export" }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: "csv" | "csv-with-fields") => {
    setIsExporting(true);

    try {
      const columns =
        format === "csv-with-fields"
          ? [
              ...DEFAULT_COLUMNS,
              { key: "diagnostic_data", label: "Diagnostic Data", transform: (v) =>
                v ? JSON.stringify(v) : ""
              },
            ]
          : DEFAULT_COLUMNS;

      const csv = generateCSV(items, columns);
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `inventory-export-${timestamp}.csv`;

      downloadCSV(csv, filename);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          <Download className="mr-2 h-4 w-4" />
          {label}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Basic CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("csv-with-fields")}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          CSV with Diagnostic Data
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## Phase 4: Create Dynamic Export with Field Selection

**New File:** `frontend/src/features/inventory/components/ExportDialog.tsx`

Allows users to select which fields to include in the export:

```tsx
"use client";

import { useState, useMemo } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { generateCSV, downloadCSV } from "@/lib/csv-utils";
import type { ExportableInventoryItem, ComponentType } from "../api";

interface ExportDialogProps {
  items: ExportableInventoryItem[];
  componentTypes: ComponentType[];
}

interface FieldSelection {
  key: string;
  label: string;
  selected: boolean;
}

export function ExportDialog({ items, componentTypes }: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Build field list based on component types
  const availableFields = useMemo<FieldSelection[]>(() => {
    const fields: FieldSelection[] = [
      { key: "code", label: "Code", selected: true },
      { key: "component_type", label: "Component Type", selected: true },
      { key: "status", label: "Status", selected: true },
      { key: "notes", label: "Notes", selected: true },
      { key: "created_at", label: "Created At", selected: true },
      { key: "updated_at", label: "Updated At", selected: false },
    ];

    // Add diagnostic fields from component types
    for (const type of componentTypes) {
      for (const field of type.fields || []) {
        const key = `diagnostic_data.${field.field_id}`;
        if (!fields.find(f => f.key === key)) {
          fields.push({
            key,
            label: `${type.name}: ${field.label}`,
            selected: false,
          });
        }
      }
    }

    return fields;
  }, [componentTypes]);

  const [selectedFields, setSelectedFields] = useState<FieldSelection[]>(
    availableFields
  );

  const handleExport = () => {
    setIsExporting(true);

    try {
      const columns = selectedFields
        .filter(f => f.selected)
        .map(f => ({ key: f.key, label: f.label }));

      const csv = generateCSV(items, columns);
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `inventory-export-${timestamp}.csv`;

      downloadCSV(csv, filename);
      setOpen(false);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleField = (key: string) => {
    setSelectedFields(prev =>
      prev.map(f => (f.key === key ? { ...f, selected: !f.selected } : f))
    );
  };

  const toggleAll = (selected: boolean) => {
    setSelectedFields(prev => prev.map(f => ({ ...f, selected })));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Inventory</DialogTitle>
          <DialogDescription>
            Select which fields to include in the export
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Label>Select Fields</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleAll(true)}
            >
              Select All
            </Button>
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {selectedFields.map(field => (
              <div key={field.key} className="flex items-center gap-2">
                <Checkbox
                  id={field.key}
                  checked={field.selected}
                  onCheckedChange={() => toggleField(field.key)}
                />
                <Label htmlFor={field.key} className="font-normal">
                  {field.label}
                </Label>
              </div>
            ))}
          </div>

          <div className="text-sm text-muted-foreground">
            {selectedFields.filter(f => f.selected).length} fields selected
            {" • "}
            {items.length} rows
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## Phase 5: Integrate Export into Inventory Page

**File:** `frontend/src/app/(app)/inventory/page.tsx`

```tsx
"use client";

import { useState } from "react";
import { InventoryFilters } from "@/features/inventory/components/InventoryFilters";
import { InventoryTable } from "@/features/inventory/components/InventoryTable";
import { Pagination } from "@/features/inventory/components/Pagination";
import { ExportButton } from "@/features/inventory/components/ExportButton";
import { ExportDialog } from "@/features/inventory/components/ExportDialog";
import { useInventory } from "@/features/inventory/hooks/useInventory";
import { useComponentTypes } from "@/features/inventory/hooks/useComponentTypes";
import { Sidebar } from "@/components/Sidebar";

const PAGE_SIZE = 20;

export default function InventoryPage() {
  const [filters, setFilters] = useState({
    status: "",
    type_slug: "",
    q: "",
    page: 1,
  });

  // Fetch more items for export (when export is triggered)
  const [exportMode, setExportMode] = useState(false);

  const { data: inventoryData, isLoading: isLoadingInventory } = useInventory({
    ...filters,
    page_size: exportMode ? 1000 : PAGE_SIZE, // Fetch more for export
  });

  const { data: componentTypes } = useComponentTypes();

  // For export: fetch ALL items (no pagination limit)
  const { data: allItems } = useInventory({
    status: filters.status,
    type_slug: filters.type_slug,
    q: filters.q,
    page_size: 1000, // Handle up to 1000 items
  });

  const totalPages = inventoryData
    ? Math.ceil(inventoryData.total / PAGE_SIZE)
    : 0;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Component Inventory
              </h1>
              <p className="text-sm text-muted-foreground">
                Track and manage your team&apos;s electrical components
              </p>
            </div>

            {/* Export controls */}
            <div className="flex gap-2">
              <ExportButton items={allItems?.items ?? []} />
              <ExportDialog
                items={allItems?.items ?? []}
                componentTypes={componentTypes ?? []}
              />
            </div>
          </div>

          <InventoryFilters
            filters={filters}
            onFiltersChange={(newFilters) =>
              setFilters({ ...newFilters, page: 1 })
            }
            componentTypes={componentTypes ?? []}
          />

          <InventoryTable
            items={inventoryData?.items ?? []}
            isLoading={isLoadingInventory}
          />

          {inventoryData && totalPages > 1 && (
            <Pagination
              page={filters.page}
              pageSize={PAGE_SIZE}
              total={inventoryData.total}
              totalPages={totalPages}
              onPageChange={(page) => setFilters({ ...filters, page })}
            />
          )}
        </div>
      </main>
    </div>
  );
}
```

## Phase 6: Backend Enhancement (Optional)

Add a dedicated export endpoint for better performance with large datasets:

**File:** `backend/app/features/inventory/routes.py`

```python
@router.get("/inventory/export")
async def export_inventory(
    type_slug: str = None,
    status: str = None,
    q: str = None,
    current_member: Member = Depends(get_current_member),
):
    """
    Export all inventory items matching filters as CSV.
    Returns raw CSV text (not JSON) with proper content-type for download.
    """
    filters = build_filters(type_slug, status, q)
    items = await service.list_components(filters, limit=None)

    # Generate CSV
    import csv
    import io

    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow([
        "code", "component_type", "status", "notes",
        "device_id", "firmware_version", "peak_current",
        "created_at", "updated_at"
    ])

    # Rows
    for item in items:
        writer.writerow([
            item.code,
            item.component_type.name,
            item.status,
            item.notes,
            item.diagnostic_data.get("device_id", ""),
            item.diagnostic_data.get("firmware_version", ""),
            item.diagnostic_data.get("peak_current", ""),
            item.created_at.isoformat() if item.created_at else "",
            item.updated_at.isoformat() if item.updated_at else "",
        ])

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=inventory-export.csv"}
    )
```

## Key File Changes Summary

| File | Action |
|------|--------|
| `frontend/src/features/inventory/api.ts` | Add `listAll` method, export types |
| `frontend/src/lib/csv-utils.ts` | **NEW** - CSV generation and download |
| `frontend/src/features/inventory/components/ExportButton.tsx` | **NEW** - Quick export dropdown |
| `frontend/src/features/inventory/components/ExportDialog.tsx` | **NEW** - Field selection dialog |
| `frontend/src/app/(app)/inventory/page.tsx` | Integrate export components |
| `backend/app/features/inventory/routes.py` | **OPTIONAL** - Add export endpoint |

## Implementation Priority

1. **P0**: ExportButton with basic CSV (code, type, status, notes)
2. **P1**: ExportDialog with field selection
3. **P2**: Include diagnostic_data in export
4. **P3**: Backend export endpoint for large datasets

## Technical Considerations

- **Pagination Limits**: Client-side export limited to ~1000 rows. For larger datasets, use backend endpoint.
- **Encoding**: Always use UTF-8 with BOM for Excel compatibility: `"\ufeff" + content`
- **Date Format**: Use ISO 8601 (`2025-03-10T14:32:00Z`) for universal compatibility
- **Large Exports**: Show progress indicator for exports > 100 items

## Excel Compatibility Tip

Add BOM (Byte Order Mark) for proper UTF-8 encoding in Excel:

```typescript
export function downloadCSV(content: string, filename: string): void {
  const bom = "\ufeff";
  const blob = new Blob([bom + content], { type: "text/csv;charset=utf-8;" });
  // ... rest of function
}
```