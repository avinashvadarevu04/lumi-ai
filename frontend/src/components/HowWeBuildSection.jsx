import { useRef, useState } from 'react';
import StageCard from './cohesion/StageCard';
import useBuildChoreography from './cohesion/useBuildChoreography';
import './cohesion/cohesion.css';

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
    live: true,
  },
];

const TOTAL = String(STAGES.length).padStart(2, '0');

export default function HowWeBuildSection() {
  const scopeRef = useRef(null);
  const [active, setActive] = useState(0);
  useBuildChoreography(scopeRef);

  return (
    <section ref={scopeRef} id="how-we-build" className="relative -mt-px bg-black py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 max-w-3xl sm:mb-20">
          <div data-hwb="eyebrow" className="eyebrow mb-5">
            Implementation lifecycle • Process stages
          </div>
          <h2 data-hwb="heading" className="mb-4 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            How We Build. <span className="text-neutral-500">From idea to production.</span>
          </h2>
          <p data-hwb="lede" className="text-base text-silver sm:text-lg">
            A structured four-stage delivery model built for predictability, repeatability, and immediate business ROI.
          </p>
        </div>

        {/* Lifecycle: a hairline rail (horizontal on desktop, vertical below lg) threads the four stage cards. */}
        <div data-hwb="list" className="relative">
          <div
            data-hwb="rail"
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-[11px] top-0 w-px bg-white/10 lg:bottom-auto lg:left-0 lg:right-0 lg:top-[7px] lg:h-px lg:w-auto"
          >
            <div data-hwb="fill" className="gpu absolute inset-0 origin-top bg-white/70 lg:origin-left" />
            <div data-hwb="head" className="hwb-head gpu absolute -left-[3px] -top-[3px] opacity-0" />
          </div>
          <div
            aria-hidden="true"
            className="absolute -top-10 right-0 hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-graphite lg:flex"
          >
            <span>Lifecycle</span>
            <span className="text-white">
              <span data-hwb="readout">{TOTAL}</span> / {TOTAL}
            </span>
          </div>

          <ol className="grid grid-cols-1 gap-5 lg:grid-cols-4">
            {STAGES.map((stage, idx) => (
              <StageCard key={stage.id} stage={stage} index={idx} active={active === idx} onActivate={setActive} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
