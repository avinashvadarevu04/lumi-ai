import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, CheckCircle2, X, Workflow, Code } from 'lucide-react';
import useReveal from '../hooks/useReveal';

const PROJECTS = [
  {
    id: '01',
    name: 'GETMYHOTELS',
    category: 'Travel / Hospitality Technology',
    headline: 'AI Travel & Booking Platform',
    workflow: 'Search → Select → Booking → Confirmation',
    problem:
      'The existing hotel booking engine was incomplete, monolithic, and dependent on a single supplier, leading to high cancellation rates and pricing disparities.',
    solution:
      'Lumi AI engineered a supplier abstraction layer querying three global providers simultaneously (Xeni, TBO Holidays, Sabre GDS), normalizing room inventory in real-time with an in-chat conversational booking and rescheduling assistant.',
    impact: 'Normalized 100k+ global listings • In-chat instant rebooking',
    tech: ['React.js', 'Python FastAPI', 'Sabre GDS', 'TBO API', 'Razorpay', 'Cashfree', 'LLM Agent'],
    highlights: [
      'Multi-supplier hotel inventory consolidation & deduplication',
      'In-chat AI conversational booking & modifications',
      'Automated payment reconciliation across dual gateways',
      'Sub-800ms global price comparison latency',
    ],
  },
  {
    id: '02',
    name: 'COURT DATA AUTOMATION',
    category: 'Legal / GovTech / Document Intelligence',
    headline: 'AI Document Intelligence & Extraction Platform',
    workflow: 'Documents → AI Extraction → Review → Structured Data',
    problem:
      'Auditing county court records required paralegals to manually open thousands of multi-page scanned PDF legal notices weekly, causing massive verification backlogs.',
    solution:
      'Built a concurrent serverless data pipeline leveraging vision-language models to automatically parse, classify, and extract 12 structured fields for foreclosure cases and 8 fields for probate cases with automated confidence scoring.',
    impact: '15× Pipeline Performance Improvement • 99.2% Precision',
    tech: ['Vision LLM', 'Python', 'Serverless', 'PostgreSQL', 'OCR Pipeline', 'Admin Audit Logs'],
    highlights: [
      'Concurrent multi-threaded legal document processing',
      'Automated confidence scoring & human override review queue',
      'Direct CSV/JSON export into court auditing databases',
      '15× speedup over legacy manual verification',
    ],
  },
  {
    id: '03',
    name: 'DIGITAL LOGISTICS MANAGEMENT',
    category: 'Logistics / Supply Chain Execution',
    headline: 'Multi-Party Logistics Operations System',
    workflow: 'Shipment → Bidding → Allocation → Documentation → Delivery',
    problem:
      'Logistics coordination between Shippers, LSPs, Vehicle Brokers, and Drivers was fragmented across WhatsApp groups, spreadsheets, and manual paper manifests.',
    solution:
      'Engineered an enterprise mobile and web platform with role-based workflows that coordinates shipment indents, live freight bidding, driver KYC, and automatically generates legal e-way bills, lorry receipts, and PODs.',
    impact: 'Zero paperwork delay • Multi-party real-time coordination',
    tech: ['Flutter', 'Supabase', 'PostgreSQL RLS', 'Document Automation', 'Geo-routing'],
    highlights: [
      'Multi-role state machine: Shippers, LSPs, Brokers & Drivers',
      'Automated document engine for E-way bills, Invoices & PODs',
      'Row-Level Security isolating multi-tenant enterprise data',
      'Live tracking and milestone confirmation telemetry',
    ],
  },
  {
    id: '04',
    name: 'MORNING MUSE',
    category: 'Consumer SaaS / WhatsApp Automation',
    headline: 'WhatsApp AI Subscription Platform',
    workflow: 'Subscriber → WhatsApp → Personalization → Automated Delivery',
    problem:
      'Manual curation and dispatch of personalized daily content to thousands of paid members via messaging apps was unscalable and prone to delivery throttling.',
    solution:
      'Designed an automated subscriber portal integrated with WhatsApp Business API and Razorpay recurring billing, featuring a dynamic name-based image generation engine and tiered subscription management.',
    impact: '100% automated scheduled dispatch • Dynamic subscriber personalization',
    tech: ['WhatsApp Business API', 'Razorpay Recurring', 'Image Gen Engine', 'Node.js', 'Redis'],
    highlights: [
      'Automated 3-tier subscription billing (Free, Premium, VIP Elite)',
      'Dynamic name-in-graphic generative image rendering',
      'Automated opt-in, delivery timeframes, and STOP handling',
      'High-deliverability WhatsApp queue orchestration',
    ],
  },
  {
    id: '05',
    name: 'MAEGA SERVICES PLATFORM',
    category: 'Home Services / B2B Operations',
    headline: 'Multi-Sided Service & Operations Marketplace',
    workflow: 'Customer → Provider → Inspection → Quote → Fulfilment',
    problem:
      'Service fulfillment suffered from inaccurate upfront estimates, unverified contractor attendance, and disconnected parts inventory.',
    solution:
      'Delivered an end-to-end marketplace featuring 5–10 km hyperlocal technician routing, inspection-based dynamic quotations, machine buyback appraisal workflows, and technician capacity controls.',
    impact: '35% faster job turnaround • Fully verified provider network',
    tech: ['Flutter', 'NestJS', 'PostgreSQL', 'WebSockets', 'AWS S3', 'Dynamic Routing'],
    highlights: [
      '5–10 km radius dynamic algorithmic job routing',
      'Inspection-first quotation engine with parts pricing lookup',
      'Technician KYC, physical test & cash-deposit verification',
      'Real-time WebSocket dispatch & escalation handling',
    ],
  },
];

