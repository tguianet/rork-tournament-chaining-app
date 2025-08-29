// stores/tournament-store.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

type PID = string;
type MID = string;

export type Match = {
  id: MID;
  round: number;
  bracket: 'MAIN';
  playerA?: PID;
  playerB?: PID;
  winner?: PID;
  status: 'PENDING' | 'DONE';
  nextMatchId?: MID;
  slotInNext?: 'A' | 'B';
};

export type Participant = { id: PID; name: string };

export type Tournament = {
  id: string;
  name: string;
  participants: Participant[];
  bracket?: { status: 'nao_gerado' | 'gerado'; matches: Match[] };
};

type State = {
  tournaments: Tournament[];
  loadData: () => Promise<void>;
  saveData: () => Promise<void>;
  addParticipant: (tournamentId: string, p: Participant) => Promise<void>;
  generateBracket: (tournamentId: string, opts?: { forceReset?: boolean }) => Promise<void>;
};

const nextPow2 = (n: number) => { let p = 1; while (p < n) p <<= 1; return p; };

function generateSingleElimBracket(players: PID[]): Match[] {
  if (!Array.isArray(players) || players.length < 2) {
    throw new Error('Adicione pelo menos 2 participantes');
  }

  const size = nextPow2(players.length);
  const seeds: (PID | null)[] = [...players, ...Array(size - players.length).fill(null)];

  const all: Match[] = [];
  let round = 1;
  let current: MID[] = [];

  // Round 1
  for (let i = 0; i < size; i += 2) {
    const id = crypto.randomUUID();
    all.push({
      id, round, bracket: 'MAIN',
      playerA: seeds[i] ?? undefined,
      playerB: seeds[i + 1] ?? undefined,
      status: 'PENDING'
    });
    current.push(id);
  }

  // Rounds seguintes
  while (current.length > 1) {
    round++;
    const next: MID[] = [];
    for (let i = 0; i < current.length; i += 2) {
      const id = crypto.randomUUID();
      all.push({ id, round, bracket: 'MAIN', status: 'PENDING' });

      const left = all.find(m => m.id === current[i])!;
      const right = all.find(m => m.id === current[i + 1])!;
      left.nextMatchId = id; left.slotInNext = 'A';
      right.nextMatchId = id; right.slotInNext = 'B';

      next.push(id);
    }
    current = next;
  }

  // Avanço automático de BYE
  for (const m of all) {
    const hasA = !!m.playerA;
    const hasB = !!m.playerB;
    if ((hasA && !hasB) || (!hasA && hasB)) {
      m.status = 'DONE';
      m.winner = (m.playerA ?? m.playerB)!;
      if (m.nextMatchId) {
        const nxt = all.find(x => x.id === m.nextMatchId)!;
        if (m.slotInNext === 'A') nxt.playerA = m.winner; else nxt.playerB = m.winner;
      }
    }
  }

  return all;
}

export const useTournamentStore = create<State>((set, get) => ({
  tournaments: [],

  loadData: async () => {
    try {
      const raw = await AsyncStorage.getItem('tournaments');
      const parsed = raw && raw !== 'null' ? JSON.parse(raw) : [];
      const list: Tournament[] = Array.isArray(parsed) ? parsed : [];
      set({ tournaments: list });
      console.log('[STORE] load ok', { count: list.length });
    } catch (e) {
      console.error('[STORE] load error', e);
      set({ tournaments: [] });
    }
  },

  saveData: async () => {
    try {
      const state = get();
      await AsyncStorage.setItem('tournaments', JSON.stringify(state.tournaments));
      console.log('[STORE] persist ok');
    } catch (e) {
      console.error('[STORE] persist error', e);
    }
  },

  addParticipant: async (tournamentId, p) => {
    const { tournaments } = get();
    const next = tournaments.map(t =>
      t.id === tournamentId
        ? { ...t, participants: [...(t.participants ?? []), p] }
        : t
    );
    set({ tournaments: next });
    await get().saveData();
  },

  generateBracket: async (tournamentId, opts) => {
    console.log('[STORE] generateBracket:start', { tournamentId, opts });
    const state = get();
    const t = state.tournaments.find(x => x.id === tournamentId);
    if (!t) throw new Error('Torneio não encontrado');

    const force = !!opts?.forceReset;
    if (t.bracket?.status === 'gerado' && !force) {
      console.log('[STORE] já gerado, abort');
      return;
    }

    const players = t.participants ?? [];
    const matches = generateSingleElimBracket(players.map(p => p.id));
    console.log('[STORE] matches gerados', matches.length);

    const next = state.tournaments.map(x =>
      x.id === tournamentId
        ? { ...x, bracket: { status: 'gerado', matches: [...matches] } }
        : x
    );
    set({ tournaments: next });
    await get().saveData();

    const after = get().tournaments.find(x => x.id === tournamentId);
    console.log('[STORE] after', {
      status: after?.bracket?.status,
      matches: after?.bracket?.matches?.length
    });
  },
}));
