import { describe, it, expect } from 'vitest';
import { Player, MatchSettings } from '../types/dart';
import { createThrow, validateDart, calculateVisit } from '../engine/scoring/scoringEngine';
import { getCheckoutRoute, BOGEY_NUMBERS } from '../engine/checkout/checkoutEngine';
import {
  createMatch,
  addThrow,
  confirmTurn,
  editTurnAndRecalculate,
  undoLastCompletedTurn,
} from '../engine/game/gameEngine';

const player1: Player = {
  id: 'p1',
  name: 'Ajwad',
  initials: 'AJ',
  avatarColor: '#10b981',
  createdAt: Date.now(),
};

const player2: Player = {
  id: 'p2',
  name: 'Anissa',
  initials: 'AN',
  avatarColor: '#3b82f6',
  createdAt: Date.now(),
};

const baseSettings: MatchSettings = {
  startingScore: 501,
  inRule: 'straight_in',
  outRule: 'double_out',
  legsToWin: 3,
  format: 'legs_only',
  date: new Date().toISOString(),
};

describe('Scoring & Bust Engine', () => {
  it('correctly creates throws for Single, Double, Triple, 25, Bull, and Miss', () => {
    const s20 = createThrow(20, 1);
    expect(s20.score).toBe(20);
    expect(s20.label).toBe('20');

    const d20 = createThrow(20, 2);
    expect(d20.score).toBe(40);
    expect(d20.label).toBe('D20');

    const t20 = createThrow(20, 3);
    expect(t20.score).toBe(60);
    expect(t20.label).toBe('T20');

    const outerBull = createThrow(25, 1);
    expect(outerBull.score).toBe(25);
    expect(outerBull.label).toBe('25');

    const innerBull = createThrow(25, 2);
    expect(innerBull.score).toBe(50);
    expect(innerBull.label).toBe('BULL');

    const innerBullDirect = createThrow(50, 1);
    expect(innerBullDirect.score).toBe(50);
    expect(innerBullDirect.label).toBe('BULL');

    const miss = createThrow(0, 0);
    expect(miss.score).toBe(0);
    expect(miss.label).toBe('MISS');
  });

  it('detects a 180 visit (three dart maximum)', () => {
    const t20 = createThrow(20, 3);
    const visit = calculateVisit(501, [t20, t20, t20], 'straight_in', 'double_out', true, 'p1');
    expect(visit.total).toBe(180);
    expect(visit.scoreAfter).toBe(321);
    expect(visit.isBust).toBe(false);
    expect(visit.status).toBe('completed');
  });

  it('handles Bust when score goes below 0', () => {
    const t20 = createThrow(20, 3);
    const visit = calculateVisit(32, [t20], 'straight_in', 'double_out', true, 'p1');
    expect(visit.isBust).toBe(true);
    expect(visit.total).toBe(0);
    expect(visit.scoreAfter).toBe(32);
    expect(visit.status).toBe('bust');
  });

  it('handles Bust when score reaches exactly 1 on double-out', () => {
    const s19 = createThrow(19, 1);
    const visit = calculateVisit(20, [s19], 'straight_in', 'double_out', true, 'p1');
    expect(visit.isBust).toBe(true);
    expect(visit.total).toBe(0);
    expect(visit.scoreAfter).toBe(20);
    expect(visit.status).toBe('bust');
  });

  it('handles Bust when score reaches 0 without a double on double-out', () => {
    const s20 = createThrow(20, 1);
    const visit = calculateVisit(20, [s20], 'straight_in', 'double_out', true, 'p1');
    expect(visit.isBust).toBe(true);
    expect(visit.status).toBe('bust');
    expect(visit.scoreAfter).toBe(20);
  });

  it('allows checkout with Double on double-out', () => {
    const d10 = createThrow(10, 2);
    const visit = calculateVisit(20, [d10], 'straight_in', 'double_out', true, 'p1');
    expect(visit.isBust).toBe(false);
    expect(visit.status).toBe('checkout');
    expect(visit.scoreAfter).toBe(0);
    expect(visit.total).toBe(20);
  });

  it('allows checkout with Inner Bull (50) on double-out', () => {
    const bull = createThrow(25, 2);
    const visit = calculateVisit(50, [bull], 'straight_in', 'double_out', true, 'p1');
    expect(visit.isBust).toBe(false);
    expect(visit.status).toBe('checkout');
    expect(visit.scoreAfter).toBe(0);
  });

  it('supports Single-out mode finishing on any number or 1', () => {
    const s1 = createThrow(1, 1);
    const visit = calculateVisit(1, [s1], 'straight_in', 'straight_out', true, 'p1');
    expect(visit.isBust).toBe(false);
    expect(visit.status).toBe('checkout');
    expect(visit.scoreAfter).toBe(0);
  });

  it('supports Master-out mode finishing on Triple or Double', () => {
    const t10 = createThrow(10, 3);
    const visit = calculateVisit(30, [t10], 'straight_in', 'master_out', true, 'p1');
    expect(visit.isBust).toBe(false);
    expect(visit.status).toBe('checkout');
    expect(visit.scoreAfter).toBe(0);
  });

  it('handles Double-in requirement: non-double throws score 0 until double is hit', () => {
    const s20 = createThrow(20, 1);
    const d20 = createThrow(20, 2);
    const t20 = createThrow(20, 3);

    const visit = calculateVisit(501, [s20, d20, t20], 'double_in', 'double_out', false, 'p1');
    // s20 ignored (0 points), d20 (40 points), t20 (60 points) -> total 100 points
    expect(visit.total).toBe(100);
    expect(visit.scoreAfter).toBe(401);
  });
});

