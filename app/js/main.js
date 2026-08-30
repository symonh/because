/*global document, window*/
import { initEngine } from './engine.js';
import { initCanvasA11y } from './a11y-canvas.js';
import { makeCommands } from './commands.js';
import { makeFileIO } from './file-io.js';
import { makeDrive } from './drive.js';
import { makeOneDrive } from './onedrive.js';
import { makeDarkMode } from './dark-mode.js';
import { makeNeutralPref } from './neutral-pref.js';
import { makeLabelEdit } from './label-edit.js';
import { makeNumberEdit } from './number-edit.js';
import { makeNodeStyle } from './node-style.js';
import { makeLoading } from './loading.js';
import { makeIntro } from './intro.js';
import { makePrint } from './print.js';
import { makeShortcutHelp } from './shortcut-help.js';
import { makeMenus } from './menus.js';
import { initLayout } from './layout.js';
import { iconSVG } from './icons.js';
import { bindShortcuts } from './shortcuts.js';
import { initAnalytics, track, setUserProperty, noteMapSource, takeMapSource, countEdit, nodeBucket, analyticsApi } from './analytics.js';

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

	// dark mode, the keyboard reference and the connector-label editor are
	// built before the commands: Shift+T, ? and L run through
	// commands.toggleDarkMode / showShortcuts / editConnectorLabel, so the
	// command set needs all three in hand
	const engine = initEngine(document.getElementById('map-container')),
		darkMode = makeDarkMode(engine),
		// off by default; gates the neutral connector's toolbar icon, Insert
		// item, Alt+Q and help row — never its rendering (neutral-pref.js)
		neutralPref = makeNeutralPref(),
		shortcutHelp = makeShortcutHelp(neutralPref),
		labelEdit = makeLabelEdit(engine),
		commands = makeCommands(engine, darkMode, shortcutHelp, neutralPref, labelEdit);
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
		numberEdit = makeNumberEdit(engine),
		nodeStyle = makeNodeStyle(engine, instrument('style_popover')),
		loading = makeLoading(),
		intro = makeIntro(),
		// after dark mode: its own beforeprint listener flips the map to
		// light first, and this one measures what will actually be printed
		print = makePrint(document.getElementById('map-container'));

	// menus and layout each need the other — the View menu switches layout,
	// and the floating and mobile layouts render the menu spec as a flyout —
	// but only from inside callbacks, so a forward declaration is enough
	let layout = null;
	const menus = makeMenus(instrument('menu'), io, engine, drive, onedrive, darkMode,
		labelEdit, nodeStyle, intro, numberEdit,
		{ get: () => layout.getLayout(), set: m => layout.setLayout(m) }, neutralPref, print);
	menus.renderMenubar(document.getElementById('menubar'));
	layout = initLayout(instrument('toolbar'), io, menus, neutralPref);
	bindShortcuts(engine, instrument('shortcut'), neutralPref);

	// the chrome exists, so the opening state in index.html has done its job.
	// It goes now rather than when a map finishes drawing: a map arriving
	// over the network (?src=) may never finish, and the editor is usable
	// either way. A large map draws behind loading.js's own overlay.
	const bootScreen = document.getElementById('boot');
	if (bootScreen) { bootScreen.remove(); }

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
	// map_print rides in print.js, which knows the page choices it fires with

	// top-right light/dark switcher; the View menu toggles the same state
	const themeToggle = document.getElementById('theme-toggle'),
		refreshThemeToggle = function () {
			const dark = darkMode.isDark(),
				label = dark ? 'Switch to light mode' : 'Switch to dark mode';
			themeToggle.innerHTML = iconSVG(dark ? 'sun' : 'moon');
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
	// same shape for the neutral connector, so adoption of an off-by-default
	// feature is visible rather than guessed at (the toggle itself fires
	// neutral_pref from the View menu)
	setUserProperty('neutral_connectors', neutralPref.isOn() ? 'on' : 'off');
	neutralPref.onChange(on => setUserProperty('neutral_connectors', on ? 'on' : 'off'));

	// large maps lay out for seconds; engine defers so this can paint
	engine.on('loadStarted', () => loading.show('Opening map…'));
	engine.on('loadFinished', () => loading.hide());

	// dev/test handle
	window.__because = { engine, commands, io, drive, onedrive, darkMode, neutralPref, layout, labelEdit, numberEdit, nodeStyle, intro, shortcutHelp, print, analytics: analyticsApi };

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
			// a link that cannot be fetched or opened falls back to the
			// reader's own last map rather than an alert at boot; the
			// failure is still worth counting
			.catch(function (e) {
				track('map_open_error', { description: String((e && e.message) || e).slice(0, 100) });
				if (!io.restoreAutosave()) { io.newMap(); }
			});
	} else if (!io.restoreAutosave()) {
		io.newMap();
	}
	if (new window.URLSearchParams(window.location.search).get('labels') === '0') {
		engine.setLabelsOn(false);
	}
});
