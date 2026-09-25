import React from 'react';

/* Footer building blocks. The [data-footer] hooks are read by useFooterReveal. */

/** 1px divider that draws outward from its centre on reveal. */
export function Hairline() {
  return <div data-footer="rule" aria-hidden="true" className="h-px w-full origin-center bg-white/10" />;
}

/** A titled link column; its heading and items stagger in as one group. */
export function FooterColumn({ title, children }) {
  return (
    <div data-footer="col">
      <h4 data-footer="item" className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-white">
        {title}
      </h4>
      <ul className="space-y-2.5 text-xs">{children}</ul>
    </div>
  );
}

/** One entry in a column list. */
export function FooterItem({ children }) {
  return <li data-footer="item">{children}</li>;
}
