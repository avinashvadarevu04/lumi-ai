import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { getLenis } from '../../lib/motion/SmoothScroll';

const PRINCIPLES = [
  ['Business Before Technology', 'Start with the financial bottleneck, then formulate the AI system.'],
  ['Outcomes Before Features', 'Lead with measurable margin impact rather than technical specs.'],
  ['Systems Before Tools', 'Deliver connected systems that integrate with existing ERP, CRM, and communication stacks.'],
  ['Partnership Before Projects', 'Act as a long-term technology implementation partner.'],
];

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * "About Lumi AI" dialog. CompanyStorySection renders it through a portal on
 * document.body, so no section stacking context can trap it under the navbar.
 * While open it pauses Lenis (the panel scrolls natively via
 * data-lenis-prevent), keeps Tab focus inside, closes on Escape or a backdrop
 * click, and hands focus back to whatever opened it.
 */
export default function StoryModal({ onClose }) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    const opener = document.activeElement;
    closeRef.current?.focus({ preventScroll: true });

    const onKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      const panel = panelRef.current;
      if (event.key !== 'Tab' || !panel) return;
      const focusable = Array.from(panel.querySelectorAll(FOCUSABLE));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!panel.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const lenis = getLenis();
    const pausedLenis = Boolean(lenis && !lenis.isStopped);
    if (pausedLenis) lenis.stop();

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      if (pausedLenis) lenis.start();
      if (opener instanceof HTMLElement) opener.focus({ preventScroll: true });
    };
  }, [onClose]);

  return (
    <div
      className="animate-fade-in fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="About Lumi AI"
    >
      <div
        ref={panelRef}
        data-lenis-prevent
        className="panel relative max-h-[85vh] w-full max-w-2xl overflow-y-auto overscroll-contain p-6 shadow-card sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-white/10 pb-6">
          <div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-graphite">Lumi AI / Lupus AI Labs</span>
            <h3 className="font-display text-2xl font-bold text-white">Our Background & Positioning</h3>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-neutral-400 transition-colors hover:bg-white hover:text-black"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 py-6 text-sm leading-relaxed text-neutral-300">
          <div>
            <h4 className="mb-2 font-semibold text-white">Category definition</h4>
            <p className="text-silver">
              Lumi AI is strictly an <strong className="text-white">AI Systems Company</strong>. We are not a prompt engineering agency, nor a
              company building experimental demo chatbots. We build deeply integrated operational infrastructure.
            </p>
          </div>
          <div>
            <h4 className="mb-2 font-semibold text-white">Internal positioning principles</h4>
            <ul className="space-y-2 text-xs text-silver">
              {PRINCIPLES.map(([k, v]) => (
                <li key={k} className="flex items-start gap-2">
                  <span className="font-bold text-white">✓</span>
                  <span>
                    <strong className="text-white">{k}:</strong> {v}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-white p-4 text-xs text-neutral-800">
            <span className="font-bold text-black">Global vision: </span>
            To become the trusted AI Systems Company enabling businesses worldwide to operate more intelligently through
            practical, scalable, and production-ready AI systems.
          </div>
        </div>

        <div className="flex justify-end border-t border-white/10 pt-4">
          <button type="button" onClick={onClose} className="btn-primary px-6 py-2 text-xs">
            Close window
          </button>
        </div>
      </div>
    </div>
  );
}
