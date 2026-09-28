import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Match, Player, PracticeSession, Tournament } from '@/types/dart';

interface DartlogDB extends DBSchema {
  players: {
    key: string;
    value: Player;
  };
  matches: {
    key: string;
    value: Match;
    indexes: { 'by-date': number };
  };
  activeMatch: {
    key: string;
    value: Match;
  };
  tournaments: {
    key: string;
    value: Tournament;
  };
  practiceSessions: {
    key: string;
    value: PracticeSession;
    indexes: { 'by-player': string };
  };
  settings: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'dartlog_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<DartlogDB>> | null = null;

function getDB() {
  if (typeof window === 'undefined') return null;
  if (!dbPromise) {
    dbPromise = openDB<DartlogDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('players')) {
          db.createObjectStore('players', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('matches')) {
          const matchStore = db.createObjectStore('matches', { keyPath: 'id' });
          matchStore.createIndex('by-date', 'startTime');
        }
        if (!db.objectStoreNames.contains('activeMatch')) {
          db.createObjectStore('activeMatch', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('tournaments')) {
          db.createObjectStore('tournaments', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('practiceSessions')) {
          const practiceStore = db.createObjectStore('practiceSessions', { keyPath: 'id' });
          practiceStore.createIndex('by-player', 'playerId');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      },
    });
  }
  return dbPromise;
}

// Storage API
export const storage = {
  // Players
  async savePlayer(player: Player): Promise<void> {
    const db = await getDB();
    if (!db) return;
    await db.put('players', player);
  },

  async getPlayers(): Promise<Player[]> {
    const db = await getDB();
    if (!db) return [];
    return await db.getAll('players');
  },

  async deletePlayer(id: string): Promise<void> {
    const db = await getDB();
    if (!db) return;
    await db.delete('players', id);
  },

  // Active Match
  async saveActiveMatch(match: Match): Promise<void> {
    const db = await getDB();
    if (!db) return;
    await db.put('activeMatch', match);
  },

  async getActiveMatch(): Promise<Match | null> {
    const db = await getDB();
    if (!db) return null;
    const all = await db.getAll('activeMatch');
    return all.length > 0 ? all[0] : null;
  },

  async clearActiveMatch(): Promise<void> {
    const db = await getDB();
    if (!db) return;
    await db.clear('activeMatch');
  },

  // Completed Matches History
  async saveCompletedMatch(match: Match): Promise<void> {
    const db = await getDB();
    if (!db) return;
    await db.put('matches', match);
  },

  async getMatchHistory(): Promise<Match[]> {
    const db = await getDB();
    if (!db) return [];
    const matches = await db.getAllFromIndex('matches', 'by-date');
    return matches.reverse(); // newest first
  },

  // Practice Sessions
  async savePracticeSession(session: PracticeSession): Promise<void> {
    const db = await getDB();
    if (!db) return;
    await db.put('practiceSessions', session);
  },

  async getPracticeSessions(playerId?: string): Promise<PracticeSession[]> {
    const db = await getDB();
    if (!db) return [];
    if (playerId) {
      return await db.getAllFromIndex('practiceSessions', 'by-player', playerId);
    }
    return await db.getAll('practiceSessions');
  },

  // Tournaments
  async saveTournament(tournament: Tournament): Promise<void> {
    const db = await getDB();
    if (!db) return;
    await db.put('tournaments', tournament);
  },

  async getTournaments(): Promise<Tournament[]> {
    const db = await getDB();
    if (!db) return [];
    return await db.getAll('tournaments');
  },
};
