import React, { useEffect, useState } from 'react';
import { Menu, X, ArrowUpRight, RotateCcw } from 'lucide-react';
import { LupusLockup } from './BrandLogo';

const NAV_LINKS = [
  { label: 'Systems', href: '#what-we-build' },
  { label: 'Pipeline', href: '#how-we-think' },
  { label: 'Metrics', href: '#experience' },
  { label: 'Work', href: '#selected-work' },
  { label: 'Process', href: '#how-we-build' },
  { label: 'Industries', href: '#industries' },
  { label: 'Why Lumi', href: '#why-lumi' },
];

export default function Navbar({ onOpenContact, onReplayIntro }) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      // hide when scrolling down past the hero, reveal on any upward scroll
      setHidden(y > last && y > 160 && !open);
      last = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        hidden ? '-translate-y-full' : 'translate-y-0'
      } ${
        scrolled ? 'border-white/10 bg-black/85 py-3 backdrop-blur-xl' : 'border-transparent bg-black/40 py-4 backdrop-blur-md sm:py-5'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand — 32px lockup */}
        <a href="#" aria-label="Lupus AI Labs — home" className="group flex items-center">
          <LupusLockup size="sm" className="transition-opacity group-hover:opacity-80" />
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 md:flex xl:gap-7">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="whitespace-nowrap text-[13px] font-medium text-neutral-400 transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="hidden items-center gap-3 lg:flex">
          {onReplayIntro && (
            <button
              type="button"
              onClick={onReplayIntro}
              title="Replay 3D intro"
              className="btn-invert gap-1.5 whitespace-nowrap px-3 py-1.5 font-mono text-[11px]"
            >
              <RotateCcw className="h-3 w-3" />
              <span className="hidden xl:inline">Replay intro</span>
            </button>
          )}
          <div className="hidden items-center gap-2 whitespace-nowrap rounded-full border border-white/10 px-2.5 py-1 font-mono text-[11px] text-neutral-500 xl:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            <span>PROD V2.4</span>
          </div>
          <button type="button" onClick={onOpenContact} className="btn-primary group whitespace-nowrap px-4 py-2 text-xs">
            <span>Talk to Lumi</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-xl p-2 text-neutral-300 transition-colors hover:bg-white hover:text-black md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="animate-slide-up border-b border-white/10 bg-black/95 px-6 py-6 backdrop-blur-2xl md:hidden">
          <div className="flex flex-col">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-white/[0.06] py-3 text-sm font-medium text-neutral-300 transition-colors hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </div>
          <div className="mt-5 flex flex-col gap-3">
            {onReplayIntro && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onReplayIntro();
                }}
                className="btn-invert w-full py-2.5 font-mono text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Replay 3D intro
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onOpenContact();
              }}
              className="btn-primary w-full py-3 text-sm"
            >
              Talk to Lumi →
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
