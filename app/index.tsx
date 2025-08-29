import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../stores/app-store';

export default function Index() {
  const router = useRouter();
  const done = useAppStore(s => s.onboarding?.hasCompletedOnboarding ?? false);

  useEffect(() => {
    console.log('[INDEX] redirect', done);
    router.replace(done ? '/(tabs)/home' : '/onboarding');
  }, [done, router]);

  return <View />;
}