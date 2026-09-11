/* eslint-disable react/only-export-components --
   This module is the page-wide scroll store (Lenis instance, scrollTo, velocity)
   as well as its provider. Editing it must trigger a full reload anyway, since
   Lenis has to re-initialise, so Fast Refresh's one-component rule doesn't apply. */
import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap';
import { prefersReducedMotion } from './prefs';

/**
 * Lenis smooth scrolling, driven by GSAP's ticker, so Lenis, ScrollTrigger and
 * every tween advance on the same frame: no second rAF loop, no one-frame lag.
 * Reduced-motion visitors keep native scrolling.
 *
 * The provider also publishes a shared scroll velocity (Lenis units: pixels
 * per frame, signed, 0 at rest) for effects that react to scroll speed, such
 * as the Selected Work skew rail and the Metrics grid distortion.
 */
let lenis = null;
let velocity = 0;
let lastScrollAt = 0;
const velocityListeners = new Set();

/** The live Lenis instance, or null (reduced motion, or not mounted yet). */
export const getLenis = () => lenis;

/** Latest scroll velocity in pixels per frame (signed; 0 when the page is at rest). */
export const getScrollVelocity = () => velocity;

/** Subscribe to scroll velocity changes. Returns an unsubscribe function. */
export function subscribeScrollVelocity(listener) {
  velocityListeners.add(listener);
  return () => {
    velocityListeners.delete(listener);
  };
}

function publishVelocity(next) {
  velocity = next;
  velocityListeners.forEach((listener) => listener(next));
}

/**
 * Scroll to a number, selector or element. Uses Lenis when it is running and
 * native scrolling otherwise. Options follow Lenis: { offset, duration, immediate, lock }.
 */
export function scrollTo(target, options = {}) {
  if (lenis) {
    lenis.scrollTo(target, options);
    return;
  }
  const { offset = 0, immediate = false } = options;
  let top = 0;
  if (typeof target === 'number') {
    top = target;
  } else {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    top = el.getBoundingClientRect().top + window.scrollY;
  }
  window.scrollTo({ top: top + offset, behavior: immediate || prefersReducedMotion() ? 'auto' : 'smooth' });
}

/**
 * Mount once around the landing page. `paused` stops scrolling entirely (the
 * intro and the contact modal); when it clears, Lenis re-measures the page.
 */
export function SmoothScrollProvider({ paused = false, children }) {
  useEffect(() => {
    if (prefersReducedMotion()) {
      return () => {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      };
    }

    const instance = new Lenis({
      autoRaf: false,
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
      anchors: true,
    });
    lenis = instance;

    const onScroll = (current) => {
      lastScrollAt = performance.now();
      ScrollTrigger.update();
      publishVelocity(current.velocity);
    };
    instance.on('scroll', onScroll);

    const raf = (time) => {
      instance.raf(time * 1000);
      // Lenis may not emit a final zero-velocity event; settle it ourselves.
      if (velocity !== 0 && performance.now() - lastScrollAt > 90) publishVelocity(0);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      instance.destroy();
      if (lenis === instance) lenis = null;
      publishVelocity(0);
      // Page-level sweep: nothing scroll-driven may outlive the landing page.
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  useEffect(() => {
    if (!lenis) return;
    if (paused) {
      lenis.stop();
    } else {
      lenis.start();
      lenis.resize();
    }
  }, [paused]);

  return children;
}

export default SmoothScrollProvider;
