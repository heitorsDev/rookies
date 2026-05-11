import { api } from "@/lib/api";
import type {
  CreateMemberRequest,
  CreateMemberResponse,
  MemberResponse,
  TokenResponse,
} from "@/features/auth/api";

export const membersApi = {
  list: () => api.get<MemberResponse[]>("/auth/members"),
  create: (data: CreateMemberRequest) =>
    api.post<CreateMemberResponse>("/auth/members", data),
  regenerateToken: (username: string) =>
    api.post<TokenResponse>(`/auth/tokens?username=${encodeURIComponent(username)}`),
  deactivate: (username: string) =>
    api.post<{ detail: string }>(`/auth/members/${encodeURIComponent(username)}/deactivate`),
  activate: (username: string) =>
    api.post<{ detail: string }>(`/auth/members/${encodeURIComponent(username)}/activate`),
  updateRole: (username: string, role: string) =>
    api.patch<MemberResponse>(
      `/auth/members/${encodeURIComponent(username)}/role?role=${encodeURIComponent(role)}`
    ),
};
