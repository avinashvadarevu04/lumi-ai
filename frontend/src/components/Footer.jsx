import React, { useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { LupusLockup } from './BrandLogo';
import { useMagneticScope } from '../lib/motion/useMagnetic';
import ScrambleLabel from './final/ScrambleLabel';
import { FooterColumn, FooterItem, Hairline } from './final/FooterParts';
import { InstagramIcon, LinkedInIcon } from './final/SocialIcons';
import useFooterReveal from './final/useFooterReveal';
import './final/final.css';

const SYSTEMS = [
  ['Customer Interaction Systems', '#what-we-build'],
  ['Business Operations Systems', '#what-we-build'],
  ['AI Products & Platforms', '#what-we-build'],
  ['Methodology Pipeline', '#how-we-think'],
  ['Industry Matrix', '#industries'],
];

const COMPANY = [
  ['Selected Work & Case Studies', '#selected-work'],
  ['Metrics & Track Record', '#experience'],
  ['Core Engineering Pillars', '#why-lumi'],
  ['About Lumi AI', '#company'],
];

const SOCIAL = [
  { label: 'LinkedIn', href: 'https://linkedin.com', Icon: LinkedInIcon },
  { label: 'Instagram', href: 'https://instagram.com', Icon: InstagramIcon },
];

const LEGAL = ['Privacy Policy', 'Terms of Service', 'Security Standards'];

/**
 * Footer. The stacked lockup opens it so it can take the handover from the
 * Final CTA's giant type (see final/useFooterReveal); the link grid and the
 * legal row follow.
 */
export default function Footer({ onOpenContact }) {
  const footerRef = useRef(null);
  useFooterReveal(footerRef);
  useMagneticScope(footerRef, { strength: 0.3 });

  return (
    <footer ref={footerRef} className="relative -mt-px overflow-hidden bg-black pb-10 pt-14 text-silver sm:pb-12 sm:pt-16">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Sign-off lockup: lands as the Final CTA's giant type fades */}
        <div data-footer="band" className="flex flex-col items-center gap-6 pb-14 text-center">
          <div data-footer="lockup" className="gpu">
            <LupusLockup size="lg" stacked />
          </div>
          <p className="max-w-md font-mono text-[11px] uppercase tracking-[0.3em] text-graphite">
            <ScrambleLabel text="Production-ready AI systems for real business operations" />
          </p>
        </div>

        <Hairline />

        <div data-footer="grid" className="grid grid-cols-1 gap-10 py-16 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div data-footer="col" className="flex flex-col justify-between gap-6 lg:col-span-2">
            <div>
              <div data-footer="item" className="mb-6">
                <LupusLockup size="md" />
              </div>
              <p data-footer="item" className="max-w-sm text-sm leading-relaxed text-silver">
                An AI Systems Company designing and implementing production-ready business solutions to help companies
                operate more intelligently and efficiently.
              </p>
            </div>
            <div data-footer="item" className="flex items-center gap-2 font-mono text-xs text-graphite">
              <span aria-hidden="true" className="footer-status-dot h-2 w-2 rounded-full bg-white" />
              <span>ALL PRODUCTION SYSTEMS OPERATIONAL</span>
            </div>
          </div>

          <FooterColumn title="Systems">
            {SYSTEMS.map(([label, href]) => (
              <FooterItem key={label}>
                <a href={href} className="footer-link">
                  {label}
                </a>
              </FooterItem>
            ))}
          </FooterColumn>

          <FooterColumn title="Company & Work">
            {COMPANY.map(([label, href]) => (
              <FooterItem key={label}>
                <a href={href} className="footer-link">
                  {label}
                </a>
              </FooterItem>
            ))}
            <FooterItem>
              <button type="button" onClick={onOpenContact} className="footer-link cursor-pointer text-left">
                Contact & Consultations
              </button>
            </FooterItem>
          </FooterColumn>

          <FooterColumn title="Connect">
            {SOCIAL.map(({ label, href, Icon }) => (
              <FooterItem key={label}>
                <a href={href} target="_blank" rel="noopener noreferrer" className="footer-link inline-flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5" />
                  <span>{label}</span>
                  <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                </a>
              </FooterItem>
            ))}
            <FooterItem>
              <button
                type="button"
                data-magnetic
                onClick={onOpenContact}
                className="btn-invert mt-3 px-3.5 py-1.5 font-mono text-[11px]"
              >
                Direct inquiry desk →
              </button>
            </FooterItem>
          </FooterColumn>
        </div>

        <Hairline />

        {/* Legal */}
        <div data-footer="legal" className="flex flex-col items-center justify-between gap-4 pt-8 font-mono text-xs text-graphite sm:flex-row">
          <div>© {new Date().getFullYear()} Lupus AI Labs (Lumi AI). All rights reserved.</div>
          <div className="flex items-center gap-6">
            {LEGAL.map((label) => (
              <a key={label} href="#" className="footer-link">
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
