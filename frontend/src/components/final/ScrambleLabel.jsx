import React from 'react';

/**
 * A mono label that can decode (ScrambleText) on reveal without garbling what
 * screen readers hear: assistive tech reads the sr-only copy, while the
 * animation runs on an aria-hidden twin marked [data-scramble].
 */
export default function ScrambleLabel({ text, className }) {
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" data-scramble="">
        {text}
      </span>
    </span>
  );
}
