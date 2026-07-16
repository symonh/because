/*global document, window*/
import { initEngine } from './engine.js';
import { makeCommands } from './commands.js';
import { makeFileIO } from './file-io.js';
import { makeDrive } from './drive.js';
import { makeDarkMode } from './dark-mode.js';
import { makeLabelEdit } from './label-edit.js';
import { makeNodeStyle } from './node-style.js';
import { makeLoading } from './loading.js';
import { makeIntro } from './intro.js';
import { buildToolbar } from './toolbar.js';
import { buildMenus } from './menus.js';
import { bindShortcuts } from './shortcuts.js';

const SUN_ICON = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.4"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M18.7 5.3L17 7M7 17l-1.7 1.7"/></svg>',
	MOON_ICON = '<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M20.6 14.6A8.6 8.6 0 019.4 3.4a8.6 8.6 0 1011.2 11.2z"/></svg>';

const status = {
	el: null,
	titleEl: null,
	saved() { this.el.textContent = 'All changes saved'; },
	dirty() { this.el.textContent = 'Unsaved changes'; },
	setFileName(name) { this.titleEl.textContent = name; }
};

document.addEventListener('DOMContentLoaded', function () {
	status.el = document.getElementById('save-status');
	status.titleEl = document.getElementById('map-title');

	const engine = initEngine(document.getElementById('map-container')),
		commands = makeCommands(engine),
		io = makeFileIO(engine, status),
		drive = makeDrive(engine, io, status),
		darkMode = makeDarkMode(engine),
		labelEdit = makeLabelEdit(engine),
		nodeStyle = makeNodeStyle(engine, commands),
		loading = makeLoading(),
		intro = makeIntro();

	buildToolbar(document.getElementById('toolbar'), commands, io);
	buildMenus(document.getElementById('menubar'), commands, io, engine, drive, darkMode, labelEdit, nodeStyle, intro);
	bindShortcuts(engine, commands);

	// top-right light/dark switcher; the View menu toggles the same state
	const themeToggle = document.getElementById('theme-toggle'),
		refreshThemeToggle = function () {
			const dark = darkMode.isDark(),
				label = dark ? 'Switch to light mode' : 'Switch to dark mode';
			themeToggle.innerHTML = dark ? SUN_ICON : MOON_ICON;
			themeToggle.title = label;
			themeToggle.setAttribute('aria-label', label);
		};
	themeToggle.addEventListener('click', () => darkMode.toggle());
	darkMode.onChange(refreshThemeToggle);
	refreshThemeToggle();

	// large maps lay out for seconds; engine defers so this can paint
	engine.on('loadStarted', () => loading.show('Opening map…'));
	engine.on('loadFinished', () => loading.hide());

	// dev/test handle
	window.__because = { engine, commands, io, drive, darkMode, labelEdit, nodeStyle, intro };

	// every model change marks the map unsaved (relative to its file) and
	// refreshes the crash-recovery autosave; only File > Save clears it
	let autosaveTimer = null;
	engine.on('mapChanged', function () {
		io.markDirty();
		if (autosaveTimer) { window.clearTimeout(autosaveTimer); }
		autosaveTimer = window.setTimeout(() => io.autosave(), 800);
	});
	window.addEventListener('beforeunload', function (e) {
		if (io.isDirty()) {
			e.preventDefault();
			e.returnValue = '';
		}
	});

	// open .mup by dropping it anywhere on the window
	window.addEventListener('dragover', e => e.preventDefault());
	window.addEventListener('drop', function (e) {
		e.preventDefault();
		const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
		if (f && /\.mup$/i.test(f.name)) { io.openFile(f); }
	});

	// ?src= loader (used by tests and for sharing links on the same host)
	const src = new window.URLSearchParams(window.location.search).get('src');
	if (src) {
		window.fetch(src)
			.then(r => { if (!r.ok) { throw new Error('HTTP ' + r.status); } return r.json(); })
			.then(json => io.loadJson(json, decodeURIComponent(src.replace(/.*\//, ''))))
			.catch(() => io.restoreAutosave() || io.newMap());
	} else if (!io.restoreAutosave()) {
		io.newMap();
	}
	if (new window.URLSearchParams(window.location.search).get('labels') === '0') {
		engine.setLabelsOn(false);
	}
});
