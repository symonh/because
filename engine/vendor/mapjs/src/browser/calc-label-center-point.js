/*global module, require */
const defaultTheme = require('../core/theme/default-theme'),
	createSVG = require('./create-svg'),
	pathElement = createSVG('path');
module.exports = function calcLabelCenterPoint(connectionPosition, fromBox, toBox, d, labelTheme) {
	'use strict';
	labelTheme = labelTheme || defaultTheme.connector.default.label;
	const labelPosition = labelTheme.position || {};

	pathElement.attr('d', d);
	/* LOCAL PATCH: `belowStart` mirrors `aboveEnd` — the label hangs a fixed
	   offset below the PARENT's base (the start of the path) instead of
	   sitting above the child's top, for the upward high-impact theme whose
	   "Therefore" labels belong next to the parent claim. `midSpan` asks for
	   halfway between the two, which is what "in the middle of the connector"
	   means here: the plain `ratio` branch below measures along the whole
	   path, and a group connector's path carries the bracket, so half its
	   length lands somewhere on the bracket rather than on the curve. */
	if (labelPosition.aboveEnd || labelPosition.belowStart || labelPosition.midSpan) {
		const middleToBox = toBox.left + (toBox.width / 2) - connectionPosition.left,
			middleFromBox = fromBox.left + (fromBox.width / 2) - connectionPosition.left,
			multiplier = labelPosition.ratio || 1,
			startY = fromBox.top + fromBox.height - connectionPosition.top,
			endY = toBox.top - connectionPosition.top,
			y = labelPosition.midSpan ?
				Math.round((startY + endY) / 2) :
				(labelPosition.aboveEnd ?
					endY - labelPosition.aboveEnd :
					startY + labelPosition.belowStart),
			path = pathElement[0],
			total = path.getTotalLength ? path.getTotalLength() : 0;
		/* LOCAL PATCH: the linear interpolation between the two node centres
		   drifts away from the curve when nodes fan far horizontally (a
		   busy level put "but…" labels well left of their connectors), so
		   place the label on the actual curve at the label's height. The
		   S-curve is monotonic in y for top-down layouts; anything else
		   falls back to the historical interpolation. */
		if (total > 0) {
			const start = path.getPointAtLength(0),
				end = path.getPointAtLength(total);
			if (start.y < end.y && y > start.y && y < end.y) {
				let lo = 0, hi = total;
				for (let i = 0; i < 20; i++) {
					const mid = (lo + hi) / 2;
					if (path.getPointAtLength(mid).y < y) { lo = mid; } else { hi = mid; }
				}
				return {
					x: Math.round(path.getPointAtLength((lo + hi) / 2).x),
					y: y
				};
			}
		}
		return {
			x: Math.round(middleFromBox + multiplier * (middleToBox - middleFromBox)),
			y: y
		};
	} else if (labelPosition.ratio) {
		return pathElement[0].getPointAtLength(pathElement[0].getTotalLength() * labelTheme.position.ratio);
	}

	return pathElement[0].getPointAtLength(pathElement[0].getTotalLength() * 0.5);

};

