/**
 * The card contour is an SVG <rect> hugging the face, traced with
 * stroke-dashoffset. Lengths are function-based values, so a refresh with
 * invalidateOnRefresh re-measures them after a resize.
 */
export function contourLength(rect) {
  try {
    return Math.ceil(rect.getTotalLength()) + 2;
  } catch {
    // Any dash length at least the perimeter still traces correctly.
    return 6000;
  }
}

/** [fromVars, toVars] that trace a contour from nothing to a closed outline. */
export function traceContour(rect) {
  const length = () => contourLength(rect);
  return [
    { strokeDasharray: length, strokeDashoffset: length },
    { strokeDasharray: length, strokeDashoffset: 0 },
  ];
}
