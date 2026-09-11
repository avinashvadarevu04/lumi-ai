import React, { useEffect, useRef, useState } from 'react';

/**
 * Hero robot — the Lumi robot Spline scene (shipped in `lumi-robot-3d/`),
 * rendered with @splinetool/runtime into a canvas this component owns. The
 * robot turning its head and body toward the pointer is built into the scene.
 *
 * Loading policy follows the `SplineScene` component the scene came with:
 *   - skipped entirely for reduced-motion, Save-Data, low-core or offline
 *     visitors, who get the static orb instead;
 *   - otherwise started the first time the hero is actually visible, i.e.
 *     after the intro, so parsing the 1.3 MB scene never competes with the
 *     intro animation for the main thread;
 *   - the orb doubles as the loading placeholder and as the fallback if the
 *     scene fails or exceeds the guard window.
 *
 * The scene is created once and survives "Replay intro"; it is torn down only
 * when the component unmounts.
 */

const SCENE_URL = (
  import.meta.env.VITE_SPLINE_SCENE_URL || 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode'
).trim();

/** Give up on the scene after this long and keep the orb. */
const GUARD_MS = 25000;

function shouldSkipScene() {
  if (typeof window === 'undefined') return true;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = Boolean(navigator.connection?.saveData);
  const lowPower = (navigator.hardwareConcurrency || 2) < 4;
  const offline = navigator.onLine === false;
  return reducedMotion || saveData || lowPower || offline;
}

/** Placeholder and fallback, carried over from the scene's original card. */
function RobotOrb() {
  return (
    <div className="flex h-full w-full items-center justify-center" aria-hidden="true">
      <div className="h-40 w-40 rounded-full border border-white/20 bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.2),rgba(255,255,255,0.03)_48%,transparent_70%)] shadow-[0_0_80px_rgba(255,255,255,0.12)]" />
    </div>
  );
}

export default function RobotStage({ active = true }) {
  const mountRef = useRef(null);
  /** The live load: { app, canvas, guard, cancelled }. */
  const runRef = useRef(null);
  const [skipped] = useState(shouldSkipScene);
  const [status, setStatus] = useState(skipped ? 'skipped' : 'idle'); // idle | loading | ready | failed | skipped

  // Tear down on unmount only, so the scene survives intro replays. Under
  // StrictMode this also runs between the simulated unmount and remount, and
  // the next start then builds a fresh canvas rather than reusing a context
  // the runtime has already disposed.
  useEffect(
    () => () => {
      const run = runRef.current;
      runRef.current = null;
      if (!run) return;
      run.cancelled = true;
      window.clearTimeout(run.guard);
      try {
        run.app?.dispose?.();
      } catch {
        /* runtime already torn down */
      }
      run.canvas.remove();
    },
    []
  );

  // Start once, the first time the hero is visible.
  useEffect(() => {
    if (skipped || !active || runRef.current) return;
    const mount = mountRef.current;
    if (!mount) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'block h-full w-full outline-none';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Lumi robot: an interactive 3D model that turns to follow your pointer');
    mount.appendChild(canvas);

    const run = { app: null, canvas, guard: 0, cancelled: false };
    runRef.current = run;
    setStatus('loading');

    run.guard = window.setTimeout(() => {
      if (!run.cancelled) setStatus((s) => (s === 'ready' ? s : 'failed'));
    }, GUARD_MS);

    import('@splinetool/runtime')
      .then(({ Application }) => {
        if (run.cancelled) return null;
        run.app = new Application(canvas);
        return run.app.load(SCENE_URL);
      })
      .then(() => {
        if (run.cancelled) return;
        window.clearTimeout(run.guard);
        setStatus('ready');
      })
      .catch((error) => {
        if (run.cancelled) return;
        window.clearTimeout(run.guard);
        if (import.meta.env.DEV) console.warn('[RobotStage] scene failed to load:', error);
        setStatus('failed');
      });
  }, [active, skipped]);

  const ready = status === 'ready';

  return (
    <div className="relative h-full w-full">
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${ready ? 'opacity-0' : 'opacity-100'}`}
      >
        <RobotOrb />
      </div>
      <div
        ref={mountRef}
        data-robot-status={status}
        className={`absolute inset-0 transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}
