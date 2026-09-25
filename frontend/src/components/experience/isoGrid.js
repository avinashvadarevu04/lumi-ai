import { gsap } from '../../lib/motion/gsap';
import { getScrollVelocity, subscribeScrollVelocity } from '../../lib/motion/SmoothScroll';
import { createSpring, damp } from '../../lib/motion/spring';
import { canUsePointerFx } from '../../lib/motion/prefs';

/**
 * Isometric grid field for the Metrics section, drawn on a 2D canvas.
 *
 * Lines at +30deg, -30deg and vertical, subdivided into short segments, in
 * white at 7.5% alpha. Scroll velocity (from the shared Lenis provider) drives
 * the amplitude of a travelling swell through a spring, so fast scrolling
 * lifts the floor into waves and, at rest, it wobbles back to flat. Displacement
 * is applied as height (screen-space up), which reads as a wave rolling through
 * an isometric floor; crests are stroked brighter, troughs dimmer. On desktop
 * with a mouse, moving the pointer adds a ripple centred on it.
 *
 * The loop runs on gsap.ticker only while the canvas is in view and something
 * is moving, and sleeps as soon as the field is flat again.
 */

const TAU = Math.PI * 2;
const COS30 = Math.cos(Math.PI / 6);
const TAN30 = Math.tan(Math.PI / 6);
/** Floor distances look foreshortened vertically by tan(30deg); undo that so ripples are circles on the floor. */
const ISO_DEPTH = 1 / TAN30;

/** Stroke per height band, trough to crest. Band 2 is the resting grid. */
const BANDS = [0.03, 0.05, 0.075, 0.115, 0.165].map((alpha) => `rgba(255, 255, 255, ${alpha})`);
const REST_BAND = 2;
const MAX_BACKING_PIXELS = 6.5e6;

const MODES = {
  desktop: { cell: 56, segment: 22, maxDpr: 2, gain: 0.55, maxAmp: 26, ripple: true, animate: true },
  mobile: { cell: 64, segment: 44, maxDpr: 1, gain: 0.3, maxAmp: 12, ripple: false, animate: true },
  reduce: { cell: 56, segment: Infinity, maxDpr: 2, gain: 0, maxAmp: 0, ripple: false, animate: false },
};

// Swell: a main wave along the +30deg axis, a weaker cross wave along -30deg,
// and a slow vertical envelope so the pattern never looks mechanical.
const K_SWELL = TAU / 460;
const K_CROSS = TAU / 760;
const K_ENVELOPE = TAU / 1300;

// Pointer ripple.
const RIPPLE_AMP = 9;
const RIPPLE_RADIUS = 200;
const RIPPLE_INV_R2 = 1 / (RIPPLE_RADIUS * RIPPLE_RADIUS);
const RIPPLE_CUTOFF2 = (RIPPLE_RADIUS * 2.6) ** 2;
const K_RIPPLE = TAU / 85;

/**
 * Lattice lines covering [-margin, width + margin] x [-margin, height + margin],
 * centred on the canvas and split into segments of about `segment` px.
 * Returns flat point arrays plus the index where each line starts.
 */
function buildGeometry(width, height, cell, segment, margin) {
  const xs = [];
  const ys = [];
  const starts = [0];
  const x0 = -margin;
  const x1 = width + margin;
  const y0 = -margin;
  const y1 = height + margin;
  const cx = width / 2;
  const cy = height / 2;
  const dx = cell * COS30;

  const pushLine = (ax, ay, bx, by) => {
    const steps = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / segment));
    for (let j = 0; j <= steps; j += 1) {
      xs.push(ax + ((bx - ax) * j) / steps);
      ys.push(ay + ((by - ay) * j) / steps);
    }
    starts.push(xs.length);
  };

  // Verticals.
  for (let i = Math.ceil((x0 - cx) / dx); i <= Math.floor((x1 - cx) / dx); i += 1) {
    pushLine(cx + i * dx, y0, cx + i * dx, y1);
  }

  // Diagonals y = c + slope * (x - cx) * tan30, with c = cy + k * cell, so both
  // families pass through the same lattice points as the verticals.
  [1, -1].forEach((slope) => {
    const offsetA = slope * (x0 - cx) * TAN30;
    const offsetB = slope * (x1 - cx) * TAN30;
    const cMin = y0 - Math.max(offsetA, offsetB);
    const cMax = y1 - Math.min(offsetA, offsetB);
    for (let k = Math.ceil((cMin - cy) / cell); k <= Math.floor((cMax - cy) / cell); k += 1) {
      const c = cy + k * cell;
      const xAtTop = cx + (y0 - c) / (slope * TAN30);
      const xAtBottom = cx + (y1 - c) / (slope * TAN30);
      const lo = Math.max(x0, Math.min(xAtTop, xAtBottom));
      const hi = Math.min(x1, Math.max(xAtTop, xAtBottom));
      if (hi - lo >= 1) {
        pushLine(lo, c + slope * (lo - cx) * TAN30, hi, c + slope * (hi - cx) * TAN30);
      }
    }
  });

  return { x: Float32Array.from(xs), y: Float32Array.from(ys), starts: Uint32Array.from(starts) };
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ mode?: 'desktop' | 'mobile' | 'reduce', pointerTarget?: HTMLElement }} [options]
 *   mode: desktop = full field with pointer ripple; mobile = low-res, lighter
 *   swell; reduce = a static flat grid, redrawn only on resize.
 *   pointerTarget: element whose pointer moves feed the ripple (the section).
 * @returns {{ destroy: () => void }}
 */
