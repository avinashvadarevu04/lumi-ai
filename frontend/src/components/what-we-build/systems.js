import { MessageSquare, Workflow, Boxes } from 'lucide-react';

/** The three capability pillars shown as the What We Build deck. */
export const SYSTEMS = [
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

export default SYSTEMS;
