/*global window, document, Blob, URL, FileReader, localStorage*/
/*
 * Open/save .mup files and autosave. Uses the File System Access API when
 * available (real Save), otherwise falls back to download. Autosaves the
 * working map to localStorage so a browser crash loses nothing.
 */

const AUTOSAVE_KEY = 'argumentbase.autosave',
	NAME_KEY = 'argumentbase.autosave.name';

export function makeFileIO(engine, status) {
	let fileHandle = null,
		fileName = 'untitled.mup';

	const setName = function (name) {
			fileName = name;
			document.title = name.replace(/\.mup$/i, '') + ' — ArgumentBase';
			status.setFileName(name);
		},
		parseAndLoad = function (text, name) {
			const json = JSON.parse(text);
			engine.loadMap(json);
			setName(name);
			status.saved();
		};

	const io = {
		fileName: () => fileName,
		newMap() {
			fileHandle = null;
			engine.loadMap({
				formatVersion: 3,
				id: 'root',
				title: 'New argument',
				attr: { theme: 'argMappingSimple' },
				ideas: { 1: { id: 1, title: 'Type your conclusion here', attr: {} } }
			});
			setName('untitled.mup');
			status.saved();
		},
		async open() {
			if (window.showOpenFilePicker) {
				try {
					const [handle] = await window.showOpenFilePicker({
						types: [{ description: 'Argument maps', accept: { 'application/json': ['.mup'] } }]
					});
					const file = await handle.getFile();
					parseAndLoad(await file.text(), file.name);
					fileHandle = handle;
					return;
				} catch (e) {
					if (e && e.name === 'AbortError') { return; }
					throw e;
				}
			}
			// fallback: hidden input
			const input = document.createElement('input');
			input.type = 'file';
			input.accept = '.mup,application/json';
			input.onchange = () => {
				const f = input.files[0];
				if (!f) { return; }
				const reader = new FileReader();
				reader.onload = ev => parseAndLoad(ev.target.result, f.name);
				reader.readAsText(f);
			};
			input.click();
		},
		openFile(file) {
			const reader = new FileReader();
			reader.onload = ev => parseAndLoad(ev.target.result, file.name);
			reader.readAsText(file);
			fileHandle = null;
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
					if (e && e.name === 'AbortError') { return; }
					throw e;
				}
			}
			if (fileHandle) {
				const writable = await fileHandle.createWritable();
				await writable.write(text);
				await writable.close();
				setName(fileHandle.name);
			} else {
				const blob = new Blob([text], { type: 'application/json' }),
					a = document.createElement('a');
				a.href = URL.createObjectURL(blob);
				a.download = fileName;
				a.click();
				URL.revokeObjectURL(a.href);
			}
			status.saved();
		},
		autosave() {
			try {
				localStorage.setItem(AUTOSAVE_KEY, engine.serialize());
				localStorage.setItem(NAME_KEY, fileName);
			} catch (e) { /* quota — non-fatal */ }
		},
		restoreAutosave() {
			try {
				const text = localStorage.getItem(AUTOSAVE_KEY);
				if (text) {
					parseAndLoad(text, localStorage.getItem(NAME_KEY) || 'untitled.mup');
					return true;
				}
			} catch (e) { /* corrupted autosave — start fresh */ }
			return false;
		}
	};
	return io;
}
