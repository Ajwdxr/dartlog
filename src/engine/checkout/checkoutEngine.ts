import { CheckoutRoute, OutRule } from '@/types/dart';

// Canonical PDC professional 3-dart finishes database
export const PROFESSIONAL_CHECKOUTS: Record<number, { primary: string[]; alternatives?: string[][] }> = {
  170: { primary: ['T20', 'T20', 'BULL'] },
  167: { primary: ['T20', 'T19', 'BULL'] },
  164: { primary: ['T20', 'T18', 'BULL'], alternatives: [['T19', 'T19', 'BULL']] },
  161: { primary: ['T20', 'T17', 'BULL'] },
  160: { primary: ['T20', 'T20', 'D20'] },
  158: { primary: ['T20', 'T20', 'D19'] },
  157: { primary: ['T20', 'T19', 'D20'] },
  156: { primary: ['T20', 'T20', 'D18'] },
  155: { primary: ['T20', 'T19', 'D19'], alternatives: [['T20', 'T15', 'BULL']] },
  154: { primary: ['T20', 'T18', 'D20'] },
  153: { primary: ['T20', 'T19', 'D18'] },
  152: { primary: ['T20', 'T20', 'D16'] },
  151: { primary: ['T20', 'T17', 'D20'], alternatives: [['T19', 'T18', 'D20']] },
  150: { primary: ['T20', 'T18', 'D18'], alternatives: [['T19', 'T19', 'D18'], ['T20', 'BULL', 'D20']] },
  149: { primary: ['T20', 'T19', 'D16'] },
  148: { primary: ['T20', 'T20', 'D14'], alternatives: [['T20', 'T16', 'D20']] },
  147: { primary: ['T20', 'T17', 'D18'], alternatives: [['T19', 'T18', 'D18']] },
  146: { primary: ['T20', 'T18', 'D16'], alternatives: [['T19', 'T19', 'D16']] },
  145: { primary: ['T20', 'T19', 'D14'], alternatives: [['T20', 'T15', 'D20']] },
  144: { primary: ['T20', 'T20', 'D12'] },
  143: { primary: ['T20', 'T17', 'D16'] },
  142: { primary: ['T20', 'T14', 'D20'], alternatives: [['T20', 'BULL', 'D16']] },
  141: { primary: ['T20', 'T19', 'D12'], alternatives: [['T20', 'T15', 'D18']] },
  140: { primary: ['T20', 'T20', 'D10'], alternatives: [['T20', 'T16', 'D16']] },
  139: { primary: ['T20', 'T19', 'D11'], alternatives: [['T19', 'T14', 'D20']] },
  138: { primary: ['T20', 'T18', 'D12'], alternatives: [['T20', 'T14', 'D18']] },
  137: { primary: ['T20', 'T19', 'D10'], alternatives: [['T19', 'T20', 'D10']] },
  136: { primary: ['T20', 'T20', 'D8'], alternatives: [['T20', 'T16', 'D14']] },
  135: { primary: ['BULL', 'T15', 'D20'], alternatives: [['T20', 'T17', 'D12'], ['T20', 'T15', 'D15']] },
  134: { primary: ['T20', 'T14', 'D16'], alternatives: [['T20', 'T16', 'D13']] },
  133: { primary: ['T20', 'T19', 'D8'], alternatives: [['T20', 'T15', 'D14']] },
  132: { primary: ['BULL', 'BULL', 'D16'], alternatives: [['T20', 'T16', 'D12'], ['T20', 'T20', 'D6']] },
  131: { primary: ['T20', 'T13', 'D16'], alternatives: [['T19', 'T14', 'D16']] },
  130: { primary: ['T20', 'T20', 'D5'], alternatives: [['T20', 'T18', 'D8'], ['T20', 'T14', 'D14']] },
  129: { primary: ['T19', 'T16', 'D12'], alternatives: [['T19', 'T20', 'D6'], ['T20', 'T19', 'D6']] },
  128: { primary: ['T18', 'T14', 'D16'], alternatives: [['T20', 'T20', 'D4']] },
  127: { primary: ['T20', 'T17', 'D8'], alternatives: [['T19', 'T18', 'D8'], ['T20', '17', 'BULL']] },
  126: { primary: ['T19', 'T19', 'D6'], alternatives: [['T20', 'T16', 'D9']] },
  125: { primary: ['25', 'T20', 'D20'], alternatives: [['BULL', 'T17', 'D12'], ['T20', 'T19', 'D4']] },
  124: { primary: ['T20', 'T16', 'D8'], alternatives: [['T20', 'T14', 'D11'], ['T20', 'D16', 'D16']] },
  123: { primary: ['T19', 'T16', 'D9'], alternatives: [['T20', 'T13', 'D12'], ['T19', '16', 'BULL']] },
  122: { primary: ['T18', 'T18', 'D7'], alternatives: [['T18', '20', 'BULL'], ['T20', 'T14', 'D10']] },
  121: { 
    primary: ['T20', 'T11', 'BULL'], 
    alternatives: [
      ['T20', '11', 'BULL'],
      ['T20', 'T17', 'D25'],
      ['T19', 'T14', 'D11'],
      ['T17', 'T20', 'D5']
    ] 
  },
  120: { primary: ['T20', '20', 'D20'] },
  119: { primary: ['T19', 'T10', 'D16'], alternatives: [['T20', '19', 'D20']] },
  118: { primary: ['T20', '18', 'D20'], alternatives: [['T19', '17', 'D20']] },
  117: { primary: ['T20', '17', 'D20'], alternatives: [['T19', '20', 'D20']] },
  116: { primary: ['T20', '16', 'D20'], alternatives: [['T19', '19', 'D20']] },
  115: { primary: ['T20', '15', 'D20'], alternatives: [['T19', '18', 'D20']] },
  114: { primary: ['T20', '14', 'D20'], alternatives: [['T19', '17', 'D20']] },
  113: { primary: ['T20', '13', 'D20'], alternatives: [['T19', '16', 'D20']] },
  112: { primary: ['T20', '20', 'D16'], alternatives: [['T20', '12', 'D20']] },
  111: { primary: ['T20', '19', 'D16'], alternatives: [['T20', '11', 'D20']] },
  110: { primary: ['T20', 'BULL'], alternatives: [['T20', '10', 'D20']] },
  109: { primary: ['T19', '20', 'D16'], alternatives: [['T20', '17', 'D16']] },
  108: { primary: ['T20', '16', 'D16'], alternatives: [['T19', '19', 'D16']] },
  107: { primary: ['T19', 'BULL'], alternatives: [['T19', '18', 'D16'], ['T20', '15', 'D16']] },
  106: { primary: ['T20', '14', 'D16'], alternatives: [['T20', '10', 'D18']] },
  105: { primary: ['T20', '13', 'D16'], alternatives: [['T19', '16', 'D16']] },
  104: { primary: ['T18', 'BULL'], alternatives: [['T20', '12', 'D16'], ['T18', '18', 'D16']] },
  103: { primary: ['T19', '14', 'D16'], alternatives: [['T20', '11', 'D16']] },
  102: { primary: ['T20', '10', 'D16'], alternatives: [['T20', '14', 'D14']] },
  101: { primary: ['T17', 'BULL'], alternatives: [['T20', '9', 'D16'], ['T17', '18', 'D16']] },
  100: { primary: ['T20', 'D20'], alternatives: [['20', 'T20', 'D10']] },
  99: { primary: ['T19', '10', 'D16'], alternatives: [['T19', '6', 'D18']] },
  98: { primary: ['T20', 'D19'], alternatives: [['T16', 'BULL']] },
  97: { primary: ['T19', 'D20'], alternatives: [['T17', '14', 'D16']] },
  96: { primary: ['T20', 'D18'], alternatives: [['T16', '16', 'D16']] },
  95: { primary: ['T19', 'D19'], alternatives: [['BULL', '15', 'D15'], ['T15', 'BULL']] },
  94: { primary: ['T18', 'D20'], alternatives: [['25', 'T19', 'D6'], ['T14', 'BULL']] },
  93: { primary: ['T19', 'D18'], alternatives: [['T15', 'D24']] },
  92: { primary: ['T20', 'D16'], alternatives: [['T16', 'D22'], ['BULL', 'D21']] },
  91: { primary: ['T17', 'D20'], alternatives: [['BULL', '9', 'D16']] },
  90: { primary: ['T18', 'D18'], alternatives: [['T20', 'D15'], ['20', '20', 'BULL']] },
  89: { primary: ['T19', 'D16'], alternatives: [['19', 'T18', 'D8']] },
  88: { primary: ['T16', 'D20'], alternatives: [['T20', 'D14']] },
  87: { primary: ['T17', 'D18'], alternatives: [['T17', '18', 'D9'], ['17', 'T18', 'D8']] },
  86: { primary: ['T18', 'D16'], alternatives: [['18', '18', 'BULL'], ['T14', 'D22']] },
  85: { primary: ['T15', 'D20'], alternatives: [['T19', 'D14'], ['15', '20', 'BULL']] },
  84: { primary: ['T16', 'D18'], alternatives: [['T20', 'D12'], ['20', '14', 'BULL']] },
  83: { primary: ['T17', 'D16'], alternatives: [['17', '16', 'BULL']] },
  82: { primary: ['BULL', 'D16'], alternatives: [['T14', 'D20'], ['14', '18', 'BULL']] },
  81: { primary: ['T15', 'D18'], alternatives: [['T19', 'D12']] },
  80: { primary: ['T20', 'D10'], alternatives: [['T16', 'D16']] },
  79: { primary: ['T13', 'D20'], alternatives: [['T19', 'D11'], ['19', '20', 'D20']] },
  78: { primary: ['T18', 'D12'], alternatives: [['T14', 'D18'], ['18', '20', 'D20']] },
  77: { primary: ['T15', 'D16'], alternatives: [['T19', 'D10'], ['17', '20', 'D20']] },
  76: { primary: ['T20', 'D8'], alternatives: [['T16', 'D14'], ['20', '16', 'D20']] },
  75: { primary: ['T17', 'D12'], alternatives: [['17', '18', 'D20'], ['25', 'BULL']] },
  74: { primary: ['T14', 'D16'], alternatives: [['T18', 'D10'], ['14', '20', 'D20']] },
  73: { primary: ['T19', 'D8'], alternatives: [['T15', 'D14'], ['19', '14', 'D20']] },
  72: { primary: ['T16', 'D12'], alternatives: [['T12', 'D18'], ['20', '20', 'D16']] },
  71: { primary: ['T13', 'D16'], alternatives: [['T17', 'D10'], ['17', '14', 'D20']] },
  70: { primary: ['T18', 'D8'], alternatives: [['T10', 'D20'], ['20', '18', 'D16']] },
  69: { primary: ['T15', 'D12'], alternatives: [['T19', 'D6'], ['19', '18', 'D16']] },
  68: { primary: ['T16', 'D10'], alternatives: [['T20', 'D4'], ['20', '16', 'D16']] },
  67: { primary: ['T17', 'D8'], alternatives: [['T9', 'D20'], ['17', '18', 'D16']] },
  66: { primary: ['T14', 'D12'], alternatives: [['T10', 'D18'], ['16', '18', 'D16']] },
  65: { primary: ['T15', 'D10'], alternatives: [['T19', 'D4'], ['25', 'D20']] },
  64: { primary: ['T16', 'D8'], alternatives: [['16', '16', 'D16'], ['T8', 'D20']] },
  63: { primary: ['T13', 'D12'], alternatives: [['T17', 'D6'], ['13', '18', 'D16']] },
  62: { primary: ['T10', 'D16'], alternatives: [['T14', 'D10'], ['12', '18', 'D16']] },
  61: { primary: ['T15', 'D8'], alternatives: [['T7', 'D20'], ['25', 'D18']] },
  60: { primary: ['20', 'D20'] },
  59: { primary: ['19', 'D20'] },
  58: { primary: ['18', 'D20'] },
  57: { primary: ['17', 'D20'] },
  56: { primary: ['16', 'D20'] },
  55: { primary: ['15', 'D20'] },
  54: { primary: ['14', 'D20'] },
  53: { primary: ['13', 'D20'] },
  52: { primary: ['12', 'D20'], alternatives: [['20', 'D16']] },
  51: { primary: ['11', 'D20'], alternatives: [['19', 'D16']] },
  50: { primary: ['BULL'], alternatives: [['10', 'D20']] },
  49: { primary: ['9', 'D20'], alternatives: [['17', 'D16']] },
  48: { primary: ['16', 'D16'], alternatives: [['8', 'D20']] },
  47: { primary: ['7', 'D20'], alternatives: [['15', 'D16']] },
  46: { primary: ['6', 'D20'], alternatives: [['14', 'D16'], ['10', 'D18']] },
  45: { primary: ['5', 'D20'], alternatives: [['13', 'D16']] },
  44: { primary: ['4', 'D20'], alternatives: [['12', 'D16']] },
  43: { primary: ['3', 'D20'], alternatives: [['11', 'D16']] },
  42: { primary: ['10', 'D16'], alternatives: [['2', 'D20']] },
  41: { primary: ['9', 'D16'], alternatives: [['1', 'D20']] },
  40: { primary: ['D20'] },
  39: { primary: ['7', 'D16'], alternatives: [['19', 'D10']] },
  38: { primary: ['D19'] },
  37: { primary: ['5', 'D16'], alternatives: [['17', 'D10']] },
  36: { primary: ['D18'] },
  35: { primary: ['3', 'D16'], alternatives: [['19', 'D8']] },
  34: { primary: ['D17'] },
  33: { primary: ['1', 'D16'], alternatives: [['17', 'D8']] },
  32: { primary: ['D16'] },
  31: { primary: ['15', 'D8'], alternatives: [['7', 'D12']] },
  30: { primary: ['D15'] },
  29: { primary: ['13', 'D8'], alternatives: [['5', 'D12']] },
  28: { primary: ['D14'] },
  27: { primary: ['11', 'D8'], alternatives: [['7', 'D10']] },
  26: { primary: ['D13'] },
  25: { primary: ['9', 'D8'], alternatives: [['1', 'D12']] },
  24: { primary: ['D12'] },
  23: { primary: ['7', 'D8'], alternatives: [['3', 'D10']] },
  22: { primary: ['D11'] },
  21: { primary: ['5', 'D8'], alternatives: [['1', 'D10']] },
  20: { primary: ['D10'] },
  19: { primary: ['3', 'D8'], alternatives: [['11', 'D4']] },
  18: { primary: ['D9'] },
  17: { primary: ['1', 'D8'], alternatives: [['9', 'D4']] },
  16: { primary: ['D8'] },
  15: { primary: ['7', 'D4'], alternatives: [['3', 'D6']] },
  14: { primary: ['D7'] },
  13: { primary: ['5', 'D4'], alternatives: [['1', 'D6']] },
  12: { primary: ['D6'] },
  11: { primary: ['3', 'D4'], alternatives: [['7', 'D2']] },
  10: { primary: ['D5'] },
  9: { primary: ['1', 'D4'], alternatives: [['5', 'D2']] },
  8: { primary: ['D4'] },
  7: { primary: ['3', 'D2'], alternatives: [['5', 'D1']] },
  6: { primary: ['D3'] },
  5: { primary: ['1', 'D2'] },
  4: { primary: ['D2'] },
  3: { primary: ['1', 'D1'] },
  2: { primary: ['D1'] },
};

