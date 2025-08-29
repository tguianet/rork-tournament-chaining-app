// Fix: Proper bracket screen with safe parameter handling and bracket rendering
import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTournamentStore } from '../../../stores/tournament-store';

export default function BracketScreen() {
  console.log('[BRACKET] render');

  const rawParams = useLocalSearchParams<{ id?: string | string[] }>();
  console.log('[BRACKET] params raw', rawParams);

  const tournamentId = useMemo(() => {
    const v = rawParams?.id;
    return Array.isArray(v) ? v[0] : v ?? null;
  }, [rawParams]);

  const tournament = useTournamentStore(
    React.useCallback(
      (s) => s.tournaments.find((t) => t.id === tournamentId),
      [tournamentId]
    )
  );

  console.log('[BRACKET] tournament', {
    id: tournament?.id,
    participants: tournament?.participants?.length,
    hasBracket: !!tournament?.bracket,
    matches: tournament?.bracket?.matches?.length,
    status: tournament?.bracket?.status
  });

  const onGenerate = async () => {
    if (!tournamentId) return;
    try {
      console.log('[BRACKET] generate click', { tournamentId });
      await useTournamentStore.getState().generateBracket(tournamentId, { forceReset: true });
      const after = useTournamentStore.getState().tournaments.find(t => t.id === tournamentId);
      console.log('[BRACKET] after generate', {
        matches: after?.bracket?.matches?.length,
        status: after?.bracket?.status
      });
    } catch (e) {
      console.error('[BRACKET] generate error', e);
    }
  };

  if (!tournamentId || !tournament) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Carregando torneio…</Text>
      </View>
    );
  }

  const canShowBracket = !!tournament.bracket?.matches?.length;
  const participantCount = tournament.participants?.length ?? 0;
  const canGenerate = participantCount >= 2;

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>{tournament.name}</Text>

      {!canShowBracket && (
        <View style={styles.generateSection}>
          <Text style={styles.participantCount}>
            Participantes: {participantCount}
          </Text>
          <Pressable
            onPress={onGenerate}
            disabled={!canGenerate}
            style={({ pressed }) => ([
              styles.generateButton,
              !canGenerate && styles.generateButtonDisabled,
              pressed && styles.generateButtonPressed
            ])}
          >
            <Text style={[
              styles.generateButtonText,
              !canGenerate && styles.generateButtonTextDisabled
            ]}>
              Gerar chaveamento
            </Text>
          </Pressable>
          {!canGenerate && (
            <Text style={styles.errorText}>
              Adicione pelo menos 2 participantes.
            </Text>
          )}
        </View>
      )}

      {canShowBracket && (
        <View style={styles.bracketSection}>
          <View style={styles.bracketHeader}>
            <Text style={styles.bracketTitle}>Chaveamento</Text>
            <Pressable onPress={onGenerate} style={styles.regenerateButton}>
              <Text style={styles.regenerateButtonText}>Regenerar</Text>
            </Pressable>
          </View>
          {tournament.bracket!.matches.map((m, idx) => {
            const playerAName = tournament.participants.find(p => p.id === m.playerA)?.name || 'BYE';
            const playerBName = tournament.participants.find(p => p.id === m.playerB)?.name || 'BYE';
            
            return (
              <View key={m.id} style={styles.matchCard}>
                <Text style={styles.matchTitle}>Jogo {idx + 1} — Rodada {m.round}</Text>
                <View style={styles.matchPlayers}>
                  <Text style={styles.playerText}>🔵 {playerAName}</Text>
                  <Text style={styles.vsText}>vs</Text>
                  <Text style={styles.playerText}>🔴 {playerBName}</Text>
                </View>
                <Text style={[
                  styles.statusText,
                  m.status === 'DONE' && styles.statusDone
                ]}>
                  Status: {m.status === 'DONE' ? 'Finalizado' : 'Pendente'}
                </Text>
                {m.winner && (
                  <Text style={styles.winnerText}>
                    🏆 Vencedor: {tournament.participants.find(p => p.id === m.winner)?.name}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    padding: 16,
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  generateSection: {
    paddingVertical: 16,
  },
  participantCount: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 16,
  },
  generateButton: {
    backgroundColor: '#1E40AF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  generateButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  generateButtonPressed: {
    opacity: 0.8,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  generateButtonTextDisabled: {
    color: '#94A3B8',
  },
  errorText: {
    marginTop: 8,
    color: '#EF4444',
    fontSize: 14,
  },
  bracketSection: {
    gap: 12,
  },
  bracketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bracketTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  regenerateButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  regenerateButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  matchCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
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
  statusDone: {
    color: '#10B981',
  },
  winnerText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 4,
  },
});
