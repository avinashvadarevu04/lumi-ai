import { useLayoutEffect } from 'react';
import { gsap } from '../../lib/motion/gsap';
import { MOTION } from '../../lib/motion/prefs';
import { HANDOVER, SCRAMBLE_CHARS } from './handover';

/**
 * Footer choreography.
 *
 * handover  The stacked lockup lands (rise, scale and, on desktop, a depth blur
 *           clearing) across the same scroll window in which the Final CTA's
 *           giant type fades out (handover.js); then its tagline decodes.
 * reveal    Hairlines draw out from their centre, the link columns stagger in
 *           (each heading, then its links) and the legal row settles last.
 *
 * Items animate opacity and transform only, never visibility, so every link is
 * focusable before it has revealed. Starts are clamped so reveals near the end
 * of the page always fire. Reduced motion: nothing runs, the footer is static.
 */
export default function useFooterReveal(footerRef) {
  useLayoutEffect(() => {
    const footer = footerRef.current;
    if (!footer) return undefined;

    const mm = gsap.matchMedia(footer);
    mm.add(MOTION, (context) => {
      const { desktop, reduce } = context.conditions;
      if (reduce) return;

      const q = gsap.utils.selector(footer);
      const [band] = q('[data-footer="band"]');
      const [lockup] = q('[data-footer="lockup"]');
      const [tagline] = q('[data-scramble]');
      const [grid] = q('[data-footer="grid"]');
      const [legal] = q('[data-footer="legal"]');
      const lift = desktop ? 1 : 0.6;

      /* Handover: scrubbed on the exact window the giant type fades over. */
      const landFrom = { opacity: 0, y: 64 * lift, scale: 0.9 };
      const landTo = {
        opacity: 1,
        y: 0,
        scale: 1,
        ease: 'power2.out',
        scrollTrigger: { trigger: footer, start: HANDOVER.footer.start, end: HANDOVER.footer.end, scrub: HANDOVER.scrub },
      };
      if (desktop) {
        landFrom.filter = 'blur(12px)';
        landTo.filter = 'blur(0px)';
      }
      gsap.fromTo(lockup, landFrom, landTo);

      gsap
        .timeline({ scrollTrigger: { trigger: band, start: 'clamp(top 70%)', once: true } })
        .fromTo(tagline, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'none' })
        .to(
          tagline,
          {
            duration: 1.4,
            ease: 'none',
            scrambleText: { text: tagline.textContent, chars: SCRAMBLE_CHARS, revealDelay: 0.35, speed: 0.4 },
          },
          0
        );

      /* Tidy reveal */
      q('[data-footer="rule"]').forEach((rule) => {
        gsap.fromTo(
          rule,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: desktop ? 1.4 : 1,
            ease: 'lumi.inOut',
            scrollTrigger: { trigger: rule, start: 'clamp(top 95%)', once: true },
          }
        );
      });

      const columns = gsap.timeline({ scrollTrigger: { trigger: grid, start: 'clamp(top 85%)', once: true } });
      q('[data-footer="col"]').forEach((column, index) => {
        columns.fromTo(
          column.querySelectorAll('[data-footer="item"]'),
          { opacity: 0, y: 20 * lift },
          { opacity: 1, y: 0, duration: 0.8, ease: 'lumi.out', stagger: 0.05 },
          index * 0.1
        );
      });

      gsap.fromTo(
        gsap.utils.toArray(legal.children),
        { opacity: 0, y: 12 * lift },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'lumi.out',
          stagger: 0.1,
          scrollTrigger: { trigger: legal, start: 'clamp(top 98%)', once: true },
        }
      );
    });

    return () => mm.revert();
  }, [footerRef]);
}
