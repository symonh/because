/*global window, document, Blob, URL, FileReader*/
/*
 * Open/save .mup files, the unsaved-changes guard, and autosave. Uses the
 * File System Access API when available (real Save), otherwise falls back
 * to download. Autosaves the working map to localStorage so a browser
 * crash loses nothing — but autosave is crash recovery, not saving: the
 * dirty flag (and the status text) track the map relative to its file.
 */

import { track, noteMapSource } from './analytics.js';
import { initModal } from './a11y.js';
import { CONCLUSION_PLACEHOLDER } from './engine.js';
import { storage } from './storage.js';

const AUTOSAVE_KEY = 'because.autosave',
	NAME_KEY = 'because.autosave.name',
	DIRTY_KEY = 'because.autosave.dirty',
	AUTO_KEY = 'because.autosave.auto',
	// how long after the last change auto-save writes the file
	AUTO_DELAY_MS = 1200,
	// pre-rename keys (the app shipped briefly as ArgumentBase)
	LEGACY_KEYS = {
		'because.autosave': 'argumentbase.autosave',
		'because.autosave.name': 'argumentbase.autosave.name',
		'because.autosave.dirty': 'argumentbase.autosave.dirty'
	},
	getStored = function (key) {
		const value = storage.read(key);
		return value !== null ? value : storage.read(LEGACY_KEYS[key]);
	};

