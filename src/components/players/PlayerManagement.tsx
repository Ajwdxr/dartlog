'use client';

import React, { useState } from 'react';
import { Player, Match } from '@/types/dart';
import { calculatePlayerStats } from '@/engine/statistics/statisticsEngine';
import { ChevronLeft, Plus, User, Trophy, Target, Award, Trash2 } from 'lucide-react';

interface PlayerManagementProps {
  players: Player[];
  matches: Match[];
  onCreatePlayer: (name: string, nickname?: string, color?: string) => Promise<void>;
  onDeletePlayer: (id: string) => Promise<void>;
  onBack: () => void;
}

export const PlayerManagement: React.FC<PlayerManagementProps> = ({
  players,
  matches,
  onCreatePlayer,
  onDeletePlayer,
  onBack,
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player>(players[0] || null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [color, setColor] = useState('#10b981');

  // Compute aggregated stats for selected player across all historical matches
  const computeAggregatedStats = (player: Player) => {
    let matchesPlayed = 0;
    let matchesWon = 0;
    let legsWon = 0;
    let totalDarts = 0;
    let totalPoints = 0;
    let highestCheckout = 0;
    let count180 = 0;
    let checkoutAttempts = 0;
    let checkoutHits = 0;
    let bestLegDarts: number | null = null;
    let bestMatchAvg: number | null = null;

    matches.forEach((m) => {
      const matchP = m.players.find((p) => p.player.id === player.id);
      if (matchP) {
        matchesPlayed++;
        if (m.winnerPlayerId === player.id) matchesWon++;

        legsWon += matchP.legsWon;
        totalDarts += matchP.totalDartsThrown;
        totalPoints += matchP.totalPointsScored;
        highestCheckout = Math.max(highestCheckout, matchP.highestCheckout);
        count180 += matchP.count180;
        checkoutAttempts += matchP.checkoutAttempts;
        checkoutHits += matchP.checkoutHits;

        const mStats = calculatePlayerStats(matchP, m.legs);
        if (mStats.bestLegDarts) {
          if (bestLegDarts === null || mStats.bestLegDarts < bestLegDarts) {
            bestLegDarts = mStats.bestLegDarts;
          }
        }
        if (bestMatchAvg === null || mStats.threeDartAverage > bestMatchAvg) {
          bestMatchAvg = mStats.threeDartAverage;
        }
      }
    });

    const average = totalDarts > 0 ? ((totalPoints / totalDarts) * 3).toFixed(1) : '0.0';
    const checkoutPct =
      checkoutAttempts > 0
        ? `${((checkoutHits / checkoutAttempts) * 100).toFixed(1)}%`
        : '0.0%';

    return {
      matchesPlayed,
      matchesWon,
      matchesLost: matchesPlayed - matchesWon,
      winRate: matchesPlayed > 0 ? `${((matchesWon / matchesPlayed) * 100).toFixed(0)}%` : '0%',
      legsWon,
      average,
      highestCheckout: highestCheckout || '-',
      checkoutPct,
      count180,
      bestLegDarts: bestLegDarts ? `${bestLegDarts} darts` : '-',
      bestMatchAvg:
        bestMatchAvg !== null ? `${Number(bestMatchAvg).toFixed(1)}` : '-',
    };
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onCreatePlayer(name.trim(), nickname.trim() || undefined, color);
    setName('');
    setNickname('');
    setShowCreateModal(false);
  };

  const stats = selectedPlayer ? computeAggregatedStats(selectedPlayer) : null;

  return (
    <div className="min-h-screen bg-[#090b0e] text-zinc-100 flex flex-col p-4 sm:p-8">
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>HOME</span>
          </button>
          <h1 className="text-xl font-bold uppercase tracking-wider text-white">
            PLAYER MANAGEMENT
          </h1>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-bold transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>ADD PLAYER</span>
          </button>
        </div>

        {/* Player Grid & Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Player Roster List */}
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase font-bold tracking-wider text-zinc-400">
              ROSTER ({players.length})
            </label>
            <div className="flex flex-col gap-1.5">
              {players.map((p) => {
                const isSelected = selectedPlayer?.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlayer(p)}
                    className={`p-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-[#151c27] border-emerald-500 text-white ring-1 ring-emerald-500'
                        : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0"
                        style={{ backgroundColor: p.avatarColor }}
                      >
                        {p.initials}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">{p.name}</div>
                        {p.nickname && (
                          <div className="text-[11px] text-zinc-400 italic">
                            "{p.nickname}"
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Player Profile & Lifetime Career Stats */}
          {selectedPlayer && stats && (
            <div className="md:col-span-2 flex flex-col gap-4">
              <div className="bg-[#11141a] border border-zinc-800 rounded-xl p-5 sm:p-6 flex flex-col gap-6 shadow-xl">
                {/* Profile Header */}
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl text-white shadow-lg shrink-0"
                      style={{ backgroundColor: selectedPlayer.avatarColor }}
                    >
                      {selectedPlayer.initials}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black uppercase text-white tracking-wide">
                        {selectedPlayer.name}
                      </h2>
                      {selectedPlayer.nickname && (
                        <p className="text-sm text-emerald-400 italic">
                          "{selectedPlayer.nickname}"
                        </p>
                      )}
                    </div>
                  </div>

                  {players.length > 2 && (
                    <button
                      type="button"
                      onClick={() => onDeletePlayer(selectedPlayer.id)}
                      className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
                      title="Delete Player"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Lifetime Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-zinc-400">
                      CAREER AVG
                    </span>
                    <span className="font-mono font-black text-2xl text-emerald-400 mt-1">
                      {stats.average}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-zinc-400">
                      WIN RATE
                    </span>
                    <span className="font-mono font-black text-2xl text-white mt-1">
                      {stats.winRate}
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">
                      {stats.matchesWon}W - {stats.matchesLost}L
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-zinc-400">
                      180 MAXIMUMS
                    </span>
                    <span className="font-mono font-black text-2xl text-amber-400 mt-1">
                      {stats.count180}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-zinc-400">
                      CHECKOUT %
                    </span>
                    <span className="font-mono font-black text-2xl text-white mt-1">
                      {stats.checkoutPct}
                    </span>
                  </div>
                </div>

                {/* Secondary Records */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-zinc-800/80 pt-4 font-mono text-xs">
                  <div className="flex justify-between py-1 border-b border-zinc-900">
                    <span className="text-zinc-400">HIGHEST CHECKOUT:</span>
                    <span className="font-bold text-white">{stats.highestCheckout}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-900">
                    <span className="text-zinc-400">BEST LEG:</span>
                    <span className="font-bold text-white">{stats.bestLegDarts}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-900">
                    <span className="text-zinc-400">BEST MATCH AVG:</span>
                    <span className="font-bold text-white">{stats.bestMatchAvg}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="bg-[#11141a] border border-zinc-700 rounded-xl p-6 max-w-md w-full shadow-2xl">
              <h2 className="text-lg font-bold uppercase tracking-wider text-white mb-4">
                CREATE NEW PLAYER
              </h2>
              <form onSubmit={handleCreate} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs uppercase font-bold text-zinc-400">NAME</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Player Name"
                    className="w-full mt-1 bg-zinc-900 border border-zinc-700 px-3 py-2 rounded text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase font-bold text-zinc-400">
                    NICKNAME (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="e.g. The Bullseye Master"
                    className="w-full mt-1 bg-zinc-900 border border-zinc-700 px-3 py-2 rounded text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase font-bold text-zinc-400">
                    AVATAR COLOR
                  </label>
                  <div className="flex gap-2 mt-1">
                    {['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'].map(
                      (c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className={`w-7 h-7 rounded-full border-2 transition-all ${
                            color === c ? 'border-white scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      )
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded shadow-md"
                  >
                    CREATE
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
