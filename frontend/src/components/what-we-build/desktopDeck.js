import { gsap, ScrollTrigger } from '../../lib/motion/gsap';
import { attachTilt, TILT_STYLE } from '../../lib/motion/useTilt';
import { scrollTo as smoothScrollTo } from '../../lib/motion/SmoothScroll';
import { deckTiming, activeAt, depthPose } from './deckTiming';
import { traceContour } from './contour';

const DOCK_GAP = 40; // px between the heading and card 01 while it waits to dock
const WAIT_MARGIN = 80; // px past the stage floor, so a waiting card's twisted corners stay hidden
const TILT_MAX = 8;
const CURSOR_LABEL = 'EXPLORE';
const pad = (value) => String(value).padStart(2, '0');

/**
 * Desktop (1024px and up, motion allowed): a pinned 300vh deck on a 1400px
 * perspective stage.
 *
 *   dock   The heading lifts and blurs away while card 01 swings upright onto
 *          centre stage and its 1px contour traces around it.
 *   enter  Each following card slides up from beneath the rail, untwisting
 *          from rotateZ -2deg, while every card already on the deck sinks one
 *          sheet deeper: scale 0.88, y -40px, brightness 0.3 (then 0.76,
 *          -72px, 0.15), leaving their top edges stacked like glass plates.
 *   front  Only the active card takes the pointer: spring tilt and a cursor
 *          spotlight on its inner face plus the EXPLORE cursor label, and its
 *          modules boot up the first time it arrives. The rail scrambles to
 *          the new index; rail buttons and keyboard focus jump the deck.
 *
 * Tweens and triggers belong to the matchMedia context; the returned teardown
 * removes the listeners, observers, attributes and styles the context cannot.
 *
 * @returns {() => void} teardown
 */
