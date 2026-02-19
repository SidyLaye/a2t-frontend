import apiClient from "./client";
import type { Entrepreneur, EntrepreneurCreate, InviteMemberRequest } from "@/types/entrepreneur";
import type { UserRole } from "@/types/auth";
import type { PaginatedResponse } from "@/types/api";

const BASE = "/api/v1/entrepreneurs";

export const entrepreneursApi = {
  list: () =>
    apiClient.get<PaginatedResponse<Entrepreneur>>(`${BASE}/`).then((r) => r.data),

  create: (data: EntrepreneurCreate) =>
    apiClient.post<Entrepreneur>(`${BASE}/`, data).then((r) => r.data),

  get: (id: string) =>
    apiClient.get<Entrepreneur>(`${BASE}/${id}/`).then((r) => r.data),

  update: (id: string, data: Partial<EntrepreneurCreate>) =>
    apiClient.patch<Entrepreneur>(`${BASE}/${id}/`, data).then((r) => r.data),

  getMembers: (id: string) =>
    apiClient.get<UserRole[]>(`${BASE}/${id}/members/`).then((r) => r.data),

  inviteMember: (id: string, data: InviteMemberRequest) =>
    apiClient.post<UserRole>(`${BASE}/${id}/members/invite/`, data).then((r) => r.data),
};
