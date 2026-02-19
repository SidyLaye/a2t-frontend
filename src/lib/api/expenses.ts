import apiClient from "./client";
import type { Expense, ExpenseCreate, ExpenseCategory } from "@/types/expense";
import type { PaginatedResponse, ListParams } from "@/types/api";

const BASE = "/api/v1/expenses";

export const expensesApi = {
  list: (params?: ListParams & { status?: string; category?: string; date?: string }) =>
    apiClient.get<PaginatedResponse<Expense>>(`${BASE}/`, { params }).then((r) => r.data),

  create: (data: ExpenseCreate) =>
    apiClient.post<Expense>(`${BASE}/`, data).then((r) => r.data),

  get: (id: string) =>
    apiClient.get<Expense>(`${BASE}/${id}/`).then((r) => r.data),

  update: (id: string, data: Partial<ExpenseCreate>) =>
    apiClient.patch<Expense>(`${BASE}/${id}/`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`${BASE}/${id}/`),

  validate: (id: string) =>
    apiClient.post<Expense>(`${BASE}/${id}/validate/`).then((r) => r.data),

  uploadReceipt: (file: File) => {
    const form = new FormData();
    form.append("receipt_file", file);
    return apiClient.post<Expense>(`${BASE}/upload-receipt/`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data);
  },

  listCategories: () =>
    apiClient.get<PaginatedResponse<ExpenseCategory>>(`${BASE}/categories/`).then((r) => r.data),

  createCategory: (data: { name: string; accounting_code?: string; parent?: string }) =>
    apiClient.post<ExpenseCategory>(`${BASE}/categories/`, data).then((r) => r.data),
};
