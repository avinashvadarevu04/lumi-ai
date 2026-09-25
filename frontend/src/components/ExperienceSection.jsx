import React, { useLayoutEffect, useRef } from 'react';
import { Globe2, Award, CheckCircle } from 'lucide-react';
import useReveal from '../hooks/useReveal';
import { gsap } from '../lib/motion/gsap';
import { MOTION } from '../lib/motion/prefs';
import MetricCard from './experience/MetricCard';
import { createIsoGrid } from './experience/isoGrid';
import { setupMetricReels } from './experience/metricReels';
import './experience/experience.css';

const METRICS = [
  { target: 50, label: 'Projects Delivered', sub: '250+ systems delivered across team careers for startups to enterprises.' },
  { target: 3, label: 'Years of Production AI', sub: 'Continuous hands-on implementation since the dawn of modern LLMs.' },
  { target: 5, label: 'Countries Served', sub: 'Deployments in India, UK, USA, Australia, and Canada.' },
  { target: 20, label: 'Core AI Systems', sub: 'Reusable production architectures spanning voice, vision, and ERP workflows.' },
];

const CREDENTIALS = [
  'AI-First Architecture & Engineering',
  'Founder-Led Senior Technical Team',
  'Full Non-Disclosure Agreement (NDA) Compliance',
  'Direct Autonomous LLM + MCP Orchestration',
  'Strict Low-Latency Voice & Telephony Pipes',
  'Substantial Operational Cost Optimizations',
];

/**
 * Metrics / Impact.
 *  desktop: the counters roll as slot-machine reels (motion blur, elastic lock,
 *           staggered per digit and per metric) while the cards flip into place;
 *           the isometric field swells with scroll velocity and ripples around the pointer.
 *  mobile:  each card reveals and rolls on its own with shorter reels; the field
 *           is low resolution with a lighter swell and no pointer ripple.
 *  reduce:  final numbers straight away over a static grid.
 * The header and credentials strip keep the shared useReveal entrances.
 */
export default function ExperienceSection() {
  const scopeRef = useRef(null);
  const canvasRef = useRef(null);
  const metricsRef = useRef(null);
  useReveal(scopeRef);

  useLayoutEffect(() => {
    const section = scopeRef.current;
    const canvas = canvasRef.current;
    const metrics = metricsRef.current;
    if (!section || !canvas || !metrics) return undefined;

    const mm = gsap.matchMedia(section);
    mm.add(MOTION, (context) => {
      const { desktop, mobile } = context.conditions;
      let branch = 'reduce';
      if (desktop) branch = 'desktop';
      else if (mobile) branch = 'mobile';

      const field = createIsoGrid(canvas, { mode: branch, pointerTarget: section });
      const restoreReels = branch === 'reduce' ? null : setupMetricReels(metrics, branch);

      // Runs after GSAP has reverted this branch's tweens and triggers.
      return () => {
        field.destroy();
        if (restoreReels) restoreReels();
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={scopeRef} id="experience" className="relative -mt-px overflow-hidden bg-black py-24 sm:py-32">
      {/* Isometric field that warps with scroll velocity (experience/isoGrid.js). */}
      <div aria-hidden="true" className="xp-field pointer-events-none absolute inset-0">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      </div>
      <div aria-hidden="true" className="xp-glow pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 flex flex-col justify-between gap-8 sm:mb-20 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div data-reveal className="eyebrow mb-5">
              <Award className="h-3.5 w-3.5" />
              Proven impact • Track record
            </div>
            <h2 data-split className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
              Built. Deployed. <span className="text-neutral-500">Used.</span>
            </h2>
          </div>
          <p data-reveal className="max-w-xl text-sm leading-relaxed text-silver sm:text-base">
            Our experience spans AI applications, automation systems, intelligent business solutions, enterprise
            platforms, conversational AI, generative AI, voice systems, and business process automation.
          </p>
        </div>

        {/* Metrics */}
        <ul
          ref={metricsRef}
          role="list"
          className="mb-16 grid grid-cols-1 overflow-hidden rounded-3xl border border-white/10 sm:grid-cols-2 lg:grid-cols-4"
        >
          {METRICS.map((metric, idx) => (
            <MetricCard key={metric.label} metric={metric} index={idx} />
          ))}
        </ul>

        {/* Footprint & credentials */}
        <div data-reveal className="panel grid grid-cols-1 items-center gap-6 p-6 sm:p-8 lg:grid-cols-12">
          <div className="flex items-center gap-4 lg:col-span-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-black text-white">
              <Globe2 className="h-6 w-6" />
            </div>
            <div>
              <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-graphite">International footprint</div>
              <div className="text-sm font-semibold text-white">India • United Kingdom • USA • Australia</div>
            </div>
          </div>
          <div className="relative overflow-hidden lg:col-span-8 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
            <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap">
              {[...CREDENTIALS, ...CREDENTIALS].map((c, i) => (
                <div key={`${c}-${i}`} className="flex items-center gap-2 text-xs text-neutral-300">
                  <CheckCircle className="h-3.5 w-3.5 shrink-0 text-white" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
