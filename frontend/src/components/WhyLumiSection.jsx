import React, { useRef } from 'react';
import { Target, ShieldCheck, Coins, TrendingUp } from 'lucide-react';
import useReveal from '../hooks/useReveal';

const PILLARS = [
  {
    id: '01',
    title: 'BUSINESS-FIRST',
    subtitle: 'Outcome driven',
    description: 'We understand the business problem before designing the technology.',
    detail:
      'We never sell AI for the sake of novelty. If a simpler rule-based pipeline or existing API solves the bottleneck, we recommend it. We measure success strictly in hours saved, inquiries converted, and bottom-line margin expansion.',
    icon: Target,
  },
  {
    id: '02',
    title: 'PRODUCTION-READY',
    subtitle: 'Engineered for reality',
    description: 'We build systems designed to operate in real business environments.',
    detail:
      'No fragile notebook prototypes or brittle wrappers. We build enterprise-grade systems with deterministic fallbacks, human-in-the-loop validation queues, 99.9% uptime, and rigorous security safeguards.',
    icon: ShieldCheck,
  },
  {
    id: '03',
    title: 'COST-EFFICIENT',
    subtitle: 'Sustainable unit economics',
    description: 'We design practical AI architectures around actual business requirements.',
    detail:
      'Unmonitored token consumption destroys margins. We optimize every layer — combining small fast models, targeted embeddings, intelligent caching, and selective LLM invocation to keep recurring inference expenses low.',
    icon: Coins,
  },
  {
    id: '04',
    title: 'SCALABLE',
    subtitle: 'Built for longevity',
    description: 'We build systems that can evolve as the business grows.',
    detail:
      'Your business won’t remain static, and neither should your technology. Our modular microservices and Model Context Protocol (MCP) tool bindings ensure you can swap frontier models or add new workflows without rewriting the system.',
    icon: TrendingUp,
  },
];

export default function WhyLumiSection() {
  const scopeRef = useRef(null);
  useReveal(scopeRef);

  return (
    <section ref={scopeRef} id="why-lumi" className="relative -mt-px bg-black py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center sm:mb-20">
          <div data-reveal className="eyebrow mb-5">Why partner with Lumi • Core pillars</div>
          <h2 data-split className="mb-4 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            Built for real <br />
            <span className="text-neutral-500">business operations.</span>
          </h2>
          <p data-reveal className="text-base text-silver sm:text-lg">
            Four foundational engineering principles that set Lumi AI apart from experimental agencies and generic
            software vendors.
          </p>
        </div>

        <div data-stagger="scale" className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 md:grid-cols-2">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.id} className="group flex flex-col justify-between bg-black p-8 transition-colors duration-300 hover:bg-white sm:p-10">
                <div>
                  <div className="mb-8 flex items-center justify-between">
                    <span data-parallax="0.08" className="font-mono text-4xl font-bold text-neutral-800 transition-colors group-hover:text-neutral-300">{p.id}</span>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 text-white transition-colors group-hover:border-black group-hover:bg-black">
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mb-1 font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-graphite group-hover:text-neutral-500">
                    {p.subtitle}
                  </div>
                  <h3 className="mb-3 font-display text-2xl font-bold tracking-tight text-white group-hover:text-black sm:text-3xl">{p.title}</h3>
                  <p className="mb-4 text-base font-medium leading-relaxed text-neutral-300 group-hover:text-neutral-800">{p.description}</p>
                </div>
                <p className="border-t border-white/10 pt-6 text-xs leading-relaxed text-graphite group-hover:border-black/10 group-hover:text-neutral-600 sm:text-sm">
                  {p.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
