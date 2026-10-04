import { ApiClient } from './api.client';
import {
  AdminRegisterRequest,
  AdminRegisterResponse,
  AdminLoginRequest,
  AdminLoginResponse,
  AdminCreateUserRequest,
  AdminCreateUserResponse,
  AdminClientListResponse,
  AdminClientDetailResponse,
  AdminStatsResponse,
  AdminAccountLimitsUpdateRequest,
} from '../models/admin.types';

export class AdminService {
  /**
   * Register a new Administrator with email and password
   */
  static async registerAdmin(data: AdminRegisterRequest): Promise<AdminRegisterResponse> {
    return ApiClient.post<AdminRegisterResponse>('/admin/auth/register', data);
  }

  /**
   * Authenticate Administrator
   */
  static async loginAdmin(data: AdminLoginRequest): Promise<AdminLoginResponse> {
    return ApiClient.post<AdminLoginResponse>('/admin/auth/login', data);
  }

  /**
   * Provision a client in one atomic step (bypass OTP and auto-verify)
   */
  static async createUser(data: AdminCreateUserRequest): Promise<AdminCreateUserResponse> {
    return ApiClient.post<AdminCreateUserResponse>('/admin/users/create', data);
  }

  /**
   * List all clients with live balances and statuses
   */
  static async getClients(search?: string, statusFilter?: string): Promise<AdminClientListResponse> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (statusFilter) params.append('status_filter', statusFilter);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return ApiClient.get<AdminClientListResponse>(`/admin/users${queryString}`);
  }

  /**
   * Get 360-degree client inspection dossier
   */
  static async getClientDetails(userId: string): Promise<AdminClientDetailResponse> {
    return ApiClient.get<AdminClientDetailResponse>(`/admin/users/${userId}`);
  }

  /**
   * Update client status (active, frozen, suspended, closed)
   */
  static async updateClientStatus(userId: string, status: string): Promise<any> {
    return ApiClient.patch<any>(`/admin/users/${userId}/status`, { status });
  }

  /**
   * Manual liquidity adjustment (credit/debit)
   */
  static async adjustBalance(userId: string, payload: { adjustment_type: 'credit' | 'debit'; amount: number; description: string }): Promise<any> {
    return ApiClient.post<any>(`/admin/users/${userId}/adjust-balance`, payload);
  }

  /**
   * Institutional Overview Metrics & Stats
   */
  static async getStats(): Promise<AdminStatsResponse> {
    return ApiClient.get<AdminStatsResponse>('/admin/stats');
  }

  /**
   * Fetch Client Wire Clearance Keys (Stages 1-3)
   */
  static async getClearanceCodes(
    userId: string
  ): Promise<import('../models/admin.types').AdminClearanceCodesListResponse> {
    return ApiClient.get<import('../models/admin.types').AdminClearanceCodesListResponse>(
      `/admin/users/${userId}/clearance-codes`
    );
  }

  /**
   * Generate or Reset Client Wire Clearance Keys
   */
  static async generateClearanceCodes(
    userId: string,
    payload: import('../models/admin.types').AdminGenerateClearanceCodesRequest
  ): Promise<import('../models/admin.types').AdminClearanceCodesListResponse> {
    return ApiClient.post<import('../models/admin.types').AdminClearanceCodesListResponse>(
      `/admin/users/${userId}/clearance-codes/generate`,
      payload
    );
  }

  /**
   * Update client daily transfer limit and wire fees
   */
  static async updateAccountLimits(
    userId: string,
    payload: AdminAccountLimitsUpdateRequest
  ): Promise<any> {
    return ApiClient.patch<any>(`/admin/users/${userId}/account-limits`, payload);
  }
  /**
   * Delete client completely from the system
   */
  static async deleteClient(userId: string): Promise<any> {
    return ApiClient.delete<any>(`/admin/users/${userId}`);
  }
}
