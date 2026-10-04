export interface RegisterIntentRequest {
  email: string;
  password?: string;
  phone_number?: string;
  terms_accepted: boolean;
  privacy_policy_accepted: boolean;
}

export interface RegisterIntentResponse {
  status: string;
  message: string;
  email: string;
  expires_in: number;
}

export interface VerifyOtpRequest {
  email: string;
  otp_code: string;
}

export interface VerifyOtpResponse {
  status: string;
  onboarding_token: string;
  token_type: string;
  next_step: string;
  message: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface ResendOtpResponse {
  status: string;
  message: string;
  expires_in: number;
}

export interface User {
  id: string;
  email: string;
  phone_number: string;
  role: string;
  status: string;
  profile_picture_url?: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  created_at: string;
}

export interface PrimaryAccount {
  id: string;
  account_number: string;
  routing_number: string;
  account_type: string;
  currency: string;
  balance: number;
  status: string;
  tier: string;
}

export interface KycContext {
  first_name: string;
  last_name: string;
  kyc_status: string;
}

export interface Card {
  id: string;
  card_number: string;
  expiration_date: string;
  cvv: string;
  card_tier: string;
  card_status: string;
}

export interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  created_at: string;
}

export interface GetMeResponse {
  user: User;
  primary_account: PrimaryAccount | null;
  kyc: KycContext | null;
}
