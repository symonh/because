/*global require, module */
const Theme = require ('./theme'),
	/* LOCAL PATCH: arrowPath extracted to its own module so connectors
	   can draw arrowheads too */
	arrowPath = require('./arrow-path'),
	lineStyles = require('./line-styles'),
	linkPath = function (parent, child, linkAttrArg, themeArg) {
		'use strict';
		const calculateConnector = function (parent, child) {
				const parentPoints =
					[
						{
							x: parent.left + Math.round(0.5 * parent.width),
							y: parent.top
						},
						{
							x: parent.left + parent.width,
							y: parent.top + Math.round(0.5 * parent.height)
						},
						{
							x: parent.left + Math.round(0.5 * parent.width),
							y: parent.top + parent.height
						},
						{
							x: parent.left,
							y: parent.top + Math.round(0.5 * parent.height)
						}
					],
					childPoints =
					[
						{
							x: child.left + Math.round(0.5 * child.width),
							y: child.top
						},
						{
							x: child.left + child.width,
							y: child.top + Math.round(0.5 * child.height)
						},
						{
							x: child.left + Math.round(0.5 * child.width),
							y: child.top + child.height
						},
						{
							x: child.left,
							y: child.top + Math.round(0.5 * child.height)
						}
					];
				let i, j, min = Infinity, bestParent, bestChild, dx, dy, current;
				for (i = 0; i < parentPoints.length; i += 1) {
					for (j = 0; j < childPoints.length; j += 1) {
						dx = parentPoints[i].x - childPoints[j].x;
						dy = parentPoints[i].y - childPoints[j].y;
						current = dx * dx + dy * dy;
						if (current < min) {
							bestParent = i;
							bestChild = j;
							min = current;
						}
					}
				}
				return {
					from: parentPoints[bestParent],
					to: childPoints[bestChild]
				};
			},
			conn = calculateConnector(parent, child),
			theme = themeArg || new Theme({}),
			linkAttr = linkAttrArg || {},
			left = Math.min(parent.left, child.left),
			top = Math.min(parent.top, child.top),
			position = {
				left: left,
				top: top,
				width: Math.max(parent.left + parent.width, child.left + child.width, left) - left,
				height: Math.max(parent.top + parent.height, child.top + child.height, top) - top
			},
			arrowPaths = function (arrowAttr) {
				//arrowAttr = true, to, from, both
				if (!arrowAttr) {
					return false;
				}
				const paths = [];
				if (arrowAttr !== 'from') {
					paths.push(arrowPath(conn.from, conn.to, position));
				}
				if (arrowAttr === 'from' || arrowAttr === 'both') {
					paths.push(arrowPath(conn.to, conn.from, position));
				}
				return paths;
			},
			linkTheme = theme.linkTheme(linkAttr.type),
			width = linkAttr.width || linkTheme.line.width,
			lineStyle = linkAttr.lineStyle || linkTheme.line.lineStyle,
			lineProps = {
				color: linkAttr.color || linkTheme.line.color,
				strokes: lineStyles.strokes(lineStyle, width),
				linecap: lineStyles.linecap(lineStyle, width),
				width: width
			};


		return {
			d: 'M' + Math.round(conn.from.x - position.left) + ',' + Math.round(conn.from.y - position.top) + 'L' + Math.round(conn.to.x - position.left) + ',' + Math.round(conn.to.y - position.top),
			position: position,
			arrows: (linkAttr.arrow && linkAttr.arrow !== 'false') && arrowPaths(linkAttr.arrow),
			theme: linkTheme,
			lineProps: lineProps,
			label: linkAttr.label
		};
	};

module.exports = linkPath;
