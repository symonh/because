// Reliability regressions for storage denial, malformed maps, and Save As.
const puppeteer = require('puppeteer-core');
const { resolveChrome } = require('./chrome-path');

const BASE = process.env.BASE || 'http://127.0.0.1:8871';
let failures = 0;

function ok(value, name) {
	console.log((value ? 'PASS ' : 'FAIL ') + name);
	if (!value) { failures += 1; }
}

const validMap = title => ({
	formatVersion: 3,
	id: 'root',
	attr: { theme: 'argMappingSimple' },
	ideas: { 1: { id: 1, title: title || 'Conclusion', attr: {} } }
});

const largeMap = title => {
	const map = { formatVersion: 3, id: 'root', attr: { theme: 'argMappingSimple' }, ideas: {} };
	let ideas = map.ideas;
	for (let i = 1; i <= 100; i += 1) {
		const node = { id: i, title: (i === 1 ? title : 'Claim ' + i), attr: {} };
		ideas['1'] = node;
		node.ideas = {};
		ideas = node.ideas;
	}
	return map;
};

(async () => {
	const browser = await puppeteer.launch({
		executablePath: resolveChrome(), headless: 'new', args: ['--no-sandbox']
	});
	try {
		// Storage can fail while the global itself is acquired, before any
		// getItem try/catch in an individual module could run.
		const denied = await browser.newPage();
		const deniedErrors = [], deniedConsole = [], deniedRequests = [];
		denied.on('pageerror', error => deniedErrors.push(error.message));
		denied.on('console', message => { if (message.type() === 'error') { deniedConsole.push(message.text()); } });
		denied.on('requestfailed', request => deniedRequests.push(request.url() + ': ' + request.failure().errorText));
		await denied.evaluateOnNewDocument(() => {
			Object.defineProperty(window, 'localStorage', {
				configurable: true,
				get() { throw new Error('storage denied'); }
			});
		});
		await denied.goto(BASE + '/app/index.html', { waitUntil: 'domcontentloaded' });
		await denied.waitForSelector('.mapjs-node', { timeout: 8000 }).catch(() => null);
		const deniedBooted = await denied.$('.mapjs-node') !== null;
		if (deniedBooted) {
			await denied.evaluate(() => {
				const intro = document.querySelector('.intro-start');
				if (intro) { intro.click(); }
				document.querySelector('.mapjs-node').click();
			});
			await denied.keyboard.press('Enter');
			await denied.keyboard.type('Works without storage');
			await denied.keyboard.press('Enter');
			await denied.evaluate(() => {
				window.__downloaded = 0;
				delete window.showSaveFilePicker;
				window.HTMLAnchorElement.prototype.click = function () { window.__downloaded += 1; };
			});
			await denied.evaluate(() => window.__because.io.save(true));
		}
		const deniedState = await denied.evaluate(() => ({
			nodes: document.querySelectorAll('.mapjs-node').length,
			menus: document.querySelectorAll('.menu-title').length,
			downloaded: window.__downloaded || 0,
			readyState: document.readyState,
			mainLoaded: !!window.__because,
			boot: document.getElementById('boot') && document.getElementById('boot').textContent.trim().slice(0, 120)
		}));
		ok(deniedErrors.length === 0 && deniedState.nodes >= 2 &&
			deniedState.menus === 6 && deniedState.downloaded === 1,
			'storage-denied boot still edits, opens chrome, and saves a download ' +
			JSON.stringify({ deniedErrors, deniedConsole, deniedRequests, deniedState }));
		await denied.close();

		const page = await browser.newPage();
		const errors = [];
		page.on('pageerror', error => errors.push(error.message));
		await page.goto(BASE + '/app/index.html', { waitUntil: 'domcontentloaded' });
		await page.evaluate(() => {
			localStorage.clear();
			localStorage.setItem('because.intro.dismissed', '1');
		});
		await page.reload({ waitUntil: 'domcontentloaded' });
		await page.waitForSelector('.mapjs-node', { timeout: 8000 });
		await new Promise(resolve => setTimeout(resolve, 350));

		const helperResults = await page.evaluate(async () => {
			const storage = await import('./js/safe-storage.js');
			const real = window.localStorage;
			const results = [];
			storage.remove('safe.test');
			results.push(storage.get('safe.test', 'fallback') === 'fallback');
			results.push(storage.set('safe.test', 'value') && storage.get('safe.test') === 'value');
			results.push(storage.remove('safe.test') && storage.get('safe.test') === null);
			for (const method of ['getItem', 'setItem', 'removeItem']) {
				const fake = {
					getItem: key => real.getItem(key),
					setItem: (key, value) => real.setItem(key, value),
					removeItem: key => real.removeItem(key)
				};
				fake[method] = () => { throw new Error(method); };
				Object.defineProperty(window, 'localStorage', { configurable: true, value: fake });
				results.push(method === 'getItem' ? storage.get('x', 'fallback') === 'fallback' :
					method === 'setItem' ? storage.set('x', 'y') === false : storage.remove('x') === false);
			}
			Object.defineProperty(window, 'localStorage', { configurable: true, value: real });
			return results;
		});
		ok(helperResults.every(Boolean), 'safe-storage has deterministic success and method-failure results');

		await page.evaluate(map => {
			for (const key of ['because.autosave', 'because.autosave.name', 'because.autosave.dirty']) {
				localStorage.removeItem(key);
			}
			localStorage.setItem('argumentbase.autosave', JSON.stringify(map));
			localStorage.setItem('argumentbase.autosave.name', 'legacy-recovery.mup');
			localStorage.setItem('argumentbase.autosave.dirty', '1');
		}, validMap('Legacy recovery'));
		await page.reload({ waitUntil: 'domcontentloaded' });
		await page.waitForSelector('.mapjs-node', { timeout: 8000 });
		const legacyAutosave = await page.evaluate(() => ({
			title: JSON.parse(window.__because.engine.serialize()).ideas['1'].title,
			name: window.__because.io.fileName(),
			dirty: window.__because.io.isDirty(),
			documentTitle: document.title
		}));
		ok(legacyAutosave.title === 'Legacy recovery' && legacyAutosave.name === 'legacy-recovery.mup' &&
			legacyAutosave.dirty && legacyAutosave.documentTitle === 'legacy-recovery — Because',
			'legacy autosave keys restore content, filename, title, and dirty state');

		const malformed = await page.evaluate(async map => {
			const io = window.__because.io,
				engine = window.__because.engine;
			io.loadJson(map, 'kept.mup');
			io.markDirty();
			window.__externalSaves = 0;
			window.__externalClears = 0;
			io.setSaveOverride(() => { window.__externalSaves += 1; return Promise.resolve(true); },
				() => { window.__externalClears += 1; });
			const before = {
				map: engine.serialize(), css: document.getElementById('themeCSS').textContent,
				name: io.fileName(), dirty: io.isDirty()
			};
			const badMaps = [
				null,
				{ formatVersion: 3, id: 'root' },
				{ formatVersion: 3, id: 'root', ideas: { 1: { id: 1, title: 'A' } }, links: [null] },
				{ formatVersion: 3, id: 'root', ideas: { 1: { id: 1, title: 42 } } },
				{ formatVersion: 3, id: 'root', ideas: { 1: { id: 1, title: 'A' }, 2: { id: '1', title: 'B' } } },
				{ formatVersion: 3, id: 'root', ideas: { 0: { id: 1, title: 'A' } } },
				{ formatVersion: 3, id: 'root', ideas: { 1: { id: 1, title: 'A' }, '1.0': { id: 2, title: 'B' } } },
				{ formatVersion: 3, id: 'root', ideas: { 1: { id: 1, title: 'A' } }, theme: { node: ['bad'] } },
				{ formatVersion: 3, id: 'root', ideas: { 1: { id: 1, title: 'A' } }, theme: { layout: { spacing: null } } },
				{ formatVersion: 3, id: 'root', ideas: { 1: { id: 1, title: 'A' } }, theme: { node: [{ name: 'default', connections: null }] } }
			];
			let rejected = 0;
			for (const bad of badMaps) {
				try { io.loadJson(bad, 'bad.mup'); } catch (error) { rejected += 1; }
			}
			await io.save(false);
			return {
				rejected,
				preserved: before.map === engine.serialize() && before.css === document.getElementById('themeCSS').textContent &&
					before.name === io.fileName() && before.dirty === io.isDirty(),
				saves: window.__externalSaves, clears: window.__externalClears
			};
		}, validMap('Kept'));
		ok(malformed.rejected === 10, 'all malformed-map fixtures reject synchronously');
		ok(malformed.preserved && malformed.saves === 1 && malformed.clears === 0,
			'malformed loads preserve map, theme CSS, metadata, and save target');

		const zeroSpacing = await page.evaluate(maps => {
			const engine = window.__because.engine;
			return maps.map(map => {
				engine.loadMap(map);
				return JSON.parse(engine.serialize()).ideas['1'].title;
			});
		}, [0, { h: 0, v: 0 }].map((spacing, index) => ({
			formatVersion: 3,
			id: 'root',
			theme: { layout: { orientation: 'top-down', spacing } },
			ideas: {
				1: {
					id: 100 + index, title: 'Zero spacing ' + index, attr: {},
					ideas: { 1: { id: 200 + index, title: 'Child', attr: {} } }
				}
			}
		})));
		ok(zeroSpacing.join(',') === 'Zero spacing 0,Zero spacing 1',
			'legacy scalar and object zero-spacing themes remain loadable');

		const legacy = await page.evaluate(() => {
			const engine = window.__because.engine;
			engine.loadMap({ id: 20, style: { background: '#fff', collapsed: true } });
			const first = JSON.parse(engine.serialize());
			engine.loadMap({ formatVersion: 2, id: 30, title: 'V2', ideas: { 1: {} }, links: [] });
			const second = JSON.parse(engine.serialize());
			return {
				v1: first.formatVersion === 3 && first.ideas['1'].attr.style.background === '#fff',
				defaults: typeof second.ideas['1'].ideas['1'].title === 'string' && second.links.length === 0
			};
		});
		ok(legacy.v1 && legacy.defaults, 'versionless/v2 maps retain upgrades and historical defaults');

		const lifecycle = await page.evaluate(async ({ first, second }) => {
			const engine = window.__because.engine,
				events = [],
				loaded = [];
			engine.on('loadStarted', () => events.push('start'));
			engine.on('loadFinished', () => events.push('finish'));
			engine.on('mapLoaded', raw => loaded.push(raw.ideas['1'].title));
			engine.loadMap(first);
			let badRejected = false;
			try { engine.loadMap(null); } catch (error) { badRejected = true; }
			const waitForFinish = () => new Promise(resolve => {
				const deadline = Date.now() + 10000,
					check = () => {
						if (events[events.length - 1] === 'finish' || Date.now() >= deadline) { resolve(); }
						else { setTimeout(check, 25); }
					};
				check();
			});
			await waitForFinish();
			const malformedWinner = JSON.parse(engine.serialize()).ideas['1'].title;
			events.length = 0;
			loaded.length = 0;
			engine.loadMap(first);
			engine.loadMap(second);
			await waitForFinish();
			return {
				badRejected, malformedWinner,
				events: events.join(','), loaded: loaded.join(','),
				winner: JSON.parse(engine.serialize()).ideas['1'].title
			};
		}, { first: largeMap('Large A'), second: largeMap('Large B') });
		ok(lifecycle.badRejected && lifecycle.malformedWinner === 'Large A',
			'a malformed request does not supersede an already prepared large load');
		ok(lifecycle.events === 'start,finish,start,finish' &&
			lifecycle.loaded === 'Large B' && lifecycle.winner === 'Large B',
			'valid large-load supersession balances the overlay and commits only the winner ' +
			JSON.stringify(lifecycle));

		const saveAs = await page.evaluate(async map => {
			const io = window.__because.io;
			io.loadJson(map, 'cloud.mup');
			window.__writes = 0;
			window.__clears = 0;
			window.__external = 0;
			io.setSaveOverride(() => { window.__external += 1; return Promise.resolve(true); },
				() => { window.__clears += 1; });
			window.showSaveFilePicker = async () => ({
				name: 'local.mup',
				createWritable: async () => ({
					write: async () => { window.__writes += 1; },
					close: async () => {}
				})
			});
			await io.save(true);
			await io.save(false);
			io.setAutoSave(true);
			io.markDirty();
			await new Promise(resolve => setTimeout(resolve, 1400));
			return {
				writes: window.__writes, clears: window.__clears, external: window.__external,
				name: io.fileName(), dirty: io.isDirty()
			};
		}, validMap('Cloud'));
		ok(saveAs.writes === 3 && saveAs.clears === 1 && saveAs.external === 0 &&
			saveAs.name === 'local.mup' && !saveAs.dirty,
			'successful Save As moves plain Save and autosave to the local handle');

		const failures = await page.evaluate(async map => {
			const io = window.__because.io,
				phases = ['picker', 'create', 'write', 'close'],
				results = [];
			for (const phase of phases) {
				io.loadJson(map, 'cloud.mup');
				io.markDirty();
				let clears = 0, external = 0;
				io.setSaveOverride(() => { external += 1; return Promise.resolve(true); }, () => { clears += 1; });
				window.showSaveFilePicker = async () => {
					if (phase === 'picker') { throw new DOMException('cancelled', 'AbortError'); }
					return {
						name: 'failed.mup',
						createWritable: async () => {
							if (phase === 'create') { throw new Error('create'); }
							return {
								write: async () => { if (phase === 'write') { throw new Error('write'); } },
								close: async () => { if (phase === 'close') { throw new Error('close'); } }
							};
						}
					};
				};
				try { await io.save(true); } catch (error) { /* expected */ }
				await io.save(false);
				results.push(clears === 0 && external === 1 && io.fileName() === 'cloud.mup' && io.isDirty());
			}
			return results;
		}, validMap('Cloud'));
		ok(failures.every(Boolean), 'picker/create/write/close failures preserve the prior target and metadata');

		const downloadCopy = await page.evaluate(async map => {
			const io = window.__because.io;
			io.loadJson(map, 'cloud.mup');
			let clears = 0, external = 0, downloads = 0;
			io.setSaveOverride(() => { external += 1; return Promise.resolve(true); }, () => { clears += 1; });
			delete window.showSaveFilePicker;
			window.HTMLAnchorElement.prototype.click = function () { downloads += 1; };
			await io.save(true);
			await io.save(false);
			return { clears, external, downloads };
		}, validMap('Cloud'));
		ok(downloadCopy.downloads === 1 && downloadCopy.external === 1 && downloadCopy.clears === 0,
			'download fallback remains a copy and retains the cloud target');
		ok(errors.length === 0, 'reliability regressions produce no uncaught page errors');
		await page.close();
	} finally {
		await browser.close();
	}
	if (failures) {
		console.error(failures + ' FAILURES');
		process.exit(1);
	}
})().catch(error => {
	console.error(error);
	process.exit(1);
});
