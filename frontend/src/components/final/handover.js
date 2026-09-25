/**
 * The typographic handover between the Final CTA and the Footer.
 *
 * The CTA's giant "LUPUS AI LABS" fades out over the same stretch of scroll in
 * which the footer's lockup lands. The CTA measures that window from its own
 * bottom edge and the footer from its own top edge; the footer begins where the
 * section ends, so both describe the same scroll distance (on desktop it opens
 * exactly as the pin releases). clamp() keeps the window reachable on screens
 * tall enough to show the whole footer at once.
 */
export const HANDOVER = {
  cta: { start: 'bottom bottom', end: 'clamp(bottom 45%)' },
  footer: { start: 'top bottom', end: 'clamp(top 45%)' },
  scrub: 0.6,
};

/** Glyphs the mono telemetry labels cycle through while they decode. */
export const SCRAMBLE_CHARS = '01/<>_+#';
