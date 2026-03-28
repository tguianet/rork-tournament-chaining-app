import { router } from 'expo-router';
import { Plus, Search, Filter } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, FlatList, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTournamentStore } from '@/stores/tournament-store';
import { Tournament } from '@/types/tournament';

const TournamentItem = ({ tournament }: { tournament: Tournament }) => {
  return (
    <TouchableOpacity 
      style={styles.tournamentItem}
      onPress={() => router.push(`/tournament/${tournament.id}`)}
    >
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>{tournament.name}</Text>
        <Text style={styles.itemInfo}>
          {tournament.participants.length}/{tournament.size} participantes
        </Text>
        <Text style={styles.itemDate}>
          {new Date(tournament.updatedAt).toLocaleDateString('pt-BR')}
        </Text>
      </View>
      <View style={styles.itemStatus}>
        <Text style={[styles.statusText, { color: getStatusColor(tournament.status) }]}>
          {getStatusText(tournament.status)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

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

export default function TournamentsScreen() {
  const { tournaments } = useTournamentStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredTournaments = tournaments.filter(tournament =>
    tournament.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Todos os Torneios</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/create-tournament')}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar torneios..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#64748B" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredTournaments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TournamentItem tournament={item} />}
        contentContainerStyle={styles.listContainer}
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1E293B',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    padding: 16,
  },
  tournamentItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  itemInfo: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  itemStatus: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
});