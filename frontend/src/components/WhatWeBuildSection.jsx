import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MessageSquare, Workflow, Boxes, CheckCircle2, ArrowRight } from 'lucide-react';
import useReveal from '../hooks/useReveal';

gsap.registerPlugin(ScrollTrigger);

const SYSTEMS = [
  {
    id: '01',
    tag: 'CUSTOMER INTERACTION SYSTEMS',
    short: 'Customer Interaction',
    title: 'Automating customer communication & bookings at enterprise scale.',
    description:
      'Designing AI systems that automate and improve how businesses communicate with customers across chat, voice, WhatsApp, email, and intelligent support experiences — integrating directly with your CRM and booking systems.',
    icon: MessageSquare,
    capabilities: [
      { name: 'Voice AI Agents', desc: 'Inbound reception & outbound booking calls with natural human cadence.' },
      { name: 'WhatsApp AI Assistants', desc: 'Instant 24/7 lead qualification, catalog queries, and live updates.' },
      { name: 'Intelligent Support Systems', desc: 'Automated ticket routing, complaint triage, and resolution flows.' },
      { name: 'Autonomous Booking Systems', desc: 'End-to-end appointment scheduling, rescheduling, and confirmations.' },
      { name: 'Customer Knowledge Engines', desc: 'Instant grounded answers to complex policies, pricing, and FAQs.' },
    ],
    outcomes: [
      'Sub-15 second response time to all inquiries',
      '30% to 50% increase in lead-to-booking conversions',
      '24×7 customer availability without expanding shift headcount',
      'Seamless human-agent handoff when judgment is needed',
    ],
    metrics: '40% Cost Reduction • 24/7 Coverage',
  },
  {
    id: '02',
    tag: 'BUSINESS OPERATIONS SYSTEMS',
    short: 'Business Operations',
    title: 'Automating internal workflows, documents & operational intelligence.',
    description:
      'Building AI-powered internal systems that automate workflows, simplify repetitive paperwork, centralize organizational knowledge, and optimize cross-departmental operations so teams focus on high-value execution.',
    icon: Workflow,
    capabilities: [
      { name: 'Document Intelligence & IDP', desc: 'Structured field extraction from invoices, contracts, and legal PDFs.' },
      { name: 'AI Workflow Automation', desc: 'Automated multi-step approval, data synchronization, and exception queues.' },
      { name: 'Enterprise Knowledge Systems', desc: 'Context-aware semantic search over company SOPs, manuals, and emails.' },
      { name: 'Operational Control Planes', desc: 'Centralized visibility, real-time KPI synthesis, and task routing.' },
      { name: 'Internal AI Copilots', desc: 'Assisting staff with document drafts, research, and data verification.' },
    ],
    outcomes: [
      'Eliminates 80%+ of manual data-entry and verification time',
      'Instant information retrieval across siloed company databases',
      'Accelerated decision cycles from days to minutes',
      'Multi-location process consistency across branches',
    ],
    metrics: '15× Pipeline Acceleration • Zero Data Loss',
  },
  {
    id: '03',
    tag: 'AI PRODUCTS & PLATFORMS',
    short: 'AI Products',
    title: 'Custom AI applications, proprietary SaaS & scalable platforms.',
    description:
      'Developing custom AI-powered software, multi-sided platforms, and AI-native products designed specifically around your unique business requirements and commercial architecture.',
    icon: Boxes,
    capabilities: [
      { name: 'Custom AI SaaS Platforms', desc: 'Multi-tenant, subscription-ready digital platforms with AI cores.' },
      { name: 'Multi-Sided Marketplaces', desc: 'Dynamic job routing, provider matching, and inspection systems.' },
      { name: 'Autonomous LLM + MCP Systems', desc: 'Model Context Protocol agents orchestrating dozens of API tools.' },
      { name: 'Enterprise AI Dashboards', desc: 'Role-based access, real-time telemetry, and audit-ready data feeds.' },
      { name: 'AI Modernization of Legacy Apps', desc: 'Rebuilding legacy software with AI-native microservices.' },
    ],
    outcomes: [
      'Proprietary competitive advantage and IP ownership',
      'Scalable modern architecture built for high concurrent load',
      'Enterprise-grade security, RBAC, and data privacy compliance',
      'Fast go-to-market execution in weeks rather than quarters',
    ],
    metrics: 'Full IP Ownership • High-Scale Ready',
  },
];

