import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Plus, UserPlus, Upload, Trash2, Edit3 } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTournamentStore } from '@/stores/tournament-store';
import { Participant } from '@/types/tournament';

export default function ParticipantsScreen() {
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const { getTournament, addParticipant, updateParticipant, removeParticipant } = useTournamentStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [participantName, setParticipantName] = useState('');
  const [participantLevel, setParticipantLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  
  // Normalize id parameter - handle both string and array cases
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const tournament = id ? getTournament(id) : null;
  
  if (!id) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.title}>Participantes</Text>
          <View style={styles.addButton} />
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
          <Text style={styles.title}>Participantes</Text>
          <View style={styles.addButton} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Torneio não encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleAddParticipant = () => {
    if (!participantName.trim()) {
      Alert.alert('Erro', 'Nome do participante é obrigatório');
      return;
    }

    if (editingParticipant) {
      updateParticipant(id!, editingParticipant.id, {
        name: participantName.trim(),
        level: participantLevel
      });
    } else {
      addParticipant(id!, {
        name: participantName.trim(),
        level: participantLevel
      });
    }

    setParticipantName('');
    setParticipantLevel('beginner');
    setEditingParticipant(null);
    setShowAddModal(false);
  };

  const handleEditParticipant = (participant: Participant) => {
    setEditingParticipant(participant);
    setParticipantName(participant.name);
    setParticipantLevel(participant.level);
    setShowAddModal(true);
  };

  const handleRemoveParticipant = (participantId: string) => {
    Alert.alert(
      'Remover Participante',
      'Tem certeza que deseja remover este participante?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => removeParticipant(id!, participantId) }
      ]
    );
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner': return 'Iniciante';
      case 'intermediate': return 'Intermediário';
      case 'advanced': return 'Avançado';
      default: return level;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return '#10B981';
      case 'intermediate': return '#F59E0B';
      case 'advanced': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Participantes</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
          <Plus size={24} color="#1E40AF" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {tournament.participants.length} de {tournament.size} participantes
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {tournament.participants.length === 0 ? (
          <View style={styles.emptyState}>
            <UserPlus size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>Nenhum participante</Text>
            <Text style={styles.emptyDescription}>
              Adicione participantes para começar o torneio
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => setShowAddModal(true)}>
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>Adicionar Participante</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.participantsList}>
            {tournament.participants.map((participant, index) => (
              <View key={participant.id} style={styles.participantCard}>
                <View style={styles.participantInfo}>
                  <View style={styles.participantHeader}>
                    <Text style={styles.participantName}>{participant.name}</Text>
                    <View style={styles.participantActions}>
                      <TouchableOpacity 
                        onPress={() => handleEditParticipant(participant)}
                        style={styles.actionButton}
                      >
                        <Edit3 size={16} color="#6B7280" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => handleRemoveParticipant(participant.id)}
                        style={styles.actionButton}
                      >
                        <Trash2 size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.participantMeta}>
                    <View style={[styles.levelBadge, { backgroundColor: getLevelColor(participant.level) + '20' }]}>
                      <Text style={[styles.levelText, { color: getLevelColor(participant.level) }]}>
                        {getLevelLabel(participant.level)}
                      </Text>
                    </View>
                    {participant.seed && (
                      <Text style={styles.seedText}>Seed #{participant.seed}</Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.importButton}>
            <Upload size={20} color="#6B7280" />
            <Text style={styles.importButtonText}>Importar CSV</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingParticipant ? 'Editar Participante' : 'Novo Participante'}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowAddModal(false);
                setEditingParticipant(null);
                setParticipantName('');
                setParticipantLevel('beginner');
              }}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome</Text>
                <TextInput
                  style={styles.textInput}
                  value={participantName}
                  onChangeText={setParticipantName}
                  placeholder="Digite o nome do participante"
                  autoFocus
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nível</Text>
                <View style={styles.levelSelector}>
                  {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.levelOption,
                        participantLevel === level && styles.levelOptionSelected
                      ]}
                      onPress={() => setParticipantLevel(level)}
                    >
                      <Text style={[
                        styles.levelOptionText,
                        participantLevel === level && styles.levelOptionTextSelected
                      ]}>
                        {getLevelLabel(level)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddModal(false);
                  setEditingParticipant(null);
                  setParticipantName('');
                  setParticipantLevel('beginner');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddParticipant}>
                <Text style={styles.saveButtonText}>
                  {editingParticipant ? 'Salvar' : 'Adicionar'}
                </Text>
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
  addButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  statsText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
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
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E40AF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  participantsList: {
    padding: 24,
  },
  participantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  participantInfo: {
    flex: 1,
  },
  participantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  participantActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  participantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  seedText: {
    fontSize: 12,
    color: '#64748B',
  },
  actions: {
    padding: 24,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  importButtonText: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 8,
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
  levelSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  levelOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  levelOptionSelected: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  levelOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  levelOptionTextSelected: {
    color: '#FFFFFF',
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
});