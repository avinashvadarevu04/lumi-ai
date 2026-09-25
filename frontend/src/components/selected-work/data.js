/**
 * Baked-in copy of the case studies. These render instantly on first paint and
 * remain the fallback if the API is unreachable, so the section is never empty.
 * When the API answers, its content wins — that is what makes the dashboard's
 * edits appear live without a deploy.
 */
export const FALLBACK_PROJECTS = [
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

/** Maps an API record onto the shape this section renders. */
export function fromApi(project, index) {
  return {
    id: String(index + 1).padStart(2, '0'),
    key: project.id,
    name: project.title,
    category: project.category,
    headline: project.headline || '',
    workflow: project.workflowSummary || '',
    problem: project.description || '',
    solution: project.solution || '',
    impact: project.metrics || '',
    tech: project.technologies || [],
    highlights: project.highlights || [],
  };
}
