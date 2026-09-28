'use client';

import React, { useState } from 'react';
import { Match, Throw, Turn } from '@/types/dart';
import { ChevronLeft, Trophy, Calendar, Eye, Edit3, Check, X } from 'lucide-react';
import { createThrow } from '@/engine/scoring/scoringEngine';

interface MatchHistoryProps {
  matches: Match[];
  onSelectMatch: (m: Match) => void;
  onEditTurn?: (matchId: string, turnId: string, newDarts: Throw[]) => void;
  onBack: () => void;
}

export const MatchHistory: React.FC<MatchHistoryProps> = ({
  matches,
  onSelectMatch,
  onEditTurn,
  onBack,
}) => {
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [editingTurnId, setEditingTurnId] = useState<string | null>(null);
  const [editDartsInput, setEditDartsInput] = useState<string>('');

  const toggleExpand = (id: string) => {
    setExpandedMatchId(expandedMatchId === id ? null : id);
  };

  const startEditTurn = (turn: Turn) => {
    setEditingTurnId(turn.id);
    setEditDartsInput(turn.darts.map((d) => d.label).join(', '));
  };

  const saveEditTurn = (matchId: string) => {
    if (!editingTurnId || !onEditTurn) return;

    // Parse input labels like "T20, 20, D10"
    const labels = editDartsInput.split(',').map((s) => s.trim().toUpperCase());
    const parsedDarts: Throw[] = [];

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
      onEditTurn(matchId, editingTurnId, parsedDarts);
    }
    setEditingTurnId(null);
  };

  return (
    <div className="min-h-screen bg-[#090b0e] text-zinc-100 flex flex-col p-4 sm:p-8">
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
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
            MATCH ARCHIVE & TIMELINE
          </h1>
          <div className="w-16" />
        </div>

        {/* Matches List */}
        <div className="flex flex-col gap-3">
          {matches.map((m) => {
            const isExpanded = expandedMatchId === m.id;
            const p1 = m.players[0];
            const p2 = m.players[1];
            const winner = m.players.find((p) => p.player.id === m.winnerPlayerId);

            return (
              <div
                key={m.id}
                className="bg-[#11141a] border border-zinc-800 rounded-xl overflow-hidden shadow-lg"
              >
                {/* Match Summary Bar */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400">
                      <Trophy className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-white uppercase">
                          {p1?.player.name} vs {p2?.player.name || 'Opponent'}
                        </span>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                          {m.settings.startingScore}
                        </span>
                      </div>

                      <div className="text-xs text-zinc-400 font-mono mt-1">
                        {p1?.legsWon} - {p2?.legsWon} · Winner:{' '}
                        <span className="text-emerald-400 font-bold">
                          {winner?.player.name || 'In Progress'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => onSelectMatch(m)}
                      className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-300 flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>STATS</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleExpand(m.id)}
                      className="px-3 py-1.5 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-xs font-bold text-emerald-300 transition-colors"
                    >
                      {isExpanded ? 'HIDE TIMELINE' : 'VIEW TIMELINE'}
                    </button>
                  </div>
                </div>

                {/* Expanded Turn-by-Turn Timeline */}
                {isExpanded && (
                  <div className="border-t border-zinc-800 bg-[#0c0e14] p-4 sm:p-5 flex flex-col gap-3">
                    <span className="text-xs uppercase font-bold tracking-wider text-zinc-400">
                      VISIT TIMELINE (CHRONOLOGICAL)
                    </span>

                    {m.historyTimeline.length > 0 ? (
                      <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
                        {[...m.historyTimeline].reverse().map((turn, tIdx) => {
                          const turnPlayer = m.players.find(
                            (p) => p.player.id === turn.playerId
                          );
                          const isEditing = editingTurnId === turn.id;

                          return (
                            <div
                              key={turn.id}
                              className="p-3 rounded bg-zinc-900/90 border border-zinc-800 flex items-center justify-between font-mono text-xs"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-zinc-600 font-bold">#{tIdx + 1}</span>
                                <span className="font-bold text-white uppercase">
                                  {turnPlayer?.player.name}:
                                </span>

                                {isEditing ? (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={editDartsInput}
                                      onChange={(e) => setEditDartsInput(e.target.value)}
                                      placeholder="T20, T19, D10"
                                      className="bg-black border border-emerald-500 px-2 py-1 rounded text-white text-xs w-44"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => saveEditTurn(m.id)}
                                      className="p-1 bg-emerald-600 text-white rounded"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingTurnId(null)}
                                      className="p-1 bg-zinc-800 text-zinc-400 rounded"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="text-zinc-300">
                                      {turn.darts.map((d) => d.label).join(' · ')}
                                    </span>
                                    <span className="text-emerald-400 font-bold">
                                      ({turn.isBust ? 'BUST' : turn.total})
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="text-zinc-500">
                                  {turn.scoreBefore} → {turn.scoreAfter}
                                </span>

                                {!isEditing && onEditTurn && (
                                  <button
                                    type="button"
                                    onClick={() => startEditTurn(turn)}
                                    className="p-1 text-zinc-500 hover:text-zinc-300"
                                    title="Edit this visit & recalculate"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-zinc-600 font-mono text-xs">
                        No visits recorded yet.
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
