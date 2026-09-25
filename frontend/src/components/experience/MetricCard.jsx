import React from 'react';
import { reelLayout, stripTransform } from './reelMath';

const SUFFIX = '+';

/**
 * Hairline dividers between cards in the 1, 2 and 4 column layouts. The cards
 * are translucent so the isometric field reads through them, so the dividers
 * are borders rather than the usual gap-px over a white/10 backing.
 */
const DIVIDERS = [
  '',
  'border-t sm:border-l sm:border-t-0',
  'border-t lg:border-l lg:border-t-0',
  'border-t sm:border-l lg:border-t-0',
];

/**
 * One digit as a vertical reel: 0-9 repeated, ending on `digit` plus one spare
 * row. It renders parked on the final digit, so the number is correct before
 * any script runs and under reduced motion; metricReels.js spins it.
 */
function DigitReel({ digit, index }) {
  const { finalRow, rows } = reelLayout(digit, index);
  return (
    <span className="xp-reel" data-reel data-digit={digit} data-index={index}>
      <span className="xp-reel__lens" data-reel-lens>
        <span className="xp-reel__strip" data-reel-strip style={{ transform: stripTransform(finalRow, rows) }}>
          {Array.from({ length: rows }, (_, row) => (
            <span key={row} className="xp-reel__row">
              {row % 10}
            </span>
          ))}
        </span>
      </span>
    </span>
  );
}

/** Impact metric card. Screen readers get the final value; the reels are decorative. */
export default function MetricCard({ metric, index }) {
  const digits = String(metric.target).split('').map(Number);

  return (
    <li
      data-metric
      className={`group relative flex flex-col justify-between border-white/10 bg-black/80 p-8 transition-colors duration-300 hover:bg-white ${DIVIDERS[index % DIVIDERS.length]}`}
    >
      <div>
        <div className="mb-4 flex items-center justify-between gap-3 font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-graphite group-hover:text-neutral-500">
          <span>METRIC // 0{index + 1}</span>
          {/* Telemetry: the meter fills while the reels spin; the lamp lights when they lock. */}
          <span aria-hidden="true" className="flex items-center gap-2">
            <span className="relative block h-px w-10 overflow-hidden">
              <span className="absolute inset-0 bg-current opacity-30" />
              <span data-reel-meter className="absolute inset-0 origin-left bg-current" />
            </span>
            <span data-reel-lamp className="block h-1.5 w-1.5 rounded-full bg-current" />
          </span>
        </div>
        <div className="mb-3 font-display text-5xl font-bold tracking-tight text-white group-hover:text-black sm:text-6xl xl:text-7xl">
          <span className="sr-only">
            {metric.target}
            {SUFFIX}
          </span>
          <span aria-hidden="true" className="xp-number select-none">
            {digits.map((digit, i) => (
              <DigitReel key={`${digits.length - i}-${digit}`} digit={digit} index={i} />
            ))}
            <span data-reel-suffix className="xp-suffix">
              {SUFFIX}
            </span>
          </span>
        </div>
        <h3 className="mb-2 text-lg font-semibold text-white group-hover:text-black">{metric.label}</h3>
      </div>
      <p className="border-t border-white/10 pt-4 text-xs leading-relaxed text-silver group-hover:border-black/10 group-hover:text-neutral-700">
        {metric.sub}
      </p>
    </li>
  );
}
