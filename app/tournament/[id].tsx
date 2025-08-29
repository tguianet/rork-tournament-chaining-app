// Fix: Simplified tournament detail screen that works with current store
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Users, Trophy, Calendar, Settings } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTournamentStore } from '@/stores/tournament-store';

export default function TournamentDetailScreen() {
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const tournaments = useTournamentStore(s => s.tournaments);
  
  // Normalize id parameter - handle both string and array cases
  const id = Array.isArray(params.id) ? params.id[0] : params.id || null;
  
  const tournament = id ? tournaments.find(t => t.id === id) : null;
  
  if (!id) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.title}>Torneio</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>ID do torneio inválido</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!tournament) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.title}>Torneio</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Torneio não encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const menuItems = [
    {
      icon: Users,
      title: 'Participantes',
      description: `${tournament.participants.length} jogadores`,
      onPress: () => router.push(`/tournament/${id}/participants`)
    },
    {
      icon: Trophy,
      title: 'Bracket',
      description: 'Visualizar chaveamento',
      onPress: () => router.push(`/tournament/${id}/bracket`)
    },
    {
      icon: Calendar,
      title: 'Agenda',
      description: 'Agendar partidas',
      onPress: () => router.push(`/tournament/${id}/schedule`)
    },
    {
      icon: Settings,
      title: 'Configurações',
      description: 'Editar torneio',
      onPress: () => router.push(`/tournament/${id}/settings`)
    }
  ];

  const matches = tournament.bracket?.matches || [];
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{tournament.name}</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.tournamentInfo}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>{tournament.name}</Text>
            <Text style={styles.infoSubtitle}>Eliminação Simples</Text>
            <View style={styles.infoStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{tournament.participants.length}</Text>
                <Text style={styles.statLabel}>Participantes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{matches.length}</Text>
                <Text style={styles.statLabel}>Partidas</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{tournament.bracket?.status === 'gerado' ? 'Sim' : 'Não'}</Text>
                <Text style={styles.statLabel}>Chave Gerada</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.menu}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
              <View style={styles.menuIcon}>
                <item.icon size={24} color="#1E40AF" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  tournamentInfo: {
    padding: 24,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 20,
  },
  infoStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  menu: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
});