import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Search, Cpu, Code2, Rocket, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import useReveal from '../hooks/useReveal';

const STEPS = [
  {
    id: 1,
    title: 'Problem',
    full: 'Business Problem',
    tag: 'INPUT',
    icon: AlertCircle,
    details:
      'We never start with AI models or buzzwords. We pinpoint where humans are overwhelmed by manual processes, where customer response delays lose revenue, or where paperwork stalls execution.',
    deliverable: 'Operational Bottleneck Diagnostic & ROI Thesis',
  },
  {
    id: 2,
    title: 'Workflow',
    full: 'Understand the Workflow',
    tag: 'ANALYSIS',
    icon: Search,
    details:
      'We dissect how information currently moves: documents received, team touchpoints, software used (ERP, CRM, WhatsApp), edge cases, and human decision points.',
    deliverable: 'End-to-End Process Map & Data Schema',
  },
  {
    id: 3,
    title: 'System Design',
    full: 'Design the AI System',
    tag: 'ARCHITECTURE',
    icon: Cpu,
    details:
      'We select the right model architectures, retrieval systems, state machines, and API boundaries. We build human-in-the-loop oversight layers so business users always remain in control.',
    deliverable: 'AI System Blueprint & Security Architecture',
  },
  {
    id: 4,
    title: 'Build',
    full: 'Build & Integrate',
    tag: 'ENGINEERING',
    icon: Code2,
    details:
      'We develop robust backends, real-time telephony/messaging webhooks, OCR/LLM pipelines, and connect directly to your existing software stack without disrupting current operations.',
    deliverable: 'Tested Production Codebase & Custom Connectors',
  },
  {
    id: 5,
    title: 'Deploy',
    full: 'Deploy',
    tag: 'ROLLOUT',
    icon: Rocket,
    details:
      'We deploy to scalable cloud infrastructure, train your operational team, monitor latency and accuracy thresholds, and establish real-time error logging and fallback guards.',
    deliverable: 'Live Production Deployment & Monitoring Dashboard',
  },
  {
    id: 6,
    title: 'Outcome',
    full: 'Business Outcome',
    tag: 'RESULT',
    icon: TrendingUp,
    details:
      'The system becomes part of everyday business operations — lowering operational costs, accelerating response times, and enabling scale without proportional hiring.',
    deliverable: 'Validated ROI Metrics & Maintenance Retainer',
  },
];

export default function HowWeThinkSection() {
  const scopeRef = useRef(null);
  const [active, setActive] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  useReveal(scopeRef);

  useEffect(() => {
    const el = scopeRef.current;
    if (!el || !autoPlay) return undefined;
    let intervalId = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        window.clearInterval(intervalId);
        if (entry.isIntersecting) {
          intervalId = window.setInterval(() => setActive((p) => (p + 1) % STEPS.length), 3200);
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearInterval(intervalId);
    };
  }, [autoPlay]);

  const current = STEPS[active];

  return (
    <section ref={scopeRef} id="how-we-think" className="relative -mt-px overflow-hidden bg-black py-24 sm:py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center sm:mb-20">
          <div data-reveal className="eyebrow mb-5">Engineering methodology • Workflow blueprint</div>
          <h2 data-split className="mb-4 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            We start with the problem. <br />
            <span className="text-neutral-500">Not the technology.</span>
          </h2>
          <p data-reveal className="text-base text-silver sm:text-lg">
            Every Lumi AI system follows a disciplined engineering progression designed to create permanent operating
            leverage.
          </p>
        </div>

        {/* Pipeline nodes */}
        <div className="relative">
          <div className="absolute left-[6%] right-[6%] top-[38px] z-0 hidden h-px bg-white/10 lg:block">
            <div
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${(active / (STEPS.length - 1)) * 100}%` }}
            />
          </div>

          <div data-stagger="scale" className="relative z-10 mb-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isCurrent = idx === active;
              const isPast = idx < active;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    setActive(idx);
                    setAutoPlay(false);
                  }}
                  className={`group relative flex cursor-pointer flex-col items-center rounded-2xl border p-4 text-left transition-all duration-300 lg:items-start ${
                    isCurrent
                      ? 'border-white bg-white text-black'
                      : isPast
                      ? 'border-white/25 bg-ink-800 text-white hover:border-white/50'
                      : 'border-white/10 bg-black text-neutral-400 hover:border-white/30 hover:text-white'
                  }`}
                >
                  <div
                    className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl border transition-colors ${
                      isCurrent ? 'border-black/20 bg-black text-white' : 'border-white/10 bg-ink-700 text-current'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`mb-1 font-mono text-[10px] font-semibold tracking-[0.15em] ${isCurrent ? 'text-neutral-600' : 'text-graphite'}`}>
                    0{step.id} // {step.tag}
                  </span>
                  <h4 className="text-center text-sm font-semibold lg:text-left">{step.title}</h4>
                  {idx < STEPS.length - 1 && (
                    <ArrowRight className="absolute -right-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-neutral-700 lg:block" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Inspector */}
          <div data-reveal="scale" className="panel relative overflow-hidden p-6 sm:p-10">
            <div className="absolute inset-x-0 top-0 h-px bg-white/40" />
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <div className="mb-3 flex items-center gap-3">
                  <span className="rounded-full border border-white/15 px-2.5 py-1 font-mono text-[11px] font-semibold text-neutral-300">
                    STAGE 0{current.id} OF 06
                  </span>
                  <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-white">{current.tag}</span>
                </div>
                <h3 className="mb-4 font-display text-2xl font-bold text-white sm:text-3xl">{current.full}</h3>
                <p className="mb-6 text-sm leading-relaxed text-silver sm:text-base">{current.details}</p>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black px-3.5 py-1.5 font-mono text-[11px] text-white">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>OUTPUT: {current.deliverable}</span>
                </div>
              </div>

              <div className="flex flex-col items-start justify-between border-t border-white/10 pt-6 lg:col-span-4 lg:items-end lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                <div className="mb-6 text-left lg:text-right">
                  <div className="mb-1 font-mono text-[10px] tracking-[0.2em] text-graphite">EXECUTION PHILOSOPHY</div>
                  <div className="text-sm font-semibold text-white">
                    "AI creates value only when it becomes part of everyday business operations."
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={active === 0}
                    onClick={() => {
                      setAutoPlay(false);
                      setActive((p) => Math.max(0, p - 1));
                    }}
                    className="btn-invert px-4 py-2 font-mono text-xs disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    ← PREV
                  </button>
                  <button
                    type="button"
                    disabled={active === STEPS.length - 1}
                    onClick={() => {
                      setAutoPlay(false);
                      setActive((p) => Math.min(STEPS.length - 1, p + 1));
                    }}
                    className="btn-primary px-4 py-2 font-mono text-xs disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    NEXT →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
