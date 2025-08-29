import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Users, Calendar, BarChart3 } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/stores/app-store';

const features = [
  {
    icon: Trophy,
    title: 'Crie Torneios',
    description: 'Organize torneios de eliminação simples ou dupla com até 64 participantes'
  },
  {
    icon: Users,
    title: 'Gerencie Participantes',
    description: 'Adicione jogadores, defina níveis e organize o seeding automaticamente'
  },
  {
    icon: Calendar,
    title: 'Agende Partidas',
    description: 'Organize jogos por data, horário e quadra para melhor controle'
  },
  {
    icon: BarChart3,
    title: 'Relatórios Completos',
    description: 'Exporte resultados em PDF e compartilhe brackets em imagem'
  }
];

export default function OnboardingScreen() {
  const { setOnboardingDone } = useAppStore();
  
  const handleStart = async () => {
    try {
      console.log('[ONB] Starting onboarding completion...');
      await setOnboardingDone();
      console.log('[ONB] Onboarding completed, redirecting to home');
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('[ONB] Error completing onboarding:', error);
      // Still redirect to home even if storage fails
      router.replace('/(tabs)/home');
    }
  };
  
  return (
    <LinearGradient
      colors={['#1E40AF', '#3B82F6']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Trophy size={80} color="#FFFFFF" />
            <Text style={styles.title}>Tournament Bracket</Text>
            <Text style={styles.subtitle}>
              O app completo para organizar seus torneios esportivos
            </Text>
          </View>
          
          <View style={styles.features}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <feature.icon size={24} color="#1E40AF" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>
          
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Text style={styles.startButtonText}>Começar</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  features: {
    flex: 1,
    paddingVertical: 20,
  },
  featureItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});