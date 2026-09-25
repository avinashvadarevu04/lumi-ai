import React from 'react';

/**
 * Section heading and intro. In the static list it sits above the cards; on
 * desktop it opens the pinned stage and lifts away as card 01 docks over it.
 */
export default function DeckHeader() {
  return (
    <header data-wwb="header" className="wwb-header mb-16 flex max-w-3xl flex-col items-start sm:mb-20">
      <div data-wwb="eyebrow" className="eyebrow mb-5">
        <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
        Capability pillars • AI systems
      </div>
      <h2
        id="wwb-heading"
        data-wwb="title"
        className="mb-4 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl"
      >
        AI systems built around <br />
        <span className="text-neutral-500">real business problems.</span>
      </h2>
      <p data-wwb="intro" className="text-base leading-relaxed text-silver sm:text-lg">
        Unlike generic chatbots or disconnected automation tools, Lumi AI engineers integrated systems that become
        permanent operational assets.
      </p>
    </header>
  );
}
