// End-to-end smoke test for the ArgumentBase app shell.
// Serves nothing itself — expects `python3 -m http.server 8871` at repo root.
const puppeteer = require('puppeteer-core');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = process.env.BASE || 'http://127.0.0.1:8871';
let failures = 0;

function ok(cond, name) {
	console.log((cond ? 'PASS ' : 'FAIL ') + name);
	if (!cond) { failures += 1; }
}

(async () => {
	const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
	const page = await browser.newPage();
	await page.setViewport({ width: 1500, height: 950, deviceScaleFactor: 2 });
	const errors = [];
	page.on('pageerror', e => errors.push(e.message));

	await page.goto(BASE + '/app/index.html', { waitUntil: 'networkidle0' });
	await page.evaluate(() => localStorage.clear());
	await page.goto(BASE + '/app/index.html', { waitUntil: 'networkidle0' });
	await page.waitForSelector('.mapjs-node', { timeout: 8000 });

	ok(await page.$('#toolbar .tb-btn') !== null, 'toolbar renders');
	ok(await page.$$eval('.menu-title', els => els.length) === 6, 'six menus render');
	ok(await page.$$eval('.mapjs-node', els => els.length) === 1, 'new map has a single conclusion');

	// select the root, add a reason with Enter, type the premise text
	await page.click('.mapjs-node');
	await page.keyboard.press('Enter');
	await new Promise(r => setTimeout(r, 400));
	await page.keyboard.type('Premise one');
	await page.keyboard.press('Enter'); // commit edit
	await new Promise(r => setTimeout(r, 400));
	let counts = await page.evaluate(() => ({
		groups: document.querySelectorAll('.mapjs-node.attr_group').length,
		nodes: document.querySelectorAll('.mapjs-node:not(.attr_group)').length
	}));
	ok(counts.groups === 1 && counts.nodes === 2, `Enter adds bracketed reason (groups=${counts.groups} nodes=${counts.nodes})`);

	// co-premise with Tab
	await page.keyboard.press('Tab');
	await new Promise(r => setTimeout(r, 400));
	await page.keyboard.type('Premise two');
	await page.keyboard.press('Enter');
	await new Promise(r => setTimeout(r, 400));
	counts = await page.evaluate(() => ({
		groups: document.querySelectorAll('.mapjs-node.attr_group').length,
		nodes: document.querySelectorAll('.mapjs-node:not(.attr_group)').length
	}));
	ok(counts.groups === 1 && counts.nodes === 3, `Tab adds co-premise in same group (groups=${counts.groups} nodes=${counts.nodes})`);

	// implicit toggle on the selected premise
	await page.keyboard.down('Alt');
	await page.keyboard.press('t');
	await page.keyboard.up('Alt');
	await new Promise(r => setTimeout(r, 300));
	ok(await page.$('.mapjs-node.attr_implicit_claim') !== null, 'Alt+T marks claim implicit (dashed)');

	// objection on the conclusion
	await page.evaluate(() => window.jQuery('.mapjs-node').first().click());
	await page.evaluate(() => {
		// select the root node explicitly (first non-group node)
		const id = window.__abTestRootId;
	});
	// select root via keyboard: press Up until at root
	await page.keyboard.press('ArrowUp');
	await new Promise(r => setTimeout(r, 200));
	await page.keyboard.down('Alt');
	await page.keyboard.press('o');
	await page.keyboard.up('Alt');
	await new Promise(r => setTimeout(r, 400));
	await page.keyboard.type('An objection');
	await page.keyboard.press('Enter');
	await new Promise(r => setTimeout(r, 400));
	const hasOpposing = await page.evaluate(() =>
		document.querySelectorAll('.mapjs-node.attr_group_opposing').length);
	ok(hasOpposing >= 1, 'Alt+O adds an opposing (red) group');

	// numbering badges present, then toggle off via View menu command
	const badges = await page.$$eval('.mapjs-label', els => els.filter(e => e.offsetParent !== null).length);
	ok(badges >= 3, `numbering badges render (${badges})`);

	// serialize through File > Save (intercept: read engine serialization)
	const saved = await page.evaluate(() => {
		const idea = window.__argumentbase && window.__argumentbase.engine.mapModel.getIdea();
		return JSON.stringify(idea);
	}).catch(() => null);
	// __argumentbase may not be exposed; fall back to localStorage autosave
	const autosaved = await page.evaluate(() => localStorage.getItem('argumentbase.autosave'));
	const doc = JSON.parse(saved || autosaved);
	const roots = Object.values(doc.ideas || {});
	ok(doc.formatVersion === 3 || doc.id, 'serialized map parses as JSON');
	const walk = (n, acc) => {
		acc.push(n);
		Object.values(n.ideas || {}).forEach(k => walk(k, acc));
		return acc;
	};
	const all = roots.length ? walk(roots[0], []) : [];
	ok(all.some(n => n.attr && n.attr.group === 'supporting'), 'saved .mup contains supporting group');
	ok(all.some(n => n.attr && n.attr.group === 'opposing'), 'saved .mup contains opposing group');
	ok(all.some(n => n.attr && (n.attr.styleNames || []).includes('attr_implicit_claim')), 'saved .mup keeps implicit styleName');

	// screenshot the full app for visual review
	await page.screenshot({ path: '/tmp/app_ui.png' });

	if (errors.length) { console.log('PAGE ERRORS:', errors.join(' | ')); failures += 1; }
	await browser.close();
	console.log(failures === 0 ? 'ALL PASS' : failures + ' FAILURES');
	process.exit(failures === 0 ? 0 : 1);
})();
