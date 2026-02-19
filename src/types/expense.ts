export type ExpenseStatus = "pending" | "categorized" | "validated" | "rejected";

export interface ExpenseCategory {
  id: string;
  name: string;
  accounting_code: string;
  parent: string | null;
  is_system: boolean;
  created_at: string;
}

export interface Expense {
  id: string;
  description: string;
  amount_ht: string;
  vat_amount: string;
  amount_ttc: string;
  vat_rate: string;
  is_vat_deductible: boolean;
  category: string | null;
  category_name: string;
  suggested_category: string | null;
  date: string;
  supplier_name: string;
  receipt_file: string | null;
  receipt_ocr_data: Record<string, unknown> | null;
  status: ExpenseStatus;
  bank_transaction: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseCreate {
  description: string;
  amount_ht: string;
  vat_amount: string;
  amount_ttc: string;
  vat_rate?: string;
  is_vat_deductible?: boolean;
  category?: string;
  date: string;
  supplier_name?: string;
}
