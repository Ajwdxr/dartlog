import { DartMultiplier, InRule, OutRule, Throw, Turn, TurnStatus } from '@/types/dart';

export interface ScoreValidationResult {
  isBust: boolean;
  isCheckout: boolean;
  scoreAfter: number;
  bustReason?: string;
  inRuleSatisfiedAfter: boolean;
  validDartScore: number;
}

/**
 * Creates a normalized Throw object
 */
export function createThrow(
  value: number,
  multiplier: DartMultiplier,
  playerId: string = 'player'
): Throw {
  let score = 0;
  let label = 'MISS';

  if (value === 0 || multiplier === 0) {
    score = 0;
    label = 'MISS';
  } else if (value === 50 || (value === 25 && multiplier === 2)) {
    score = 50;
    label = 'BULL';
    value = 50;
    multiplier = 2; // Bull is double 25
  } else if (value === 25 && multiplier === 1) {
    score = 25;
    label = '25';
  } else {
    // 1 - 20
    score = value * multiplier;
    if (multiplier === 3) label = `T${value}`;
    else if (multiplier === 2) label = `D${value}`;
    else label = `${value}`;
  }

  return {
    id: `throw_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    playerId,
    value,
    multiplier,
    score,
    label,
    timestamp: Date.now(),
  };
}

/**
 * Validates a single dart throw against the current score and rules
 */
export function validateDart(
  currentScore: number,
  throwObj: Throw,
  inRule: InRule,
  outRule: OutRule,
  inRuleAlreadySatisfied: boolean
): ScoreValidationResult {
  let inRuleSatisfiedAfter = inRuleAlreadySatisfied;
  let effectiveScore = throwObj.score;

  // Double-in check
  if (inRule === 'double_in' && !inRuleAlreadySatisfied) {
    const isDouble = throwObj.multiplier === 2; // D1-D20 or BULL
    if (!isDouble) {
      // Dart doesn't score until double is hit
      return {
        isBust: false,
        isCheckout: false,
        scoreAfter: currentScore,
        inRuleSatisfiedAfter: false,
        validDartScore: 0,
      };
    }
    inRuleSatisfiedAfter = true;
  }

  const remaining = currentScore - effectiveScore;

  // Check out-of-bounds bust
  if (remaining < 0) {
    return {
      isBust: true,
      isCheckout: false,
      scoreAfter: currentScore,
      bustReason: `Score exceeded (${effectiveScore} scored with ${currentScore} remaining)`,
      inRuleSatisfiedAfter,
      validDartScore: 0,
    };
  }

  // Check 1 remaining under double-out or master-out
  if (remaining === 1 && (outRule === 'double_out' || outRule === 'master_out')) {
    return {
      isBust: true,
      isCheckout: false,
      scoreAfter: currentScore,
      bustReason: 'Left on 1 (impossible checkout on double-out)',
      inRuleSatisfiedAfter,
      validDartScore: 0,
    };
  }

  // Check 0 remaining (potential checkout)
  if (remaining === 0) {
    let validFinish = false;
    if (outRule === 'straight_out') {
      validFinish = true;
    } else if (outRule === 'double_out') {
      validFinish = throwObj.multiplier === 2; // Includes D1-D20 and BULL
    } else if (outRule === 'master_out') {
      validFinish = throwObj.multiplier === 2 || throwObj.multiplier === 3;
    }

    if (validFinish) {
      return {
        isBust: false,
        isCheckout: true,
        scoreAfter: 0,
        inRuleSatisfiedAfter,
        validDartScore: effectiveScore,
      };
    } else {
      return {
        isBust: true,
        isCheckout: false,
        scoreAfter: currentScore,
        bustReason: `Invalid checkout dart (${throwObj.label} is not a valid ${outRule.replace('_', ' ')} finish)`,
        inRuleSatisfiedAfter,
        validDartScore: 0,
      };
    }
  }

  // Normal valid throw
  return {
    isBust: false,
    isCheckout: false,
    scoreAfter: remaining,
    inRuleSatisfiedAfter,
    validDartScore: effectiveScore,
  };
}

/**
 * Calculates a complete visit/turn from 1-3 darts
 */
export function calculateVisit(
  scoreBefore: number,
  darts: Throw[],
  inRule: InRule,
  outRule: OutRule,
  inRuleInitial: boolean,
  playerId: string
): Turn {
  let scoreRunning = scoreBefore;
  let inRuleSatisfied = inRuleInitial;
  let isBust = false;
  let bustReason: string | undefined = undefined;
  let checkoutIndex: number | undefined = undefined;
  let status: TurnStatus = 'in_progress';
  let totalScored = 0;

  for (let i = 0; i < darts.length; i++) {
    const dart = darts[i];
    const res = validateDart(scoreRunning, dart, inRule, outRule, inRuleSatisfied);
    inRuleSatisfied = res.inRuleSatisfiedAfter;

    if (res.isBust) {
      isBust = true;
      bustReason = res.bustReason;
      status = 'bust';
      totalScored = 0;
      scoreRunning = scoreBefore; // score reverts to start of visit
      break;
    }

    totalScored += res.validDartScore;
    scoreRunning = res.scoreAfter;

    if (res.isCheckout) {
      checkoutIndex = i;
      status = 'checkout';
      break;
    }
  }

  if (!isBust && status !== 'checkout') {
    status = darts.length === 3 ? 'completed' : 'in_progress';
  }

  return {
    id: `turn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    playerId,
    darts,
    total: totalScored,
    scoreBefore,
    scoreAfter: scoreRunning,
    status,
    isBust,
    bustReason,
    checkoutDartIndex: checkoutIndex,
    timestamp: Date.now(),
  };
}
