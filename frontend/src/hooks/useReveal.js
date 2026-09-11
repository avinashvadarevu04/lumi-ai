import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ */
/*  Word splitting for headline reveals (restored on cleanup)          */
/* ------------------------------------------------------------------ */
function splitWords(el) {
  const original = el.innerHTML;
  const wrap = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const parts = node.textContent.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      parts.forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(' '));
          return;
        }
        const outer = document.createElement('span');
        outer.className = 'inline-block overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em]';
        const inner = document.createElement('span');
        inner.className = 'split-word inline-block will-change-transform';
        inner.textContent = part;
        outer.appendChild(inner);
        frag.appendChild(outer);
      });
      node.replaceWith(frag);
    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'BR' && node.tagName !== 'SVG') {
      Array.from(node.childNodes).forEach(wrap);
    }
  };
  Array.from(el.childNodes).forEach(wrap);
  return () => {
    el.innerHTML = original;
  };
}

const VARIANTS = {
  up: { y: 36 },
  down: { y: -36 },
  left: { x: -48 },
  right: { x: 48 },
  scale: { scale: 0.92, y: 16 },
  fade: {},
  clip: { clipPath: 'inset(0 0 100% 0)' },
};

/**
 * Scroll-driven motion system. Opt in with data attributes inside `scopeRef`:
 *
 *  data-split                 headline: words rise in one after another
 *  data-reveal[=variant]      up | down | left | right | scale | fade | clip (default up)
 *  data-delay="0.2"           extra delay for a reveal
 *  data-stagger               children reveal as a staggered group
 *  data-pop                   children pop in one by one with a slight overshoot
 *  data-line                  hairline draws from left to right
 *  data-parallax="0.2"        scrubbed vertical drift, signed speed (−1 … 1)
 *  data-scrub-scale           scales/fades in as it approaches the viewport centre
 *
 * Everything lives in one gsap.context so it is fully reverted on unmount.
 */
export default function useReveal(scopeRef) {
  useLayoutEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return undefined;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const restorers = [];
    const dur = reduce ? 0.01 : 0.9;
    const ease = 'power3.out';

    const ctx = gsap.context(() => {
      /* Headlines */
      gsap.utils.toArray('[data-split]').forEach((el) => {
        if (reduce) return;
        restorers.push(splitWords(el));
        gsap.fromTo(
          el.querySelectorAll('.split-word'),
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1,
            ease: 'power4.out',
            stagger: 0.045,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          }
        );
      });

      /* Single reveals */
      gsap.utils.toArray('[data-reveal]').forEach((node, i) => {
        const variant = VARIANTS[node.getAttribute('data-reveal')] || VARIANTS.up;
        const delay = parseFloat(node.getAttribute('data-delay') || '0') || Math.min((i % 4) * 0.06, 0.24);
        const from = reduce ? { autoAlpha: 0 } : { autoAlpha: 0, ...variant };
        const to = { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: dur, ease, delay };
        if (variant.clipPath) to.clipPath = 'inset(0 0 0% 0)';
        gsap.fromTo(node, from, { ...to, scrollTrigger: { trigger: node, start: 'top 90%', once: true } });
      });

      /* Stagger groups */
      gsap.utils.toArray('[data-stagger]').forEach((group) => {
        const items = Array.from(group.children);
        if (!items.length) return;
        const variant = VARIANTS[group.getAttribute('data-stagger')] || VARIANTS.up;
        gsap.fromTo(
          items,
          reduce ? { autoAlpha: 0 } : { autoAlpha: 0, ...variant },
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration: dur,
            ease,
            stagger: reduce ? 0 : 0.09,
            scrollTrigger: { trigger: group, start: 'top 85%', once: true },
          }
        );
      });

      /* Pop groups — children scale up into place with a slight overshoot,
         which reads as a card "landing" rather than merely fading in. */
      gsap.utils.toArray('[data-pop]').forEach((group) => {
        const items = Array.from(group.children);
        if (!items.length) return;
        const delay = parseFloat(group.getAttribute('data-delay') || '0') || 0;
        gsap.fromTo(
          items,
          reduce ? { autoAlpha: 0 } : { autoAlpha: 0, y: 24, scale: 0.92 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: reduce ? 0.01 : 0.55,
            ease: reduce ? 'none' : 'back.out(1.5)',
            stagger: reduce ? 0 : 0.07,
            delay,
            scrollTrigger: { trigger: group, start: 'top 88%', once: true },
          }
        );
      });

      /* Hairlines */
      gsap.utils.toArray('[data-line]').forEach((line) => {
        gsap.fromTo(
          line,
          { scaleX: 0, transformOrigin: 'left center' },
          { scaleX: 1, duration: reduce ? 0.01 : 1.2, ease: 'power3.inOut', scrollTrigger: { trigger: line, start: 'top 92%', once: true } }
        );
      });

      if (reduce) return;

      /* Parallax drift */
      gsap.utils.toArray('[data-parallax]').forEach((el) => {
        const speed = parseFloat(el.getAttribute('data-parallax') || '0.2');
        gsap.fromTo(
          el,
          { y: () => -speed * 160 },
          {
            y: () => speed * 160,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
          }
        );
      });

      /* Scrub scale-in */
      gsap.utils.toArray('[data-scrub-scale]').forEach((el) => {
        gsap.fromTo(
          el,
          { scale: 0.9, opacity: 0.35 },
          { scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 45%', scrub: 0.5 } }
        );
      });
    }, scope);

    return () => {
      ctx.revert();
      restorers.forEach((r) => r());
    };
  }, [scopeRef]);
}
