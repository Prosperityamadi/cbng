import { ApiClient } from './api.client';
import { 
  AccountSetupRequest, 
  AccountSetupResponse,
  DepositRequest,
  DepositResponse,
  WireTransferRequest,
  WireTransferResponse,
  TransactionListResponse,
} from '../models/account.types';

export class AccountService {
  /**
   * Step 4: Establish Security PIN & Provision Account
   */
  static async setupAccount(data: AccountSetupRequest): Promise<AccountSetupResponse> {
    return ApiClient.post<AccountSetupResponse>('/accounts/setup', data);
  }

  static async getDashboardSummary(): Promise<any> {
    return ApiClient.get<any>('/accounts/dashboard');
  }

  /**
   * Execute Instant Liquidity Deposit
   */
  static async depositFunds(data: DepositRequest): Promise<DepositResponse> {
    return ApiClient.post<DepositResponse>('/transactions/deposit', data);
  }

  /**
   * Execute Fedwire Real-Time Fund Transfer
   */
  static async executeWireTransfer(data: WireTransferRequest): Promise<WireTransferResponse> {
    return ApiClient.post<WireTransferResponse>('/transactions/transfer', data);
  }

  /**
   * Fetch Transaction History with Optional Filter
   */
  static async getTransactions(
    filterType: 'all' | 'inflow' | 'outflow' = 'all',
    limit: number = 20,
    offset: number = 0
  ): Promise<TransactionListResponse> {
    return ApiClient.get<TransactionListResponse>(
      `/transactions?filter_type=${filterType}&limit=${limit}&offset=${offset}`
    );
  }

  /**
   * Initiate Wire Clearance Protocol
   */
  static async initiateWireClearance(
    data: import('../models/account.types').WireClearanceInitiateRequest
  ): Promise<import('../models/account.types').WireClearanceInitiateResponse> {
    return ApiClient.post<import('../models/account.types').WireClearanceInitiateResponse>(
      '/transactions/transfer/initiate',
      data
    );
  }

  /**
   * Verify Regulatory Clearance Key
   */
  static async verifyWireClearanceStage(
    data: import('../models/account.types').WireClearanceVerifyRequest
  ): Promise<import('../models/account.types').WireClearanceVerifyResponse> {
    return ApiClient.post<import('../models/account.types').WireClearanceVerifyResponse>(
      '/transactions/transfer/verify-stage',
      data
    );
  }

  /**
   * Fetch Active Pending Wire Transfer Session
   */
  static async getPendingWireTransfer(): Promise<import('../models/account.types').PendingWireTransferResponse> {
    return ApiClient.get<import('../models/account.types').PendingWireTransferResponse>(
      '/transactions/transfer/pending'
    );
  }

  /**
   * Cancel Active Pending Wire Transfer & Reset Clearance Codes
   */
  static async cancelPendingWireTransfer(): Promise<import('../models/account.types').CancelPendingWireResponse> {
    return ApiClient.post<import('../models/account.types').CancelPendingWireResponse>(
      '/transactions/transfer/cancel',
      {}
    );
  }
}


