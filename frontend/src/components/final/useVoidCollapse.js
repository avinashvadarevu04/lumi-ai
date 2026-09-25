import { useLayoutEffect } from 'react';
import { gsap, SplitText } from '../../lib/motion/gsap';
import { MOTION } from '../../lib/motion/prefs';
import { HANDOVER, SCRAMBLE_CHARS } from './handover';

/** Per branch: how far the giant type grows and how much tracking (em) it gains. */
const GIANT = {
  desktop: { scale: 3.4, tracking: 0.24 },
  mobile: { scale: 1.7, tracking: 0.1 },
};

/** How long the desktop stage stays pinned, in viewport heights. */
const PIN_LENGTH = 1.5;

/**
 * "The Void Collapse": choreography for the Final CTA.
 *
 * desktop  The stage pins for PIN_LENGTH viewports. Over the first third the
 *          full-bleed void collapses into a floating monolith: --f scrubs 0 to 1,
 *          which drives the clip-path inset, the 1px edge highlight, the charcoal
 *          face and the corner ticks (final.css), while the copy settles back to
 *          0.96 and the inner grid recedes. Across the whole pin the giant type
 *          rushes toward the viewer (scale 1 to 3.4, tracking widening), then dims.
 * mobile   No pin. The frame closes on a light scrub as the section arrives and
 *          the giant type grows far less.
 * both     The copy rises in once on arrival. As the section leaves, the giant
 *          type fades out over the handover window in which the footer lockup
 *          lands (handover.js).
 * reduce   Nothing runs: final.css renders the framed, static layout.
 */
export default function useVoidCollapse(sectionRef) {
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const mm = gsap.matchMedia(section);
    mm.add(MOTION, (context) => {
      const { desktop, reduce } = context.conditions;
      if (reduce) return undefined;

      const q = gsap.utils.selector(section);
      const [stage] = q('[data-final="stage"]');
      const [frame] = q('[data-final="frame"]');
      const [content] = q('[data-final="content"]');
      const [heading] = q('[data-final="heading"]');
      const [scramble] = q('[data-scramble]');
      const [giant] = q('[data-final="giant"]');
      const [giantLine] = q('[data-final="giant-line"]');
      const glyphs = q('[data-final="giant-char"]');
      const reveals = q('[data-final="reveal"]');
      const tune = desktop ? GIANT.desktop : GIANT.mobile;

      // Tracking without letter-spacing: every glyph slides away from the centre
      // of the word by the same step, which is exactly what letter-spacing does.
      const centre = (glyphs.length - 1) / 2;
      const spread = (index) => (index - centre) * parseFloat(getComputedStyle(giantLine).fontSize) * tune.tracking;

      /* 1. Arrival: the copy rises out of the void once, before the collapse. */
      const arrival = () => ({ trigger: section, start: 'top 65%', once: true });

      const split = SplitText.create(heading, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'final-line',
        autoSplit: true,
        // Returning the tween lets SplitText carry its progress across re-splits.
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 110,
            duration: desktop ? 1.15 : 0.9,
            ease: 'lumi.out',
            stagger: 0.1,
            delay: 0.1,
            scrollTrigger: arrival(),
          }),
      });

      const intro = gsap.timeline({ scrollTrigger: arrival() });
      intro.fromTo(
        reveals,
        { opacity: 0, y: desktop ? 28 : 16 },
        {
          opacity: 1,
          y: 0,
          duration: desktop ? 1 : 0.8,
          ease: 'lumi.out',
          // The eyebrow leads; the rest trails in behind the heading lines.
          stagger: (index) => (index === 0 ? 0 : 0.22 + index * 0.07),
        }
      );
      if (desktop) {
        intro.to(
          scramble,
          {
            duration: 1.2,
            ease: 'none',
            scrambleText: { text: scramble.textContent, chars: SCRAMBLE_CHARS, revealDelay: 0.3, speed: 0.5 },
          },
          0
        );
      }

      /* 2. The collapse. */
      if (desktop) {
        const [grid] = q('[data-final="grid"]');
        const [watermark] = q('[data-final="watermark"]');
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: stage,
              // A stage taller than the screen pins by its bottom edge so the CTA row stays in view.
              start: () => (stage.offsetHeight > window.innerHeight + 1 ? 'bottom bottom' : 'top top'),
              end: () => `+=${Math.round(window.innerHeight * PIN_LENGTH)}`,
              pin: true,
              pinSpacing: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              scrub: 1,
            },
          })
          .fromTo(frame, { '--f': 0 }, { '--f': 1, duration: 0.36, ease: 'lumi.inOut' }, 0)
          .fromTo(content, { scale: 1 }, { scale: 0.96, duration: 0.36, ease: 'lumi.inOut' }, 0)
          .fromTo(grid, { scale: 1.08 }, { scale: 1, duration: 0.5, ease: 'power2.out' }, 0)
          // force3D: false keeps the type on 2D transforms so it re-rasterises crisply at every scale.
          .fromTo(giantLine, { scale: 1 }, { scale: tune.scale, duration: 0.9, ease: 'power2.in', force3D: false }, 0)
          .fromTo(glyphs, { x: 0 }, { x: spread, duration: 0.9, ease: 'power2.in', force3D: false }, 0)
          .fromTo(giantLine, { opacity: 1 }, { opacity: 0.4, duration: 0.3 }, 0.7)
          .fromTo(watermark, { y: 0, rotation: 0 }, { y: 120, rotation: -14, duration: 1 }, 0);
      } else {
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: { trigger: section, start: 'top 85%', end: 'top 20%', scrub: 0.6 },
          })
          .fromTo(frame, { '--f': 0 }, { '--f': 1 }, 0)
          .fromTo(content, { scale: 1 }, { scale: 0.98 }, 0);

        gsap
          .timeline({
            defaults: { ease: 'none', force3D: false },
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom 30%', scrub: 0.6, invalidateOnRefresh: true },
          })
          .fromTo(giantLine, { scale: 1 }, { scale: tune.scale }, 0)
          .fromTo(glyphs, { x: 0 }, { x: spread }, 0);
      }

      /* 3. Handover: created after the pin so it measures the pinned section's full length. */
      gsap.fromTo(
        giant,
        { opacity: 1 },
        {
          opacity: 0,
          ease: 'power1.in',
          scrollTrigger: { trigger: section, start: HANDOVER.cta.start, end: HANDOVER.cta.end, scrub: HANDOVER.scrub },
        }
      );

      return () => split.revert();
    });

    return () => mm.revert();
  }, [sectionRef]);
}
