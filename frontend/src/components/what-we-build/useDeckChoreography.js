import { useLayoutEffect } from 'react';
import { gsap } from '../../lib/motion/gsap';
import { MOTION } from '../../lib/motion/prefs';
import { buildDesktopDeck } from './desktopDeck';
import { buildMobileDeck } from './mobileDeck';
import { revealHeader } from './headerReveal';

/** Every element the choreography drives, found by its data-wwb hooks. */
function collectDeck(section) {
  const one = (name) => section.querySelector(`[data-wwb="${name}"]`);
  const cards = Array.from(section.querySelectorAll('[data-wwb-card]'));
  return {
    section,
    stage: one('stage'),
    header: one('header'),
    eyebrow: one('eyebrow'),
    title: one('title'),
    intro: one('intro'),
    area: one('area'),
    deck: one('deck'),
    rail: one('rail'),
    railIndex: one('rail-index'),
    railLabel: one('rail-label'),
    railFill: one('rail-fill'),
    railButtons: Array.from(section.querySelectorAll('[data-wwb-goto]')),
    cards,
    faces: cards.map((card) => card.querySelector('[data-wwb-face]')),
    contours: cards.map((card) => card.querySelector('[data-wwb-contour]')),
    modules: cards.map((card) => Array.from(card.querySelectorAll('[data-wwb-module]'))),
    outcomes: cards.map((card) => Array.from(card.querySelectorAll('[data-wwb-outcome]'))),
  };
}

/**
 * Scroll choreography for the What We Build deck, one gsap.matchMedia branch
 * per motion tier (see lib/motion/prefs):
 *   desktop  pinned 300vh stage, 3D deck, active-card tilt, rail navigation
 *   mobile   native vertical list with one-shot reveals
 *   reduce   nothing runs: the static list is the finished, readable state
 * Created in a layout effect so the pin exists before first paint and follows
 * DOM order. Everything is reverted on unmount or when the tier changes, so
 * StrictMode's mount, unmount, mount leaves one set of triggers and listeners.
 */
export default function useDeckChoreography(scopeRef) {
  useLayoutEffect(() => {
    const section = scopeRef.current;
    if (!section) return undefined;
    const els = collectDeck(section);
    if (!els.stage || !els.header || !els.area || !els.deck || !els.cards.length) return undefined;

    const mm = gsap.matchMedia(section);
    mm.add(MOTION, (context) => {
      const { desktop, mobile } = context.conditions;
      if (!desktop && !mobile) return undefined;

      // The deck (and its pin) is built before the header reveal so trigger
      // creation follows the page's refresh order.
      const teardownDeck = desktop ? buildDesktopDeck(els, context) : buildMobileDeck(els);
      const teardownHeader = revealHeader(els, { desktop });
      return () => {
        teardownHeader();
        teardownDeck();
      };
    });

    return () => mm.revert();
  }, [scopeRef]);
}
