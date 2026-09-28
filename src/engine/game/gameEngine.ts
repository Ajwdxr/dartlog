import {
  GameType,
  Leg,
  Match,
  MatchPlayer,
  MatchSettings,
  Player,
  SetGame,
  Throw,
  Turn,
} from '@/types/dart';
import { calculateVisit, createThrow, validateDart } from '../scoring/scoringEngine';
import { isCheckoutAttempt } from '../statistics/statisticsEngine';

export function createMatch(players: Player[], settings: MatchSettings): Match {
  if (players.length === 0) {
    throw new Error('At least 1 player is required to create a match');
  }

  const matchPlayers: MatchPlayer[] = players.map((p) => ({
    player: p,
    currentScore: settings.startingScore,
    legsWon: 0,
    setsWon: 0,
    dartsThrownInLeg: 0,
    totalDartsThrown: 0,
    totalPointsScored: 0,
    turns: [],
    first9Points: 0,
    first9Darts: 0,
    checkoutAttempts: 0,
    checkoutHits: 0,
    highestTurn: 0,
    highestCheckout: 0,
    count180: 0,
    count140Plus: 0,
    count100Plus: 0,
    count60Plus: 0,
    inRuleSatisfied: settings.inRule === 'straight_in',
  }));

  return {
    id: `match_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    settings,
    players: matchPlayers,
    activePlayerIndex: 0,
    currentTurnDarts: [],
    currentLegNumber: 1,
    currentSetNumber: 1,
    legs: [],
    sets: [],
    status: 'live',
    winnerPlayerId: null,
    startTime: Date.now(),
    historyTimeline: [],
  };
}

/**
 * Adds a throw to the active player's current turn
 */
export function addThrow(match: Match, throwItem: Throw): Match {
  if (match.status === 'completed') return match;

  const activePlayer = match.players[match.activePlayerIndex];
  if (!activePlayer) return match;

  // Max 3 darts per turn
  if (match.currentTurnDarts.length >= 3) return match;

  const updatedDarts = [...match.currentTurnDarts, { ...throwItem, playerId: activePlayer.player.id }];

  return {
    ...match,
    currentTurnDarts: updatedDarts,
  };
}

/**
 * Removes the most recent throw in the active turn
 */
export function removeLastThrow(match: Match): Match {
  if (match.currentTurnDarts.length === 0) return match;

  return {
    ...match,
    currentTurnDarts: match.currentTurnDarts.slice(0, -1),
  };
}

/**
 * Computes preview score and status for the active turn currently in progress
 */
export function getActiveTurnPreview(match: Match): {
  scoreBefore: number;
  scoreAfter: number;
  totalTurnScore: number;
  isBust: boolean;
  isCheckout: boolean;
  bustReason?: string;
} {
  const activePlayer = match.players[match.activePlayerIndex];
  if (!activePlayer) {
    return { scoreBefore: 0, scoreAfter: 0, totalTurnScore: 0, isBust: false, isCheckout: false };
  }

  const visit = calculateVisit(
    activePlayer.currentScore,
    match.currentTurnDarts,
    match.settings.inRule,
    match.settings.outRule,
    activePlayer.inRuleSatisfied,
    activePlayer.player.id
  );

  return {
    scoreBefore: visit.scoreBefore,
    scoreAfter: visit.scoreAfter,
    totalTurnScore: visit.total,
    isBust: visit.isBust,
    isCheckout: visit.status === 'checkout',
    bustReason: visit.bustReason,
  };
}

/**
 * Confirms and commits the active turn
 */
export function confirmTurn(match: Match): Match {
  if (match.status === 'completed') return match;
  if (match.currentTurnDarts.length === 0) return match;

  const playerIdx = match.activePlayerIndex;
  const player = match.players[playerIdx];
  const darts = match.currentTurnDarts;

  const turn = calculateVisit(
    player.currentScore,
    darts,
    match.settings.inRule,
    match.settings.outRule,
    player.inRuleSatisfied,
    player.player.id
  );

  const checkoutAttempts = isCheckoutAttempt(player.currentScore, darts);
  const checkoutHit = turn.status === 'checkout' ? 1 : 0;

  // Update inRule satisfaction if satisfied in this turn
  let inRuleSatisfied = player.inRuleSatisfied;
  if (!inRuleSatisfied && match.settings.inRule === 'double_in') {
    const doubleHit = darts.some(
      (d) => d.multiplier === 2 || d.score === 50
    );
    if (doubleHit) inRuleSatisfied = true;
  }

  // Update player counters
  const updatedPlayer: MatchPlayer = {
    ...player,
    currentScore: turn.scoreAfter,
    dartsThrownInLeg: player.dartsThrownInLeg + darts.length,
    totalDartsThrown: player.totalDartsThrown + darts.length,
    totalPointsScored: player.totalPointsScored + turn.total,
    turns: [...player.turns, turn],
    highestTurn: Math.max(player.highestTurn, turn.total),
    checkoutAttempts: player.checkoutAttempts + checkoutAttempts,
    checkoutHits: player.checkoutHits + checkoutHit,
    highestCheckout:
      turn.status === 'checkout'
        ? Math.max(player.highestCheckout, turn.scoreBefore)
        : player.highestCheckout,
    count180: player.count180 + (turn.total === 180 ? 1 : 0),
    count140Plus: player.count140Plus + (turn.total >= 140 && turn.total < 180 ? 1 : 0),
    count100Plus: player.count100Plus + (turn.total >= 100 && turn.total < 140 ? 1 : 0),
    count60Plus: player.count60Plus + (turn.total >= 60 && turn.total < 100 ? 1 : 0),
    inRuleSatisfied,
  };

  const newPlayers = [...match.players];
  newPlayers[playerIdx] = updatedPlayer;

  let updatedMatch: Match = {
    ...match,
    players: newPlayers,
    currentTurnDarts: [],
    historyTimeline: [turn, ...match.historyTimeline],
  };

  // Check if checkout occurred
  if (turn.status === 'checkout') {
    return completeLeg(updatedMatch, player.player.id, turn);
  }

  // Otherwise, rotate to next player
  const nextPlayerIdx = (match.activePlayerIndex + 1) % match.players.length;
  return {
    ...updatedMatch,
    activePlayerIndex: nextPlayerIdx,
  };
}

/**
 * Completes a leg when a player checks out
 */
export function completeLeg(match: Match, winnerPlayerId: string, winningTurn: Turn): Match {
  const winnerIdx = match.players.findIndex((p) => p.player.id === winnerPlayerId);
  if (winnerIdx === -1) return match;

  const winner = match.players[winnerIdx];
  const newLegsWon = winner.legsWon + 1;

  // Record leg record
  const dartsThrownMap: Record<string, number> = {};
  match.players.forEach((p) => {
    dartsThrownMap[p.player.id] = p.dartsThrownInLeg;
  });

  const lastDart = winningTurn.darts[winningTurn.checkoutDartIndex ?? (winningTurn.darts.length - 1)];

  const completedLeg: Leg = {
    legNumber: match.currentLegNumber,
    setNumber: match.currentSetNumber,
    winnerPlayerId,
    startingPlayerId: match.players[(match.currentLegNumber - 1) % match.players.length].player.id,
    dartsThrown: dartsThrownMap,
    winningCheckout: {
      playerId: winnerPlayerId,
      score: winningTurn.scoreBefore,
      dartsUsed: winner.dartsThrownInLeg,
      checkoutLabel: lastDart ? lastDart.label : 'WIN',
    },
  };

  const updatedLegs = [...match.legs, completedLeg];

  // Check if this leg wins a set or match
  if (match.settings.format === 'sets_and_legs') {
    const legsNeededForSet = match.settings.legsPerSet || 3;
    if (newLegsWon >= legsNeededForSet) {
      // Set won!
      return completeSet(match, winnerPlayerId, updatedLegs);
    }
  } else {
    // Legs only format
    if (newLegsWon >= match.settings.legsToWin) {
      // Match won!
      return completeMatch(
        {
          ...match,
          legs: updatedLegs,
          players: match.players.map((p, idx) =>
            idx === winnerIdx ? { ...p, legsWon: newLegsWon } : p
          ),
        },
        winnerPlayerId
      );
    }
  }

  // Not match over - start next leg
  const nextLegNumber = match.currentLegNumber + 1;
  const startingPlayerIdx = (nextLegNumber - 1) % match.players.length;

  const resetPlayers = match.players.map((p, idx) => ({
    ...p,
    currentScore: match.settings.startingScore,
    dartsThrownInLeg: 0,
    legsWon: idx === winnerIdx ? newLegsWon : p.legsWon,
    inRuleSatisfied: match.settings.inRule === 'straight_in',
  }));

  return {
    ...match,
    currentLegNumber: nextLegNumber,
    activePlayerIndex: startingPlayerIdx,
    currentTurnDarts: [],
    legs: updatedLegs,
    players: resetPlayers,
  };
}

/**
 * Completes a set in sets format
 */
export function completeSet(match: Match, winnerPlayerId: string, currentLegs: Leg[]): Match {
  const winnerIdx = match.players.findIndex((p) => p.player.id === winnerPlayerId);
  const winner = match.players[winnerIdx];
  const newSetsWon = winner.setsWon + 1;

  const setLegs = currentLegs.filter((l) => l.setNumber === match.currentSetNumber);
  const completedSet: SetGame = {
    setNumber: match.currentSetNumber,
    winnerPlayerId,
    legs: setLegs,
  };

  const updatedSets = [...match.sets, completedSet];

  // Check if sets target reached
  const setsNeeded = match.settings.setsToWin || 3;
  if (newSetsWon >= setsNeeded) {
    return completeMatch(
      {
        ...match,
        sets: updatedSets,
        legs: currentLegs,
        players: match.players.map((p, idx) =>
          idx === winnerIdx ? { ...p, setsWon: newSetsWon } : p
        ),
      },
      winnerPlayerId
    );
  }

  // Start next set
  const nextSetNumber = match.currentSetNumber + 1;
  const nextLegNumber = match.currentLegNumber + 1;
  const startingPlayerIdx = (nextSetNumber - 1) % match.players.length;

  const resetPlayers = match.players.map((p, idx) => ({
    ...p,
    currentScore: match.settings.startingScore,
    legsWon: 0, // legs reset per set in standard darts
    setsWon: idx === winnerIdx ? newSetsWon : p.setsWon,
    dartsThrownInLeg: 0,
    inRuleSatisfied: match.settings.inRule === 'straight_in',
  }));

  return {
    ...match,
    currentSetNumber: nextSetNumber,
    currentLegNumber: nextLegNumber,
    activePlayerIndex: startingPlayerIdx,
    currentTurnDarts: [],
    legs: currentLegs,
    sets: updatedSets,
    players: resetPlayers,
  };
}

/**
 * Completes the match
 */
export function completeMatch(match: Match, winnerPlayerId: string): Match {
  return {
    ...match,
    status: 'completed',
    winnerPlayerId,
    endTime: Date.now(),
    currentTurnDarts: [],
  };
}

/**
 * Safely edit a historical turn and recalculate the entire match
 */
export function editTurnAndRecalculate(
  match: Match,
  turnId: string,
  newDarts: Throw[]
): Match {
  // Extract initial original players
  const rawPlayers: Player[] = match.players.map((p) => p.player);
  let freshMatch = createMatch(rawPlayers, match.settings);
  freshMatch.id = match.id;
  freshMatch.startTime = match.startTime;

  // Chronologically replay all turns in original order (historyTimeline is stored newest-first)
  const chronologicalTurns = [...match.historyTimeline].reverse();

  for (const turn of chronologicalTurns) {
    const dartsToApply = turn.id === turnId ? newDarts : turn.darts;

    // Set darts for turn
    freshMatch = {
      ...freshMatch,
      currentTurnDarts: dartsToApply,
    };

    freshMatch = confirmTurn(freshMatch);

    // Stop if match finished during replay
    if (freshMatch.status === 'completed') break;
  }

  return freshMatch;
}

/**
 * Undoes the most recently confirmed visit/turn, reverting the match state
 * and restoring the visit's darts back into currentTurnDarts for editing.
 */
export function undoLastCompletedTurn(match: Match): Match {
  if (match.historyTimeline.length === 0) return match;

  const lastTurn = match.historyTimeline[0];
  const remainingTimeline = match.historyTimeline.slice(1);

  // Chronologically replay from start without the last turn
  const rawPlayers: Player[] = match.players.map((p) => p.player);
  let freshMatch = createMatch(rawPlayers, match.settings);
  freshMatch.id = match.id;
  freshMatch.startTime = match.startTime;

  const chronologicalTurns = [...remainingTimeline].reverse();

  for (const turn of chronologicalTurns) {
    freshMatch = {
      ...freshMatch,
      currentTurnDarts: turn.darts,
    };
    freshMatch = confirmTurn(freshMatch);
  }

  // Restore the last turn's darts into currentTurnDarts so the player can edit/adjust
  return {
    ...freshMatch,
    currentTurnDarts: lastTurn.darts,
  };
}
