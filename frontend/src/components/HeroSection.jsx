import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import AIRobotCanvas from './AIRobotCanvas';

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection({ onOpenContact, introDone = true }) {
  const scopeRef = useRef(null);

  useEffect(() => {
    if (!introDone || !scopeRef.current) return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-hero]',
        { autoAlpha: 0, y: reduce ? 0 : 26 },
        { autoAlpha: 1, y: 0, duration: reduce ? 0.01 : 1, ease: 'power3.out', stagger: 0.1, delay: 0.1 }
      );
      gsap.fromTo(
        '[data-hero-visual]',
        { autoAlpha: 0, x: reduce ? 0 : 40 },
        { autoAlpha: 1, x: 0, duration: reduce ? 0.01 : 1.4, ease: 'power3.out', delay: 0.15 }
      );
      gsap.fromTo(
        '[data-scribble] path',
        { strokeDashoffset: 1200 },
        { strokeDashoffset: 0, duration: reduce ? 0.01 : 1.1, ease: 'power2.inOut', delay: 0.9 }
      );
      if (!reduce) {
        // Scroll-out parallax: copy lifts and fades, the robot sinks and recedes
        const st = { trigger: scopeRef.current, start: 'top top', end: 'bottom top', scrub: 0.6 };
        gsap.to('[data-hero-copy]', { y: -120, autoAlpha: 0, ease: 'none', scrollTrigger: st });
        gsap.to('[data-hero-visual]', { y: 90, scale: 0.92, ease: 'none', scrollTrigger: { ...st, start: 'top top' } });
        gsap.to('[data-hero-rail]', { autoAlpha: 0, ease: 'none', scrollTrigger: { ...st, end: '40% top' } });
      }
    }, scopeRef);
    return () => ctx.revert();
  }, [introDone]);

  return (
    <section ref={scopeRef} className="relative flex min-h-screen flex-col overflow-hidden bg-black lg:block">
      {/* Backdrop: hairline grid + radial lift behind the robot */}
      <div className="architect-grid pointer-events-none absolute inset-0 opacity-50" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-full bg-[radial-gradient(ellipse_at_70%_45%,rgba(255,255,255,0.10),transparent_55%)] lg:w-[65%]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#000000_0%,#000000_28%,transparent_60%)]" />

      {/* Robot — bleeds off the right edge on desktop, stacks below copy on mobile */}
      <div
        data-hero-visual
        className="invisible relative order-2 mx-auto h-[62vh] min-h-[440px] w-full lg:absolute lg:inset-y-0 lg:right-0 lg:order-none lg:h-full lg:w-[56%]"
      >
        <AIRobotCanvas active={introDone} />
      </div>

      {/* Copy */}
      <div className="relative z-10 order-1 mx-auto flex w-full max-w-7xl flex-col justify-center px-4 pb-6 pt-28 sm:px-6 lg:min-h-screen lg:px-8 lg:pb-0">
        <div data-hero-copy className="max-w-2xl lg:max-w-[52%]">
          <h1 className="font-display uppercase leading-[0.92] tracking-tight text-white">
            <span data-hero className="invisible relative mb-3 block text-[clamp(1.5rem,3.1vw,2.75rem)] font-medium lg:whitespace-nowrap">
              <span className="relative inline-block">
                We build{' '}
                <span className="relative inline-block px-1">
                  AI systems
                  {/* hand-drawn circle */}
                  <svg
                    data-scribble
                    viewBox="0 0 300 110"
                    preserveAspectRatio="none"
                    className="pointer-events-none absolute -left-4 -top-2 h-[calc(100%+1rem)] w-[calc(100%+2rem)]"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M150 12 C60 8 14 40 20 62 C26 90 100 104 170 100 C240 96 290 74 286 50 C282 26 232 6 150 12 C120 14 96 20 88 24"
                      stroke="#FFFFFF"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeDasharray="1200"
                      strokeDashoffset="1200"
                      opacity="0.9"
                    />
                  </svg>
                </span>
              </span>
              {' '}that make
            </span>
            <span data-hero className="invisible block text-[clamp(2.5rem,6.4vw,5.9rem)] font-bold">
              Businesses <span className="text-neutral-400">run smarter.</span>
            </span>
          </h1>

          <p data-hero className="invisible mt-8 max-w-xl text-base leading-relaxed text-silver sm:text-lg">
            Lumi AI designs and implements production-ready AI systems that help businesses automate customer
            interactions, streamline operations, and build intelligent products.
          </p>

          <div data-hero className="invisible mt-9 flex flex-wrap items-center gap-4">
            <button type="button" onClick={onOpenContact} className="btn-primary group px-8 py-4 text-sm">
              <span>Build with Lumi</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <a href="#selected-work" className="btn-outline group px-7 py-4 text-sm">
              <span>Explore our work</span>
              <span className="text-neutral-400 transition-transform group-hover:translate-x-1">→</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom rail: pagination + caption (reference layout) */}
      <div data-hero data-hero-rail className="invisible absolute bottom-6 left-4 z-10 flex items-center gap-3 font-mono text-xs text-neutral-400 sm:left-6 lg:left-8">
        <span className="text-white">1</span>
        <span className="h-px w-10 bg-white/40" />
        <span>3</span>
      </div>
      <div data-hero data-hero-rail className="invisible absolute bottom-6 right-4 z-10 hidden text-right font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 sm:right-6 lg:right-8 lg:block">
        <div>Unit — Lupus_Agent_V3</div>
        <div className="text-neutral-600">Chrome face · dot-matrix optics</div>
      </div>
    </section>
  );
}
