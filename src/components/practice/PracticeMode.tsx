'use client';

import React, { useState } from 'react';
import { DartMultiplier, PracticeSession, PracticeType, Player, Throw } from '@/types/dart';
import { createThrow } from '@/engine/scoring/scoringEngine';
import { InteractiveDartboard } from '../dartboard/InteractiveDartboard';
import { ScoringKeypad } from '../scoring/ScoringKeypad';
import { CheckoutGuide } from '../checkout/CheckoutGuide';
import { ChevronLeft, Target, Trophy, RotateCcw, Check, Flame, Disc, LayoutGrid } from 'lucide-react';

interface PracticeModeProps {
  session: PracticeSession | null;
  players: Player[];
  onStartSession: (type: PracticeType, playerId: string) => void;
  onRecordVisit: (darts: Throw[], success: boolean, points: number) => void;
  onCompleteSession: () => void;
  onBack: () => void;
}

export const PracticeMode: React.FC<PracticeModeProps> = ({
  session,
  players,
  onStartSession,
  onRecordVisit,
  onCompleteSession,
  onBack,
}) => {
  const [selectedType, setSelectedType] = useState<PracticeType>('checkout');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(
    players[0]?.id || 'player'
  );
  const [currentDarts, setCurrentDarts] = useState<Throw[]>([]);
  const [inputMode, setInputMode] = useState<'board' | 'keypad'>('board');

  const modes: { type: PracticeType; title: string; desc: string; icon: string }[] = [
    {
      type: 'checkout',
      title: 'CHECKOUT PRACTICE',
      desc: 'Random finishes from 41-120. Track finish rate under 3-dart pressure.',
      icon: '🎯',
    },
    {
      type: 'doubles',
      title: 'DOUBLES PRACTICE',
      desc: 'Around the Clock doubles: hit D20 down to D1.',
      icon: '⚡',
    },
    {
      type: 'trebles',
      title: 'TREBLE DRILL',
      desc: 'Focus on maximums: T20, T19, and T18 cluster training.',
      icon: '🔥',
    },
    {
      type: 'scoring',
      title: 'SCORING PRACTICE',
      desc: 'Throw visits on high-scoring sectors. Track 3-dart running average.',
      icon: '📊',
    },
    {
      type: 'challenge_100',
      title: '100 DART CHALLENGE',
      desc: 'Throw 100 darts at T20. Target: 1,000+ points.',
      icon: '🏆',
    },
    {
      type: 'challenge_121',
      title: '121 CHECKOUT SPRINT',
      desc: 'Check out 121 in 9 darts. Level up on success, reset on fail.',
      icon: '⏱️',
    },
    {
      type: 'sprint_301',
      title: '301 SPRINT',
      desc: 'Solo fast leg time trial from 301 to double out.',
      icon: '🚀',
    },
    {
      type: 'sprint_501',
      title: '501 SPRINT',
      desc: 'Solo standard 501 leg. Practice completing in fewer than 18 darts.',
      icon: '🎖️',
    },
  ];

  const handleThrow = (val: number, mult: DartMultiplier) => {
    if (!session || currentDarts.length >= 3) return;
    const dart = createThrow(val, mult, session.playerId);
    const updated = [...currentDarts, dart];
    setCurrentDarts(updated);
  };

  const handleUndo = () => {
    if (currentDarts.length === 0) return;
    setCurrentDarts(currentDarts.slice(0, -1));
  };

  const handleConfirmVisit = () => {
    if (!session || currentDarts.length === 0) return;

    let success = false;
    let points = currentDarts.reduce((acc, d) => acc + d.score, 0);

    if (session.type === 'checkout') {
      const targetScore = typeof session.target === 'number' ? session.target : 80;
      // Did last dart finish exactly the checkout on a double?
      let running = targetScore;
      for (const d of currentDarts) {
        running -= d.score;
        if (running === 0 && d.multiplier === 2) {
          success = true;
          break;
        }
      }
    } else if (session.type === 'doubles') {
      const targetStr = session.target as string; // e.g. "D20"
      success = currentDarts.some((d) => d.label === targetStr);
    } else if (session.type === 'trebles') {
      const targetStr = session.target as string; // e.g. "T20"
      success = currentDarts.some((d) => d.label === targetStr);
    } else {
      success = points >= 100;
    }

    onRecordVisit(currentDarts, success, points);
    setCurrentDarts([]);
  };

  // If no active session, show setup menu
  if (!session) {
    return (
      <div className="min-h-screen bg-[#090b0e] text-zinc-100 flex flex-col p-4 sm:p-8">
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
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
              PRACTICE & DRILLS
            </h1>
            <div className="w-16" />
          </div>

          {/* Player Selection */}
          <div className="flex items-center justify-between bg-[#11141a] p-3 rounded-lg border border-zinc-800">
            <span className="text-xs uppercase font-bold text-zinc-400">PRACTICE AS:</span>
            <div className="flex gap-2">
              {players.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlayerId(p.id)}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                    selectedPlayerId === p.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Drill Mode Selection Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {modes.map((m) => (
              <button
                key={m.type}
                type="button"
                onClick={() => setSelectedType(m.type)}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  selectedType === m.type
                    ? 'bg-[#151d27] border-emerald-500 text-white ring-1 ring-emerald-500 shadow-lg'
                    : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{m.icon}</span>
                  <span className="font-bold text-sm uppercase tracking-wide text-white">
                    {m.title}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-2">{m.desc}</p>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onStartSession(selectedType, selectedPlayerId)}
            className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base uppercase tracking-wider shadow-xl shadow-emerald-950/50 active:scale-95 transition-all mt-2"
          >
            START TRAINING SESSION
          </button>
        </div>
      </div>
    );
  }

  // Active Practice Session HUD
  const successPct =
    session.attempts > 0 ? ((session.successes / session.attempts) * 100).toFixed(0) : '0';

  return (
    <div className="min-h-screen bg-[#090b0e] text-zinc-100 flex flex-col justify-between p-3 sm:p-6">
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-4">
        {/* Practice Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCompleteSession}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-400 hover:text-white border border-zinc-800"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>END SESSION</span>
            </button>
            <span className="font-bold text-sm text-white uppercase tracking-wider">
              {session.title}
            </span>
          </div>

          <div className="flex rounded bg-zinc-900 border border-zinc-800 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setInputMode('board')}
              className={`p-1.5 rounded ${inputMode === 'board' ? 'bg-zinc-700 text-white' : 'text-zinc-400'}`}
            >
              <Disc className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setInputMode('keypad')}
              className={`p-1.5 rounded ${inputMode === 'keypad' ? 'bg-zinc-700 text-white' : 'text-zinc-400'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Current Drill Target Card */}
        <div className="bg-[#11141a] border border-emerald-900/60 rounded-xl p-5 text-center flex flex-col items-center shadow-lg">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
            CURRENT TARGET
          </span>
          <div className="font-mono font-black text-5xl sm:text-6xl text-white my-2">
            {session.target}
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            {session.type === 'checkout'
              ? 'Attempt checkout in 3 darts'
              : `Aim for ${session.target}`}
          </span>

          {session.type === 'checkout' && typeof session.target === 'number' && (
            <div className="w-full max-w-md mt-3">
              <CheckoutGuide
                score={session.target}
                dartsRemaining={3 - currentDarts.length}
                outRule="double_out"
              />
            </div>
          )}
        </div>

        {/* Real-time Session Metrics */}
        <div className="grid grid-cols-4 gap-2 font-mono text-center">
          <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase font-bold">ATTEMPTS</span>
            <div className="text-lg font-bold text-white mt-0.5">{session.attempts}</div>
          </div>
          <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase font-bold">SUCCESSES</span>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">{session.successes}</div>
          </div>
          <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase font-bold">ACCURACY</span>
            <div className="text-lg font-bold text-white mt-0.5">{successPct}%</div>
          </div>
          <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase font-bold">DARTS</span>
            <div className="text-lg font-bold text-zinc-300 mt-0.5">{session.totalDarts}</div>
          </div>
        </div>

        {/* Current Throw 3 Slots */}
        <div className="flex items-center justify-between bg-[#12161f] border border-zinc-800 rounded-lg p-3">
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((i) => {
              const d = currentDarts[i];
              return (
                <div
                  key={i}
                  className={`w-12 h-10 rounded border flex items-center justify-center font-mono font-bold text-sm ${
                    d
                      ? 'bg-zinc-800 border-emerald-500 text-emerald-300'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-700'
                  }`}
                >
                  {d ? d.label : `D${i + 1}`}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentDarts.length === 0}
              onClick={handleUndo}
              className="px-3 py-2 rounded bg-zinc-800 text-zinc-300 font-bold text-xs border border-zinc-700 disabled:opacity-40"
            >
              UNDO
            </button>
            <button
              type="button"
              disabled={currentDarts.length === 0}
              onClick={handleConfirmVisit}
              className={`px-4 py-2 rounded font-bold text-xs border ${
                currentDarts.length > 0
                  ? 'bg-emerald-600 text-white border-emerald-400 animate-pulse'
                  : 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed'
              }`}
            >
              RECORD VISIT
            </button>
          </div>
        </div>

        {/* Scoring Input */}
        <div className="bg-[#0d1017] p-2 rounded-xl border border-zinc-900">
          {inputMode === 'board' ? (
            <InteractiveDartboard
              onThrow={handleThrow}
              disabled={currentDarts.length >= 3}
            />
          ) : (
            <ScoringKeypad
              onThrow={handleThrow}
              onUndo={handleUndo}
              onConfirm={handleConfirmVisit}
              canConfirm={currentDarts.length > 0}
              canUndo={currentDarts.length > 0}
              dartsCount={currentDarts.length}
            />
          )}
        </div>
      </div>
    </div>
  );
};
