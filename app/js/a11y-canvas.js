/*global document, window*/
/*
 * Screen-reader and keyboard semantics for the map canvas. mapjs renders
 * nodes as bare focusable divs inside a scrolling container; this module
 * layers WAI-ARIA tree semantics on top at render time. Nothing here
 * touches map data: attributes go on the DOM the engine already drew,
 * so a .mup still serializes byte-identical (the dark-mode rule).
 *
 * Focus model: the container is the single Tab stop (tabindex 0 — the
 * vendor widget sets 1, which jumps the whole page's tab order); nodes
 * are focusable programmatically only (tabindex -1) and reached with
 * the arrow keys, which is how mapjs already moves selection + focus.
 */

export function initCanvasA11y(engine, container) {
	const mapModel = engine.mapModel,
		domId = id => ('node_' + id).replace(/[^A-Za-z0-9_-]/g, '_'),
		GROUP_LABELS = {
			supporting: 'Supporting reasons (group)',
			opposing: 'Objections (group)'
		},
		ideaById = function (id) {
			const root = mapModel.getIdea();
			if (!root) { return null; }
			return root.id === id ? root : root.findSubIdeaById(id);
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
			if (node.level) { el.setAttribute('aria-level', String(node.level)); }
			if (!el.hasAttribute('aria-selected')) { el.setAttribute('aria-selected', 'false'); }
			const idea = ideaById(node.id),
				groupType = idea && idea.attr && idea.attr.group;
			if (groupType) {
				el.setAttribute('aria-label', GROUP_LABELS[groupType] || 'Claim group');
			}
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

	// connectors and brackets are drawn in SVG purely as visuals; the
	// relationships they express are in the tree structure above
	const svg = container.querySelector('[data-mapjs-role=svg-container]');
	if (svg) { svg.setAttribute('aria-hidden', 'true'); }

	// arrow navigation moves the SELECTION while DOM focus stays on the
	// container (activedescendant composite pattern) — so the visible
	// focus indicator (WCAG 2.4.7) is a class on the active item, held
	// exactly while the container itself is focused
	const RING = 'a11y-keyboard-selected',
		clearRing = function () {
			container.querySelectorAll('.' + RING).forEach(el => el.classList.remove(RING));
		},
		ringSelected = function () {
			clearRing();
			if (document.activeElement !== container) { return; }
			const id = container.getAttribute('aria-activedescendant'),
				el = id && document.getElementById(id);
			if (el) { el.classList.add(RING); }
		};
	container.addEventListener('focus', ringSelected);
	container.addEventListener('blur', clearRing);

	mapModel.addEventListener('nodeCreated', node => decorate(node));
	mapModel.addEventListener('nodeAttrChanged', node => decorate(node));
	mapModel.addEventListener('nodeSelectionChanged', function (id, isSelected) {
		const el = document.getElementById(domId(id));
		if (el) { el.setAttribute('aria-selected', String(!!isSelected)); }
		if (isSelected) {
			container.setAttribute('aria-activedescendant', domId(id));
		} else if (container.getAttribute('aria-activedescendant') === domId(id)) {
			container.removeAttribute('aria-activedescendant');
		}
		ringSelected();
	});
	mapModel.addEventListener('nodeRemoved', function (node) {
		if (container.getAttribute('aria-activedescendant') === domId(node.id)) {
			container.removeAttribute('aria-activedescendant');
		}
	});
}
