import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { Tournament, Participant, Match, AppSettings } from '@/types/tournament';

interface TournamentStore {
  tournaments: Tournament[];
  settings: AppSettings;
  isLoading: boolean;
  
  // Tournament actions
  addTournament: (tournament: Omit<Tournament, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTournament: (id: string, updates: Partial<Tournament>) => void;
  deleteTournament: (id: string) => void;
  getTournament: (id: string) => Tournament | undefined;
  
  // Participant actions
  addParticipant: (tournamentId: string, participant: Omit<Participant, 'id'>) => void;
  updateParticipant: (tournamentId: string, participantId: string, updates: Partial<Participant>) => void;
  removeParticipant: (tournamentId: string, participantId: string) => void;
  
  // Match actions
  updateMatch: (tournamentId: string, matchId: string, updates: Partial<Match>) => void;
  generateBracket: (tournamentId: string, forceReset?: boolean) => void;
  advanceWinners: (tournamentId: string) => void;
  
  // Settings actions
  updateSettings: (updates: Partial<AppSettings>) => void;
  
  // Persistence
  loadData: () => Promise<void>;
  saveData: () => Promise<void>;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const createMatches = (participants: Participant[], tournamentId: string, size: number): Match[] => {
  const matches: Match[] = [];
  const rounds = Math.log2(size);
  
  // Create a copy of participants and fill with byes if needed
  const bracketParticipants: (Participant | null)[] = [...participants];
  while (bracketParticipants.length < size) {
    bracketParticipants.push(null); // null represents a "bye"
  }
  
  // First round matches
  for (let i = 0; i < size / 2; i++) {
    const participant1 = bracketParticipants[i * 2];
    const participant2 = bracketParticipants[i * 2 + 1];
    
    const match: Match = {
      id: generateId(),
      tournamentId,
      round: 1,
      position: i,
      participant1: participant1 || undefined,
      participant2: participant2 || undefined,
      status: 'pending'
    };
    
    // If one participant is null (bye), automatically advance the other
    if (!participant1 && participant2) {
      match.winner = participant2;
      match.status = 'completed';
    } else if (participant1 && !participant2) {
      match.winner = participant1;
      match.status = 'completed';
    }
    
    matches.push(match);
  }
  
  // Create subsequent rounds
  for (let round = 2; round <= rounds; round++) {
    const matchesInRound = Math.pow(2, rounds - round);
    
    for (let i = 0; i < matchesInRound; i++) {
      const nextMatch: Match = {
        id: generateId(),
        tournamentId,
        round,
        position: i,
        status: 'pending'
      };
      
      matches.push(nextMatch);
    }
  }
  
  // Auto-advance BYE winners to next round
  advanceBYEWinners(matches);
  
  return matches;
};

const advanceBYEWinners = (matches: Match[]) => {
  const rounds = Math.max(...matches.map(m => m.round));
  
  for (let round = 1; round < rounds; round++) {
    const currentRoundMatches = matches.filter(m => m.round === round && m.status === 'completed' && m.winner);
    const nextRoundMatches = matches.filter(m => m.round === round + 1);
    
    currentRoundMatches.forEach((match, index) => {
      const nextMatchIndex = Math.floor(index / 2);
      const nextMatch = nextRoundMatches[nextMatchIndex];
      
      if (nextMatch && match.winner) {
        const isFirstParticipant = index % 2 === 0;
        if (isFirstParticipant) {
          nextMatch.participant1 = match.winner;
        } else {
          nextMatch.participant2 = match.winner;
        }
        
        // If next match now has only one participant (other is BYE), auto-advance
        if (nextMatch.participant1 && !nextMatch.participant2) {
          nextMatch.winner = nextMatch.participant1;
          nextMatch.status = 'completed';
        } else if (!nextMatch.participant1 && nextMatch.participant2) {
          nextMatch.winner = nextMatch.participant2;
          nextMatch.status = 'completed';
        }
      }
    });
  }
};

export const useTournamentStore = create<TournamentStore>((set, get) => ({
  tournaments: [],
  settings: {
    theme: 'light',
    language: 'pt',
    hasCompletedOnboarding: false
  },
  isLoading: false,
  
  addTournament: (tournamentData) => {
    const tournament: Tournament = {
      ...tournamentData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    set((state) => ({
      tournaments: [...state.tournaments, tournament]
    }));
    get().saveData();
  },
  
  updateTournament: (id, updates) => {
    set((state) => ({
      tournaments: state.tournaments.map(t => 
        t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
      )
    }));
    get().saveData();
  },
  
  deleteTournament: (id) => {
    set((state) => ({
      tournaments: state.tournaments.filter(t => t.id !== id)
    }));
    get().saveData();
  },
  
  getTournament: (id) => {
    return get().tournaments.find(t => t.id === id);
  },
  
  addParticipant: (tournamentId, participantData) => {
    const participant: Participant = {
      ...participantData,
      id: generateId()
    };
    
    set((state) => ({
      tournaments: state.tournaments.map(t => 
        t.id === tournamentId 
          ? { ...t, participants: [...t.participants, participant], updatedAt: new Date() }
          : t
      )
    }));
    get().saveData();
  },
  
  updateParticipant: (tournamentId, participantId, updates) => {
    set((state) => ({
      tournaments: state.tournaments.map(t => 
        t.id === tournamentId 
          ? {
              ...t,
              participants: t.participants.map(p => 
                p.id === participantId ? { ...p, ...updates } : p
              ),
              updatedAt: new Date()
            }
          : t
      )
    }));
    get().saveData();
  },
  
  removeParticipant: (tournamentId, participantId) => {
    set((state) => ({
      tournaments: state.tournaments.map(t => 
        t.id === tournamentId 
          ? {
              ...t,
              participants: t.participants.filter(p => p.id !== participantId),
              updatedAt: new Date()
            }
          : t
      )
    }));
    get().saveData();
  },
  
  updateMatch: (tournamentId, matchId, updates) => {
    set((state) => ({
      tournaments: state.tournaments.map(t => 
        t.id === tournamentId 
          ? {
              ...t,
              matches: t.matches.map(m => 
                m.id === matchId ? { ...m, ...updates } : m
              ),
              updatedAt: new Date()
            }
          : t
      )
    }));
    get().saveData();
    
    // Auto-advance winners to next round
    if (updates.status === 'completed' && updates.winner) {
      get().advanceWinners(tournamentId);
    }
  },
  
  advanceWinners: (tournamentId) => {
    const tournament = get().getTournament(tournamentId);
    if (!tournament) return;
    
    const matches = [...tournament.matches];
    const rounds = Math.max(...matches.map(m => m.round));
    
    // Process each round to advance winners
    for (let round = 1; round < rounds; round++) {
      const currentRoundMatches = matches.filter(m => m.round === round && m.status === 'completed' && m.winner);
      const nextRoundMatches = matches.filter(m => m.round === round + 1);
      
      currentRoundMatches.forEach((match, index) => {
        const nextMatchIndex = Math.floor(index / 2);
        const nextMatch = nextRoundMatches[nextMatchIndex];
        
        if (nextMatch && match.winner) {
          const isFirstParticipant = index % 2 === 0;
          if (isFirstParticipant) {
            nextMatch.participant1 = match.winner;
          } else {
            nextMatch.participant2 = match.winner;
          }
        }
      });
    }
    
    set((state) => ({
      tournaments: state.tournaments.map(t => 
        t.id === tournamentId 
          ? { ...t, matches, updatedAt: new Date() }
          : t
      )
    }));
    get().saveData();
  },
  
  generateBracket: (tournamentId, forceReset = false) => {
    console.log('[STORE] generateBracket called with tournamentId:', tournamentId, 'forceReset:', forceReset);
    
    // Normalize tournamentId if it comes as array
    const normalizedId = Array.isArray(tournamentId) ? tournamentId[0] : tournamentId;
    if (!normalizedId) {
      console.log('[STORE] Invalid tournament ID');
      return;
    }
    
    const state = get();
    const tournament = state.tournaments.find(t => t.id === normalizedId);
    if (!tournament) {
      console.log('[STORE] Tournament not found!');
      return;
    }
    
    console.log('[STORE] Tournament found:', tournament.name);
    console.log('[STORE] Participants:', tournament.participants.length);
    console.log('[STORE] Tournament size:', tournament.size);
    console.log('[STORE] Existing matches:', tournament.matches.length);
    
    // Check if bracket already exists and not forcing reset
    if (tournament.matches.length > 0 && !forceReset) {
      console.log('[STORE] Bracket already exists. Use forceReset=true to regenerate.');
      return;
    }
    
    // Validate minimum participants
    if (tournament.participants.length < 2) {
      console.log('[STORE] Not enough participants to generate bracket');
      throw new Error('É necessário pelo menos 2 participantes para gerar o chaveamento');
    }
    
    // Generate matches
    const matches = createMatches(tournament.participants, normalizedId, tournament.size);
    console.log('[STORE] Generated matches:', matches.length);
    console.log('[STORE] Matches details:', matches.map(m => ({ 
      id: m.id,
      round: m.round, 
      p1: m.participant1?.name || 'BYE', 
      p2: m.participant2?.name || 'BYE', 
      status: m.status,
      winner: m.winner?.name
    })));
    
    // Update tournament with immutable state change
    set((state) => ({
      tournaments: state.tournaments.map(t => 
        t.id === normalizedId 
          ? { 
              ...t, 
              matches: [...matches], // Create new matches array
              status: 'in_progress' as const, 
              updatedAt: new Date() 
            }
          : t
      )
    }));
    
    console.log('[STORE] State updated, saving data...');
    
    // Save to AsyncStorage and verify
    get().saveData().then(() => {
      console.log('[STORE] Data saved successfully');
      
      // Verify the update
      const updatedTournament = get().tournaments.find(t => t.id === normalizedId);
      console.log('[STORE] Final verification - tournament matches count:', updatedTournament?.matches.length);
      console.log('[STORE] Tournament status:', updatedTournament?.status);
    }).catch((error) => {
      console.error('[STORE] Error saving data:', error);
    });
  },
  
  updateSettings: (updates) => {
    set((state) => ({
      settings: { ...state.settings, ...updates }
    }));
    get().saveData();
  },
  
  loadData: async () => {
    set({ isLoading: true });
    try {
      const [tournamentsData, settingsData] = await Promise.all([
        AsyncStorage.getItem('tournaments'),
        AsyncStorage.getItem('settings')
      ]);
      
      // Safely parse data, handling null values
      let tournaments = [];
      let settings = {
        theme: 'light' as const,
        language: 'pt' as const,
        hasCompletedOnboarding: false
      };
      
      if (tournamentsData && tournamentsData !== 'null') {
        try {
          const parsed = JSON.parse(tournamentsData);
          tournaments = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          console.error('Error parsing tournaments data:', e);
          tournaments = [];
        }
      }
      
      if (settingsData && settingsData !== 'null') {
        try {
          const parsed = JSON.parse(settingsData);
          settings = { ...settings, ...parsed };
        } catch (e) {
          console.error('Error parsing settings data:', e);
        }
      }
      
      set({ tournaments, settings });
    } catch (error) {
      console.error('Error loading data:', error);
      // Set default values on error
      set({ 
        tournaments: [], 
        settings: {
          theme: 'light',
          language: 'pt',
          hasCompletedOnboarding: false
        }
      });
    } finally {
      set({ isLoading: false });
    }
  },
  
  saveData: async () => {
    try {
      const { tournaments, settings } = get();
      await Promise.all([
        AsyncStorage.setItem('tournaments', JSON.stringify(tournaments)),
        AsyncStorage.setItem('settings', JSON.stringify(settings))
      ]);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }
}));