"use client";

import { useQuery } from "@tanstack/react-query";
import { inventoryApi, type InventoryFilters, type InventoryResponse } from "../api";

export function useInventory(filters: InventoryFilters = {}) {
  return useQuery<InventoryResponse>({
    queryKey: ["inventory", filters],
    queryFn: () => inventoryApi.list(filters),
  });
}
