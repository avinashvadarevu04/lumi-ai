import React, { useEffect, useRef } from 'react';

/**
 * Stroke stack for the light beam. `dash` is the lit length as a fraction of
 * the perimeter (every rect has pathLength=1). The motion hook aligns all heads,
 * so the long faint tail, the mid segment and the short bright head read as one
 * comet, with the blurred glow stroke riding on the head.
 */
const GLOW = { dash: 0.14, width: 5, opacity: 0.55 };
const CRISP = [
  { dash: 0.34, width: 1, opacity: 0.22 },
  { dash: 0.18, width: 1, opacity: 0.45 },
  { dash: 0.08, width: 1.5, opacity: 1 },
];

function Stroke({ dash, width, opacity }) {
  return (
    <rect
      data-dash={dash}
      x="0.5"
      y="0.5"
      width="0"
      height="0"
      pathLength="1"
      fill="none"
      stroke="#ffffff"
      strokeOpacity={opacity}
      strokeWidth={width}
      strokeLinecap="round"
      strokeDasharray={`${dash} ${1 - dash}`}
      strokeDashoffset={dash}
    />
  );
}

/**
 * Decorative light beam that travels the card's perimeter. The rects are sized
 * in px to the card's border box (layout size, so tilt and landing transforms
 * never distort them) and follow its corner radius; the section's motion hook
 * fades the overlay in and animates stroke-dashoffset.
 */
export default function BorderBeam() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const host = root?.parentElement;
    if (!root || !host) return undefined;
    const rects = root.querySelectorAll('rect');

    const fit = () => {
      const width = Math.max(host.offsetWidth - 1, 0);
      const height = Math.max(host.offsetHeight - 1, 0);
      const radius = Math.max((parseFloat(getComputedStyle(host).borderTopLeftRadius) || 0) - 0.5, 0);
      rects.forEach((rect) => {
        rect.setAttribute('width', width);
        rect.setAttribute('height', height);
        rect.setAttribute('rx', radius);
      });
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(host, { box: 'border-box' });
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} data-wl-beam="" className="wl-beam" aria-hidden="true">
      <svg className="wl-beam__layer wl-beam__layer--glow" focusable="false">
        <Stroke {...GLOW} />
      </svg>
      <svg className="wl-beam__layer" focusable="false">
        {CRISP.map((stroke) => (
          <Stroke key={stroke.dash} {...stroke} />
        ))}
      </svg>
    </div>
  );
}
