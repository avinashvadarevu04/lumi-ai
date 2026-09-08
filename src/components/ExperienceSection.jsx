import React, { useEffect, useRef, useState } from 'react';
import { Globe2, Award, CheckCircle } from 'lucide-react';
import useReveal from '../hooks/useReveal';

function AnimatedCounter({ target, suffix = '+', active }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return undefined;
    let start = null;
    let raf = 0;
    const duration = 1800;
    const step = (ts) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setVal(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, target]);
  return (
    <span className="tabular-nums">
      {val}
      {suffix}
    </span>
  );
}

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

export default function ExperienceSection() {
  const scopeRef = useRef(null);
  const [inView, setInView] = useState(false);
  useReveal(scopeRef);

  useEffect(() => {
    const el = scopeRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={scopeRef} id="experience" className="relative -mt-px overflow-hidden bg-black py-24 sm:py-32">
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
        <div data-stagger="scale" className="mb-16 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((m, idx) => (
            <div key={m.label} className="group flex flex-col justify-between bg-black p-8 transition-colors duration-300 hover:bg-white">
              <div>
                <div className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-graphite group-hover:text-neutral-500">
                  METRIC // 0{idx + 1}
                </div>
                <div className="mb-3 font-display text-5xl font-bold tracking-tight text-white group-hover:text-black sm:text-6xl xl:text-7xl">
                  <AnimatedCounter target={m.target} active={inView} />
                </div>
                <div className="mb-2 text-lg font-semibold text-white group-hover:text-black">{m.label}</div>
              </div>
              <p className="border-t border-white/10 pt-4 text-xs leading-relaxed text-silver group-hover:border-black/10 group-hover:text-neutral-700">
                {m.sub}
              </p>
            </div>
          ))}
        </div>

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
