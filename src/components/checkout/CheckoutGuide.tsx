'use client';

import React from 'react';
import { OutRule } from '@/types/dart';
import { getCheckoutRoute } from '@/engine/checkout/checkoutEngine';
import { Target } from 'lucide-react';

interface CheckoutGuideProps {
  score: number;
  dartsRemaining: number;
  outRule: OutRule;
}

export const CheckoutGuide: React.FC<CheckoutGuideProps> = ({
  score,
  dartsRemaining,
  outRule,
}) => {
  const route = getCheckoutRoute(score, dartsRemaining, outRule);

  if (score > 170 || score <= 1) {
    return null;
  }

  return (
    <div className="w-full bg-zinc-950/80 border border-emerald-900/60 rounded-lg p-2.5 sm:p-3 shadow-md flex flex-col gap-1.5 select-none">
      <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-900 pb-1">
        <div className="flex items-center gap-1.5 font-bold tracking-wider text-emerald-400">
          <Target className="w-3.5 h-3.5" />
          <span>CHECKOUT GUIDE</span>
        </div>
        <div className="font-mono text-zinc-400">
          {score} LEFT · {dartsRemaining} {dartsRemaining === 1 ? 'DART' : 'DARTS'}
        </div>
      </div>

      {route ? (
        <div className="flex flex-col gap-1">
          {/* Primary Route */}
          <div className="flex items-center justify-between bg-emerald-950/40 border border-emerald-800/40 rounded px-2.5 py-1.5">
            <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">
              PRIMARY ROUTE
            </span>
            <div className="flex items-center gap-1.5">
              {route.primary.map((step, idx) => (
                <React.Fragment key={idx}>
                  <span className="font-mono font-bold text-sm sm:text-base text-white px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700">
                    {step}
                  </span>
                  {idx < route.primary.length - 1 && (
                    <span className="text-zinc-500 text-xs">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Alternatives */}
          {route.alternatives && route.alternatives.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wide">
                ALT:
              </span>
              {route.alternatives.slice(0, 2).map((alt, aIdx) => (
                <span
                  key={aIdx}
                  className="font-mono text-zinc-300 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-xs"
                >
                  {alt.join(' · ')}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between px-2 py-1 text-xs text-zinc-500 font-mono">
          <span>NO CHECKOUT IN {dartsRemaining} {dartsRemaining === 1 ? 'DART' : 'DARTS'}</span>
          <span className="text-[11px] text-zinc-600">Setup score needed</span>
        </div>
      )}
    </div>
  );
};
