'use client';

import React from 'react';
import { Match, Player } from '@/types/dart';
import { Play, Plus, Target, Users, History, Trophy, Award, Flame, Volume2, VolumeX } from 'lucide-react';

interface HomeScreenProps {
  activePlayer: Player;
  recentMatch: Match | null;
  soundEnabled: boolean;
  onQuickMatch: () => void;
  onCreateMatch: () => void;
  onPractice: () => void;
  onPlayers: () => void;
  onHistory: () => void;
  onTournament: () => void;
  onToggleSound: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  activePlayer,
  recentMatch,
  soundEnabled,
  onQuickMatch,
  onCreateMatch,
  onPractice,
  onPlayers,
  onHistory,
  onTournament,
  onToggleSound,
}) => {
  // Current time greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-[#090b0e] text-zinc-100 flex flex-col justify-between p-4 sm:p-8 selection:bg-emerald-800">
      <div className="max-w-2xl mx-auto w-full flex flex-col gap-8 my-auto py-6">
        {/* Brand & Greeting */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
              <h1 className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-white uppercase">
                DARTLOG
              </h1>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-0.5 tracking-wider">
              THROW. TRACK. CHECKOUT.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleSound}
              className="p-2 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Toggle sound effects"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-zinc-600" />
              )}
            </button>

            <div className="text-right">
              <span className="text-xs text-zinc-400 font-medium">
                {greeting},
              </span>
              <div className="font-bold text-sm text-white uppercase tracking-wide">
                {activePlayer.name}
              </div>
            </div>
          </div>
        </div>

        {/* Primary Hero Action: QUICK MATCH */}
        <div className="relative group">
          <button
            type="button"
            onClick={onQuickMatch}
            className="w-full p-5 sm:p-6 rounded-xl bg-gradient-to-r from-emerald-950 via-[#102b1d] to-[#0d2217] hover:from-emerald-900 hover:to-[#123121] border border-emerald-500/50 text-left flex items-center justify-between shadow-xl shadow-emerald-950/40 active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold tracking-wider uppercase border border-emerald-500/30">
                  INSTANT OCHE
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase mt-1">
                QUICK MATCH
              </h2>
              <span className="text-xs text-emerald-200/80 font-mono">
                501 · Single In · Double Out · Best of 3
              </span>
            </div>

            <div className="w-12 h-12 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0">
              <Play className="w-6 h-6 fill-current ml-0.5" />
            </div>
          </button>
        </div>

        {/* Secondary Main Navigation Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onCreateMatch}
            className="p-4 rounded-xl bg-[#11141a] hover:bg-[#161a22] border border-zinc-800 hover:border-zinc-700 text-left flex flex-col justify-between gap-3 active:scale-[0.98] transition-all shadow-md group"
          >
            <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white w-fit group-hover:text-emerald-400 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white uppercase tracking-wide">
                CREATE MATCH
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                301, 501, 701, Sets & Custom Rules
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={onPractice}
            className="p-4 rounded-xl bg-[#11141a] hover:bg-[#161a22] border border-zinc-800 hover:border-zinc-700 text-left flex flex-col justify-between gap-3 active:scale-[0.98] transition-all shadow-md group"
          >
            <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white w-fit group-hover:text-amber-400 transition-colors">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white uppercase tracking-wide">
                PRACTICE
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                Checkouts, Doubles, 100 Darts Drill
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={onTournament}
            className="p-4 rounded-xl bg-[#11141a] hover:bg-[#161a22] border border-zinc-800 hover:border-zinc-700 text-left flex flex-col justify-between gap-3 active:scale-[0.98] transition-all shadow-md group"
          >
            <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white w-fit group-hover:text-amber-400 transition-colors">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white uppercase tracking-wide">
                TOURNAMENT
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                Single Elimination & Brackets
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={onPlayers}
            className="p-4 rounded-xl bg-[#11141a] hover:bg-[#161a22] border border-zinc-800 hover:border-zinc-700 text-left flex flex-col justify-between gap-3 active:scale-[0.98] transition-all shadow-md group"
          >
            <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white w-fit group-hover:text-blue-400 transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white uppercase tracking-wide">
                PLAYERS
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                Profiles, Career Averages & Records
              </p>
            </div>
          </button>
        </div>

        {/* Compact Recent Activity Section */}
        {recentMatch && (
          <div className="bg-[#11141a] border border-zinc-800 rounded-xl p-4 flex flex-col gap-2.5 shadow-md">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
              <span className="font-bold uppercase tracking-wider text-zinc-400">
                RECENT MATCH
              </span>
              <button
                type="button"
                onClick={onHistory}
                className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors flex items-center gap-1"
              >
                <span>ALL HISTORY</span>
                <span>→</span>
              </button>
            </div>

            <div className="flex items-center justify-between font-mono bg-zinc-900/90 border border-zinc-800/80 px-3 py-2.5 rounded-lg">
              <div>
                <div className="font-bold text-sm text-white">
                  {recentMatch.players[0]?.player.name} vs{' '}
                  {recentMatch.players[1]?.player.name || 'Opponent'}
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  {recentMatch.settings.startingScore} · {recentMatch.settings.outRule.replace('_', ' ')}
                </div>
              </div>

              <div className="text-right">
                <div className="font-black text-sm text-emerald-400">
                  {recentMatch.players[0]?.legsWon} - {recentMatch.players[1]?.legsWon}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  {new Date(recentMatch.startTime).toLocaleDateString(undefined, {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer System Status */}
      <footer className="text-center font-mono text-[11px] text-zinc-400 py-3 border-t border-zinc-900 flex items-center justify-center gap-4">
        <span>OFFLINE READY (PWA)</span>
        <span>·</span>
        <span>INDEXEDDB SYNCED</span>
        <span>·</span>
        <span>DARTLOG V1.0</span>
      </footer>
    </div>
  );
};
