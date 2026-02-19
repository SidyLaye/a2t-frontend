import apiClient from "./client";
import type { DashboardSummary, ChartDataPoint } from "@/types/dashboard";
import type { Invoice } from "@/types/invoice";
import type { VATDeclaration } from "@/types/vat";

const BASE = "/api/v1/dashboard";

export const dashboardApi = {
  summary: () =>
    apiClient.get<DashboardSummary>(`${BASE}/summary/`).then((r) => r.data),

  revenue: (months?: number) =>
    apiClient.get<ChartDataPoint[]>(`${BASE}/revenue/`, { params: { months } }).then((r) => r.data),

  expenses: (months?: number) =>
    apiClient.get<ChartDataPoint[]>(`${BASE}/expenses/`, { params: { months } }).then((r) => r.data),

  cashflow: () =>
    apiClient.get<{ revenue: ChartDataPoint[]; expenses: ChartDataPoint[] }>(`${BASE}/cashflow/`).then((r) => r.data),

  vatSummary: () =>
    apiClient.get<VATDeclaration[]>(`${BASE}/vat-summary/`).then((r) => r.data),

  overdueInvoices: () =>
    apiClient.get<Invoice[]>(`${BASE}/overdue-invoices/`).then((r) => r.data),

  predictive: (days?: number) =>
    apiClient.get<any[]>(`${BASE}/predictive/`, { params: { days } }).then((r) => r.data),
};
