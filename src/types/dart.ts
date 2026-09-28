export type DartMultiplier = 0 | 1 | 2 | 3;

export type InRule = 'straight_in' | 'double_in';
export type OutRule = 'straight_out' | 'double_out' | 'master_out';

export type GameType = 301 | 501 | 701;

export interface Throw {
  id: string;
  playerId: string;
  value: number; // 0 for miss, 1-20 for numbers, 25 for outer bull, 50 for inner bull
  multiplier: DartMultiplier; // 0 for miss, 1 single, 2 double, 3 triple
  score: number; // calculated: value * (value === 25 ? 1 : multiplier) or 50
  label: string; // e.g., 'T20', 'D16', 'BULL', '25', 'MISS', '20'
  timestamp: number;
}

export type TurnStatus = 'in_progress' | 'completed' | 'bust' | 'checkout';

export interface Turn {
  id: string;
  playerId: string;
  darts: Throw[];
  total: number;
  scoreBefore: number;
  scoreAfter: number;
  status: TurnStatus;
  isBust: boolean;
  bustReason?: string;
  checkoutDartIndex?: number; // 0, 1, or 2 if checkout occurred in this visit
  timestamp: number;
}

export interface Player {
  id: string;
  name: string;
  nickname?: string;
  initials: string;
  avatarColor: string;
  createdAt: number;
}

export interface PlayerStats {
  playerId: string;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  legsPlayed: number;
  legsWon: number;
  totalDartsThrown: number;
  totalPointsScored: number;
  overallAverage: number;
  first9Average: number;
  highestCheckout: number;
  checkoutAttempts: number;
  checkoutHits: number;
  checkoutPercentage: number;
  count180: number;
  count140Plus: number;
  count100Plus: number;
  count60Plus: number;
  bestLegDarts: number | null; // e.g. 9, 12, 15
  bestMatchAverage: number | null;
}

export interface MatchSettings {
  startingScore: GameType;
  inRule: InRule;
  outRule: OutRule;
  legsToWin: number; // in simple leg mode
  setsToWin?: number; // in sets mode
  legsPerSet?: number; // usually 3 (best of 5 legs per set)
  format: 'legs_only' | 'sets_and_legs';
  name?: string;
  venue?: string;
  date: string;
  preset?: 'casual' | 'standard' | 'tournament' | 'advanced';
}

export interface MatchPlayer {
  player: Player;
  currentScore: number;
  legsWon: number;
  setsWon: number;
  dartsThrownInLeg: number;
  totalDartsThrown: number;
  totalPointsScored: number;
  turns: Turn[];
  first9Points: number;
  first9Darts: number;
  checkoutAttempts: number;
  checkoutHits: number;
  highestTurn: number;
  highestCheckout: number;
  count180: number;
  count140Plus: number;
  count100Plus: number;
  count60Plus: number;
  inRuleSatisfied: boolean; // for double-in
}

export interface Leg {
  legNumber: number;
  setNumber: number;
  winnerPlayerId: string | null;
  startingPlayerId: string;
  dartsThrown: Record<string, number>;
  winningCheckout?: {
    playerId: string;
    score: number;
    dartsUsed: number;
    checkoutLabel: string;
  };
}

export interface SetGame {
  setNumber: number;
  winnerPlayerId: string | null;
  legs: Leg[];
}

export type MatchStatus = 'not_started' | 'live' | 'paused' | 'completed';

export interface Match {
  id: string;
  settings: MatchSettings;
  players: MatchPlayer[];
  activePlayerIndex: number;
  currentTurnDarts: Throw[];
  currentLegNumber: number;
  currentSetNumber: number;
  legs: Leg[];
  sets: SetGame[];
  status: MatchStatus;
  winnerPlayerId: string | null;
  startTime: number;
  endTime?: number;
  historyTimeline: Turn[];
}

export interface CheckoutRoute {
  target: number;
  dartsNeeded: number;
  primary: string[]; // e.g. ['T20', 'T11', 'BULL']
  alternatives?: string[][];
  description?: string;
}

// Tournament
export type TournamentType = 'single_elimination' | 'round_robin';

export interface TournamentMatchNode {
  id: string;
  round: number; // 1, 2, 3...
  matchIndex: number;
  player1Id: string | null;
  player2Id: string | null;
  winnerId: string | null;
  score1: number;
  score2: number;
  matchId?: string; // linked match ID
  status: 'pending' | 'ready' | 'in_progress' | 'completed';
  nextMatchId?: string;
}

export interface Tournament {
  id: string;
  name: string;
  type: TournamentType;
  settings: MatchSettings;
  playerIds: string[];
  matches: TournamentMatchNode[];
  status: 'setup' | 'active' | 'completed';
  winnerPlayerId: string | null;
  createdAt: number;
}

// Practice Mode
export type PracticeType =
  | 'scoring'
  | 'checkout'
  | 'doubles'
  | 'trebles'
  | 'challenge_100'
  | 'challenge_121'
  | 'sprint_301'
  | 'sprint_501';

export interface PracticeSession {
  id: string;
  type: PracticeType;
  title: string;
  playerId: string;
  target?: number | string; // e.g. 87 or 'D20'
  targetHistory: {
    target: number | string;
    darts: Throw[];
    success: boolean;
    points: number;
  }[];
  totalDarts: number;
  totalPoints: number;
  attempts: number;
  successes: number;
  startedAt: number;
  completedAt?: number;
}
