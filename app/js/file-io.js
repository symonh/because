/*global window, document, Blob, URL, FileReader, localStorage*/
/*
 * Open/save .mup files, the unsaved-changes guard, and autosave. Uses the
 * File System Access API when available (real Save), otherwise falls back
 * to download. Autosaves the working map to localStorage so a browser
 * crash loses nothing — but autosave is crash recovery, not saving: the
 * dirty flag (and the status text) track the map relative to its file.
 */

const AUTOSAVE_KEY = 'argumentbase.autosave',
	NAME_KEY = 'argumentbase.autosave.name',
	DIRTY_KEY = 'argumentbase.autosave.dirty';

export function makeFileIO(engine, status) {
	let fileHandle = null,
		fileName = 'untitled.mup',
		dirty = false,
		pickerInput = null;

	const setName = function (name) {
			fileName = name;
			document.title = name.replace(/\.mup$/i, '') + ' — ArgumentBase';
			status.setFileName(name);
		},
		setDirty = function (value) {
			dirty = !!value;
			if (dirty) { status.dirty(); } else { status.saved(); }
		},
		parseAndLoad = function (text, name, loadedDirty) {
			const json = JSON.parse(text);
			engine.loadMap(json);
			setName(name);
			setDirty(loadedDirty);
		},
		loadFile = function (file) {
			const reader = new FileReader();
			reader.onload = ev => parseAndLoad(ev.target.result, file.name, false);
			reader.readAsText(file);
			fileHandle = null;
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
					if (f) { loadFile(f); }
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
			const text = engine.serialize();
			if (fileHandle) {
				const writable = await fileHandle.createWritable();
				await writable.write(text);
				await writable.close();
			} else {
				downloadCopy(text);
			}
			setDirty(false);
			io.autosave();
			return true;
		};

	const io = {
		fileName: () => fileName,
		isDirty: () => dirty,
		markDirty: () => setDirty(true),
		// Save / Don't save / Cancel before anything that replaces the map
		guardUnsaved(proceed) {
			if (!dirty) { proceed(); return; }
			const overlay = document.createElement('div'),
				panel = document.createElement('div'),
				heading = document.createElement('h2'),
				message = document.createElement('p'),
				actions = document.createElement('div'),
				close = () => overlay.remove(),
				addButton = function (label, act, onClick) {
					const b = document.createElement('button');
					b.textContent = label;
					b.dataset.act = act;
					b.addEventListener('click', onClick);
					actions.appendChild(b);
				};
			overlay.className = 'panel-overlay';
			panel.className = 'panel';
			heading.textContent = 'Unsaved changes';
			message.textContent = '“' + fileName + '” has changes that are not saved to a file.';
			actions.className = 'panel-actions';
			addButton('Save', 'save', () => {
				close();
				saveQuietly().then(saved => { if (saved) { proceed(); } });
			});
			addButton('Don’t save', 'discard', () => { close(); proceed(); });
			addButton('Cancel', 'cancel', close);
			panel.append(heading, message, actions);
			overlay.appendChild(panel);
			overlay.addEventListener('click', e => { if (e.target === overlay) { close(); } });
			document.body.appendChild(overlay);
		},
		newMap() {
			io.guardUnsaved(function () {
				fileHandle = null;
				engine.loadMap({
					formatVersion: 3,
					id: 'root',
					title: 'New argument',
					attr: { theme: 'argMappingSimple' },
					ideas: { 1: { id: 1, title: 'Type your conclusion here', attr: {} } }
				});
				setName('untitled.mup');
				setDirty(false);
			});
		},
		open() {
			io.guardUnsaved(async function () {
				if (window.showOpenFilePicker) {
					try {
						const [handle] = await window.showOpenFilePicker({
							types: [{ description: 'Argument maps', accept: { 'application/json': ['.mup'] } }]
						});
						const file = await handle.getFile();
						parseAndLoad(await file.text(), file.name, false);
						fileHandle = handle;
					} catch (e) {
						if (e && e.name === 'AbortError') { return; }
						throw e;
					}
					return;
				}
				getPickerInput().click();
			});
		},
		// drag-and-drop entry: the file is already chosen, but replacing
		// the current map still needs the guard
		openFile(file) {
			io.guardUnsaved(() => loadFile(file));
		},
		// ?src= loader entry — parsed JSON straight in, no file handle
		loadJson(json, name) {
			fileHandle = null;
			engine.loadMap(json);
			setName(name || 'untitled.mup');
			setDirty(false);
		},
		async save(as) {
			const text = engine.serialize();
			if (window.showSaveFilePicker && (as || !fileHandle)) {
				try {
					fileHandle = await window.showSaveFilePicker({
						suggestedName: fileName,
						types: [{ description: 'Argument maps', accept: { 'application/json': ['.mup'] } }]
					});
				} catch (e) {
					if (e && e.name === 'AbortError') { return false; }
					throw e;
				}
			}
			if (fileHandle) {
				const writable = await fileHandle.createWritable();
				await writable.write(text);
				await writable.close();
				setName(fileHandle.name);
			} else {
				downloadCopy(text);
			}
			setDirty(false);
			io.autosave();
			return true;
		},
		autosave() {
			try {
				localStorage.setItem(AUTOSAVE_KEY, engine.serialize());
				localStorage.setItem(NAME_KEY, fileName);
				localStorage.setItem(DIRTY_KEY, dirty ? '1' : '');
			} catch (e) { /* quota — non-fatal */ }
		},
		restoreAutosave() {
			try {
				const text = localStorage.getItem(AUTOSAVE_KEY);
				if (text) {
					// a dirty autosave holds edits never saved to the file,
					// so the restored map must stay marked unsaved
					parseAndLoad(text,
						localStorage.getItem(NAME_KEY) || 'untitled.mup',
						localStorage.getItem(DIRTY_KEY) === '1');
					return true;
				}
			} catch (e) { /* corrupted autosave — start fresh */ }
			return false;
		}
	};
	return io;
}
