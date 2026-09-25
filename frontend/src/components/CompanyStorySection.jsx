import { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight } from 'lucide-react';
import { useMagneticScope } from '../lib/motion/useMagnetic';
import StoryModal from './cohesion/StoryModal';
import PhilosophyStatement from './cohesion/PhilosophyStatement';
import useStoryChoreography from './cohesion/useStoryChoreography';
import './cohesion/cohesion.css';

/* Magnetic pills move on the CSS `translate` property every frame; keep it out
   of .btn's transition-all so the spring is not smeared by a CSS transition. */
const MAGNETIC_TRANSITION = 'transition-[background-color,border-color,color,transform] duration-200';

export default function CompanyStorySection({ onOpenContact }) {
  const scopeRef = useRef(null);
  const ctaRef = useRef(null);
  const [open, setOpen] = useState(false);
  const openStory = useCallback(() => setOpen(true), []);
  const closeStory = useCallback(() => setOpen(false), []);
  useStoryChoreography(scopeRef);
  useMagneticScope(ctaRef, { strength: 0.35 });

  return (
    <section ref={scopeRef} id="company" className="relative -mt-px bg-black py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Editorial narrative */}
          <div className="lg:col-span-7">
            <div data-cs="eyebrow" className="eyebrow mb-6">
              Operational leverage • Company narrative
            </div>
            <h2 data-cs="heading" className="font-display text-4xl font-bold leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Built through <br />
              practical implementation.
            </h2>
          </div>

          <div className="lg:col-span-5 lg:pt-24">
            <div className="max-w-2xl space-y-5 leading-relaxed">
              <p data-cs="lead" className="text-xl font-medium text-white sm:text-2xl">
                Lumi AI was built through practical implementation rather than experimentation.
              </p>
              <p data-cs="copy" className="text-base text-silver sm:text-lg">
                The founding team spent years designing and deploying AI solutions for real businesses, working across
                customer engagement, business automation, enterprise AI, generative AI, intelligent assistants, and
                AI-powered business platforms.
              </p>
              <p data-cs="copy" className="text-base text-silver sm:text-lg">
                Today, Lumi AI partners with organizations worldwide to modernize customer interactions, streamline
                internal operations, and build custom AI-powered products that create measurable business value.
              </p>
            </div>

            <div ref={ctaRef} data-cs="cta" className="mt-10 flex flex-wrap items-center gap-3">
              <button
                type="button"
                data-magnetic
                onClick={openStory}
                aria-haspopup="dialog"
                aria-expanded={open}
                className={`btn-invert group px-6 py-3.5 text-sm ${MAGNETIC_TRANSITION}`}
              >
                <span>More about Lumi AI</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                type="button"
                data-magnetic
                onClick={onOpenContact}
                className={`btn border border-white/10 px-5 py-3.5 font-mono text-xs font-medium text-neutral-400 hover:border-white/40 hover:text-white ${MAGNETIC_TRANSITION}`}
              >
                Partner with us →
              </button>
            </div>
          </div>
        </div>

        <PhilosophyStatement />
      </div>

      {open && createPortal(<StoryModal onClose={closeStory} />, document.body)}
    </section>
  );
}
