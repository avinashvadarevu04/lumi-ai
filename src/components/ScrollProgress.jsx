import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** 1px white progress hairline pinned to the top edge. */
export default function ScrollProgress() {
  const barRef = useRef(null);
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return undefined;
    const st = ScrollTrigger.create({
      start: 0,
      end: () => ScrollTrigger.maxScroll(window),
      onUpdate: (self) => {
        bar.style.transform = `scaleX(${self.progress})`;
      },
    });
    return () => st.kill();
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-px bg-transparent" aria-hidden="true">
      <div ref={barRef} className="h-full w-full origin-left bg-white" style={{ transform: 'scaleX(0)' }} />
    </div>
  );
}
