import React, { useMemo, useRef, useState } from 'react';
import { HeartPulse, Briefcase, ShoppingBag, Truck, Plane, GraduationCap, ArrowRight } from 'lucide-react';
import { CircularCarousel } from '@/components/ui/circular-carousel';
import useReveal from '../hooks/useReveal';

const INDUSTRIES = [
  {
    name: 'Healthcare',
    tagline: 'Multi-location specialty clinics & diagnostic chains',
    icon: HeartPulse,
    systems: [
      { name: 'Customer Interaction', desc: 'AI appointment booking, WhatsApp treatment follow-ups, and 24/7 receptionist.' },
      { name: 'Operations', desc: 'Automated test identification, doctor schedule routing, and report delivery workflows.' },
      { name: 'Multi-location Systems', desc: 'Centralized HQ control over patient inquiries and booking across 5–40+ clinic branches.' },
    ],
    problem: 'High front-desk phone overload and lost appointment slots across multiple locations.',
    outcome: '50% reduction in no-shows • Instant multi-branch booking',
  },
  {
    name: 'Professional Services',
    tagline: 'Legal, accounting, tax & advisory practices',
    icon: Briefcase,
    systems: [
      { name: 'Knowledge Systems', desc: 'Semantic internal search over case files, precedent libraries, and SOPs.' },
      { name: 'Documents', desc: 'AI extraction of financial statements, invoices, tax files, and contract clauses.' },
      { name: 'Client Communication', desc: 'Automated client intake, document request checklists, and status updates.' },
    ],
    problem: 'Expensive billable hours wasted chasing client documents and manual data transcription.',
    outcome: 'Frees 15+ hours/week per consultant • Faster audit readiness',
  },
  {
    name: 'Commerce',
    tagline: 'D2C brands & digital-first retail networks',
    icon: ShoppingBag,
    systems: [
      { name: 'Customer Interaction', desc: 'Autonomous WhatsApp sales assistants, size/catalog recommendations, and cart recovery.' },
      { name: 'Support Automation', desc: 'Automated return, exchange, and delivery status tracking integrated with Shopify.' },
      { name: 'Order Workflows', desc: 'Omnichannel routing, inventory reservation triggers, and payment notifications.' },
    ],
    problem: 'Support tickets spike during marketing campaigns, causing slow replies and lost cart revenue.',
    outcome: 'Sub-minute inquiry resolution • 25%+ cart recovery lift',
  },
  {
    name: 'Logistics',
    tagline: 'Freight forwarders, 3PLs & transport operations',
    icon: Truck,
    systems: [
      { name: 'Documents', desc: 'Intelligent extraction of Bills of Lading, Lorry Receipts, E-Way bills, and packing lists.' },
      { name: 'Operations', desc: 'Exception detection, customs paperwork validation, and automated discrepancy flags.' },
      { name: 'Coordination', desc: 'Multi-party handoffs between Shippers, LSPs, brokers, and drivers.' },
    ],
    problem: 'Critical shipment data trapped in messy PDF bills, creating warehouse bottlenecks.',
    outcome: 'Zero manual data-entry delays • Full audit trail verification',
  },
  {
    name: 'Travel',
    tagline: 'Online travel agencies & hospitality operators',
    icon: Plane,
    systems: [
      { name: 'Booking Systems', desc: 'Multi-supplier GDS consolidation, price deduplication, and room availability feeds.' },
      { name: 'Customer Interaction', desc: 'Conversational booking, modifications, and cancellation assistance directly inside chat.' },
      { name: 'Operations', desc: 'Automated voucher issuance, payment reconciliation, and flight/hotel alerts.' },
    ],
    problem: 'Rigid booking forms fail to handle nuanced guest questions and complex supplier APIs.',
    outcome: 'Unified multi-GDS inventory • Sub-second pricing comparison',
  },
  {
    name: 'Education',
    tagline: 'Coaching chains, test-prep & study abroad consultancies',
    icon: GraduationCap,
    systems: [
      { name: 'Admissions Systems', desc: 'Automated student qualification, counselling demo bookings, and lead attribution.' },
      { name: 'Knowledge', desc: 'Course syllabus Q&A, fee structures, batch timetables, and visa regulation queries.' },
      { name: 'Learning Systems', desc: 'Automated quiz evaluations, lecture summary distribution, and attendance reminders.' },
    ],
    problem: 'Counsellors spend 70% of time answering basic repetitive FAQs instead of closing admissions.',
    outcome: '3× increase in demo appointments • Centralized HQ visibility',
  },
];

