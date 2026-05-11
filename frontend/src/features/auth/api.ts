import { api } from "@/lib/api";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface MemberResponse {
  name: string;
  username: string;
  role: "member" | "admin";
  is_active: boolean;
  is_activated: boolean;
  created_at: string;
  created_by: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  member: MemberResponse;
}

export interface ActivateRequest {
  username: string;
  token: string;
  password: string;
}

export interface CreateMemberRequest {
  name: string;
  username: string;
}

export interface CreateMemberResponse {
  username: string;
  token: string;
}

export interface TokenResponse {
  token: string;
  username: string;
}

export const authApi = {
  login: (data: LoginRequest) => api.post<MemberResponse>("/auth/login", data),
  activate: (data: ActivateRequest) =>
    api.post<{ detail: string }>("/auth/activate", data),
  logout: () => api.post<{ detail: string }>("/auth/logout"),
  createMember: (data: CreateMemberRequest) =>
    api.post<CreateMemberResponse>("/auth/members", data),
  listMembers: () => api.get<MemberResponse[]>("/auth/members"),
  getCurrentMember: () => api.get<MemberResponse>("/auth/members/me"),
};
