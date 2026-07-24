/*global document, window*/
/*
 * Menu bar: File / Insert / Edit / View / Argument Visualization / Help.
 * Pure DOM, no framework. Implements the WAI-ARIA menubar pattern:
 * roving tabindex across titles (one Tab stop), full arrow-key nav,
 * proper roles for checkbox/radio items. Menus close on click-away,
 * Escape, or Tab-out.
 */

import { track } from './analytics.js';
import { initModal } from './a11y.js';

export function buildMenus(el, commands, io, engine, drive, onedrive, darkMode, labelEdit, nodeStyle, intro, numberEdit) {
	const driveItem = run => () => {
			if (drive && drive.isConfigured()) { run(); } else { showDriveSetup(); }
		},
		oneDriveItem = run => () => {
			if (onedrive && onedrive.isConfigured()) { run(); } else { showOneDriveSetup(); }
		},
		spec = [
		['File', () => [
			['New', () => io.newMap()],
			['Open…', () => io.open()],
			['Save', () => io.save(false)],
			['Save As…', () => io.save(true)],
			[(io.autoSaveEnabled() ? '✓ ' : '') + 'Auto-save', () => {
				const on = !io.autoSaveEnabled();
				io.setAutoSave(on);
				if (on && !io.canAutoSave()) { showAutoSaveInfo(); }
			}, { check: io.autoSaveEnabled() }],
			['—'],
			['Open from Google Drive…', driveItem(() => drive.open())],
			[(drive && drive.currentFile() ? '✓ ' : '') + 'Save to Google Drive', driveItem(() => drive.save(false))],
			['Save a copy in Drive…', driveItem(() => drive.save(true))],
			['Share from Google Drive…', driveItem(shareFromDrive)],
			['Switch Google Drive account…' + (drive && drive.account && drive.account() ?
				' (' + drive.account() + ')' : ''), driveItem(() => drive.switchAccount())],
			['—'],
			['Open from OneDrive…', oneDriveItem(() => onedrive.open())],
			[(onedrive && onedrive.currentFile() ? '✓ ' : '') + 'Save to OneDrive', oneDriveItem(() => onedrive.save(false))],
			['Save a copy in OneDrive…', oneDriveItem(() => onedrive.save(true))],
			['Share from OneDrive…', oneDriveItem(shareFromOneDrive)],
			['Switch Microsoft account…' + (onedrive && onedrive.account && onedrive.account() ?
				' (' + onedrive.account() + ')' : ''), oneDriveItem(() => onedrive.switchAccount())],
			['—'],
			['Print / Save as PDF', () => window.print()]
		]],
		['Insert', () => [
			['Reason (Enter)', commands.addReason],
			['Objection (Alt+O)', commands.addObjection],
			['Co-premise (Tab)', commands.addCoPremise],
			['Sticky note (Alt+N)', commands.addSticky],
			['—'],
			['Parent reason above selection', commands.insertParentReason]
		]],
		['Edit', () => [
			['Undo (⌘Z)', commands.undo],
			['Redo (⌘⇧Z)', commands.redo],
			['—'],
			['Copy (⌘C)', commands.copy],
			['Paste as reason (⌘V)', commands.paste],
			['—'],
			['Edit text (F2)', commands.editNode],
			['Edit claim number… (or click the number)', () => numberEdit.editSelectedNumber()],
			['Delete (⌫)', commands.deleteNode],
			['—'],
			['Bold (⌘B)', commands.toggleBold],
			['Italic (⌘I)', commands.toggleItalic],
			['Underline (⌘U)', commands.toggleUnderline],
			['—'],
			['Bigger text (⌘⇧.)', commands.fontBigger],
			['Smaller text (⌘⇧,)', commands.fontSmaller],
			['Node colour & style… (right-click a node)', () => nodeStyle.openForSelection()]
		]],
		['View', () => [
			['Zoom in (Z)', commands.zoomIn],
			['Zoom out (Shift+Z)', commands.zoomOut],
			['Reset view', commands.zoomReset],
			['—'],
			['Collapse / expand branch (F)', commands.toggleCollapse],
			[(engine.getLabelsOn() ? '✓ ' : '') + 'Claim numbering', commands.toggleNumbering, { check: engine.getLabelsOn() }],
			[(darkMode && darkMode.isDark() ? '✓ ' : '') + 'Dark mode (Shift+T)', () => darkMode.toggle(), { check: !!(darkMode && darkMode.isDark()) }],
			['—'],
			[(engine.getThemeName() === 'argMappingSimple' ? '✓ ' : '') + 'Theme: Simple', () => {
				track('theme_select', { theme: 'simple' });
				engine.setThemeByName('argMappingSimple');
			}, { radio: engine.getThemeName() === 'argMappingSimple' }],
			[(engine.getThemeName() === 'argMappingHighImpact' ? '✓ ' : '') + 'Theme: High-impact downward (Because / But, arrows down)', () => {
				track('theme_select', { theme: 'high_impact' });
				engine.setThemeByName('argMappingHighImpact');
			}, { radio: engine.getThemeName() === 'argMappingHighImpact' }],
			[(engine.getThemeName() === 'argMappingHighImpactUpward' ? '✓ ' : '') + 'Theme: High-impact upward (Therefore, arrows up)', () => {
				track('theme_select', { theme: 'high_impact_upward' });
				engine.setThemeByName('argMappingHighImpactUpward');
			}, { radio: engine.getThemeName() === 'argMappingHighImpactUpward' }]
		]],
		['Argument Visualization', () => [
			['Toggle implicit claim (T)', commands.toggleImplicit],
			['Toggle reason ⇄ objection (T on a bracket)', commands.toggleReasonObjection],
			['Edit connector label…', () => labelEdit.editSelectedConnectorLabel()],
			['Stronger connector', () => labelEdit.strongerSelectedConnector()],
			['Weaker connector', () => labelEdit.weakerSelectedConnector()],
			['Mark claim false / true / clear', commands.cycleEvaluation]
		]],
		['Help', () => [
			['Welcome to Because', () => intro.show()],
			['Keyboard shortcuts', showShortcuts],
			['About Because', showAbout],
			['—'],
			['Privacy policy', () => window.open('https://app.philmaps.com/privacy', '_blank')],
			['Terms of service', () => window.open('https://app.philmaps.com/terms', '_blank')]
		]]
	];

	let openMenu = null,
		openTitle = null;
	const titles = [],
		closeAll = function () {
			if (openMenu) { openMenu.remove(); openMenu = null; }
			if (openTitle) {
				openTitle.classList.remove('open');
				openTitle.setAttribute('aria-expanded', 'false');
				openTitle = null;
			}
		},
		// move the single Tab stop to a given title
		setRoving = function (title) {
			titles.forEach(t => t.setAttribute('tabindex', t === title ? '0' : '-1'));
		},
		// run an item's action: close everything, hand focus to the map so
		// map shortcuts work immediately, then act (a dialog will grab focus)
		activate = function (run) {
			closeAll();
			const container = document.getElementById('map-container');
			if (container) { container.focus(); }
			run();
		},
		menuItems = function (menu) {
			return Array.from(menu.querySelectorAll('.menu-item'));
		},
		focusFirstItem = function (menu) {
			const items = menuItems(menu);
			if (items.length) { items[0].focus(); }
		},
		focusLastItem = function (menu) {
			const items = menuItems(menu);
			if (items.length) { items[items.length - 1].focus(); }
		};

	// build one dropdown for a title, wired for mouse + keyboard
	function openFor(title) {
		closeAll();
		title.classList.add('open');
		title.setAttribute('aria-expanded', 'true');
		const menu = document.createElement('div');
		menu.className = 'menu-dropdown';
		menu.setAttribute('role', 'menu');
		menu.setAttribute('aria-label', title.textContent);
		title.spec().forEach(([label, run, opts]) => {
			if (label === '—') {
				const hr = document.createElement('div');
				hr.className = 'menu-sep';
				hr.setAttribute('role', 'separator');
				menu.appendChild(hr);
				return;
			}
			const item = document.createElement('button');
			item.type = 'button';
			item.className = 'menu-item';
			item.textContent = label;
			item.setAttribute('tabindex', '-1');
			if (opts && 'check' in opts) {
				item.setAttribute('role', 'menuitemcheckbox');
				item.setAttribute('aria-checked', opts.check ? 'true' : 'false');
			} else if (opts && 'radio' in opts) {
				item.setAttribute('role', 'menuitemradio');
				item.setAttribute('aria-checked', opts.radio ? 'true' : 'false');
			} else {
				item.setAttribute('role', 'menuitem');
			}
			item.addEventListener('mousedown', e => e.preventDefault());
			item.addEventListener('click', () => activate(run));
			menu.appendChild(item);
		});
		menu.addEventListener('keydown', e => onMenuKey(e, title, menu));
		const rect = title.getBoundingClientRect();
		menu.style.left = rect.left + 'px';
		menu.style.top = rect.bottom + 2 + 'px';
		document.body.appendChild(menu);
		openMenu = menu;
		openTitle = title;
		return menu;
	}

	// focus a title, moving the roving Tab stop with it; optionally open it
	function focusTitle(title, open) {
		setRoving(title);
		title.focus();
		if (open) { openFor(title); }
	}

	function siblingTitle(title, dir) {
		const i = titles.indexOf(title);
		return titles[(i + dir + titles.length) % titles.length];
	}

	// keyboard on a menubar title (APG menubar pattern)
	function onTitleKey(e, title) {
		const wasOpen = title === openTitle;
		switch (e.key) {
		case 'ArrowRight':
			e.preventDefault();
			focusTitle(siblingTitle(title, 1), wasOpen);
			break;
		case 'ArrowLeft':
			e.preventDefault();
			focusTitle(siblingTitle(title, -1), wasOpen);
			break;
		case 'ArrowDown':
		case 'Enter':
		case ' ':
			e.preventDefault();
			focusFirstItem(openFor(title));
			break;
		case 'Home':
			e.preventDefault();
			focusTitle(titles[0], wasOpen);
			break;
		case 'End':
			e.preventDefault();
			focusTitle(titles[titles.length - 1], wasOpen);
			break;
		case 'Escape':
			e.preventDefault();
			closeAll();
			break;
		}
	}

	// keyboard inside an open dropdown (APG menu pattern)
	function onMenuKey(e, title, menu) {
		const items = menuItems(menu),
			at = items.indexOf(document.activeElement);
		switch (e.key) {
		case 'ArrowDown':
			e.preventDefault();
			items[(at + 1) % items.length].focus();
			break;
		case 'ArrowUp':
			e.preventDefault();
			items[(at - 1 + items.length) % items.length].focus();
			break;
		case 'Home':
			e.preventDefault();
			if (items.length) { items[0].focus(); }
			break;
		case 'End':
			e.preventDefault();
			if (items.length) { items[items.length - 1].focus(); }
			break;
		case 'Enter':
		case ' ':
			e.preventDefault();
			if (at >= 0) { items[at].click(); }
			break;
		case 'Escape':
			e.preventDefault();
			closeAll();
			focusTitle(title);
			break;
		case 'ArrowRight':
			e.preventDefault();
			focusFirstItem(openFor(siblingTitle(title, 1)));
			setRoving(openTitle);
			break;
		case 'ArrowLeft':
			e.preventDefault();
			focusFirstItem(openFor(siblingTitle(title, -1)));
			setRoving(openTitle);
			break;
		case 'Tab':
			// APG: Tab exits the menu system — close but don't prevent
			closeAll();
			break;
		}
	}

	function showPanel(html) {
		closeAll();
		const overlay = document.createElement('div');
		overlay.className = 'panel-overlay';
		overlay.innerHTML = '<div class="panel">' + html + '<div class="panel-close"><button>Close</button></div></div>';
		document.body.appendChild(overlay);
		const modal = initModal(overlay);
		overlay.querySelector('button').addEventListener('click', () => modal.close());
		overlay.addEventListener('click', e => { if (e.target === overlay) { modal.close(); } });
		return { overlay, modal };
	}

	function driveFileUrl(id) {
		return 'https://drive.google.com/file/d/' + encodeURIComponent(id) + '/view';
	}

	// Sharing happens on the file's own page at the cloud service
	// (first-party, native Share button there). The embedded sharing
	// widgets (Google's gapi dialog, Microsoft's picker-style embeds)
	// are not an option: they require third-party cookies, which Safari
	// blocks by default, and fail with no error callback to fall back on.
	function shareFromDrive() {
		shareFromCloud('Google Drive', 'drive_share',
			() => { const f = drive.currentFile(); return f && { name: f.name, url: driveFileUrl(f.id) }; },
			() => drive.save(false));
	}

	function shareFromOneDrive() {
		shareFromCloud('OneDrive', 'onedrive_share',
			() => { const f = onedrive.currentFile(); return f && f.webUrl && { name: f.name, url: f.webUrl }; },
			() => onedrive.save(false));
	}

	function shareFromCloud(service, event, current, save) {
		const file = current();
		if (file) {
			// synchronously inside the menu click — a popup opened after an
			// await has lost the user gesture and gets blocked in Safari
			window.open(file.url, '_blank');
			track(event, { method: 'direct' });
			return;
		}
		if (!window.confirm('“' + io.fileName() + '” isn’t in ' + service + ' yet.\n\n' +
				'Save it to ' + service + ' now? You can then share it from ' + service + '.')) {
			return;
		}
		save().then(function (saved) {
			const f = current();
			if (saved && f) { showSharePanel(service, event, f); }
		});
	}

	function showSharePanel(service, event, file) {
		track(event, { method: 'after_save' });
		const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])),
			// a real link, not window.open: the save above was async, so the
			// menu-click gesture is spent and Safari would block a popup
			ref = showPanel(
				'<h2>Share from ' + service + '</h2>' +
				'<p>“' + esc(file.name) + '” is now saved in ' + service + '.</p>' +
				'<p><a href="' + esc(file.url) + '" target="_blank">Open it in ' + service + '</a> ' +
				'and use the <b>Share</b> button there to invite people or copy a link.</p>'
			);
		ref.overlay.querySelector('a[target]').addEventListener('click', () => ref.modal.close());
	}

	function showShortcuts() {
		track('help_open', { panel: 'shortcuts' });
		showPanel(
			'<h2>Keyboard shortcuts</h2><table class="kbd">' +
			[['Enter', 'add reason under selected claim'],
				['Tab', 'add co-premise to selected claim'],
				['Alt + O', 'add objection'],
				['T or Alt + T', 'toggle reason/objection (on a bracket) or implicit/explicit (on a claim)'],
				['Alt + N', 'add sticky note'],
				['Arrows', 'navigate the tree'],
				['Z / Shift+Z', 'zoom in / out'],
				['Shift+T', 'dark / light mode'],
				['F2 or Space', 'edit the selected claim'],
				['F', 'collapse / expand branch'],
				['Delete', 'remove selection'],
				['⌘Z / ⌘⇧Z', 'undo / redo'],
				['⌘B / ⌘I / ⌘U', 'bold / italic / underline (whole claim, or the selection while editing)'],
				['⌘⇧. / ⌘⇧,', 'bigger / smaller claim text'],
				['Right-click', 'node colour &amp; text style'],
				['Click a connector', 'stronger / weaker line, edit its label'],
				['Double-click a connector', 'edit its label'],
				['Click a claim number', 'replace it with your own text (up to 10 characters)']
			].map(r => '<tr><td><kbd>' + r[0] + '</kbd></td><td>' + r[1] + '</td></tr>').join('') +
			'</table>'
		);
	}

	function showAutoSaveInfo() {
		showPanel(
			'<h2>Auto-save is on</h2>' +
			'<p>Each change will be saved straight back to the map’s own file — ' +
			'but this map doesn’t have one the browser can write to yet.</p>' +
			'<p>Open the map from Google Drive or use <b>File &gt; Save to Google Drive</b>; ' +
			'from then on every change saves there automatically. In Chrome and Edge, ' +
			'a local file chosen with <b>File &gt; Save</b> works too. ' +
			'Until then, keep saving with <b>File &gt; Save</b>.</p>'
		);
	}

	function showDriveSetup() {
		track('help_open', { panel: 'drive_setup' });
		showPanel(
			'<h2>Google Drive is not connected yet</h2>' +
			'<p>This deployment has no OAuth client configured, so Drive open/save is switched off. ' +
			'To enable it, create an OAuth 2.0 Web client in the Google Cloud Console and put its ' +
			'client ID in <code>app/js/config.js</code> — the exact steps are in ' +
			'<code>docs/drive-setup.md</code> in the repository.</p>' +
			'<p>Local files keep working: use <b>File &gt; Open…</b> and <b>Save</b>.</p>'
		);
	}

	function showOneDriveSetup() {
		track('help_open', { panel: 'onedrive_setup' });
		showPanel(
			'<h2>OneDrive is not connected yet</h2>' +
			'<p>This deployment has no Microsoft Entra app configured, so OneDrive open/save is ' +
			'switched off. To enable it, register a free Entra app with a Single-page application ' +
			'platform and put its Application (client) ID in <code>app/js/config.js</code> — the ' +
			'exact steps are in <code>docs/onedrive-setup.md</code> in the repository.</p>' +
			'<p>Local files keep working: use <b>File &gt; Open…</b> and <b>Save</b>.</p>'
		);
	}

	function showAbout() {
		track('help_open', { panel: 'about' });
		showPanel(
			'<h2>Because</h2>' +
			'<p>A standalone editor for MindMup argument visualizations (.mup files), ' +
			'built on the MIT-licensed <a href="https://github.com/mindmup/mapjs">mindmup/mapjs</a> engine — ' +
			'the same renderer MindMup used, so existing maps open unchanged.</p>' +
			'<p>Co-premises share one bracket (joint support); independent reasons get separate brackets. ' +
			'Green rounded bracket = supporting, red square bracket = objection, ' +
			'dashed = implicit claim.</p>' +
			'<p><a href="https://app.philmaps.com/privacy" target="_blank">Privacy policy</a> · ' +
			'<a href="https://app.philmaps.com/terms" target="_blank">Terms of service</a></p>'
		);
	}

	spec.forEach(([title, items], i) => {
		const t = document.createElement('button');
		t.type = 'button';
		t.className = 'menu-title';
		t.textContent = title;
		t.setAttribute('role', 'menuitem');
		t.setAttribute('aria-haspopup', 'true');
		t.setAttribute('aria-expanded', 'false');
		t.setAttribute('tabindex', i === 0 ? '0' : '-1');
		t.spec = items; // stash the lazy item builder for openFor
		t.addEventListener('mousedown', e => e.preventDefault());
		t.addEventListener('click', function () {
			if (t === openTitle) { closeAll(); return; }
			setRoving(t);
			openFor(t);
		});
		t.addEventListener('keydown', e => onTitleKey(e, t));
		titles.push(t);
		el.appendChild(t);
	});

	document.addEventListener('click', function (e) {
		if (openMenu && !openMenu.contains(e.target) && !el.contains(e.target)) { closeAll(); }
	});
	document.addEventListener('keydown', function (e) {
		if (e.key === 'Escape') { closeAll(); }
	});
}
