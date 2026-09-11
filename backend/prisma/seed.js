import crypto from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const CASE_STUDIES = [
  {
    title: 'GetMyHotels',
    slug: 'getmyhotels',
    category: 'Travel / Hospitality Technology',
    headline: 'AI Travel & Booking Platform',
    workflowSummary: 'Search -> Select -> Booking -> Confirmation',
    description:
      'The existing hotel booking engine was incomplete, monolithic, and dependent on a single supplier, leading to high cancellation rates and pricing disparities.',
    solution:
      'Lumi AI engineered a supplier abstraction layer querying three global providers simultaneously (Xeni, TBO Holidays, Sabre GDS), normalising room inventory in real time with an in-chat conversational booking and rescheduling assistant.',
    metrics: 'Normalised 100k+ global listings - In-chat instant rebooking',
    technologies: ['React.js', 'Python FastAPI', 'Sabre GDS', 'TBO API', 'Razorpay', 'Cashfree', 'LLM Agent'],
    highlights: [
      'Multi-supplier hotel inventory consolidation and deduplication',
      'In-chat AI conversational booking and modifications',
      'Automated payment reconciliation across dual gateways',
      'Sub-800ms global price comparison latency',
    ],
    isFeatured: true,
  },
  {
    title: 'Court Data Automation',
    slug: 'court-data-automation',
    category: 'Legal / GovTech / Document Intelligence',
    headline: 'AI Document Intelligence & Extraction Platform',
    workflowSummary: 'Documents -> AI Extraction -> Review -> Structured Data',
    description:
      'Auditing county court records required paralegals to manually open thousands of multi-page scanned PDF legal notices weekly, causing massive verification backlogs.',
    solution:
      'Built a concurrent serverless data pipeline leveraging vision-language models to automatically parse, classify, and extract 12 structured fields for foreclosure cases and 8 fields for probate cases with automated confidence scoring.',
    metrics: '15x pipeline performance improvement - 99.2% precision',
    technologies: ['Vision LLM', 'Python', 'Serverless', 'PostgreSQL', 'OCR Pipeline', 'Admin Audit Logs'],
    highlights: [
      'Concurrent multi-threaded legal document processing',
      'Automated confidence scoring and human override review queue',
      'Direct CSV/JSON export into court auditing databases',
      '15x speedup over legacy manual verification',
    ],
    isFeatured: true,
  },
  {
    title: 'Digital Logistics Management',
    slug: 'digital-logistics-management',
    category: 'Logistics / Supply Chain Execution',
    headline: 'Multi-Party Logistics Operations System',
    workflowSummary: 'Shipment -> Bidding -> Allocation -> Documentation -> Delivery',
    description:
      'Logistics coordination between shippers, LSPs, vehicle brokers, and drivers was fragmented across WhatsApp groups, spreadsheets, and manual paper manifests.',
    solution:
      'Engineered an enterprise mobile and web platform with role-based workflows that coordinates shipment indents, live freight bidding, driver KYC, and automatically generates legal e-way bills, lorry receipts, and PODs.',
    metrics: 'Zero paperwork delay - Multi-party real-time coordination',
    technologies: ['Flutter', 'Supabase', 'PostgreSQL RLS', 'Document Automation', 'Geo-routing'],
    highlights: [
      'Multi-role state machine: shippers, LSPs, brokers and drivers',
      'Automated document engine for e-way bills, invoices and PODs',
      'Row-level security isolating multi-tenant enterprise data',
      'Live tracking and milestone confirmation telemetry',
    ],
  },
  {
    title: 'Morning Muse',
    slug: 'morning-muse',
    category: 'Consumer SaaS / WhatsApp Automation',
    headline: 'WhatsApp AI Subscription Platform',
    workflowSummary: 'Subscriber -> WhatsApp -> Personalisation -> Automated Delivery',
    description:
      'Manual curation and dispatch of personalised daily content to thousands of paid members via messaging apps was unscalable and prone to delivery throttling.',
    solution:
      'Designed an automated subscriber portal integrated with the WhatsApp Business API and Razorpay recurring billing, featuring a dynamic name-based image generation engine and tiered subscription management.',
    metrics: '100% automated scheduled dispatch - Dynamic subscriber personalisation',
    technologies: ['WhatsApp Business API', 'Razorpay Recurring', 'Image Gen Engine', 'Node.js', 'Redis'],
    highlights: [
      'Automated 3-tier subscription billing (Free, Premium, VIP Elite)',
      'Dynamic name-in-graphic generative image rendering',
      'Automated opt-in, delivery timeframes, and STOP handling',
      'High-deliverability WhatsApp queue orchestration',
    ],
  },
  {
    title: 'Maega Services Platform',
    slug: 'maega-services-platform',
    category: 'Home Services / B2B Operations',
    headline: 'Multi-Sided Service & Operations Marketplace',
    workflowSummary: 'Customer -> Provider -> Inspection -> Quote -> Fulfilment',
    description:
      'Service fulfilment suffered from inaccurate upfront estimates, unverified contractor attendance, and disconnected parts inventory.',
    solution:
      'Delivered an end-to-end marketplace featuring 5-10 km hyperlocal technician routing, inspection-based dynamic quotations, machine buyback appraisal workflows, and technician capacity controls.',
    metrics: '35% faster job turnaround - Fully verified provider network',
    technologies: ['Flutter', 'NestJS', 'PostgreSQL', 'WebSockets', 'AWS S3', 'Dynamic Routing'],
    highlights: [
      '5-10 km radius dynamic algorithmic job routing',
      'Inspection-first quotation engine with parts pricing lookup',
      'Technician KYC, physical test and cash-deposit verification',
      'Real-time WebSocket dispatch and escalation handling',
    ],
  },
];

/** Meets the dashboard's own password policy. */
function generatePassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const bytes = crypto.randomBytes(20);
  const body = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
  return `Lx${body}7`;
}

async function seedAdmin() {
  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@lupusailabs.com').trim().toLowerCase();
  const existing = await prisma.adminUser.findUnique({ where: { email } });

  if (existing) {
    console.log(`  admin      : ${email} (already present, left untouched)`);
    return;
  }

  const provided = (process.env.SEED_ADMIN_PASSWORD || '').trim();
  const password = provided || generatePassword();

  await prisma.adminUser.create({
    data: {
      email,
      name: 'Lupus Operations',
      role: 'SUPER_ADMIN',
      passwordHash: await bcrypt.hash(password, 12),
    },
  });

  console.log(`  admin      : ${email}`);
  if (provided) {
    console.log('  password   : (taken from SEED_ADMIN_PASSWORD)');
  } else {
    console.log(`  password   : ${password}`);
    console.log('  ^ shown once only. Store it in a password manager, then change it in Settings.');
  }
}

async function seedProjects() {
  let created = 0;
  for (const [index, item] of CASE_STUDIES.entries()) {
    const exists = await prisma.project.findUnique({ where: { slug: item.slug } });
    if (exists) continue;

    await prisma.project.create({
      data: {
        ...item,
        technologies: JSON.stringify(item.technologies),
        highlights: JSON.stringify(item.highlights),
        order: index,
        isFeatured: item.isFeatured ?? false,
        isPublished: true,
      },
    });
    created += 1;
  }
  console.log(`  projects   : ${created} created, ${CASE_STUDIES.length - created} already present`);
}

async function main() {
  console.log('\nSeeding Lupus AI Labs database');
  console.log('--------------------------------');
  await seedAdmin();
  await seedProjects();
  console.log('--------------------------------\n');
}

main()
  .catch((error) => {
    console.error('[seed] failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
