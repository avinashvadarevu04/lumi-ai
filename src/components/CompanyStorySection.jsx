import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, X, Terminal } from 'lucide-react';
import { LupusMark } from './BrandLogo';
import useReveal from '../hooks/useReveal';

function StoryModal({ onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const principles = [
    ['Business Before Technology', 'Start with the financial bottleneck, then formulate the AI system.'],
    ['Outcomes Before Features', 'Lead with measurable margin impact rather than technical specs.'],
    ['Systems Before Tools', 'Deliver connected systems that integrate with existing ERP, CRM, and communication stacks.'],
    ['Partnership Before Projects', 'Act as a long-term technology implementation partner.'],
  ];

  return (
    <div
      className="animate-fade-in fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="About Lumi AI"
    >
      <div className="panel relative max-h-[85vh] w-full max-w-2xl overflow-y-auto p-6 shadow-card sm:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between border-b border-white/10 pb-6">
          <div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-graphite">Lumi AI / Lupus AI Labs</span>
            <h3 className="font-display text-2xl font-bold text-white">Our Background & Positioning</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-neutral-400 transition-colors hover:bg-white hover:text-black" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 py-6 text-sm leading-relaxed text-neutral-300">
          <div>
            <h4 className="mb-2 font-semibold text-white">Category definition</h4>
            <p className="text-silver">
              Lumi AI is strictly an <strong className="text-white">AI Systems Company</strong>. We are not a prompt engineering agency, nor a
              company building experimental demo chatbots. We build deeply integrated operational infrastructure.
            </p>
          </div>
          <div>
            <h4 className="mb-2 font-semibold text-white">Internal positioning principles</h4>
            <ul className="space-y-2 text-xs text-silver">
              {principles.map(([k, v]) => (
                <li key={k} className="flex items-start gap-2">
                  <span className="font-bold text-white">✓</span>
                  <span>
                    <strong className="text-white">{k}:</strong> {v}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-white p-4 text-xs text-neutral-800">
            <span className="font-bold text-black">Global vision: </span>
            To become the trusted AI Systems Company enabling businesses worldwide to operate more intelligently through
            practical, scalable, and production-ready AI systems.
          </div>
        </div>

        <div className="flex justify-end border-t border-white/10 pt-4">
          <button type="button" onClick={onClose} className="btn-primary px-6 py-2 text-xs">
            Close window
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CompanyStorySection({ onOpenContact }) {
  const scopeRef = useRef(null);
  const [open, setOpen] = useState(false);
  useReveal(scopeRef);

  return (
    <section ref={scopeRef} id="company" className="relative -mt-px bg-black py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Editorial narrative */}
          <div className="lg:col-span-8">
            <div data-reveal className="eyebrow mb-6">Operational leverage • Company narrative</div>
            <h2 data-split className="mb-8 font-display text-3xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Built through <br />
              practical implementation.
            </h2>
            <div className="mb-10 max-w-2xl space-y-5 leading-relaxed">
              <p data-reveal="clip" className="text-xl font-medium text-white sm:text-2xl">
                Lumi AI was built through practical implementation rather than experimentation.
              </p>
              <p data-reveal className="text-base text-silver sm:text-lg">
                The founding team spent years designing and deploying AI solutions for real businesses, working across
                customer engagement, business automation, enterprise AI, generative AI, intelligent assistants, and
                AI-powered business platforms.
              </p>
              <p data-reveal className="text-base text-silver sm:text-lg">
                Today, Lumi AI partners with organizations worldwide to modernize customer interactions, streamline
                internal operations, and build custom AI-powered products that create measurable business value.
              </p>
            </div>
            <div data-reveal className="flex flex-wrap items-center gap-5">
              <button type="button" onClick={() => setOpen(true)} className="btn-invert group px-6 py-3.5 text-sm">
                <span>More about Lumi AI</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                type="button"
                onClick={onOpenContact}
                className="cursor-pointer font-mono text-xs text-neutral-400 underline underline-offset-4 transition-colors hover:text-white"
              >
                Partner with us →
              </button>
            </div>
          </div>

          {/* Philosophy stamp */}
          <div data-reveal="right" data-delay="0.2" className="lg:col-span-4">
            <div className="panel relative overflow-hidden p-8">
              <div data-parallax="-0.15" className="pointer-events-none absolute -bottom-8 -right-8"><LupusMark className="h-44 w-44 text-white/[0.04]" /></div>
              <div className="mb-4 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-graphite">
                <Terminal className="h-3.5 w-3.5 text-white" />
                <span>Founding philosophy</span>
              </div>
              <blockquote className="mb-6 font-display text-xl font-bold leading-snug text-white sm:text-2xl">
                "AI creates value only when it solves meaningful business problems and becomes part of everyday
                business operations."
              </blockquote>
              <div className="flex items-center justify-between border-t border-white/10 pt-6">
                <div>
                  <div className="text-sm font-bold text-white">Lupus AI Labs</div>
                  <div className="font-mono text-xs text-graphite">Autonomous Systems Group</div>
                </div>
                <LupusMark className="h-9 w-9 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {open && <StoryModal onClose={() => setOpen(false)} />}
    </section>
  );
}
