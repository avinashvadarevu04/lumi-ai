import { createContext, useContext, useId } from 'react';

/**
 * Drawing kit for the Selected Work schematics: engineering-drawing primitives
 * (nodes, data stores, wires, buses, dimension lines, rulers and a title block)
 * on a shared 960 x 560 sheet. Everything is black linework on white paper in
 * viewBox units, so each drawing stays crisp at any rendered size.
 */
const INK = '#000';
const PAPER = '#fff';
const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace";
const W = 960;
const H = 560;

/** Marker and pattern ids, unique per sheet so several sheets can share a page. */
const SheetIds = createContext({ arrow: '', arrowStart: '', grid: '', hatch: '' });
const useIds = () => useContext(SheetIds);

/** Mono text. `halo` paints a paper outline behind the glyphs so labels read over wires. */
export function T({ x, y, size = 8, weight = 400, anchor = 'start', o = 1, fill = INK, halo = false, rotate, spacing = 0.4, children }) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      fontWeight={weight}
      textAnchor={anchor}
      letterSpacing={spacing}
      fill={fill}
      fillOpacity={o}
      stroke={halo ? (fill === INK ? PAPER : INK) : 'none'}
      strokeWidth={halo ? 3 : undefined}
      strokeLinejoin={halo ? 'round' : undefined}
      paintOrder={halo ? 'stroke' : undefined}
      transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}
    >
      {children}
    </text>
  );
}

/** Service node. `solid` inverts it (black block, white type) to mark the system's core. */
export function Node({ x, y, w, h = 46, title, sub, meta, tag, solid = false, dashed = false }) {
  const fg = solid ? PAPER : INK;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={solid ? INK : PAPER} stroke={INK} strokeDasharray={dashed ? '4 3' : undefined} />
      <path d={`M${x + w - 9} ${y + h - 3} H${x + w - 3} V${y + h - 9}`} fill="none" stroke={fg} strokeOpacity={0.4} />
      {title && (
        <T x={x + 8} y={y + 16} size={10} weight={700} fill={fg}>
          {title}
        </T>
      )}
      {sub && (
        <T x={x + 8} y={y + 28} size={8} fill={fg} o={0.72}>
          {sub}
        </T>
      )}
      {meta && (
        <T x={x + 8} y={y + h - 6} size={7} fill={fg} o={0.55}>
          {meta}
        </T>
      )}
      {tag && (
        <T x={x + w - 6} y={y + 11} size={6.5} anchor="end" fill={fg} o={0.5}>
          {tag}
        </T>
      )}
    </g>
  );
}

/** Data store drawn as a cylinder. */
export function Store({ x, y, w, h = 60, title, sub }) {
  const rx = w / 2;
  const ry = Math.min(7, h / 7);
  const cx = x + rx;
  return (
    <g>
      <path d={`M${x} ${y + ry} V${y + h - ry} A${rx} ${ry} 0 0 0 ${x + w} ${y + h - ry} V${y + ry}`} fill={PAPER} stroke={INK} />
      <ellipse cx={cx} cy={y + ry} rx={rx} ry={ry} fill={PAPER} stroke={INK} />
      <path d={`M${x} ${y + ry + 6} A${rx} ${ry} 0 0 0 ${x + w} ${y + ry + 6}`} fill="none" stroke={INK} strokeOpacity={0.45} />
      {title && (
        <T x={cx} y={y + h / 2 + 7} size={9.5} weight={700} anchor="middle">
          {title}
        </T>
      )}
      {sub && (
        <T x={cx} y={y + h / 2 + 18} size={7.5} anchor="middle" o={0.7}>
          {sub}
        </T>
      )}
    </g>
  );
}

const startOf = (d) => {
  const match = /^M\s*(-?[\d.]+)[\s,]+(-?[\d.]+)/.exec(d);
  return match ? [Number(match[1]), Number(match[2])] : null;
};

/**
 * Connection. `arrow`: 'end' | 'both' | 'none'. `flow` marks a live data path:
 * its dashes march while the schematic is revealed (see selected-work.css).
 */
