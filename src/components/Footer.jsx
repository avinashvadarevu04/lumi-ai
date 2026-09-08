import React, { useRef } from 'react';
import useReveal from '../hooks/useReveal';
import { ArrowUpRight } from 'lucide-react';
import { LupusLockup } from './BrandLogo';

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

function LinkedInIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.75A1.56 1.56 0 0 0 6.27 8.3c0 .87.7 1.57 1.56 1.57.87 0 1.58-.7 1.58-1.57a1.57 1.57 0 0 0-1.58-1.55Z" />
    </svg>
  );
}

function InstagramIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export default function Footer({ onOpenContact }) {
  const scopeRef = useRef(null);
  useReveal(scopeRef);
  const linkCls = 'transition-colors hover:text-white';

  return (
    <footer ref={scopeRef} className="relative -mt-px overflow-hidden bg-black py-16 text-silver sm:py-20">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div data-stagger className="grid grid-cols-1 gap-10 border-b border-white/10 pb-16 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="flex flex-col justify-between lg:col-span-2">
            <div>
              <LupusLockup size="md" className="mb-6" />
              <p className="mb-6 max-w-sm text-sm leading-relaxed text-silver">
                An AI Systems Company designing and implementing production-ready business solutions to help companies
                operate more intelligently and efficiently.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-graphite">
              <span className="h-2 w-2 rounded-full bg-white" />
              <span>ALL PRODUCTION SYSTEMS OPERATIONAL</span>
            </div>
          </div>

          {/* Systems nav */}
          <div>
            <h4 className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-white">Systems</h4>
            <ul className="space-y-2.5 text-xs">
              {SYSTEMS.map(([label, href]) => (
                <li key={label}>
                  <a href={href} className={linkCls}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-white">Company & Work</h4>
            <ul className="space-y-2.5 text-xs">
              {COMPANY.map(([label, href]) => (
                <li key={label}>
                  <a href={href} className={linkCls}>
                    {label}
                  </a>
                </li>
              ))}
              <li>
                <button type="button" onClick={onOpenContact} className={`${linkCls} cursor-pointer text-left`}>
                  Contact & Consultations
                </button>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-white">Connect</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${linkCls} inline-flex items-center gap-1.5`}
                >
                  <LinkedInIcon className="h-3.5 w-3.5" />
                  <span>LinkedIn</span>
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${linkCls} inline-flex items-center gap-1.5`}
                >
                  <InstagramIcon className="h-3.5 w-3.5" />
                  <span>Instagram</span>
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenContact}
                  className="btn-invert mt-3 px-3.5 py-1.5 font-mono text-[11px]"
                >
                  Direct inquiry desk →
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Full white lockup band */}
        <div data-reveal="scale" className="flex flex-col items-center gap-6 border-b border-white/10 py-14 text-center">
          <LupusLockup size="lg" stacked />
          <p className="max-w-md font-mono text-[11px] uppercase tracking-[0.3em] text-graphite">
            Production-ready AI systems for real business operations
          </p>
        </div>

        {/* Legal */}
        <div className="flex flex-col items-center justify-between gap-4 pt-8 font-mono text-xs text-graphite sm:flex-row">
          <div>© {new Date().getFullYear()} Lupus AI Labs (Lumi AI). All rights reserved.</div>
          <div className="flex items-center gap-6">
            <a href="#" className={linkCls}>
              Privacy Policy
            </a>
            <a href="#" className={linkCls}>
              Terms of Service
            </a>
            <a href="#" className={linkCls}>
              Security Standards
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