export function createIsoGrid(canvas, { mode = 'reduce', pointerTarget } = {}) {
  const cfg = MODES[mode] || MODES.reduce;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { destroy() {} };

  const ripple = cfg.ripple && canUsePointerFx() && Boolean(pointerTarget);
  const margin = cfg.maxAmp + (ripple ? RIPPLE_AMP : 0) + 8;
  const bandScale = cfg.maxAmp > 0 ? 2 / (cfg.maxAmp * 0.7) : 0;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let geo = null;
  // Scratch buffers for displaced points and per-band polylines.
  let outX = null;
  let outY = null;
  let outH = null;
  let bands = [];
  const bandLength = new Int32Array(BANDS.length);
  const bandTail = new Int32Array(BANDS.length);

  let visible = false;
  let running = false;
  let needsFlat = false;
  let phase = 0;
  let direction = 1;
  const amplitude = createSpring({ a: 0 }, { stiffness: 80, damping: 10, mass: 1 });
  const pointer = { x: 0, y: 0, cx: 0, cy: 0, energy: 0, phase: 0, inside: false };

  const drawFlat = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    if (!geo) return;
    const { x, y, starts } = geo;
    ctx.strokeStyle = BANDS[REST_BAND];
    ctx.beginPath();
    for (let line = 0; line < starts.length - 1; line += 1) {
      const first = starts[line];
      const last = starts[line + 1] - 1;
      ctx.moveTo(x[first], y[first]);
      ctx.lineTo(x[last], y[last]);
    }
    ctx.stroke();
  };

  const drawWarped = (a) => {
    const { x, y, starts } = geo;
    const count = x.length;
    const withRipple = ripple && pointer.energy > 0;
    const rippleAmp = RIPPLE_AMP * pointer.energy;

    for (let i = 0; i < count; i += 1) {
      const gx = x[i];
      const gy = y[i];
      const theta = (gx * COS30 + gy * 0.5) * K_SWELL + phase;
      const cross = (gx * COS30 - gy * 0.5) * K_CROSS - phase * 0.8 + 1.7;
      let h = a * (0.72 * Math.sin(theta) + 0.28 * Math.sin(cross)) * (0.72 + 0.28 * Math.sin(gy * K_ENVELOPE + phase * 0.35));
      if (withRipple) {
        const rx = gx - pointer.cx;
        const ry = (gy - pointer.cy) * ISO_DEPTH;
        const d2 = rx * rx + ry * ry;
        if (d2 < RIPPLE_CUTOFF2) {
          h += rippleAmp * Math.exp(-d2 * RIPPLE_INV_R2) * Math.sin(Math.sqrt(d2) * K_RIPPLE - pointer.phase);
        }
      }
      outX[i] = gx + a * 0.16 * Math.cos(theta);
      outY[i] = gy - h;
      outH[i] = h;
    }

    // Sort segments into height bands. Consecutive segments of a line that land
    // in the same band continue one polyline; a NaN marker lifts the pen.
    bandLength.fill(0);
    bandTail.fill(-1);
    for (let line = 0; line < starts.length - 1; line += 1) {
      const end = starts[line + 1] - 1;
      for (let i = starts[line]; i < end; i += 1) {
        const band = Math.min(
          BANDS.length - 1,
          Math.max(0, Math.round(REST_BAND + (outH[i] + outH[i + 1]) * 0.5 * bandScale))
        );
        const buffer = bands[band];
        let n = bandLength[band];
        if (bandTail[band] !== i) {
          buffer[n++] = Number.NaN;
          buffer[n++] = 0;
          buffer[n++] = outX[i];
          buffer[n++] = outY[i];
        }
        buffer[n++] = outX[i + 1];
        buffer[n++] = outY[i + 1];
        bandLength[band] = n;
        bandTail[band] = i + 1;
      }
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    for (let band = 0; band < BANDS.length; band += 1) {
      const n = bandLength[band];
      if (!n) continue;
      const buffer = bands[band];
      ctx.strokeStyle = BANDS[band];
      ctx.beginPath();
      let penUp = true;
      for (let j = 0; j < n; j += 2) {
        const px = buffer[j];
        if (Number.isNaN(px)) {
          penUp = true;
        } else if (penUp) {
          ctx.moveTo(px, buffer[j + 1]);
          penUp = false;
        } else {
          ctx.lineTo(px, buffer[j + 1]);
        }
      }
      ctx.stroke();
    }
  };

  const stop = () => {
    if (!running) return;
    running = false;
    gsap.ticker.remove(frame);
  };

  function frame(_time, deltaMs) {
    if (!geo) {
      stop();
      return;
    }
    const dt = Math.min(deltaMs / 1000, 0.05);
    const speed = Math.min(Math.abs(getScrollVelocity()), 120);
    phase += dt * (0.9 + speed * 0.045) * direction;

    if (pointer.energy > 0) {
      pointer.energy *= Math.exp(-1.8 * dt);
      if (pointer.energy < 0.003) pointer.energy = 0;
      pointer.phase += dt * 7.5;
      pointer.cx = damp(pointer.cx, pointer.x, 9, dt);
      pointer.cy = damp(pointer.cy, pointer.y, 9, dt);
    }

    const a = amplitude.value.a;
    if (Math.abs(a) < 0.05 && Math.abs(amplitude.velocity.a) < 0.05 && pointer.energy === 0) {
      drawFlat();
      stop();
      return;
    }
    drawWarped(a);
  }

  const wake = () => {
    if (!visible || running || !geo) return;
    running = true;
    gsap.ticker.add(frame);
  };

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    let nextDpr = Math.min(window.devicePixelRatio || 1, cfg.maxDpr);
    if (w * h * nextDpr * nextDpr > MAX_BACKING_PIXELS) nextDpr = Math.sqrt(MAX_BACKING_PIXELS / (w * h));
    const backingWidth = Math.round(w * nextDpr);
    const backingHeight = Math.round(h * nextDpr);
    if (w === width && h === height && canvas.width === backingWidth && canvas.height === backingHeight) return;

    width = w;
    height = h;
    dpr = nextDpr;
    canvas.width = backingWidth;
    canvas.height = backingHeight;
    geo = buildGeometry(w, h, cfg.cell, cfg.segment, margin);
    if (cfg.animate) {
      const count = geo.x.length;
      const segments = count - (geo.starts.length - 1);
      outX = new Float32Array(count);
      outY = new Float32Array(count);
      outH = new Float32Array(count);
      // Worst case per band: every segment starts a new polyline (marker + 2 points).
      bands = BANDS.map(() => new Float32Array(segments * 6));
    }
    if (!running) drawFlat();
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);

  if (!cfg.animate) {
    return {
      destroy() {
        resizeObserver.disconnect();
      },
    };
  }

  const onVelocity = (velocity) => {
    if (velocity) direction = velocity > 0 ? 1 : -1;
    if (!visible) return;
    amplitude.set({ a: Math.min(Math.abs(velocity) * cfg.gain, cfg.maxAmp) });
    wake();
  };
  const unsubscribe = subscribeScrollVelocity(onVelocity);

  const onPointerMove = (event) => {
    if (!visible || event.pointerType === 'touch') return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (pointer.inside) {
      pointer.energy = Math.min(1, pointer.energy + Math.hypot(x - pointer.x, y - pointer.y) * 0.002);
    } else {
      pointer.cx = x;
      pointer.cy = y;
      pointer.inside = true;
    }
    pointer.x = x;
    pointer.y = y;
    wake();
  };
  const onPointerLeave = () => {
    pointer.inside = false;
  };
  if (ripple) {
    pointerTarget.addEventListener('pointermove', onPointerMove, { passive: true });
    pointerTarget.addEventListener('pointerleave', onPointerLeave);
  }

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      visible = entries[entries.length - 1].isIntersecting;
      if (visible) {
        if (needsFlat) {
          needsFlat = false;
          drawFlat();
        }
        return;
      }
      // Offscreen: stop the loop and settle instantly, so it re-enters flat.
      stop();
      amplitude.jump({ a: 0 });
      pointer.energy = 0;
      pointer.inside = false;
      needsFlat = true;
    },
    { rootMargin: '120px 0px' }
  );
  intersectionObserver.observe(canvas);

  return {
    destroy() {
      stop();
      amplitude.stop();
      unsubscribe();
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      if (ripple) {
        pointerTarget.removeEventListener('pointermove', onPointerMove);
        pointerTarget.removeEventListener('pointerleave', onPointerLeave);
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
  };
}