export function Wire({ d, arrow = 'end', dashed = false, flow = false, o = 1, w = 1, dot = true }) {
  const ids = useIds();
  const start = dot && arrow !== 'both' ? startOf(d) : null;
  let dash;
  if (flow) dash = '3 4';
  else if (dashed) dash = '4 3';
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={INK}
        strokeOpacity={o}
        strokeWidth={w}
        strokeDasharray={dash}
        className={flow ? 'sw-flow' : undefined}
        markerEnd={arrow === 'none' ? undefined : `url(#${ids.arrow})`}
        markerStart={arrow === 'both' ? `url(#${ids.arrowStart})` : undefined}
      />
      {start && <circle cx={start[0]} cy={start[1]} r={1.8} fill={INK} />}
    </g>
  );
}

/** Junction dot where wires split or merge. */
export function Dot({ x, y, r = 2.2 }) {
  return <circle cx={x} cy={y} r={r} fill={INK} />;
}

/** Horizontal message bus: twin rails, rung ticks and end caps. */
export function Bus({ x1, x2, y, label }) {
  const rungs = [];
  for (let x = x1 + 8; x < x2 - 4; x += 14) rungs.push(x);
  return (
    <g>
      <path d={`M${x1} ${y - 2} H${x2} M${x1} ${y + 2} H${x2}`} fill="none" stroke={INK} />
      <path d={rungs.map((x) => `M${x} ${y - 2} V${y + 2}`).join(' ')} fill="none" stroke={INK} strokeOpacity={0.45} />
      <rect x={x1 - 3} y={y - 5} width={3} height={10} fill={INK} />
      <rect x={x2} y={y - 5} width={3} height={10} fill={INK} />
      {label && (
        <T x={x1 + 4} y={y + 15} size={7} weight={600} o={0.75}>
          {label}
        </T>
      )}
    </g>
  );
}

/** Horizontal dimension line with architectural slash ticks and a centred label. */
export function DimH({ x1, x2, y, label, ext = 6 }) {
  return (
    <g>
      <path d={`M${x1} ${y - ext} V${y + ext} M${x2} ${y - ext} V${y + ext}`} fill="none" stroke={INK} strokeOpacity={0.55} />
      <path d={`M${x1} ${y} H${x2}`} fill="none" stroke={INK} />
      <path d={`M${x1 - 3} ${y + 3} L${x1 + 3} ${y - 3} M${x2 - 3} ${y + 3} L${x2 + 3} ${y - 3}`} fill="none" stroke={INK} strokeWidth={1.4} />
      {label && (
        <T x={(x1 + x2) / 2} y={y + 2.5} size={7.5} weight={700} anchor="middle" halo>
          {label}
        </T>
      )}
    </g>
  );
}

/** Vertical dimension line; the label runs along it. */
export function DimV({ x, y1, y2, label, ext = 6 }) {
  const mid = (y1 + y2) / 2;
  return (
    <g>
      <path d={`M${x - ext} ${y1} H${x + ext} M${x - ext} ${y2} H${x + ext}`} fill="none" stroke={INK} strokeOpacity={0.55} />
      <path d={`M${x} ${y1} V${y2}`} fill="none" stroke={INK} />
      <path d={`M${x - 3} ${y1 + 3} L${x + 3} ${y1 - 3} M${x - 3} ${y2 + 3} L${x + 3} ${y2 - 3}`} fill="none" stroke={INK} strokeWidth={1.4} />
      {label && (
        <T x={x + 2.5} y={mid} size={7.5} weight={700} anchor="middle" halo rotate={-90}>
          {label}
        </T>
      )}
    </g>
  );
}

/** Dashed boundary (a layer, a pool, a trust zone) with a black label tab. */
export function Zone({ x, y, w, h, label, hatch = false }) {
  const ids = useIds();
  const tab = label.length * 4.7 + 12;
  return (
    <g>
      {hatch && <rect x={x} y={y} width={w} height={h} fill={`url(#${ids.hatch})`} />}
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={INK} strokeDasharray="5 3" strokeOpacity={0.85} />
      <rect x={x} y={y} width={tab} height={11} fill={INK} />
      <T x={x + 6} y={y + 8} size={6.5} weight={700} fill={PAPER} spacing={0.8}>
        {label}
      </T>
    </g>
  );
}

