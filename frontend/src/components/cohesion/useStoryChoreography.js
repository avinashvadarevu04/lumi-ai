import { useLayoutEffect } from 'react';
import { gsap, SplitText } from '../../lib/motion/gsap';
import { MOTION } from '../../lib/motion/prefs';
import { SPRING_LAND, SPRING_LAND_DURATION } from './springEase';
import { revealLines } from './revealLines';

/**
 * Gives each split word a dim outline copy (behind) and a solid ink copy (in
 * front) and returns the ink layers, the only thing the read-along animates.
 * SplitText's revert() restores the original markup, removing both layers.
 */
function layerWords(words) {
  return words.map((word) => {
    const text = word.textContent;
    const ghost = document.createElement('span');
    ghost.className = 'text-outline cs-ghost';
    ghost.textContent = text;
    const ink = document.createElement('span');
    ink.className = 'cs-ink';
    ink.textContent = text;
    word.replaceChildren(ghost, ink);
    return ink;
  });
}

const once = (trigger, start = 'top 88%') => ({ trigger, start, once: true });

/**
 * Company Story choreography.
 *
 * desktop  heading lines rise from masks, the lead wipes open, copy and the
 *          magnetic CTA pills land (the pills on a sampled spring). The
 *          philosophy panel unclips, then its quote is a read-along: each word
 *          scrubs from a dim outline to solid white as it crosses the
 *          viewport, with a hairline tracking reading progress. The grid and
 *          the watermark mark drift at different depths (light parallax).
 * mobile   simple fade-up reveals; the quote fills word by word once, on a
 *          timer, when it enters. No parallax.
 * reduce   nothing is created: solid text, static layout.
 */
export default function useStoryChoreography(scopeRef) {
  useLayoutEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return undefined;

    const pick = (name) => scope.querySelector(`[data-cs="${name}"]`);
    const eyebrow = pick('eyebrow');
    const heading = pick('heading');
    const lead = pick('lead');
    const copy = Array.from(scope.querySelectorAll('[data-cs="copy"]'));
    const cta = pick('cta');
    const panel = pick('panel');
    const quote = pick('quote');
    const progress = pick('progress');
    const mark = pick('mark');
    const grid = pick('grid');
    const caption = pick('caption');
    const required = [eyebrow, heading, lead, cta, panel, quote, progress, mark, grid, caption];
    if (!required.every(Boolean) || !copy.length) return undefined;

    const mm = gsap.matchMedia(scope);
    mm.add(MOTION, (ctx) => {
      const { desktop, mobile } = ctx.conditions;
      if (!desktop && !mobile) return undefined;

      const rise = (targets, trigger, { y = 24, stagger = 0, start } = {}) =>
        gsap.fromTo(
          targets,
          { autoAlpha: 0, y },
          { autoAlpha: 1, y: 0, duration: 0.9, ease: 'lumi.out', stagger, scrollTrigger: once(trigger, start) }
        );

      /* ---- Narrative column ---- */
      rise(eyebrow, eyebrow, { y: 16 });
      if (desktop) {
        revealLines(heading, { start: 'top 86%' });
        gsap.fromTo(
          lead,
          { clipPath: 'inset(0% 0% 100% 0%)', y: 18 },
          { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.1, ease: 'lumi.out', scrollTrigger: once(lead, 'top 86%') }
        );
      } else {
        rise(heading, heading, { y: 28 });
        rise(lead, lead);
      }
      rise(copy, copy[0], { stagger: 0.12 });

      if (desktop) {
        gsap
          .timeline({ scrollTrigger: once(cta, 'top 94%') })
          .fromTo(cta, { y: 34 }, { y: 0, duration: SPRING_LAND_DURATION, ease: SPRING_LAND }, 0)
          .fromTo(cta, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: 'power2.out' }, 0);
      } else {
        rise(cta, cta, { start: 'top 94%' });
      }

      /* ---- Philosophy panel ---- */
      if (desktop) {
        gsap.fromTo(
          panel,
          { clipPath: 'inset(7% 4% 7% 4% round 48px)' },
          {
            clipPath: 'inset(0% 0% 0% 0% round 24px)',
            duration: 1.4,
            ease: 'lumi.out',
            clearProps: 'clipPath',
            scrollTrigger: once(panel, 'top 86%'),
          }
        );
      } else {
        rise(panel, panel, { y: 40 });
      }

      /* ---- Read-along statement ---- */
      // Words only (no line split), so the quote reflows naturally on resize.
      const split = SplitText.create(quote, { type: 'words' });
      const inks = layerWords(split.words);
      if (desktop) {
        // Overlapping per-word fades give a soft reading front a few words wide.
        const each = 0.45;
        const span = 1 + each * (inks.length - 1);
        gsap
          .timeline({ scrollTrigger: { trigger: quote, start: 'top 80%', end: 'bottom 45%', scrub: 0.6 } })
          .fromTo(inks, { opacity: 0 }, { opacity: 1, ease: 'none', duration: 1, stagger: each }, 0)
          .fromTo(progress, { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: span }, 0);
      } else {
        const each = 0.05;
        const span = 0.6 + each * (inks.length - 1);
        gsap
          .timeline({ scrollTrigger: once(quote, 'top 78%') })
          .fromTo(inks, { opacity: 0 }, { opacity: 1, ease: 'power1.out', duration: 0.6, stagger: each }, 0)
          .fromTo(progress, { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: span }, 0);
      }

      /* ---- Depth: light parallax on the supporting visuals ---- */
      if (desktop) {
        const drift = () => ({ trigger: panel, start: 'top bottom', end: 'bottom top', scrub: 0.8 });
        gsap.fromTo(mark, { yPercent: -14, rotation: -8 }, { yPercent: 14, rotation: 6, ease: 'none', scrollTrigger: drift() });
        gsap.fromTo(grid, { y: -40 }, { y: 40, ease: 'none', scrollTrigger: drift() });
      }

      rise(caption, caption, { y: 16, start: 'top 95%' });
    });

    return () => mm.revert();
  }, [scopeRef]);
}
