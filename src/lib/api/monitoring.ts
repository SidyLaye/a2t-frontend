import apiClient from "./client";

export interface PortfolioEntreprise {
    id: string;
    name: string;
    pending_docs: number;
    unmatched_transactions: number;
    last_sync: string | null;
    health_score: "good" | "warning" | "critical";
}

export const monitoringApi = {
    portfolio: () =>
        apiClient.get<PortfolioEntreprise[]>("/api/v1/monitoring/portfolio/").then((r) => r.data),
};