// Impossible 3-dart double-out bogies
export const BOGEY_NUMBERS = [169, 168, 166, 165, 163, 162, 159];

/**
 * Calculates checkout route based on current score, darts remaining in visit (1, 2, or 3), and out rule.
 */
export function getCheckoutRoute(
  score: number,
  dartsRemaining: number = 3,
  outRule: OutRule = 'double_out'
): CheckoutRoute | null {
  if (score <= 1 || score > 170) return null;
  if (dartsRemaining <= 0 || dartsRemaining > 3) return null;

  // Single out logic
  if (outRule === 'straight_out') {
    return getSingleOutRoute(score, dartsRemaining);
  }

  // Master out logic (ending on double, triple, or bull)
  if (outRule === 'master_out') {
    const masterRes = getMasterOutRoute(score, dartsRemaining);
    if (masterRes) return masterRes;
  }

  // Standard double-out logic
  if (score > 170 || BOGEY_NUMBERS.includes(score)) {
    return null;
  }

  // Dart count constraints
  // 1 dart max double-out is 50 (BULL) or 40 (D20)
  if (dartsRemaining === 1) {
    if (score === 50) {
      return { target: 50, dartsNeeded: 1, primary: ['BULL'] };
    }
    if (score <= 40 && score % 2 === 0) {
      return { target: score, dartsNeeded: 1, primary: [`D${score / 2}`] };
    }
    return null;
  }

  // 2 darts max double-out is 110 (T20 BULL) or 100 (T20 D20)
  if (dartsRemaining === 2) {
    if (score > 110) return null;
    if (score === 109 || score === 108 || score === 106 || score === 105 || score === 103 || score === 102) {
      // These require 3 darts because first dart treble leaves an impossible 1-dart finish
      // e.g. 109 - 60 = 49 (impossible in 1 dart)
      return null;
    }
  }

  const lookup = PROFESSIONAL_CHECKOUTS[score];
  if (!lookup) return null;

  // Check if primary fits into darts remaining
  if (lookup.primary.length <= dartsRemaining) {
    const validAlts = (lookup.alternatives || []).filter(
      (alt) => alt.length <= dartsRemaining
    );
    return {
      target: score,
      dartsNeeded: lookup.primary.length,
      primary: lookup.primary,
      alternatives: validAlts.length > 0 ? validAlts : undefined,
    };
  }

  // If primary needed 3 darts but we only have 2, check if any alternative works in 2 darts
  if (lookup.alternatives) {
    const fitAlt = lookup.alternatives.find((alt) => alt.length <= dartsRemaining);
    if (fitAlt) {
      const remainingAlts = lookup.alternatives.filter(
        (alt) => alt !== fitAlt && alt.length <= dartsRemaining
      );
      return {
        target: score,
        dartsNeeded: fitAlt.length,
        primary: fitAlt,
        alternatives: remainingAlts.length > 0 ? remainingAlts : undefined,
      };
    }
  }

  return null;
}

