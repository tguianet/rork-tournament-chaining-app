export interface Participant {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  seed?: number;
}

export interface Match {
  id: string;
  tournamentId: string;
  round: number;
  position: number;
  participant1?: Participant;
  participant2?: Participant;
  winner?: Participant;
  score?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'walkover';
  scheduledDate?: Date;
  court?: string;
}

export interface Tournament {
  id: string;
  name: string;
  type: 'single_elimination' | 'double_elimination';
  size: 4 | 8 | 16 | 32 | 64;
  rules?: string;
  participants: Participant[];
  matches: Match[];
  status: 'setup' | 'seeding' | 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  language: 'pt' | 'en';
  hasCompletedOnboarding: boolean;
}