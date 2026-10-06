/*global document, window*/
/*
 * Screen-reader and keyboard semantics for the map canvas. mapjs renders
 * nodes as bare focusable divs inside a scrolling container; this module
 * layers WAI-ARIA tree semantics on top at render time. Nothing here
 * touches map data: attributes go on the DOM the engine already drew,
 * so a .mup still serializes byte-identical (the dark-mode rule).
 *
 * Focus model: real DOM focus rides on the selected claim (roving focus).
 * The container is the single Tab stop (tabindex 0 — the vendor widget
 * sets 1, which jumps the whole page's tab order) and delegates focus to
 * the selected node the moment it receives it; arrow keys then move both
 * the selection and the focus. An earlier version kept focus on the
 * container and pointed aria-activedescendant at the selection, which is
 * exactly the indirection screen readers mishandle — NVDA + Chrome
 * announced the map as "unknown invisible" instead of the claim. Native
 * focus events on the treeitem itself are the one mechanism every AT
 * follows. Key handling is unaffected: the vendor widget listens for
 * keydown on the container, and events bubble up from the focused node.
 *
 * Connector labels: the text an author writes on a connecting line is
 * drawn in the SVG layer, which is aria-hidden here, so until now nothing
 * announced it while the arrow keys walked the map (reported by an NVDA
 * user, who heard the label only while typing it). The label belongs to
 * the connector ARRIVING at a node — the .mup keeps it on the child, as
 * attr.parentConnector.label — so it is announced on that node. Which
 * ARIA property it goes in depends on whose name it would displace: a
 * bracket's accessible name is written here, so the label joins it; a
 * claim's name is the claim's own text and must not be touched, so a
 * claim's label rides in aria-describedby instead. The theme's OWN
 * default label ("Because" / "But" / "Therefore" in the high-impact
 * themes) is deliberately left out: it says what the bracket's name
 * already says, and only an author's own words are content the tree
 * does not otherwise carry.
 */

import { sortedKids } from './numbering.js';

/*
 * The indices of `seq` to leave in place: a longest increasing run, forced
 * through index `anchor` when there is one, so the element holding focus is
 * never the one moved (moving it would blur it, and a blur ends an edit).
 */
const keepInPlace = function (seq, anchor) {
	const len = seq.map(() => 0),
		prev = seq.map(() => -1),
		usable = i => anchor < 0 || i === anchor ||
			(i < anchor ? seq[i] < seq[anchor] : seq[i] > seq[anchor]);
	let best = -1;
	seq.forEach(function (v, i) {
		if (!usable(i)) { return; }
		len[i] = 1;
		for (let j = 0; j < i; j += 1) {
			// past the anchor, a run may only continue from the anchor or beyond
			const reachable = anchor < 0 || i <= anchor || j >= anchor;
			if (len[j] && reachable && seq[j] < v && len[j] + 1 > len[i]) {
				len[i] = len[j] + 1;
				prev[i] = j;
			}
		}
		if ((anchor < 0 || i >= anchor) && (best < 0 || len[i] > len[best])) { best = i; }
	});
	const keep = new Set();
	for (let i = best; i >= 0; i = prev[i]) { keep.add(i); }
	return keep;
};

