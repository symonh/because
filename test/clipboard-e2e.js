// E2e for copy and paste through the system clipboard (app/js/clipboard.js):
// claims copied in one tab paste into another tab on a different origin, and
// read as an outline anywhere else. Real key presses, in Chrome and in
// WebKit (the Safari rule). Run it through `npm test`, or point BASE at a
// server on the repo root.
const { chromium, webkit } = require('playwright-core');
const { chromePath } = require('./chrome-path');

const BASE = process.env.BASE || 'http://127.0.0.1:8871';
// the same server under another host name is another origin
const OTHER = BASE.replace('127.0.0.1', 'localhost');
let failures = 0;
const ok = (cond, name) => { console.log((cond ? 'PASS ' : 'FAIL ') + name); if (!cond) { failures += 1; } };

const SOURCE = {
	formatVersion: 3, id: 'root', title: 'Source', ideas: { 1: { id: 1, title: 'Source conclusion.', attr: {}, ideas: {
		1: { id: 2, title: 'group', attr: { group: 'supporting', contentLocked: true }, ideas: {
			1: { id: 3, title: 'The copied claim.', attr: { styleNames: ['attr_implicit_claim'] }, ideas: {
				1: { id: 4, title: 'group', attr: { group: 'opposing', contentLocked: true }, ideas: {
					1: { id: 5, title: 'An objection beneath it.', attr: {} } } },
				2: { id: 6, title: 'A note on it.', attr: { styleNames: ['sticky_note'] } } } } } } } } }
};
const TARGET = {
	formatVersion: 3, id: 'root', title: 'Target', ideas: { 1: { id: 1, title: 'Target conclusion.', attr: {}, ideas: {
		1: { id: 2, title: 'group', attr: { group: 'supporting', contentLocked: true }, ideas: {
			1: { id: 3, title: 'An existing reason.', attr: {} } } } } } }
};
const OUTLINE = '[implicit] The copied claim.\n  objection:\n    An objection beneath it.\n  note: A note on it.';

async function open(context, base, map) {
	const page = await context.newPage();
	page.errors = [];
	page.on('pageerror', e => page.errors.push(e.message));
	page.on('dialog', d => d.accept());
	await page.goto(base + '/app/index.html', { waitUntil: 'load' });
	await page.evaluate(() => {
		const box = document.getElementById('intro-dont-show');
		if (box) { box.checked = true; document.querySelector('.intro-start').click(); }
	});
	await page.evaluate(m => window.__because.io.loadJson(m, 'map.mup'), map);
	await page.waitForTimeout(500);
	return page;
}

async function select(page, id) {
	await page.evaluate(i => window.__because.engine.mapModel.selectNode(i), id);
	await page.focus('#map-container');
}

// the claims under the target's conclusion, as [bracket kind, [claim titles]]
const reasons = page => page.evaluate(() => {
	const kids = n => Object.keys(n.ideas || {}).sort((a, b) => parseFloat(a) - parseFloat(b)).map(k => n.ideas[k]);
	return kids(kids(window.__because.engine.mapModel.getIdea())[0])
		.map(g => [g.attr.group, kids(g).map(c => c.title)]);
});

