'use client';

import React from 'react';
import { Match } from '@/types/dart';
import { calculatePlayerStats } from '@/engine/statistics/statisticsEngine';
import { Trophy, RotateCcw, Home, PlusCircle, Award } from 'lucide-react';

interface MatchSummaryProps {
  match: Match;
  onRematch: () => void;
  onNewMatch: () => void;
  onHome: () => void;
}

export const MatchSummary: React.FC<MatchSummaryProps> = ({
  match,
  onRematch,
  onNewMatch,
  onHome,
}) => {
  const winner = match.players.find((p) => p.player.id === match.winnerPlayerId);
  const playerStatsList = match.players.map((p) =>
    calculatePlayerStats(p, match.legs)
  );

  return (
    <div className="min-h-screen bg-[#090b0e] text-zinc-100 flex flex-col justify-between p-4 sm:p-8">
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
        {/* Match Winner Banner */}
        {winner && (
          <div className="relative overflow-hidden bg-gradient-to-b from-[#141d1a] to-[#0f141a] border border-emerald-500/40 rounded-xl p-6 sm:p-8 text-center shadow-2xl">
            <div className="flex items-center justify-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-widest font-bold mb-2">
              <Award className="w-4 h-4" />
              <span>MATCH RESULT</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-wider text-white mb-2">
              {winner.player.name}
            </h1>

            <div className="inline-block px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-600/50 text-emerald-400 font-mono font-bold text-sm sm:text-base tracking-widest mb-4">
              VICTORY · {winner.legsWon} -{' '}
              {match.players.find((p) => p.player.id !== winner.player.id)?.legsWon || 0}
            </div>

            <p className="text-xs sm:text-sm text-zinc-400 font-mono">
              {match.settings.startingScore} · {match.settings.outRule.replace('_', ' ').toUpperCase()} ·{' '}
              {match.settings.legsToWin} LEGS TARGET
            </p>
          </div>
        )}

        {/* Head-to-Head Statistics Table */}
        <div className="bg-[#11141a] border border-zinc-800 rounded-xl p-4 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
              OFFICIAL MATCH STATISTICS
            </h2>
            <span className="font-mono text-xs text-zinc-500">
              {new Date(match.startTime).toLocaleDateString()}
            </span>
          </div>

          {/* Player Columns */}
          <div className="grid grid-cols-3 text-center border-b border-zinc-800 pb-3 font-mono font-bold text-sm sm:text-base">
            <div className="text-left text-emerald-400 truncate">
              {match.players[0]?.player.name}
            </div>
            <div className="text-zinc-500 text-xs font-semibold tracking-wider uppercase">
              METRIC
            </div>
            <div className="text-right text-blue-400 truncate">
              {match.players[1]?.player.name || 'Opponent'}
            </div>
          </div>

          {/* Stats Rows */}
          <div className="flex flex-col divide-y divide-zinc-900 font-mono text-xs sm:text-sm">
            <StatRow
              label="3-DART AVERAGE"
              val1={playerStatsList[0]?.threeDartAverage.toFixed(1) || '0.0'}
              val2={playerStatsList[1]?.threeDartAverage.toFixed(1) || '0.0'}
              highlightHigh
            />

            <StatRow
              label="FIRST 9 AVERAGE"
              val1={playerStatsList[0]?.first9Average.toFixed(1) || '0.0'}
              val2={playerStatsList[1]?.first9Average.toFixed(1) || '0.0'}
              highlightHigh
            />

            <StatRow
              label="CHECKOUT %"
              val1={`${playerStatsList[0]?.checkoutPercentage}% (${playerStatsList[0]?.checkoutHits}/${playerStatsList[0]?.checkoutAttempts})`}
              val2={`${playerStatsList[1]?.checkoutPercentage}% (${playerStatsList[1]?.checkoutHits}/${playerStatsList[1]?.checkoutAttempts})`}
            />

            <StatRow
              label="HIGHEST CHECKOUT"
              val1={playerStatsList[0]?.highestCheckout || '-'}
              val2={playerStatsList[1]?.highestCheckout || '-'}
              highlightHigh
            />

            <StatRow
              label="180 MAXIMUMS"
              val1={playerStatsList[0]?.count180 || 0}
              val2={playerStatsList[1]?.count180 || 0}
              highlightHigh
            />

            <StatRow
              label="140+ SCORES"
              val1={playerStatsList[0]?.count140Plus || 0}
              val2={playerStatsList[1]?.count140Plus || 0}
            />

            <StatRow
              label="100+ SCORES"
              val1={playerStatsList[0]?.count100Plus || 0}
              val2={playerStatsList[1]?.count100Plus || 0}
            />

            <StatRow
              label="DARTS THROWN"
              val1={playerStatsList[0]?.totalDartsThrown || 0}
              val2={playerStatsList[1]?.totalDartsThrown || 0}
            />

            <StatRow
              label="BEST LEG"
              val1={playerStatsList[0]?.bestLegDarts ? `${playerStatsList[0].bestLegDarts} darts` : '-'}
              val2={playerStatsList[1]?.bestLegDarts ? `${playerStatsList[1].bestLegDarts} darts` : '-'}
            />
          </div>
        </div>

        {/* Leg-by-Leg Breakdown */}
        {match.legs.length > 0 && (
          <div className="bg-[#11141a] border border-zinc-800 rounded-xl p-4 sm:p-6 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
              LEG BREAKDOWN
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {match.legs.map((leg) => {
                const legWinner = match.players.find(
                  (p) => p.player.id === leg.winnerPlayerId
                );
                return (
                  <div
                    key={leg.legNumber}
                    className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono flex items-center justify-between"
                  >
                    <div>
                      <span className="text-zinc-500 font-bold">LEG {leg.legNumber}</span>
                      <div className="font-bold text-white mt-0.5">
                        {legWinner?.player.name}
                      </div>
                    </div>
                    {leg.winningCheckout && (
                      <div className="text-right">
                        <span className="text-emerald-400 font-bold">
                          {leg.winningCheckout.checkoutLabel}
                        </span>
                        <div className="text-zinc-500 text-[10px]">
                          {leg.winningCheckout.dartsUsed} darts
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            onClick={onRematch}
            className="py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-emerald-950/40"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REMATCH</span>
          </button>

          <button
            type="button"
            onClick={onNewMatch}
            className="py-3 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all border border-zinc-700"
          >
            <PlusCircle className="w-4 h-4" />
            <span>NEW MATCH</span>
          </button>

          <button
            type="button"
            onClick={onHome}
            className="py-3 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all border border-zinc-800"
          >
            <Home className="w-4 h-4" />
            <span>HOME</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const StatRow: React.FC<{
  label: string;
  val1: string | number;
  val2: string | number;
  highlightHigh?: boolean;
}> = ({ label, val1, val2, highlightHigh }) => {
  return (
    <div className="grid grid-cols-3 py-2.5 items-center">
      <div className="text-left font-bold text-white">{val1}</div>
      <div className="text-center text-zinc-400 text-xs uppercase tracking-wide">
        {label}
      </div>
      <div className="text-right font-bold text-white">{val2}</div>
    </div>
  );
};
