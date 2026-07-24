/*global document, window*/
/*
 * Editing the number badge on a claim. The badges are computed from the
 * map's structure (numbering.js); clicking one opens a small editor in
 * place so the author can put their own text there instead — up to
 * MAX_CLAIM_LABEL characters, which is what the pill can hold before it
 * stops looking like a number.
 *
 * The override lives on the claim as attr.claimLabel, so it round-trips
 * through .mup like any other node attribute and goes through the content
 * aggregate's command processor, which puts it on the undo stack. Clearing
 * the text — or typing back the number the structure would give the claim
 * anyway — removes the attribute, and the badge follows the map again.
 */

import { track } from './analytics.js';
import { autoNumbers, labelOverride, MAX_CLAIM_LABEL } from './numbering.js';

export function makeNumberEdit(engine) {
	const mapModel = engine.mapModel,
		domId = id => ('node_' + id).replace(/[^A-Za-z0-9_-]/g, '_'),
		// DOM id -> idea id: node elements carry only the cleaned id, so
		// remember the real one as the engine announces each node
		nodesByDomId = {};
	let activeInput = null;

	mapModel.addEventListener('nodeCreated', function (node) {
		nodesByDomId[domId(node.id)] = node.id;
	});
	mapModel.addEventListener('nodeRemoved', function (node, nodeId) {
		delete nodesByDomId[domId(nodeId)];
	});

	const ideaById = function (id) {
			const content = mapModel.getIdea();
			if (!content) { return null; }
			return content.id === id ? content : content.findSubIdeaById(id);
		},
		badgeFor = function (id) {
			const el = document.getElementById(domId(id)),
				badge = el && el.querySelector('.mapjs-label');
			// numbering off: the engine hides the span but leaves it in place
			return (badge && badge.offsetParent) ? badge : null;
		};

	function beginEdit(nodeId) {
		if (activeInput) { return; }
		const content = mapModel.getIdea(),
			node = ideaById(nodeId),
			badge = badgeFor(nodeId),
			container = document.getElementById('map-container');
		if (!content || !node || !badge || !container) { return; }

		const auto = autoNumbers(content)[nodeId] || '',
			current = labelOverride(node) || auto,
			// the badge's centre, in viewport coordinates: the editor is fixed
			// on the page rather than placed inside the map container, whose
			// ARIA role is `tree` and may hold none but treeitem children
			badgeRect = badge.getBoundingClientRect(),
			centreX = badgeRect.left + badgeRect.width / 2,
			centreY = badgeRect.top + badgeRect.height / 2,
			input = document.createElement('input'),
			// the pill grows with its text, and so does the editor: an offscreen
			// twin measures the value in the editor's own font
			measure = document.createElement('span');

		input.type = 'text';
		input.className = 'node-number-editor';
		input.maxLength = MAX_CLAIM_LABEL;
		input.setAttribute('aria-label', 'Claim number');
		input.value = current;
		measure.className = 'node-number-measure';
		document.body.appendChild(measure);
		document.body.appendChild(input);

		const resize = function () {
			measure.textContent = input.value || ' ';
			const width = Math.max(24, measure.offsetWidth + 4),
				outer = width + 14; // content-box: 12px padding + 2px border
			input.style.width = width + 'px';
			input.style.left = Math.round(Math.min(Math.max(4, centreX - outer / 2),
				window.innerWidth - outer - 4)) + 'px';
			input.style.top = Math.round(centreY - 11) + 'px';
		};
		resize();
		activeInput = input;
		mapModel.setInputEnabled(false, true); // engine hotkeys off while typing
		input.focus();
		input.select();
		track('claim_number', { action: 'edit', has_label: labelOverride(node) ? 'yes' : 'no' });

		const finish = function (commit) {
			if (!activeInput) { return; }
			const typed = input.value.trim().slice(0, MAX_CLAIM_LABEL),
				// typing the structural number back is the same as asking for
				// no override: the badge should keep following the map
				wanted = (typed && typed !== auto) ? typed : false,
				existing = labelOverride(node) || false;
			const hadFocus = document.activeElement === input;
			activeInput = null;
			input.remove();
			measure.remove();
			mapModel.setInputEnabled(true);
			// hand the keyboard back to the map rather than to the body; the
			// container delegates focus on to the selected claim (a11y-canvas)
			if (hadFocus) { container.focus(); }
			if (commit && wanted !== existing) {
				content.updateAttr(nodeId, 'claimLabel', wanted);
				track('claim_number', { action: wanted ? 'set' : 'cleared' });
			}
		};
		input.addEventListener('input', resize);
		input.addEventListener('keydown', function (e) {
			e.stopPropagation();
			if (e.key === 'Enter') { finish(true); }
			if (e.key === 'Escape') { finish(false); }
		});
		input.addEventListener('blur', () => finish(true));
	}

	// A badge is a plain span inside the node element, so the click is caught
	// here rather than through a mapjs event — in the CAPTURE phase, because
	// the decorations container the badge sits in swallows mousedown and
	// click (stopImmediatePropagation) to keep icon clicks from selecting or
	// dragging the node. Nothing bubbling ever sees this click.
	document.addEventListener('click', function (e) {
		const badge = e.target && e.target.closest && e.target.closest('.mapjs-label'),
			nodeEl = badge && badge.closest('.mapjs-node'),
			nodeId = nodeEl && nodesByDomId[nodeEl.id];
		if (activeInput || nodeId === undefined || nodeId === null) { return; }
		beginEdit(nodeId);
	}, true);
	// the badges are small and their affordance is not obvious; say what a
	// click does on the way past (the menu item below is the keyboard path)
	document.addEventListener('mouseover', function (e) {
		const badge = e.target && e.target.closest && e.target.closest('.mapjs-label');
		if (badge && !badge.title) {
			badge.title = 'Click to replace this number';
		}
	});

	return {
		// menu path, for people who are not clicking. Numbering may be
		// switched off entirely, in which case there is no badge to edit
		// until it is back on.
		editSelectedNumber() {
			const nodeId = mapModel.getSelectedNodeId();
			if (!nodeId || !ideaById(nodeId)) { return; }
			if (badgeFor(nodeId)) {
				beginEdit(nodeId);
				return;
			}
			if (!engine.getLabelsOn()) {
				engine.setLabelsOn(true);
				// the badge appears with the next render pass
				window.requestAnimationFrame(() => beginEdit(nodeId));
			}
		}
	};
}
