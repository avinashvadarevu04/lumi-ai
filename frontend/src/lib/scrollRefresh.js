import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Mobile browsers resize the viewport as their address bar hides and shows.
 * Left alone that fires a refresh mid-scroll, which visibly snaps pinned and
 * scrubbed elements. Ignoring the resize keeps scrolling smooth on phones.
 */
ScrollTrigger.config({ ignoreMobileResize: true });

/**
 * ScrollTrigger measures every start/end once, at creation. Any measurement
 * taken while the intro overlay holds `overflow: hidden` on the body is taken
 * against a page with no scrollable height, so those triggers are pinned to
 * 0 and never fire again.
 *
 * A single timed refresh is not enough: fonts, the 3D canvases and lazily
 * measured layout all settle at different moments. This schedules a short
 * series of refreshes and hooks the events that change document height, which
 * is cheap (a refresh is a measurement pass, not a render) and removes the
 * race entirely.
 *
 * @returns {() => void} cleanup
 */
export function scheduleScrollRefresh() {
  const timers = [];
  let disposed = false;

  // Sections create their triggers in different lifecycle phases, so sort
  // them by page position first: pinned sections must be measured top-down.
  const refresh = () => {
    if (disposed) return;
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  };

  // Two frames so React has committed and the browser has laid out.
  requestAnimationFrame(() => requestAnimationFrame(refresh));

  // Catch-up passes for anything that settles late.
  [120, 400, 1000].forEach((delay) => {
    timers.push(window.setTimeout(refresh, delay));
  });

  if (document.fonts?.ready) {
    document.fonts.ready.then(refresh).catch(() => {});
  }
  window.addEventListener('load', refresh);

  return () => {
    disposed = true;
    timers.forEach((t) => window.clearTimeout(t));
    window.removeEventListener('load', refresh);
  };
}

export default scheduleScrollRefresh;
