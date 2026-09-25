import React from 'react';
import { deckTiming } from './deckTiming';

const pad = (value) => String(value).padStart(2, '0');

/**
 * Desktop deck telemetry: the active index (01 / 03), the active system, a
 * scrubbed progress hairline with a tick at each resting card, and one button
 * per card. Hidden (display: none) outside the desktop deck. The choreography
 * updates it imperatively (index scramble, aria-current, progress fill), so
 * scrolling never re-renders React.
 */
export default function DeckRail({ systems }) {
  const timing = deckTiming(systems.length);

  return (
    <nav
      data-wwb="rail"
      aria-label="Capability deck"
      className="wwb-rail font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500"
    >
      <div className="flex shrink-0 items-baseline gap-2" aria-hidden="true">
        <span data-wwb="rail-index" className="text-sm font-semibold tabular-nums text-white">
          {systems[0].id}
        </span>
        <span className="tabular-nums">/ {pad(systems.length)}</span>
      </div>

      <span data-wwb="rail-label" aria-hidden="true" className="w-[17rem] shrink-0 overflow-hidden whitespace-nowrap text-silver">
        {systems[0].tag}
      </span>

      <div className="wwb-rail__track" aria-hidden="true">
        <span data-wwb="rail-fill" className="wwb-rail__fill" />
        {systems.map((system, i) => (
          <span key={system.id} className="wwb-rail__tick" style={{ left: `${(timing.rest[i] / timing.total) * 100}%` }} />
        ))}
      </div>

      <ol className="flex shrink-0 items-center gap-2">
        {systems.map((system, i) => (
          <li key={system.id}>
            <button
              type="button"
              data-magnetic
              data-wwb-goto={i}
              aria-controls={`wwb-card-${system.id}`}
              aria-label={`Show system ${system.id}, ${system.short}`}
              className="wwb-rail__btn"
            >
              {system.id}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
