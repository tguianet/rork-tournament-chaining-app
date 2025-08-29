// app/tournament/[id]/bracket.tsx
import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
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
      <View style={{ padding: 16 }}>
        <Text>Carregando torneio…</Text>
      </View>
    );
  }

  const canShowBracket = !!tournament.bracket?.matches?.length;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>
        {tournament.name}
      </Text>

      {!canShowBracket && (
        <View style={{ paddingVertical: 8 }}>
          <Text style={{ marginBottom: 8 }}>
            Participantes: {tournament.participants?.length ?? 0}
          </Text>
          <Pressable
            onPress={onGenerate}
            disabled={(tournament.participants?.length ?? 0) < 2}
            style={({ pressed }) => ({
              backgroundColor: (tournament.participants?.length ?? 0) < 2 ? '#ccc' : '#1e40af',
              padding: 12,
              borderRadius: 10,
              opacity: pressed ? 0.8 : 1
            })}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
              Gerar chaveamento
            </Text>
          </Pressable>
          {(tournament.participants?.length ?? 0) < 2 && (
            <Text style={{ marginTop: 6, color: '#8b0000' }}>
              Adicione pelo menos 2 participantes.
            </Text>
          )}
        </View>
      )}

      {canShowBracket && (
        <View style={{ gap: 8 }}>
          <Text style={{ fontWeight: '600' }}>Chaveamento</Text>
          {tournament.bracket!.matches.map((m, idx) => (
            <View key={m.id} style={{
              borderWidth: 1, borderColor: '#e5e7eb',
              borderRadius: 10, padding: 10
            }}>
              <Text style={{ fontWeight: '600' }}>Jogo {idx + 1} — R{m.round}</Text>
              <Text>A: {m.playerA ?? 'BYE'}</Text>
              <Text>B: {m.playerB ?? 'BYE'}</Text>
              <Text>Status: {m.status}</Text>
              {m.nextMatchId && <Text>→ Próxima: {m.nextMatchId} ({m.slotInNext})</Text>}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
