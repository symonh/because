// WebKit (Safari engine) test of the File > Open flow — the browser Simon
// uses. WebKit has no File System Access API, so this exercises the real
// fallback path: DOM-attached picker input + unsaved-changes guard.
const { webkit } = require('playwright-core');
const path = require('path');
const BASE = process.env.BASE || 'http://127.0.0.1:8871';
let failures = 0;
const ok = (cond, name) => { console.log((cond ? 'PASS ' : 'FAIL ') + name); if (!cond) { failures += 1; } };

(async () => {
	const browser = await webkit.launch();
	const page = await browser.newPage({ viewport: { width: 1500, height: 950 } });
	const errors = [];
	page.on('pageerror', e => errors.push(e.message));

	await page.goto(BASE + '/app/index.html');
	await page.evaluate(() => localStorage.clear());
	await page.reload();
	await page.waitForSelector('.mapjs-node', { timeout: 8000 });

	ok(await page.evaluate(() => !window.showOpenFilePicker),
		'WebKit really lacks the File System Access API (fallback path is live)');

	// open a first map through the File menu
	const clickMenu = (menu, item) => page.evaluate(([menuName, itemPrefix]) => {
		Array.from(document.querySelectorAll('.menu-title'))
			.find(t => t.textContent === menuName).click();
		Array.from(document.querySelectorAll('.menu-item'))
			.find(i => i.textContent.indexOf(itemPrefix) === 0).click();
	}, [menu, item]);

	await clickMenu('File', 'Open');
	const picker = await page.$('input[type=file]');
	ok(picker !== null, 'picker input attached to the DOM');
	await picker.setInputFiles(require('path').join(__dirname, '..', 'samples', 'death.mup'));
	await page.waitForTimeout(700);
	let state = await page.evaluate(() => ({
		title: document.getElementById('map-title').textContent,
		hasMap: Array.from(document.querySelectorAll('.mapjs-node')).some(n => n.textContent.indexOf('going to die') >= 0)
	}));
	ok(state.hasMap && state.title === 'death.mup', `first map opens (title=${state.title})`);

	// edit it, then open a SECOND map — Simon's exact repro
	await page.evaluate(() => {
		const content = window.__because.engine.mapModel.getIdea(),
			anyId = Object.values(content.ideas)[0].id;
		content.updateTitle(anyId, 'Edited in WebKit');
	});
	await page.waitForTimeout(1000);
	ok(await page.evaluate(() => document.getElementById('save-status').textContent) === 'Unsaved changes',
		'edit marks the map unsaved');

	await clickMenu('File', 'Open');
	ok(await page.$('.panel-overlay .panel-actions') !== null, 'unsaved-changes modal appears before opening');
	await page.click('.panel-actions button[data-act=discard]');
	await page.waitForTimeout(200);
	await picker.setInputFiles(require('path').join(__dirname, '..', 'samples', 'vegetarian.mup'));
	await page.waitForTimeout(700);
	state = await page.evaluate(() => ({
		title: document.getElementById('map-title').textContent,
		oldGone: !Array.from(document.querySelectorAll('.mapjs-node')).some(n => n.textContent.indexOf('Edited in WebKit') >= 0),
		nodes: document.querySelectorAll('.mapjs-node').length
	}));
	ok(state.title === 'vegetarian.mup' && state.oldGone && state.nodes > 1,
		`second map replaces the first in WebKit (title=${state.title}, nodes=${state.nodes})`);

	// re-open the SAME file (input.value must be cleared between picks)
	await page.evaluate(() => {
		const content = window.__because.engine.mapModel.getIdea(),
			anyId = Object.values(content.ideas)[0].id;
		content.updateTitle(anyId, 'Second edit');
	});
	await clickMenu('File', 'Open');
	await page.click('.panel-actions button[data-act=discard]');
	await page.waitForTimeout(200);
	await picker.setInputFiles(require('path').join(__dirname, '..', 'samples', 'vegetarian.mup'));
	await page.waitForTimeout(700);
	ok(await page.evaluate(() => !Array.from(document.querySelectorAll('.mapjs-node')).some(n => n.textContent.indexOf('Second edit') >= 0)),
		'the same file can be re-opened (picker value reset)');

	await page.screenshot({ path: '/tmp/webkit_open.png' });
	if (errors.length) { console.log('PAGE ERRORS:', errors.join(' | ')); failures += 1; }
	await browser.close();
	console.log(failures === 0 ? 'ALL PASS (WebKit)' : failures + ' FAILURES (WebKit)');
	process.exit(failures ? 1 : 0);
})();
