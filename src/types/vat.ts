export type VATStatus = "draft" | "calculated" | "reviewed" | "submitted" | "accepted";
export type VATPeriodType = "monthly" | "quarterly" | "yearly";

export interface VATDeclaration {
  id: string;
  period_type: VATPeriodType;
  period_start: string;
  period_end: string;
  status: VATStatus;
  vat_collected_20: string;
  vat_collected_10: string;
  vat_collected_5_5: string;
  vat_collected_2_1: string;
  vat_deductible_20: string;
  vat_deductible_10: string;
  vat_deductible_5_5: string;
  vat_deductible_2_1: string;
  total_vat_collected: string;
  total_vat_deductible: string;
  vat_balance: string;
  reviewed_by: string | null;
  reviewed_by_email: string;
  reviewed_at: string | null;
  submitted_at: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface VATDeclarationCreate {
  period_type: VATPeriodType;
  period_start: string;
  period_end: string;
  notes?: string;
}

export interface VATLock {
  id: string;
  period_start: string;
  period_end: string;
  locked_by: string | null;
  locked_at: string;
  declaration: string;
  reason: string;
}
