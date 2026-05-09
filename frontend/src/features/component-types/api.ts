import { api } from "@/lib/api";

export interface FieldDefinition {
  field_id: string;
  label: string;
  field_type: string;
  required?: boolean;
  default?: unknown;
  options?: string[];
  min_value?: number;
  max_value?: number;
  unit?: string;
  placeholder?: string;
  help_text?: string;
  auto?: boolean;
  auto_hint?: string;
}

export interface ComponentType {
  name: string;
  slug: string;
  description?: string;
  fields: FieldDefinition[];
  is_archived?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateComponentTypeRequest {
  name: string;
  slug: string;
  description?: string;
  fields: FieldDefinition[];
}

export const componentTypesApi = {
  list: () => api.get<ComponentType[]>("/component-types"),
  get: (slug: string) => api.get<ComponentType>(`/component-types/${slug}`),
  create: (data: CreateComponentTypeRequest) =>
    api.post<ComponentType>("/component-types", data),
  update: (slug: string, data: Partial<CreateComponentTypeRequest>) =>
    api.put<ComponentType>(`/component-types/${slug}`, data),
  archive: (slug: string) =>
    api.delete<{ detail: string }>(`/component-types/${slug}`),
};
