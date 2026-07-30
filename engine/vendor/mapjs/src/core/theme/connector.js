/*global require, module */
const _ = require('underscore'),
	Theme = require ('./theme'),
	calcChildPosition = require('./calc-child-position'),
	lineTypes = require('./line-types'),
	/* LOCAL PATCH: theme-driven arrowheads on connectors (key `arrow` on a
	   connector style) — upstream only links had arrows */
	arrowPath = require('./arrow-path'),
	nodeConnectionPointX = require('./node-connection-point-x'),
	appendUnderLine = function (connectorCurve, calculatedConnector, position) {
		'use strict';
		if (calculatedConnector.nodeUnderline) {
			connectorCurve.d += 'M' + (calculatedConnector.nodeUnderline.from.x - position.left) + ',' + (calculatedConnector.nodeUnderline.from.y - position.top) + ' H' + (calculatedConnector.nodeUnderline.to.x - position.left);
		}
		return connectorCurve;
	},
	appendOverLine = function (connectorCurve, calculatedConnector) {
		'use strict';
		const initialRadius = connectorCurve.initialRadius || 0,
			halfWidth = calculatedConnector.nodeOverline && (Math.floor(0.5 * Math.abs(calculatedConnector.nodeOverline.to.x - calculatedConnector.nodeOverline.from.x)) - 1),
			/* LOCAL PATCH: a theme can flag a connector style `squareCorners:
			   true` (used for the objection/opposing-group bracket) to trade
			   the two quadratic-bezier corners below for right-angle turns —
			   same start/end points and span, so shape alone (not just color)
			   distinguishes objections from reasons for colorblind users */
			square = calculatedConnector.connectorTheme && calculatedConnector.connectorTheme.squareCorners,
			/* LOCAL PATCH: `noCorners: true` is the third bracket shape — a
			   bare bar with no turns at all, used by the neutral-group
			   connector. Same y and the same full span as the square one, so
			   the three group kinds differ in shape as well as color:
			   rounded = reason, square = objection, flat = neutral. */
			flat = calculatedConnector.connectorTheme && calculatedConnector.connectorTheme.noCorners;

		if (calculatedConnector.nodeOverline && flat) {
			connectorCurve.d += 'm' + (-1 * halfWidth) + ',0' +
				' h' + (2 * halfWidth);
		} else if (calculatedConnector.nodeOverline && square) {
			connectorCurve.d += 'm' + (-1 * halfWidth) + ',' + initialRadius +
				'v' + (-1 * initialRadius) +
				' h' + (2 * halfWidth) +
				'v' + initialRadius;
		} else if (calculatedConnector.nodeOverline) {
			connectorCurve.d += 'm' + (-1 * halfWidth) + ',' + initialRadius +
				'q0,' + (-1 * initialRadius) + ' ' + initialRadius + ',' +  (-1 * initialRadius) +
				' h' + (2 * (halfWidth - initialRadius)) +
				'q' + initialRadius + ',0 ' + initialRadius + ',' +  initialRadius;
		}
		return connectorCurve;

	},
	appendBorderLines = function (connectorCurve, calculatedConnector, position) {
		'use strict';
		return appendOverLine(appendUnderLine(connectorCurve, calculatedConnector, position), calculatedConnector);
	},
	nodeConnectionPointY = {
		'center': function (node) {
			'use strict';
			return Math.round(node.top + node.height * 0.5);
		},
		'base': function (node) {
			'use strict';
			return node.top + node.height + 1;
		},
		'base-inset': function (node, inset) {
			'use strict';
			return node.top + node.height + 1 - inset;
		},
		'top': function (node) {
			'use strict';
			return node.top;
		}
	},

	calculateConnector = function (parent, child, theme) {
		'use strict';
		const childPosition = calcChildPosition(parent, child, 10),
			fromStyles = parent.styles,
			toStyles = child.styles,
			connectionPositionDefaultFrom = theme.attributeValue(['node'], fromStyles, ['connections', 'default'], {h: 'center', v: 'center'}),
			connectionPositionDefaultTo = theme.attributeValue(['node'], toStyles, ['connections', 'default'], {h: 'nearest-inset', v: 'center'}),
			connectionPositionFrom = _.extend({}, connectionPositionDefaultFrom, theme.attributeValue(['node'], fromStyles, ['connections', 'from', childPosition], {})),
			connectionPositionTo = _.extend({}, connectionPositionDefaultTo, theme.attributeValue(['node'], toStyles, ['connections', 'to'], {})),
			connectorTheme = theme.connectorTheme(childPosition, toStyles, fromStyles),
			fromInset = theme.attributeValue(['node'], fromStyles, ['cornerRadius'], 10),
			toInset = theme.attributeValue(['node'], toStyles, ['cornerRadius'], 10),
			borderType = theme.attributeValue(['node'], toStyles, ['border', 'type'], '');
		let nodeUnderline = false, nodeOverline = false;
		if (borderType === 'underline' || borderType === 'under-overline') {
			nodeUnderline = {
				from: {
					x: child.left,
					y: child.top + child.height + 1
				},
				to: {
					x: child.left + child.width,
					y: child.top + child.height + 1
				}
			};
		}
		if (borderType === 'overline' || borderType === 'under-overline') {
			nodeOverline = {
				from: {
					x: child.left,
					y: child.top
				},
				to: {
					x: child.left + child.width,
					y: child.top
				}
			};
		}

		return {
			from: {
				x: nodeConnectionPointX[connectionPositionFrom.h](parent, child, fromInset),
				y: nodeConnectionPointY[connectionPositionFrom.v](parent, fromInset)
			},
			to: {
				x: nodeConnectionPointX[connectionPositionTo.h](child, parent, toInset),
				y: nodeConnectionPointY[connectionPositionTo.v](child, toInset)
			},
			connectorTheme: connectorTheme,
			nodeUnderline: nodeUnderline,
			nodeOverline: nodeOverline
		};
	},
	themePath = function (parent, child, themeArg) {
		'use strict';
		const left = Math.min(parent.left, child.left),
			top = Math.min(parent.top, child.top),
			position = {
				left: left,
				top: top,
				width: Math.max(parent.left + parent.width, child.left + child.width, left + 1) - left,
				height: Math.max(parent.top + parent.height, child.top + child.height, top + 1) - top + 2
			},
			theme = themeArg || new Theme({}),
			calculatedConnector = calculateConnector(parent, child, theme),
			result = appendBorderLines(lineTypes[calculatedConnector.connectorTheme.type](calculatedConnector, position, parent, child), calculatedConnector, position);
		result.color = calculatedConnector.connectorTheme.line.color;
		result.width = calculatedConnector.connectorTheme.line.width;
		result.theme = calculatedConnector.connectorTheme;
		/* LOCAL PATCH: theme-driven arrowheads. Default ('to'): head at the
		   `to` end, pointing down into the child; 'from': head at the `from`
		   end, pointing up into the parent — the upward/"therefore" reading.
		   The head's angle follows the curve: line types report arrowStems
		   (the point ~20px along the actual curve from each end) and the head
		   is drawn along that chord, so it stays lined up when the curve
		   swings away from vertical; without stems, fall back to a vertical
		   head (the S-curves meet both nodes vertically at the endpoint). */
		if (calculatedConnector.connectorTheme.arrow && calculatedConnector.connectorTheme.type !== 'no-connector') {
			const stems = result.arrowStems || {};
			result.arrows = calculatedConnector.connectorTheme.arrow === 'from' ?
				[arrowPath(
					stems.from || {x: calculatedConnector.from.x, y: calculatedConnector.from.y + 20},
					calculatedConnector.from,
					position
				)] :
				[arrowPath(
					stems.to || {x: calculatedConnector.to.x, y: calculatedConnector.to.y - 20},
					calculatedConnector.to,
					position
				)];
		}
		delete result.arrowStems;
		return result;
	};

module.exports = themePath;
