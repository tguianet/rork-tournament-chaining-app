import { router, Redirect } from 'expo-router';
import { Plus, Trophy, Users, Calendar } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTournamentStore } from '@/stores/tournament-store';
import { Tournament } from '@/types/tournament';

const TournamentCard = ({ tournament }: { tournament: Tournament }) => {
  const getStatusColor = (status: Tournament['status']) => {
    switch (status) {
      case 'setup': return '#F59E0B';
      case 'seeding': return '#3B82F6';
      case 'in_progress': return '#10B981';
      case 'completed': return '#6B7280';
      default: return '#6B7280';
    }
  };
  
  const getStatusText = (status: Tournament['status']) => {
    switch (status) {
      case 'setup': return 'Configuração';
      case 'seeding': return 'Seeding';
      case 'in_progress': return 'Em Andamento';
      case 'completed': return 'Finalizado';
      default: return 'Desconhecido';
    }
  };
  
  return (
    <TouchableOpacity 
      style={styles.tournamentCard}
      onPress={() => router.push(`/tournament/${tournament.id}`)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.tournamentName}>{tournament.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tournament.status) }]}>
          <Text style={styles.statusText}>{getStatusText(tournament.status)}</Text>
        </View>
      </View>
      
      <View style={styles.cardInfo}>
        <View style={styles.infoItem}>
          <Users size={16} color="#64748B" />
          <Text style={styles.infoText}>{tournament.participants.length}/{tournament.size}</Text>
        </View>
        <View style={styles.infoItem}>
          <Trophy size={16} color="#64748B" />
          <Text style={styles.infoText}>
            {tournament.type === 'single_elimination' ? 'Eliminação Simples' : 'Eliminação Dupla'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.cardDate}>
        Criado em {new Date(tournament.createdAt).toLocaleDateString('pt-BR')}
      </Text>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const { tournaments, isLoading, loadData, settings } = useTournamentStore();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  useEffect(() => {
    loadData().then(() => {
      setIsInitialLoading(false);
    });
  }, []);
  
  if (isInitialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E40AF" />
      </View>
    );
  }
  
  if (!settings.hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }
  
  const onRefresh = () => {
    loadData();
  };
  
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Trophy size={80} color="#CBD5E1" />
      <Text style={styles.emptyTitle}>Nenhum torneio criado</Text>
      <Text style={styles.emptyDescription}>
        Crie seu primeiro torneio para começar a organizar suas competições
      </Text>
      <TouchableOpacity 
        style={styles.createFirstButton}
        onPress={() => router.push('/create-tournament')}
      >
        <Text style={styles.createFirstButtonText}>Criar Primeiro Torneio</Text>
      </TouchableOpacity>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Torneios</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/create-tournament')}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={tournaments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TournamentCard tournament={item} />}
        contentContainerStyle={tournaments.length === 0 ? styles.emptyContainer : styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  addButton: {
    backgroundColor: '#1E40AF',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  createFirstButton: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createFirstButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tournamentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  cardInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },
  cardDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});