import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { SHEEN_STYLE } from '../../lib/motion/useTilt';
import CardWireframe from './CardWireframe';

/**
 * One capability pillar as a sheet of obsidian glass.
 *
 *   article.wwb-card   outer wrapper: GSAP owns its transform and filter (deck motion)
 *   div.wwb-face       inner face: pointer tilt via CSS custom properties (desktop only)
 *
 * Keeping the two transforms on separate elements lets the scroll timeline and
 * the spring-driven tilt run at the same time without fighting.
 */
export default function SystemCard({ system, index, total, onOpenContact }) {
  const Icon = system.icon;
  const titleId = `wwb-title-${system.id}`;

  return (
    <article
      id={`wwb-card-${system.id}`}
      data-wwb-card={system.tag}
      aria-labelledby={titleId}
      className="wwb-card relative flex"
      style={{ zIndex: index + 1 }}
    >
      <div data-wwb-face className="wwb-face">
        <CardWireframe index={index} total={total} />

        <div className="relative grid flex-1 grid-cols-1 gap-8 p-6 sm:p-10 lg:grid-cols-12 lg:gap-10 lg:p-9 xl:gap-12 xl:p-10">
          {/* Left: pitch, outcomes and call to action */}
          <div className="flex flex-col lg:col-span-6">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="font-mono text-2xl font-bold text-neutral-700 sm:text-3xl">{system.id}</span>
              <span className="rounded-full border border-white/15 px-3 py-1 font-mono text-[11px] font-semibold tracking-[0.15em] text-white">
                {system.tag}
              </span>
            </div>

            <h3
              id={titleId}
              className="mb-4 font-display text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-[1.75rem] xl:text-[2rem]"
            >
              {system.title}
            </h3>
            <p className="mb-7 text-sm leading-relaxed text-silver sm:text-base lg:text-[15px]">{system.description}</p>

            <div className="border-t border-white/10 pt-5">
              <h4 className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-graphite">
                <CheckCircle2 className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                Measurable business outcomes
              </h4>
              <ul className="grid grid-cols-1 gap-3 text-xs text-neutral-300 sm:grid-cols-2 sm:text-sm lg:text-[13px]">
                {system.outcomes.map((outcome) => (
                  <li key={outcome} data-wwb-outcome className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white" aria-hidden="true" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto flex flex-wrap items-center gap-4 pt-7">
              <button type="button" data-magnetic onClick={onOpenContact} className="btn-primary px-6 py-3 text-xs">
                Deploy {system.short} System
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <span className="font-mono text-xs text-graphite">{system.metrics}</span>
            </div>
          </div>

          {/* Right: system modules */}
          <div className="flex flex-col gap-2.5 lg:col-span-6">
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black px-4 py-2 font-mono text-[11px] tracking-[0.15em] text-graphite">
              <span className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                SYSTEM_MODULES
              </span>
              <span className="text-white">PRODUCTION READY</span>
            </div>

            <ul className="flex flex-col gap-2.5">
              {system.capabilities.map((capability, i) => (
                <li key={capability.name} data-wwb-module className="panel-sub group cursor-default px-4 py-3 invert-hover">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <h5 className="flex items-center gap-2 text-sm font-semibold">
                      <span className="h-2 w-2 shrink-0 bg-current" aria-hidden="true" />
                      {capability.name}
                    </h5>
                    <span className="font-mono text-[10px] text-neutral-500 group-hover:text-neutral-700">MOD_0{i + 1}</span>
                  </div>
                  <p className="pl-4 text-xs leading-relaxed text-silver group-hover:text-neutral-700">{capability.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Cursor spotlight; --sheen stays 0 unless the desktop tilt is attached. */}
        <div aria-hidden="true" className="wwb-sheen" style={SHEEN_STYLE} />
      </div>
    </article>
  );
}
