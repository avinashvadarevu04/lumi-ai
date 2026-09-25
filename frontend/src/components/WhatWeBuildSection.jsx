import React, { useRef } from 'react';
import { useMagneticScope } from '../lib/motion/useMagnetic';
import { SYSTEMS } from './what-we-build/systems';
import DeckHeader from './what-we-build/DeckHeader';
import SystemCard from './what-we-build/SystemCard';
import DeckRail from './what-we-build/DeckRail';
import useDeckChoreography from './what-we-build/useDeckChoreography';
import './what-we-build/whatWeBuild.css';

/**
 * What We Build: the three capability pillars as a deck of obsidian glass cards.
 *
 *   desktop  The stage pins for 300vh. The heading lifts away and card 01
 *            docks, then each card slides up while the earlier ones sink back
 *            into a stack of smaller, darker sheets. The front card tilts
 *            toward the cursor, and the rail tracks and navigates the deck.
 *   mobile   A native vertical list; each card rises in once as it enters.
 *   reduce   The same list, fully static.
 *
 * The markup is the static list. The desktop choreography switches it to the
 * stacked stage by setting data-deck="3d" on the section.
 */
export default function WhatWeBuildSection({ onOpenContact }) {
  const scopeRef = useRef(null);
  useDeckChoreography(scopeRef);
  useMagneticScope(scopeRef, { strength: 0.3 });

  return (
    <section ref={scopeRef} id="what-we-build" aria-labelledby="wwb-heading" className="wwb relative -mt-px bg-black">
      <div data-wwb="stage" className="wwb-stage py-24 sm:py-32">
        <div className="wwb-frame relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <DeckHeader />

          <div data-wwb="area" className="wwb-deck-area">
            <div data-wwb="deck" className="wwb-deck flex flex-col gap-10 sm:gap-14">
              {SYSTEMS.map((system, index) => (
                <SystemCard
                  key={system.id}
                  system={system}
                  index={index}
                  total={SYSTEMS.length}
                  onOpenContact={onOpenContact}
                />
              ))}
            </div>
          </div>

          <DeckRail systems={SYSTEMS} />
        </div>
      </div>
    </section>
  );
}
