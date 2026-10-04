import { create } from 'zustand';
import { GetMeResponse } from '../models/auth.types';
import { AuthService } from '../services/auth.service';

interface AuthState {
  // Data
  user: GetMeResponse['user'] | null;
  primaryAccount: GetMeResponse['primary_account'] | null;
  kyc: GetMeResponse['kyc'] | null;
  
  // Status
  isAuthenticated: boolean;
  isHydrating: boolean;
  
  // Actions
  hydrate: () => Promise<void>;
  logout: () => void;
  setAuthData: (data: GetMeResponse) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  primaryAccount: null,
  kyc: null,
  isAuthenticated: false,
  isHydrating: true, // Initially true until hydration finishes

  hydrate: async () => {
    try {
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('access_token') || localStorage.getItem('onboarding_token')
        : null;

      if (!token) {
        set({ isHydrating: false, isAuthenticated: false });
        return;
      }

      // Fetch latest profile & banking context
      const res = await AuthService.getMe();
      
      set({
        user: res.user,
        primaryAccount: res.primary_account,
        kyc: res.kyc,
        isAuthenticated: res.user.status === 'active', // Assuming 'active' means fully onboarded
        isHydrating: false,
      });
    } catch (error) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('onboarding_token');
      }
      set({ 
        user: null, 
        primaryAccount: null, 
        kyc: null,
        isAuthenticated: false, 
        isHydrating: false 
      });
    }
  },

  logout: () => {
    AuthService.logout().catch(() => {}); // Fire and forget
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('onboarding_token');
    }
    set({
      user: null,
      primaryAccount: null,
      kyc: null,
      isAuthenticated: false,
    });
  },

  setAuthData: (data: GetMeResponse) => {
    set({
      user: data.user,
      primaryAccount: data.primary_account,
      kyc: data.kyc,
      isAuthenticated: data.user.status === 'active',
    });
  }
}));