export function initCanvasA11y(engine, container) {
	const mapModel = engine.mapModel,
		domId = id => ('node_' + id).replace(/[^A-Za-z0-9_-]/g, '_'),
		descId = id => 'a11y-conn-' + domId(id),
		GROUP_LABELS = {
			supporting: 'Supporting reasons (group)',
			opposing: 'Objections (group)',
			neutral: 'Neutral connector (group)'
		},
		ideaById = function (id) {
			const root = mapModel.getIdea();
			if (!root) { return null; }
			return root.id === id ? root : root.findSubIdeaById(id);
		},
		selectedEl = function () {
			const id = mapModel.getSelectedNodeId();
			return (id && document.getElementById(domId(id))) || null;
		},
		// an author's label on the connector arriving at this node
		connectorLabel = function (idea) {
			const label = idea && idea.attr && idea.attr.parentConnector &&
				idea.attr.parentConnector.label;
			return (typeof label === 'string' && label.trim()) || '';
		},
		// where those descriptions live: outside the container, because
		// role=tree admits only treeitem children and a stray span inside a
		// node would also be measured by the layout. Built on first use, so
		// a map with no connector labels adds nothing to the document
		descHost = function () {
			let host = document.getElementById('a11y-connector-labels');
			if (!host) {
				host = document.createElement('div');
				host.id = 'a11y-connector-labels';
				host.className = 'sr-only';
				document.body.appendChild(host);
			}
			return host;
		},
		// what a claim's look says beyond its words: its state, and the
		// author's label on the connector arriving at it
		STATE_TEXT = {
			attr_implicit_claim: 'Implicit claim',
			attr_eval_rejected: 'Marked false',
			attr_eval_accepted: 'Marked true',
			sticky_note: 'Note'
		},
		claimDescription = function (idea, label) {
			const names = (idea && idea.attr && Array.isArray(idea.attr.styleNames)) ? idea.attr.styleNames : [],
				parts = Object.keys(STATE_TEXT).filter(n => names.indexOf(n) >= 0).map(n => STATE_TEXT[n]);
			if (label) { parts.push('Connector labeled ' + label); }
			return parts.join('. ');
		},
		describe = function (el, id, text) {
			let span = document.getElementById(descId(id));
			if (!text) {
				if (span) { span.remove(); }
				if (el.getAttribute('aria-describedby') === descId(id)) {
					el.removeAttribute('aria-describedby');
				}
				return;
			}
			if (!span) {
				span = document.createElement('span');
				span.id = descId(id);
				descHost().appendChild(span);
			}
			span.textContent = text;
			el.setAttribute('aria-describedby', descId(id));
		},
		decorate = function (node, attempt) {
			const el = document.getElementById(domId(node.id));
			if (!el) {
				// the controller occasionally defers DOM work a frame
				if (!attempt) { window.requestAnimationFrame(() => decorate(node, 1)); }
				return;
			}
			el.setAttribute('role', 'treeitem');
			el.setAttribute('tabindex', '-1');
			if (!el.hasAttribute('aria-selected')) { el.setAttribute('aria-selected', 'false'); }
			const idea = ideaById(node.id),
				groupType = idea && idea.attr && idea.attr.group,
				label = connectorLabel(idea);
			if (groupType) {
				el.setAttribute('aria-label', (GROUP_LABELS[groupType] || 'Claim group') +
					(label ? ', labeled ' + label : ''));
			}
			describe(el, node.id, groupType ? '' : claimDescription(idea, label));
			if (idea && idea.ideas && Object.keys(idea.ideas).length) {
				el.setAttribute('aria-expanded',
					String(!(idea.attr && idea.attr.collapsed)));
			} else {
				el.removeAttribute('aria-expanded');
			}
		};

	container.setAttribute('tabindex', '0');
	container.setAttribute('role', 'tree');
	container.setAttribute('aria-label', 'Argument map');

	// How to work the canvas and — the part no browser convention supplies
	// — how to get back out of it. Tab inside the map adds a co-premise, so
	// Tab cannot also be the way out; WCAG 2.1.2 allows a non-standard exit
	// only where the user is told what it is, and this is one of the two
	// places they are told (the other is the keyboard reference). Absolutely
	// positioned by .sr-only, so it takes no place in the body's grid.
	const hint = document.createElement('div');
	hint.id = 'map-keyboard-hint';
	hint.className = 'sr-only';
	hint.textContent = 'Arrow keys move through the argument. Press Escape to leave the map.';
	document.body.appendChild(hint);
	container.setAttribute('aria-describedby', hint.id);

	// connectors and brackets are drawn in SVG purely as visuals; the
	// relationships they express are in the tree structure above
	const svg = container.querySelector('[data-mapjs-role=svg-container]');
	if (svg) { svg.setAttribute('aria-hidden', 'true'); }

	// the positioning stage sits between the tree and its treeitems; give
	// it the group role so the ARIA required-children chain stays intact
	// (tree > group > treeitem) instead of routing through a zero-sized
	// generic that assistive technology may drop
	const stage = container.querySelector('[data-mapjs-role=stage]');
	if (stage) { stage.setAttribute('role', 'group'); }

	// the visible focus indicator (WCAG 2.4.7) is a class on the selected
	// node, held while focus is anywhere inside the map
	const RING = 'a11y-keyboard-selected',
		clearRing = function () {
			container.querySelectorAll('.' + RING).forEach(el => el.classList.remove(RING));
		},
		ringSelected = function () {
			clearRing();
			const active = document.activeElement;
			if (active !== container && !container.contains(active)) { return; }
			const el = selectedEl();
			if (el) { el.classList.add(RING); }
		},
		delegateFocus = function () {
			const el = selectedEl();
			if (!el) { return; }
			// a freshly loaded map draws its selection without the activated
			// border (engine.js deselectAll), which is also the focus indicator
			el.classList.add('activated', 'selected');
			if (document.activeElement !== el) { el.focus(); }
		};

	// fires only when the container ITSELF gains focus (focus does not
	// bubble): Tab from the chrome, the skip link, or the vendor widget's
	// own viewPort.focus() calls — hand focus straight to the selection
	container.addEventListener('focus', function () {
		delegateFocus();
		ringSelected();
	});
	container.addEventListener('focusin', ringSelected);
	container.addEventListener('focusout', function (e) {
		if (!e.relatedTarget || !container.contains(e.relatedTarget)) { clearRing(); }
	});

	// The stage is a flat list in creation order, and assistive technology
	// infers each treeitem's parent from its aria-level and the items before
	// it. So the elements are kept in argument order (depth first, siblings
	// in numbering order) and each level is the item's depth in the argument.
	let sequencing = 0;
	const sequence = function () {
			sequencing = 0;
			const root = mapModel.getIdea(),
				stage = container.querySelector('[data-mapjs-role=stage]');
			if (!root || !stage) { return; }
			// an open editor is a focused element whose blur commits the edit;
			// the layout pass that follows the edit sequences instead
			if (stage.querySelector('[contenteditable="true"]')) { return; }
			const ordered = [],
				visit = function (idea, level) {
					const el = document.getElementById(domId(idea.id));
					let childLevel = level;
					if (el && el.parentNode === stage) {
						el.setAttribute('aria-level', String(level));
						ordered.push(el);
						childLevel = level + 1;
					}
					sortedKids(idea).forEach(k => visit(k, childLevel));
				};
			visit(root, 1);
			const rank = new Map(ordered.map((el, i) => [el, i])),
				current = Array.from(stage.children).filter(el => rank.has(el)),
				seq = current.map(el => rank.get(el));
			if (seq.every((v, i) => v === i)) { return; }
			const keep = keepInPlace(seq, current.indexOf(document.activeElement)),
				kept = new Set(current.filter((el, i) => keep.has(i))),
				move = (el, ref) => (stage.moveBefore ? stage.moveBefore(el, ref) : stage.insertBefore(el, ref));
			let placed = null;
			ordered.forEach(function (el) {
				const ref = placed ? placed.nextSibling : current[0];
				if (!kept.has(el) && ref !== el) { move(el, ref); }
				placed = el;
			});
		},
		scheduleSequence = function () {
			if (!sequencing) { sequencing = window.requestAnimationFrame(sequence); }
		};
	mapModel.addEventListener('layoutChangeComplete', scheduleSequence);

	// Chrome that floats over the canvas (the floating layout's cards, the
	// mobile bar) must not cover the claim that has focus (WCAG 2.4.11), so
	// each card's intrusion from the nearest container edge becomes a margin
	// the engine keeps selected claims clear of.
	const OVERLAYS = ['#float-pill', '#float-tools', '#float-zoom', '#float-status', '#mobilebar', '.move-banner'],
		updateChromeMargin = function () {
			const box = container.getBoundingClientRect(),
				margin = { top: 10, left: 10, bottom: 10, right: 10 },
				gap = 12;
			let floating = false;
			OVERLAYS.forEach(function (selector) {
				const el = document.querySelector(selector);
				if (!el || !el.getClientRects().length) { return; }
				const r = el.getBoundingClientRect();
				if (r.right <= box.left || r.left >= box.right || r.bottom <= box.top || r.top >= box.bottom) { return; }
				floating = true;
				const reach = {
					left: r.right - box.left, right: box.right - r.left,
					top: r.bottom - box.top, bottom: box.bottom - r.top
				},
					edge = Object.keys(reach).reduce((a, b) => (reach[a] <= reach[b] ? a : b));
				margin[edge] = Math.max(margin[edge], reach[edge] + gap);
			});
			const stage = container.querySelector('[data-mapjs-role=stage]'),
				scale = (stage && window.jQuery(stage).data('scale')) || 1;
			engine.setChromeMargin(floating ? margin : null, scale);
		};
	container.addEventListener('focusin', updateChromeMargin);
	window.addEventListener('resize', updateChromeMargin);
	// overlays that come and go while focus stays in the map (move-mode.js)
	window.addEventListener('because:chrome', updateChromeMargin);
	mapModel.addEventListener('mapScaleChanged', () => window.requestAnimationFrame(updateChromeMargin));

	// Text-spacing overrides (WCAG 1.4.12) arrive as a stylesheet or an inline
	// style this app did not write. Claim sizes are measured at layout, so the
	// map is laid out again once such a change settles.
	const OWN_STYLES = ['themeCSS', 'print-css'];
	let respacing = 0;
	const relayout = function () {
			respacing = 0;
			if (!mapModel.getIdea() || container.querySelector('[contenteditable="true"]')) { return; }
			// the engine reuses a node's measured size while its content and
			// theme are unchanged, so the cache mark has to go first
			container.querySelectorAll('.mapjs-node').forEach(el => window.jQuery(el).removeData('nodeCacheMark'));
			mapModel.rebuildRequired();
		},
		isForeignStyle = n => (n.nodeName === 'STYLE' ||
			(n.nodeName === 'LINK' && /stylesheet/i.test(n.rel || ''))) && OWN_STYLES.indexOf(n.id) < 0,
		onStyleChange = function (records) {
			const foreign = records.some(r => r.type === 'attributes' ||
				Array.from(r.addedNodes).concat(Array.from(r.removedNodes)).some(isForeignStyle));
			if (!foreign) { return; }
			window.clearTimeout(respacing);
			respacing = window.setTimeout(relayout, 300);
		},
		styleWatch = new window.MutationObserver(onStyleChange);
	styleWatch.observe(document.head, { childList: true });
	styleWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
	styleWatch.observe(document.body, { attributes: true, attributeFilter: ['style'] });
	engine.on('mapLoaded', scheduleSequence);

	mapModel.addEventListener('nodeCreated', node => decorate(node));
	mapModel.addEventListener('nodeAttrChanged', node => decorate(node));
	// a label edit changes attr.parentConnector, which the layout hands to
	// the CONNECTOR rather than to the node — so redecorate the node the
	// connector arrives at, which is where the label is announced
	// (no level: this fires while the new layout is still being applied, and
	// aria-level is already on the element from the pass that drew it)
	mapModel.addEventListener('connectorAttrChanged', c => decorate({ id: c.to }));
	mapModel.addEventListener('nodeRemoved', function (node, nodeId) {
		const span = document.getElementById(descId(nodeId === undefined ? node.id : nodeId));
		if (span) { span.remove(); }
	});
	// a new map replaces every node; nothing should describe the old one
	engine.on('mapLoaded', function () {
		const host = document.getElementById('a11y-connector-labels');
		if (host) { host.textContent = ''; }
	});
	mapModel.addEventListener('nodeSelectionChanged', function (id, isSelected) {
		const el = document.getElementById(domId(id));
		if (el) { el.setAttribute('aria-selected', String(!!isSelected)); }
		if (isSelected && el) {
			// move real focus with the selection, but only when the user is
			// already interacting with the map — a map load auto-selects the
			// root and must not steal focus from a dialog or menu
			const active = document.activeElement;
			if (active === container || container.contains(active)) {
				el.focus();
			}
		}
		ringSelected();
	});
}