function CaseStudyModal({ project, onClose }) {
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

  return (
    <div
      className="animate-fade-in fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${project.name} case study`}
    >
      <div
        className="panel relative max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6 shadow-card sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-white/10 pb-6">
          <div>
            <div className="mb-1 flex items-center gap-2 font-mono text-[11px]">
              <span className="font-semibold text-white">PROJECT {project.id}</span>
              <span className="text-neutral-700">•</span>
              <span className="text-graphite">{project.category}</span>
            </div>
            <h3 className="font-display text-2xl font-bold text-white">{project.name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-neutral-400 transition-colors hover:bg-white hover:text-black"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 py-6">
          <div>
            <h4 className="mb-2 flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-graphite">
              <Workflow className="h-3.5 w-3.5 text-white" />
              Operational workflow
            </h4>
            <div className="rounded-xl border border-white/10 bg-black p-3 font-mono text-xs text-white">{project.workflow}</div>
          </div>

          <div>
            <h4 className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-graphite">Architectural highlights</h4>
            <ul className="space-y-2">
              {project.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2.5 text-xs text-neutral-300 sm:text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-2 flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-graphite">
              <Code className="h-3.5 w-3.5 text-white" />
              Full system stack
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <span key={t} className="rounded-lg border border-white/10 bg-black px-3 py-1 font-mono text-xs text-neutral-300">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-white p-4 text-black">
            <div>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Measured outcome</div>
              <div className="text-xs font-semibold sm:text-sm">{project.impact}</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-white/10 pt-4">
          <button type="button" onClick={onClose} className="btn-primary px-6 py-2.5 text-xs">
            Close inspector
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SelectedWorkSection() {
  const scopeRef = useRef(null);
  const [selected, setSelected] = useState(null);
  useReveal(scopeRef);

  return (
    <section ref={scopeRef} id="selected-work" className="relative -mt-px bg-black py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 flex flex-col justify-between gap-6 sm:mb-20 md:flex-row md:items-end">
          <div>
            <div data-reveal className="eyebrow mb-5">Production systems • Case studies</div>
            <h2 data-split className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Selected Work. <span className="text-neutral-500">A few things we've built.</span>
            </h2>
          </div>
          <p data-reveal className="max-w-md font-mono text-xs leading-relaxed text-graphite">
            Click any case study to inspect the end-to-end system architecture, technical stack, and business outcome.
          </p>
        </div>

        <div className="space-y-6">
          {PROJECTS.map((p, i) => (
            <button
              key={p.id}
              type="button"
              data-reveal={i % 2 ? 'right' : 'left'}
              onClick={() => setSelected(p)}
              className="panel group relative w-full cursor-pointer overflow-hidden p-6 text-left transition-all duration-300 hover:border-white/40 sm:p-10"
            >
              <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <span className="font-mono text-xs font-bold text-graphite">PROJECT // {p.id}</span>
                    <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-neutral-300">{p.category}</span>
                  </div>
                  <h3 className="mb-2 font-display text-2xl font-bold text-white sm:text-3xl">{p.name}</h3>
                  <p className="mb-4 text-sm font-medium text-silver">{p.headline}</p>
                  <div className="inline-block rounded-xl border border-white/10 bg-black p-2.5 font-mono text-[11px]">
                    <span className="text-graphite">WORKFLOW: </span>
                    <span className="text-white">{p.workflow}</span>
                  </div>
                </div>

                <div className="space-y-3 lg:col-span-5">
                  <div>
                    <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-graphite">Business challenge</span>
                    <p className="text-xs leading-relaxed text-silver">{p.problem}</p>
                  </div>
                  <div>
                    <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white">Lumi AI system solution</span>
                    <p className="text-xs leading-relaxed text-silver">{p.solution}</p>
                  </div>
                </div>

                <div className="flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-4 lg:col-span-3 lg:items-end lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                  <div className="w-full">
                    <span className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-graphite">Core stack</span>
                    <div className="flex flex-wrap gap-1.5">
                      {p.tech.slice(0, 4).map((t) => (
                        <span key={t} className="rounded border border-white/10 bg-black px-2 py-0.5 font-mono text-[10px] text-neutral-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white transition-all group-hover:bg-white group-hover:text-black">
                    <span>Inspect architecture</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selected && <CaseStudyModal project={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
