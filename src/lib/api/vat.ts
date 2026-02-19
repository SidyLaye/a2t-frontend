import apiClient from "./client";
import type { VATDeclaration, VATDeclarationCreate, VATLock } from "@/types/vat";
import type { PaginatedResponse, ListParams } from "@/types/api";

const BASE = "/api/v1/vat";

export const vatApi = {
  list: (params?: ListParams & { status?: string; period_type?: string }) =>
    apiClient.get<PaginatedResponse<VATDeclaration>>(`${BASE}/declarations/`, { params }).then((r) => r.data),

  create: (data: VATDeclarationCreate) =>
    apiClient.post<VATDeclaration>(`${BASE}/declarations/`, data).then((r) => r.data),

  get: (id: string) =>
    apiClient.get<VATDeclaration>(`${BASE}/declarations/${id}/`).then((r) => r.data),

  calculate: (id: string) =>
    apiClient.post<VATDeclaration>(`${BASE}/declarations/${id}/calculate/`).then((r) => r.data),

  review: (id: string) =>
    apiClient.post<VATDeclaration>(`${BASE}/declarations/${id}/review/`).then((r) => r.data),

  submit: (id: string) =>
    apiClient.post<VATDeclaration>(`${BASE}/declarations/${id}/submit/`).then((r) => r.data),

  listLocks: () =>
    apiClient.get<PaginatedResponse<VATLock>>(`${BASE}/locks/`).then((r) => r.data),
};
