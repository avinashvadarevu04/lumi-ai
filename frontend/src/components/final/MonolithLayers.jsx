import React from 'react';
import { LupusMark } from '../BrandLogo';
import { SHEEN_STYLE } from '../../lib/motion/useTilt';
import GiantType from './GiantType';

const CORNERS = ['tl', 'tr', 'bl', 'br'];

/**
 * Decorative strata of the monolith (aria-hidden, never interactive). Their
 * geometry comes from the --f, --inset and --radius variables on .final-frame
 * (see final.css), so the whole collapse is one scrubbed custom property:
 *   edge  a light field clipped to the frame; the body is clipped 1px tighter,
 *         which leaves a hairline highlight ring, brightest along the top
 *   body  the black void that turns into a charcoal face as the frame closes,
 *         holding the receding grid, the giant type, the watermark mark, the
 *         corner ticks and a pointer-tracked sheen (variables from useTilt)
 */
export default function MonolithLayers({ bodyRef }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="final-edge absolute inset-0" />
      <div ref={bodyRef} className="final-body absolute inset-0 overflow-hidden">
        <div className="final-face absolute inset-0" />
        <div data-final="grid" className="final-grid architect-grid gpu absolute -inset-[6%]" />
        <GiantType />
        <div data-final="watermark" className="final-watermark gpu absolute">
          <LupusMark className="h-72 w-72 text-white/[0.04]" />
        </div>
        <div className="final-corners absolute">
          {CORNERS.map((corner) => (
            <span key={corner} className={`final-corner final-corner--${corner}`} />
          ))}
        </div>
        <div className="absolute inset-0 opacity-60">
          <div className="absolute inset-0" style={SHEEN_STYLE} />
        </div>
      </div>
    </div>
  );
}
