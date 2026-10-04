export interface UserProfileData {
  id: string;
  email: string;
  phone_number: string;
  role: string;
  status: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  profile_picture_url: string | null;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  street_address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  kyc_status: string;
  account_tier: string | null;
  has_active_account: boolean;
}

export class ProfileService {
  private static async attemptRefresh(oldToken: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    try {
      const res = await fetch('/api/py/auth/refresh', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${oldToken}` }
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

  static async getProfile(token: string): Promise<UserProfileData> {
    let currentToken = token;
    let res = await fetch('/api/py/users/me/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${currentToken}`
      }
    });

    if (res.status === 401) {
      const refreshed = await this.attemptRefresh(currentToken);
      if (refreshed) {
        currentToken = refreshed;
        res = await fetch('/api/py/users/me/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${currentToken}`
          }
        });
      }
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to fetch profile');
    }

    return res.json();
  }

  static async updateProfile(token: string, data: { phone_number?: string, profile_picture_url?: string }) {
    let currentToken = token;
    let res = await fetch('/api/py/users/me/profile', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${currentToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (res.status === 401) {
      const refreshed = await this.attemptRefresh(currentToken);
      if (refreshed) {
        currentToken = refreshed;
        res = await fetch('/api/py/users/me/profile', {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
      }
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to update profile');
    }

    return res.json();
  }

  static async changePassword(token: string, currentPassword: string, newPassword: string) {
    let currentToken = token;
    let res = await fetch('/api/py/users/me/security/change-password', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${currentToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
    });

    if (res.status === 401) {
      const refreshed = await this.attemptRefresh(currentToken);
      if (refreshed) {
        currentToken = refreshed;
        res = await fetch('/api/py/users/me/security/change-password', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
        });
      }
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to change password');
    }

    return res.json();
  }

  static async changePin(token: string, currentPin: string, newPin: string) {
    let currentToken = token;
    let res = await fetch('/api/py/users/me/security/change-pin', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${currentToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ current_pin: currentPin, new_pin: newPin })
    });

    if (res.status === 401) {
      const refreshed = await this.attemptRefresh(currentToken);
      if (refreshed) {
        currentToken = refreshed;
        res = await fetch('/api/py/users/me/security/change-pin', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ current_pin: currentPin, new_pin: newPin })
        });
      }
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to change PIN');
    }

    return res.json();
  }
}
