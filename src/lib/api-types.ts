// Types mirrored from the Django backend (apps/*/serializers.py and models.py).
// Keep these in sync manually until we wire OpenAPI codegen.

export type UUID = string;
export type ISODate = string;        // YYYY-MM-DD
export type ISODatetime = string;    // ISO 8601 with time
export type DecimalString = string;  // DRF serializes Decimal as string

// ─── Auth / Users / Tenants ────────────────────────────────────────────────

export interface User {
  id: UUID;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  date_joined: ISODatetime;
}

export type EntrepreneurRole =
  | "owner"
  | "admin"
  | "accountant"
  | "collaborator"
  | "read_only";

export interface UserRoleEntry {
  id: UUID;
  user: UUID;
  user_email: string;
  user_name: string;
  entrepreneur: UUID;
  role: EntrepreneurRole;
  is_active: boolean;
  created_at: ISODatetime;
}

export interface MeResponse {
  user: User;
  roles: UserRoleEntry[];
}

export interface JWTPair {
  access: string;
  refresh: string;
}

export interface LoginResponse extends JWTPair {}

export interface Entrepreneur {
  id: UUID;
  company_name: string;
  siren: string | null;
  siret: string | null;
  legal_form: string;
  vat_number: string;
  address_line1: string;
  address_line2: string;
  postal_code: string;
  city: string;
  country: string;
  default_vat_rate: DecimalString;
  fiscal_year_start_month: number;
  invoice_prefix: string;
  quote_prefix: string;
  next_invoice_number: number;
  next_quote_number: number;
  is_active: boolean;
  created_at: ISODatetime;
  updated_at: ISODatetime;
}

// ─── Clients ───────────────────────────────────────────────────────────────

export interface Client {
  id: UUID;
  company_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  siren: string;
  vat_number: string;
  address_line1: string;
  address_line2: string;
  postal_code: string;
  city: string;
  country: string;
  created_at: ISODatetime;
  updated_at: ISODatetime;
}

export type ClientCreatePayload = Omit<Client, "id" | "created_at" | "updated_at">;

// ─── Invoices ──────────────────────────────────────────────────────────────

export type InvoiceStatus =
  | "draft"
  | "validated"
  | "sent"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "cancelled";

export interface InvoiceLine {
  id: UUID;
  position: number;
  description: string;
  quantity: DecimalString;
  unit: string;
  unit_price_ht: DecimalString;
  vat_rate: DecimalString;
  total_ht: DecimalString;
  total_vat: DecimalString;
  total_ttc: DecimalString;
  accounting_code?: string;
}

export interface Invoice {
  id: UUID;
  invoice_number: string;
  client: UUID;
  client_name: string;
  status: InvoiceStatus;
  issue_date: ISODate;
  due_date: ISODate;
  total_ht: DecimalString;
  total_vat: DecimalString;
  total_ttc: DecimalString;
  amount_paid: DecimalString;
  amount_due: DecimalString;
  notes: string;
  terms: string;
  payment_reference: string;
  stripe_payment_link: string | null;
  is_locked: boolean;
  validated_at: ISODatetime | null;
  pdf_file: string | null;
  created_by: UUID | null;
  created_at: ISODatetime;
  updated_at: ISODatetime;
  lines: InvoiceLine[];
}

export interface InvoiceCreatePayload {
  client: UUID;
  issue_date: ISODate;
  due_date: ISODate;
  notes?: string;
  terms?: string;
  lines: Array<Pick<InvoiceLine,
    "position" | "description" | "quantity" | "unit" | "unit_price_ht" | "vat_rate"
  >>;
}

// ─── Quotes (Devis) ────────────────────────────────────────────────────────

export type QuoteStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "refused"
  | "expired"
  | "invoiced";

export interface QuoteLine {
  id: UUID;
  position: number;
  description: string;
  quantity: DecimalString;
  unit: string;
  unit_price_ht: DecimalString;
  vat_rate: DecimalString;
  total_ht: DecimalString;
  total_vat: DecimalString;
  total_ttc: DecimalString;
}

export interface Quote {
  id: UUID;
  quote_number: string;
  client: UUID;
  client_name: string;
  status: QuoteStatus;
  issue_date: ISODate;
  validity_date: ISODate;
  total_ht: DecimalString;
  total_vat: DecimalString;
  total_ttc: DecimalString;
  notes: string;
  terms: string;
  converted_invoice: UUID | null;
  created_by: UUID | null;
  created_at: ISODatetime;
  updated_at: ISODatetime;
  lines: QuoteLine[];
}

// ─── Dashboard ─────────────────────────────────────────────────────────────

export interface DashboardSummary {
  revenue: { year_to_date: DecimalString; month_to_date: DecimalString };
  expenses: { year_to_date: DecimalString; month_to_date: DecimalString };
  profit_ytd: DecimalString;
  outstanding_invoices: { total_amount: DecimalString; count: number };
  overdue_invoices: { total_amount: DecimalString; count: number };
  bank_balance: DecimalString;
  pending_quotes: { total_amount: DecimalString; count: number };
}

// ─── Pagination ────────────────────────────────────────────────────────────

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
