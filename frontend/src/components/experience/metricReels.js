import { gsap, ScrollTrigger } from '../../lib/motion/gsap';
import { LOCK_EASE, planReel, reelLayout, reelTravel, smoothstep, stripTransform } from './reelMath';

/**
 * Slot-machine choreography for the impact counters.
 *
 * Every digit is a vertical reel (see MetricCard). A reel spins up, cruises at
 * high speed with a motion-blur lens (y-stretch, blur and a slight fade that
 * scale with its actual speed), brakes and hands over to an elastic lock at
 * matching speed. Reels lock left to right, then the "+" pops in and the card's
 * lamp lights. Counters roll when they enter from above and re-arm once they
 * are fully below the viewport again, so they replay on the next entry.
 *
 * Times in seconds; blur in em so it scales with the responsive type size.
 */
const BRANCHES = {
  desktop: {
    digitStagger: 0.06, // spin-up offset between the digits of one number
    lockAt: 0.95, // when the first digit starts its elastic lock
    lockStagger: 0.17, // later digits lock later: left to right, like a slot machine
    lockRows: 2, // rows covered by the elastic lock
    lockTime: 0.95,
    metricStagger: 0.2, // offset between the four counters
    blur: 0.06,
    stretch: 0.16,
    fade: 0.28,
    start: 'top 78%',
  },
  mobile: {
    digitStagger: 0.05,
    lockAt: 0.7,
    lockStagger: 0.14,
    lockRows: 1.6,
    lockTime: 0.8,
    blur: 0.035,
    stretch: 0.1,
    fade: 0.2,
    start: 'top 86%',
  },
};

function createReel(el, branch) {
  const digit = Number(el.dataset.digit);
  const index = Number(el.dataset.index);
  const { finalRow, rows } = reelLayout(digit, index);
  const startRow = finalRow - reelTravel(digit, index, branch);
  return {
    index,
    rows,
    finalRow,
    startRow,
    travel: finalRow - startRow,
    strip: el.querySelector('[data-reel-strip]'),
    lens: el.querySelector('[data-reel-lens]'),
    state: { row: startRow },
    lastRow: startRow,
    blurred: false,
  };
}

/** Write one reel to the DOM. `speed` is in rows per second (0 = sharp, at rest). */
function drawReel(reel, speed, cfg) {
  reel.strip.style.transform = stripTransform(reel.state.row, reel.rows);
  reel.lastRow = reel.state.row;
  const { lens } = reel;
  if (speed < 1) {
    if (reel.blurred) {
      lens.style.transform = '';
      lens.style.filter = '';
      lens.style.opacity = '';
      reel.blurred = false;
    }
    return;
  }
  const blur = cfg.blur * smoothstep(8, 40, speed);
  lens.style.transform = `scale3d(1, ${(1 + cfg.stretch * smoothstep(6, 40, speed)).toFixed(4)}, 1)`;
  lens.style.filter = blur > 0.002 ? `blur(${blur.toFixed(4)}em)` : '';
  lens.style.opacity = (1 - cfg.fade * smoothstep(12, 44, speed)).toFixed(3);
  reel.blurred = true;
}

/**
 * Build the roll timeline for one card.
 * @param {boolean} nested true when a parent timeline plays it (desktop), false when it plays alone.
 */
