// Fix: Simplified schedule screen that works with current store
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTournamentStore } from '@/stores/tournament-store';

export default function ScheduleScreen() {
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
          <Text style={styles.title}>Agenda</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>ID do torneio inválido</Text>
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
          <Text style={styles.title}>Agenda</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Torneio não encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  const matches = tournament.bracket?.matches || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Agenda</Text>
        <View style={styles.placeholder} />
      </View>

      {matches.length === 0 ? (
        <View style={styles.emptyState}>
          <Calendar size={48} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>Nenhuma partida</Text>
          <Text style={styles.emptyDescription}>
            Gere o chaveamento para agendar as partidas
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          <View style={styles.matchesList}>
            {matches.map((match, index) => {
              const playerAName = tournament.participants.find(p => p.id === match.playerA)?.name || 'BYE';
              const playerBName = tournament.participants.find(p => p.id === match.playerB)?.name || 'BYE';
              
              return (
                <View key={match.id} style={styles.matchCard}>
                  <Text style={styles.matchTitle}>
                    Jogo {index + 1} — Rodada {match.round}
                  </Text>
                  <View style={styles.matchPlayers}>
                    <Text style={styles.playerText}>🔵 {playerAName}</Text>
                    <Text style={styles.vsText}>vs</Text>
                    <Text style={styles.playerText}>🔴 {playerBName}</Text>
                  </View>
                  <Text style={styles.statusText}>
                    Status: {match.status === 'DONE' ? 'Finalizado' : 'Pendente'}
                  </Text>
                  {match.winner && (
                    <Text style={styles.winnerText}>
                      🏆 Vencedor: {tournament.participants.find(p => p.id === match.winner)?.name}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
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
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
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
  },
  matchesList: {
    padding: 24,
  },
  matchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  matchTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  matchPlayers: {
    alignItems: 'center',
    marginBottom: 8,
  },
  playerText: {
    fontSize: 14,
    color: '#374151',
    marginVertical: 2,
  },
  vsText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
    marginVertical: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
  winnerText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 4,
  },
});