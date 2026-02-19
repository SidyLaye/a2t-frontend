import apiClient from "./client";
import type { Client, ClientCreate } from "@/types/client";
import type { PaginatedResponse, ListParams } from "@/types/api";

const BASE = "/api/v1/clients";

export const clientsApi = {
  list: (params?: ListParams & { city?: string; country?: string }) =>
    apiClient.get<PaginatedResponse<Client>>(`${BASE}/`, { params }).then((r) => r.data),

  create: (data: ClientCreate) =>
    apiClient.post<Client>(`${BASE}/`, data).then((r) => r.data),

  get: (id: string) =>
    apiClient.get<Client>(`${BASE}/${id}/`).then((r) => r.data),

  update: (id: string, data: Partial<ClientCreate>) =>
    apiClient.patch<Client>(`${BASE}/${id}/`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`${BASE}/${id}/`),
};
