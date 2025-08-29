import React from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, MapPin } from 'lucide-react-native';
import { useTournamentStore } from '@/stores/tournament-store';

export default function ScheduleScreen() {
  const { tournaments } = useTournamentStore();
  
  const scheduledMatches = tournaments
    .flatMap(tournament => 
      tournament.matches
        .filter(match => match.scheduledDate)
        .map(match => ({ ...match, tournamentName: tournament.name }))
    )
    .sort((a, b) => new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime());
  
  const renderMatch = ({ item }: { item: any }) => (
    <View style={styles.matchCard}>
      <View style={styles.matchHeader}>
        <Text style={styles.tournamentName}>{item.tournamentName}</Text>
        <Text style={styles.roundText}>Rodada {item.round}</Text>
      </View>
      
      <View style={styles.matchInfo}>
        <View style={styles.participants}>
          <Text style={styles.participantName}>
            {item.participant1?.name || 'TBD'}
          </Text>
          <Text style={styles.vs}>vs</Text>
          <Text style={styles.participantName}>
            {item.participant2?.name || 'TBD'}
          </Text>
        </View>
        
        <View style={styles.matchDetails}>
          <View style={styles.detailItem}>
            <Calendar size={16} color="#64748B" />
            <Text style={styles.detailText}>
              {new Date(item.scheduledDate).toLocaleDateString('pt-BR')}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Clock size={16} color="#64748B" />
            <Text style={styles.detailText}>
              {new Date(item.scheduledDate).toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
          {item.court && (
            <View style={styles.detailItem}>
              <MapPin size={16} color="#64748B" />
              <Text style={styles.detailText}>{item.court}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
  
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Calendar size={80} color="#CBD5E1" />
      <Text style={styles.emptyTitle}>Nenhuma partida agendada</Text>
      <Text style={styles.emptyDescription}>
        As partidas agendadas aparecerão aqui quando você definir datas e horários
      </Text>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Agenda</Text>
      </View>
      
      <FlatList
        data={scheduledMatches}
        keyExtractor={(item) => item.id}
        renderItem={renderMatch}
        contentContainerStyle={scheduledMatches.length === 0 ? styles.emptyContainer : styles.listContainer}
        ListEmptyComponent={renderEmptyState}
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
  },
  matchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tournamentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  roundText: {
    fontSize: 12,
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  matchInfo: {
    gap: 12,
  },
  participants: {
    alignItems: 'center',
  },
  participantName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1E293B',
  },
  vs: {
    fontSize: 14,
    color: '#64748B',
    marginVertical: 4,
  },
  matchDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#64748B',
  },
});