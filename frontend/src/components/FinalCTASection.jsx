import React, { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { LupusMark } from './BrandLogo';
import useReveal from '../hooks/useReveal';

export default function FinalCTASection({ onOpenContact }) {
  const scopeRef = useRef(null);
  useReveal(scopeRef);

  return (
    <section ref={scopeRef} className="relative -mt-px overflow-hidden bg-black py-24 text-center sm:py-32">
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* High-contrast conversion container: white on black */}
        <div data-scrub-scale className="relative overflow-hidden rounded-3xl bg-white p-8 text-black shadow-glow sm:p-14 lg:p-16">
          <div data-parallax="0.25" className="pointer-events-none absolute -right-16 -top-16"><LupusMark className="h-72 w-72 text-black/[0.05]" /></div>
          <div className="relative">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-black/15 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-neutral-600">
              <LupusMark className="h-4 w-4 text-black" />
              Start your project • Initiate engagement
            </div>

            <h2 className="mx-auto mb-6 max-w-3xl font-display text-3xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Have a business problem worth <span className="text-neutral-500">solving with AI?</span>
            </h2>

            <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
              Tell us what you're trying to improve. We'll help you determine what should actually be built.
            </p>

            <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                type="button"
                onClick={onOpenContact}
                className="btn group w-full bg-black px-8 py-4 text-sm text-white hover:bg-neutral-800 sm:w-auto"
              >
                <span>Talk to Lumi</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <a
                href="#selected-work"
                className="btn w-full border border-black/20 px-8 py-4 text-sm text-black hover:bg-black hover:text-white sm:w-auto"
              >
                <span>Explore our work</span>
                <span>→</span>
              </a>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 font-mono text-xs text-neutral-500">
              <span>• 48-Hour Response SLA</span>
              <span>• Direct Founder Discovery</span>
              <span>• Strict Mutual NDA</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
