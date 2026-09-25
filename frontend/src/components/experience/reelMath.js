/**
 * Pure maths for the metric slot reels: strip geometry, how far each reel
 * travels on each motion branch, and a spin ease whose exit speed matches the
 * elastic lock's entry speed, so a reel brakes into its bounce without a jolt.
 */

/** Ease for the final snap into place. */
export const LOCK_EASE = 'elastic.out(1, 0.5)';
/** Slope of elastic.out at t = 0 (amplitude 1, any period): 10 * ln 2. */
const LOCK_EASE_SLOPE = 10 * Math.LN2;

/** Full 0-9 revolutions before the final digit. Each digit to the right spins one extra turn, like an odometer. */
const REVOLUTIONS = { desktop: 3, mobile: 1 };

/** Rows a reel travels from its "0" start row to its final digit on a branch. */
export function reelTravel(digit, index, branch) {
  return (REVOLUTIONS[branch] + index) * 10 + digit;
}

/**
 * The DOM strip is sized for the longest (desktop) travel, plus one spare row
 * below the final digit so the elastic overshoot always reveals the next digit.
 * Shorter branches simply start further down the same strip (also on a "0").
 */
export function reelLayout(digit, index) {
  const finalRow = reelTravel(digit, index, 'desktop');
  return { finalRow, rows: finalRow + 2 };
}

/** Transform that shows (fractional) row `row` of a strip with `rows` rows. */
export const stripTransform = (row, rows) => `translate3d(0, ${((-row / rows) * 100).toFixed(4)}%, 0)`;

export function smoothstep(edge0, edge1, x) {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}

/*
 * Spin velocity profile (normalised time t in 0..1):
 *   0 .. RAMP_IN       speed ramps up linearly from rest
 *   RAMP_IN .. RAMP_OUT cruise at full speed
 *   RAMP_OUT .. 1       speed eases down to `endRatio` of full speed
 * The ease is the integral of that profile, normalised to end at 1.
 */
const RAMP_IN = 0.22;
const RAMP_OUT = 0.62;
const TAIL = 1 - RAMP_OUT;
/** Area under the profile when endRatio = 0. */
const BASE_AREA = RAMP_IN / 2 + (RAMP_OUT - RAMP_IN) + TAIL / 2;

function createSpinEase(endRatio) {
  const area = BASE_AREA + (TAIL * endRatio) / 2;
  return (t) => {
    let distance;
    if (t <= RAMP_IN) {
      distance = (t * t) / (2 * RAMP_IN);
    } else if (t <= RAMP_OUT) {
      distance = RAMP_IN / 2 + (t - RAMP_IN);
    } else {
      const u = t - RAMP_OUT;
      distance = RAMP_IN / 2 + (RAMP_OUT - RAMP_IN) + u - ((1 - endRatio) * u * u) / (2 * TAIL);
    }
    return distance / area;
  };
}

/**
 * Split a reel's travel into a spin and an elastic lock.
 * The spin ends at the exact speed the elastic ease starts with, solved from
 *   (spinRows / spinTime) * endRatio / area(endRatio) = LOCK_EASE_SLOPE * lockRows / lockTime
 *
 * @param {{ travel: number, spinTime: number, lockRows: number, lockTime: number }} plan
 * @returns {{ spinRows: number, spinEase: (t: number) => number }}
 */
export function planReel({ travel, spinTime, lockRows, lockTime }) {
  const spinRows = travel - lockRows;
  const lockSpeed = (LOCK_EASE_SLOPE * lockRows) / lockTime;
  const c = (lockSpeed * spinTime) / spinRows;
  const denominator = 1 - (c * TAIL) / 2;
  const endRatio = denominator > 0 ? Math.min(Math.max((c * BASE_AREA) / denominator, 0.05), 1) : 1;
  return { spinRows, spinEase: createSpinEase(endRatio) };
}
