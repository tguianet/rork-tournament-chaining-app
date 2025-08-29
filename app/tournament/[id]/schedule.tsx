import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, Clock, MapPin, Plus, Edit3 } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTournamentStore } from '@/stores/tournament-store';
import { Match } from '@/types/tournament';

export default function ScheduleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTournament, updateMatch } = useTournamentStore();
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [court, setCourt] = useState('');
  
  const tournament = getTournament(id!);
  
  if (!tournament) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Torneio não encontrado</Text>
      </SafeAreaView>
    );
  }

  const handleScheduleMatch = (match: Match) => {
    setSelectedMatch(match);
    if (match.scheduledDate) {
      const date = new Date(match.scheduledDate);
      setScheduledDate(date.toISOString().split('T')[0]);
      setScheduledTime(date.toTimeString().slice(0, 5));
    } else {
      setScheduledDate('');
      setScheduledTime('');
    }
    setCourt(match.court || '');
  };

  const handleSaveSchedule = () => {
    if (!selectedMatch) return;
    
    if (!scheduledDate || !scheduledTime) {
      Alert.alert('Erro', 'Data e horário são obrigatórios');
      return;
    }

    const dateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    
    updateMatch(id!, selectedMatch.id, {
      scheduledDate: dateTime,
      court: court.trim() || undefined
    });

    setSelectedMatch(null);
    setScheduledDate('');
    setScheduledTime('');
    setCourt('');
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getMatchStatusColor = (match: Match) => {
    switch (match.status) {
      case 'completed': return '#10B981';
      case 'in_progress': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getMatchStatusText = (match: Match) => {
    switch (match.status) {
      case 'completed': return 'Finalizada';
      case 'in_progress': return 'Em andamento';
      default: return 'Agendada';
    }
  };

  const scheduledMatches = tournament.matches.filter(match => 
    match.participant1 && match.participant2
  );

  const groupMatchesByDate = () => {
    const groups: { [key: string]: Match[] } = {};
    
    scheduledMatches.forEach(match => {
      let dateKey = 'Sem data';
      if (match.scheduledDate) {
        dateKey = formatDate(new Date(match.scheduledDate));
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(match);
    });
    
    return groups;
  };

  const matchGroups = groupMatchesByDate();
  const dateKeys = Object.keys(matchGroups).sort((a, b) => {
    if (a === 'Sem data') return 1;
    if (b === 'Sem data') return -1;
    return new Date(a.split('/').reverse().join('-')).getTime() - 
           new Date(b.split('/').reverse().join('-')).getTime();
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Agenda</Text>
        <View style={styles.placeholder} />
      </View>

      {scheduledMatches.length === 0 ? (
        <View style={styles.emptyState}>
          <Calendar size={48} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>Nenhuma partida</Text>
          <Text style={styles.emptyDescription}>
            Gere o chaveamento para agendar as partidas
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {dateKeys.map(dateKey => (
            <View key={dateKey} style={styles.dateGroup}>
              <View style={styles.dateHeader}>
                <Text style={styles.dateTitle}>{dateKey}</Text>
                <Text style={styles.dateCount}>
                  {matchGroups[dateKey].length} partida{matchGroups[dateKey].length !== 1 ? 's' : ''}
                </Text>
              </View>
              
              <View style={styles.matchesList}>
                {matchGroups[dateKey]
                  .sort((a, b) => {
                    if (!a.scheduledDate && !b.scheduledDate) return 0;
                    if (!a.scheduledDate) return 1;
                    if (!b.scheduledDate) return -1;
                    return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
                  })
                  .map((match, index) => (
                    <TouchableOpacity
                      key={match.id}
                      style={styles.matchCard}
                      onPress={() => handleScheduleMatch(match)}
                    >
                      <View style={styles.matchHeader}>
                        <View style={styles.matchInfo}>
                          <Text style={styles.matchTitle}>
                            {match.participant1?.name} vs {match.participant2?.name}
                          </Text>
                          <View style={styles.matchMeta}>
                            <View style={[styles.statusBadge, { backgroundColor: getMatchStatusColor(match) + '20' }]}>
                              <Text style={[styles.statusText, { color: getMatchStatusColor(match) }]}>
                                {getMatchStatusText(match)}
                              </Text>
                            </View>
                            <Text style={styles.roundText}>Rodada {match.round}</Text>
                          </View>
                        </View>
                        <TouchableOpacity style={styles.editButton}>
                          <Edit3 size={16} color="#6B7280" />
                        </TouchableOpacity>
                      </View>
                      
                      <View style={styles.matchDetails}>
                        {match.scheduledDate ? (
                          <View style={styles.scheduleInfo}>
                            <View style={styles.scheduleItem}>
                              <Clock size={16} color="#6B7280" />
                              <Text style={styles.scheduleText}>
                                {formatTime(new Date(match.scheduledDate))}
                              </Text>
                            </View>
                            {match.court && (
                              <View style={styles.scheduleItem}>
                                <MapPin size={16} color="#6B7280" />
                                <Text style={styles.scheduleText}>{match.court}</Text>
                              </View>
                            )}
                          </View>
                        ) : (
                          <View style={styles.unscheduled}>
                            <Plus size={16} color="#1E40AF" />
                            <Text style={styles.unscheduledText}>Agendar partida</Text>
                          </View>
                        )}
                      </View>
                      
                      {match.score && (
                        <View style={styles.matchScore}>
                          <Text style={styles.scoreText}>Resultado: {match.score}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal visible={!!selectedMatch} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agendar Partida</Text>
              <TouchableOpacity onPress={() => {
                setSelectedMatch(null);
                setScheduledDate('');
                setScheduledTime('');
                setCourt('');
              }}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedMatch && (
              <View style={styles.modalBody}>
                <View style={styles.matchInfo}>
                  <Text style={styles.matchInfoTitle}>
                    {selectedMatch.participant1?.name} vs {selectedMatch.participant2?.name}
                  </Text>
                  <Text style={styles.matchInfoSubtitle}>Rodada {selectedMatch.round}</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Data</Text>
                  <TextInput
                    style={styles.textInput}
                    value={scheduledDate}
                    onChangeText={setScheduledDate}
                    placeholder="YYYY-MM-DD"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Horário</Text>
                  <TextInput
                    style={styles.textInput}
                    value={scheduledTime}
                    onChangeText={setScheduledTime}
                    placeholder="HH:MM"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Quadra/Campo (opcional)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={court}
                    onChangeText={setCourt}
                    placeholder="Ex: Quadra 1, Campo Central"
                  />
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setSelectedMatch(null);
                  setScheduledDate('');
                  setScheduledTime('');
                  setCourt('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveSchedule}>
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
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  dateCount: {
    fontSize: 14,
    color: '#64748B',
  },
  matchesList: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  matchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  matchInfo: {
    flex: 1,
  },
  matchTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  matchMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  roundText: {
    fontSize: 12,
    color: '#64748B',
  },
  editButton: {
    padding: 8,
  },
  matchDetails: {
    marginBottom: 8,
  },
  scheduleInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scheduleText: {
    fontSize: 14,
    color: '#64748B',
  },
  unscheduled: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unscheduledText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '600',
  },
  matchScore: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  scoreText: {
    fontSize: 12,
    color: '#64748B',
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
  matchInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 4,
  },
  matchInfoSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
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
});