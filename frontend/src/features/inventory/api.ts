import { api } from "@/lib/api";

export interface InventoryItem {
  code: string;
  component_type: string;
  status: string;
  notes?: string;
  created_at: string;
}

export interface InventoryResponse {
  items: InventoryItem[];
  total: number;
  page: number;
  page_size: number;
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

export const inventoryApi = {
  list: (filters: InventoryFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.set(key, String(value));
      }
    });
    const qs = params.toString();
    return api.get<InventoryResponse>(`/inventory${qs ? `?${qs}` : ""}`);
  },
};
