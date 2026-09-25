import { gsap } from '../../lib/motion/gsap';

/** The landing curve: a heavy drop that overshoots the floor and settles. */
export const DROP_EASE = 'elastic.out(1, 0.75)';

/**
 * Fraction of an ease's duration at which it first reaches its end value. For
 * the elastic drop that is the instant the card touches down (about 0.19), so
 * the impact FX are keyed to the curve itself rather than a guessed delay.
 */
export function firstContact(ease, steps = 2000) {
  const curve = gsap.parseEase(ease);
  for (let step = 1; step <= steps; step += 1) {
    if (curve(step / steps) >= 1) return step / steps;
  }
  return 1;
}

/**
 * One card's landing, as a paused timeline that the caller plays when the card
 * scrolls in:
 *   0        the card drops from `distance` px above with a rotateX lean and fades in
 *   contact  squash (scaleY 1 to 0.98 to 1), the base shadow compresses, a hairline flashes
 * Opacity (not autoAlpha) keeps not-yet-landed cards in the accessibility tree.
 *
 * @param {{ drop: Element, shadow: Element, flash: Element }} parts
 * @param {{ distance: number, tilt?: number, duration: number, impact?: boolean, onContact?: () => void }} options
 *   impact: false skips the squash and shadow compression (the touch layout).
 */
export function createLanding({ drop, shadow, flash }, { distance, tilt = 0, duration, impact = true, onContact }) {
  const contact = duration * firstContact(DROP_EASE);
  const tl = gsap.timeline({ paused: true });

  tl.fromTo(
    drop,
    { y: -distance, rotationX: tilt, transformOrigin: '50% 100%' },
    { y: 0, rotationX: 0, duration, ease: DROP_EASE },
    0
  ).fromTo(drop, { opacity: 0 }, { opacity: 1, duration: contact + 0.2, ease: 'power2.out' }, 0);

  if (impact) {
    // Far from the floor the shadow is wide and faint; it tightens on approach,
    // compresses hard on contact, then relaxes while the card settles.
    tl.fromTo(
      shadow,
      { opacity: 0, scaleX: 1.5, scaleY: 1.3 },
      { opacity: 0.5, scaleX: 1.15, scaleY: 1.1, duration: contact, ease: 'power2.in' },
      0
    )
      .to(shadow, { opacity: 1, scaleX: 0.86, scaleY: 0.5, duration: 0.08, ease: 'power3.out' }, contact)
      .to(shadow, { scaleX: 1, scaleY: 1, duration: 0.9, ease: 'power3.out' }, contact + 0.08)
      .to(drop, { scaleY: 0.98, scaleX: 1.008, duration: 0.08, ease: 'power2.out' }, contact)
      .to(drop, { scaleY: 1, scaleX: 1, duration: 0.6, ease: 'elastic.out(1, 0.45)' }, contact + 0.08);
  } else {
    tl.fromTo(shadow, { opacity: 0 }, { opacity: 1, duration: contact + 0.4, ease: 'power2.out' }, 0);
  }

  tl.fromTo(flash, { opacity: 0, scaleX: 0.2 }, { opacity: 0.8, scaleX: 1, duration: 0.14, ease: 'power3.out' }, contact).to(
    flash,
    { opacity: 0, duration: 0.7, ease: 'power2.out' },
    contact + 0.14
  );

  if (onContact) tl.call(onContact, undefined, contact);
  return tl;
}
