/** Media queries shared by every section so breakpoints never drift apart. */
export const MQ = {
  desktop: '(min-width: 1024px)',
  reduce: '(prefers-reduced-motion: reduce)',
  finePointer: '(hover: hover) and (pointer: fine)',
};

/**
 * Conditions for gsap.matchMedia(). Every section builds its choreography with
 *   mm.add(MOTION, (ctx) => { const { desktop, mobile, reduce } = ctx.conditions; ... })
 * so the rich desktop track, the simplified touch fallback and the static
 * reduced-motion state are always mutually exclusive.
 */
export const MOTION = {
  desktop: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
  mobile: '(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)',
  reduce: '(prefers-reduced-motion: reduce)',
};

const matches = (query) => typeof window !== 'undefined' && window.matchMedia(query).matches;

export const prefersReducedMotion = () => matches(MQ.reduce);
export const hasFinePointer = () => matches(MQ.finePointer);
export const isDesktop = () => matches(MQ.desktop);

/** Pointer effects (tilt, magnetism, custom cursor) need a mouse and motion allowed. */
export const canUsePointerFx = () => hasFinePointer() && !prefersReducedMotion();
