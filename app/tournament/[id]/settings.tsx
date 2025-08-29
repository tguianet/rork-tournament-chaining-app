import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Edit3, Trash2, Users, Trophy, Calendar, FileText, Share, Download } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTournamentStore } from '@/stores/tournament-store';

export default function TournamentSettingsScreen() {
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const { getTournament, updateTournament, deleteTournament } = useTournamentStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [tournamentName, setTournamentName] = useState('');
  const [tournamentRules, setTournamentRules] = useState('');
  const [tournamentType, setTournamentType] = useState<'single_elimination' | 'double_elimination'>('single_elimination');
  
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
    setTournamentRules(tournament.rules || '');
    setTournamentType(tournament.type);
    setShowEditModal(true);
  };

  const handleSaveChanges = () => {
    if (!tournamentName.trim()) {
      Alert.alert('Erro', 'Nome do torneio é obrigatório');
      return;
    }

    updateTournament(id!, {
      name: tournamentName.trim(),
      rules: tournamentRules.trim() || undefined,
      type: tournamentType
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
            deleteTournament(id!);
            router.back();
          }
        }
      ]
    );
  };

  const handleExportPDF = () => {
    Alert.alert('Em breve', 'Funcionalidade de exportar PDF será implementada em breve.');
  };

  const handleExportCSV = () => {
    Alert.alert('Em breve', 'Funcionalidade de exportar CSV será implementada em breve.');
  };

  const handleShareBracket = () => {
    Alert.alert('Em breve', 'Funcionalidade de compartilhar chaveamento será implementada em breve.');
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'setup': return 'Configuração';
      case 'seeding': return 'Seeding';
      case 'in_progress': return 'Em andamento';
      case 'completed': return 'Finalizado';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'setup': return '#6B7280';
      case 'seeding': return '#F59E0B';
      case 'in_progress': return '#1E40AF';
      case 'completed': return '#10B981';
      default: return '#6B7280';
    }
  };

  const completedMatches = tournament.matches.filter(m => m.status === 'completed').length;
  const totalMatches = tournament.matches.length;
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
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tournament.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(tournament.status) }]}>
                  {getStatusText(tournament.status)}
                </Text>
              </View>
            </View>
            
            <Text style={styles.infoSubtitle}>
              {tournament.type === 'single_elimination' ? 'Eliminação Simples' : 'Eliminação Dupla'}
            </Text>
            
            <View style={styles.infoStats}>
              <View style={styles.statItem}>
                <Users size={20} color="#1E40AF" />
                <Text style={styles.statLabel}>Participantes</Text>
                <Text style={styles.statValue}>{tournament.participants.length}/{tournament.size}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Trophy size={20} color="#1E40AF" />
                <Text style={styles.statLabel}>Partidas</Text>
                <Text style={styles.statValue}>{completedMatches}/{totalMatches}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Calendar size={20} color="#1E40AF" />
                <Text style={styles.statLabel}>Progresso</Text>
                <Text style={styles.statValue}>{Math.round(progressPercentage)}%</Text>
              </View>
            </View>
            
            {tournament.rules && (
              <View style={styles.rulesSection}>
                <Text style={styles.rulesTitle}>Regras</Text>
                <Text style={styles.rulesText}>{tournament.rules}</Text>
              </View>
            )}
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
              <Text style={styles.actionDescription}>Alterar nome, tipo e regras</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exportar e Compartilhar</Text>
          
          <TouchableOpacity style={styles.actionItem} onPress={handleExportPDF}>
            <View style={styles.actionIcon}>
              <FileText size={20} color="#10B981" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Exportar PDF</Text>
              <Text style={styles.actionDescription}>Relatório completo do torneio</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem} onPress={handleExportCSV}>
            <View style={styles.actionIcon}>
              <Download size={20} color="#10B981" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Exportar CSV</Text>
              <Text style={styles.actionDescription}>Dados em planilha</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem} onPress={handleShareBracket}>
            <View style={styles.actionIcon}>
              <Share size={20} color="#10B981" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Compartilhar Chaveamento</Text>
              <Text style={styles.actionDescription}>Imagem do bracket</Text>
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

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tipo de Eliminação</Text>
                <View style={styles.typeSelector}>
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      tournamentType === 'single_elimination' && styles.typeOptionSelected
                    ]}
                    onPress={() => setTournamentType('single_elimination')}
                  >
                    <Text style={[
                      styles.typeOptionText,
                      tournamentType === 'single_elimination' && styles.typeOptionTextSelected
                    ]}>
                      Simples
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      tournamentType === 'double_elimination' && styles.typeOptionSelected
                    ]}
                    onPress={() => setTournamentType('double_elimination')}
                  >
                    <Text style={[
                      styles.typeOptionText,
                      tournamentType === 'double_elimination' && styles.typeOptionTextSelected
                    ]}>
                      Dupla
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Regras (opcional)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={tournamentRules}
                  onChangeText={setTournamentRules}
                  placeholder="Digite as regras do torneio"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
    fontWeight: '600',
  },
  infoSubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 20,
  },
  infoStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
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
  rulesSection: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  rulesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  rulesText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
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
    maxHeight: '80%',
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
  textArea: {
    height: 100,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  typeOptionSelected: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  typeOptionTextSelected: {
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