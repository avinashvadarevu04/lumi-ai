import { gsap, SplitText } from '../../lib/motion/gsap';

/**
 * Masked line reveal for section headings: each line rises out of its own clip.
 *
 * autoSplit re-splits on resize and font load, and SplitText carries the
 * returned tween's progress across re-splits, so a finished reveal never
 * replays. Call it inside a gsap.matchMedia / gsap.context callback: the split
 * registers with that context and is reverted (original markup restored) with it.
 * aria stays at SplitText's default ('auto'), so screen readers get the full text.
 */
export function revealLines(el, { start = 'top 85%', duration = 1.1, stagger = 0.08 } = {}) {
  if (!el) return null;
  return SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'cohesion-line',
    autoSplit: true,
    onSplit: (self) =>
      gsap.from(self.lines, {
        yPercent: 120,
        duration,
        stagger,
        ease: 'lumi.out',
        scrollTrigger: { trigger: el, start, once: true },
      }),
  });
}

export default revealLines;