describe('Checkout Engine', () => {
  it('identifies 170 maximum checkout', () => {
    const route = getCheckoutRoute(170, 3);
    expect(route).not.toBeNull();
    expect(route?.primary).toEqual(['T20', 'T20', 'BULL']);
  });

  it('identifies impossible bogey numbers like 169, 168, 166, 165, 163, 162, 159', () => {
    for (const bogey of BOGEY_NUMBERS) {
      expect(getCheckoutRoute(bogey, 3)).toBeNull();
    }
  });

  it('provides route for 121 with alternatives', () => {
    const route = getCheckoutRoute(121, 3);
    expect(route).not.toBeNull();
    expect(route?.primary).toEqual(['T20', 'T11', 'BULL']);
    expect(route?.alternatives).toBeDefined();
  });

  it('adapts when only 2 darts remain (e.g. 100 in 2 darts is T20 D20)', () => {
    const route = getCheckoutRoute(100, 2);
    expect(route).not.toBeNull();
    expect(route?.primary).toEqual(['T20', 'D20']);
  });

  it('returns null if checkout requires more darts than remaining', () => {
    const route = getCheckoutRoute(140, 2); // 140 cannot be checked out with 2 darts
    expect(route).toBeNull();
  });
});

describe('Game Engine Match Progression & Recalculation', () => {
  it('creates 301, 501, 701 matches', () => {
    const m301 = createMatch([player1, player2], { ...baseSettings, startingScore: 301 });
    expect(m301.players[0].currentScore).toBe(301);

    const m501 = createMatch([player1, player2], baseSettings);
    expect(m501.players[0].currentScore).toBe(501);

    const m701 = createMatch([player1, player2], { ...baseSettings, startingScore: 701 });
    expect(m701.players[0].currentScore).toBe(701);
  });

  it('executes turn addition and turn rotation between players', () => {
    let match = createMatch([player1, player2], baseSettings);
    expect(match.activePlayerIndex).toBe(0);

    const t20 = createThrow(20, 3);
    match = addThrow(match, t20);
    match = addThrow(match, t20);
    match = addThrow(match, t20);
    expect(match.currentTurnDarts.length).toBe(3);

    match = confirmTurn(match);
    expect(match.players[0].currentScore).toBe(321);
    expect(match.players[0].count180).toBe(1);
    expect(match.activePlayerIndex).toBe(1); // Rotated to Anissa
    expect(match.currentTurnDarts.length).toBe(0);
  });

  it('completes a leg and alternates starting player for the next leg', () => {
    let match = createMatch([player1, player2], { ...baseSettings, startingScore: 301 });
    
    // Player 1 checkout on 40 with D20
    match.players[0].currentScore = 40;
    match = addThrow(match, createThrow(20, 2));
    match = confirmTurn(match);

    expect(match.legs.length).toBe(1);
    expect(match.legs[0].winnerPlayerId).toBe('p1');
    expect(match.players[0].legsWon).toBe(1);
    expect(match.currentLegNumber).toBe(2);
    // Leg 2 starting player should be Player 2
    expect(match.activePlayerIndex).toBe(1);
    expect(match.players[0].currentScore).toBe(301);
  });

  it('completes match when target legs reached', () => {
    let match = createMatch([player1, player2], { ...baseSettings, legsToWin: 1, startingScore: 301 });
    match.players[0].currentScore = 50;
    match = addThrow(match, createThrow(25, 2)); // BULL
    match = confirmTurn(match);

    expect(match.status).toBe('completed');
    expect(match.winnerPlayerId).toBe('p1');
  });

  it('supports editing a past turn and safely recalculates the entire match state', () => {
    let match = createMatch([player1, player2], baseSettings);
    
    // Turn 1 (Ajwad): 60 + 60 + 60 = 180 -> Score: 321
    const t20 = createThrow(20, 3);
    match = addThrow(match, t20);
    match = addThrow(match, t20);
    match = addThrow(match, t20);
    match = confirmTurn(match);

    // Turn 2 (Anissa): 20 + 20 + 20 = 60 -> Score: 441
    const s20 = createThrow(20, 1);
    match = addThrow(match, s20);
    match = addThrow(match, s20);
    match = addThrow(match, s20);
    match = confirmTurn(match);

    const firstTurnId = match.historyTimeline[1].id; // older turn

    // Edit Ajwad's first turn from 180 to 100 (T20 + 20 + 20)
    const newDarts = [createThrow(20, 3), createThrow(20, 1), createThrow(20, 1)];
    const recalculated = editTurnAndRecalculate(match, firstTurnId, newDarts);

    // Ajwad's score should now be 501 - 100 = 401
    expect(recalculated.players[0].currentScore).toBe(401);
    // Anissa's score should remain 441
    expect(recalculated.players[1].currentScore).toBe(441);
  });

  it('correctly reverts a confirmed visit with undoLastCompletedTurn', () => {
    let match = createMatch([player1, player2], baseSettings);

    // Player 1 throws 60 + 60 + 60 = 180 and confirms
    match = addThrow(match, createThrow(20, 3));
    match = addThrow(match, createThrow(20, 3));
    match = addThrow(match, createThrow(20, 3));
    match = confirmTurn(match);

    expect(match.players[0].currentScore).toBe(321);
    expect(match.activePlayerIndex).toBe(1); // turned to player 2
    expect(match.currentTurnDarts.length).toBe(0);

    // User realizes they made a mistake and reverts the visit
    const reverted = undoLastCompletedTurn(match);

    // Score reverted back to 501
    expect(reverted.players[0].currentScore).toBe(501);
    // Active player returned to Player 1
    expect(reverted.activePlayerIndex).toBe(0);
    // The 3 darts are restored into currentTurnDarts so user can edit or undo
    expect(reverted.currentTurnDarts.length).toBe(3);
    expect(reverted.currentTurnDarts[0].label).toBe('T20');
  });
});
