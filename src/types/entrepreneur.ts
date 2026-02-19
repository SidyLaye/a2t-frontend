export interface Entrepreneur {
  id: string;
  company_name: string;
  siren: string;
  siret: string;
  legal_form: string;
  vat_number: string;
  address_line1: string;
  address_line2: string;
  postal_code: string;
  city: string;
  country: string;
  default_vat_rate: string;
  fiscal_year_start_month: number;
  invoice_prefix: string;
  quote_prefix: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EntrepreneurCreate {
  company_name: string;
  siren?: string;
  siret?: string;
  legal_form?: string;
  vat_number?: string;
  email?: string;
  phone?: string;
  address_line1: string;
  address_line2?: string;
  postal_code: string;
  city: string;
  country?: string;
}

export interface InviteMemberRequest {
  email: string;
  role: string;
}
