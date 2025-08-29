// app/_layout.tsx
import React, { useEffect } from 'react';
import { Slot } from 'expo-router';
import { useAppStore } from '../stores/app-store';

export default function RootLayout() {
  const loadAppState = useAppStore(s => s.loadAppState);

  useEffect(() => {
    console.log('[LAYOUT] mounted');
    loadAppState().catch(console.error);
  }, [loadAppState]);

  return <Slot />;
}
