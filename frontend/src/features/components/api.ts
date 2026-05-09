import { api } from "@/lib/api";

export interface LoanInfo {
  borrower_name?: string;
  expected_return?: string;
  notes?: string;
}

export interface Attachment {
  filename: string;
  mime_type?: string;
  data: string;
  uploaded_at?: string;
}

export interface HistoryEntry {
  timestamp: string;
  changed_by: string;
  field: string;
  old_value?: unknown;
  new_value?: unknown;
}

export interface Component {
  code: string;
  component_type: string;
  status: string;
  diagnostic_data: Record<string, unknown>;
  notes?: string;
  loan_info?: LoanInfo;
  attachments?: Attachment[];
  history?: HistoryEntry[];
  created_at: string;
  updated_at: string;
}

export interface CreateComponentRequest {
  component_type_slug: string;
  diagnostic_data: Record<string, unknown>;
  notes?: string;
  status?: string;
}

export interface UpdateComponentRequest {
  status?: string;
  loan_info?: LoanInfo;
  notes?: string;
  diagnostic_data?: Record<string, unknown>;
}

export const componentsApi = {
  create: (data: CreateComponentRequest) =>
    api.post<Component>("/components", data),
  get: (code: string) => api.get<Component>(`/components/${code}`),
  update: (code: string, data: UpdateComponentRequest) =>
    api.patch<Component>(`/components/${code}`, data),
  history: (code: string) =>
    api.get<HistoryEntry[]>(`/components/${code}/history`),
};
