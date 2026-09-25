import { gsap } from '../../lib/motion/gsap';

/** Seconds per lap of the light beam around a card, matching the auto-cycle interval. */
export const BEAM_LAP = 3;

/**
 * One card's border beam. Every stroke in `el` carries data-dash (its lit
 * length as a fraction of the perimeter; the rects use pathLength=1). A dash
 * covers [head - dash, head] when offset = dash - head, so tweening each offset
 * from dash to dash - 1 moves all heads together through one lap.
 * The lap and the fade are created paused, up front, so the caller's gsap
 * context reverts them; show/hide/freeze only play, reverse or pause them.
 */
export function createBeam(el, { lap = BEAM_LAP } = {}) {
  let shown = false;
  const run = gsap.timeline({ repeat: -1, paused: true });
  el.querySelectorAll('[data-dash]').forEach((stroke) => {
    const dash = Number(stroke.getAttribute('data-dash')) || 0;
    run.fromTo(
      stroke,
      { attr: { 'stroke-dashoffset': dash } },
      { attr: { 'stroke-dashoffset': dash - 1 }, duration: lap, ease: 'none' },
      0
    );
  });

  const fade = gsap.fromTo(
    el,
    { autoAlpha: 0 },
    {
      autoAlpha: 1,
      duration: 0.45,
      ease: 'power2.out',
      paused: true,
      // Only the active beam runs: stop the lap once this one has faded out.
      onReverseComplete: () => {
        if (!shown) run.pause();
      },
    }
  );

  return {
    /** Fade in and run, or resume a frozen beam. */
    show() {
      shown = true;
      fade.play();
      run.play();
    },
    /** Fade out; the lap pauses once the beam is invisible. */
    hide() {
      shown = false;
      if (fade.progress() === 0) run.pause();
      else fade.reverse();
    },
    /** Pause in place without hiding (the card left the screen). */
    freeze() {
      run.pause();
    },
  };
}

/**
 * Chooses which card's beam runs. A hovered card wins, then a keyboard-focused
 * one; otherwise the beam hands off every `interval` seconds to the next card
 * that is both on screen and landed. With no such card the active beam freezes,
 * so nothing animates off screen.
 *
 * @param {ReturnType<typeof createBeam>[]} beams
 * @param {{ interval?: number, onActiveChange?: (index: number | null) => void }} [options]
 */
export function createBeamCycle(beams, { interval = BEAM_LAP, onActiveChange } = {}) {
  const visible = new Set();
  const landed = new Set();
  let hovered = null;
  let focused = null;
  let active = null;
  let timer = null;

  const candidates = () => beams.map((_, index) => index).filter((index) => visible.has(index) && landed.has(index));

  function activate(next) {
    if (next === active) return;
    if (active !== null) beams[active].hide();
    active = next;
    onActiveChange?.(active);
  }

  function advance() {
    const pool = candidates();
    if (pool.length) activate(pool[(pool.indexOf(active) + 1) % pool.length]);
    sync();
  }

  // Re-evaluate after any change in hover, focus, visibility or landing.
  function sync() {
    timer?.kill();
    timer = null;
    const held = hovered ?? focused;
    const pool = candidates();
    if (held === null && !pool.length) {
      if (active !== null) beams[active].freeze();
      return;
    }
    if (held !== null) activate(held);
    else if (!pool.includes(active)) activate(pool[0]);
    beams[active].show();
    if (held === null && pool.length > 1) timer = gsap.delayedCall(interval, advance);
  }

  return {
    hover(index, on) {
      if (on) hovered = index;
      else if (hovered === index) hovered = null;
      sync();
    },
    focus(index, on) {
      if (on) focused = index;
      else if (focused === index) focused = null;
      sync();
    },
    setVisible(index, on) {
      if (visible.has(index) === on) return;
      if (on) visible.add(index);
      else visible.delete(index);
      sync();
    },
    setLanded(index) {
      if (landed.has(index)) return;
      landed.add(index);
      sync();
    },
    destroy() {
      timer?.kill();
      timer = null;
    },
  };
}
