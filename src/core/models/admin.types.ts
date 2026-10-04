export interface AdminRegisterRequest {
  email: string;
  password: string;
  phone_number?: string;
  admin_secret_key?: string;
}

export interface AdminRegisterResponse {
  status: string;
  message: string;
  admin_id: string;
  email: string;
  role: string;
  access_token: string;
  token_type: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  status: string;
  message: string;
  admin_id: string;
  email: string;
  role: string;
  access_token: string;
  token_type: string;
}

export interface AdminCreateUserRequest {
  // Auth
  email: string;
  password: string;
  phone_number: string;
  
  // KYC Identity
  first_name: string;
  last_name: string;
  middle_name?: string;
  date_of_birth: string; // YYYY-MM-DD
  id_type: string; // passport, drivers_license, national_id, ssn
  id_number: string;
  
  // Address
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  
  // Financial Profile
  occupation?: string;
  annual_income?: string;
  
  // Document URLs
  id_front_image_url?: string;
  id_back_image_url?: string;
  profile_picture_url?: string;
  
  // Security (Strictly 4 numeric digits)
  transaction_pin: string;
  
  // Banking Provisions
  account_type: 'checking' | 'savings';
  account_tier: 'private_wealth' | 'premier' | 'standard';
  initial_deposit: number;
  daily_limit?: number;
  wire_fee?: number;
  send_welcome_email: boolean;
}

export interface AdminCreateUserResponse {
  status: string;
  message: string;
  user_id: string;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  account_number: string;
  routing_number: string;
  account_type: string;
  account_tier: string;
  initial_balance: number;
  kyc_status: string;
  card?: {
    id: string;
    card_number: string;
    expiration_date: string;
    cvv: string;
    card_tier: string;
    card_status: string;
  };
  created_at: string;
}

export interface AdminClientListItem {
  id: string;
  email: string;
  phone_number: string;
  first_name?: string;
  last_name?: string;
  role: string;
  status: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  account_number?: string;
  account_type?: string;
  balance: number;
  daily_limit?: number;
  wire_fee?: number;
  tier?: string;
  kyc_status?: string;
  created_at: string;
}

export interface AdminClientListResponse {
  total_clients: number;
  clients: AdminClientListItem[];
}

export interface AdminClientDetailResponse {
  user: {
    id: string;
    email: string;
    password_unhashed?: string;
    phone_number: string;
    role: string;
    status: string;
    profile_picture_url?: string;
    is_email_verified: boolean;
    is_phone_verified: boolean;
    created_at: string;
  };
  kyc?: {
    first_name: string;
    middle_name?: string;
    last_name: string;
    date_of_birth: string;
    id_type: string;
    id_number_unhash?: string;
    street_address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    occupation?: string;
    annual_income?: string;
    id_front_image_url?: string;
    id_back_image_url?: string;
    proof_of_address_url?: string;
    kyc_status: string;
  };
  security?: {
    pin_unhashed?: string;
    failed_pin_attempts: number;
    is_locked: boolean;
  };
  account?: {
    id: string;
    account_number: string;
    routing_number: string;
    account_type: string;
    currency: string;
    balance: number;
    daily_limit?: number;
    wire_fee?: number;
    status: string;
    tier: string;
  };
  cards: Array<{
    id: string;
    card_number_unhash: string;
    expiration_date: string;
    cvv_unhash: string;
    card_tier: string;
    card_status: string;
  }>;
  recent_transactions: Array<{
    id: string;
    transaction_type: string;
    amount: number;
    fee: number;
    description: string;
    counterparty_name?: string;
    reference_number?: string;
    balance_after?: number;
    status: string;
    created_at: string;
  }>;
}

export interface AdminStatsResponse {
  total_clients: number;
  total_assets_under_management: number;
  active_accounts: number;
  total_transactions_count: number;
  pending_kyc_count: number;
}

export interface ClearanceCodeItem {
  id: string;
  stage_number: number;
  code_name: string;
  code: string;
  is_used: boolean;
  used_at?: string | null;
  created_at: string;
}

export interface AdminClearanceCodesListResponse {
  user_id: string;
  codes: ClearanceCodeItem[];
}

export interface AdminGenerateClearanceCodesRequest {
  stage_number?: number;
  custom_code?: string;
}

export interface AdminAccountLimitsUpdateRequest {
  daily_limit: number;
  wire_fee: number;
}
