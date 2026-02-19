export type MatchStatus = "unmatched" | "auto_matched" | "manually_matched" | "ignored";

export interface BankAccount {
  id: string;
  bank_name: string;
  account_name: string;
  masked_iban: string;
  currency: string;
  provider: string;
  balance: string;
  last_synced_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BankTransaction {
  id: string;
  bank_account: string;
  provider_transaction_id: string;
  date: string;
  description: string;
  amount: string;
  currency: string;
  match_status: MatchStatus;
  matched_invoice: string | null;
  matched_expense: string | null;
  is_duplicate: boolean;
  created_at: string;
}

export interface MatchingRule {
  id: string;
  name: string;
  description_contains: string;
  description_regex: string;
  amount_min: string | null;
  amount_max: string | null;
  assign_category: string | null;
  auto_create_expense: boolean;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TransactionMatchRequest {
  match_type: "invoice" | "expense";
  match_id: string;
}
