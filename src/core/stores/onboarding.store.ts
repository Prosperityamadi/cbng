import { create } from 'zustand';
import { RegisterIntentRequest } from '../models/auth.types';
import { AuthService } from '../services/auth.service';

interface OnboardingState {
  // Data
  email: string;
  
  // UI States
  isLoading: boolean;
  error: string | null;
  currentStep: number;
  
  // Actions
  registerIntent: (data: RegisterIntentRequest) => Promise<boolean>;
  resetError: () => void;
  setStep: (step: number) => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  email: '',
  isLoading: false,
  error: null,
  currentStep: 1,

  resetError: () => set({ error: null }),
  setStep: (step) => set({ currentStep: step }),

  registerIntent: async (data: RegisterIntentRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await AuthService.registerIntent(data);
      set({ 
        email: response.email, 
        currentStep: 2, // Move to Verify OTP step
        isLoading: false 
      });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Registration failed', isLoading: false });
      return false;
    }
  },
}));