export function buildDesktopDeck(els, context) {
  const { section, stage, header, area, deck, rail, railIndex, railLabel, railFill, railButtons } = els;
  const { cards, faces, contours, modules, outcomes } = els;
  const timing = deckTiming(cards.length);
  const tags = cards.map((card) => card.getAttribute('data-wwb-card') || '');

  // Switch the section from the static list to the stacked stage (whatWeBuild.css).
  section.dataset.deck = '3d';

  // Tilt styling on the inner faces only; GSAP owns the outer card transforms.
  // transform-style stays flat: nothing inside a face is 3D, and flattening
  // keeps the module boot-up tweens out of a 3D sorting context.
  const faceStyles = faces.map((face) => face.getAttribute('style'));
  faces.forEach((face) => Object.assign(face.style, TILT_STYLE, { transformStyle: 'flat' }));

  // Fit the deck inside short viewports; re-measured before every refresh.
  let fit = 1;
  const updateFit = () => {
    const styles = window.getComputedStyle(area);
    const room = area.clientHeight - parseFloat(styles.paddingTop) - parseFloat(styles.paddingBottom);
    const natural = deck.offsetHeight;
    fit = room > 0 && natural > room ? room / natural : 1;
    deck.style.setProperty('--wwb-fit', fit.toFixed(4));
  };
  updateFit();
  ScrollTrigger.addEventListener('refreshInit', updateFit);

  // Stage-space measurements. offsetTop and offsetHeight ignore transforms, so
  // they stay correct when a refresh re-evaluates them mid-animation.
  const deckTop = () => deck.offsetTop + (deck.offsetHeight * (1 - fit)) / 2;
  const dockOffset = () => Math.max(0, (header.offsetTop + header.offsetHeight + DOCK_GAP - deckTop()) / fit);
  const waitOffset = () => (stage.clientHeight - deckTop()) / fit + WAIT_MARGIN;

  // ----- Front card state --------------------------------------------------
  let active = -1;
  const booted = cards.map((_, i) => i === 0);
  const bootTargets = cards.map((_, i) => [...outcomes[i], ...modules[i]]);
  // Cards 02+ arrive with their modules powered down and boot on first arrival.
  bootTargets.slice(1).forEach((targets) => {
    if (targets.length) gsap.set(targets, { autoAlpha: 0.15, x: 12 });
  });

  const boot = (i) => {
    booted[i] = true;
    if (!bootTargets[i].length) return;
    gsap.to(bootTargets[i], {
      autoAlpha: 1,
      x: 0,
      duration: 0.6,
      ease: 'lumi.out',
      stagger: 0.05,
      overwrite: 'auto',
      clearProps: 'opacity,visibility,transform',
    });
  };

  const announce = (i) => {
    if (railIndex) {
      gsap.to(railIndex, {
        duration: 0.5,
        ease: 'none',
        overwrite: true,
        scrambleText: { text: pad(i + 1), chars: '0123456789', speed: 0.7 },
      });
    }
    if (railLabel) {
      gsap.to(railLabel, {
        duration: 0.8,
        ease: 'none',
        overwrite: true,
        scrambleText: { text: tags[i], chars: 'upperCase', speed: 0.5 },
      });
    }
  };

  const setActive = (next) => {
    if (next === active) return;
    const previous = active;
    active = next;
    cards.forEach((card, i) => card.toggleAttribute('data-active', i === next));
    faces.forEach((face, i) => {
      if (i === next) face.setAttribute('data-cursor-label', CURSOR_LABEL);
      else face.removeAttribute('data-cursor-label');
    });
    railButtons.forEach((button, i) => button.setAttribute('aria-current', i === next ? 'true' : 'false'));
    if (previous >= 0) {
      // The old front card stops receiving pointer events, so relax its tilt spring explicitly.
      cards[previous].dispatchEvent(new PointerEvent('pointerleave'));
      announce(next);
    }
    if (!booted[next]) boot(next);
  };
  setActive(0);

  // ----- Scroll timeline ---------------------------------------------------
  // The active card follows the rendered timeline rather than raw scroll, so
  // it is always the card on screen while the scrub catches up. A refresh
  // briefly renders the reverted state; skip those frames and resync after.
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    onUpdate() {
      if (!ScrollTrigger.isRefreshing) setActive(activeAt(timing, this.time()));
    },
    scrollTrigger: {
      trigger: stage,
      start: 'top top',
      end: `+=${Math.round(timing.total * 100)}%`,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      scrub: 1,
      onRefresh: (self) => setActive(activeAt(timing, self.animation ? self.animation.time() : 0)),
    },
  });

  const trace = (i, at, duration) => {
    if (!contours[i]) return;
    const [from, to] = traceContour(contours[i]);
    tl.fromTo(contours[i], from, { ...to, duration, ease: 'power1.inOut' }, at);
  };

  // Dock: the heading lifts away while card 01 swings upright onto the stage.
  tl.fromTo(
    header,
    { y: 0, autoAlpha: 1, filter: 'blur(0px)' },
    { y: -90, autoAlpha: 0, filter: 'blur(8px)', duration: timing.dock * 0.7, ease: 'power1.in' },
    0
  );
  tl.fromTo(
    cards[0],
    { y: dockOffset, rotateX: 10, rotateZ: 0, scale: 1, filter: 'brightness(0.7)' },
    { ...depthPose(0), duration: timing.dock, ease: 'power2.out' },
    0
  );
  trace(0, timing.dock * 0.1, timing.dock * 0.9);
  tl.fromTo(rail, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: timing.dock * 0.5, ease: 'power1.out' }, timing.dock * 0.45);
  tl.fromTo(railFill, { scaleX: 0 }, { scaleX: 1, duration: timing.total }, 0);

  for (let i = 1; i < cards.length; i += 1) {
    const at = timing.enter[i];
    // The incoming sheet slides up from beneath the rail, untwisting as it lands.
    tl.fromTo(
      cards[i],
      { y: waitOffset, rotateX: 8, rotateZ: -2, scale: 1, filter: 'brightness(1)' },
      { ...depthPose(0), duration: timing.move, ease: 'power2.out' },
      at
    );
    trace(i, at + timing.move * 0.2, timing.move * 0.8);
    // Every sheet already on the deck sinks one level deeper. Later tweens on
    // the same card must not render immediately, or they would clobber the
    // card's starting pose when the timeline is built or refreshed.
    for (let j = 0; j < i; j += 1) {
      tl.fromTo(
        cards[j],
        depthPose(i - 1 - j),
        { ...depthPose(i - j), duration: timing.move, ease: 'power2.inOut', immediateRender: false },
        at
      );
    }
  }
  timing.rest.forEach((time, i) => {
    tl.addLabel(`card-${i}`, time);
  });

  // ----- Navigation ---------------------------------------------------------
  const goTo = (i, options) => {
    const trigger = tl.scrollTrigger;
    if (trigger) smoothScrollTo(trigger.labelToScroll(`card-${i}`), options);
  };
  const onRailClick = (event) => {
    const i = Number(event.currentTarget.getAttribute('data-wwb-goto'));
    if (Number.isInteger(i)) goTo(i, { duration: 1.2 });
  };
  // Keyboard focus landing in a card that is not in front brings it forward.
  const onFocusIn = (event) => {
    const card = event.target instanceof Element ? event.target.closest('[data-wwb-card]') : null;
    const i = card ? cards.indexOf(card) : -1;
    if (i >= 0 && i !== active) goTo(i, { immediate: true });
  };

  // ----- Pointer: tilt, spotlight and cursor label (front card only) -------
  // Inactive cards have pointer-events: none (whatWeBuild.css), so only the
  // front card's spring ever receives pointer input.
  const untilt = faces.map((face, i) => attachTilt(face, { max: TILT_MAX, bounds: cards[i] }));

  // The cursor resolves labels before magnets, so the EXPLORE label is lifted
  // while the pointer is over the magnetic CTA, which keeps its magnetic snap.
  const onFaceOver = (event) => {
    const face = event.currentTarget;
    const overMagnet = event.target instanceof Element && event.target.closest('[data-magnetic]');
    if (faces.indexOf(face) === active && !overMagnet) face.setAttribute('data-cursor-label', CURSOR_LABEL);
    else face.removeAttribute('data-cursor-label');
  };

  // Late layout changes (fonts settling) move the measured offsets: re-measure.
  let refreshTimer = 0;
  const observer = new ResizeObserver(() => {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 160);
  });
  observer.observe(deck);
  observer.observe(header);

  deck.addEventListener('focusin', onFocusIn);
  railButtons.forEach((button) => button.addEventListener('click', onRailClick));
  faces.forEach((face) => face.addEventListener('pointerover', onFaceOver));

  return () => {
    ScrollTrigger.removeEventListener('refreshInit', updateFit);
    observer.disconnect();
    window.clearTimeout(refreshTimer);
    deck.removeEventListener('focusin', onFocusIn);
    railButtons.forEach((button) => {
      button.removeEventListener('click', onRailClick);
      button.removeAttribute('aria-current');
    });
    faces.forEach((face) => face.removeEventListener('pointerover', onFaceOver));
    untilt.forEach((cleanup) => cleanup());

    // Tweens started from callbacks live outside the context: stop them, then
    // restore what they wrote.
    gsap.killTweensOf([railIndex, railLabel, ...bootTargets.flat()].filter(Boolean));
    if (railIndex) railIndex.textContent = pad(1);
    if (railLabel) railLabel.textContent = tags[0];

    faces.forEach((face, i) => {
      face.removeAttribute('data-cursor-label');
      if (faceStyles[i] === null) face.removeAttribute('style');
      else face.setAttribute('style', faceStyles[i]);
    });
    cards.forEach((card) => card.removeAttribute('data-active'));
    deck.style.removeProperty('--wwb-fit');
    delete section.dataset.deck;
    // `context` owns the timeline, pin, sets and reveals; it reverts them itself.
    void context;
  };
}
