export const BASE_URL = '/api/py';

export class ApiClient {
  private static getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('access_token');
      const onboardingToken = localStorage.getItem('onboarding_token');
      const token = accessToken || onboardingToken;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  private static async handleResponse(response: Response) {
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        throw new Error('An unexpected error occurred.');
      }

      if (errorData.detail && Array.isArray(errorData.detail)) {
        throw new Error(errorData.detail[0]?.msg || 'Validation Error');
      }
      
      throw new Error(errorData.detail || errorData.message || 'An error occurred');
    }

    return response.json();
  }

  private static async tryRefreshToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('access_token') || localStorage.getItem('onboarding_token');
    if (!token) return null;

    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.access_token) {
          localStorage.setItem('access_token', data.access_token);
          return data.access_token;
        }
      }
    } catch {
      // Ignore
    }
    return null;
  }

  static async post<T>(endpoint: string, body: any): Promise<T> {
    let response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (response.status === 401 && endpoint !== '/auth/refresh' && endpoint !== '/auth/login') {
      const refreshedToken = await this.tryRefreshToken();
      if (refreshedToken) {
        response = await fetch(`${BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(body),
        });
      }
    }

    return this.handleResponse(response);
  }

  static async get<T>(endpoint: string): Promise<T> {
    let response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (response.status === 401 && endpoint !== '/auth/refresh') {
      const refreshedToken = await this.tryRefreshToken();
      if (refreshedToken) {
        response = await fetch(`${BASE_URL}${endpoint}`, {
          method: 'GET',
          headers: this.getHeaders(),
        });
      }
    }

    return this.handleResponse(response);
  }

  static async patch<T>(endpoint: string, body: any): Promise<T> {
    let response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (response.status === 401 && endpoint !== '/auth/refresh') {
      const refreshedToken = await this.tryRefreshToken();
      if (refreshedToken) {
        response = await fetch(`${BASE_URL}${endpoint}`, {
          method: 'PATCH',
          headers: this.getHeaders(),
          body: JSON.stringify(body),
        });
      }
    }

    return this.handleResponse(response);
  }

  static async put<T>(endpoint: string, body: any): Promise<T> {
    let response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (response.status === 401 && endpoint !== '/auth/refresh') {
      const refreshedToken = await this.tryRefreshToken();
      if (refreshedToken) {
        response = await fetch(`${BASE_URL}${endpoint}`, {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify(body),
        });
      }
    }

    return this.handleResponse(response);
  }

  static async delete<T>(endpoint: string): Promise<T> {
    let response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (response.status === 401 && endpoint !== '/auth/refresh') {
      const refreshedToken = await this.tryRefreshToken();
      if (refreshedToken) {
        response = await fetch(`${BASE_URL}${endpoint}`, {
          method: 'DELETE',
          headers: this.getHeaders(),
        });
      }
    }

    return this.handleResponse(response);
  }
}