/** Small pill label. */
export function Tag({ x, y, w, solid = false, children }) {
  const width = w ?? String(children).length * 4.6 + 10;
  return (
    <g>
      <rect x={x} y={y} width={width} height={12} rx={6} fill={solid ? INK : PAPER} stroke={INK} />
      <T x={x + width / 2} y={y + 8.5} size={6.5} weight={600} anchor="middle" fill={solid ? PAPER : INK}>
        {children}
      </T>
    </g>
  );
}

/** Numbered annotation. */
export function Note({ x, y, n, children }) {
  return (
    <g>
      <circle cx={x} cy={y - 2.5} r={5} fill={PAPER} stroke={INK} />
      <T x={x} y={y} size={6} weight={700} anchor="middle" spacing={0}>
        {n}
      </T>
      <T x={x + 10} y={y} size={7.5} o={0.8}>
        {children}
      </T>
    </g>
  );
}

/** Document glyph with a folded corner. */
export function Doc({ x, y, w = 22, h = 28, label }) {
  const fold = 6;
  const lines = [];
  for (let i = 0; i < 4; i += 1) lines.push(`M${x + 4} ${y + 10 + i * 4.5} H${x + w - 4 - (i % 2) * 5}`);
  return (
    <g>
      <path d={`M${x} ${y} H${x + w - fold} L${x + w} ${y + fold} V${y + h} H${x} Z`} fill={PAPER} stroke={INK} />
      <path d={`M${x + w - fold} ${y} V${y + fold} H${x + w}`} fill="none" stroke={INK} />
      <path d={lines.join(' ')} fill="none" stroke={INK} strokeOpacity={0.5} />
      {label && (
        <T x={x + w / 2} y={y + h + 9} size={6.5} weight={600} anchor="middle">
          {label}
        </T>
      )}
    </g>
  );
}

/** Handset glyph for mobile clients. */
export function Device({ x, y, w = 28, h = 48, label, sub }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={5} fill={PAPER} stroke={INK} />
      <path d={`M${x + w / 2 - 5} ${y + 4.5} H${x + w / 2 + 5}`} fill="none" stroke={INK} strokeWidth={1.4} />
      <rect x={x + 3} y={y + 8} width={w - 6} height={h - 16} fill="none" stroke={INK} strokeOpacity={0.4} />
      <path
        d={`M${x + 6} ${y + 14} H${x + w - 6} M${x + 6} ${y + 19} H${x + w - 10} M${x + 6} ${y + 24} H${x + w - 8}`}
        fill="none"
        stroke={INK}
        strokeOpacity={0.55}
      />
      {label && (
        <T x={x + w / 2} y={y + h + 11} size={7.5} weight={700} anchor="middle">
          {label}
        </T>
      )}
      {sub && (
        <T x={x + w / 2} y={y + h + 20} size={6.5} anchor="middle" o={0.6}>
          {sub}
        </T>
      )}
    </g>
  );
}

/** Slotted queue; the head of the queue (right side) is filled. */
export function Queue({ x, y, slots = 8, filled = 3, slot = 10, h = 12 }) {
  const cells = [];
  for (let i = 0; i < slots; i += 1) {
    cells.push(
      <rect
        key={i}
        x={x + i * slot}
        y={y}
        width={slot}
        height={h}
        fill={i >= slots - filled ? INK : PAPER}
        stroke={INK}
        strokeOpacity={0.8}
      />
    );
  }
  return <g>{cells}</g>;
}

/**
 * Stage strip derived from a workflow string ("A → B → C"): numbered boxes
 * joined by arrows. Scales itself down if the copy is longer than `maxW`.
 */
