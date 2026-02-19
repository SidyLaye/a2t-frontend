import apiClient from "./client";
import type { AuthTokens, LoginRequest, RegisterRequest, RegisterResponse, MeResponse } from "@/types/auth";

const BASE = "/api/v1/auth";

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<AuthTokens>(`${BASE}/login/`, data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    apiClient.post<RegisterResponse>(`${BASE}/register/`, data).then((r) => r.data),

  refreshToken: (refresh: string) =>
    apiClient.post<{ access: string }>(`${BASE}/token/refresh/`, { refresh }).then((r) => r.data),

  logout: (refresh: string) =>
    apiClient.post(`${BASE}/logout/`, { refresh }),

  me: () =>
    apiClient.get<MeResponse>(`${BASE}/me/`).then((r) => r.data),

  updateProfile: (data: Partial<{ first_name: string; last_name: string; phone: string }>) =>
    apiClient.patch(`${BASE}/me/`, data).then((r) => r.data),

  changePassword: (data: { old_password: string; new_password: string }) =>
    apiClient.post(`${BASE}/password/change/`, data),
};
