import apiClient from "./client";
import type { Invoice, InvoiceCreate, CreditNote } from "@/types/invoice";
import type { InvoicePayment, ManualPaymentRequest } from "@/types/payment";
import type { PaginatedResponse, ListParams } from "@/types/api";

const BASE = "/api/v1/invoices";

export const invoicesApi = {
  list: (params?: ListParams & { status?: string; client?: string }) =>
    apiClient.get<PaginatedResponse<Invoice>>(`${BASE}/`, { params }).then((r) => r.data),

  create: (data: InvoiceCreate) =>
    apiClient.post<Invoice>(`${BASE}/`, data).then((r) => r.data),

  get: (id: string) =>
    apiClient.get<Invoice>(`${BASE}/${id}/`).then((r) => r.data),

  update: (id: string, data: Partial<InvoiceCreate>) =>
    apiClient.patch<Invoice>(`${BASE}/${id}/`, data).then((r) => r.data),

  validate: (id: string) =>
    apiClient.post<Invoice>(`${BASE}/${id}/validate/`).then((r) => r.data),

  send: (id: string) =>
    apiClient.post<Invoice>(`${BASE}/${id}/send/`).then((r) => r.data),

  getPDF: (id: string) =>
    apiClient.get(`${BASE}/${id}/pdf/`, { responseType: "blob" }).then((r) => r.data as Blob),

  createPaymentLink: (id: string) =>
    apiClient.post<{ stripe_payment_link: string }>(`${BASE}/${id}/create-payment-link/`).then((r) => r.data),

  createCreditNote: (id: string, reason: string) =>
    apiClient.post<CreditNote>(`${BASE}/${id}/credit-note/`, { reason }).then((r) => r.data),

  getPayments: (id: string) =>
    apiClient.get<InvoicePayment[]>(`${BASE}/${id}/payments/`).then((r) => r.data),

  recordPayment: (id: string, data: ManualPaymentRequest) =>
    apiClient.post<InvoicePayment>(`/api/v1/payments/invoices/${id}/record/`, data).then((r) => r.data),
};
