import apiClient from "./client";
import type { AdminPlatformOverview, AdminEntrepreneur, ChartDataPoint } from "@/types/dashboard";
import type { User } from "@/types/auth";
import type { Subscription } from "@/types/payment";
import type { PaginatedResponse, ListParams } from "@/types/api";

const BASE = "/api/v1/admin-dashboard";

export const adminApi = {
  overview: () =>
    apiClient.get<AdminPlatformOverview>(`${BASE}/overview/`).then((r) => r.data),

  entrepreneurs: (params?: ListParams & { status?: string }) =>
    apiClient.get<PaginatedResponse<AdminEntrepreneur>>(`${BASE}/entrepreneurs/`, { params }).then((r) => r.data),

  entrepreneurDetail: (id: string) =>
    apiClient.get<AdminEntrepreneur>(`${BASE}/entrepreneurs/${id}/`).then((r) => r.data),

  toggleEntrepreneur: (id: string, isActive?: boolean) =>
    apiClient.patch(`${BASE}/entrepreneurs/${id}/`, { is_active: isActive }),

  users: (params?: ListParams) =>
    apiClient.get<PaginatedResponse<User>>(`${BASE}/users/`, { params }).then((r) => r.data),

  createUser: (payload: { email: string; role?: string; entrepreneur?: string }) =>
    apiClient.post<User & { temp_password: string }>(`${BASE}/users/`, payload).then((r) => r.data),

  growth: () =>
    apiClient.get<ChartDataPoint[]>(`${BASE}/growth/`).then((r) => r.data),

  revenueByPlan: () =>
    apiClient.get(`${BASE}/revenue-by-plan/`).then((r) => r.data),

  recentActivity: (limit?: number) =>
    apiClient.get(`${BASE}/activity/`, { params: { limit } }).then((r) => r.data),

  subscriptions: (params?: ListParams & { status?: string }) =>
    apiClient.get<PaginatedResponse<Subscription>>(`${BASE}/subscriptions/`, { params }).then((r) => r.data),
};
