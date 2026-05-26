import apiClient from "./client";

export interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  max_invoices_per_month: number | null;
  max_users: number | null;
  features: Record<string, string>;
}

export interface Subscription {
  id: string;
  status: "active" | "past_due" | "cancelled" | "trialing";
  current_period_end: string;
  plan: SubscriptionPlan;
  plan_name?: string;
}

export const paymentsApi = {
  listPlans: () =>
    apiClient.get<SubscriptionPlan[]>("/api/v1/subscriptions/plans/").then((r) => r.data),

  currentSubscription: () =>
    apiClient.get<Subscription>("/api/v1/subscriptions/current/").then((r) => r.data),

  createCheckout: (planId: string) =>
    apiClient.post<{ url: string }>("/api/v1/subscriptions/checkout/", { plan_id: planId }).then((r) => r.data),

  createPortal: () =>
    apiClient.post<{ url: string; portal_url: string }>("/api/v1/subscriptions/portal/", {}).then((r) => {
      return { ...r.data, portal_url: r.data.url };
    }),

  // Alias for compatibility with legacy components
  customerPortal: () =>
    apiClient.post<{ url: string; portal_url: string }>("/api/v1/subscriptions/portal/", {}).then((r) => {
      return { ...r.data, portal_url: r.data.url };
    }),
};
