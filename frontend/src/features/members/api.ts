import { api } from "@/lib/api";
import type { CreateMemberRequest, CreateMemberResponse, MemberResponse } from "@/features/auth/api";

export const membersApi = {
  list: () => api.get<MemberResponse[]>("/auth/members"),
  create: (data: CreateMemberRequest) =>
    api.post<CreateMemberResponse>("/auth/members", data),
};
