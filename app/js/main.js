/*global document, window*/
import { initEngine } from './engine.js';
import { makeCommands } from './commands.js';
import { makeFileIO } from './file-io.js';
import { makeDrive } from './drive.js';
import { buildToolbar } from './toolbar.js';
import { buildMenus } from './menus.js';
import { bindShortcuts } from './shortcuts.js';

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
		drive = makeDrive(engine, io, status);

	buildToolbar(document.getElementById('toolbar'), commands, io);
	buildMenus(document.getElementById('menubar'), commands, io, engine, drive);
	bindShortcuts(engine, commands);

	// dev/test handle
	window.__argumentbase = { engine, commands, io, drive };

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
