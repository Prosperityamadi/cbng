import { ApiClient } from './api.client';

export interface ContactMessagePayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ContactMessageResponse {
  success: boolean;
  message: string;
  inquiry_id: string;
  status: string;
  delivery_destination: string;
}

export interface ContactInquiryItem {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  delivery_recipient: string;
  created_at: string;
}

export class ContactService {
  /**
   * Submit an inquiry to the Private Wealth Concierge.
   * Records in database and dispatches delivery notification to info@nemicapbank.com.
   */
  static async sendMessage(payload: ContactMessagePayload): Promise<ContactMessageResponse> {
    return ApiClient.post<ContactMessageResponse>('/contact', payload);
  }

  /**
   * Retrieve previous inquiries submitted by the current client.
   */
  static async getMyInquiries(): Promise<{ inquiries: ContactInquiryItem[] }> {
    return ApiClient.get<{ inquiries: ContactInquiryItem[] }>('/contact/my-inquiries');
  }
}
