import { Terminal } from 'lucide-react';
import { LupusMark } from '../BrandLogo';

/**
 * The founding philosophy, set as kinetic typography.
 *
 * With motion allowed, useStoryChoreography splits the quote into words and
 * fills each one from a dim outline to solid white as it crosses the viewport
 * (the hairline beside the label tracks reading progress), while the grid and
 * the watermark drift at their own depths. Before JS runs, and under reduced
 * motion, it is plain solid text with everything in place.
 */
export default function PhilosophyStatement() {
  return (
    <figure className="relative mt-20 sm:mt-28">
      <div data-cs="panel" className="cs-panel relative overflow-hidden rounded-3xl border border-white/10 px-6 py-10 sm:px-12 sm:py-14 lg:px-16 lg:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute -inset-y-12 inset-x-0">
          <div data-cs="grid" className="architect-grid cs-grid-mask h-full w-full lg:gpu" />
        </div>
        <div aria-hidden="true" data-cs="mark" className="pointer-events-none absolute -bottom-20 -right-16 sm:-right-10 lg:gpu">
          <LupusMark className="h-72 w-72 text-white/[0.04] sm:h-[26rem] sm:w-[26rem]" />
        </div>

        <div className="relative mb-10 flex items-center gap-4 font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-graphite sm:mb-14">
          <span className="flex shrink-0 items-center gap-2">
            <Terminal className="h-3.5 w-3.5 text-white" aria-hidden="true" />
            <span>Founding philosophy</span>
          </span>
          <span aria-hidden="true" className="relative h-px flex-1 overflow-hidden bg-white/10">
            <span data-cs="progress" className="absolute inset-0 origin-left bg-white/60" />
          </span>
        </div>

        <blockquote
          data-cs="quote"
          className="relative max-w-5xl font-display text-[length:clamp(1.75rem,4.6vw,4.25rem)] font-bold leading-[1.08] tracking-tight text-white"
        >
          &quot;AI creates value only when it solves meaningful business problems and becomes part of everyday business operations.&quot;
        </blockquote>

        <figcaption data-cs="caption" className="relative mt-12 flex items-center justify-between border-t border-white/10 pt-6 sm:mt-16">
          <div>
            <div className="text-sm font-bold text-white">Lupus AI Labs</div>
            <div className="font-mono text-xs text-graphite">Autonomous Systems Group</div>
          </div>
          <LupusMark className="h-9 w-9 text-white" />
        </figcaption>
      </div>
    </figure>
  );
}
