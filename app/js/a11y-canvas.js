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
		selectedEl = function () {
			const id = mapModel.getSelectedNodeId();
			return (id && document.getElementById(domId(id))) || null;
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
			if (el && document.activeElement !== el) { el.focus(); }
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

	mapModel.addEventListener('nodeCreated', node => decorate(node));
	mapModel.addEventListener('nodeAttrChanged', node => decorate(node));
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
