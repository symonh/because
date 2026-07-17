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

	// dismiss the first-visit welcome modal so it never blocks clicks
	await page.evaluate(() => {
		const box = document.getElementById('intro-dont-show');
		if (box) { box.checked = true; document.querySelector('.intro-start').click(); }
	});

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

	// rich text in the REAL WebKit editor: Safari's contenteditable and
	// execCommand behave differently from Chrome's, so this must pass here
	await page.evaluate(() => {
		window.__because.engine.loadMap({ formatVersion: 3, id: 'root', ideas: {
			1: { id: 2, title: 'Conclusion claim', ideas: {
				1: { id: 11, title: 'group', attr: { group: 'supporting', contentLocked: true }, ideas: {
					1: { id: 12, title: 'Premise text' }
				} }
			} }
		} });
	});
	await page.waitForTimeout(900);
	const nodeBox = await page.evaluate(() => {
		const r = document.querySelector('#node_12').getBoundingClientRect();
		return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
	});
	await page.mouse.click(nodeBox.x, nodeBox.y);
	await page.waitForTimeout(300);
	await page.keyboard.press('Meta+b');
	await page.waitForTimeout(300);
	let title = await page.evaluate(() => window.__because.engine.mapModel.getIdea().findSubIdeaById(12).title);
	ok(title === '<b>Premise text</b>', `⌘B bolds the selected claim in WebKit (${title})`);
	// selection formatting inside the live editor
	await page.keyboard.press('F2');
	await page.waitForTimeout(400);
	await page.evaluate(() => {
		const span = document.querySelector('#node_12 [data-mapjs-role=title]'),
			walker = document.createTreeWalker(span, NodeFilter.SHOW_TEXT),
			textNode = walker.nextNode(),
			range = document.createRange(),
			sel = window.getSelection();
		range.setStart(textNode, 0);
		range.setEnd(textNode, 7);
		sel.removeAllRanges();
		sel.addRange(range);
	});
	await page.keyboard.press('Meta+i');
	await page.keyboard.press('Enter');
	await page.waitForTimeout(400);
	title = await page.evaluate(() => window.__because.engine.mapModel.getIdea().findSubIdeaById(12).title);
	ok(title === '<b><i>Premise</i></b><b> text</b>' || title === '<i><b>Premise</b></i><b> text</b>' ||
		title === '<b><i>Premise</i> text</b>',
		`⌘I in the WebKit editor italicises the selection (${title})`);
	ok(await page.evaluate(() => !!document.querySelector('#node_12 [data-mapjs-role=title] i')),
		'italics render as a real <i> element in WebKit');
	// right-click styling popover works on WebKit too
	await page.mouse.click(nodeBox.x, nodeBox.y, { button: 'right' });
	await page.waitForTimeout(300);
	ok(await page.$('.node-style-popover') !== null, 'right-click opens the style popover in WebKit');
	await page.evaluate(() => {
		Array.from(document.querySelectorAll('.ns-swatch')).find(s => s.title === 'Lemon').click();
	});
	await page.waitForTimeout(300);
	ok(await page.evaluate(() => {
		const style = (window.__because.engine.mapModel.getIdea().findSubIdeaById(12).attr || {}).style;
		return style && style.background === '#fafad2';
	}), 'swatch click writes attr.style.background in WebKit');
	await page.keyboard.press('Escape');

	// ---- auto-save in WebKit: no File System Access API, so a local map
	// has no writable target — enabling must explain itself and edits must
	// never trigger a download (the download fallback is manual-save only)
	const downloads = [];
	page.on('download', d => downloads.push(d));
	await clickMenu('File', 'Auto-save');
	await page.waitForTimeout(200);
	ok(await page.evaluate(() => {
		const p = document.querySelector('.panel');
		return !!p && p.textContent.indexOf('Auto-save is on') >= 0;
	}), 'enabling auto-save without a writable target shows the explainer');
	await page.click('.panel-close button');
	await page.evaluate(() => {
		const content = window.__because.engine.mapModel.getIdea(),
			anyId = Object.values(content.ideas)[0].id;
		content.updateTitle(anyId, 'Auto probe');
	});
	await page.waitForTimeout(2000);
	ok(await page.evaluate(() => document.getElementById('save-status').textContent) === 'Unsaved changes',
		'edits stay merely Unsaved — auto-save never fires without a target');
	ok(downloads.length === 0, 'no download was triggered by auto-save');

	await page.screenshot({ path: '/tmp/webkit_open.png' });
	if (errors.length) { console.log('PAGE ERRORS:', errors.join(' | ')); failures += 1; }
	await browser.close();
	console.log(failures === 0 ? 'ALL PASS (WebKit)' : failures + ' FAILURES (WebKit)');
	process.exit(failures ? 1 : 0);
})();
