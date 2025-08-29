import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Trophy } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTournamentStore } from '@/stores/tournament-store';
import { Match, Participant } from '@/types/tournament';

export default function BracketScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tournaments, generateBracket, updateMatch } = useTournamentStore();
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [score, setScore] = useState('');
  const [winner, setWinner] = useState<Participant | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Subscribe to the tournaments array to ensure re-renders
  const tournament = tournaments.find(t => t.id === id);
  
  // Debug logging
  useEffect(() => {
    console.log('BracketScreen re-rendered');
    console.log('Tournament ID:', id);
    console.log('Tournament found:', !!tournament);
    console.log('Tournament matches count:', tournament?.matches.length || 0);
    if (tournament) {
      console.log('Tournament status:', tournament.status);
      console.log('Tournament participants:', tournament.participants.length);
    }
  }, [id, tournament]);
  
  if (!tournament) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Torneio não encontrado</Text>
      </SafeAreaView>
    );
  }

  const handleGenerateBracket = () => {
    console.log('handleGenerateBracket called');
    console.log('Tournament participants:', tournament.participants.length);
    
    if (tournament.participants.length < 2) {
      Alert.alert('Erro', 'É necessário pelo menos 2 participantes para gerar o chaveamento');
      return;
    }
    
    Alert.alert(
      'Gerar Chaveamento',
      'Isso irá gerar um novo chaveamento. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Gerar', 
          onPress: async () => {
            console.log('Generating bracket for tournament:', id);
            setIsGenerating(true);
            
            // Add a small delay to show the generating state
            setTimeout(() => {
              generateBracket(id!);
              setIsGenerating(false);
              console.log('Bracket generation completed');
            }, 500);
          }
        }
      ]
    );
  };

  const handleMatchPress = (match: Match) => {
    if (!match.participant1 || !match.participant2) return;
    setSelectedMatch(match);
    setScore(match.score || '');
    setWinner(match.winner || null);
  };

  const handleSaveResult = () => {
    if (!selectedMatch || !winner) {
      Alert.alert('Erro', 'Selecione o vencedor da partida');
      return;
    }

    updateMatch(id!, selectedMatch.id, {
      winner,
      score: score.trim() || undefined,
      status: 'completed'
    });

    setSelectedMatch(null);
    setScore('');
    setWinner(null);
  };



  const renderBracketMatch = (match: Match, roundIndex: number, matchIndex: number) => {
    const hasParticipants = match.participant1 || match.participant2;
    const isBye = (!match.participant1 && match.participant2) || (match.participant1 && !match.participant2);
    
    return (
      <TouchableOpacity
        key={match.id}
        style={[
          styles.bracketMatch,
          match.status === 'completed' && styles.bracketMatchCompleted,
          isBye && styles.bracketMatchBye
        ]}
        onPress={() => hasParticipants && match.participant1 && match.participant2 && handleMatchPress(match)}
        disabled={!hasParticipants || !match.participant1 || !match.participant2}
      >
        <View style={[
          styles.bracketParticipant,
          match.winner?.id === match.participant1?.id && styles.bracketParticipantWinner
        ]}>
          <Text style={[
            styles.bracketParticipantName,
            match.winner?.id === match.participant1?.id && styles.bracketParticipantNameWinner
          ]}>
            {match.participant1?.name || (isBye ? 'BYE' : '')}
          </Text>
          {match.winner?.id === match.participant1?.id && (
            <Trophy size={12} color="#F59E0B" />
          )}
        </View>
        
        <View style={styles.bracketDivider} />
        
        <View style={[
          styles.bracketParticipant,
          match.winner?.id === match.participant2?.id && styles.bracketParticipantWinner
        ]}>
          <Text style={[
            styles.bracketParticipantName,
            match.winner?.id === match.participant2?.id && styles.bracketParticipantNameWinner
          ]}>
            {match.participant2?.name || (isBye ? 'BYE' : '')}
          </Text>
          {match.winner?.id === match.participant2?.id && (
            <Trophy size={12} color="#F59E0B" />
          )}
        </View>
        
        {match.score && (
          <View style={styles.bracketScore}>
            <Text style={styles.bracketScoreText}>{match.score}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  const renderBracketConnector = (roundIndex: number, matchIndex: number, totalRounds: number) => {
    if (roundIndex === totalRounds - 1) return null;
    
    return (
      <View style={styles.bracketConnector}>
        <View style={styles.bracketLine} />
      </View>
    );
  };

  const groupMatchesByRound = () => {
    const rounds: { [key: number]: Match[] } = {};
    tournament.matches.forEach(match => {
      if (!rounds[match.round]) {
        rounds[match.round] = [];
      }
      rounds[match.round].push(match);
    });
    return rounds;
  };

  const rounds = groupMatchesByRound();
  const roundNumbers = Object.keys(rounds).map(Number).sort((a, b) => a - b);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Chaveamento</Text>
        <View style={styles.placeholder} />
      </View>

      {tournament.matches.length === 0 ? (
        <View style={styles.emptyState}>
          <Trophy size={48} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>
            {isGenerating ? 'Gerando Chaveamento...' : 'Chaveamento não gerado'}
          </Text>
          <Text style={styles.emptyDescription}>
            {isGenerating 
              ? 'Aguarde enquanto o chaveamento é criado'
              : 'Adicione participantes e gere o chaveamento para começar o torneio'
            }
          </Text>
          {!isGenerating && (
            <TouchableOpacity style={styles.generateButton} onPress={handleGenerateBracket}>
              <Text style={styles.generateButtonText}>Gerar Chaveamento</Text>
            </TouchableOpacity>
          )}
          {isGenerating && (
            <View style={styles.loadingIndicator}>
              <Text style={styles.loadingText}>Processando...</Text>
            </View>
          )}
        </View>
      ) : (
        <ScrollView style={styles.content} horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.bracketContainer}>
            <View style={styles.bracketHeader}>
              <Text style={styles.bracketTitle}>
                {tournament.participants.length} Participantes - Eliminação Simples
              </Text>
            </View>
            
            <View style={styles.bracketGrid}>
              {roundNumbers.map((roundNumber, roundIndex) => (
                <View key={roundNumber} style={styles.bracketRound}>
                  <Text style={styles.bracketRoundTitle}>
                    {roundNumber === roundNumbers.length ? 'Vencedor' :
                     roundNumber === roundNumbers.length - 1 ? 'Final' :
                     roundNumber === roundNumbers.length - 2 ? 'Semifinal' :
                     `Rodada ${roundNumber}`}
                  </Text>
                  
                  <View style={[
                    styles.bracketRoundMatches,
                    { marginTop: roundIndex > 0 ? Math.pow(2, roundIndex - 1) * 30 : 0 }
                  ]}>
                    {rounds[roundNumber].map((match, matchIndex) => (
                      <View key={match.id} style={[
                        styles.bracketMatchContainer,
                        { marginBottom: roundIndex > 0 ? Math.pow(2, roundIndex) * 20 : 20 }
                      ]}>
                        {renderBracketMatch(match, roundIndex, matchIndex)}
                        {renderBracketConnector(roundIndex, matchIndex, roundNumbers.length)}
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}

      <Modal visible={!!selectedMatch} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Resultado da Partida</Text>
              <TouchableOpacity onPress={() => {
                setSelectedMatch(null);
                setScore('');
                setWinner(null);
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
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Placar (opcional)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={score}
                    onChangeText={setScore}
                    placeholder="Ex: 2-1, 6-4 6-2, etc."
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Vencedor</Text>
                  <View style={styles.winnerSelector}>
                    <TouchableOpacity
                      style={[
                        styles.winnerOption,
                        winner?.id === selectedMatch.participant1?.id && styles.winnerOptionSelected
                      ]}
                      onPress={() => setWinner(selectedMatch.participant1!)}
                    >
                      <Text style={[
                        styles.winnerOptionText,
                        winner?.id === selectedMatch.participant1?.id && styles.winnerOptionTextSelected
                      ]}>
                        {selectedMatch.participant1?.name}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.winnerOption,
                        winner?.id === selectedMatch.participant2?.id && styles.winnerOptionSelected
                      ]}
                      onPress={() => setWinner(selectedMatch.participant2!)}
                    >
                      <Text style={[
                        styles.winnerOptionText,
                        winner?.id === selectedMatch.participant2?.id && styles.winnerOptionTextSelected
                      ]}>
                        {selectedMatch.participant2?.name}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setSelectedMatch(null);
                  setScore('');
                  setWinner(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveResult}>
                <Text style={styles.saveButtonText}>Salvar Resultado</Text>
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
    marginBottom: 24,
  },
  generateButton: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bracketContainer: {
    padding: 24,
    minWidth: '100%',
  },
  bracketHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  bracketTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  bracketGrid: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bracketRound: {
    marginRight: 40,
    minWidth: 180,
  },
  bracketRoundTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  bracketRoundMatches: {
    alignItems: 'center',
  },
  bracketMatchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bracketMatch: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    width: 160,
    overflow: 'hidden',
  },
  bracketMatchCompleted: {
    borderColor: '#10B981',
  },
  bracketMatchBye: {
    borderColor: '#F59E0B',
    backgroundColor: '#FEF3C7',
  },
  bracketParticipant: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 32,
  },
  bracketParticipantWinner: {
    backgroundColor: '#DBEAFE',
  },
  bracketParticipantName: {
    fontSize: 12,
    color: '#1E293B',
    flex: 1,
    fontWeight: '500',
  },
  bracketParticipantNameWinner: {
    fontWeight: '700',
    color: '#1E40AF',
  },
  bracketDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  bracketScore: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F8FAFC',
  },
  bracketScoreText: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  bracketConnector: {
    width: 30,
    height: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  bracketLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#CBD5E1',
  },
  roundColumn: {
    marginRight: 24,
    minWidth: 200,
  },
  roundTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 16,
  },
  roundMatches: {
    gap: 16,
  },
  matchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 120,
  },
  matchCardDisabled: {
    opacity: 0.5,
  },
  matchCardCompleted: {
    borderColor: '#10B981',
    borderWidth: 2,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  matchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  matchStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchStatusText: {
    fontSize: 12,
    marginLeft: 4,
  },
  matchParticipants: {
    flex: 1,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 2,
  },
  participantWinner: {
    backgroundColor: '#FEF3C7',
  },
  participantName: {
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
  },
  participantNameWinner: {
    fontWeight: '600',
  },
  matchVs: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  vsText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  matchScore: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  scoreText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
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
  matchInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  matchInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
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
  winnerSelector: {
    gap: 8,
  },
  winnerOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  winnerOptionSelected: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  winnerOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  winnerOptionTextSelected: {
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
  loadingIndicator: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});