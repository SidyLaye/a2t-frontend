export type InvoiceStatus = "draft" | "validated" | "sent" | "partially_paid" | "paid" | "overdue" | "cancelled";

export interface InvoiceLine {
  id?: string;
  position: number;
  description: string;
  quantity: string;
  unit: string;
  unit_price_ht: string;
  vat_rate: string;
  total_ht: string;
  total_vat: string;
  total_ttc: string;
  accounting_code: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  client: string;
  client_name: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  total_ht: string;
  total_vat: string;
  total_ttc: string;
  amount_paid: string;
  amount_due: string;
  notes: string;
  terms: string;
  payment_reference: string;
  stripe_payment_link: string;
  is_locked: boolean;
  validated_at: string | null;
  pdf_file: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  lines: InvoiceLine[];
}

export interface InvoiceLineInput {
  description: string;
  quantity: string;
  unit: string;
  unit_price_ht: string;
  vat_rate: string;
  position?: number;
  accounting_code?: string;
}

export interface InvoiceCreate {
  client: string;
  issue_date: string;
  due_date: string;
  notes?: string;
  terms?: string;
  lines: InvoiceLineInput[];
}

export interface CreditNote {
  id: string;
  credit_note_number: string;
  original_invoice: string;
  issue_date: string;
  total_ht: string;
  total_vat: string;
  total_ttc: string;
  reason: string;
  created_at: string;
}
