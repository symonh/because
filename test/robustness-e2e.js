// The editor under hostile input: browser storage that refuses to be read,
// and .mup files it cannot open. Both used to be silent — a blocked
// localStorage stopped the boot dead, and an unreadable map left the reader
// looking at a screen where nothing had happened.
const puppeteer = require('puppeteer-core');
const { chromePath } = require('./chrome-path');

const CHROME = chromePath();
const BASE = process.env.BASE || 'http://127.0.0.1:8871';
let failures = 0;
const ok = (cond, name) => { console.log((cond ? 'PASS ' : 'FAIL ') + name); if (!cond) { failures += 1; } };

const editorPage = async function (browser) {
	const page = await browser.newPage();
	await page.setViewport({ width: 1500, height: 950 });
	await page.goto(BASE + '/app/index.html', { waitUntil: 'domcontentloaded' });
	await page.evaluate(() => localStorage.setItem('because.intro.dismissed', '1'));
	await page.reload({ waitUntil: 'domcontentloaded' });
	await page.waitForSelector('.mapjs-node', { timeout: 8000 });
	await new Promise(r => setTimeout(r, 400));
	return page;
};

(async () => {
	const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });

	// ---- storage that throws on every access ----
	// Safari's "Block all cookies" throws from window.localStorage ITSELF,
	// before any getItem could be guarded, so the whole editor has to come
	// up without it rather than each caller coping.
	const denied = await browser.newPage();
	const deniedErrors = [];
	denied.on('pageerror', e => deniedErrors.push(e.message));
	await denied.evaluateOnNewDocument(() => {
		Object.defineProperty(window, 'localStorage', {
			configurable: true,
			get() { throw new Error('storage denied'); }
		});
	});
	await denied.goto(BASE + '/app/index.html', { waitUntil: 'domcontentloaded' });
	await denied.waitForSelector('.mapjs-node', { timeout: 8000 }).catch(() => null);
	const booted = await denied.evaluate(() => ({
		nodes: document.querySelectorAll('.mapjs-node').length,
		menus: document.querySelectorAll('.menu-title').length,
		exposed: !!window.__because,
		bootScreenGone: !document.getElementById('boot')
	}));
	ok(booted.exposed && booted.nodes >= 1 && booted.menus === 6 && booted.bootScreenGone,
		`the editor boots with storage blocked (${JSON.stringify(booted)})`);
	ok(deniedErrors.length === 0, `no page errors while storage is blocked (${deniedErrors.join('; ').slice(0, 160)})`);

	const deniedWork = await denied.evaluate(async () => {
		const nodesBefore = document.querySelectorAll('.mapjs-node').length;
		window.__because.engine.mapModel.selectNode(1);
		window.__because.commands.addReason();
		await new Promise(r => setTimeout(r, 300));
		// no File System Access in this page: Save must reach the download
		let downloads = 0;
		delete window.showSaveFilePicker;
		window.HTMLAnchorElement.prototype.click = function () { downloads += 1; };
		await window.__because.io.save(false);
		return { nodesBefore, nodesAfter: document.querySelectorAll('.mapjs-node').length, downloads };
	});
	ok(deniedWork.nodesAfter > deniedWork.nodesBefore && deniedWork.downloads === 1,
		`a map is still editable and savable with storage blocked (${JSON.stringify(deniedWork)})`);
	await denied.close();

	// ---- the storage module's own contract ----
	const page = await editorPage(browser);
	const errors = [];
	page.on('pageerror', e => errors.push(e.message));
	const helper = await page.evaluate(async () => {
		const { storage } = await import('./js/storage.js'),
			real = window.localStorage,
			results = {};
		storage.remove('because.test');
		results.missingReadsNull = storage.read('because.test') === null;
		storage.write('because.test', 'value');
		results.roundTrips = storage.read('because.test') === 'value';
		storage.remove('because.test');
		results.removed = storage.read('because.test') === null;
		// each method failing on its own must not take the others down
		for (const method of ['getItem', 'setItem', 'removeItem']) {
			const fake = Object.create(null);
			['getItem', 'setItem', 'removeItem'].forEach(m => { fake[m] = (...a) => real[m](...a); });
			fake[method] = () => { throw new Error(method + ' denied'); };
			Object.defineProperty(window, 'localStorage', { configurable: true, value: fake });
			results[method] = (function () {
				try {
					storage.write('because.test', 'x');
					storage.read('because.test');
					storage.remove('because.test');
					return true;
				} catch (e) {
					return false;
				}
			}());
		}
		Object.defineProperty(window, 'localStorage', { configurable: true, value: real });
		return results;
	});
	ok(Object.values(helper).every(Boolean),
		`storage reads, writes, removes, and survives each method throwing (${JSON.stringify(helper)})`);

	// ---- a title that is not a string ----
	// mapjs fills in a MISSING title but hands a non-string one to the
	// renderer, which calls string methods on it.
	const coerced = await page.evaluate(async () => {
		window.__because.engine.loadMap({
			formatVersion: 3, id: 'root',
			ideas: { 1: { id: 1, title: 'Conclusion', attr: {}, ideas: { 1: { id: 2, title: 2024 } } } }
		});
		await new Promise(r => setTimeout(r, 400));
		const saved = JSON.parse(window.__because.engine.serialize());
		return {
			drawn: document.querySelectorAll('.mapjs-node').length,
			title: saved.ideas['1'].ideas['1'].title
		};
	});
	ok(coerced.drawn >= 2 && coerced.title === '2024',
		`a numeric claim title opens as text rather than stopping the render (${JSON.stringify(coerced)})`);

	// ---- files that cannot be opened at all ----
	const unreadable = {
		'a truncated file': '{"formatVersion":3,"ideas":{"1":{"id"',
		'valid JSON that is not a map': '[1,2,3]',
		'a file holding null': 'null'
	};
	for (const [what, text] of Object.entries(unreadable)) {
		const outcome = await page.evaluate(async ({ what, text }) => {
			const alerts = [];
			window.alert = m => alerts.push(String(m));
			window.__because.engine.loadMap({
				formatVersion: 3, id: 'root',
				ideas: { 1: { id: 1, title: 'Open already', attr: {} } }
			});
			await new Promise(r => setTimeout(r, 350));
			const tracked = () => window.__because.analytics.events()
				.filter(e => e.name === 'map_open_error').length;
			const before = tracked();
			window.__because.io.openFile(new File([text], what + '.mup', { type: 'application/json' }));
			await new Promise(r => setTimeout(r, 700));
			return {
				told: alerts.length === 1 && alerts[0].indexOf('could not be opened') >= 0,
				kept: document.body.textContent.indexOf('Open already') >= 0,
				tracked: tracked() - before
			};
		}, { what, text });
		ok(outcome.told && outcome.kept && outcome.tracked === 1,
			`${what} is refused, reported, and leaves the open map alone (${JSON.stringify(outcome)})`);
	}

	if (errors.length) { console.log('PAGE ERRORS:', errors.join(' | ')); failures += 1; }
	await browser.close();
	console.log(failures === 0 ? 'ALL PASS (robustness)' : failures + ' FAILURES (robustness)');
	process.exit(failures ? 1 : 0);
})();
