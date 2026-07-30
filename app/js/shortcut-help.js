/*global document, window, navigator, localStorage*/
/*
 * The keyboard reference — opened with ? or from Help > Keyboard shortcuts.
 *
 * SHORTCUT_GROUPS is the single source of truth for what the app claims its
 * keys do. The menu no longer keeps a list of its own, and features-e2e
 * cross-checks this table against shortcuts.js: every command bound to a key
 * there carries a `cmd` here, so a new binding that nobody documented fails
 * the suite rather than silently going missing from the help.
 *
 * Keys are stored platform-neutrally and rendered per platform. Mod is ⌘ on a
 * Mac and Ctrl on Windows/Linux; Alt is ⌥; the erase key is ⌫ on a Mac and
 * Delete (or Backspace) elsewhere; and Windows keeps Ctrl+Y as a second redo,
 * which mapjs binds and a Mac has no use for. Mac combinations are written the
 * way Apple writes them (⌘⇧Z, no separators), Windows with + between keys.
 * The modal detects the platform and offers a switch, so a Mac user preparing
 * for a room of Windows machines can read the other set.
 *
 * Rows without a `cmd` are handled by the engine (mapjs's own bindings) or by
 * the mouse; their behaviour was verified against the running app rather than
 * transcribed from the vendor's binding table.
 *
 * A row with `needs: 'neutral'` documents a key that only exists while View >
 * Allow neutral connectors is on, and is left out of the rendered table while
 * it is off — an unswitchable key in the reference would just read as broken.
 * It stays in SHORTCUT_GROUPS regardless, because that table is also what the
 * drift check compares against shortcuts.js: the binding is in the source
 * either way, so it has to be documented either way.
 */

import { track } from './analytics.js';
import { initModal } from './a11y.js';

const PLATFORM_KEY = 'because.help.platform',
	// token -> what is printed on that platform's keyboard
	KEY_TOKENS = {
		Mod: { mac: '⌘', win: 'Ctrl' },
		Alt: { mac: '⌥', win: 'Alt' },
		Shift: { mac: '⇧', win: 'Shift' },
		Erase: { mac: '⌫', win: 'Delete' }
	},
	esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export const SHORTCUT_GROUPS = [
	{
		title: 'Building the argument',
		rows: [
			{ keys: 'Enter', desc: 'Add a reason under the selected claim', cmd: 'addReason' },
			{ keys: 'Tab', desc: 'Add a co-premise — a second claim inside the same bracket, jointly making one reason', cmd: 'addCoPremise' },
			{ keys: 'Alt+O', desc: 'Add an objection to the selected claim', cmd: 'addObjection' },
			{ keys: 'Alt+Q', desc: 'Add a neutral connector — a blue flat bracket that asserts no relation, for tying a question to the claims that answer it, or a claim to a question it raises', cmd: 'addNeutral', needs: 'neutral' },
			{ keys: 'Alt+N', desc: 'Add a sticky note', cmd: 'addSticky' },
			{ keys: 'T', altKeys: 'Alt+T', desc: 'On a bracket, flip reason ⇄ objection; on a claim, flip implicit ⇄ explicit', cmd: 'toggleImplicit toggleReasonObjection' },
			{ keys: 'D', desc: 'Detach the selection from the tree — a claim with everything under it, or a whole reason or objection', cmd: 'detachNode' },
			{ keys: 'Erase', winNote: 'or Backspace', desc: 'Delete the selection' }
		]
	},
	{
		title: 'Moving around the map',
		rows: [
			{ keys: 'Arrows', desc: 'Move the selection through the map' },
			{ keys: 'Shift+Arrows', desc: 'Add the claim you move to, so several are selected at once' },
			{ keys: 'Mod+←', altKeys: 'Mod+→', desc: 'Reorder the selected claim among its co-premises' },
			{ keys: 'F', altKeys: '/', desc: 'Collapse or expand everything under the selection' },
			{ keys: 'Z', altKeys: 'Shift+Z', desc: 'Zoom in / zoom out', cmd: 'zoomIn zoomOut' }
		]
	},
	{
		title: 'Editing a claim',
		rows: [
			{ keys: 'F2', altKeys: 'Space', desc: 'Edit the text of the selected claim' },
			{ keys: 'Enter', desc: 'While editing: finish; Shift+Enter breaks the line' },
			{ keys: 'Escape', desc: 'While editing: cancel and keep the old text' },
			{ keys: 'Mod+B', desc: 'Bold — the whole claim, or the selected text while editing', cmd: 'toggleBold' },
			{ keys: 'Mod+I', desc: 'Italic', cmd: 'toggleItalic' },
			{ keys: 'Mod+U', desc: 'Underline', cmd: 'toggleUnderline' },
			{ keys: 'Mod+Shift+.', desc: 'Bigger claim text', cmd: 'fontBigger' },
			{ keys: 'Mod+Shift+,', desc: 'Smaller claim text', cmd: 'fontSmaller' }
		]
	},
	{
		title: 'The map as a whole',
		rows: [
			{ keys: 'Mod+Z', desc: 'Undo', cmd: 'undo' },
			{ keys: 'Mod+Shift+Z', winNote: 'or Ctrl+Y', desc: 'Redo', cmd: 'redo' },
			{ keys: 'Mod+C', desc: 'Copy the selected claim and everything under it', cmd: 'copy' },
			{ keys: 'Mod+V', desc: 'Paste it as a reason under the selection', cmd: 'paste' },
			{ keys: 'Shift+T', desc: 'Dark mode on / off', cmd: 'toggleDarkMode' },
			{ keys: '?', desc: 'Open this list', cmd: 'showShortcuts' }
		]
	},
	{
		title: 'With the mouse',
		mouse: true,
		rows: [
			{ keys: 'Click a claim number', desc: 'Replace it with your own text, up to 10 characters' },
			{ keys: 'Right-click a claim', desc: 'Colour and text style' },
			{ keys: 'Click a connector', desc: 'Make the line stronger or weaker, or edit its label' },
			{ keys: 'Double-click a connector', desc: 'Edit its label' },
			{ keys: 'Click above a nested bracket', desc: 'Label the reason or objection to that inference' },
			{ keys: 'Drag to blank canvas', desc: 'Detach the claim — the same as D' }
		]
	}
];

