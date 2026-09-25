import { gsap } from '../../lib/motion/gsap';
import { traceContour } from './contour';

/**
 * Mobile and tablet (under 1024px, motion allowed): the cards stay a native
 * vertical list, so touch scrolling is never hijacked. Each card rises into
 * place once as it enters, its contour traces, and its outcomes and modules
 * land one by one. No pinning, no 3D and no pointer tilt.
 *
 * @returns {() => void} cleanup (everything here lives in the matchMedia context)
 */
export function buildMobileDeck({ cards, contours, modules, outcomes }) {
  cards.forEach((card, i) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 88%', once: true } });

    tl.fromTo(card, { autoAlpha: 0, y: 44 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'lumi.out' }, 0);

    if (contours[i]) {
      const [from, to] = traceContour(contours[i]);
      tl.fromTo(contours[i], from, { ...to, duration: 1.2, ease: 'power2.inOut' }, 0.15);
    }
    if (outcomes[i].length) {
      tl.fromTo(
        outcomes[i],
        { autoAlpha: 0, x: -12 },
        { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power2.out', stagger: 0.06 },
        0.3
      );
    }
    if (modules[i].length) {
      tl.fromTo(
        modules[i],
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.55, ease: 'lumi.out', stagger: 0.07 },
        0.35
      );
    }
  });

  return () => {};
}
