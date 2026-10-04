import { ApiClient } from './api.client';
import { RegisterIntentRequest, RegisterIntentResponse } from '../models/auth.types';

export class AuthService {
  /**
   * Step 1: Initiate Client Registration & Dispatch OTP
   */
  static async registerIntent(data: RegisterIntentRequest): Promise<RegisterIntentResponse> {
    return ApiClient.post<RegisterIntentResponse>('/auth/register-intent', data);
  }

  /**
   * Step 2: Validate 6-Digit Email Verification Code
   */
  static async verifyOtp(data: { email: string; otp_code: string }): Promise<any> {
    return ApiClient.post('/auth/verify-otp', data);
  }

  /**
   * Request a Fresh 6-Digit Verification Code
   */
  static async resendOtp(data: { email: string }): Promise<any> {
    return ApiClient.post('/auth/resend-otp', data);
  }

  /**
   * Get Authenticated User Profile & Banking Context
   */
  static async getMe(): Promise<import('../models/auth.types').GetMeResponse> {
    return ApiClient.get<import('../models/auth.types').GetMeResponse>('/auth/me');
  }

  /**
   * Logout user
   */
  static async logout(): Promise<any> {
    return ApiClient.post('/auth/logout', {});
  }
}