// what the help says the keyboard reaches, for the drift check in features-e2e
export function documentedCommands() {
	const out = [];
	SHORTCUT_GROUPS.forEach(g => g.rows.forEach(r => {
		if (r.cmd) { r.cmd.split(' ').forEach(c => { if (out.indexOf(c) < 0) { out.push(c); } }); }
	}));
	return out;
}

export function isMacPlatform() {
	const data = navigator.userAgentData,
		name = (data && data.platform) || navigator.platform || navigator.userAgent || '';
	return /mac|iphone|ipad|ipod/i.test(name);
}

// 'Mod+Shift+Z' -> '⌘⇧Z' on a Mac, 'Ctrl+Shift+Z' on Windows
export function renderCombo(combo, mac) {
	const parts = combo.split('+').map(function (token) {
		const known = KEY_TOKENS[token];
		return known ? (mac ? known.mac : known.win) : token;
	});
	return parts.join(mac ? '' : '+');
}

function rowKeysHtml(row, mac) {
	const combos = [row.keys];
	if (row.altKeys) { combos.push(row.altKeys); }
	let html = combos.map(c => '<kbd>' + esc(renderCombo(c, mac)) + '</kbd>').join(' <span class="kbd-or">or</span> ');
	if (!mac && row.winNote) { html += ' <span class="kbd-or">' + esc(row.winNote) + '</span>'; }
	return html;
}

export function renderShortcutsHtml(mac, allowNeutral) {
	const shown = rows => rows.filter(r => r.needs !== 'neutral' || allowNeutral);
	return SHORTCUT_GROUPS.map(function (group) {
		return '<section class="shortcut-group"><h3>' + esc(group.title) + '</h3>' +
			'<table class="kbd' + (group.mouse ? ' kbd-mouse' : '') + '"><tbody>' +
			shown(group.rows).map(r => '<tr><td class="kbd-keys">' + rowKeysHtml(r, mac) +
				'</td><td>' + esc(r.desc) + '</td></tr>').join('') +
			'</tbody></table></section>';
	}).join('');
}

export function makeShortcutHelp(neutralPref) {
	let overlay = null,
		modal = null,
		mac = isMacPlatform();

	// a chosen platform outlives the dialog (a teacher demoing the other set
	// reopens it repeatedly), but not the session — a fresh load detects again
	try {
		const saved = localStorage.getItem(PLATFORM_KEY);
		if (saved === 'mac' || saved === 'win') { mac = saved === 'mac'; }
	} catch (e) { /* private mode */ }

	const paint = function () {
			overlay.querySelector('.shortcut-groups').innerHTML =
				renderShortcutsHtml(mac, !!(neutralPref && neutralPref.isOn()));
			Array.from(overlay.querySelectorAll('.plat-btn')).forEach(function (b) {
				const on = (b.dataset.plat === 'mac') === mac;
				b.setAttribute('aria-pressed', on ? 'true' : 'false');
				b.classList.toggle('on', on);
			});
		},
		setPlatform = function (nextMac) {
			if (nextMac === mac) { return; }
			mac = nextMac;
			try { localStorage.setItem(PLATFORM_KEY, mac ? 'mac' : 'win'); } catch (e) { /* private mode */ }
			track('help_platform', { platform: mac ? 'mac' : 'windows' });
			paint();
		},
		close = function () {
			if (modal) { modal.close(); modal = null; }
			overlay = null;
		},
		show = function () {
			if (overlay) { return; }
			track('help_open', { panel: 'shortcuts' });
			overlay = document.createElement('div');
			overlay.className = 'panel-overlay';
			overlay.innerHTML =
				'<div class="panel shortcuts-panel">' +
				'<div class="shortcuts-head">' +
				'<h2>Keyboard shortcuts</h2>' +
				'<div class="plat-switch" role="group" aria-label="Show keys for">' +
				'<button type="button" class="plat-btn" data-plat="mac" aria-pressed="false">Mac</button>' +
				'<button type="button" class="plat-btn" data-plat="win" aria-pressed="false">Windows</button>' +
				'</div></div>' +
				'<p class="shortcuts-note">Keys act on the map: click a claim first, or press ' +
				'Tab from the toolbar to bring the map into focus.</p>' +
				'<div class="shortcut-groups"></div>' +
				'<div class="panel-close"><button type="button">Close</button></div>' +
				'</div>';
			Array.from(overlay.querySelectorAll('.plat-btn')).forEach(function (b) {
				b.addEventListener('click', () => setPlatform(b.dataset.plat === 'mac'));
			});
			overlay.querySelector('.panel-close button').addEventListener('click', close);
			overlay.addEventListener('click', function (e) { if (e.target === overlay) { close(); } });
			document.body.appendChild(overlay);
			paint();
			// the dialog itself takes focus, so a screen reader reads the title
			// before the platform switch rather than landing inside the controls.
			// Escape routes through close() rather than initModal's own path, so
			// the open/closed state here can't go stale and refuse to reopen
			modal = initModal(overlay, {
				initialFocus: overlay.querySelector('.panel'),
				onRequestClose: close
			});
		};

	return {
		show,
		close,
		isOpen: () => !!overlay,
		isMac: () => mac,
		documentedCommands
	};
}
