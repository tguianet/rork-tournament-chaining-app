import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

type OnboardingState = {
  hasCompletedOnboarding: boolean;
};

type AppState = {
  onboarding: OnboardingState;
  loadAppState: () => Promise<void>;
  setOnboardingDone: () => Promise<void>;
};

export const useAppStore = create<AppState>((set, get) => ({
  onboarding: {
    hasCompletedOnboarding: false,
  },

  loadAppState: async () => {
    try {
      const raw = await AsyncStorage.getItem('app:onboarding');
      const parsed = raw ? JSON.parse(raw) : null;
      const hasCompleted = parsed === true;
      
      set({ 
        onboarding: { 
          hasCompletedOnboarding: hasCompleted 
        } 
      });
      console.log('[APP] load ok', { hasCompleted });
    } catch (e) {
      console.error('[APP] load error', e);
      set({ 
        onboarding: { 
          hasCompletedOnboarding: false 
        } 
      });
    }
  },

  setOnboardingDone: async () => {
    try {
      await AsyncStorage.setItem('app:onboarding', JSON.stringify(true));
      set({ 
        onboarding: { 
          hasCompletedOnboarding: true 
        } 
      });
      console.log('[APP_STORE] setOnboardingDone ok');
    } catch (e) {
      console.error('[APP_STORE] setOnboardingDone error', e);
    }
  },
}));