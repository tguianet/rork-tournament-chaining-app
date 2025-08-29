import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../stores/app-store';

export default function Index() {
  const router = useRouter();
  const hasCompletedOnboarding = useAppStore(s => s.onboarding.hasCompletedOnboarding);

  useEffect(() => {
    console.log('[INDEX] hasCompletedOnboarding:', hasCompletedOnboarding);
    
    const timeout = setTimeout(() => {
      if (hasCompletedOnboarding) {
        console.log('[INDEX] Redirecting to home');
        router.replace('/(tabs)/home');
      } else {
        console.log('[INDEX] Redirecting to onboarding');
        router.replace('/onboarding');
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [hasCompletedOnboarding, router]);

  return <View style={{ flex: 1, backgroundColor: '#F8FAFC' }} />;
}