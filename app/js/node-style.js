/*global document, window*/
/*
 * Right-click node formatting popover: background colour swatches, text
 * size steppers and bold/italic/underline for the selected claim(s).
 * The popover is chrome; what it writes (attr.style.background,
 * attr.style.fontMultiplier, title formatting) is map data — undoable
 * and serialized, exactly the attributes MindMup maps already carry.
 *
 * mapjs already routes right-clicks: the DomMapController selects the
 * node and calls mapModel.requestContextMenu, which dispatches
 * contextMenuRequested(nodeId, pageX, pageY) and suppresses the browser
 * menu. This module is the listener MindMup's closed app layer used to be.
 */

import { track } from './analytics.js';

const SWATCHES = [
	['None', false],
	['White', '#ffffff'],
	['Grey', '#d3d3d3'],
	['Cyan', '#e0ffff'],
	['Lemon', '#fafad2'],
	['Coral', '#f08080'],
	['Mint', '#c9e7c9'],
	['Sky', '#cfe6f5']
];

export function makeNodeStyle(engine, commands) {
	const mapModel = engine.mapModel;
	let popover = null,
		previouslyFocused = null;

	const nodeDomId = id => ('node_' + id).replace(/[^A-Za-z0-9_-]/g, '_'),
		// restore focus to the remembered element, else the selected node's
		// DOM element, else the map container
		restoreFocus = function () {
			if (previouslyFocused && previouslyFocused.focus &&
					document.contains(previouslyFocused)) {
				previouslyFocused.focus();
				return;
			}
			const id = mapModel.getSelectedNodeId(),
				node = id && document.getElementById(nodeDomId(id));
			if (node) { node.focus(); return; }
			const container = document.getElementById('map-container');
			if (container) { container.focus(); }
		},
		close = function () {
			if (!popover) { return; }
			const hadFocus = popover.contains(document.activeElement);
			popover.remove();
			popover = null;
			// only steal focus back if it was inside the popover
			if (hadFocus) { restoreFocus(); }
			previouslyFocused = null;
		},
		selectedNode = function () {
			return mapModel.findIdeaById(mapModel.getSelectedNodeId());
		},
		currentBackground = function () {
			const node = selectedNode(),
				style = (node && node.attr && node.attr.style) || {};
			return style.background || style.backgroundColor || false;
		},
		setBackground = function (color) {
			const content = mapModel.getIdea();
			if (!content) { return; }
			// one undo step: write the modern key, drop the legacy one
			content.batch(function () {
				mapModel.updateStyle('ui', 'background', color);
				mapModel.updateStyle('ui', 'backgroundColor', false);
			});
		},
		addButton = function (parent, className, title, html, onClick) {
			const b = document.createElement('button');
			b.type = 'button';
			b.className = className;
			b.title = title;
			b.innerHTML = html;
			b.addEventListener('click', onClick);
			parent.appendChild(b);
			return b;
		},
		refreshSwatches = function () {
			if (!popover) { return; }
			const current = String(currentBackground() || '').toLowerCase();
			popover.querySelectorAll('.ns-swatch').forEach(function (el) {
				const on = (el.dataset.color || '') === current;
				el.classList.toggle('current', on);
				el.setAttribute('aria-pressed', on ? 'true' : 'false');
			});
		},
		show = function (x, y) {
			close();
			const node = selectedNode();
			if (!node) { return; }
			previouslyFocused = document.activeElement;
			popover = document.createElement('div');
			popover.className = 'node-style-popover';
			popover.setAttribute('role', 'dialog');
			popover.setAttribute('aria-label', 'Node colour and style');
			// clicks inside must not bubble to the close-on-click-away handler
			popover.addEventListener('mousedown', e => e.stopPropagation());
			popover.addEventListener('click', e => e.stopPropagation());
			// trap Tab inside the popover, wrapping at the ends
			popover.addEventListener('keydown', function (e) {
				if (e.key !== 'Tab') { return; }
				const items = Array.from(popover.querySelectorAll('button, input'));
				if (!items.length) { return; }
				e.preventDefault();
				const at = items.indexOf(document.activeElement),
					next = e.shiftKey ?
						(at <= 0 ? items.length - 1 : at - 1) :
						(at < 0 || at === items.length - 1 ? 0 : at + 1);
				items[next].focus();
			});

			const swatchRow = document.createElement('div');
			swatchRow.className = 'ns-row ns-swatches';
			SWATCHES.forEach(function ([name, color]) {
				const b = addButton(swatchRow, 'ns-swatch' + (color ? '' : ' ns-none'), name, '', function () {
					setBackground(color);
					refreshSwatches();
					// the swatch NAME is app chrome, not user data
					track('node_style', { action: color ? 'background_swatch' : 'background_clear', swatch: name });
				});
				b.setAttribute('aria-label', name);
				if (color) {
					b.style.background = color;
					b.dataset.color = color;
				}
			});
			const customInput = document.createElement('input');
			customInput.type = 'color';
			customInput.className = 'ns-custom';
			customInput.title = 'Custom colour…';
			customInput.setAttribute('aria-label', 'Custom colour');
			customInput.value = /^#[0-9a-f]{6}$/i.test(currentBackground() || '') ? currentBackground() : '#fafad2';
			customInput.addEventListener('input', function () {
				setBackground(customInput.value);
				refreshSwatches();
			});
			// 'change' fires once when the picker closes; 'input' fires on
			// every drag step and would spray events
			customInput.addEventListener('change', () => track('node_style', { action: 'background_custom' }));
			swatchRow.appendChild(customInput);

			const textRow = document.createElement('div');
			textRow.className = 'ns-row ns-text';
			addButton(textRow, 'ns-btn', 'Smaller text (⌘⇧,)', 'A<small>−</small>', commands.fontSmaller);
			addButton(textRow, 'ns-btn', 'Bigger text (⌘⇧.)', 'A<small>+</small>', commands.fontBigger);
			const sep = document.createElement('span');
			sep.className = 'ns-sep';
			textRow.appendChild(sep);
			addButton(textRow, 'ns-btn ns-b', 'Bold (⌘B)', 'B', commands.toggleBold);
			addButton(textRow, 'ns-btn ns-i', 'Italic (⌘I)', 'I', commands.toggleItalic);
			addButton(textRow, 'ns-btn ns-u', 'Underline (⌘U)', 'U', commands.toggleUnderline);

			popover.append(swatchRow, textRow);
			document.body.appendChild(popover);
			refreshSwatches();

			const rect = popover.getBoundingClientRect();
			popover.style.left = Math.max(6, Math.min(x, window.innerWidth - rect.width - 6)) + 'px';
			popover.style.top = Math.max(6, Math.min(y, window.innerHeight - rect.height - 6)) + 'px';

			// focus the first swatch so the keyboard lands inside the popover
			const firstSwatch = popover.querySelector('.ns-swatch');
			if (firstSwatch) { firstSwatch.focus(); }
		};

	mapModel.addEventListener('contextMenuRequested', function (nodeId, x, y) {
		track('node_style', { action: 'popover_open', method: 'right_click' });
		show(x, y);
	});
	document.addEventListener('mousedown', function (e) {
		if (popover && !popover.contains(e.target)) { close(); }
	});
	document.addEventListener('keydown', function (e) {
		if (e.key === 'Escape') { close(); }
	});

	return {
		close,
		// menu entry path: anchor the popover to the selected node
		openForSelection() {
			const id = mapModel.getSelectedNodeId(),
				el = id && document.getElementById(('node_' + id).replace(/[^A-Za-z0-9_-]/g, '_'));
			if (!el) { return; }
			const rect = el.getBoundingClientRect();
			show(rect.left, rect.bottom + 6);
		}
	};
}
