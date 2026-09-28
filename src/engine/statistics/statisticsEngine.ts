import { Leg, MatchPlayer, Turn } from '@/types/dart';

export interface ComputedMatchStats {
  threeDartAverage: number;
  first9Average: number;
  checkoutPercentage: number;
  checkoutAttempts: number;
  checkoutHits: number;
  highestCheckout: number;
  highestTurn: number;
  count180: number;
  count140Plus: number;
  count100Plus: number;
  count60Plus: number;
  totalDartsThrown: number;
  totalPointsScored: number;
  bestLegDarts: number | null;
  worstLegDarts: number | null;
  averageDartsPerLeg: number | null;
}

/**
 * Calculates real-time statistics for a MatchPlayer across completed turns and legs
 */
export function calculatePlayerStats(
  player: MatchPlayer,
  legs: Leg[]
): ComputedMatchStats {
  const turns = player.turns || [];
  let totalPoints = 0;
  let totalDarts = 0;

  let first9Points = 0;
  let first9Darts = 0;

  let count180 = 0;
  let count140Plus = 0;
  let count100Plus = 0;
  let count60Plus = 0;
  let highestTurn = 0;
  let highestCheckout = 0;

  let checkoutAttempts = player.checkoutAttempts;
  let checkoutHits = player.checkoutHits;

  // Track darts thrown in current leg to accurately track First 9
  let legDartsRunning = 0;

  for (const turn of turns) {
    const turnDarts = turn.darts.length;
    const turnScore = turn.total;

    totalDarts += turnDarts;
    totalPoints += turnScore;

    // Track First 9 darts of legs
    if (legDartsRunning < 9) {
      const dartsToCount = Math.min(turnDarts, 9 - legDartsRunning);
      let pCount = 0;
      for (let i = 0; i < dartsToCount; i++) {
        pCount += turn.darts[i]?.score || 0;
      }
      first9Points += pCount;
      first9Darts += dartsToCount;
    }

    legDartsRunning += turnDarts;

    // Check high scores
    if (turnScore === 180) count180++;
    else if (turnScore >= 140) count140Plus++;
    else if (turnScore >= 100) count100Plus++;
    else if (turnScore >= 60) count60Plus++;

    if (turnScore > highestTurn) highestTurn = turnScore;

    // Checkouts
    if (turn.status === 'checkout') {
      const coVal = turn.scoreBefore;
      if (coVal > highestCheckout) highestCheckout = coVal;
      // Reset leg darts counter for next leg
      legDartsRunning = 0;
    }
  }

  // Best & worst leg darts from won legs
  const wonLegs = legs.filter((l) => l.winnerPlayerId === player.player.id);
  let bestLegDarts: number | null = null;
  let worstLegDarts: number | null = null;
  let legDartsSum = 0;

  for (const l of wonLegs) {
    const dUsed = l.winningCheckout?.dartsUsed || l.dartsThrown[player.player.id] || 0;
    if (dUsed > 0) {
      legDartsSum += dUsed;
      if (bestLegDarts === null || dUsed < bestLegDarts) bestLegDarts = dUsed;
      if (worstLegDarts === null || dUsed > worstLegDarts) worstLegDarts = dUsed;
    }
  }

  const threeDartAverage =
    totalDarts > 0 ? Number(((totalPoints / totalDarts) * 3).toFixed(2)) : 0;

  const first9Average =
    first9Darts > 0 ? Number(((first9Points / first9Darts) * 3).toFixed(2)) : 0;

  const checkoutPercentage =
    checkoutAttempts > 0
      ? Number(((checkoutHits / checkoutAttempts) * 100).toFixed(1))
      : 0;

  const averageDartsPerLeg =
    wonLegs.length > 0 ? Number((legDartsSum / wonLegs.length).toFixed(1)) : null;

  return {
    threeDartAverage,
    first9Average,
    checkoutPercentage,
    checkoutAttempts,
    checkoutHits,
    highestCheckout: Math.max(highestCheckout, player.highestCheckout),
    highestTurn: Math.max(highestTurn, player.highestTurn),
    count180,
    count140Plus,
    count100Plus,
    count60Plus,
    totalDartsThrown: totalDarts,
    totalPointsScored: totalPoints,
    bestLegDarts,
    worstLegDarts,
    averageDartsPerLeg,
  };
}

/**
 * Detects if a visit constituted a checkout opportunity (attempt)
 * A checkout attempt is considered whenever the player threw at a double with the chance to finish.
 */
export function isCheckoutAttempt(scoreBefore: number, darts: Turn['darts']): number {
  let score = scoreBefore;
  let attempts = 0;

  for (const d of darts) {
    if (score <= 50 && (score === 50 || score % 2 === 0)) {
      // Player is on a double finish opportunity
      if (d.multiplier === 2 || d.score === 50 || score <= 40) {
        attempts++;
      }
    }
    score -= d.score;
    if (score <= 1) break;
  }

  return attempts;
}
