// Fix: Simplified settings screen that works with current store
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Edit3, Trash2, Users, Trophy } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTournamentStore } from '@/stores/tournament-store';

export default function TournamentSettingsScreen() {
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const tournaments = useTournamentStore(s => s.tournaments);
  const updateTournament = useTournamentStore(s => s.updateTournament);
  const [showEditModal, setShowEditModal] = useState(false);
  const [tournamentName, setTournamentName] = useState('');
  
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
          <Text style={styles.title}>Configurações</Text>
          <View style={styles.editButton} />
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
          <Text style={styles.title}>Configurações</Text>
          <View style={styles.editButton} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Torneio não encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleEditTournament = () => {
    setTournamentName(tournament.name);
    setShowEditModal(true);
  };

  const handleSaveChanges = async () => {
    if (!tournamentName.trim()) {
      Alert.alert('Erro', 'Nome do torneio é obrigatório');
      return;
    }

    await updateTournament(id!, {
      name: tournamentName.trim(),
    });

    setShowEditModal(false);
  };

  const handleDeleteTournament = () => {
    Alert.alert(
      'Excluir Torneio',
      'Tem certeza que deseja excluir este torneio? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive', 
          onPress: () => {
            // For now, just go back - delete functionality would need to be added to store
            router.back();
          }
        }
      ]
    );
  };

  const matches = tournament.bracket?.matches || [];
  const completedMatches = matches.filter(m => m.status === 'DONE').length;
  const totalMatches = matches.length;
  const progressPercentage = totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Configurações</Text>
        <TouchableOpacity onPress={handleEditTournament} style={styles.editButton}>
          <Edit3 size={24} color="#1E40AF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.tournamentInfo}>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Text style={styles.infoTitle}>{tournament.name}</Text>
            </View>
            
            <Text style={styles.infoSubtitle}>Eliminação Simples</Text>
            
            <View style={styles.infoStats}>
              <View style={styles.statItem}>
                <Users size={20} color="#1E40AF" />
                <Text style={styles.statLabel}>Participantes</Text>
                <Text style={styles.statValue}>{tournament.participants.length}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Trophy size={20} color="#1E40AF" />
                <Text style={styles.statLabel}>Partidas</Text>
                <Text style={styles.statValue}>{completedMatches}/{totalMatches}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Trophy size={20} color="#1E40AF" />
                <Text style={styles.statLabel}>Progresso</Text>
                <Text style={styles.statValue}>{Math.round(progressPercentage)}%</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações</Text>
          
          <TouchableOpacity style={styles.actionItem} onPress={handleEditTournament}>
            <View style={styles.actionIcon}>
              <Edit3 size={20} color="#1E40AF" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Editar Torneio</Text>
              <Text style={styles.actionDescription}>Alterar nome do torneio</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zona de Perigo</Text>
          
          <TouchableOpacity style={[styles.actionItem, styles.dangerAction]} onPress={handleDeleteTournament}>
            <View style={[styles.actionIcon, styles.dangerIcon]}>
              <Trash2 size={20} color="#EF4444" />
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, styles.dangerText]}>Excluir Torneio</Text>
              <Text style={styles.actionDescription}>Esta ação não pode ser desfeita</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Torneio</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome do Torneio</Text>
                <TextInput
                  style={styles.textInput}
                  value={tournamentName}
                  onChangeText={setTournamentName}
                  placeholder="Digite o nome do torneio"
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  editButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
  infoHeader: {
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  infoSubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 20,
  },
  infoStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  dangerAction: {
    backgroundColor: '#FEF2F2',
  },
  dangerIcon: {
    backgroundColor: '#FEE2E2',
  },
  dangerText: {
    color: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  modalClose: {
    fontSize: 18,
    color: '#6B7280',
  },
  modalBody: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#1E40AF',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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