export function makeFileIO(engine, status) {
	let fileHandle = null,
		fileName = 'untitled.mup',
		dirty = false,
		pickerInput = null,
		saveTarget = null, // {save, release} while a cloud file owns Save
		// auto-save (File > Auto-save): each change writes back to the map's
		// own file — only ever a writable one (Drive, or a File System Access
		// handle), never the download fallback
		autoOn = storage.read(AUTO_KEY) === '1',
		autoTimer = null,
		autoBusy = false,
		autoFailed = false,
		changeGen = 0;

	const setName = function (name) {
			fileName = name;
			document.title = name.replace(/\.mup$/i, '') + ' — Because';
			status.setFileName(name);
		},
		setDirty = function (value) {
			dirty = !!value;
			if (!dirty) {
				autoFailed = false; // a successful save re-arms a paused auto-save
				status.saved();
			} else if (autoOn && autoFailed) {
				status.autoSaveFailed();
			} else {
				status.dirty();
			}
		},
		// Whatever claimed Save for the outgoing map gives it up here, so a
		// provider drops its own file marker at the same moment.
		releaseSaveTarget = function () {
			const released = saveTarget;
			saveTarget = null;
			if (released) { released.release(); }
		},
		// Every path that replaces the open document ends here: the new map
		// owns Save, and inherits a writable handle only if one was chosen
		// for it.
		adoptDocument = function (name, loadedDirty, handle) {
			releaseSaveTarget();
			fileHandle = handle || null;
			setName(name);
			setDirty(loadedDirty);
		},
		parseAndLoad = function (text, name, loadedDirty, handle) {
			const json = JSON.parse(text);
			engine.loadMap(json);
			adoptDocument(name, loadedDirty, handle);
		},
		// A map that cannot be read has to say so: doing nothing at all is
		// indistinguishable from a file that opened and changed nothing.
		reportOpenFailure = function (name, e) {
			track('map_open_error', { description: String((e && e.message) || e).slice(0, 100) });
			window.alert('“' + name + '” could not be opened. It may not be a valid .mup file.');
		},
		loadFile = function (file) {
			const reader = new FileReader();
			reader.onload = function (ev) {
				try {
					parseAndLoad(ev.target.result, file.name, false);
				} catch (e) {
					reportOpenFailure(file.name, e);
				}
			};
			reader.onerror = () => reportOpenFailure(file.name, reader.error);
			reader.readAsText(file);
		},
		downloadCopy = function (text) {
			const blob = new Blob([text], { type: 'application/json' }),
				a = document.createElement('a');
			a.href = URL.createObjectURL(blob);
			a.download = fileName;
			a.click();
			URL.revokeObjectURL(a.href);
		},
		// Safari can garbage-collect a picker input that was never attached
		// to the document, so change never fires and Open… silently does
		// nothing; one hidden input lives in the DOM and is reused
		getPickerInput = function () {
			if (!pickerInput) {
				pickerInput = document.createElement('input');
				pickerInput.type = 'file';
				pickerInput.accept = '.mup,.json,application/json';
				pickerInput.style.display = 'none';
				pickerInput.addEventListener('change', function () {
					const f = pickerInput.files[0];
					if (f) { noteMapSource('file_picker'); loadFile(f); }
					pickerInput.value = ''; // re-picking the same file must fire again
				});
				document.body.appendChild(pickerInput);
			}
			return pickerInput;
		},
		// Save without ever opening a picker, so the caller's next action
		// (e.g. the Open dialog) still has a user gesture to spend: writes
		// through the file handle when there is one, otherwise downloads.
		saveQuietly = async function () {
			if (saveTarget) { return saveTarget.save(); }
			const text = engine.serialize();
			if (fileHandle) {
				const writable = await fileHandle.createWritable();
				await writable.write(text);
				await writable.close();
			} else {
				downloadCopy(text);
			}
			track('map_save', { destination: fileHandle ? 'file' : 'download', mode: 'guard' });
			setDirty(false);
			io.autosave();
			return true;
		},
		canWriteInPlace = () => !!(saveTarget || fileHandle),
		scheduleAutoSave = function () {
			if (!autoOn || autoFailed || !canWriteInPlace()) { return; }
			if (autoTimer) { window.clearTimeout(autoTimer); }
			autoTimer = window.setTimeout(runAutoSave, AUTO_DELAY_MS);
		},
		// never rejects: a failure pauses auto-save (status message, no
		// alert per keystroke) until the next successful save re-arms it
		runAutoSave = async function () {
			autoTimer = null;
			if (autoBusy || !autoOn || !dirty || !canWriteInPlace()) { return; }
			const gen = changeGen;
			autoBusy = true;
			status.saving();
			try {
				if (saveTarget) {
					await saveTarget.save({ auto: true }); // the provider tracks + marks saved
				} else {
					const text = engine.serialize(),
						writable = await fileHandle.createWritable();
					await writable.write(text);
					await writable.close();
					track('map_save', { destination: 'file', mode: 'auto' });
					setDirty(false);
					io.autosave();
				}
				if (changeGen !== gen) { // edits arrived mid-write: still unsaved
					setDirty(true);
					scheduleAutoSave();
				}
			} catch (e) {
				autoFailed = true;
				status.autoSaveFailed();
				track('auto_save_error', { description: String((e && e.message) || e).slice(0, 100) });
			} finally {
				autoBusy = false;
			}
		};

	const io = {
		fileName: () => fileName,
		isDirty: () => dirty,
		markDirty: () => {
			changeGen += 1;
			setDirty(true);
			scheduleAutoSave();
		},
		autoSaveEnabled: () => autoOn,
		canAutoSave: () => canWriteInPlace(),
		setAutoSave(on) {
			autoOn = !!on;
			autoFailed = false;
			storage.write(AUTO_KEY, autoOn ? '1' : '');
			track('auto_save_toggle', { enabled: autoOn ? 'on' : 'off' });
			if (!autoOn && autoTimer) { window.clearTimeout(autoTimer); autoTimer = null; }
			// run inside the user's click, so a Drive token popup can open
			if (autoOn && dirty && canWriteInPlace()) { runAutoSave(); }
		},
		// external saver (Drive) reporting a completed save
		markSaved(name) {
			if (name) { setName(name); }
			setDirty(false);
			io.autosave();
		},
		// A cloud provider claims Save while one of its files is open, and
		// hands in the teardown to run when anything else claims it back.
		setSaveTarget(save, release) {
			releaseSaveTarget();
			if (save) { saveTarget = { save: save, release: release || function () {} }; }
		},
		// Save / Don't save / Cancel before anything that replaces the map
		guardUnsaved(proceed) {
			if (!dirty) { proceed(); return; }
			let modal = null;
			const overlay = document.createElement('div'),
				panel = document.createElement('div'),
				heading = document.createElement('h2'),
				message = document.createElement('p'),
				actions = document.createElement('div'),
				// close via the modal so focus is restored
				close = () => { if (modal) { modal.close(); modal = null; } },
				addButton = function (label, act, onClick) {
					const b = document.createElement('button');
					b.textContent = label;
					b.dataset.act = act;
					b.addEventListener('click', onClick);
					actions.appendChild(b);
					return b;
				};
			overlay.className = 'panel-overlay';
			panel.className = 'panel';
			heading.textContent = 'Unsaved changes';
			message.textContent = '“' + fileName + '” has changes that are not saved to a file.';
			actions.className = 'panel-actions';
			const saveButton = addButton('Save', 'save', () => {
				close();
				saveQuietly().then(saved => { if (saved) { proceed(); } });
			});
			addButton('Don’t save', 'discard', () => { close(); proceed(); });
			addButton('Cancel', 'cancel', close);
			panel.append(heading, message, actions);
			overlay.appendChild(panel);
			overlay.addEventListener('click', e => { if (e.target === overlay) { close(); } });
			document.body.appendChild(overlay);
			// Escape / cancel path is the same close()
			modal = initModal(overlay, { initialFocus: saveButton, onRequestClose: close });
		},
		newMap() {
			io.guardUnsaved(function () {
				noteMapSource('new');
				engine.loadMap({
					formatVersion: 3,
					id: 'root',
					title: 'New argument',
					attr: { theme: 'argMappingSimple' },
					ideas: { 1: { id: 1, title: CONCLUSION_PLACEHOLDER, attr: {} } }
				}, { selectRoot: true });
				adoptDocument('untitled.mup', false, null);
			});
		},
		open() {
			io.guardUnsaved(async function () {
				if (window.showOpenFilePicker) {
					let handle = null;
					try {
						[handle] = await window.showOpenFilePicker({
							types: [{ description: 'Argument maps', accept: { 'application/json': ['.mup'] } }]
						});
						const file = await handle.getFile();
						noteMapSource('file_picker');
						parseAndLoad(await file.text(), file.name, false, handle);
					} catch (e) {
						if (e && e.name === 'AbortError') { return; }
						reportOpenFailure((handle && handle.name) || 'The file', e);
					}
					return;
				}
				getPickerInput().click();
			});
		},
		// drag-and-drop entry: the file is already chosen, but replacing
		// the current map still needs the guard
		openFile(file) {
			io.guardUnsaved(function () {
				noteMapSource('drag_drop');
				loadFile(file);
			});
		},
		// ?src= loader entry — parsed JSON straight in, no file handle
		loadJson(json, name) {
			engine.loadMap(json);
			adoptDocument(name || 'untitled.mup', false, null);
		},
		async save(as) {
			if (!as && saveTarget) { return saveTarget.save(); }
			const text = engine.serialize();
			let handle = fileHandle;
			if (window.showSaveFilePicker && (as || !fileHandle)) {
				try {
					handle = await window.showSaveFilePicker({
						suggestedName: fileName,
						types: [{ description: 'Argument maps', accept: { 'application/json': ['.mup'] } }]
					});
				} catch (e) {
					if (e && e.name === 'AbortError') { return false; }
					throw e;
				}
			}
			if (handle) {
				const writable = await handle.createWritable();
				await writable.write(text);
				await writable.close();
				// the chosen file is the map's home now, so it takes Save
				// over from any cloud target — but only once the write
				// landed, or a failed Save As would strand the map
				if (handle !== fileHandle) {
					releaseSaveTarget();
					fileHandle = handle;
				}
				setName(handle.name);
			} else {
				// a download is a copy, not a new home: Drive keeps Save
				downloadCopy(text);
			}
			track('map_save', {
				destination: handle ? 'file' : 'download',
				mode: as ? 'save_as' : 'save'
			});
			setDirty(false);
			io.autosave();
			return true;
		},
		autosave() {
			storage.write(AUTOSAVE_KEY, engine.serialize());
			storage.write(NAME_KEY, fileName);
			storage.write(DIRTY_KEY, dirty ? '1' : '');
		},
		restoreAutosave() {
			try {
				const text = getStored(AUTOSAVE_KEY);
				if (text) {
					// a dirty autosave holds edits never saved to the file,
					// so the restored map must stay marked unsaved
					noteMapSource('autosave_restore');
					parseAndLoad(text,
						getStored(NAME_KEY) || 'untitled.mup',
						getStored(DIRTY_KEY) === '1');
					return true;
				}
			} catch (e) { /* corrupted autosave — start fresh */ }
			return false;
		}
	};
	// a hidden tab may never come back: write any pending auto-save now
	document.addEventListener('visibilitychange', function () {
		if (document.visibilityState === 'hidden' && autoTimer) {
			window.clearTimeout(autoTimer);
			runAutoSave();
		}
	});
	return io;
}
