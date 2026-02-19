import apiClient from "./client";
import type { SubscriptionPlan, Subscription } from "@/types/payment";

export const paymentsApi = {
  listPlans: () =>
    apiClient.get<SubscriptionPlan[]>("/api/v1/subscriptions/plans/").then((r) => r.data),

  checkout: (planId: string) =>
    apiClient.post<{ checkout_url: string }>("/api/v1/subscriptions/checkout/", { plan_id: planId }).then((r) => r.data),

  currentSubscription: () =>
    apiClient.get<Subscription>("/api/v1/subscriptions/current/").then((r) => r.data),

  customerPortal: () =>
    apiClient.post<{ portal_url: string }>("/api/v1/subscriptions/portal/").then((r) => r.data),
};
