export interface DashboardSummary {
  revenue_ytd: string;
  revenue_mtd: string;
  total_expenses_ytd: string;
  total_expenses_mtd: string;
  outstanding_invoices: number;
  outstanding_amount: string;
  overdue_invoices: number;
  overdue_amount: string;
  bank_balance: string;
  pending_quotes: number;
  pending_quotes_amount: string;
}

export interface ChartDataPoint {
  month: string;
  amount: number;
}

export interface AdminPlatformOverview {
  total_entrepreneurs: number;
  active_entrepreneurs: number;
  total_users: number;
  active_subscriptions: number;
  mrr: string;
  total_invoice_volume: string;
  total_payment_volume: string;
  recent_activity?: { id: string; description: string; timestamp: string }[];
}

export interface AdminEntrepreneur {
  id: string;
  company_name: string;
  siren: string;
  siret: string;
  city: string;
  country: string;
  owner_email: string;
  members_count: number;
  is_active: boolean;
  stripe_customer_id: string;
  user_count: number;
  invoice_count: number;
  subscription_status: string;
  subscription_plan: string;
  created_at: string;
  updated_at: string;
}