async function scenario(label, browser) {
	const tag = s => `[${label}] ${s}`;
	const context = await browser.newContext();
	const source = await open(context, BASE, SOURCE);
	const target = await open(context, OTHER, TARGET);

	await select(source, 3);
	await source.keyboard.press('Meta+c');

	await select(target, 1);
	await target.keyboard.press('Meta+v');
	await target.waitForTimeout(400);
	ok(JSON.stringify(await reasons(target)) === JSON.stringify([['supporting', ['An existing reason.']], ['supporting', ['The copied claim.']]]),
		tag('a claim copied in one tab pastes into a tab on another origin, as a new reason'));
	const pasted = await target.evaluate(() => {
		const kids = n => Object.keys(n.ideas || {}).sort((a, b) => parseFloat(a) - parseFloat(b)).map(k => n.ideas[k]);
		const claim = kids(kids(kids(window.__because.engine.mapModel.getIdea())[0])[1])[0];
		return {
			implicit: (claim.attr.styleNames || []).indexOf('attr_implicit_claim') >= 0,
			beneath: kids(claim).map(k => (k.attr.group ? k.attr.group + ':' + kids(k).map(c => c.title).join() : k.title)),
			selected: window.__because.engine.mapModel.getSelectedNodeId() === claim.id
		};
	});
	ok(pasted.implicit, tag('it keeps its implicit border'));
	ok(JSON.stringify(pasted.beneath) === JSON.stringify(['opposing:An objection beneath it.', 'A note on it.']),
		tag('and everything beneath it, objection and note included'));
	ok(pasted.selected, tag('the pasted claim is selected'));
	ok(await target.evaluate(() => document.activeElement && document.activeElement.closest('#map-container') !== null),
		tag('focus is back in the map'));

	await target.keyboard.press('Meta+z');
	await target.waitForTimeout(300);
	ok((await reasons(target)).length === 1, tag('one undo takes the whole paste back'));

	// what any other app gets: the outline
	await target.evaluate(() => {
		const t = document.createElement('textarea');
		t.id = 'elsewhere';
		document.body.appendChild(t);
	});
	await target.focus('#elsewhere');
	await target.keyboard.press('Meta+v');
	ok(await target.inputValue('#elsewhere') === OUTLINE, tag('pasted as text, the claims read as an indented outline'));

	// text that is not claims pastes nothing into the map
	await target.fill('#elsewhere', 'Just some words.');
	await target.focus('#elsewhere');
	await target.keyboard.press('Meta+a');
	await target.keyboard.press('Meta+c');
	await select(target, 1);
	await target.keyboard.press('Meta+v');
	await target.waitForTimeout(700);
	ok((await reasons(target)).length === 1, tag('ordinary text on the clipboard adds nothing to the map'));

	// the Edit menu has no key press behind it, so its Paste reads the
	// clipboard through the Clipboard API, which Safari allows only during the
	// click; no headless engine can press Safari's Paste button, so the API
	// is stood in for here and asked only whether it was called in time
	await target.evaluate(() => {
		document.addEventListener('click', () => {
			window.inClick = true;
			setTimeout(() => { window.inClick = false; }, 0);
		}, true);
		const html = '<pre data-because-clipboard="' + JSON.stringify({ title: 'Read from the menu.', attr: {} }).replace(/"/g, '&quot;') + '">x</pre>';
		Object.defineProperty(navigator.clipboard, 'read', { configurable: true, value() {
			window.readInClick = window.inClick;
			return Promise.resolve([{ types: ['text/html'], getType: () => Promise.resolve(new Blob([html], { type: 'text/html' })) }]);
		} });
	});
	await select(target, 1);
	await target.click('.menu-title:has-text("Edit")');
	await target.click('.menu-item:has-text("Paste as reason")');
	await target.waitForTimeout(500);
	ok(await target.evaluate(() => window.readInClick === true), tag('Edit > Paste as reason reads the clipboard inside the click, as Safari requires'));
	ok(JSON.stringify((await reasons(target)).map(r => r[1])) === JSON.stringify([['An existing reason.'], ['Read from the menu.']]),
		tag('and pastes what it read'));
	await target.keyboard.press('Meta+z');
	await target.waitForTimeout(300);
	await target.evaluate(() => { delete navigator.clipboard.read; });

	// in Chrome a test can grant the real Clipboard API
	if (label === 'chrome') {
		await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: OTHER });
		await select(source, 3);
		await source.keyboard.press('Meta+c');
		await select(target, 1);
		await target.click('.menu-title:has-text("Edit")');
		await target.click('.menu-item:has-text("Paste as reason")');
		await target.waitForTimeout(1200);
		ok(JSON.stringify((await reasons(target)).map(r => r[1])) === JSON.stringify([['An existing reason.'], ['The copied claim.']]),
			tag('Edit > Paste as reason pastes claims copied in another tab'));
	}

	ok(source.errors.length === 0 && target.errors.length === 0,
		tag('no page errors') + (source.errors.concat(target.errors).length ? ': ' + source.errors.concat(target.errors).join(' | ') : ''));
	await context.close();
}

(async () => {
	const chrome = await chromium.launch({ executablePath: chromePath() });
	try { await scenario('chrome', chrome); } finally { await chrome.close(); }
	const safari = await webkit.launch();
	try { await scenario('webkit', safari); } finally { await safari.close(); }
	console.log(failures ? `\n${failures} failure(s)` : '\nall clipboard checks passed');
	process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
