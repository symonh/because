/*global module, require*/

/* LOCAL PATCH: geometry helpers for arrowhead joins — see the `arrowStems`
   note on vertical-quadratic-s-curve below. */
const arrowPath = require('./arrow-path'),
	HEAD = arrowPath.axisLength,
	lerp = function (a, b, t) {
		'use strict';
		return {x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t};
	},
	distance = function (a, b) {
		'use strict';
		return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
	},
	quadPoint = function (p0, c, p1, t) {
		'use strict';
		return lerp(lerp(p0, c, t), lerp(c, p1, t), t);
	},
	// parameter at which the quadratic sits a head-length (straight line) away
	// from p0; null when the whole segment is too short to give the head room
	// without swallowing the line. Distance from p0 grows monotonically along
	// these half-curves, so a bisection settles it.
	headSplit = function (p0, c, p1) {
		'use strict';
		let lo = 0, hi = 1, i, mid;
		if (distance(p0, p1) < HEAD + 4) {
			return null;
		}
		for (i = 0; i < 24; i++) {
			mid = (lo + hi) / 2;
			if (distance(p0, quadPoint(p0, c, p1, mid)) < HEAD) {
				lo = mid;
			} else {
				hi = mid;
			}
		}
		return (lo + hi) / 2;
	},
	straight = function (calculatedConnector, position) {
	'use strict';
	return {
		'd': 'M' + Math.round(calculatedConnector.from.x - position.left) + ',' + Math.round(calculatedConnector.from.y - position.top) + 'L' + Math.round(calculatedConnector.to.x - position.left) + ',' + Math.round(calculatedConnector.to.y - position.top),
		'position': position
	};
};

