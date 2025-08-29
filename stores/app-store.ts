import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

type OnboardingState = {
  hasCompletedOnboarding: boolean;
};

type AppState = {
  onboarding: OnboardingState;
  isInitialized: boolean;
  loadAppState: () => Promise<void>;
  setOnboardingDone: () => Promise<void>;
};

const STORAGE_KEY = 'app:onboarding';

export const useAppStore = create<AppState>((set, get) => ({
  onboarding: {
    hasCompletedOnboarding: false,
  },
  isInitialized: false,

  loadAppState: async () => {
    try {
      console.log('[APP] Loading app state from storage...');
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      
      let hasCompleted = false;
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          hasCompleted = parsed?.hasCompletedOnboarding === true || parsed === true;
        } catch (parseError) {
          console.warn('[APP] Failed to parse stored data, treating as false:', parseError);
          hasCompleted = false;
        }
      }
      
      set({ 
        onboarding: { 
          hasCompletedOnboarding: hasCompleted 
        },
        isInitialized: true
      });
      
      console.log('[APP] App state loaded successfully:', { hasCompleted });
    } catch (error) {
      console.error('[APP] Error loading app state:', error);
      set({ 
        onboarding: { 
          hasCompletedOnboarding: false 
        },
        isInitialized: true
      });
    }
  },

  setOnboardingDone: async () => {
    try {
      console.log('[APP] Setting onboarding as completed...');
      const data = { hasCompletedOnboarding: true };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      
      set({ 
        onboarding: { 
          hasCompletedOnboarding: true 
        } 
      });
      
      console.log('[APP] Onboarding completed successfully');
    } catch (error) {
      console.error('[APP] Error setting onboarding done:', error);
      throw error;
    }
  },
}));