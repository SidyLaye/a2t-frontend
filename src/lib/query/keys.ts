export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  entrepreneurs: {
    all: () => ["entrepreneurs"] as const,
    detail: (id: string) => ["entrepreneurs", id] as const,
    members: (id: string) => ["entrepreneurs", id, "members"] as const,
  },
  dashboard: (tenantId: string) => ["dashboard", tenantId] as const,
  dashboardRevenue: (tenantId: string) => ["dashboard", tenantId, "revenue"] as const,
  dashboardExpenses: (tenantId: string) => ["dashboard", tenantId, "expenses"] as const,
  dashboardCashflow: (tenantId: string) => ["dashboard", tenantId, "cashflow"] as const,
  dashboardOverdue: (tenantId: string) => ["dashboard", tenantId, "overdue"] as const,
  clients: {
    all: (t: string) => ["clients", t] as const,
    list: (t: string, p: object) => ["clients", t, "list", p] as const,
    detail: (t: string, id: string) => ["clients", t, id] as const,
  },
  quotes: {
    all: (t: string) => ["quotes", t] as const,
    list: (t: string, p: object) => ["quotes", t, "list", p] as const,
    detail: (t: string, id: string) => ["quotes", t, id] as const,
    history: (t: string, id: string) => ["quotes", t, id, "history"] as const,
  },
  invoices: {
    all: (t: string) => ["invoices", t] as const,
    list: (t: string, p: object) => ["invoices", t, "list", p] as const,
    detail: (t: string, id: string) => ["invoices", t, id] as const,
    payments: (t: string, id: string) => ["invoices", t, id, "payments"] as const,
  },
  expenses: {
    all: (t: string) => ["expenses", t] as const,
    list: (t: string, p: object) => ["expenses", t, "list", p] as const,
    detail: (t: string, id: string) => ["expenses", t, id] as const,
    categories: (t: string) => ["expenses", t, "categories"] as const,
  },
  banking: {
    accounts: (t: string) => ["banking", t, "accounts"] as const,
    transactions: (t: string, p?: object) => ["banking", t, "transactions", p] as const,
    unmatched: (t: string) => ["banking", t, "unmatched"] as const,
    rules: (t: string) => ["banking", t, "rules"] as const,
  },
  vat: {
    all: (t: string) => ["vat", t] as const,
    list: (t: string, p?: object) => ["vat", t, "list", p] as const,
    detail: (t: string, id: string) => ["vat", t, id] as const,
    locks: (t: string) => ["vat", t, "locks"] as const,
  },
  payments: {
    plans: () => ["payments", "plans"] as const,
    subscription: (t: string) => ["payments", t, "subscription"] as const,
  },
  notifications: {
    all: (t: string) => ["notifications", t] as const,
    list: (t: string) => ["notifications", t, "list"] as const,
  },
  admin: {
    overview: () => ["admin", "overview"] as const,
    entrepreneurs: () => ["admin", "entrepreneurs"] as const,
    users: () => ["admin", "users"] as const,
    growth: () => ["admin", "growth"] as const,
    subscriptions: () => ["admin", "subscriptions"] as const,
  },
};
