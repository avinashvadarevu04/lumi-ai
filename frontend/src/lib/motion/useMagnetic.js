import { useEffect } from 'react';
import { createSpring } from './spring';
import { canUsePointerFx } from './prefs';

/**
 * Magnetic hover for pill buttons and icon buttons. While the pointer is over
 * the element it is pulled toward the pointer (`strength` of the offset from
 * its resting centre) on a spring, then springs home on leave. It moves via the
 * independent CSS `translate` property, so Tailwind transforms such as
 * active:scale keep working. The element is tagged [data-magnetic] so the
 * custom cursor snaps toward it too.
 *
 * @returns {() => void} cleanup
 */
export function attachMagnetic(el, { strength = 0.3, stiffness = 260, damping = 16, mass = 0.9 } = {}) {
  if (!el || !canUsePointerFx()) return () => {};
  const hadAttribute = el.hasAttribute('data-magnetic');
  if (!hadAttribute) el.setAttribute('data-magnetic', '');

  const spring = createSpring(
    { x: 0, y: 0 },
    {
      stiffness,
      damping,
      mass,
      onUpdate: ({ x, y }) => {
        el.style.translate = `${x.toFixed(2)}px ${y.toFixed(2)}px`;
      },
    }
  );

  const onMove = (event) => {
    const rect = el.getBoundingClientRect();
    // Measure from the resting centre, not the displaced one.
    const cx = rect.left + rect.width / 2 - spring.value.x;
    const cy = rect.top + rect.height / 2 - spring.value.y;
    spring.set({ x: (event.clientX - cx) * strength, y: (event.clientY - cy) * strength });
  };
  const onLeave = () => spring.set({ x: 0, y: 0 });

  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerleave', onLeave);
  return () => {
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerleave', onLeave);
    spring.stop();
    el.style.translate = '';
    if (!hadAttribute) el.removeAttribute('data-magnetic');
  };
}

/** Magnetic hover for one element: useMagnetic(buttonRef, { strength: 0.35 }). */
export default function useMagnetic(ref, options) {
  const { strength, stiffness, damping, mass } = options || {};
  useEffect(() => attachMagnetic(ref.current, { strength, stiffness, damping, mass }), [ref, strength, stiffness, damping, mass]);
}

/** Magnetic hover for every [data-magnetic] element inside a scope (lists rendered from data). */
export function useMagneticScope(scopeRef, options) {
  const { strength, stiffness, damping, mass } = options || {};
  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return undefined;
    const cleanups = Array.from(scope.querySelectorAll('[data-magnetic]')).map((el) =>
      attachMagnetic(el, { strength, stiffness, damping, mass })
    );
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [scopeRef, strength, stiffness, damping, mass]);
}
