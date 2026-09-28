import { create } from 'zustand';
import {
  DartMultiplier,
  Match,
  MatchSettings,
  Player,
  PracticeSession,
  PracticeType,
  Throw,
  Tournament,
  TournamentMatchNode,
} from '@/types/dart';
import {
  addThrow,
  confirmTurn,
  createMatch,
  editTurnAndRecalculate,
  removeLastThrow,
  undoLastCompletedTurn,
} from '@/engine/game/gameEngine';
import { createThrow } from '@/engine/scoring/scoringEngine';
import { soundFX } from '@/lib/soundEffects';
import { storage } from '@/lib/storage';
import { SEED_PLAYERS, createSampleCompletedMatch } from '@/lib/seedData';
import { syncEngine } from '@/lib/supabase/sync';
import confetti from 'canvas-confetti';

export type ScreenView =
  | 'home'
  | 'match'
  | 'match_create'
  | 'match_summary'
  | 'players'
  | 'history'
  | 'practice'
  | 'tournament';

interface DartState {
  currentView: ScreenView;
  activeMatch: Match | null;
  matchHistory: Match[];
  players: Player[];
  activePractice: PracticeSession | null;
  tournaments: Tournament[];
  soundEnabled: boolean;
  voiceEnabled: boolean;
  selectedSummaryMatch: Match | null;
  selectedPlayerProfile: Player | null;
  cloudSyncStatus: 'idle' | 'synced' | 'syncing' | 'offline';
  cloudConfigured: boolean;

  // Actions
  setView: (view: ScreenView) => void;
  toggleSound: () => void;
  toggleVoice: () => void;
  setSelectedSummaryMatch: (m: Match | null) => void;
  setSelectedPlayerProfile: (p: Player | null) => void;
  triggerCloudSync: () => Promise<void>;

  // Initialization
  initStore: () => Promise<void>;

  // Match Flow
  startQuickMatch: () => void;
  createNewMatch: (selectedPlayers: Player[], settings: MatchSettings) => void;
  inputThrow: (value: number, multiplier: DartMultiplier) => void;
  undoLastDart: () => void;
  undoLastTurn: () => void;
  confirmActiveTurn: () => void;
  abandonMatch: () => void;
  editHistoricalTurn: (turnId: string, newDarts: Throw[]) => void;
  rematch: () => void;

  // Player Management
  createPlayer: (name: string, nickname?: string, avatarColor?: string) => Promise<void>;
  removePlayer: (id: string) => Promise<void>;

  // Practice Modes
  startPractice: (type: PracticeType, playerId: string, target?: number | string) => void;
  recordPracticeVisit: (darts: Throw[], success: boolean, points: number) => void;
  completePractice: () => void;

  // Tournament
  startTournament: (
    name: string,
    type: 'single_elimination' | 'round_robin',
    settings: MatchSettings,
    playerIds: string[]
  ) => void;
  playTournamentMatch: (matchNodeId: string) => void;
}

