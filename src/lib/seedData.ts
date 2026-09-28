import { Match, MatchSettings, Player } from '@/types/dart';
import { createMatch, addThrow, confirmTurn } from '@/engine/game/gameEngine';
import { createThrow } from '@/engine/scoring/scoringEngine';

export const SEED_PLAYERS: Player[] = [
  {
    id: 'player_ajwad',
    name: 'Ajwad',
    nickname: 'The Architect',
    initials: 'AJ',
    avatarColor: '#10b981', // Emerald
    createdAt: Date.now() - 30 * 86400000,
  },
  {
    id: 'player_anissa',
    name: 'Anissa',
    nickname: 'Bullseye Queen',
    initials: 'AN',
    avatarColor: '#3b82f6', // Sapphire
    createdAt: Date.now() - 25 * 86400000,
  },
  {
    id: 'player_michael',
    name: 'Michael',
    nickname: 'Mighty Mike',
    initials: 'MV',
    avatarColor: '#f59e0b', // Amber
    createdAt: Date.now() - 20 * 86400000,
  },
  {
    id: 'player_luke',
    name: 'Luke',
    nickname: 'The Nuke',
    initials: 'LL',
    avatarColor: '#ec4899', // Pink
    createdAt: Date.now() - 15 * 86400000,
  },
];

export function createSampleCompletedMatch(): Match {
  const p1 = SEED_PLAYERS[0];
  const p2 = SEED_PLAYERS[1];

  const settings: MatchSettings = {
    startingScore: 501,
    inRule: 'straight_in',
    outRule: 'double_out',
    legsToWin: 3,
    format: 'legs_only',
    name: 'Club Championship Quarter-Final',
    venue: 'Oche Hall 1',
    date: '2026-09-24',
    preset: 'casual',
  };

  let match = createMatch([p1, p2], settings);
  match.startTime = new Date('2026-09-24T19:30:00Z').getTime();

  // Leg 1: Ajwad wins (180, 140, 141 checkout)
  // Turn 1 (Ajwad): 180
  match = addThrow(match, createThrow(20, 3));
  match = addThrow(match, createThrow(20, 3));
  match = addThrow(match, createThrow(20, 3));
  match = confirmTurn(match);

  // Turn 2 (Anissa): 100
  match = addThrow(match, createThrow(20, 1));
  match = addThrow(match, createThrow(20, 3));
  match = addThrow(match, createThrow(20, 1));
  match = confirmTurn(match);

  // Turn 3 (Ajwad): 140
  match = addThrow(match, createThrow(20, 3));
  match = addThrow(match, createThrow(20, 3));
  match = addThrow(match, createThrow(20, 1));
  match = confirmTurn(match);

  // Turn 4 (Anissa): 85
  match = addThrow(match, createThrow(15, 3));
  match = addThrow(match, createThrow(20, 1));
  match = addThrow(match, createThrow(20, 1));
  match = confirmTurn(match);

  // Turn 5 (Ajwad): 141 (T20, T19, D12) Checkout!
  match = addThrow(match, createThrow(20, 3));
  match = addThrow(match, createThrow(19, 3));
  match = addThrow(match, createThrow(12, 2));
  match = confirmTurn(match); // Leg 1 won by Ajwad (1 - 0)

  // Leg 2: Anissa wins on D16 (1 - 1)
  // Leg 3: Ajwad wins on D20 (2 - 1)
  // Leg 4: Anissa wins on D10 (2 - 2)
  // Leg 5: Ajwad wins on D16 (3 - 2)
  // Let's finalize the legs state cleanly
  match.players[0].legsWon = 3;
  match.players[1].legsWon = 2;
  match.status = 'completed';
  match.winnerPlayerId = p1.id;
  match.endTime = new Date('2026-09-24T20:15:00Z').getTime();

  return match;
}
