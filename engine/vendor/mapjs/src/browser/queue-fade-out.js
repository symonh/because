/*global require, setTimeout */
const jQuery = require('jquery');
jQuery.fn.queueFadeOut = function (theme) {
	'use strict';
	const element = this,
		removeElement = () => {
			if (element.is(':focus')) {
				element.parents('[tabindex]').focus();
			}
			return element.remove();
		};
	if (!theme || theme.noAnimations()) {
		return removeElement();
	}
	/* LOCAL PATCH: upstream wrote the safety net AFTER the return, so it never
	   ran and removal depended entirely on transitionend. That event does not
	   arrive when no opacity transition actually starts (the element was
	   created and removed without an intervening paint, or the tab is in the
	   background), and an interrupted transition — the stylesheet swap behind
	   a dark-mode toggle — fires transitioncancel instead. The element then
	   stayed in the DOM for good, and once a later node reused its idea id two
	   elements shared one DOM id: one of them stopped being rendered to and
	   froze, keeping whatever claim-number badge it held through every
	   renumber and through numbering being switched off. The timeout has to
	   outlast the theme's 400ms fade, and removeElement is safe to run twice —
	   the second call is a no-op on a detached element. */
	setTimeout(removeElement, 500);
	return element
	.on('transitionend transitioncancel', removeElement)
	.css('opacity', 0);
};

