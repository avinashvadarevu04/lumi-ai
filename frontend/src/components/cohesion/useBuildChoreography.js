import { useLayoutEffect } from 'react';
import { gsap } from '../../lib/motion/gsap';
import { MOTION } from '../../lib/motion/prefs';
import { clamp } from '../../lib/motion/spring';
import { SPRING_LAND, SPRING_LAND_DURATION } from './springEase';
import { revealLines } from './revealLines';

/** Glyphs the stage badges decode through (mono font, so widths never jump). */
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/+';

const pad = (n) => String(n).padStart(2, '0');

/**
 * How We Build choreography. No pin: Selected Work directly above is pinned.
 *
 * desktop  heading lines rise out of masks. A hairline rail scrubs left to
 *          right above the four cards; as its leading edge passes a stage node
 *          the node lights and ripples, that stage's badge re-decodes with
 *          ScrambleText and the lifecycle readout ticks. Cards land on a
 *          sampled spring, their deliverables settling in just after.
 * mobile   the same rail runs vertically beside the stacked cards (one light
 *          scrub, same node and badge logic), with simple fade-up reveals.
 * reduce   nothing is created: the markup's default state is the design
 *          (rail drawn, every node lit, badges final).
 */
export default function useBuildChoreography(scopeRef) {
  useLayoutEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return undefined;

    const pick = (name) => scope.querySelector(`[data-hwb="${name}"]`);
    const eyebrow = pick('eyebrow');
    const heading = pick('heading');
    const lede = pick('lede');
    const list = pick('list');
    const rail = pick('rail');
    const fill = pick('fill');
    const head = pick('head');
    const readout = pick('readout');
    const steps = Array.from(scope.querySelectorAll('[data-hwb="step"]'));
    if (!eyebrow || !heading || !lede || !list || !rail || !fill || !head || !steps.length) return undefined;

    const nodes = steps.map((step) => step.querySelector('[data-hwb="node"]'));
    const cards = steps.map((step) => step.querySelector('[data-hwb="card"]'));
    const badges = steps.map((step) => step.querySelector('[data-hwb="badge"]'));
    const points = Array.from(scope.querySelectorAll('[data-hwb="point"]'));
    const restingReadout = readout ? readout.textContent : '';

    const mm = gsap.matchMedia(scope);
    mm.add(MOTION, (ctx) => {
      const { desktop, mobile } = ctx.conditions;
      if (!desktop && !mobile) return undefined;

      /* ---- Intro copy ---- */
      gsap.fromTo(
        [eyebrow, lede],
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: 'lumi.out',
          stagger: 0.18,
          scrollTrigger: { trigger: eyebrow, start: 'top 88%', once: true },
        }
      );
      if (desktop) {
        revealLines(heading, { start: 'top 85%' });
      } else {
        gsap.fromTo(
          heading,
          { autoAlpha: 0, y: 28 },
          { autoAlpha: 1, y: 0, duration: 0.8, ease: 'lumi.out', scrollTrigger: { trigger: heading, start: 'top 88%', once: true } }
        );
      }

      /* ---- Stage lighting ---- */
      // One paused decode per badge, restarted whenever its node lights going forward.
      const scrambles = badges.map((badge) =>
        badge
          ? gsap.to(badge, {
              paused: true,
              duration: 0.9,
              ease: 'none',
              scrambleText: { text: '{original}', chars: GLYPHS, speed: 0.7, revealDelay: 0.2 },
            })
          : null
      );

      const horizontal = desktop;
      const railLength = () => (horizontal ? rail.offsetWidth : rail.offsetHeight) || 1;

      // Each node's position along the rail as a 0..1 progress threshold.
      // offsetLeft/offsetTop ignore transforms, so landing cards never skew it.
      let thresholds = [];
      const measure = () => {
        const origin = horizontal ? rail.offsetLeft : rail.offsetTop;
        const length = railLength();
        thresholds = steps.map((step, i) => {
          const node = nodes[i];
          if (!node) return 1;
          const centre = horizontal
            ? step.offsetLeft + node.offsetLeft + node.offsetWidth / 2
            : step.offsetTop + node.offsetTop + node.offsetHeight / 2;
          return clamp((centre - origin) / length, 0, 1);
        });
      };

      let litCount = 0;
      const light = (progress) => {
        const count = thresholds.reduce((n, t) => (progress >= t ? n + 1 : n), 0);
        if (count === litCount) return;
        steps.forEach((step, i) => {
          const on = i < count;
          if (on && i >= litCount) scrambles[i]?.restart();
          const next = on ? 'true' : 'false';
          if (step.dataset.lit !== next) step.dataset.lit = next;
        });
        litCount = count;
        if (readout) readout.textContent = pad(count);
      };

      steps.forEach((step) => {
        step.dataset.lit = 'false';
      });
      if (readout) readout.textContent = pad(0);
      gsap.set(head, { autoAlpha: 1 });

      /* ---- Scrubbed rail ---- */
      // The fill draws along the rail and the head rides its leading edge; the
      // timeline's own (scrub-smoothed) progress drives the node lighting, so a
      // node lights exactly when the drawn line reaches it.
      const scaleProp = horizontal ? 'scaleX' : 'scaleY';
      const axis = horizontal ? 'x' : 'y';
      const track = gsap.timeline({
        defaults: { ease: 'none', duration: 1 },
        scrollTrigger: {
          trigger: list,
          start: horizontal ? 'top 78%' : 'top 70%',
          end: horizontal ? 'bottom 72%' : 'bottom 70%',
          scrub: horizontal ? 0.9 : 0.5,
          invalidateOnRefresh: true,
          onRefresh: measure,
        },
        // A plain function: GSAP calls it with `this` bound to the timeline, which
        // stays safe even if ScrollTrigger renders it during construction.
        onUpdate() {
          light(this.progress());
        },
      });
      track.fromTo(fill, { [scaleProp]: 0 }, { [scaleProp]: 1 }, 0).fromTo(head, { [axis]: 0 }, { [axis]: railLength }, 0);
      measure();

      /* ---- Cards ---- */
      if (desktop) {
        gsap
          .timeline({ scrollTrigger: { trigger: list, start: 'top 82%', once: true } })
          .fromTo(
            cards,
            { y: 120, rotationX: -18, transformPerspective: 1100, transformOrigin: '50% 100%' },
            { y: 0, rotationX: 0, duration: SPRING_LAND_DURATION, ease: SPRING_LAND, stagger: 0.11 },
            0
          )
          // Opacity on its own short curve so the spring's overshoot never flickers it.
          .fromTo(cards, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: 'power2.out', stagger: 0.11 }, 0)
          .fromTo(points, { autoAlpha: 0, x: -10 }, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'lumi.out', stagger: 0.03 }, 0.35);
      } else {
        cards.forEach((card) => {
          gsap.fromTo(
            card,
            { autoAlpha: 0, y: 36 },
            { autoAlpha: 1, y: 0, duration: 0.8, ease: 'lumi.out', scrollTrigger: { trigger: card, start: 'top 90%', once: true } }
          );
        });
      }

      // Tweens, triggers and the heading split are reverted by matchMedia; the
      // attributes and readout text written by hand are restored here.
      return () => {
        steps.forEach((step) => step.removeAttribute('data-lit'));
        if (readout) readout.textContent = restingReadout;
      };
    });

    return () => mm.revert();
  }, [scopeRef]);
}
