import React, { useRef, useState } from 'react';
import { Check } from 'lucide-react';
import useReveal from '../hooks/useReveal';

const STAGES = [
  {
    id: '01',
    name: 'UNDERSTAND',
    subtitle: 'Discovery & Business Audit',
    points: ['Business goals', 'Existing workflows', 'Operational bottlenecks'],
    description:
      'We immerse ourselves in your operating environment to understand the real financial drivers, bottlenecks, and manual procedures before writing a single line of code.',
    badge: 'WEEK 1–2',
  },
  {
    id: '02',
    name: 'ARCHITECT',
    subtitle: 'System Design & Data Topology',
    points: ['AI architecture', 'Data mapping', 'Integrations & APIs', 'Security & RBAC'],
    description:
      'We blueprint the precise interaction of LLMs, agentic state machines, MCP connectors, vector retrieval layers, and database schemas with your existing tools.',
    badge: 'WEEK 2–3',
  },
  {
    id: '03',
    name: 'BUILD',
    subtitle: 'Engineering & Automation',
    points: ['AI models & prompts', 'Autonomous agents', 'Custom interfaces', 'Backend & Infrastructure'],
    description:
      'We develop the system with modular, test-driven pipelines, strict fallback mechanisms, low latency guardrails, and enterprise security standards.',
    badge: 'WEEK 3–6',
  },
  {
    id: '04',
    name: 'DEPLOY',
    subtitle: 'Rollout & Continuous Telemetry',
    points: ['Production rollout', 'Telemetry monitoring', 'Continuous optimization', 'Dedicated support retainers'],
    description:
      'We launch smoothly into production, onboard your operational teams, monitor real-world inference metrics 24/7, and continuously optimize model costs.',
    badge: 'PRODUCTION LIVE',
  },
];

export default function HowWeBuildSection() {
  const scopeRef = useRef(null);
  const [active, setActive] = useState(0);
  useReveal(scopeRef);

  return (
    <section ref={scopeRef} id="how-we-build" className="relative -mt-px bg-black py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 max-w-3xl sm:mb-20">
          <div data-reveal className="eyebrow mb-5">Implementation lifecycle • Process stages</div>
          <h2 data-split className="mb-4 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            How We Build. <span className="text-neutral-500">From idea to production.</span>
          </h2>
          <p data-reveal className="text-base text-silver sm:text-lg">
            A structured four-stage delivery model built for predictability, repeatability, and immediate business ROI.
          </p>
        </div>

        {/* 4 horizontal process cards */}
        <div data-stagger="scale" className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((stage, idx) => {
            const isActive = active === idx;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setActive(idx)}
                onMouseEnter={() => setActive(idx)}
                className={`group relative flex cursor-pointer flex-col justify-between rounded-3xl border p-6 text-left transition-all duration-300 sm:p-8 ${
                  isActive ? 'border-white bg-white text-black' : 'border-white/10 bg-ink-800 text-white hover:border-white/40'
                }`}
              >
                <div className={`mb-6 h-px w-12 transition-all group-hover:w-20 ${isActive ? 'bg-black' : 'bg-white'}`} />
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className={`font-mono text-xs font-bold ${isActive ? 'text-neutral-600' : 'text-graphite'}`}>STEP {stage.id}</span>
                    <span
                      className={`rounded-full border px-2 py-0.5 font-mono text-[10px] ${
                        isActive ? 'border-black/20 text-black' : 'border-white/15 text-neutral-400'
                      }`}
                    >
                      {stage.badge}
                    </span>
                  </div>
                  <h3 className="mb-1 font-display text-2xl font-bold tracking-tight">{stage.name}</h3>
                  <div className={`mb-6 font-mono text-xs ${isActive ? 'text-neutral-600' : 'text-graphite'}`}>{stage.subtitle}</div>
                  <p className={`mb-6 text-xs leading-relaxed sm:text-sm ${isActive ? 'text-neutral-700' : 'text-silver'}`}>{stage.description}</p>
                </div>

                <div data-pop className={`space-y-2.5 border-t pt-6 ${isActive ? 'border-black/10' : 'border-white/10'}`}>
                  <div className={`mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] ${isActive ? 'text-neutral-500' : 'text-graphite'}`}>
                    Core deliverables
                  </div>
                  {stage.points.map((pt) => (
                    <div key={pt} className="flex items-center gap-2 text-xs">
                      <div
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                          isActive ? 'bg-black text-white' : 'bg-white text-black'
                        }`}
                      >
                        <Check className="h-2.5 w-2.5" />
                      </div>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