export function FlowStrip({ x, y, workflow, maxW = 600 }) {
  const ids = useIds();
  const stages = String(workflow || '')
    .split(/→|->/)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 6)
    .map((s) => (s.length > 18 ? `${s.slice(0, 17)}…` : s));
  if (!stages.length) return null;

  const gap = 20;
  const boxes = [];
  let cursor = 0;
  stages.forEach((label, i) => {
    const w = label.length * 5.1 + 26;
    boxes.push({ label, x: cursor, w, n: String(i + 1).padStart(2, '0') });
    cursor += w + gap;
  });
  const total = cursor - gap;
  const k = total > maxW ? maxW / total : 1;

  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      {boxes.map((b, i) => (
        <g key={b.n}>
          <rect x={b.x} y={0} width={b.w} height={16} fill={i === 0 ? INK : PAPER} stroke={INK} />
          <T x={b.x + 5} y={11} size={5.5} weight={700} fill={i === 0 ? PAPER : INK} o={0.6} spacing={0}>
            {b.n}
          </T>
          <T x={b.x + 16} y={11} size={7.5} weight={700} fill={i === 0 ? PAPER : INK} spacing={0.6}>
            {b.label}
          </T>
          {i < boxes.length - 1 && (
            <path d={`M${b.x + b.w + 3} 8 H${b.x + b.w + gap - 3}`} fill="none" stroke={INK} markerEnd={`url(#${ids.arrow})`} />
          )}
        </g>
      ))}
    </g>
  );
}

/** Legend for the line conventions used on every sheet. */
export function Legend({ x, y }) {
  const ids = useIds();
  return (
    <g>
      <T x={x} y={y} size={6} weight={700} o={0.6} spacing={0.8}>
        LEGEND
      </T>
      <path d={`M${x} ${y + 10} H${x + 22}`} fill="none" stroke={INK} markerEnd={`url(#${ids.arrow})`} />
      <T x={x + 30} y={y + 12.5} size={6.5}>
        SYNC CALL
      </T>
      <path d={`M${x} ${y + 22} H${x + 22}`} fill="none" stroke={INK} strokeDasharray="3 4" markerEnd={`url(#${ids.arrow})`} />
      <T x={x + 30} y={y + 24.5} size={6.5}>
        STREAM · EVENT
      </T>
      <rect x={x} y={y + 30} width={22} height={8} fill={INK} />
      <T x={x + 30} y={y + 37} size={6.5}>
        CORE SERVICE
      </T>
    </g>
  );
}

function Rulers() {
  const top = [];
  const left = [];
  for (let v = 0; v <= W - 60; v += 10) {
    const len = v % 100 === 0 ? 8 : v % 50 === 0 ? 5 : 3;
    top.push(`M${24 + v} 20 V${20 - len}`);
  }
  for (let v = 0; v <= H - 48; v += 10) {
    const len = v % 100 === 0 ? 8 : v % 50 === 0 ? 5 : 3;
    left.push(`M20 ${24 + v} H${20 - len}`);
  }
  const topLabels = [];
  for (let v = 100; v <= W - 100; v += 100) topLabels.push(v);
  const leftLabels = [];
  for (let v = 100; v <= H - 100; v += 100) leftLabels.push(v);
  return (
    <g>
      <path d={`M24 20 H${W - 24} M20 24 V${H - 24}`} fill="none" stroke={INK} strokeOpacity={0.6} />
      <path d={top.join(' ')} fill="none" stroke={INK} strokeOpacity={0.45} />
      <path d={left.join(' ')} fill="none" stroke={INK} strokeOpacity={0.45} />
      {topLabels.map((v) => (
        <T key={`t${v}`} x={24 + v + 2} y={10} size={5.5} o={0.55} spacing={0}>
          {v}
        </T>
      ))}
      {leftLabels.map((v) => (
        <T key={`l${v}`} x={9} y={24 + v - 2} size={5.5} o={0.55} spacing={0} rotate={-90}>
          {v}
        </T>
      ))}
    </g>
  );
}

function Registration({ x, y }) {
  return (
    <g>
      <circle cx={x} cy={y} r={4} fill="none" stroke={INK} strokeOpacity={0.7} />
      <path d={`M${x - 7} ${y} H${x + 7} M${x} ${y - 7} V${y + 7}`} fill="none" stroke={INK} strokeOpacity={0.7} />
    </g>
  );
}