function buildCounter(card, branch, cfg, nested) {
  const reels = gsap.utils.toArray('[data-reel]', card).map((el) => createReel(el, branch));
  const suffix = card.querySelector('[data-reel-suffix]');
  const lamp = card.querySelector('[data-reel-lamp]');
  const meter = card.querySelector('[data-reel-meter]');
  let lastTime = 0;

  const timeline = gsap.timeline({ paused: !nested, onUpdate: () => render(false) });

  // Speed comes from the finite difference of each reel's row over timeline
  // time, so the blur follows the real motion, including the elastic bounce.
  function render(still) {
    const time = timeline.time();
    const dt = time - lastTime;
    lastTime = time;
    const moving = !still && dt > 0 && timeline.isActive();
    reels.forEach((reel) => drawReel(reel, moving ? Math.abs(reel.state.row - reel.lastRow) / dt : 0, cfg));
  }

  let landAt = 0;
  reels.forEach((reel) => {
    const start = reel.index * cfg.digitStagger;
    const lockAt = cfg.lockAt + reel.index * cfg.lockStagger;
    const spinTime = lockAt - start;
    const { spinRows, spinEase } = planReel({
      travel: reel.travel,
      spinTime,
      lockRows: cfg.lockRows,
      lockTime: cfg.lockTime,
    });
    timeline
      .to(reel.state, { row: reel.startRow + spinRows, duration: spinTime, ease: spinEase }, start)
      .fromTo(
        reel.state,
        { row: reel.startRow + spinRows },
        { row: reel.finalRow, duration: cfg.lockTime, ease: LOCK_EASE, immediateRender: false },
        lockAt
      );
    // elastic.out first reaches its end value about 12% into the ease.
    landAt = Math.max(landAt, lockAt + cfg.lockTime * 0.12);
  });

  timeline
    .fromTo(meter, { scaleX: 0 }, { scaleX: 1, duration: landAt, ease: 'power1.inOut' }, 0)
    .fromTo(lamp, { opacity: 0.25, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(3)' }, landAt)
    .fromTo(
      suffix,
      { autoAlpha: 0, yPercent: 40, scale: 0.55 },
      { autoAlpha: 1, yPercent: 0, scale: 1, duration: 0.55, ease: 'back.out(2.2)' },
      landAt
    );

  // Arm: show the reels on their start rows ("0" / "00").
  render(true);

  return {
    timeline,
    sync: () => render(true),
    /** Put every reel back on its final digit with no effects (the server-rendered state). */
    restore: () => {
      reels.forEach((reel) => {
        reel.state.row = reel.finalRow;
        reel.blurred = true;
        drawReel(reel, 0, cfg);
      });
    },
  };
}

/**
 * Play `timeline` when `trigger` enters from above. If the visitor jumped
 * straight past it (a fast fling, a restored scroll position), show the result
 * instead of spinning offscreen. onRefresh covers the case where the page is
 * already past the start when the triggers are measured, which fires no onEnter.
 */
function bindReveal(trigger, cfg, { entrance, timeline, sync }) {
  let played = false;

  const reveal = () => {
    if (played) return;
    played = true;
    if (trigger.getBoundingClientRect().bottom <= 0) {
      entrance.progress(1);
      timeline.progress(1).pause();
      sync();
      return;
    }
    entrance.play();
    timeline.play(0);
  };

  ScrollTrigger.create({
    trigger,
    start: cfg.start,
    onEnter: reveal,
    onRefresh: (self) => {
      if (self.progress > 0) reveal();
    },
  });

  // Re-arm once the counters are completely below the viewport again.
  ScrollTrigger.create({
    trigger,
    start: 'top bottom',
    onLeaveBack: () => {
      played = false;
      timeline.pause(0);
      sync();
    },
  });
}

/**
 * Wire the counters inside `list` for the 'desktop' or 'mobile' branch. Call
 * inside a gsap.matchMedia / gsap.context callback so tweens and triggers are
 * reverted with it; the returned cleanup restores the reels' inline styles.
 *
 * desktop: one trigger for the whole row; cards flip down into place like
 *          split-flap panels while the four counters roll in sequence.
 * mobile:  each card reveals and rolls on its own as it scrolls into view.
 *
 * @param {HTMLElement} list element containing the [data-metric] cards
 * @param {'desktop' | 'mobile'} branch
 * @returns {() => void} cleanup
 */
export function setupMetricReels(list, branch) {
  const cfg = BRANCHES[branch];
  const cards = gsap.utils.toArray('[data-metric]', list);
  const nested = branch === 'desktop';
  const counters = cards.map((card) => buildCounter(card, branch, cfg, nested));

  if (nested) {
    const master = gsap.timeline({ paused: true });
    counters.forEach((counter, i) => master.add(counter.timeline, i * cfg.metricStagger));
    const entrance = gsap.fromTo(
      cards,
      { autoAlpha: 0, yPercent: 10, rotationX: -28, transformPerspective: 1100, transformOrigin: '50% 0%' },
      {
        autoAlpha: 1,
        yPercent: 0,
        rotationX: 0,
        duration: 1.1,
        ease: 'lumi.out',
        stagger: 0.09,
        clearProps: 'transform',
        paused: true,
      }
    );
    bindReveal(list, cfg, {
      entrance,
      timeline: master,
      sync: () => counters.forEach((counter) => counter.sync()),
    });
  } else {
    counters.forEach((counter, i) => {
      const entrance = gsap.fromTo(
        cards[i],
        { autoAlpha: 0, y: 28 },
        { autoAlpha: 1, y: 0, duration: 0.8, ease: 'lumi.out', paused: true }
      );
      bindReveal(cards[i], cfg, { entrance, timeline: counter.timeline, sync: counter.sync });
    });
  }

  return () => counters.forEach((counter) => counter.restore());
}
