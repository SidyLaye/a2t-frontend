export type QuoteStatus = "draft" | "sent" | "accepted" | "refused" | "expired" | "invoiced";

export interface QuoteLine {
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
}

export interface Quote {
  id: string;
  quote_number: string;
  client: string;
  client_name: string;
  status: QuoteStatus;
  issue_date: string;
  validity_date: string;
  total_ht: string;
  total_vat: string;
  total_ttc: string;
  notes: string;
  terms: string;
  converted_invoice: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  lines: QuoteLine[];
}

export interface QuoteLineInput {
  description: string;
  quantity: string;
  unit: string;
  unit_price_ht: string;
  vat_rate: string;
  position?: number;
}

export interface QuoteCreate {
  client: string;
  issue_date: string;
  validity_date: string;
  notes?: string;
  terms?: string;
  lines: QuoteLineInput[];
}

export interface QuoteHistory {
  id: string;
  change_type: string;
  changed_by: string | null;
  changed_by_email: string;
  previous_data: Record<string, unknown>;
  new_data: Record<string, unknown>;
  timestamp: string;
}
