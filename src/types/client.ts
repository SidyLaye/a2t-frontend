export interface Client {
  id: string;
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
  created_at: string;
  updated_at: string;
}

export type ClientCreate = Omit<Client, "id" | "created_at" | "updated_at">;
