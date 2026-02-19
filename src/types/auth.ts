export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
  last_login: string | null;
}

export type RoleName = "owner" | "admin" | "accountant" | "collaborator" | "read_only";

export interface UserRole {
  id: string;
  user: string;
  user_email: string;
  user_name: string;
  entrepreneur: string;
  role: RoleName;
  is_active: boolean;
  created_at: string;
}

export interface JWTPayload {
  user_id: string;
  email: string;
  entrepreneur_roles: Record<string, RoleName>;
  exp: number;
  iat: number;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  password: string;
  password_confirm: string;
}

export interface RegisterResponse {
  user: User;
  tokens: AuthTokens;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface MeResponse {
  user: User;
  roles: UserRole[];
}
