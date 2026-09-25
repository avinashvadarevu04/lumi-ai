import { useRef } from 'react';
import { Check } from 'lucide-react';
import useTilt, { TILT_STYLE, SHEEN_STYLE } from '../../lib/motion/useTilt';

/**
 * One stage of the delivery lifecycle.
 *
 *   li[data-hwb=step]    carries data-lit (timeline state) and the rail node
 *   div[data-hwb=card]   the landing wrapper GSAP animates (never tilted)
 *   article              the face that tilts under the pointer, with a sheen
 *
 * The stage name is a real button whose ::after is stretched over the whole
 * card, so the card stays clickable while its heading, copy and deliverables
 * remain real semantic elements. Hover, click and keyboard focus all select it.
 */
export default function StageCard({ stage, index, active, onActivate }) {
  const landRef = useRef(null);
  const faceRef = useRef(null);
  useTilt(faceRef, { max: 4, boundsRef: landRef });

  const activate = () => onActivate(index);

  return (
    <li data-hwb="step" className="hwb-step relative flex flex-col pl-10 lg:pl-0 lg:pt-12">
      <span data-hwb="node" aria-hidden="true" className="hwb-node left-[4px] top-[17px] sm:top-[25px] lg:left-[25px] lg:top-0" />

      <div ref={landRef} data-hwb="card" className="flex flex-1 flex-col">
        <article
          ref={faceRef}
          style={TILT_STYLE}
          onMouseEnter={activate}
          className={`group relative flex flex-1 flex-col justify-between gap-6 rounded-3xl border p-6 transition-[background-color,border-color,color] duration-300 sm:p-8 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,17rem)] md:gap-10 lg:flex lg:gap-6 ${
            active ? 'border-white bg-white text-black' : 'border-white/10 bg-ink-800 text-white hover:border-white/40'
          }`}
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-3xl" style={SHEEN_STYLE} />

          <div>
            <div
              aria-hidden="true"
              className={`mb-6 h-px w-20 origin-left scale-x-[0.6] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-focus-within:scale-x-100 group-hover:scale-x-100 ${
                active ? 'bg-black' : 'bg-white'
              }`}
            />
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className={`font-mono text-xs font-bold ${active ? 'text-neutral-600' : 'text-graphite'}`}>STEP {stage.id}</span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] ${
                  active ? 'border-black/20 text-black' : 'border-white/15 text-neutral-400'
                }`}
              >
                {stage.live && <span aria-hidden="true" className="hwb-live" />}
                {/* The visible label is scrambled by the choreography; screen readers get the stable copy. */}
                <span data-hwb="badge" aria-hidden="true" className="hwb-badge">
                  {stage.badge}
                </span>
                <span className="sr-only">{stage.badge}</span>
              </span>
            </div>
            <h3 className="mb-1 font-display text-2xl font-bold tracking-tight">
              <button
                type="button"
                aria-pressed={active}
                onClick={activate}
                onFocus={activate}
                className="text-left after:absolute after:inset-0 after:rounded-3xl focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-white"
              >
                {stage.name}
              </button>
            </h3>
            <p className={`mb-6 font-mono text-xs ${active ? 'text-neutral-600' : 'text-graphite'}`}>{stage.subtitle}</p>
            <p className={`text-xs leading-relaxed sm:text-sm ${active ? 'text-neutral-700' : 'text-silver'}`}>{stage.description}</p>
          </div>

          <div
            className={`border-t pt-6 md:border-l md:border-t-0 md:pl-10 md:pt-0 lg:border-l-0 lg:border-t lg:pl-0 lg:pt-6 ${
              active ? 'border-black/10' : 'border-white/10'
            }`}
          >
            <p className={`mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] ${active ? 'text-neutral-500' : 'text-graphite'}`}>
              Core deliverables
            </p>
            <ul className="space-y-2.5">
              {stage.points.map((point) => (
                <li key={point} data-hwb="point" className="flex items-center gap-2 text-xs">
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                      active ? 'bg-black text-white' : 'bg-white text-black'
                    }`}
                  >
                    <Check className="h-2.5 w-2.5" aria-hidden="true" />
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>
      </div>
    </li>
  );
}
