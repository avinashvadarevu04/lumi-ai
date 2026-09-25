import React from 'react';

const pad = (value) => String(value).padStart(2, '0');

/**
 * Decorative layers of a glass card: a blueprint grid concentrated behind the
 * module stack, corner registration marks, an etched plate reference and the
 * 1px contour the choreography traces as the card docks.
 */
export default function CardWireframe({ index, total }) {
  return (
    <>
      <div aria-hidden="true" className="wwb-wire">
        <div className="wwb-wire__grid" />
        <span className="wwb-wire__mark wwb-wire__mark--tl" />
        <span className="wwb-wire__mark wwb-wire__mark--tr" />
        <span className="wwb-wire__mark wwb-wire__mark--bl" />
        <span className="wwb-wire__mark wwb-wire__mark--br" />
        <span className="wwb-wire__ref">
          Plate {pad(index + 1)} / {pad(total)} · LMI-SYS
        </span>
      </div>
      <svg aria-hidden="true" focusable="false" className="wwb-contour">
        <rect data-wwb-contour x="0" y="0" width="100%" height="100%" rx="24" ry="24" />
      </svg>
    </>
  );
}
