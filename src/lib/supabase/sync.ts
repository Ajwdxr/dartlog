import { Match, Player, PracticeSession, Tournament } from '@/types/dart';
import { supabase, isSupabaseConfigured } from './client';
import { storage } from '../storage';

export const syncEngine = {
  isAvailable(): boolean {
    return isSupabaseConfigured() && supabase !== null;
  },

  // Push single player to Supabase
  async pushPlayer(player: Player): Promise<boolean> {
    if (!this.isAvailable() || !supabase) return false;
    try {
      const { error } = await supabase.from('players').upsert({
        id: player.id,
        name: player.name,
        nickname: player.nickname || null,
        initials: player.initials,
        avatar_color: player.avatarColor,
        created_at: player.createdAt,
      });
      return !error;
    } catch {
      return false;
    }
  },

  // Push completed match to Supabase
  async pushMatch(match: Match): Promise<boolean> {
    if (!this.isAvailable() || !supabase) return false;
    try {
      const { error } = await supabase.from('matches').upsert({
        id: match.id,
        settings: match.settings,
        players: match.players,
        legs: match.legs,
        sets: match.sets,
        history_timeline: match.historyTimeline,
        status: match.status,
        winner_player_id: match.winnerPlayerId,
        start_time: match.startTime,
        end_time: match.endTime || null,
      });
      return !error;
    } catch {
      return false;
    }
  },

  // Push practice session
  async pushPractice(session: PracticeSession): Promise<boolean> {
    if (!this.isAvailable() || !supabase) return false;
    try {
      const { error } = await supabase.from('practice_sessions').upsert({
        id: session.id,
        type: session.type,
        title: session.title,
        player_id: session.playerId,
        target: session.target ? String(session.target) : null,
        target_history: session.targetHistory,
        total_darts: session.totalDarts,
        total_points: session.totalPoints,
        attempts: session.attempts,
        successes: session.successes,
        started_at: session.startedAt,
        completed_at: session.completedAt || null,
      });
      return !error;
    } catch {
      return false;
    }
  },

  // Push tournament
  async pushTournament(tournament: Tournament): Promise<boolean> {
    if (!this.isAvailable() || !supabase) return false;
    try {
      const { error } = await supabase.from('tournaments').upsert({
        id: tournament.id,
        name: tournament.name,
        type: tournament.type,
        settings: tournament.settings,
        player_ids: tournament.playerIds,
        matches: tournament.matches,
        status: tournament.status,
        winner_player_id: tournament.winnerPlayerId,
        created_at: tournament.createdAt,
      });
      return !error;
    } catch {
      return false;
    }
  },

  // Full synchronization on app launch (Cloud <-> Local)
  async syncAll(): Promise<{ synced: boolean; message: string }> {
    if (!this.isAvailable() || !supabase) {
      return { synced: false, message: 'Supabase credentials not configured. Running offline locally.' };
    }

    try {
      // 1. Pull Players
      const { data: cloudPlayers } = await supabase.from('players').select('*');
      if (cloudPlayers && cloudPlayers.length > 0) {
        for (const cp of cloudPlayers) {
          await storage.savePlayer({
            id: cp.id,
            name: cp.name,
            nickname: cp.nickname || undefined,
            initials: cp.initials,
            avatarColor: cp.avatar_color,
            createdAt: Number(cp.created_at),
          });
        }
      } else {
        // Push local players to cloud
        const localPlayers = await storage.getPlayers();
        for (const lp of localPlayers) {
          await this.pushPlayer(lp);
        }
      }

      // 2. Pull Matches
      const { data: cloudMatches } = await supabase
        .from('matches')
        .select('*')
        .order('start_time', { ascending: false });

      if (cloudMatches && cloudMatches.length > 0) {
        for (const cm of cloudMatches) {
          await storage.saveCompletedMatch({
            id: cm.id,
            settings: cm.settings,
            players: cm.players,
            activePlayerIndex: 0,
            currentTurnDarts: [],
            currentLegNumber: cm.legs?.length || 1,
            currentSetNumber: cm.sets?.length || 1,
            legs: cm.legs || [],
            sets: cm.sets || [],
            status: cm.status,
            winnerPlayerId: cm.winner_player_id,
            startTime: Number(cm.start_time),
            endTime: cm.end_time ? Number(cm.end_time) : undefined,
            historyTimeline: cm.history_timeline || [],
          });
        }
      } else {
        // Push local matches
        const localMatches = await storage.getMatchHistory();
        for (const lm of localMatches) {
          await this.pushMatch(lm);
        }
      }

      return { synced: true, message: 'Cloud sync complete' };
    } catch (err: any) {
      return { synced: false, message: err?.message || 'Sync error' };
    }
  },
};
