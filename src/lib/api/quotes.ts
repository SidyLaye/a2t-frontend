import apiClient from "./client";
import type { Quote, QuoteCreate, QuoteHistory } from "@/types/quote";
import type { PaginatedResponse, ListParams } from "@/types/api";

const BASE = "/api/v1/quotes";

export const quotesApi = {
  list: (params?: ListParams & { status?: string; client?: string }) =>
    apiClient.get<PaginatedResponse<Quote>>(`${BASE}/`, { params }).then((r) => r.data),

  create: (data: QuoteCreate) =>
    apiClient.post<Quote>(`${BASE}/`, data).then((r) => r.data),

  get: (id: string) =>
    apiClient.get<Quote>(`${BASE}/${id}/`).then((r) => r.data),

  update: (id: string, data: Partial<QuoteCreate>) =>
    apiClient.patch<Quote>(`${BASE}/${id}/`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`${BASE}/${id}/`),

  send: (id: string) =>
    apiClient.post<Quote>(`${BASE}/${id}/send/`).then((r) => r.data),

  accept: (id: string) =>
    apiClient.post<Quote>(`${BASE}/${id}/accept/`).then((r) => r.data),

  refuse: (id: string) =>
    apiClient.post<Quote>(`${BASE}/${id}/refuse/`).then((r) => r.data),

  convertToInvoice: (id: string) =>
    apiClient.post(`${BASE}/${id}/convert-to-invoice/`).then((r) => r.data),

  duplicate: (id: string) =>
    apiClient.post<Quote>(`${BASE}/${id}/duplicate/`).then((r) => r.data),

  history: (id: string) =>
    apiClient.get<QuoteHistory[]>(`${BASE}/${id}/history/`).then((r) => r.data),
};