function getSingleOutRoute(score: number, dartsRemaining: number): CheckoutRoute | null {
  if (score > 60 * dartsRemaining) return null;

  // 1 dart
  if (score <= 20) {
    return { target: score, dartsNeeded: 1, primary: [`${score}`] };
  }
  if (score === 25) {
    return { target: score, dartsNeeded: 1, primary: ['25'] };
  }
  if (score === 50) {
    return { target: score, dartsNeeded: 1, primary: ['BULL'] };
  }
  if (score <= 40 && score % 2 === 0) {
    return { target: score, dartsNeeded: 1, primary: [`D${score / 2}`] };
  }
  if (score <= 60 && score % 3 === 0) {
    return { target: score, dartsNeeded: 1, primary: [`T${score / 3}`] };
  }

  // 2 or 3 darts
  if (dartsRemaining >= 2) {
    if (score <= 60) {
      return { target: score, dartsNeeded: 1, primary: [`${score}`] };
    }
    const t20Darts = Math.floor(score / 60);
    const remainder = score - t20Darts * 60;
    const path: string[] = [];
    for (let i = 0; i < t20Darts; i++) path.push('T20');
    if (remainder > 0) {
      if (remainder <= 20) path.push(`${remainder}`);
      else if (remainder % 3 === 0) path.push(`T${remainder / 3}`);
      else if (remainder % 2 === 0) path.push(`D${remainder / 2}`);
      else path.push(`${remainder}`);
    }
    if (path.length <= dartsRemaining) {
      return { target: score, dartsNeeded: path.length, primary: path };
    }
  }
  return null;
}

function getMasterOutRoute(score: number, dartsRemaining: number): CheckoutRoute | null {
  // Check double-out first as preferred
  const doubleRes = getCheckoutRoute(score, dartsRemaining, 'double_out');
  if (doubleRes) return doubleRes;

  // Otherwise check if a triple finishes it in 1 dart
  if (dartsRemaining >= 1 && score <= 60 && score % 3 === 0 && score > 0) {
    return { target: score, dartsNeeded: 1, primary: [`T${score / 3}`] };
  }

  // Check 2 darts ending on a triple
  if (dartsRemaining >= 2 && score <= 120) {
    for (let t = 20; t >= 1; t--) {
      const tripleScore = t * 3;
      const setup = score - tripleScore;
      if (setup > 0 && setup <= 60) {
        let setupLabel = `${setup}`;
        if (setup <= 20) setupLabel = `${setup}`;
        else if (setup % 3 === 0) setupLabel = `T${setup / 3}`;
        else if (setup % 2 === 0) setupLabel = `D${setup / 2}`;
        return {
          target: score,
          dartsNeeded: 2,
          primary: [setupLabel, `T${t}`],
        };
      }
    }
  }

  return null;
}
