import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAppStore } from '../stores/app-store';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const loadAppState = useAppStore(s => s.loadAppState);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('[LAYOUT] Loading app state...');
        await loadAppState();
        console.log('[LAYOUT] App state loaded');
      } catch (error) {
        console.error('[LAYOUT] Error loading app state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [loadAppState]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#1E40AF" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="create-tournament" options={{ presentation: 'modal' }} />
      <Stack.Screen name="tournament" />
    </Stack>
  );
}