export const useDartStore = create<DartState>((set, get) => ({
  currentView: 'home',
  activeMatch: null,
  matchHistory: [],
  players: [],
  activePractice: null,
  tournaments: [],
  soundEnabled: true,
  voiceEnabled: false,
  selectedSummaryMatch: null,
  selectedPlayerProfile: null,
  cloudSyncStatus: 'idle',
  cloudConfigured: syncEngine.isAvailable(),

  setView: (view) => set({ currentView: view }),

  toggleSound: () => {
    const next = !get().soundEnabled;
    soundFX.enabled = next;
    set({ soundEnabled: next });
  },

  toggleVoice: () => {
    set((state) => ({ voiceEnabled: !state.voiceEnabled }));
  },

  setSelectedSummaryMatch: (match) => set({ selectedSummaryMatch: match }),
  setSelectedPlayerProfile: (player) => set({ selectedPlayerProfile: player }),

  triggerCloudSync: async () => {
    if (!syncEngine.isAvailable()) return;
    set({ cloudSyncStatus: 'syncing' });
    const res = await syncEngine.syncAll();
    if (res.synced) {
      const refreshedPlayers = await storage.getPlayers();
      const refreshedMatches = await storage.getMatchHistory();
      set({
        players: refreshedPlayers,
        matchHistory: refreshedMatches,
        cloudSyncStatus: 'synced',
      });
    } else {
      set({ cloudSyncStatus: 'offline' });
    }
  },

  initStore: async () => {
    try {
      let loadedPlayers = await storage.getPlayers();
      if (!loadedPlayers || loadedPlayers.length === 0) {
        // Seed default players
        for (const p of SEED_PLAYERS) {
          await storage.savePlayer(p);
        }
        loadedPlayers = SEED_PLAYERS;
      }

      let loadedHistory = await storage.getMatchHistory();
      if (!loadedHistory || loadedHistory.length === 0) {
        const sampleMatch = createSampleCompletedMatch();
        await storage.saveCompletedMatch(sampleMatch);
        loadedHistory = [sampleMatch];
      }

      const activeMatch = await storage.getActiveMatch();
      const tournaments = await storage.getTournaments();

      set({
        players: loadedPlayers,
        matchHistory: loadedHistory,
        activeMatch: activeMatch || null,
        tournaments: tournaments || [],
        cloudConfigured: syncEngine.isAvailable(),
      });

      // Background cloud sync if configured
      if (syncEngine.isAvailable()) {
        get().triggerCloudSync();
      }
    } catch {
      // Fallback in-memory
      set({
        players: SEED_PLAYERS,
        matchHistory: [createSampleCompletedMatch()],
      });
    }
  },

  startQuickMatch: () => {
    const { players } = get();
    const p1 = players[0] || SEED_PLAYERS[0];
    const p2 = players[1] || SEED_PLAYERS[1];

    const defaultSettings: MatchSettings = {
      startingScore: 501,
      inRule: 'straight_in',
      outRule: 'double_out',
      legsToWin: 3,
      format: 'legs_only',
      name: 'Quick Match',
      date: new Date().toISOString(),
      preset: 'casual',
    };

    const match = createMatch([p1, p2], defaultSettings);
    storage.saveActiveMatch(match);
    soundFX.playClick();

    set({
      activeMatch: match,
      currentView: 'match',
    });
  },

  createNewMatch: (selectedPlayers, settings) => {
    if (selectedPlayers.length === 0) return;
    const match = createMatch(selectedPlayers, settings);
    storage.saveActiveMatch(match);
    soundFX.playClick();

    set({
      activeMatch: match,
      currentView: 'match',
    });
  },

  inputThrow: (value, multiplier) => {
    const { activeMatch, soundEnabled } = get();
    if (!activeMatch || activeMatch.status === 'completed') return;

    const activePlayer = activeMatch.players[activeMatch.activePlayerIndex];
    const throwItem = createThrow(value, multiplier, activePlayer.player.id);

    // Audio cue
    if (soundEnabled) {
      soundFX.playDartHit(multiplier, value === 25 && multiplier === 2);
    }

    const updatedMatch = addThrow(activeMatch, throwItem);

    // Check if 3 darts reached or checkout hit
    const currentCount = updatedMatch.currentTurnDarts.length;
    set({ activeMatch: updatedMatch });
    storage.saveActiveMatch(updatedMatch);

    // If 3 darts were thrown, automatically check if we can suggest auto-confirm or let user review
  },

  undoLastDart: () => {
    const { activeMatch } = get();
    if (!activeMatch) return;

    if (activeMatch.currentTurnDarts.length > 0) {
      const updated = removeLastThrow(activeMatch);
      soundFX.playClick();
      set({ activeMatch: updated });
      storage.saveActiveMatch(updated);
    } else if (activeMatch.historyTimeline.length > 0) {
      const updated = undoLastCompletedTurn(activeMatch);
      soundFX.playClick();
      set({ activeMatch: updated });
      storage.saveActiveMatch(updated);
    }
  },

  undoLastTurn: () => {
    const { activeMatch } = get();
    if (!activeMatch || activeMatch.historyTimeline.length === 0) return;
    const updated = undoLastCompletedTurn(activeMatch);
    soundFX.playClick();
    set({ activeMatch: updated });
    storage.saveActiveMatch(updated);
  },

  confirmActiveTurn: () => {
    const { activeMatch } = get();
    if (!activeMatch || activeMatch.currentTurnDarts.length === 0) return;

    const previousLeg = activeMatch.currentLegNumber;
    const prevScore = activeMatch.players[activeMatch.activePlayerIndex].currentScore;

    const updated = confirmTurn(activeMatch);

    // Audio cues and effects
    const lastTurn = updated.historyTimeline[0];
    if (lastTurn) {
      if (lastTurn.isBust) {
        soundFX.playBust();
      } else if (lastTurn.status === 'checkout') {
        soundFX.playCheckout();
        // Subtle restrained celebration
        confetti({
          particleCount: 40,
          spread: 55,
          origin: { y: 0.6 },
          colors: ['#10b981', '#f59e0b', '#f8fafc'],
          disableForReducedMotion: true,
        });
      } else if (lastTurn.total === 180) {
        soundFX.play180();
      } else {
        soundFX.playClick();
      }
    }

    // Check if match completed
    if (updated.status === 'completed') {
      storage.clearActiveMatch();
      storage.saveCompletedMatch(updated);
      syncEngine.pushMatch(updated).catch(() => {});
      set((state) => ({
        activeMatch: updated,
        matchHistory: [updated, ...state.matchHistory],
        selectedSummaryMatch: updated,
        currentView: 'match_summary',
      }));
    } else {
      set({ activeMatch: updated });
      storage.saveActiveMatch(updated);
    }
  },

  abandonMatch: () => {
    storage.clearActiveMatch();
    set({ activeMatch: null, currentView: 'home' });
  },

  editHistoricalTurn: (turnId, newDarts) => {
    const { activeMatch } = get();
    if (!activeMatch) return;

    const recalculated = editTurnAndRecalculate(activeMatch, turnId, newDarts);
    set({ activeMatch: recalculated });
    storage.saveActiveMatch(recalculated);
  },

  rematch: () => {
    const { selectedSummaryMatch, activeMatch } = get();
    const targetMatch = selectedSummaryMatch || activeMatch;
    if (!targetMatch) return;

    const rawPlayers = targetMatch.players.map((p) => p.player);
    const newMatch = createMatch(rawPlayers, targetMatch.settings);
    storage.saveActiveMatch(newMatch);

    set({
      activeMatch: newMatch,
      currentView: 'match',
    });
  },

  createPlayer: async (name, nickname, avatarColor) => {
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
    const chosenColor = avatarColor || colors[Math.floor(Math.random() * colors.length)];

    const newPlayer: Player = {
      id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name,
      nickname,
      initials: initials || name.substring(0, 2).toUpperCase(),
      avatarColor: chosenColor,
      createdAt: Date.now(),
    };

    await storage.savePlayer(newPlayer);
    syncEngine.pushPlayer(newPlayer).catch(() => {});
    set((state) => ({
      players: [...state.players, newPlayer],
    }));
  },

  removePlayer: async (id) => {
    await storage.deletePlayer(id);
    set((state) => ({
      players: state.players.filter((p) => p.id !== id),
    }));
  },

  // Practice
  startPractice: (type, playerId, target) => {
    const titles: Record<PracticeType, string> = {
      scoring: 'Scoring Practice',
      checkout: 'Checkout Practice',
      doubles: 'Doubles Practice',
      trebles: 'Trebles Practice',
      challenge_100: '100 Dart Challenge',
      challenge_121: '121 Checkout Challenge',
      sprint_301: '301 Sprint',
      sprint_501: '501 Sprint',
    };

    let sessionTarget = target;
    if (type === 'checkout' && !sessionTarget) {
      // Pick random checkout between 41 and 120
      sessionTarget = Math.floor(Math.random() * (120 - 41 + 1)) + 41;
    } else if (type === 'doubles' && !sessionTarget) {
      sessionTarget = 'D20';
    } else if (type === 'trebles' && !sessionTarget) {
      sessionTarget = 'T20';
    }

    const session: PracticeSession = {
      id: `prac_${Date.now()}`,
      type,
      title: titles[type],
      playerId,
      target: sessionTarget,
      targetHistory: [],
      totalDarts: 0,
      totalPoints: 0,
      attempts: 0,
      successes: 0,
      startedAt: Date.now(),
    };

    set({ activePractice: session, currentView: 'practice' });
  },

  recordPracticeVisit: (darts, success, points) => {
    const { activePractice } = get();
    if (!activePractice) return;

    const newTargetHistory = [
      ...activePractice.targetHistory,
      {
        target: activePractice.target || '',
        darts,
        success,
        points,
      },
    ];

    let nextTarget = activePractice.target;
    if (activePractice.type === 'checkout') {
      // New random target
      nextTarget = Math.floor(Math.random() * (120 - 41 + 1)) + 41;
    } else if (activePractice.type === 'doubles') {
      // Step around the clock
      const current = typeof activePractice.target === 'string' ? activePractice.target : 'D20';
      const num = parseInt(current.replace('D', ''), 10);
      const nextNum = num === 1 ? 20 : num - 1;
      nextTarget = `D${nextNum}`;
    }

    const updated: PracticeSession = {
      ...activePractice,
      target: nextTarget,
      targetHistory: newTargetHistory,
      totalDarts: activePractice.totalDarts + darts.length,
      totalPoints: activePractice.totalPoints + points,
      attempts: activePractice.attempts + 1,
      successes: activePractice.successes + (success ? 1 : 0),
    };

    set({ activePractice: updated });
    storage.savePracticeSession(updated);
  },

  completePractice: () => {
    const { activePractice } = get();
    if (activePractice) {
      const finalized = { ...activePractice, completedAt: Date.now() };
      storage.savePracticeSession(finalized);
      syncEngine.pushPractice(finalized).catch(() => {});
    }
    set({ activePractice: null, currentView: 'home' });
  },

  // Tournaments
  startTournament: (name, type, settings, playerIds) => {
    // Generate bracket nodes
    const matches: TournamentMatchNode[] = [];
    const count = playerIds.length;

    if (type === 'single_elimination') {
      const rounds = Math.ceil(Math.log2(count));
      const totalMatches = Math.pow(2, rounds) - 1;

      // Round 1
      const r1Count = Math.floor(count / 2);
      for (let i = 0; i < r1Count; i++) {
        matches.push({
          id: `tmatch_1_${i}`,
          round: 1,
          matchIndex: i,
          player1Id: playerIds[i * 2] || null,
          player2Id: playerIds[i * 2 + 1] || null,
          winnerId: null,
          score1: 0,
          score2: 0,
          status: 'ready',
        });
      }

      // Next rounds
      for (let r = 2; r <= rounds; r++) {
        const roundMatches = Math.pow(2, rounds - r);
        for (let m = 0; m < roundMatches; m++) {
          matches.push({
            id: `tmatch_${r}_${m}`,
            round: r,
            matchIndex: m,
            player1Id: null,
            player2Id: null,
            winnerId: null,
            score1: 0,
            score2: 0,
            status: 'pending',
          });
        }
      }
    }

    const tourney: Tournament = {
      id: `tourney_${Date.now()}`,
      name,
      type,
      settings,
      playerIds,
      matches,
      status: 'active',
      winnerPlayerId: null,
      createdAt: Date.now(),
    };

    storage.saveTournament(tourney);
    syncEngine.pushTournament(tourney).catch(() => {});
    set((state) => ({
      tournaments: [tourney, ...state.tournaments],
      currentView: 'tournament',
    }));
  },

  playTournamentMatch: (matchNodeId) => {
    const { tournaments, players } = get();
    const currentTourney = tournaments[0];
    if (!currentTourney) return;

    const node = currentTourney.matches.find((m) => m.id === matchNodeId);
    if (!node || !node.player1Id || !node.player2Id) return;

    const p1 = players.find((p) => p.id === node.player1Id);
    const p2 = players.find((p) => p.id === node.player2Id);
    if (!p1 || !p2) return;

    const match = createMatch([p1, p2], currentTourney.settings);
    storage.saveActiveMatch(match);
    set({
      activeMatch: match,
      currentView: 'match',
    });
  },
}));
