import { Target, ShieldCheck, Coins, TrendingUp } from 'lucide-react';

/** The four engineering pillars, in reading (and landing) order. */
export const PILLARS = [
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

export default PILLARS;
