'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DartMultiplier } from '@/types/dart';
import { Delete, Check, RotateCcw, Mic, MicOff } from 'lucide-react';
import { VoiceRecognitionController, ParsedVoiceCommand, VoiceState } from '@/lib/voiceScoring';

interface ScoringKeypadProps {
  onThrow: (value: number, multiplier: DartMultiplier) => void;
  onUndo: () => void;
  onConfirm: () => void;
  canConfirm: boolean;
  canUndo: boolean;
  dartsCount: number;
}

export const ScoringKeypad: React.FC<ScoringKeypadProps> = ({
  onThrow,
  onUndo,
  onConfirm,
  canConfirm,
  canUndo,
  dartsCount,
}) => {
  const [multiplier, setMultiplier] = useState<DartMultiplier>(1);
  const [voiceController, setVoiceController] = useState<VoiceRecognitionController | null>(null);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [voiceText, setVoiceText] = useState<string>('');

  // Initialize voice controller
  useEffect(() => {
    const vc = new VoiceRecognitionController();
    setVoiceController(vc);
    if (!vc.isSupported()) {
      setVoiceState('unsupported');
    }
  }, []);

  const toggleVoiceListening = () => {
    if (!voiceController || voiceState === 'unsupported') return;

    if (voiceState === 'listening') {
      voiceController.stopListening();
    } else {
      voiceController.startListening(
        (cmd: ParsedVoiceCommand) => {
          setVoiceText(`${cmd.label} ("${cmd.rawText}")`);
          onThrow(cmd.value, cmd.multiplier);
        },
        (state: VoiceState, msg?: string) => {
          setVoiceState(state);
        }
      );
    }
  };

  const handleNumberClick = (num: number) => {
    onThrow(num, multiplier);
    // Reset multiplier to single after throw for rapid entry
    setMultiplier(1);
  };

  // Keyboard shortcuts listener
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't intercept inside input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const key = e.key.toUpperCase();

      if (key === 'M') {
        e.preventDefault();
        onThrow(0, 0);
      } else if (key === 'B') {
        e.preventDefault();
        onThrow(25, 2); // Bull
      } else if (key === 'T') {
        e.preventDefault();
        setMultiplier((prev) => (prev === 3 ? 1 : 3));
      } else if (key === 'D') {
        e.preventDefault();
        setMultiplier((prev) => (prev === 2 ? 1 : 2));
      } else if (key === 'S') {
        e.preventDefault();
        setMultiplier(1);
      } else if (key === 'U' || key === 'BACKSPACE') {
        e.preventDefault();
        if (canUndo) onUndo();
      } else if (key === 'ENTER') {
        e.preventDefault();
        if (canConfirm) onConfirm();
      }
    },
    [onThrow, onUndo, onConfirm, canUndo, canConfirm]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const numbersRow1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const numbersRow2 = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

  return (
    <div className="flex flex-col gap-2 w-full max-w-xl mx-auto select-none">
      {/* Voice feedback bar if active */}
      {voiceState === 'listening' && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-950/70 border border-emerald-500/50 rounded text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Listening for voice ("Triple 20", "Bull", "Miss")...</span>
          </div>
          {voiceText && <span className="font-mono font-bold text-white">{voiceText}</span>}
        </div>
      )}

      {/* Multiplier Selector & Common Fast Shortcuts */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => setMultiplier(1)}
          className={`py-2 px-3 rounded font-bold text-xs sm:text-sm tracking-wide border transition-all ${
            multiplier === 1
              ? 'bg-zinc-700 text-white border-zinc-400 shadow-inner'
              : 'bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
          }`}
        >
          SINGLE [S]
        </button>

        <button
          type="button"
          onClick={() => setMultiplier(2)}
          className={`py-2 px-3 rounded font-bold text-xs sm:text-sm tracking-wide border transition-all ${
            multiplier === 2
              ? 'bg-blue-600 text-white border-blue-400 shadow-inner'
              : 'bg-zinc-900/90 text-blue-400 border-zinc-800 hover:bg-zinc-800'
          }`}
        >
          DOUBLE [D]
        </button>

        <button
          type="button"
          onClick={() => setMultiplier(3)}
          className={`py-2 px-3 rounded font-bold text-xs sm:text-sm tracking-wide border transition-all ${
            multiplier === 3
              ? 'bg-red-600 text-white border-red-400 shadow-inner'
              : 'bg-zinc-900/90 text-red-400 border-zinc-800 hover:bg-zinc-800'
          }`}
        >
          TRIPLE [T]
        </button>

        {/* Voice Toggle */}
        <button
          type="button"
          onClick={toggleVoiceListening}
          disabled={voiceState === 'unsupported'}
          title={voiceState === 'unsupported' ? 'Voice recognition not supported in this browser' : 'Toggle Voice Scoring'}
          className={`py-2 px-3 rounded font-bold text-xs sm:text-sm tracking-wide border flex items-center justify-center gap-1.5 transition-all ${
            voiceState === 'listening'
              ? 'bg-emerald-600 text-white border-emerald-400 animate-pulse'
              : 'bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:bg-zinc-800 disabled:opacity-40'
          }`}
        >
          {voiceState === 'listening' ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
          VOICE
        </button>
      </div>

      {/* Number Keypad Grid 1-20 */}
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 sm:gap-1.5">
        {numbersRow1.map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handleNumberClick(num)}
            className="py-2.5 sm:py-3 rounded bg-zinc-900 hover:bg-zinc-800 active:bg-emerald-700 active:scale-95 text-white font-mono font-bold text-base sm:text-lg border border-zinc-800 tactile-btn transition-colors"
          >
            {multiplier === 3 ? `T${num}` : multiplier === 2 ? `D${num}` : num}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 sm:gap-1.5">
        {numbersRow2.map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handleNumberClick(num)}
            className="py-2.5 sm:py-3 rounded bg-zinc-900 hover:bg-zinc-800 active:bg-emerald-700 active:scale-95 text-white font-mono font-bold text-base sm:text-lg border border-zinc-800 tactile-btn transition-colors"
          >
            {multiplier === 3 ? `T${num}` : multiplier === 2 ? `D${num}` : num}
          </button>
        ))}
      </div>

      {/* Bottom Fast Access Row: MISS, 25, 50, UNDO, CONFIRM */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2 pt-1">
        <button
          type="button"
          onClick={() => onThrow(0, 0)}
          className="py-2.5 rounded bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-zinc-400 font-mono font-bold text-xs sm:text-sm border border-zinc-800"
        >
          MISS [M]
        </button>

        <button
          type="button"
          onClick={() => onThrow(25, 1)}
          className="py-2.5 rounded bg-emerald-950/60 hover:bg-emerald-900/80 active:scale-95 text-emerald-400 font-mono font-bold text-xs sm:text-sm border border-emerald-900"
        >
          25 OUTER
        </button>

        <button
          type="button"
          onClick={() => onThrow(25, 2)}
          className="py-2.5 rounded bg-red-950/60 hover:bg-red-900/80 active:scale-95 text-red-400 font-mono font-bold text-xs sm:text-sm border border-red-900"
        >
          50 BULL [B]
        </button>

        <button
          type="button"
          disabled={!canUndo}
          onClick={onUndo}
          className="py-2.5 rounded bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 font-bold text-xs sm:text-sm border border-zinc-700 flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          UNDO [U]
        </button>

        <button
          type="button"
          disabled={!canConfirm}
          onClick={onConfirm}
          className={`py-2.5 rounded font-bold text-xs sm:text-sm border flex items-center justify-center gap-1 transition-all active:scale-95 ${
            canConfirm
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-md font-extrabold animate-pulse'
              : 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed'
          }`}
        >
          <Check className="w-4 h-4" />
          CONFIRM
        </button>
      </div>
    </div>
  );
};
