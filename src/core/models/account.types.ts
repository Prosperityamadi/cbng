export interface AccountSetupRequest {
  account_type: string;
  transaction_pin: string; // Strictly 4 numeric digits
}

export interface AccountSetupResponse {
  status: string;
  message: string;
  account: {
    id: string;
    account_number: string;
    routing_number: string;
    account_type: string;
    currency: string;
    balance: string;
    status: string;
    tier: string;
  };
  access_token: string;
  token_type: string;
  next_step: string;
}

export interface DepositRequest {
  amount: number;
  deposit_method?: string;
  source_institution?: string;
  note?: string;
}

export interface DepositResponse {
  transaction_id: string;
  reference_number: string;
  amount: number;
  fee: number;
  new_balance: number;
  status: string;
  message: string;
  created_at: string;
}

export interface WireTransferRequest {
  recipient_name: string;
  recipient_account: string;
  amount: number;
  transaction_pin?: string;
  note?: string;
}

export interface WireTransferResponse {
  transaction_id: string;
  reference_number: string;
  recipient_name: string;
  recipient_account: string;
  amount: number;
  fee: number;
  new_balance: number;
  status: string;
  message: string;
  created_at: string;
}

export interface TransactionItemRecord {
  id: string;
  account_id: string;
  transaction_type: string;
  amount: number;
  fee: number;
  currency: string;
  description: string;
  counterparty_name?: string | null;
  counterparty_account?: string | null;
  reference_number?: string | null;
  balance_after?: number | null;
  status: string;
  created_at: string;
}

export interface TransactionListResponse {
  account_number: string;
  current_balance: number;
  total_count: number;
  transactions: TransactionItemRecord[];
}

export interface WireClearanceInitiateRequest {
  recipient_name: string;
  recipient_account: string;
  amount: number;
  note?: string;
}

export interface WireClearanceInitiateResponse {
  status: 'clearance_required';
  stage: number;
  title: string;
  code_name: string;
  description: string;
  support_email: string;
}

export interface WireClearanceVerifyRequest {
  stage: number;
  code: string;
  amount: number;
  recipient_name: string;
  recipient_account: string;
  note?: string;
}

export interface WireClearanceVerifyResponse {
  status: 'next_stage_required' | 'completed';
  stage?: number;
  title?: string;
  code_name?: string;
  description?: string;
  support_email?: string;
  transaction?: WireTransferResponse;
}

export interface PendingWireTransferResponse {
  has_pending: boolean;
  amount?: number;
  fee?: number;
  recipient_name?: string;
  recipient_account?: string;
  current_stage?: number;
  stage_title?: string;
  code_name?: string;
  description?: string;
  support_email?: string;
  created_at?: string;
}

export interface CancelPendingWireResponse {
  status: string;
  message: string;
}

