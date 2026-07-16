/*global window, document*/
/*
 * Connector interactions: inline label editing and the MindMup-style
 * Stronger/Weaker popover. mapjs dispatches lineLabelClicked when the
 * label text on a connector is tapped and — like undo and click-to-select
 * — leaves acting on it to the application layer; this module is that
 * layer, plus delegated click/dblclick handlers because the engine event
 * only fires on the label's <text> glyphs.
 *
 * Label and width are stored on the CHILD node as attr.parentConnector.*
 * (the .mup format MindMup used), so they round-trip through existing
 * files. Clearing the label text removes the override, falling back to
 * the theme's default label ("because…" in the high-impact theme,
 * nothing in the simple one).
 */

const DEFAULT_CONNECTOR_WIDTH = 3, // connectorEditingContext.defaults.width in the argmap themes
	MIN_WIDTH = 1,
	MAX_WIDTH = 10;

export function makeLabelEdit(engine) {
	const mapModel = engine.mapModel;
	let activeInput = null;

	const connectorDomId = c => ('connector_' + c.from + '_' + c.to).replace(/[^A-Za-z0-9_-]/g, '_'),
		isGroup = n => !!(n && n.attr && n.attr.group),
		// DOM id -> {from, to}: the SVG groups only carry the cleaned id, so
		// remember the real idea ids as the engine announces each connector
		connectorsByDomId = {};

	mapModel.addEventListener('connectorCreated', function (c) {
		connectorsByDomId[connectorDomId(c)] = { from: c.from, to: c.to };
	});
	mapModel.addEventListener('connectorRemoved', function (c) {
		delete connectorsByDomId[connectorDomId(c)];
	});

	function beginEdit(connector) {
		if (activeInput) { return; }
		const content = mapModel.getIdea(),
			node = content && content.findSubIdeaById(connector.to),
			group = document.getElementById(connectorDomId(connector)),
			anchor = (group && group.querySelector('text')) || group,
			container = document.getElementById('map-container');
		if (!node || !anchor || !container) { return; }

		const current = (node.attr && node.attr.parentConnector &&
				node.attr.parentConnector.label) || '',
			rect = anchor.getBoundingClientRect(),
			crect = container.getBoundingClientRect(),
			// clamp to the container's VISIBLE box (viewport coords), then
			// convert to content coords: the input is absolute inside the
			// scrolling container, so the scroll offsets must be added or a
			// scrolled map puts the editor far from the connector
			visibleLeft = Math.min(Math.max(4, rect.left - crect.left + rect.width / 2 - 110), crect.width - 224),
			visibleTop = Math.min(Math.max(4, rect.top - crect.top + rect.height / 2 - 14), crect.height - 32),
			input = document.createElement('input');
		input.type = 'text';
		input.className = 'connector-label-editor';
		input.value = current;
		input.style.left = (visibleLeft + container.scrollLeft) + 'px';
		input.style.top = (visibleTop + container.scrollTop) + 'px';
		container.appendChild(input);
		activeInput = input;
		mapModel.setInputEnabled(false, true); // engine hotkeys off while typing
		input.focus();
		input.select();

		const finish = function (commit) {
			if (!activeInput) { return; }
			const value = input.value.trim();
			activeInput = null;
			input.remove();
			mapModel.setInputEnabled(true);
			if (commit && value !== current) {
				content.mergeAttrProperty(connector.to, 'parentConnector', 'label', value || false);
			}
		};
		input.addEventListener('keydown', function (e) {
			e.stopPropagation();
			if (e.key === 'Enter') { finish(true); }
			if (e.key === 'Escape') { finish(false); }
		});
		input.addEventListener('blur', () => finish(true));
	}

	mapModel.addEventListener('lineLabelClicked', beginEdit);

	// ---- Stronger / Weaker popover (MindMup's connector width editor) ----
	let popover = null;
	const closePopover = function () {
			if (popover) { popover.remove(); popover = null; }
		},
		strongerIcon = '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M12 3l4.5 5h-9z" fill="currentColor"/><rect x="4" y="10.5" width="16" height="3" rx="1" fill="currentColor"/><path d="M12 21l-4.5-5h9z" fill="currentColor"/></svg>',
		weakerIcon = '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M12 10l-3.5-4h7z" fill="currentColor"/><rect x="5" y="11.25" width="14" height="1.5" rx="0.75" fill="currentColor"/><path d="M12 14l3.5 4h-7z" fill="currentColor"/></svg>',
		stepWidth = function (connector, delta) {
			const content = mapModel.getIdea(),
				pc = (content && content.getAttrById &&
					content.getAttrById(connector.to, 'parentConnector')) || {},
				// no explicit override yet: step from the width the theme is
				// actually drawing (3 in Simple, 4 in High impact)
				g = document.getElementById(connectorDomId(connector)),
				path = g && g.querySelector('path.mapjs-connector'),
				rendered = path && parseFloat(path.getAttribute('stroke-width')),
				current = pc.width || rendered || DEFAULT_CONNECTOR_WIDTH,
				next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, current + delta));
			if (next !== current) {
				content.mergeAttrProperty(connector.to, 'parentConnector', 'width', next);
			}
		},
		showPopover = function (connector, x, y) {
			closePopover();
			popover = document.createElement('div');
			popover.className = 'connector-popover';
			popover.addEventListener('mousedown', e => e.stopPropagation());
			const addTile = function (icon, label, onClick) {
					const b = document.createElement('button');
					b.type = 'button';
					b.className = 'cp-tile';
					b.innerHTML = icon + '<span>' + label + '</span>';
					b.addEventListener('click', function (e) {
						e.stopPropagation();
						onClick();
					});
					popover.appendChild(b);
				};
			addTile(strongerIcon, 'Stronger', () => stepWidth(connector, 1));
			addTile(weakerIcon, 'Weaker', () => stepWidth(connector, -1));
			addTile('<svg viewBox="0 0 24 24" width="26" height="26"><path d="M4 17.5L15.5 6a2.1 2.1 0 013 3L7 20.5l-4 1z" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
				'Label', function () {
					closePopover();
					beginEdit(connector);
				});
			document.body.appendChild(popover);
			const rect = popover.getBoundingClientRect();
			popover.style.left = Math.max(6, Math.min(x - rect.width / 2, window.innerWidth - rect.width - 6)) + 'px';
			popover.style.top = Math.max(6, Math.min(y - rect.height - 14, window.innerHeight - rect.height - 6)) + 'px';
		};
	document.addEventListener('mousedown', function (e) {
		if (popover && !popover.contains(e.target)) { closePopover(); }
	});
	document.addEventListener('keydown', function (e) {
		if (e.key === 'Escape') { closePopover(); }
	});

	// mapjs only fires lineLabelClicked when the click lands exactly on the
	// SVG <text> glyphs; most of a label is its background <rect>, and a
	// connector with no label has no text at all. Delegated listeners cover
	// everything: click on a label edits it, click elsewhere on a connector
	// (the engine draws a 12px-wide invisible hit path along the curve)
	// opens the Stronger/Weaker popover, double-click edits the label.
	const connectorForElement = function (target) {
		const g = target && target.closest && target.closest('[data-mapjs-role=connector]');
		return g && connectorsByDomId[g.id];
	};
	document.addEventListener('click', function (e) {
		const connector = connectorForElement(e.target);
		if (!connector || activeInput) { return; }
		if (e.target.closest('.mapjs-connector-text')) {
			beginEdit(connector);
		} else {
			showPopover(connector, e.clientX, e.clientY);
		}
	});
	document.addEventListener('dblclick', function (e) {
		const connector = connectorForElement(e.target);
		if (connector) {
			closePopover();
			beginEdit(connector);
		}
	});

	return {
		// menu path — works even when no label text is rendered to click.
		// The labelled connector in this grammar runs from a claim to its
		// bracket, so a selected premise resolves to its bracket first.
		editSelectedConnectorLabel() {
			const content = mapModel.getIdea(),
				selectedId = mapModel.getSelectedNodeId(),
				selected = selectedId && content && content.findSubIdeaById(selectedId);
			if (!selected) { return; }
			const parent = content.findParent(selected.id),
				target = (!isGroup(selected) && isGroup(parent)) ? parent : selected,
				targetParent = content.findParent(target.id);
			if (!targetParent || !targetParent.id) { return; }
			beginEdit({ from: targetParent.id, to: target.id });
		}
	};
}
