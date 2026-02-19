import apiClient from "./client";
import type { BankAccount, BankTransaction, MatchingRule, TransactionMatchRequest } from "@/types/banking";
import type { PaginatedResponse, ListParams } from "@/types/api";

export const bankingApi = {
  // Accounts
  listAccounts: () =>
    apiClient.get<PaginatedResponse<BankAccount>>("/api/v1/bank-accounts/").then((r) => r.data),

  connectAccount: (data: { bank_name: string; account_name: string; provider: string }) =>
    apiClient.post<BankAccount>("/api/v1/bank-accounts/connect/", data).then((r) => r.data),

  disconnectAccount: (id: string) =>
    apiClient.delete(`/api/v1/bank-accounts/${id}/`),

  syncAccount: (id: string) =>
    apiClient.post(`/api/v1/bank-accounts/${id}/sync/`),

  // Transactions
  listTransactions: (params?: ListParams & { match_status?: string; bank_account?: string }) =>
    apiClient.get<PaginatedResponse<BankTransaction>>("/api/v1/bank-transactions/", { params }).then((r) => r.data),

  getTransaction: (id: string) =>
    apiClient.get<BankTransaction>(`/api/v1/bank-transactions/${id}/`).then((r) => r.data),

  unmatchedTransactions: () =>
    apiClient.get<PaginatedResponse<BankTransaction>>("/api/v1/bank-transactions/unmatched/").then((r) => r.data),

  matchTransaction: (id: string, data: TransactionMatchRequest) =>
    apiClient.patch<BankTransaction>(`/api/v1/bank-transactions/${id}/match/`, data).then((r) => r.data),

  ignoreTransaction: (id: string) =>
    apiClient.post(`/api/v1/bank-transactions/${id}/ignore/`),

  // Rules
  listRules: () =>
    apiClient.get<PaginatedResponse<MatchingRule>>("/api/v1/matching-rules/").then((r) => r.data),

  createRule: (data: Partial<MatchingRule>) =>
    apiClient.post<MatchingRule>("/api/v1/matching-rules/", data).then((r) => r.data),

  updateRule: (id: string, data: Partial<MatchingRule>) =>
    apiClient.patch<MatchingRule>(`/api/v1/matching-rules/${id}/`, data).then((r) => r.data),

  deleteRule: (id: string) =>
    apiClient.delete(`/api/v1/matching-rules/${id}/`),
};
