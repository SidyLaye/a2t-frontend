export interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: string;
  price_yearly: string | null;
  max_invoices_per_month: number | null;
  max_users: number | null;
  features: Record<string, unknown>;
  is_active: boolean;
}

export type SubscriptionStatus = "active" | "past_due" | "cancelled" | "trialing";

export interface Subscription {
  id: string;
  plan: string;
  plan_name: string;
  stripe_subscription_id: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
}

export type PaymentMethod = "card" | "bank_transfer" | "sepa_debit" | "cash" | "check";

export interface InvoicePayment {
  id: string;
  invoice: string;
  amount: string;
  currency: string;
  payment_method: string;
  method: PaymentMethod;
  reference: string;
  status: string;
  payment_date: string;
  stripe_payment_intent_id: string;
  bank_reference: string;
  notes: string;
  created_at: string;
}

export interface ManualPaymentRequest {
  amount: string;
  payment_method: string;
  reference?: string;
  payment_date?: string;
  bank_reference?: string;
  notes?: string;
}
