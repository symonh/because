/*global document, window*/
import { initEngine } from './engine.js';
import { initCanvasA11y } from './a11y-canvas.js';
import { makeCommands } from './commands.js';
import { makeFileIO } from './file-io.js';
import { makeDrive } from './drive.js';
import { makeOneDrive } from './onedrive.js';
import { makeDarkMode } from './dark-mode.js';
import { makeLabelEdit } from './label-edit.js';
import { makeNumberEdit } from './number-edit.js';
import { makeNodeStyle } from './node-style.js';
import { makeLoading } from './loading.js';
import { makeIntro } from './intro.js';
import { makeShortcutHelp } from './shortcut-help.js';
import { buildToolbar } from './toolbar.js';
import { buildMenus } from './menus.js';
import { bindShortcuts } from './shortcuts.js';
import { initAnalytics, track, setUserProperty, noteMapSource, takeMapSource, countEdit, nodeBucket, analyticsApi } from './analytics.js';

const SUN_ICON = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.4"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M18.7 5.3L17 7M7 17l-1.7 1.7"/></svg>',
	MOON_ICON = '<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M20.6 14.6A8.6 8.6 0 019.4 3.4a8.6 8.6 0 1011.2 11.2z"/></svg>';

const status = {
	el: null,
	titleEl: null,
	saved() { this.el.textContent = 'All changes saved'; },
	dirty() { this.el.textContent = 'Unsaved changes'; },
	saving() { this.el.textContent = 'Saving…'; },
	autoSaveFailed() { this.el.textContent = 'Auto-save failed — use File > Save'; },
	setFileName(name) { this.titleEl.textContent = name; }
};

document.addEventListener('DOMContentLoaded', function () {
	status.el = document.getElementById('save-status');
	status.titleEl = document.getElementById('map-title');

	// analytics first: modules constructed below fire events immediately
	// (the welcome modal tracks its own auto-show)
	initAnalytics({ page: 'app' });

	// dark mode and the keyboard reference are built before the commands:
	// Shift+T and ? run through commands.toggleDarkMode / showShortcuts, so
	// the command set needs both in hand
	const engine = initEngine(document.getElementById('map-container')),
		darkMode = makeDarkMode(engine),
		shortcutHelp = makeShortcutHelp(),
		commands = makeCommands(engine, darkMode, shortcutHelp);
	initCanvasA11y(engine, document.getElementById('map-container'));
	document.getElementById('skip-link').addEventListener('click', function (e) {
		e.preventDefault();
		document.getElementById('map-container').focus();
	});
	// every command call becomes one GA event tagged with the surface
	// that triggered it, so menu vs toolbar vs shortcut use is visible
	const instrument = function (method) {
			const wrapped = {};
			Object.keys(commands).forEach(function (name) {
				wrapped[name] = function () {
					track('command', { command_name: name, method: method });
					return commands[name].apply(commands, arguments);
				};
			});
			return wrapped;
		},
		io = makeFileIO(engine, status),
		drive = makeDrive(engine, io, status),
		onedrive = makeOneDrive(engine, io, status),
		labelEdit = makeLabelEdit(engine),
		numberEdit = makeNumberEdit(engine),
		nodeStyle = makeNodeStyle(engine, instrument('style_popover')),
		loading = makeLoading(),
		intro = makeIntro();

	buildToolbar(document.getElementById('toolbar'), instrument('toolbar'), io);
	buildMenus(document.getElementById('menubar'), instrument('menu'), io, engine, drive, onedrive, darkMode, labelEdit, nodeStyle, intro, numberEdit);
	bindShortcuts(engine, instrument('shortcut'));

	// one map_open per load, whatever the path (picker, drop, Drive, ?src=,
	// autosave, New) — the loader noted its source just before loading
	const countNodes = function (json) {
		const kids = (json && json.ideas) || {};
		return 1 + Object.keys(kids).reduce((n, k) => n + countNodes(kids[k]), 0);
	};
	engine.on('mapLoaded', function (json) {
		const nodes = countNodes(json);
		track('map_open', {
			method: takeMapSource() || 'unknown',
			node_count: nodes,
			node_bucket: nodeBucket(nodes),
			map_theme: (json && json.attr && json.attr.theme) ||
				(json && json.theme ? 'embedded' : 'default')
		});
	});
	window.addEventListener('beforeprint', () => track('map_print', {}));

	// top-right light/dark switcher; the View menu toggles the same state
	const themeToggle = document.getElementById('theme-toggle'),
		refreshThemeToggle = function () {
			const dark = darkMode.isDark(),
				label = dark ? 'Switch to light mode' : 'Switch to dark mode';
			themeToggle.innerHTML = dark ? SUN_ICON : MOON_ICON;
			// the key hint rides in the tooltip only: the accessible name
			// stays the plain action, which is what gets announced
			themeToggle.title = label + ' (Shift+T)';
			themeToggle.setAttribute('aria-label', label);
		};
	themeToggle.addEventListener('click', () => darkMode.toggle());
	darkMode.onChange(refreshThemeToggle);
	refreshThemeToggle();
	// dark mode both as a toggle event and as user-scoped state, so every
	// report can be segmented by it
	setUserProperty('dark_mode', darkMode.isDark() ? 'on' : 'off');
	darkMode.onChange(function (dark) {
		track('dark_mode_toggle', { enabled: dark ? 'on' : 'off' });
		setUserProperty('dark_mode', dark ? 'on' : 'off');
	});

	// large maps lay out for seconds; engine defers so this can paint
	engine.on('loadStarted', () => loading.show('Opening map…'));
	engine.on('loadFinished', () => loading.hide());

	// dev/test handle
	window.__because = { engine, commands, io, drive, onedrive, darkMode, labelEdit, numberEdit, nodeStyle, intro, shortcutHelp, analytics: analyticsApi };

	// every model change marks the map unsaved (relative to its file) and
	// refreshes the crash-recovery autosave; only File > Save clears it
	let autosaveTimer = null;
	engine.on('mapChanged', function () {
		countEdit(); // batched into one edit_batch analytics event
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
		noteMapSource('url');
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