module.exports = {
	'quadratic': function (calculatedConnector, position, parent, child) {
		'use strict';
		const maxOffset = Math.min(child.height, parent.height) * 1.2,
			requestedOffset = calculatedConnector.connectorTheme.controlPoint.height * (calculatedConnector.from.y - calculatedConnector.to.y),
			offset = Math.max(-maxOffset, Math.min(maxOffset, requestedOffset));

		if (Math.round(calculatedConnector.from.y) === Math.round(calculatedConnector.to.y - offset)) {
			return straight(calculatedConnector, position);
		}
		return {
			'd': 'M' + Math.round(calculatedConnector.from.x - position.left) + ',' + Math.round(calculatedConnector.from.y - position.top) +
				'Q' + Math.round(calculatedConnector.from.x - position.left) + ',' + Math.round(calculatedConnector.to.y - offset - position.top) + ' ' + Math.round(calculatedConnector.to.x - position.left) + ',' + Math.round(calculatedConnector.to.y - position.top),
			'position': position
		};
	},
	's-curve': function (calculatedConnector, position) {
		'use strict';
		const initialRadius = 10,
			dx = Math.round(calculatedConnector.to.x - calculatedConnector.from.x),
			dy = Math.round(calculatedConnector.to.y - calculatedConnector.from.y),
			dxIncrement = (initialRadius < Math.abs(dx * 0.5)) ? initialRadius * Math.sign(dx) : Math.round(dx * 0.5),
			dyIncrement = (initialRadius < Math.abs(dy * 0.5)) ? initialRadius * Math.sign(dy) : Math.round(dy * 0.5);

		return {
			'd': 'M' + (calculatedConnector.from.x - position.left) + ',' + (calculatedConnector.from.y - position.top) +
				'q' + dxIncrement + ',0 ' + dxIncrement + ',' + dyIncrement +
				'c0,' + (dy - (2 * dyIncrement)) + ' ' + Math.round(dx / 2  - dxIncrement) + ',' +  (dy - dyIncrement) + ' '  + (dx - dxIncrement) + ',' + (dy - dyIncrement),
			'position': position
		};

	},
	'top-down-s-curve': function (calculatedConnector, position) {
		'use strict';
		const dx = Math.round(calculatedConnector.to.x - calculatedConnector.from.x),
			dy = Math.round(calculatedConnector.to.y - calculatedConnector.from.y),
			initialRadius = 15,
			dxIncrement = initialRadius * Math.sign(dx),
			dyIncrement = initialRadius * Math.sign(dy),
			verticalLine = Math.round(0.5 * dy) - dyIncrement,
			flatLine = function () {
				const yIncrement = verticalLine + Math.round(0.5 * dyIncrement);
				return {
					'd': 'M' + (calculatedConnector.from.x - position.left) + ',' + (calculatedConnector.from.y - position.top) +
						'v' + yIncrement +
						'l' + dx + ',' + (dy - yIncrement),
					'position': position,
					'initialRadius': 5
				};
			};
		if (initialRadius > Math.abs(dx / 2)) {
			return flatLine();
		}

		return {
			'd': 'M' + (calculatedConnector.from.x - position.left) + ',' + (calculatedConnector.from.y - position.top) +
				'v' + verticalLine +
				'q0,' + dyIncrement + ' ' + dxIncrement + ',' + dyIncrement +
				'h' + (dx - (2 * dxIncrement)) +
				'q' + dxIncrement + ',0 ' + dxIncrement + ',' +  dyIncrement +
				'v' + verticalLine,
			'position': position,
			'initialRadius': 5
		};

	},
	'compact-s-curve': function (calculatedConnector, position) {
		'use strict';
		const initialRadius = 10,
			dx = Math.round(calculatedConnector.to.x - calculatedConnector.from.x),
			dy = Math.round(calculatedConnector.to.y - calculatedConnector.from.y),
			dxIncrement = initialRadius * Math.sign(dx),
			dyIncrement = initialRadius * Math.sign(dy),
			flatLine = function () {
				const xIncrement = Math.round(dx / 2);
				return {
					'd': 'M' + (calculatedConnector.from.x - position.left) + ',' + (calculatedConnector.from.y - position.top) +
						'l' + xIncrement + ',0 ' +
						'l' + (dx - xIncrement) + ',' + dy,
					'position': position
				};
			};

		if (initialRadius > Math.abs(dx * 0.5) || initialRadius > Math.abs(dy * 0.5)) {
			return flatLine();
		}
		return {
			'd': 'M' + (calculatedConnector.from.x - position.left) + ',' + (calculatedConnector.from.y - position.top) +
				'q' + dxIncrement + ',0 ' + dxIncrement + ',' + dyIncrement +
				'v' + (dy - (2 * dyIncrement)) +
				'q0,' + dyIncrement + ' ' + dxIncrement + ',' +  dyIncrement +
				'h' + (dx - (2 * dxIncrement)),
			'position': position
		};

	},
	'vertical-quadratic-s-curve': function (calculatedConnector, position) {
		'use strict';
		/* LOCAL PATCH (arrowStems): a connector style carrying an `arrow` gets a
		   solid head drawn at that end (theme/connector.js). The curve meets a
		   node vertically and then hooks hard, so a straight head laid over the
		   last 13px had the line running THROUGH it — poking out of the head's
		   side on the outside of the bend, and past the apex (a 4px stroke with a
		   square cap). End the line where the head begins instead: split the
		   quadratic at the point whose chord to the endpoint is the head's own
		   length, draw the shortened curve, and report that point as the head's
		   base, so the two meet edge to edge along one axis. */
		const from = calculatedConnector.from,
			to = calculatedConnector.to,
			dx = Math.round(to.x - from.x),
			dy = Math.round(to.y - from.y),
			dxIncrement = dx / 2,
			dyIncrement = dy / 2,
			arrow = calculatedConnector.connectorTheme && calculatedConnector.connectorTheme.arrow,
			xy = function (p) {
				return (p.x - position.left) + ',' + (p.y - position.top);
			};

		if (Math.abs(dx) < 20) {
			const end = {x: from.x + dx, y: from.y + dy},
				span = distance(from, end),
				room = span > HEAD + 4,
				unit = {x: dx / (span || 1), y: dy / (span || 1)},
				lineStart = (arrow === 'from' && room) ? {x: from.x + unit.x * HEAD, y: from.y + unit.y * HEAD} : from,
				lineEnd = (arrow === 'to' && room) ? {x: end.x - unit.x * HEAD, y: end.y - unit.y * HEAD} : end;
			return {
				'd': 'M' + xy(lineStart) + 'L' + xy(lineEnd) +
					((arrow === 'to' && room) ? 'M' + xy(end) : ''),
				initialRadius: 10,
				'position': position,
				arrowStems: {from: room ? lineStart : end, to: room ? lineEnd : from}
			};
		}
		// the two quadratics the path is drawn from: the first leaves `from` with
		// its control directly below, the second meets `to` with its control
		// directly above (which is why both ends arrive vertically)
		const mid = {x: from.x + dxIncrement, y: from.y + dyIncrement},
			fromControl = {x: from.x, y: from.y + Math.round(dyIncrement / 2)},
			toControl = {x: mid.x + dxIncrement, y: mid.y + Math.round(dyIncrement / 2)},
			end = {x: mid.x + dxIncrement, y: mid.y + dyIncrement};
		let lineStart = from, startControl = fromControl,
			lineEnd = end, endControl = toControl,
			stemFrom = mid, stemTo = mid, restoreEnd = '';
		if (arrow === 'from') {
			const t = headSplit(from, fromControl, mid);
			if (t) {
				startControl = lerp(fromControl, mid, t);
				lineStart = lerp(lerp(from, fromControl, t), startControl, t);
				stemFrom = lineStart;
			}
		} else if (arrow === 'to') {
			// walk the second quadratic from its far end, then split the original
			// at the mirrored parameter
			const s = headSplit(end, toControl, mid);
			if (s) {
				const t = 1 - s;
				endControl = lerp(mid, toControl, t);
				lineEnd = lerp(endControl, lerp(toControl, end, t), t);
				stemTo = lineEnd;
				// the bracket overline is appended relative to the path's current
				// point, so hand it back the true end (a moveto draws nothing)
				restoreEnd = 'M' + xy(end);
			}
		}
		return {
			'd': 'M' + xy(lineStart) +
				'Q' + xy(startControl) + ' ' + xy(mid) +
				'Q' + xy(endControl) + ' ' + xy(lineEnd) + restoreEnd,
			initialRadius: 10,
			'position': position,
			arrowStems: {from: stemFrom, to: stemTo}
		};
	},
	'vertical-s-curve': function (calculatedConnector, position) {
		'use strict';
		const initialRadius = 10,
			dx = Math.round(calculatedConnector.to.x - calculatedConnector.from.x),
			dy = Math.round(calculatedConnector.to.y - calculatedConnector.from.y),
			dxIncrement = initialRadius * Math.sign(dx),
			dyIncrement = initialRadius * Math.sign(dy);

		if (initialRadius > Math.abs(dx * 0.5) || initialRadius > Math.abs(dy * 0.5)) {
			return {
				'd': 'M' + (calculatedConnector.from.x - position.left) + ',' + (calculatedConnector.from.y - position.top) +
					'l' + dx + ',' + dy,
				'position': position
			};
		}
		return {
			'd': 'M' + (calculatedConnector.from.x - position.left) + ',' + (calculatedConnector.from.y - position.top) +
				'q0,' + dyIncrement + ' ' + dxIncrement + ',' + dyIncrement +
				'h' + (dx - (2 * dxIncrement)) +
				'q' + dxIncrement + ',0 ' + dxIncrement + ',' +  dyIncrement +
				'v' + (dy - (2 * dyIncrement)),
			'position': position
		};

	},
	'straight': straight,
	'no-connector': function (calculatedConnector, position) {
		'use strict';
		return {
			'd': 'M' + Math.round(calculatedConnector.to.x - position.left) + ',' + Math.round(calculatedConnector.to.y - position.top),
			'position': position
		};
	}

};
