// app/_layout.tsx
import React, { useEffect, useState } from 'react';
import { Slot } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAppStore } from '../stores/app-store';

export default function RootLayout() {
  const load = useAppStore(s => s.loadAppState);
  const hasCompleted = useAppStore(s => s.onboarding?.hasCompletedOnboarding ?? false);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        console.log('[LAYOUT] loading app state…');
        await load();                // carrega do AsyncStorage
      } catch (e) {
        console.error('[LAYOUT] load error', e);
      } finally {
        if (mounted) {
          setReady(true);            // GARANTE que sai do loading
          console.log('[LAYOUT] ready');
        }
      }
    })();
    return () => { mounted = false; };
  }, [load]);

  if (!ready) {
    return (
      <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading…</Text>
      </View>
    );
  }

  // Pronto: renderiza as rotas normalmente.
  // Se quiser forçar onboarding, faça via index.tsx (abaixo).
  console.log('[LAYOUT] hasCompletedOnboarding:', hasCompleted);
  return <Slot />;
}
