import React, { useId, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { LupusMark } from './BrandLogo';
import { useMagneticScope } from '../lib/motion/useMagnetic';
import useTilt from '../lib/motion/useTilt';
import MonolithLayers from './final/MonolithLayers';
import ScrambleLabel from './final/ScrambleLabel';
import useVoidCollapse from './final/useVoidCollapse';
import './final/final.css';

const ASSURANCES = ['• 48-Hour Response SLA', '• Direct Founder Discovery', '• Strict Mutual NDA'];

/**
 * Final CTA, "The Void Collapse": as the page ends, the full-bleed void closes
 * into a floating monolithic display unit while the giant brand type rushes
 * past the viewer and hands over to the footer lockup (final/useVoidCollapse).
 */
export default function FinalCTASection({ onOpenContact }) {
  const sectionRef = useRef(null);
  const frameRef = useRef(null);
  const bodyRef = useRef(null);
  const contentRef = useRef(null);
  const headingId = useId();

  useVoidCollapse(sectionRef);
  useMagneticScope(contentRef, { strength: 0.3 });
  // Pointer-tracked sheen across the monolith face only; nothing here tilts.
  useTilt(bodyRef, { max: 0, boundsRef: frameRef });

  return (
    <section ref={sectionRef} aria-labelledby={headingId} className="relative -mt-px bg-black">
      {/* Pinned on desktop: no ancestor of this stage may carry a transform or filter */}
      <div data-final="stage" className="relative">
        <div ref={frameRef} data-final="frame" className="final-frame relative flex items-center justify-center lg:min-h-svh">
          <MonolithLayers bodyRef={bodyRef} />

          <div ref={contentRef} data-final="content" className="final-content relative z-10 w-full max-w-5xl text-center">
            <div data-final="reveal" className="eyebrow mb-8 px-3.5 py-1.5">
              <span aria-hidden="true" className="inline-flex">
                <LupusMark className="h-4 w-4 text-white" />
              </span>
              <ScrambleLabel text="Start your project • Initiate engagement" />
            </div>

            <h2
              id={headingId}
              data-final="heading"
              className="mx-auto mb-6 max-w-3xl font-display text-3xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              Have a business problem worth <span className="text-neutral-500">solving with AI?</span>
            </h2>

            <p data-final="reveal" className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-silver sm:text-lg">
              Tell us what you're trying to improve. We'll help you determine what should actually be built.
            </p>

            <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 sm:flex-row">
              <div data-final="reveal" className="w-full sm:w-auto">
                <button
                  type="button"
                  data-magnetic
                  onClick={onOpenContact}
                  className="btn-primary group w-full px-8 py-4 text-sm sm:w-auto"
                >
                  <span>Talk to Lumi</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-focus-visible:translate-x-1" />
                </button>
              </div>
              <div data-final="reveal" className="w-full sm:w-auto">
                <a href="#selected-work" data-magnetic className="btn-outline w-full px-8 py-4 text-sm sm:w-auto">
                  <span>Explore our work</span>
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>

            <ul className="mt-12 flex flex-wrap items-center justify-center gap-6 font-mono text-xs text-neutral-500">
              {ASSURANCES.map((item) => (
                <li key={item} data-final="reveal">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
