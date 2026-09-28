'use client';

import React, { useState } from 'react';
import { GameType, InRule, MatchSettings, OutRule, Player } from '@/types/dart';
import { ChevronLeft, Play, Users, Settings2, Sparkles, Plus } from 'lucide-react';

interface MatchCreationProps {
  availablePlayers: Player[];
  onStartMatch: (selectedPlayers: Player[], settings: MatchSettings) => void;
  onCancel: () => void;
  onCreatePlayer: (name: string) => Promise<void>;
}

export const MatchCreation: React.FC<MatchCreationProps> = ({
  availablePlayers,
  onStartMatch,
  onCancel,
  onCreatePlayer,
}) => {
  // Preset selection
  const [preset, setPreset] = useState<'casual' | 'standard' | 'tournament' | 'advanced'>('casual');

  // Form states
  const [startingScore, setStartingScore] = useState<GameType>(501);
  const [inRule, setInRule] = useState<InRule>('straight_in');
  const [outRule, setOutRule] = useState<OutRule>('double_out');
  const [legsToWin, setLegsToWin] = useState<number>(3);
  const [format, setFormat] = useState<'legs_only' | 'sets_and_legs'>('legs_only');
  const [setsToWin, setSetsToWin] = useState<number>(3);
  const [matchName, setMatchName] = useState<string>('');
  const [venue, setVenue] = useState<string>('');

  // Selected player IDs
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>(
    availablePlayers.slice(0, 2).map((p) => p.id)
  );

  const [newPlayerName, setNewPlayerName] = useState('');
  const [showAddPlayer, setShowAddPlayer] = useState(false);

  // Handle Preset changes
  const applyPreset = (type: 'casual' | 'standard' | 'tournament' | 'advanced') => {
    setPreset(type);
    if (type === 'casual') {
      setStartingScore(501);
      setInRule('straight_in');
      setOutRule('double_out');
      setLegsToWin(3);
      setFormat('legs_only');
    } else if (type === 'standard') {
      setStartingScore(501);
      setInRule('double_in');
      setOutRule('double_out');
      setLegsToWin(5);
      setFormat('legs_only');
    } else if (type === 'tournament') {
      setStartingScore(501);
      setInRule('double_in');
      setOutRule('double_out');
      setLegsToWin(6); // First to 6 (best of 11)
      setFormat('legs_only');
    }
  };

  const togglePlayerSelection = (playerId: string) => {
    if (selectedPlayerIds.includes(playerId)) {
      if (selectedPlayerIds.length > 1) {
        setSelectedPlayerIds(selectedPlayerIds.filter((id) => id !== playerId));
      }
    } else {
      setSelectedPlayerIds([...selectedPlayerIds, playerId]);
    }
  };

  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    await onCreatePlayer(newPlayerName.trim());
    setNewPlayerName('');
    setShowAddPlayer(false);
  };

  const handleLaunch = () => {
    const chosenPlayers = availablePlayers.filter((p) =>
      selectedPlayerIds.includes(p.id)
    );
    if (chosenPlayers.length === 0) return;

    const settings: MatchSettings = {
      startingScore,
      inRule,
      outRule,
      legsToWin,
      setsToWin: format === 'sets_and_legs' ? setsToWin : undefined,
      legsPerSet: format === 'sets_and_legs' ? 3 : undefined,
      format,
      name: matchName || 'Match',
      venue: venue || undefined,
      date: new Date().toISOString(),
      preset,
    };

    onStartMatch(chosenPlayers, settings);
  };

  return (
    <div className="min-h-screen bg-[#090b0e] text-zinc-100 flex flex-col justify-between p-4 sm:p-8">
      <div className="max-w-3xl mx-auto w-full flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>BACK</span>
          </button>
          <h1 className="text-xl font-bold uppercase tracking-wider text-white">
            MATCH SETUP
          </h1>
          <div className="w-16" />
        </div>

        {/* Fast Rule Presets */}
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase font-bold tracking-wider text-zinc-400">
            QUICK PRESETS
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              {
                id: 'casual',
                label: 'CASUAL',
                desc: '501 · Single In · Double Out · Best of 3',
              },
              {
                id: 'standard',
                label: 'STANDARD',
                desc: '501 · Double In · Double Out · Best of 5',
              },
              {
                id: 'tournament',
                label: 'TOURNAMENT',
                desc: '501 · Double In · Double Out · Best of 11',
              },
              {
                id: 'advanced',
                label: 'ADVANCED',
                desc: 'Fully customizable match parameters',
              },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => applyPreset(item.id as any)}
                className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
                  preset === item.id
                    ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500'
                    : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                <span className="font-bold text-xs uppercase tracking-wider text-white">
                  {item.label}
                </span>
                <span className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                  {item.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Player Roster Selection */}
        <div className="flex flex-col gap-2 bg-[#11141a] p-4 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase font-bold tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>SELECT PLAYERS ({selectedPlayerIds.length})</span>
            </label>
            <button
              type="button"
              onClick={() => setShowAddPlayer(!showAddPlayer)}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>NEW PLAYER</span>
            </button>
          </div>

          {/* New Player Inline Input */}
          {showAddPlayer && (
            <form onSubmit={handleCreatePlayer} className="flex gap-2 pt-2">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Enter player name..."
                className="flex-1 bg-zinc-900 border border-zinc-700 px-3 py-1.5 rounded text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded"
              >
                ADD
              </button>
            </form>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            {availablePlayers.map((player) => {
              const isSelected = selectedPlayerIds.includes(player.id);
              const orderIndex = selectedPlayerIds.indexOf(player.id);

              return (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => togglePlayerSelection(player.id)}
                  className={`p-2.5 rounded-lg border flex items-center justify-between text-left transition-all ${
                    isSelected
                      ? 'bg-[#18212e] border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: player.avatarColor }}
                    />
                    <span className="font-bold text-xs uppercase truncate">
                      {player.name}
                    </span>
                  </div>

                  {isSelected && (
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      P{orderIndex + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Game Settings */}
        <div className="bg-[#11141a] p-4 rounded-xl border border-zinc-800 flex flex-col gap-4">
          <div className="flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider text-zinc-400">
            <Settings2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>GAME PARAMETERS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Starting Score */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
                STARTING SCORE
              </label>
              <div className="flex rounded bg-zinc-900 border border-zinc-800 p-1">
                {([301, 501, 701] as GameType[]).map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setStartingScore(score)}
                    className={`flex-1 py-1.5 rounded font-mono font-bold text-xs sm:text-sm transition-colors ${
                      startingScore === score
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>

            {/* In Rule */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
                IN RULE
              </label>
              <div className="flex rounded bg-zinc-900 border border-zinc-800 p-1">
                <button
                  type="button"
                  onClick={() => setInRule('straight_in')}
                  className={`flex-1 py-1.5 rounded font-bold text-xs transition-colors ${
                    inRule === 'straight_in'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  SINGLE IN
                </button>
                <button
                  type="button"
                  onClick={() => setInRule('double_in')}
                  className={`flex-1 py-1.5 rounded font-bold text-xs transition-colors ${
                    inRule === 'double_in'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  DOUBLE IN
                </button>
              </div>
            </div>

            {/* Out Rule */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
                OUT RULE
              </label>
              <div className="flex rounded bg-zinc-900 border border-zinc-800 p-1">
                {(['straight_out', 'double_out', 'master_out'] as OutRule[]).map((rule) => (
                  <button
                    key={rule}
                    type="button"
                    onClick={() => setOutRule(rule)}
                    className={`flex-1 py-1.5 rounded font-bold text-[11px] transition-colors ${
                      outRule === rule
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {rule === 'straight_out'
                      ? 'SINGLE'
                      : rule === 'double_out'
                      ? 'DOUBLE'
                      : 'MASTER'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Format & Length */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-800/80">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
                MATCH FORMAT
              </label>
              <div className="flex rounded bg-zinc-900 border border-zinc-800 p-1">
                <button
                  type="button"
                  onClick={() => setFormat('legs_only')}
                  className={`flex-1 py-1.5 rounded font-bold text-xs transition-colors ${
                    format === 'legs_only'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  LEGS ONLY
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('sets_and_legs')}
                  className={`flex-1 py-1.5 rounded font-bold text-xs transition-colors ${
                    format === 'sets_and_legs'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  SETS & LEGS
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
                {format === 'legs_only' ? 'LEGS TO WIN' : 'SETS TO WIN'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="21"
                  value={format === 'legs_only' ? legsToWin : setsToWin}
                  onChange={(e) => {
                    const val = Math.max(1, parseInt(e.target.value) || 1);
                    if (format === 'legs_only') setLegsToWin(val);
                    else setSetsToWin(val);
                  }}
                  className="bg-zinc-900 border border-zinc-800 font-mono font-bold text-sm text-white px-3 py-1.5 rounded w-24 text-center focus:outline-none focus:border-emerald-500"
                />
                <span className="text-xs text-zinc-400">
                  {format === 'legs_only'
                    ? `(Best of ${legsToWin * 2 - 1} legs)`
                    : `(Best of ${setsToWin * 2 - 1} sets)`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          type="button"
          onClick={handleLaunch}
          className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/50 active:scale-95 transition-all"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>START MATCH</span>
        </button>
      </div>
    </div>
  );
};
