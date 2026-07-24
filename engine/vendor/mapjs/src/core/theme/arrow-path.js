/*global module*/
/* LOCAL ADDITION: arrowhead path builder, extracted verbatim from
   theme/link.js so connectors (theme key `arrow`) can reuse it. */
module.exports = function arrowPath(lineFrom, lineTo, offset) {
	'use strict';
	const n = Math.tan(Math.PI / 9),
		dx = lineTo.x - lineFrom.x,
		dy = lineTo.y - lineFrom.y;

	let len = 14, iy, a1x, a2x, a1y, a2y, m;

	if (dx === 0) {
		iy = dy < 0 ? -1 : 1;
		a1x = lineTo.x + len * Math.sin(n) * iy;
		a2x = lineTo.x - len * Math.sin(n) * iy;
		a1y = lineTo.y - len * Math.cos(n) * iy;
		a2y = lineTo.y - len * Math.cos(n) * iy;
	} else {
		m = dy / dx;
		if (lineFrom.x < lineTo.x) {
			len = -len;
		}
		a1x = lineTo.x + (1 - m * n) * len / Math.sqrt((1 + m * m) * (1 + n * n));
		a1y = lineTo.y + (m + n) * len / Math.sqrt((1 + m * m) * (1 + n * n));
		a2x = lineTo.x + (1 + m * n) * len / Math.sqrt((1 + m * m) * (1 + n * n));
		a2y = lineTo.y + (m - n) * len / Math.sqrt((1 + m * m) * (1 + n * n));
	}
	return 'M' + Math.round(a1x - offset.left) + ',' + Math.round(a1y - offset.top) +
		'L' + Math.round(lineTo.x - offset.left) + ',' + Math.round(lineTo.y - offset.top) +
		'L' + Math.round(a2x - offset.left) + ',' + Math.round(a2y - offset.top) +
		'Z';
};
/* LOCAL ADDITION: apex-to-base distance of the head drawn above — the barbs
   sit 14 from the apex at ±20°, so their midpoint is 14*cos(20°) back along
   the axis. Line types read it to end the line exactly where the head begins,
   so the stroke never runs through the head. */
module.exports.axisLength = 14 * Math.cos(Math.PI / 9);