export default function IndustriesSection({ onOpenContact }) {
  const scopeRef = useRef(null);
  const [active, setActive] = useState(0);
  useReveal(scopeRef);

  const carouselItems = useMemo(
    () => INDUSTRIES.map((ind, i) => ({ id: ind.name, title: ind.name, description: ind.tagline, tag: `0${i + 1} · Sector` })),
    []
  );
  const current = INDUSTRIES[active] || INDUSTRIES[0];
  const Icon = current.icon;

  return (
    <section ref={scopeRef} id="industries" className="relative -mt-px bg-black py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 max-w-3xl sm:mb-20">
          <div data-reveal className="eyebrow mb-5">Domain expertise • Industry solutions</div>
          <h2 data-split className="mb-4 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            AI systems for <br />
            <span className="text-neutral-500">different businesses.</span>
          </h2>
          <p data-reveal className="text-base text-silver sm:text-lg">
            We adapt repeatable system architectures to the operational reality of your industry.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
          {/* Orbital selector — drives the detail panel */}
          <div data-reveal="left" className="flex flex-col gap-6 self-start lg:sticky lg:top-28 lg:col-span-6">
            <div className="panel relative flex w-full items-center justify-center overflow-hidden px-2 py-7 shadow-card sm:px-4 sm:py-9">
              <CircularCarousel
                items={carouselItems}
                activeIndex={active}
                onActiveChange={setActive}
                autoPlay
                autoPlayInterval={4500}
                className="w-full"
              />
            </div>
            <div className="flex flex-wrap justify-center gap-2" role="tablist" aria-label="Industries">
              {INDUSTRIES.map((ind, i) => {
                const IndIcon = ind.icon;
                const isSel = i === active;
                return (
                  <button
                    key={ind.name}
                    type="button"
                    role="tab"
                    aria-selected={isSel}
                    onClick={() => setActive(i)}
                    onMouseEnter={() => setActive(i)}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors ${
                      isSel ? 'border-white bg-white text-black' : 'border-white/10 text-neutral-400 hover:border-white/40 hover:text-white'
                    }`}
                  >
                    <IndIcon className="h-3.5 w-3.5" />
                    {ind.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail panel */}
          <div data-reveal="right" data-delay="0.15" className="panel relative overflow-hidden p-6 shadow-card sm:p-10 lg:col-span-6">
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-white">{current.name} Systems Architecture</h3>
                  <p className="font-mono text-[11px] tracking-[0.15em] text-graphite">TAILORED OPERATIONAL BLUEPRINT</p>
                </div>
              </div>
            </div>

            <div className="mb-8 space-y-3">
              <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-graphite">Core AI capability layers</div>
              {current.systems.map((sys) => (
                <div key={sys.name} className="panel-sub group p-4 invert-hover">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-current" />
                    <h4 className="text-sm font-semibold">{sys.name}</h4>
                  </div>
                  <p className="pl-4 text-xs leading-relaxed text-silver group-hover:text-neutral-700">{sys.desc}</p>
                </div>
              ))}
            </div>

            <div className="mb-8 space-y-3 rounded-2xl border border-white/10 bg-black p-5">
              <div>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-graphite">Operational bottleneck solved</span>
                <p className="mt-0.5 text-xs text-silver">{current.problem}</p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white">Measured impact</span>
                <span className="text-xs font-semibold text-white">{current.outcome}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
              <span className="font-mono text-xs text-graphite">Ready for production deployment</span>
              <button type="button" onClick={onOpenContact} className="btn-primary px-5 py-2.5 text-xs">
                Schedule {current.name} consultation
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
