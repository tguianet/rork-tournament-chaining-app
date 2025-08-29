import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTournamentStore } from "@/stores/tournament-store";
import { useAppStore } from "@/stores/app-store";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { loadData } = useTournamentStore();
  const { loadAppState } = useAppStore();
  
  useEffect(() => {
    Promise.all([
      loadAppState(),
      loadData()
    ]).then(() => {
      SplashScreen.hideAsync();
    }).catch((error) => {
      console.error('[LAYOUT] Load error:', error);
      SplashScreen.hideAsync();
    });
  }, [loadAppState, loadData]);
  
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="create-tournament" options={{ headerShown: false }} />
      <Stack.Screen name="tournament/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RootLayoutNav />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}