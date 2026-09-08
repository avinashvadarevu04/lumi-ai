/**
 * Draws the Lupus AI Labs mark (isometric open cube + circuit tree) on a 2D canvas
 * inside a 100×100 box placed at (x, y) and scaled to `size`.
 * `ink` is the mark colour, `seam` the colour used to cut the panel seams.
 */
export function drawMark(ctx, x, y, size, ink = '#000000', seam = '#ffffff') {
  const s = size / 100;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);

  const outer = [[50, 3], [91, 26.5], [91, 73.5], [50, 97], [9, 73.5], [9, 26.5]];
  const inner = [[50, 19], [77, 34.5], [77, 65.5], [50, 81], [23, 65.5], [23, 34.5]];
  ctx.fillStyle = ink;
  ctx.beginPath();
  outer.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  ctx.closePath();
  inner.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  ctx.closePath();
  ctx.fill('evenodd');

  ctx.strokeStyle = seam;
  ctx.lineWidth = 3.2;
  ctx.lineCap = 'butt';
  [[50, 1, 50, 21], [7, 25.5, 25, 35.5], [93, 25.5, 75, 35.5], [50, 79, 50, 99]].forEach(([a, b, c, d]) => {
    ctx.beginPath();
    ctx.moveTo(a, b);
    ctx.lineTo(c, d);
    ctx.stroke();
  });

  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const path = (pts) => {
    ctx.beginPath();
    pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
    ctx.stroke();
  };
  path([[50, 78], [50, 38]]);
  path([[50, 62], [42, 62], [42, 50]]);
  path([[50, 62], [58, 62], [58, 50]]);
  path([[50, 70], [34, 70], [34, 60]]);
  path([[50, 70], [66, 70], [66, 60]]);
  [[50, 34], [42, 46], [58, 46], [34, 56], [66, 56]].forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 3.4, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.restore();
}
