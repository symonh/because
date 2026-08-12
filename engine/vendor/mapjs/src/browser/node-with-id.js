/*global require*/
const jQuery = require('jquery'),
	nodeKey = require('../core/util/node-key');

jQuery.fn.nodeWithId = function (id) {
	'use strict';
	/* LOCAL PATCH: jQuery resolves a bare '#id' through getElementById, so it
	   returns only the FIRST element carrying the id even when several do.
	   Every render path for a node goes through here — nodeMoved,
	   nodeAttrChanged, nodeLabelChanged, selection, queueFadeOut — so a second
	   element with the same id was invisible to all of them and froze with the
	   content it happened to hold. An attribute selector goes through
	   querySelectorAll and matches them all, which both keeps duplicates in
	   step and lets a removal reach every one of them. nodeKey strips the id
	   to [A-Za-z0-9_-], so it needs no further quoting. */
	return this.find('[id="' + nodeKey(id) + '"]');
};

