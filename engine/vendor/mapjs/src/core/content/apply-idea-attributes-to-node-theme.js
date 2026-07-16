/*global module, require*/

const foregroundStyle = require('../theme/foreground-style');
/* LOCAL PATCH: the optional colorFilter (the app's dark mode) transforms
   author-set colours at render time, keeping the map data untouched */
module.exports = function applyIdeaAttributesToNodeTheme(idea, nodeTheme, colorFilter) {
	'use strict';
	if (!nodeTheme  || !idea || !idea.attr || !idea.attr.style) {
		return nodeTheme;
	}
	const filtered = color => (colorFilter ? colorFilter(color) : color),
		isColorSetByUser = () => {
			/* LOCAL PATCH: older MindMup saves wrote style.backgroundColor
			   where newer ones write style.background — honour both */
			const style = idea.attr.style,
				setByUser = style.background || style.backgroundColor;
			if (setByUser === 'false' || setByUser === 'transparent') {
				return false;
			}
			return setByUser && filtered(setByUser);

		},
		/* LOCAL PATCH: honour an author-set text colour (style.text.color) */
		userTextColor = idea.attr.style.text && idea.attr.style.text.color,
		fontMultiplier = idea.attr.style.fontMultiplier,
		textAlign = idea.attr.style.textAlign,
		colorSetByUser = isColorSetByUser(),
		colorText = nodeTheme.borderType !== 'surround';

	if (colorSetByUser) {
		if (colorText) {
			nodeTheme.text.color = colorSetByUser;
		} else {
			nodeTheme.text.color = nodeTheme.text[foregroundStyle(colorSetByUser)];
			nodeTheme.backgroundColor = colorSetByUser;
		}
	}

	if (userTextColor) {
		nodeTheme.text = Object.assign({}, nodeTheme.text, {color: filtered(userTextColor)});
	}

	if (textAlign) {
		nodeTheme.text = Object.assign({}, nodeTheme.text, {alignment: textAlign});
	}

	if ((nodeTheme && nodeTheme.hasFontMultiplier)) {
		return nodeTheme;
	}

	if (!nodeTheme.font || !fontMultiplier || Math.abs(fontMultiplier) <= 0.01 || Math.abs(fontMultiplier - 1) <= 0.01) {
		return nodeTheme;
	}
	if (nodeTheme.font.size) {
		nodeTheme.font.size = nodeTheme.font.size * fontMultiplier;
	}

	if (nodeTheme.font.lineSpacing) {
		nodeTheme.font.lineSpacing = nodeTheme.font.lineSpacing * fontMultiplier;
	}

	if (nodeTheme.font.sizePx) {
		nodeTheme.font.sizePx = nodeTheme.font.sizePx * fontMultiplier;
	}
	if (nodeTheme.font.lineSpacingPx) {
		nodeTheme.font.lineSpacingPx = nodeTheme.font.lineSpacingPx * fontMultiplier;
	}
	nodeTheme.hasFontMultiplier = true;


	return nodeTheme;
};
