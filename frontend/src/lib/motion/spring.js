import gsap from 'gsap';

/**
 * Spring physics for pointer and scroll interactions.
 *
 * Each body integrates  a = (-stiffness * (x - target) - damping * v) / mass
 * in fixed 240 Hz sub-steps (semi-implicit Euler), so it feels identical at
 * 30, 60 or 144 fps. Bodies run on gsap.ticker, the same clock that drives
 * Lenis and ScrollTrigger, and put themselves to sleep once settled, so an idle
 * spring costs nothing.
 *
 *   stiffness  pull toward the target (higher = snappier)
 *   damping    velocity damping (higher = less overshoot; 2 * sqrt(k * m) is critical)
 *   mass       inertia (higher = heavier: slower to start, slower to stop)
 */
const awake = new Set();
let running = false;
const SUB_STEP = 1 / 240;
const MAX_FRAME = 1 / 20; // clamp long frames (tab switches) so bodies never explode

function tick(_time, deltaMs) {
  const dt = Math.min(deltaMs / 1000, MAX_FRAME);
  awake.forEach((body) => {
    if (body.advance(dt)) awake.delete(body);
  });
  if (!awake.size) {
    gsap.ticker.remove(tick);
    running = false;
  }
}

function wake(body) {
  awake.add(body);
  if (!running) {
    running = true;
    gsap.ticker.add(tick);
  }
}

/**
 * A set of springs that share parameters and settle together, for example
 * { x, y } for a magnetic button or { rx, ry } for a tilting card.
 *
 * @param {Record<string, number>} initial starting values (also the first targets)
 * @param {{ stiffness?: number, damping?: number, mass?: number, precision?: number,
 *   onUpdate?: (value: Record<string, number>, velocity: Record<string, number>) => void }} [options]
 *   onUpdate runs once per frame while the body is moving; velocity is in units per second.
 */
export function createSpring(initial, { stiffness = 170, damping = 22, mass = 1, precision = 0.01, onUpdate } = {}) {
  const keys = Object.keys(initial);
  const value = { ...initial };
  const target = { ...initial };
  const velocity = Object.fromEntries(keys.map((key) => [key, 0]));

  const body = {
    value,
    target,
    velocity,
    stiffness,
    damping,
    mass,
    precision,
    /** Move the targets; the values spring toward them. */
    set(next) {
      Object.assign(target, next);
      wake(body);
      return body;
    },
    /** Add velocity (units per second), e.g. a flick or a scroll impulse. */
    impulse(kick) {
      Object.keys(kick).forEach((key) => {
        velocity[key] += kick[key];
      });
      wake(body);
      return body;
    },
    /** Snap immediately, without animating. */
    jump(next) {
      Object.assign(value, next);
      Object.assign(target, next);
      keys.forEach((key) => {
        velocity[key] = 0;
      });
      onUpdate?.(value, velocity);
      return body;
    },
    /** Stop simulating (call on unmount). */
    stop() {
      awake.delete(body);
    },
    advance(dt) {
      for (let left = dt; left > 1e-6; left -= SUB_STEP) {
        const h = Math.min(SUB_STEP, left);
        for (const key of keys) {
          const accel = (-body.stiffness * (value[key] - target[key]) - body.damping * velocity[key]) / body.mass;
          velocity[key] += accel * h;
          value[key] += velocity[key] * h;
        }
      }
      let settled = true;
      for (const key of keys) {
        if (Math.abs(velocity[key]) > body.precision || Math.abs(value[key] - target[key]) > body.precision) {
          settled = false;
          break;
        }
      }
      if (settled) {
        keys.forEach((key) => {
          value[key] = target[key];
          velocity[key] = 0;
        });
      }
      onUpdate?.(value, velocity);
      return settled;
    },
  };
  return body;
}

/** Smoothed rate of change of a sampled signal (pointer x, scroll y), in units per second. */
export function createVelocityTracker(smoothing = 0.25) {
  let last = null;
  let lastTime = 0;
  let current = 0;
  return {
    sample(x, time = performance.now()) {
      if (last !== null) {
        const dt = Math.max((time - lastTime) / 1000, 1e-3);
        current += ((x - last) / dt - current) * smoothing;
      }
      last = x;
      lastTime = time;
      return current;
    },
    get value() {
      return current;
    },
    reset() {
      last = null;
      current = 0;
    },
  };
}

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
export const lerp = (a, b, t) => a + (b - a) * t;
/** Frame-rate independent exponential smoothing toward a target. */
export const damp = (current, target, lambda, dt) => lerp(current, target, 1 - Math.exp(-lambda * dt));
