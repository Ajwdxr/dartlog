'use client';

import React, { useState } from 'react';
import { Match, Throw } from '@/types/dart';
import { calculatePlayerStats } from '@/engine/statistics/statisticsEngine';
import { getActiveTurnPreview } from '@/engine/game/gameEngine';
import { CheckoutGuide } from '../checkout/CheckoutGuide';
import { InteractiveDartboard } from '../dartboard/InteractiveDartboard';
import { ScoringKeypad } from '../scoring/ScoringKeypad';
import {
  RotateCcw,
  Check,
  Volume2,
  VolumeX,
  ChevronLeft,
  LayoutGrid,
  Disc,
  AlertTriangle,
  Trophy,
  Edit3,
  X,
} from 'lucide-react';
import { createThrow } from '@/engine/scoring/scoringEngine';

interface LiveMatchHUDProps {
  match: Match;
  soundEnabled: boolean;
  onThrow: (val: number, mult: any) => void;
  onUndo: () => void;
  onConfirm: () => void;
  onEditTurn?: (turnId: string, newDarts: Throw[]) => void;
  onToggleSound: () => void;
  onExit: () => void;
}

export const LiveMatchHUD: React.FC<LiveMatchHUDProps> = ({
  match,
  soundEnabled,
  onThrow,
  onUndo,
  onConfirm,
  onEditTurn,
  onToggleSound,
  onExit,
}) => {
  const [inputMode, setInputMode] = useState<'board' | 'keypad' | 'both'>('both');
  const [editingTurn, setEditingTurn] = useState<any>(null);
  const [editInput, setEditInput] = useState<string>('');

  const activeIdx = match.activePlayerIndex;
  const activePlayer = match.players[activeIdx];
  const darts = match.currentTurnDarts;
  const dartsLeft = 3 - darts.length;

  const preview = getActiveTurnPreview(match);

  // Stats for all players
  const playerStatsList = match.players.map((p) =>
    calculatePlayerStats(p, match.legs)
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#090b0e] text-zinc-100 selection:bg-emerald-800">
      {/* Top Professional Tournament Header */}
      <header className="flex items-center justify-between px-3 sm:px-6 py-2.5 bg-[#0e1218] border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>EXIT MATCH</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
              {match.settings.startingScore}
            </span>
            <span className="text-xs text-zinc-400 font-medium hidden sm:inline">
              {match.settings.inRule === 'double_in' ? 'Double In' : 'Single In'} ·{' '}
              {match.settings.outRule.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        <div className="text-center font-mono text-xs text-zinc-400">
          <span>LEG {match.currentLegNumber}</span>
          {match.settings.format === 'sets_and_legs' && (
            <span> · SET {match.currentSetNumber}</span>
          )}
          <span className="text-zinc-500 ml-1.5 hidden sm:inline">
            (FIRST TO {match.settings.legsToWin} LEGS)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Input Mode Toggle (Mobile / Tablet / Desktop) */}
          <div className="flex rounded bg-zinc-900 border border-zinc-800 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setInputMode('board')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                inputMode === 'board' ? 'bg-zinc-700 text-white' : 'text-zinc-400'
              }`}
              title="Dartboard input"
            >
              <Disc className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setInputMode('keypad')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                inputMode === 'keypad' ? 'bg-zinc-700 text-white' : 'text-zinc-400'
              }`}
              title="Keypad input"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setInputMode('both')}
              className={`px-2 py-1 rounded font-medium hidden md:block transition-colors ${
                inputMode === 'both' ? 'bg-zinc-700 text-white' : 'text-zinc-400'
              }`}
              title="Dual side-by-side view"
            >
              SPLIT
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleSound}
            className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white"
            title="Toggle sound effects"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main Players Scoreboard Strip */}
      <section className="grid grid-cols-2 md:grid-cols-2 gap-2 sm:gap-4 p-2 sm:p-4 max-w-6xl mx-auto w-full">
        {match.players.map((p, idx) => {
          const isActive = idx === activeIdx;
          const stats = playerStatsList[idx];
          const displayScore = isActive ? preview.scoreAfter : p.currentScore;

          return (
            <div
              key={p.player.id}
              className={`relative flex flex-col justify-between p-3 sm:p-5 rounded-lg border transition-all ${
                isActive
                  ? 'bg-[#121722] border-emerald-500/70 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/30'
                  : 'bg-[#0e1218]/90 border-zinc-800/80 opacity-80'
              }`}
            >
              {/* Active Indicator & Name */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: p.player.avatarColor }}
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-sm sm:text-base tracking-wide uppercase text-white truncate max-w-[120px] sm:max-w-[180px]">
                      {p.player.name}
                    </span>
                    {p.player.nickname && (
                      <span className="text-[10px] text-zinc-400 italic">
                        "{p.player.nickname}"
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Legs Won Counter */}
                  <div className="flex items-center gap-1 font-mono text-xs sm:text-sm font-bold bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    <Trophy className="w-3 h-3 text-amber-400" />
                    <span className="text-white">{p.legsWon}</span>
                    <span className="text-zinc-500 text-[10px]">LEGS</span>
                  </div>
                </div>
              </div>

              {/* Massive Score Number (Tabular & High-Contrast) */}
              <div className="my-2 sm:my-3 text-center">
                <div
                  className={`font-mono font-black text-5xl sm:text-7xl lg:text-8xl tracking-tight tabular-nums ${
                    isActive ? 'text-white' : 'text-zinc-400'
                  }`}
                >
                  {displayScore}
                </div>
              </div>

              {/* Bottom Averages & Stats Strip */}
              <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800/80 font-mono">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-zinc-400 font-bold">AVG</span>
                  <span className="font-bold text-zinc-200 text-xs sm:text-sm">
                    {stats.threeDartAverage.toFixed(1)}
                  </span>
                </div>

                <div className="flex flex-col text-center">
                  <span className="text-[10px] uppercase text-zinc-400 font-bold">FIRST 9</span>
                  <span className="font-bold text-zinc-300 text-xs sm:text-sm">
                    {stats.first9Average.toFixed(1)}
                  </span>
                </div>

                <div className="flex flex-col text-right">
                  <span className="text-[10px] uppercase text-zinc-400 font-bold">DARTS</span>
                  <span className="font-bold text-zinc-300 text-xs sm:text-sm">
                    {p.dartsThrownInLeg + (isActive ? darts.length : 0)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Visit Status Bar & Three-Dart Flow Preview */}
      <section className="max-w-6xl mx-auto w-full px-2 sm:px-4 py-2">
        <div className="bg-[#12161f] border border-zinc-800 rounded-lg p-3 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
          {/* Current Throw 3 Darts */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
                VISIT DARTS
              </span>
              <div className="flex items-center gap-2 mt-1">
                {[0, 1, 2].map((slotIdx) => {
                  const dart = darts[slotIdx];
                  return (
                    <div
                      key={slotIdx}
                      className={`w-12 sm:w-14 h-10 rounded border flex flex-col items-center justify-center font-mono font-bold transition-all ${
                        dart
                          ? 'bg-zinc-800 border-emerald-500/70 text-emerald-300'
                          : slotIdx === darts.length
                          ? 'bg-zinc-900 border-zinc-700 text-zinc-600 animate-pulse'
                          : 'bg-zinc-950 border-zinc-900 text-zinc-800'
                      }`}
                    >
                      {dart ? (
                        <>
                          <span className="text-xs sm:text-sm">{dart.label}</span>
                          <span className="text-[9px] text-zinc-400 font-normal">
                            +{dart.score}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-zinc-600">D{slotIdx + 1}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Visit Total and Score Transition */}
            <div className="flex items-center gap-3 pl-3 md:border-l border-zinc-800 font-mono">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
                  THROW TOTAL
                </span>
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {preview.totalTurnScore}
                </span>
              </div>

              {preview.totalTurnScore > 0 && !preview.isBust && (
                <div className="text-xs text-zinc-400 hidden sm:block">
                  <span>{preview.scoreBefore}</span>
                  <span className="mx-1 text-emerald-400">→</span>
                  <span className="text-emerald-300 font-bold">{preview.scoreAfter}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bust / Checkout Alert Notification */}
          {preview.isBust && (
            <div className="w-full md:w-auto px-4 py-2 rounded bg-red-950/80 border border-red-600 text-red-300 flex items-center gap-2 font-mono text-xs sm:text-sm font-bold">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>BUST! {preview.scoreBefore} REMAINS</span>
              <span className="text-[11px] text-red-200/80 font-normal hidden lg:inline">
                ({preview.bustReason})
              </span>
            </div>
          )}

          {preview.isCheckout && (
            <div className="w-full md:w-auto px-4 py-2 rounded bg-emerald-950/90 border border-emerald-500 text-emerald-300 flex items-center gap-2 font-mono text-xs sm:text-sm font-bold">
              <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
              <span>GAME SHOT! {preview.scoreBefore} CHECKOUT</span>
            </div>
          )}

          {/* Quick Undo & Confirm Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              type="button"
              disabled={darts.length === 0 && match.historyTimeline.length === 0}
              onClick={onUndo}
              className={`flex-1 md:flex-none px-3 py-2 rounded font-bold text-xs border flex items-center justify-center gap-1.5 active:scale-95 transition-all ${
                darts.length > 0
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                  : match.historyTimeline.length > 0
                  ? 'bg-amber-950/80 hover:bg-amber-900 border-amber-600/70 text-amber-300 shadow-sm'
                  : 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed opacity-40'
              }`}
              title={darts.length > 0 ? 'Undo last thrown dart' : 'Revert the last confirmed visit'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>
                {darts.length > 0
                  ? 'UNDO DART'
                  : match.historyTimeline.length > 0
                  ? `UNDO VISIT (${match.historyTimeline[0].isBust ? 'BUST' : `+${match.historyTimeline[0].total}`})`
                  : 'UNDO'}
              </span>
            </button>

            <button
              type="button"
              disabled={darts.length === 0}
              onClick={onConfirm}
              className={`flex-1 md:flex-none px-4 py-2 rounded font-bold text-xs border flex items-center justify-center gap-1 transition-all active:scale-95 ${
                darts.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-md animate-pulse'
                  : 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>CONFIRM TURN</span>
            </button>
          </div>
        </div>
      </section>

      {/* Checkout Guide Banner */}
      <section className="max-w-6xl mx-auto w-full px-2 sm:px-4">
        <CheckoutGuide
          score={preview.scoreAfter}
          dartsRemaining={dartsLeft > 0 ? dartsLeft : 3}
          outRule={match.settings.outRule}
        />
      </section>

      {/* Main Interactive Scoring Panel (Dartboard & Keypad) */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-2 sm:px-4 py-2">
        <div
          className={`grid gap-4 items-center justify-center ${
            inputMode === 'both'
              ? 'grid-cols-1 lg:grid-cols-2'
              : 'grid-cols-1'
          }`}
        >
          {/* Interactive Realistic Dartboard */}
          {(inputMode === 'board' || inputMode === 'both') && (
            <div className="flex flex-col items-center justify-center bg-[#0d1017] p-2 rounded-lg border border-zinc-900">
              <InteractiveDartboard
                onThrow={onThrow}
                disabled={darts.length >= 3}
              />
            </div>
          )}

          {/* Fast Touch Scoring Keypad */}
          {(inputMode === 'keypad' || inputMode === 'both') && (
            <div className="flex flex-col items-center justify-center bg-[#0d1017] p-3 sm:p-4 rounded-lg border border-zinc-900 w-full">
              <ScoringKeypad
                onThrow={onThrow}
                onUndo={onUndo}
                onConfirm={onConfirm}
                canConfirm={darts.length > 0}
                canUndo={darts.length > 0}
                dartsCount={darts.length}
              />
            </div>
          )}
        </div>
      </main>

      {/* Recent Match Timeline Footer */}
      {match.historyTimeline.length > 0 && (
        <footer className="bg-[#0b0e14] border-t border-zinc-900 px-3 sm:px-6 py-2">
          <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-zinc-500">
            <span className="font-bold uppercase tracking-wider text-zinc-400">
              RECENT VISITS:
            </span>
            <div className="flex items-center gap-3 overflow-x-auto py-1">
              {match.historyTimeline.slice(0, 4).map((turn) => {
                const turnPlayer = match.players.find(
                  (p) => p.player.id === turn.playerId
                );
                return (
                  <div
                    key={turn.id}
                    className="flex items-center gap-1.5 font-mono bg-zinc-900/90 border border-zinc-800 px-2.5 py-1 rounded shrink-0 text-[11px] group"
                  >
                    <span className="font-bold text-zinc-300">
                      {turnPlayer?.player.name || 'Player'}:
                    </span>
                    <span className="text-emerald-400 font-bold">
                      {turn.isBust ? 'BUST' : `+${turn.total}`}
                    </span>
                    <span className="text-zinc-500">
                      ({turn.darts.map((d) => d.label).join(' · ')})
                    </span>
                    {onEditTurn && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTurn(turn);
                          setEditInput(turn.darts.map((d: any) => d.label).join(', '));
                        }}
                        className="text-zinc-600 hover:text-amber-400 p-0.5 transition-colors ml-0.5"
                        title="Edit this visit"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </footer>
      )}

      {/* Inline Visit Edit Modal */}
      {editingTurn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="bg-[#12161f] border border-amber-600/50 rounded-xl p-5 max-w-sm w-full shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="font-mono font-bold text-xs uppercase text-amber-400 tracking-wider">
                EDIT VISIT
              </span>
              <button
                type="button"
                onClick={() => setEditingTurn(null)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-zinc-400">
                Player: <strong className="text-white uppercase">{match.players.find((p) => p.player.id === editingTurn.playerId)?.player.name}</strong>
              </span>
              <span className="text-[11px] text-zinc-500">
                Enter darts separated by comma (e.g. <code className="text-emerald-400">T20, 20, D10</code> or <code className="text-emerald-400">MISS, BULL, 25</code>):
              </span>
              <input
                type="text"
                autoFocus
                value={editInput}
                onChange={(e) => setEditInput(e.target.value)}
                className="bg-black border border-amber-500/70 font-mono font-bold text-sm text-white px-3 py-2 rounded focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditingTurn(null)}
                className="flex-1 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!onEditTurn) return;
                  const labels = editInput.split(',').map((s) => s.trim().toUpperCase());
                  const parsedDarts: any[] = [];
                  for (const lbl of labels) {
                    if (!lbl) continue;
                    if (lbl === 'BULL') parsedDarts.push(createThrow(25, 2));
                    else if (lbl === '25') parsedDarts.push(createThrow(25, 1));
                    else if (lbl === 'MISS' || lbl === '0') parsedDarts.push(createThrow(0, 0));
                    else if (lbl.startsWith('T')) {
                      const val = parseInt(lbl.substring(1), 10);
                      if (!isNaN(val)) parsedDarts.push(createThrow(val, 3));
                    } else if (lbl.startsWith('D')) {
                      const val = parseInt(lbl.substring(1), 10);
                      if (!isNaN(val)) parsedDarts.push(createThrow(val, 2));
                    } else {
                      const val = parseInt(lbl, 10);
                      if (!isNaN(val)) parsedDarts.push(createThrow(val, 1));
                    }
                  }
                  if (parsedDarts.length > 0) {
                    onEditTurn(editingTurn.id, parsedDarts);
                  }
                  setEditingTurn(null);
                }}
                className="flex-1 py-2 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase"
              >
                SAVE & RECALCULATE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
