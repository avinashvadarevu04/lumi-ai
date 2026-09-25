import { CustomEase } from '../../lib/motion/gsap';

/**
 * Spring landings for time-based tweens.
 *
 * Integrates the same damped spring as lib/motion/spring.js (semi-implicit
 * Euler in 240 Hz sub-steps) from 0 to 1 over `duration` seconds and bakes the
 * curve into a CustomEase. Cards and pills therefore land with a real
 * overshoot and settle that matches the pointer springs used elsewhere,
 * rather than a canned back or elastic curve. Tween with the sampled duration.
 */
function sampleSpring({ stiffness, damping, mass, duration, samples = 72 }) {
  const subStep = 1 / 240;
  let x = 0;
  let v = 0;
  let t = 0;
  const path = ['M0,0'];
  for (let i = 1; i < samples; i += 1) {
    const until = (i / samples) * duration;
    while (t < until - 1e-9) {
      const h = Math.min(subStep, until - t);
      const accel = (-stiffness * (x - 1) - damping * v) / mass;
      v += accel * h;
      x += v * h;
      t += h;
    }
    path.push(`L${(i / samples).toFixed(4)},${x.toFixed(4)}`);
  }
  path.push('L1,1');
  return path.join(' ');
}

/** About 8% overshoot, settled well inside the duration. */
export const SPRING_LAND = 'cohesion.land';
export const SPRING_LAND_DURATION = 1.3;

CustomEase.create(SPRING_LAND, sampleSpring({ stiffness: 140, damping: 15, mass: 1, duration: SPRING_LAND_DURATION }));
