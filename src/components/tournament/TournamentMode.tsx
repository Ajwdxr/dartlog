'use client';

import React, { useState } from 'react';
import { MatchSettings, Player, Tournament, TournamentMatchNode } from '@/types/dart';
import { ChevronLeft, Trophy, Play, Plus, Users } from 'lucide-react';

interface TournamentModeProps {
  tournaments: Tournament[];
  players: Player[];
  onStartTournament: (
    name: string,
    type: 'single_elimination' | 'round_robin',
    settings: MatchSettings,
    playerIds: string[]
  ) => void;
  onPlayMatch: (matchNodeId: string) => void;
  onBack: () => void;
}

export const TournamentMode: React.FC<TournamentModeProps> = ({
  tournaments,
  players,
  onStartTournament,
  onPlayMatch,
  onBack,
}) => {
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(
    tournaments[0] || null
  );
  const [showSetup, setShowSetup] = useState(tournaments.length === 0);

  const [tourneyName, setTourneyName] = useState('Friday Night Darts Championship');
  const [tourneyType, setTourneyType] = useState<'single_elimination' | 'round_robin'>('single_elimination');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>(
    players.slice(0, 4).map((p) => p.id)
  );

  const handleCreate = () => {
    if (selectedPlayerIds.length < 2) return;

    const settings: MatchSettings = {
      startingScore: 501,
      inRule: 'straight_in',
      outRule: 'double_out',
      legsToWin: 3,
      format: 'legs_only',
      name: tourneyName,
      date: new Date().toISOString(),
      preset: 'tournament',
    };

    onStartTournament(tourneyName, tourneyType, settings, selectedPlayerIds);
    setShowSetup(false);
  };

  const togglePlayer = (id: string) => {
    if (selectedPlayerIds.includes(id)) {
      if (selectedPlayerIds.length > 2) {
        setSelectedPlayerIds(selectedPlayerIds.filter((p) => p !== id));
      }
    } else {
      setSelectedPlayerIds([...selectedPlayerIds, id]);
    }
  };

  const getPlayerName = (id: string | null) => {
    if (!id) return 'TBD';
    return players.find((p) => p.id === id)?.name || 'Player';
  };

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
          <h1 className="text-xl font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>TOURNAMENT BRACKET</span>
          </h1>
          <button
            type="button"
            onClick={() => setShowSetup(!showSetup)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-bold transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>NEW BRACKET</span>
          </button>
        </div>

        {/* Setup Modal/Section */}
        {showSetup && (
          <div className="bg-[#11141a] border border-zinc-800 rounded-xl p-5 flex flex-col gap-4 shadow-xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              CONFIGURE TOURNAMENT
            </h2>

            <div>
              <label className="text-xs uppercase font-bold text-zinc-400">TOURNAMENT TITLE</label>
              <input
                type="text"
                value={tourneyName}
                onChange={(e) => setTourneyName(e.target.value)}
                className="w-full mt-1 bg-zinc-900 border border-zinc-700 px-3 py-2 rounded text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs uppercase font-bold text-zinc-400">SELECT COMPETITORS</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                {players.map((p) => {
                  const isChecked = selectedPlayerIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePlayer(p.id)}
                      className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                        isChecked
                          ? 'bg-[#151f2d] border-emerald-500 text-white'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800'
                      }`}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: p.avatarColor }}
                      />
                      <span className="text-xs font-bold truncate">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreate}
              className="py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm uppercase tracking-wider shadow-lg transition-all"
            >
              GENERATE BRACKET
            </button>
          </div>
        )}

        {/* Active Tournament Bracket Display */}
        {activeTournament ? (
          <div className="bg-[#11141a] border border-zinc-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white uppercase tracking-wide">
                  {activeTournament.name}
                </h2>
                <span className="text-xs text-zinc-400 font-mono">
                  {activeTournament.type === 'single_elimination' ? 'Single Elimination' : 'Round Robin'} ·{' '}
                  {activeTournament.playerIds.length} Players
                </span>
              </div>
              <div className="px-3 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-emerald-400">
                STATUS: {activeTournament.status.toUpperCase()}
              </div>
            </div>

            {/* Bracket Tree */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Round 1 (e.g. Quarter / Semi) */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                  ROUND 1
                </span>
                <div className="flex flex-col gap-3">
                  {activeTournament.matches
                    .filter((m) => m.round === 1)
                    .map((m) => (
                      <div
                        key={m.id}
                        className="p-3 rounded-lg bg-zinc-900/90 border border-zinc-800 flex flex-col gap-2 font-mono text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">
                            {getPlayerName(m.player1Id)}
                          </span>
                          <span className="text-emerald-400 font-bold">{m.score1}</span>
                        </div>
                        <div className="border-t border-zinc-800 my-0.5" />
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">
                            {getPlayerName(m.player2Id)}
                          </span>
                          <span className="text-emerald-400 font-bold">{m.score2}</span>
                        </div>

                        {m.status === 'ready' && (
                          <button
                            type="button"
                            onClick={() => onPlayMatch(m.id)}
                            className="mt-2 py-1.5 px-3 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>PLAY MATCH</span>
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* Finals / Round 2 */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                  CHAMPIONSHIP FINAL
                </span>
                <div className="flex flex-col gap-3">
                  {activeTournament.matches
                    .filter((m) => m.round > 1)
                    .map((m) => (
                      <div
                        key={m.id}
                        className="p-3 rounded-lg bg-zinc-900/90 border border-amber-900/40 flex flex-col gap-2 font-mono text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">
                            {getPlayerName(m.player1Id)}
                          </span>
                          <span className="text-amber-400 font-bold">{m.score1}</span>
                        </div>
                        <div className="border-t border-zinc-800 my-0.5" />
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">
                            {getPlayerName(m.player2Id)}
                          </span>
                          <span className="text-amber-400 font-bold">{m.score2}</span>
                        </div>

                        {m.player1Id && m.player2Id && m.status === 'ready' && (
                          <button
                            type="button"
                            onClick={() => onPlayMatch(m.id)}
                            className="mt-2 py-1.5 px-3 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>PLAY FINAL</span>
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-zinc-500 font-mono text-sm">
            No active tournament. Click "NEW BRACKET" above to start one.
          </div>
        )}
      </div>
    </div>
  );
};
