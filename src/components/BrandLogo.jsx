import React, { useId } from 'react';

/**
 * LupusMark — vector reproduction of the official Lupus AI Labs brand mark:
 * an isometric open cube with an embedded circuit-tree motif.
 * Renders in `currentColor`, so it can be inverted freely (white on black).
 */
export function LupusMark({ className = 'h-8 w-8', title = 'Lupus AI Labs' }) {
  const uid = useId().replace(/:/g, '');
  const maskId = `lupus-seams-${uid}`;

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label={title}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
          <rect width="100" height="100" fill="#fff" />
          {/* Seams that separate the cube panels (top vertex, shoulders, base) */}
          <line x1="50" y1="1" x2="50" y2="21" stroke="#000" strokeWidth="3.2" />
          <line x1="7" y1="25.5" x2="25" y2="35.5" stroke="#000" strokeWidth="3.2" />
          <line x1="93" y1="25.5" x2="75" y2="35.5" stroke="#000" strokeWidth="3.2" />
          <line x1="50" y1="79" x2="50" y2="99" stroke="#000" strokeWidth="3.2" />
        </mask>
      </defs>

      {/* Cube frame: outer hexagon minus inner hexagon */}
      <path
        d="M50 3 L91 26.5 L91 73.5 L50 97 L9 73.5 L9 26.5 Z M50 19 L77 34.5 L77 65.5 L50 81 L23 65.5 L23 34.5 Z"
        fill="currentColor"
        fillRule="evenodd"
        mask={`url(#${maskId})`}
      />

      {/* Circuit tree */}
      <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M50 78 V38" />
        <path d="M50 62 H42 V50" />
        <path d="M50 62 H58 V50" />
        <path d="M50 70 H34 V60" />
        <path d="M50 70 H66 V60" />
        <circle cx="50" cy="34" r="3.4" />
        <circle cx="42" cy="46" r="3.4" />
        <circle cx="58" cy="46" r="3.4" />
        <circle cx="34" cy="56" r="3.4" />
        <circle cx="66" cy="56" r="3.4" />
      </g>
    </svg>
  );
}

/**
 * LupusLockup — mark + "LUPUS — AI LABS —" wordmark.
 * size: 'sm' (navbar, 32px), 'md', 'lg' (footer / intro)
 */
export function LupusLockup({ size = 'sm', className = '', stacked = false }) {
  const sizes = {
    sm: { mark: 'h-8 w-8', word: 'text-[17px]', sub: 'text-[8px] tracking-[0.42em]', gap: 'gap-2.5', line: 'w-3' },
    md: { mark: 'h-12 w-12', word: 'text-2xl', sub: 'text-[10px] tracking-[0.46em]', gap: 'gap-3.5', line: 'w-4' },
    lg: { mark: 'h-16 w-16 sm:h-20 sm:w-20', word: 'text-4xl sm:text-5xl', sub: 'text-[11px] sm:text-xs tracking-[0.5em]', gap: 'gap-5', line: 'w-6' },
  };
  const s = sizes[size] || sizes.sm;

  return (
    <div
      className={`inline-flex ${stacked ? 'flex-col items-center text-center' : 'flex-row items-center'} ${s.gap} text-white ${className}`}
    >
      <LupusMark className={`${s.mark} shrink-0`} />
      <div className={`flex flex-col ${stacked ? 'items-center' : 'items-start'} leading-none`}>
        <span className={`font-display font-bold uppercase tracking-[0.28em] ${s.word}`}>Lupus</span>
        <span className={`mt-1.5 inline-flex items-center gap-1.5 font-mono font-medium uppercase text-neutral-300 ${s.sub}`}>
          <span className={`${s.line} h-px bg-current`} aria-hidden="true" />
          <span>AI Labs</span>
          <span className={`${s.line} h-px bg-current`} aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}

export default LupusLockup;
