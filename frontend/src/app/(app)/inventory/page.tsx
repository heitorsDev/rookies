"use client";

import { useState } from "react";
import { Plus, Users, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InventoryFilters } from "@/features/inventory/components/InventoryFilters";
import { InventoryTable } from "@/features/inventory/components/InventoryTable";
import { Pagination } from "@/features/inventory/components/Pagination";
import { useInventory } from "@/features/inventory/hooks/useInventory";
import { useComponentTypes } from "@/features/inventory/hooks/useComponentTypes";
import { useAuth } from "@/features/auth/hooks/AuthContext";
import Link from "next/link";

const PAGE_SIZE = 20;

export default function InventoryPage() {
  const { member } = useAuth();
  const [filters, setFilters] = useState({
    status: "",
    type_slug: "",
    q: "",
    page: 1,
  });

  const { data: inventoryData, isLoading: isLoadingInventory } = useInventory({
    ...filters,
    page_size: PAGE_SIZE,
  });

  const { data: componentTypes } = useComponentTypes();

  const totalPages = inventoryData ? Math.ceil(inventoryData.total / PAGE_SIZE) : 0;

  return (
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
        <div className="flex gap-2">
          <Link href="/register">
            <Button>
              <Plus className="h-4 w-4" />
              Register Component
            </Button>
          </Link>
          {member?.role === "admin" && (
            <>
              <Link href="/types/new">
                <Button variant="outline">
                  <Cpu className="h-4 w-4" />
                  Create Type
                </Button>
              </Link>
              <Link href="/members">
                <Button variant="outline">
                  <Users className="h-4 w-4" />
                  Team Members
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <InventoryFilters
        filters={filters}
        onFiltersChange={(newFilters) => setFilters({ ...newFilters, page: 1 })}
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
  );
}
