import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * CircularCarousel — a wrap-around coverflow. The active card sits front and
 * centre; neighbours step back symmetrically on both sides with a subtle
 * perspective tilt and fade toward the edges. Controlled (`activeIndex` +
 * `onActiveChange`) or uncontrolled. Monochrome, ported to JSX.
 *
 * @typedef {{ id: string, title: string, description: string, tag?: string }} CarouselItem
 */

const CARD_W = 192; // w-48
const CARD_H = 128; // h-32
const VISIBLE_EACH_SIDE = 2;
const STEP = 0.66; // horizontal step as a fraction of card width
const EASE = [0.22, 1, 0.36, 1];

function getItemPosition(index, activeIndex, total, s) {
  let offset = index - activeIndex;
  const half = Math.floor(total / 2);
  if (offset > half) offset -= total;
  if (offset < -half) offset += total;

  const d = Math.abs(offset);
  const hidden = d > VISIBLE_EACH_SIDE;
  const sign = Math.sign(offset);

  const x = sign * CARD_W * (STEP * d + 0.05 * d * d) * s;
  const scale = Math.max(0.6, 1 - d * 0.14) * s;
  const opacity = hidden ? 0 : d === 0 ? 1 : d === 1 ? 0.6 : 0.32;
  const rotateY = -sign * Math.min(d, 2) * 9;
  const zIndex = 10 - d;

  return { x, scale, opacity, rotateY, zIndex, d, hidden };
}

export function CircularCarousel({
  items,
  activeIndex: controlledIndex,
  onActiveChange,
  autoPlay = true,
  autoPlayInterval = 4000,
  className,
}) {
  const [internalIndex, setInternalIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [scaleFactor, setScaleFactor] = useState(1);
  const containerRef = useRef(null);
  const trackRef = useRef(null);

  const activeIndex = controlledIndex ?? internalIndex;
  const total = items.length;

  // Responsive: shrink cards + spacing on narrow containers
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setScaleFactor(Math.min(1, Math.max(0.62, w / 520)));
    });
    ro.observe(track);
    return () => ro.disconnect();
  }, []);

  const goTo = useCallback(
    (index) => {
      const newIndex = ((index % total) + total) % total;
      if (controlledIndex === undefined) setInternalIndex(newIndex);
      onActiveChange?.(newIndex);
    },
    [total, controlledIndex, onActiveChange]
  );
  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (!autoPlay || isHovered || isFocused || total < 2) return undefined;
    const id = window.setInterval(next, autoPlayInterval);
    return () => window.clearInterval(id);
  }, [autoPlay, autoPlayInterval, isHovered, isFocused, next, total]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const handler = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        next();
      }
    };
    el.addEventListener('keydown', handler);
    return () => el.removeEventListener('keydown', handler);
  }, [next, prev]);

  const positions = useMemo(
    () => items.map((_, i) => getItemPosition(i, activeIndex, total, scaleFactor)),
    [items, activeIndex, total, scaleFactor]
  );
  const trackHeight = Math.round((CARD_H + 56) * scaleFactor);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label="Circular carousel"
      aria-roledescription="carousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={cn('relative flex w-full flex-col items-center gap-6 outline-none', className)}
    >
      {/* Track — edge-faded, 3D perspective */}
      <div
        ref={trackRef}
        className="relative w-full [mask-image:linear-gradient(90deg,transparent,#000_14%,#000_86%,transparent)]"
        style={{ height: trackHeight, perspective: 1100 }}
      >
        {/* soft stage glow under the active card */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.06] blur-3xl"
        />
        {/* baseline */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-[10%] bottom-2 h-px bg-white/10" />

        {items.map((item, i) => {
          const pos = positions[i];
          const isActive = i === activeIndex;
          return (
            <motion.button
              key={item.id}
              type="button"
              initial={false}
              animate={{ x: pos.x, scale: pos.scale, opacity: pos.opacity, rotateY: pos.rotateY, zIndex: pos.zIndex }}
              transition={{ duration: 0.7, ease: EASE }}
              onClick={() => goTo(i)}
              aria-label={item.title}
              aria-selected={isActive}
              aria-hidden={pos.hidden}
              tabIndex={pos.hidden ? -1 : 0}
              role="option"
              className={cn(
                'absolute flex h-32 w-48 cursor-pointer flex-col items-start justify-between rounded-2xl border p-4 text-left transition-[box-shadow,border-color,background-color,color] duration-300',
                pos.hidden && 'pointer-events-none',
                isActive
                  ? 'border-white bg-white text-black shadow-[0_28px_70px_-20px_rgba(255,255,255,0.28)]'
                  : 'border-white/10 bg-ink-700 text-white shadow-[0_16px_40px_-12px_rgba(0,0,0,0.8)] hover:border-white/35'
              )}
              style={{
                left: `calc(50% - ${CARD_W / 2}px)`,
                top: `calc(50% - ${CARD_H / 2}px)`,
                transformOrigin: 'center center',
                transformStyle: 'preserve-3d',
              }}
            >
              {item.tag && (
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.18em]',
                    isActive ? 'bg-black/10 text-neutral-700' : 'bg-white/10 text-white/70'
                  )}
                >
                  {item.tag}
                </span>
              )}
              <div className="w-full">
                <h3 className={cn('font-display font-semibold leading-tight', isActive ? 'text-base text-black' : 'text-sm text-white/85')}>
                  {item.title}
                </h3>
                <p className={cn('mt-1 line-clamp-2 text-xs leading-relaxed', isActive ? 'text-neutral-600' : 'text-white/45')}>
                  {item.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Counter + controls */}
      <div className="flex w-full flex-col items-center gap-3">
        <div className="flex items-baseline gap-1.5 font-mono">
          <span className="font-display text-lg font-bold tracking-tight text-white">{String(activeIndex + 1).padStart(2, '0')}</span>
          <span className="text-[10px] tracking-[0.25em] text-neutral-500">/ {String(total).padStart(2, '0')}</span>
        </div>

        <div className="flex items-center gap-4">
          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={prev}
            aria-label="Previous item"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-colors hover:bg-white hover:text-black focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <ChevronLeft className="h-5 w-5" />
          </motion.button>

          <div className="flex items-center gap-1.5" role="tablist">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={i === activeIndex}
                onClick={() => goTo(i)}
                className={cn(
                  'h-1.5 cursor-pointer rounded-full transition-all duration-300',
                  i === activeIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/20 hover:bg-white/50'
                )}
                aria-label={`Go to item ${i + 1}`}
              />
            ))}
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={next}
            aria-label="Next item"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-colors hover:bg-white hover:text-black focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <ChevronRight className="h-5 w-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default CircularCarousel;
