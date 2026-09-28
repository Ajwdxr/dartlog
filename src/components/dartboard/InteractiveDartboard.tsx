'use client';

import React, { useState } from 'react';
import { DartMultiplier } from '@/types/dart';

const SECTORS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

interface DartboardProps {
  onThrow: (value: number, multiplier: DartMultiplier) => void;
  disabled?: boolean;
}

export const InteractiveDartboard: React.FC<DartboardProps> = ({ onThrow, disabled = false }) => {
  const [lastHit, setLastHit] = useState<{ label: string; score: number; x: number; y: number } | null>(null);

  // Geometry radii (center at 200, 200)
  const cx = 200;
  const cy = 200;

  const rInnerBull = 9;
  const rOuterBull = 21;
  const rInnerSingleStart = 21;
  const rTripleInner = 105;
  const rTripleOuter = 117;
  const rOuterSingleStart = 117;
  const rDoubleInner = 168;
  const rDoubleOuter = 180;
  const rNumberRing = 191;

  const handleSectorClick = (
    e: React.MouseEvent,
    value: number,
    multiplier: DartMultiplier,
    label: string,
    score: number
  ) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setLastHit({ label, score, x, y });
    setTimeout(() => setLastHit(null), 800);

    onThrow(value, multiplier);
  };

  // Helper to generate SVG arc path
  const describeArc = (
    rInner: number,
    rOuter: number,
    startAngleDeg: number,
    endAngleDeg: number
  ) => {
    const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;

    const startInnerX = cx + rInner * Math.cos(toRad(startAngleDeg));
    const startInnerY = cy + rInner * Math.sin(toRad(startAngleDeg));
    const endInnerX = cx + rInner * Math.cos(toRad(endAngleDeg));
    const endInnerY = cy + rInner * Math.sin(toRad(endAngleDeg));

    const startOuterX = cx + rOuter * Math.cos(toRad(startAngleDeg));
    const startOuterY = cy + rOuter * Math.sin(toRad(startAngleDeg));
    const endOuterX = cx + rOuter * Math.cos(toRad(endAngleDeg));
    const endOuterY = cy + rOuter * Math.sin(toRad(endAngleDeg));

    const arcSweep = endAngleDeg - startAngleDeg <= 180 ? '0' : '1';

    return [
      `M ${startOuterX} ${startOuterY}`,
      `A ${rOuter} ${rOuter} 0 ${arcSweep} 1 ${endOuterX} ${endOuterY}`,
      `L ${endInnerX} ${endInnerY}`,
      `A ${rInner} ${rInner} 0 ${arcSweep} 0 ${startInnerX} ${startInnerY}`,
      'Z',
    ].join(' ');
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-2 select-none">
      <div className="relative w-full max-w-[360px] sm:max-w-[400px] aspect-square">
        {/* Hit Badge Feedback Overlay */}
        {lastHit && (
          <div
            className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 animate-scale-up"
            style={{ left: lastHit.x, top: lastHit.y }}
          >
            <div className="bg-emerald-600 text-white font-mono font-bold text-sm px-2.5 py-1 rounded shadow-lg border border-emerald-400">
              {lastHit.label} (+{lastHit.score})
            </div>
          </div>
        )}

        <svg
          viewBox="0 0 400 400"
          className={`w-full h-full drop-shadow-2xl ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <defs>
            <radialGradient id="boardEdgeGrad" cx="50%" cy="50%" r="50%">
              <stop offset="90%" stopColor="#0c0e12" />
              <stop offset="100%" stopColor="#000000" />
            </radialGradient>
          </defs>

          {/* Outer Black Board Ring with Numbers */}
          <circle
            cx={cx}
            cy={cy}
            r={198}
            fill="url(#boardEdgeGrad)"
            stroke="#262c3b"
            strokeWidth="3"
            onClick={(e) => handleSectorClick(e, 0, 0, 'MISS', 0)}
          />

          {/* Sectors and Rings */}
          {SECTORS.map((sectorNum, index) => {
            const angleStart = index * 18 - 9;
            const angleEnd = index * 18 + 9;
            const isEven = index % 2 === 0;

            const doubleTripleColor = isEven ? '#dc2626' : '#16a34a'; // Red / Green
            const singleColor = isEven ? '#1f242d' : '#e2e8f0'; // Charcoal Black / Off-White
            const singleTextColor = isEven ? '#f8fafc' : '#0f172a';

            // Coordinates for sector number
            const numAngleRad = ((index * 18 - 90) * Math.PI) / 180;
            const numX = cx + rNumberRing * Math.cos(numAngleRad);
            const numY = cy + rNumberRing * Math.sin(numAngleRad) + 5;

            return (
              <g key={`sector-${sectorNum}`}>
                {/* Sector Number Text */}
                <text
                  x={numX}
                  y={numY}
                  textAnchor="middle"
                  fill="#f8fafc"
                  fontSize="14"
                  fontWeight="bold"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  className="pointer-events-none select-none"
                >
                  {sectorNum}
                </text>

                {/* Double Ring (Multiplier 2) */}
                <path
                  d={describeArc(rDoubleInner, rDoubleOuter, angleStart, angleEnd)}
                  fill={doubleTripleColor}
                  stroke="#475569"
                  strokeWidth="0.75"
                  className="hover:opacity-80 active:opacity-60 transition-opacity"
                  onClick={(e) =>
                    handleSectorClick(
                      e,
                      sectorNum,
                      2,
                      `D${sectorNum}`,
                      sectorNum * 2
                    )
                  }
                />

                {/* Outer Single Wedge (Multiplier 1) */}
                <path
                  d={describeArc(rOuterSingleStart, rDoubleInner, angleStart, angleEnd)}
                  fill={singleColor}
                  stroke="#475569"
                  strokeWidth="0.75"
                  className="hover:opacity-85 active:opacity-60 transition-opacity"
                  onClick={(e) =>
                    handleSectorClick(
                      e,
                      sectorNum,
                      1,
                      `${sectorNum}`,
                      sectorNum
                    )
                  }
                />

                {/* Triple Ring (Multiplier 3) */}
                <path
                  d={describeArc(rTripleInner, rTripleOuter, angleStart, angleEnd)}
                  fill={doubleTripleColor}
                  stroke="#475569"
                  strokeWidth="0.75"
                  className="hover:opacity-80 active:opacity-60 transition-opacity"
                  onClick={(e) =>
                    handleSectorClick(
                      e,
                      sectorNum,
                      3,
                      `T${sectorNum}`,
                      sectorNum * 3
                    )
                  }
                />

                {/* Inner Single Wedge (Multiplier 1) */}
                <path
                  d={describeArc(rInnerSingleStart, rTripleInner, angleStart, angleEnd)}
                  fill={singleColor}
                  stroke="#475569"
                  strokeWidth="0.75"
                  className="hover:opacity-85 active:opacity-60 transition-opacity"
                  onClick={(e) =>
                    handleSectorClick(
                      e,
                      sectorNum,
                      1,
                      `${sectorNum}`,
                      sectorNum
                    )
                  }
                />
              </g>
            );
          })}

          {/* Outer Bull (25 Points) */}
          <circle
            cx={cx}
            cy={cy}
            r={rOuterBull}
            fill="#16a34a"
            stroke="#475569"
            strokeWidth="0.75"
            className="hover:opacity-80 active:opacity-60 transition-opacity cursor-pointer"
            onClick={(e) => handleSectorClick(e, 25, 1, '25', 25)}
          />

          {/* Inner Bull / Double Bull (50 Points) */}
          <circle
            cx={cx}
            cy={cy}
            r={rInnerBull}
            fill="#dc2626"
            stroke="#475569"
            strokeWidth="0.75"
            className="hover:opacity-80 active:opacity-60 transition-opacity cursor-pointer"
            onClick={(e) => handleSectorClick(e, 25, 2, 'BULL', 50)}
          />
        </svg>
      </div>

      {/* Direct Bull and Miss Quick Touch Buttons directly beneath board */}
      <div className="flex items-center gap-2 mt-2 w-full max-w-[360px]">
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => handleSectorClick(e, 0, 0, 'MISS', 0)}
          className="flex-1 py-2 px-3 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs uppercase tracking-wider font-semibold border border-zinc-700 active:scale-95 transition-all text-center"
        >
          MISS (0)
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => handleSectorClick(e, 25, 1, '25', 25)}
          className="flex-1 py-2 px-3 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 font-mono text-xs uppercase tracking-wider font-semibold border border-emerald-800 active:scale-95 transition-all text-center"
        >
          25 OUTER
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => handleSectorClick(e, 25, 2, 'BULL', 50)}
          className="flex-1 py-2 px-3 rounded bg-red-950 hover:bg-red-900 text-red-300 font-mono text-xs uppercase tracking-wider font-semibold border border-red-800 active:scale-95 transition-all text-center"
        >
          50 BULL
        </button>
      </div>
    </div>
  );
};
