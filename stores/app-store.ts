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
      const hasCompleted = raw ? JSON.parse(raw) : false;
      set({ 
        onboarding: { 
          hasCompletedOnboarding: Boolean(hasCompleted) 
        } 
      });
      console.log('[APP_STORE] loadAppState ok', { hasCompleted });
    } catch (e) {
      console.error('[APP_STORE] loadAppState error', e);
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