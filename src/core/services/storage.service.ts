import { BASE_URL } from './api.client';

export interface StorageUploadResponse {
  url: string;
  bucket: string;
  path: string;
  file_name: string;
  content_type: string;
  size_bytes: number;
  is_public: boolean;
}

export class StorageService {
  /**
   * Upload Sensitive KYC Document
   */
  static async uploadKyc(file: File, documentType: string): Promise<StorageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);

    const headers: Record<string, string> = {};

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token') || localStorage.getItem('onboarding_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${BASE_URL}/storage/upload-kyc`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.detail 
        ? (Array.isArray(errorData.detail) ? errorData.detail[0].msg : errorData.detail)
        : 'An error occurred during file upload.';
      throw new Error(message);
    }

    return response.json();
  }
}
