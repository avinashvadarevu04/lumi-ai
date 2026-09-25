/**
 * Timeline map for the pinned desktop deck. One timeline unit equals 100vh of
 * scroll, so the pin lasts `total * 100%` of the viewport (300% for three cards).
 *
 *   0.00  dock    the heading lifts away while card 01 settles onto the stage
 *   0.70  rest    card 01 alone at centre stage
 *   1.00  enter   card 02 slides up with a -2deg twist; card 01 sinks back
 *   1.75  rest
 *   2.05  enter   card 03 slides up; cards 02 and 01 sink one sheet deeper
 *   2.80  rest    the finished stack holds until the pin releases (3.00)
 */
const DOCK = 0.7;
const MOVE = 0.75;
const HOLD = 0.3;
const TAIL = 0.2;

const round = (value) => Math.round(value * 1000) / 1000;

export function deckTiming(count) {
  const enter = [0];
  for (let i = 1; i < count; i += 1) enter.push(round(DOCK + HOLD + (i - 1) * (MOVE + HOLD)));

  const settled = count > 1 ? enter[count - 1] + MOVE : DOCK;
  const total = round(settled + TAIL);

  // A card becomes the front (active) card halfway through its entrance.
  const activeFrom = enter.map((start, i) => (i === 0 ? -Infinity : round(start + MOVE / 2)));

  // Where each card rests alone at the front: navigation targets and rail ticks.
  const rest = enter.map((start, i) =>
    i === 0 ? round(DOCK + HOLD / 2) : round(Math.min(start + MOVE + HOLD / 2, total - TAIL / 2))
  );

  return { dock: DOCK, move: MOVE, total, enter, activeFrom, rest };
}

/** Index of the front card at timeline time `time`. */
export function activeAt(timing, time) {
  let index = 0;
  timing.activeFrom.forEach((from, i) => {
    if (time >= from) index = i;
  });
  return index;
}

/**
 * Resting pose of a card `depth` sheets behind the front one. Deeper sheets
 * are smaller, higher and darker, so their top edges stay visible above the
 * front card like stacked plates of glass. transform-origin is the top edge.
 */
export function depthPose(depth) {
  if (depth === 0) return { y: 0, scale: 1, rotateX: 0, rotateZ: 0, filter: 'brightness(1)' };
  return {
    y: -40 - (depth - 1) * 32,
    scale: round(1 - depth * 0.12),
    rotateX: 0,
    rotateZ: 0,
    filter: `brightness(${round(0.3 / depth)})`,
  };
}