export default function WhatWeBuildSection({ onOpenContact }) {
  const scopeRef = useRef(null);
  const cardsRef = useRef([]);
  useReveal(scopeRef);

  // Stacking depth: as the next card slides over, the card beneath recedes and dims
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const cards = cardsRef.current.filter(Boolean);
    const ctx = gsap.context(() => {
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        gsap.to(card, {
          scale: 0.94,
          opacity: 0.45,
          filter: 'blur(1.5px)',
          ease: 'none',
          scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 120px', scrub: true },
        });
      });
    }, scopeRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={scopeRef} id="what-we-build" className="relative -mt-px bg-black py-24 sm:py-32">
      <div className="mx-auto mb-16 max-w-7xl px-4 sm:mb-20 sm:px-6 lg:px-8">
        <div className="flex max-w-3xl flex-col items-start">
          <div data-reveal className="eyebrow mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            Capability pillars • AI systems
          </div>
          <h2 data-split className="mb-4 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            AI systems built around <br />
            <span className="text-neutral-500">real business problems.</span>
          </h2>
          <p data-reveal className="text-base leading-relaxed text-silver sm:text-lg">
            Unlike generic chatbots or disconnected automation tools, Lumi AI engineers integrated systems that become
            permanent operational assets.
          </p>
        </div>
      </div>

      {/* Sticky stacking cards */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-12 sm:space-y-16">
          {SYSTEMS.map((system, index) => {
            const Icon = system.icon;
            return (
              <div
                key={system.id}
                ref={(el) => {
                  cardsRef.current[index] = el;
                }}
                className="panel sticky origin-top p-6 shadow-card will-change-transform sm:p-10 lg:p-12"
                style={{ top: `${88 + index * 24}px`, zIndex: index + 10 }}
              >
                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
                  {/* Left */}
                  <div className="flex flex-col justify-between lg:col-span-6">
                    <div>
                      <div className="mb-6 flex flex-wrap items-center gap-3">
                        <span className="font-mono text-2xl font-bold text-neutral-700 sm:text-3xl">{system.id}</span>
                        <div className="rounded-full border border-white/15 px-3 py-1 font-mono text-[11px] font-semibold tracking-[0.15em] text-white">
                          {system.tag}
                        </div>
                      </div>

                      <h3 className="mb-4 font-display text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
                        {system.title}
                      </h3>
                      <p className="mb-8 text-sm leading-relaxed text-silver sm:text-base">{system.description}</p>
                    </div>

                    <div className="border-t border-white/10 pt-6">
                      <h4 className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-graphite">
                        <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                        Measurable business outcomes
                      </h4>
                      <ul className="grid grid-cols-1 gap-3 text-xs text-neutral-300 sm:grid-cols-2 sm:text-sm">
                        {system.outcomes.map((o) => (
                          <li key={o} className="flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
                            <span>{o}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center gap-4">
                      <button type="button" onClick={onOpenContact} className="btn-primary px-6 py-3 text-xs">
                        Deploy {system.short} System
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                      <span className="font-mono text-xs text-graphite">{system.metrics}</span>
                    </div>
                  </div>

                  {/* Right: modules */}
                  <div className="flex flex-col gap-3 lg:col-span-6">
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black px-4 py-2 font-mono text-[11px] tracking-[0.15em] text-graphite">
                      <span className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 text-white" />
                        SYSTEM_MODULES
                      </span>
                      <span className="text-white">PRODUCTION READY</span>
                    </div>

                    {system.capabilities.map((cap, i) => (
                      <div key={cap.name} className="panel-sub group cursor-default p-4 invert-hover">
                        <div className="mb-1 flex items-center justify-between">
                          <h5 className="flex items-center gap-2 text-sm font-semibold">
                            <span className="h-2 w-2 bg-current" />
                            {cap.name}
                          </h5>
                          <span className="font-mono text-[10px] text-neutral-500 group-hover:text-neutral-700">
                            MOD_0{i + 1}
                          </span>
                        </div>
                        <p className="pl-4 text-xs leading-relaxed text-silver group-hover:text-neutral-700">{cap.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
