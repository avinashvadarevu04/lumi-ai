import { useEffect } from 'react';
import { createSpring } from './spring';
import { canUsePointerFx } from './prefs';

/**
 * Pointer-tracked 3D tilt with spring inertia, plus a spotlight sheen.
 * Writes CSS custom properties on `el`:
 *   --tilt-x, --tilt-y   rotation in degrees (for rotateX / rotateY)
 *   --sheen-x, --sheen-y pointer position in percent (for a radial gradient)
 *   --sheen              sheen opacity, 0 to 1
 * Use TILT_STYLE on the tilting face and SHEEN_STYLE on an overlay inside it.
 * Never tilt an element GSAP also animates (GSAP owns its transform): tilt an
 * inner face and let GSAP move the outer wrapper.
 *
 * @param {HTMLElement} el element that receives the custom properties
 * @param {{ max?: number, bounds?: HTMLElement, stiffness?: number, damping?: number, mass?: number }} [options]
 *   bounds: element to measure the pointer against (defaults to el); pass the
 *   untilted wrapper to avoid measuring a rotated box.
 * @returns {() => void} cleanup
 */
export function attachTilt(el, { max = 8, bounds, stiffness = 140, damping = 15, mass = 1 } = {}) {
  if (!el || !canUsePointerFx()) return () => {};
  const box = bounds || el;

  const write = (v) => {
    el.style.setProperty('--tilt-x', `${v.rx.toFixed(3)}deg`);
    el.style.setProperty('--tilt-y', `${v.ry.toFixed(3)}deg`);
    el.style.setProperty('--sheen-x', `${v.px.toFixed(2)}%`);
    el.style.setProperty('--sheen-y', `${v.py.toFixed(2)}%`);
    el.style.setProperty('--sheen', v.o.toFixed(3));
  };
  const spring = createSpring({ rx: 0, ry: 0, px: 50, py: 50, o: 0 }, { stiffness, damping, mass, onUpdate: write });
  write(spring.value);

  const onMove = (event) => {
    const rect = box.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    const y = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);
    spring.set({ rx: (0.5 - y) * 2 * max, ry: (x - 0.5) * 2 * max, px: x * 100, py: y * 100, o: 1 });
  };
  const onLeave = () => spring.set({ rx: 0, ry: 0, o: 0 });

  box.addEventListener('pointermove', onMove);
  box.addEventListener('pointerleave', onLeave);
  return () => {
    box.removeEventListener('pointermove', onMove);
    box.removeEventListener('pointerleave', onLeave);
    spring.stop();
    ['--tilt-x', '--tilt-y', '--sheen-x', '--sheen-y', '--sheen'].forEach((prop) => el.style.removeProperty(prop));
  };
}

/** useTilt(faceRef, { max: 8, boundsRef }) */
export default function useTilt(ref, options) {
  const { max, stiffness, damping, mass, boundsRef } = options || {};
  useEffect(
    () => attachTilt(ref.current, { max, stiffness, damping, mass, bounds: boundsRef?.current || undefined }),
    [ref, boundsRef, max, stiffness, damping, mass]
  );
}

/** Style for the tilting face. */
export const TILT_STYLE = {
  transform: 'perspective(1100px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))',
  transformStyle: 'preserve-3d',
  willChange: 'transform',
};

/** Style for the cursor-tracked sheen overlay (absolute inset-0, pointer-events-none). */
export const SHEEN_STYLE = {
  background: 'radial-gradient(circle at var(--sheen-x, 50%) var(--sheen-y, 50%), rgba(255,255,255,0.12), transparent 60%)',
  opacity: 'var(--sheen, 0)',
};
