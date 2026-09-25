import React from 'react';

/**
 * One entry per glyph so each can be tracked outward with a transform, never
 * with letter-spacing. Spaces become no-break spaces: an inline-block holding
 * only a collapsible space would shrink to zero width.
 */
const GLYPHS = Array.from('LUPUS AI LABS').map((char, index) => ({
  id: `${index}-${char}`,
  char: char === ' ' ? '\u00A0' : char,
}));

/**
 * Giant outlined brand type behind the CTA copy. Three nested layers, so no
 * element is ever animated by two systems:
 *   [data-final="giant"]       opacity, faded out by the footer handover
 *   [data-final="giant-line"]  scale toward the viewer, then in-pin dimming
 *   [data-final="giant-char"]  x offsets that widen the tracking
 */
export default function GiantType() {
  return (
    <div data-final="giant" className="final-giant pointer-events-none absolute inset-0 flex items-center justify-center">
      <div data-final="giant-line" className="final-giant__line whitespace-nowrap font-display font-bold uppercase leading-none">
        {GLYPHS.map(({ id, char }) => (
          <span key={id} data-final="giant-char" className="inline-block">
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}
