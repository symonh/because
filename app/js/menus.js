/*global document, window*/
/*
 * Menu bar: File / Insert / Edit / View / Argument Visualization / Help.
 * Pure DOM, no framework. Menus close on click-away or Escape.
 */

export function buildMenus(el, commands, io, engine, drive, darkMode) {
	const driveItem = run => () => {
			if (drive && drive.isConfigured()) { run(); } else { showDriveSetup(); }
		},
		spec = [
		['File', () => [
			['New', () => io.newMap()],
			['Open…', () => io.open()],
			['Save', () => io.save(false)],
			['Save As…', () => io.save(true)],
			['—'],
			['Open from Google Drive…', driveItem(() => drive.open())],
			[(drive && drive.currentFile() ? '✓ ' : '') + 'Save to Google Drive', driveItem(() => drive.save(false))],
			['Save a copy in Drive…', driveItem(() => drive.save(true))],
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
			['Edit text (F2)', commands.editNode],
			['Delete (⌫)', commands.deleteNode]
		]],
		['View', () => [
			['Zoom in (Z)', commands.zoomIn],
			['Zoom out (Shift+Z)', commands.zoomOut],
			['Reset view', commands.zoomReset],
			['—'],
			['Collapse / expand branch (F)', commands.toggleCollapse],
			[(engine.getLabelsOn() ? '✓ ' : '') + 'Claim numbering', commands.toggleNumbering],
			[(darkMode && darkMode.isDark() ? '✓ ' : '') + 'Dark mode', () => darkMode.toggle()]
		]],
		['Argument Visualization', () => [
			['Toggle implicit claim (T)', commands.toggleImplicit],
			['Toggle reason ⇄ objection (T on a bracket)', commands.toggleReasonObjection],
			['Mark claim false / true / clear', commands.cycleEvaluation],
			['—'],
			[(engine.getThemeName() === 'argMappingSimple' ? '✓ ' : '') + 'Theme: Simple', () => engine.setThemeByName('argMappingSimple')],
			[(engine.getThemeName() === 'argMappingHighImpact' ? '✓ ' : '') + 'Theme: High impact ("because…")', () => engine.setThemeByName('argMappingHighImpact')]
		]],
		['Help', () => [
			['Keyboard shortcuts', showShortcuts],
			['About Because', showAbout]
		]]
	];

	let openMenu = null;
	const closeAll = function () {
		if (openMenu) { openMenu.remove(); openMenu = null; }
		el.querySelectorAll('.menu-title.open').forEach(t => t.classList.remove('open'));
	};

	function showPanel(html) {
		closeAll();
		const overlay = document.createElement('div');
		overlay.className = 'panel-overlay';
		overlay.innerHTML = '<div class="panel">' + html + '<div class="panel-close"><button>Close</button></div></div>';
		overlay.querySelector('button').addEventListener('click', () => overlay.remove());
		overlay.addEventListener('click', e => { if (e.target === overlay) { overlay.remove(); } });
		document.body.appendChild(overlay);
	}

	function showShortcuts() {
		showPanel(
			'<h2>Keyboard shortcuts</h2><table class="kbd">' +
			[['Enter', 'add reason under selected claim'],
				['Tab', 'add co-premise to selected claim'],
				['Alt + O', 'add objection'],
				['T or Alt + T', 'toggle reason/objection (on a bracket) or implicit/explicit (on a claim)'],
				['Alt + N', 'add sticky note'],
				['Arrows', 'navigate the tree'],
				['Z / Shift+Z', 'zoom in / out'],
				['F2 or Space', 'edit the selected claim'],
				['F', 'collapse / expand branch'],
				['Delete', 'remove selection'],
				['⌘Z / ⌘⇧Z', 'undo / redo']
			].map(r => '<tr><td><kbd>' + r[0] + '</kbd></td><td>' + r[1] + '</td></tr>').join('') +
			'</table>'
		);
	}

	function showDriveSetup() {
		showPanel(
			'<h2>Google Drive is not connected yet</h2>' +
			'<p>This deployment has no OAuth client configured, so Drive open/save is switched off. ' +
			'To enable it, create an OAuth 2.0 Web client in the Google Cloud Console and put its ' +
			'client ID in <code>app/js/config.js</code> — the exact steps are in ' +
			'<code>docs/drive-setup.md</code> in the repository.</p>' +
			'<p>Local files keep working: use <b>File &gt; Open…</b> and <b>Save</b>.</p>'
		);
	}

	function showAbout() {
		showPanel(
			'<h2>Because</h2>' +
			'<p>A standalone editor for MindMup argument visualizations (.mup files), ' +
			'built on the MIT-licensed <a href="https://github.com/mindmup/mapjs">mindmup/mapjs</a> engine — ' +
			'the same renderer MindMup used, so existing maps open unchanged.</p>' +
			'<p>Co-premises share one bracket (joint support); independent reasons get separate brackets. ' +
			'Green = supporting, red = objection, dashed = implicit claim.</p>'
		);
	}

	spec.forEach(([title, items]) => {
		const t = document.createElement('span');
		t.className = 'menu-title';
		t.textContent = title;
		t.addEventListener('mousedown', e => e.preventDefault());
		t.addEventListener('click', function () {
			if (t.classList.contains('open')) { closeAll(); return; }
			closeAll();
			t.classList.add('open');
			const menu = document.createElement('div');
			menu.className = 'menu-dropdown';
			items().forEach(([label, run]) => {
				if (label === '—') {
					const hr = document.createElement('div');
					hr.className = 'menu-sep';
					menu.appendChild(hr);
					return;
				}
				const item = document.createElement('div');
				item.className = 'menu-item';
				item.textContent = label;
				item.addEventListener('mousedown', e => e.preventDefault());
				item.addEventListener('click', () => { closeAll(); run(); });
				menu.appendChild(item);
			});
			const rect = t.getBoundingClientRect();
			menu.style.left = rect.left + 'px';
			menu.style.top = rect.bottom + 2 + 'px';
			document.body.appendChild(menu);
			openMenu = menu;
		});
		el.appendChild(t);
	});

	document.addEventListener('click', function (e) {
		if (openMenu && !openMenu.contains(e.target) && !el.contains(e.target)) { closeAll(); }
	});
	document.addEventListener('keydown', function (e) {
		if (e.key === 'Escape') { closeAll(); }
	});
}