function TitleBlock({ title, code, rev, sheet }) {
  const x = 752;
  const y = 488;
  return (
    <g>
      <rect x={x} y={y} width={184} height={48} fill={PAPER} stroke={INK} />
      <path d={`M${x} ${y + 16} H${x + 184} M${x} ${y + 32} H${x + 184} M${x + 128} ${y} V${y + 48}`} fill="none" stroke={INK} strokeOpacity={0.6} />
      <T x={x + 5} y={y + 11} size={5.5} o={0.55} spacing={0.6}>
        DWG
      </T>
      <T x={x + 26} y={y + 11.5} size={7} weight={700}>
        {code}
      </T>
      <T x={x + 133} y={y + 11} size={5.5} o={0.55} spacing={0.6}>
        REV
      </T>
      <T x={x + 154} y={y + 11.5} size={7} weight={700}>
        {rev}
      </T>
      <T x={x + 5} y={y + 27.5} size={6.5} weight={700} spacing={0}>
        {title.length > 30 ? `${title.slice(0, 29)}…` : title}
      </T>
      <T x={x + 133} y={y + 27} size={5.5} o={0.55} spacing={0.6}>
        SHEET
      </T>
      <T x={x + 158} y={y + 27.5} size={7} weight={700} spacing={0}>
        {sheet}
      </T>
      <T x={x + 5} y={y + 43} size={6} o={0.7} spacing={0.6}>
        LUPUS AI LABS · LUMI AI
      </T>
      <T x={x + 133} y={y + 43} size={6} o={0.7} spacing={0.6}>
        SCALE NTS
      </T>
    </g>
  );
}

/**
 * Sheet: paper, construction grid, rulers, registration marks, border and
 * title block. Children are drawn in the 960 x 560 coordinate space.
 */
export function Sheet({ title, code, rev = 'A', sheet = '01/01', className = '', children }) {
  const raw = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const ids = {
    arrow: `sw${raw}arrow`,
    arrowStart: `sw${raw}arrows`,
    grid: `sw${raw}grid`,
    hatch: `sw${raw}hatch`,
  };
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={`sw-schem ${className}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`${title}: system architecture schematic`}
      fontFamily={MONO}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <marker id={ids.arrow} viewBox="0 0 8 8" refX="7.5" refY="4" markerWidth="7" markerHeight="7" markerUnits="userSpaceOnUse" orient="auto">
          <path d="M0 0.6 L8 4 L0 7.4 Z" fill={INK} />
        </marker>
        <marker id={ids.arrowStart} viewBox="0 0 8 8" refX="0.5" refY="4" markerWidth="7" markerHeight="7" markerUnits="userSpaceOnUse" orient="auto">
          <path d="M8 0.6 L0 4 L8 7.4 Z" fill={INK} />
        </marker>
        <pattern id={ids.grid} width="20" height="20" patternUnits="userSpaceOnUse" x="24" y="24">
          <path d="M20 0 H0 V20" fill="none" stroke={INK} strokeOpacity={0.07} />
        </pattern>
        <pattern id={ids.hatch} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0 V6" fill="none" stroke={INK} strokeOpacity={0.28} />
        </pattern>
      </defs>
      <rect width={W} height={H} fill={PAPER} />
      <rect x={24} y={24} width={W - 48} height={H - 48} fill={`url(#${ids.grid})`} />
      <Rulers />
      <Registration x={W - 12} y={12} />
      <Registration x={12} y={H - 12} />
      <rect x={24} y={24} width={W - 48} height={H - 48} fill="none" stroke={INK} strokeWidth={1.2} />
      <rect x={28} y={28} width={W - 56} height={H - 56} fill="none" stroke={INK} strokeOpacity={0.25} />
      <SheetIds.Provider value={ids}>
        {children}
        <TitleBlock title={title} code={code} rev={rev} sheet={sheet} />
      </SheetIds.Provider>
    </svg>
  );
}

/** Rectangle filled with the sheet's 45 degree hatch (headroom, baselines, empty tiers). */
export function HatchRect({ x, y, w, h, outline = true }) {
  const ids = useIds();
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={PAPER} />
      <rect x={x} y={y} width={w} height={h} fill={`url(#${ids.hatch})`} stroke={outline ? INK : 'none'} />
    </g>
  );
}
