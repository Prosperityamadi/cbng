import { ApiClient } from './api.client';
import { KycSubmitRequest, KycSubmitResponse } from '../models/kyc.types';

export class KycService {
  /**
   * Step 3: Submit Personal Profile & Link KYC Documents
   */
  static async submitKyc(data: KycSubmitRequest): Promise<KycSubmitResponse> {
    return ApiClient.post<KycSubmitResponse>('/kyc/submit', data);
  }
}
