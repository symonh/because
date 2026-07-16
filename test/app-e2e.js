// End-to-end smoke test for the Because app shell.
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
	// headless Chrome reports prefers-color-scheme: dark; pin light so the
	// suite starts deterministic and the dark-mode test flips it itself
	await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);

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

	// Cmd+Z / Cmd+Shift+Z — bound at the app layer (mapjs never bound undo,
	// so unconsumed Cmd+Z used to reach Safari's own Edit > Undo)
	const metaPress = async (key, shift) => {
		await page.keyboard.down('Meta');
		if (shift) { await page.keyboard.down('Shift'); }
		await page.keyboard.press(key);
		if (shift) { await page.keyboard.up('Shift'); }
		await page.keyboard.up('Meta');
		await new Promise(r => setTimeout(r, 300));
	};
	await metaPress('z'); // undo title
	await metaPress('z'); // undo group+child
	let opposingNow = await page.evaluate(() =>
		document.querySelectorAll('.mapjs-node.attr_group_opposing').length);
	ok(opposingNow === 0, `Cmd+Z undoes the objection (${opposingNow} opposing groups left)`);
	await metaPress('z', true);
	await metaPress('z', true);
	opposingNow = await page.evaluate(() =>
		document.querySelectorAll('.mapjs-node.attr_group_opposing').length);
	ok(opposingNow >= 1, 'Cmd+Shift+Z redoes the objection');

	// numbering badges present, then toggle off via View menu command
	const badges = await page.$$eval('.mapjs-label', els => els.filter(e => e.offsetParent !== null).length);
	ok(badges >= 3, `numbering badges render (${badges})`);

	// serialize through File > Save (intercept: read engine serialization)
	const saved = await page.evaluate(() => {
		const idea = window.__because && window.__because.engine.mapModel.getIdea();
		return JSON.stringify(idea);
	}).catch(() => null);
	// __because may not be exposed; fall back to localStorage autosave
	const autosaved = await page.evaluate(() => localStorage.getItem('because.autosave'));
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

	// drag-and-drop grammar: dropNode is what the drag controller calls on
	// mm:stop-dragging, so drive it directly with a known map
	const drop = await page.evaluate(() => {
		const eng = window.__because.engine,
			results = {};
		eng.loadMap({ formatVersion: 3, id: 1, title: 'C', ideas: {
			1: { id: 11, title: 'group', attr: { group: 'supporting', contentLocked: true }, ideas: {
				1: { id: 12, title: 'P1' },
				2: { id: 13, title: 'P2' }
			} },
			2: { id: 21, title: 'group', attr: { group: 'supporting', contentLocked: true }, ideas: {
				1: { id: 22, title: 'Q1' }
			} }
		} });
		const mm = eng.mapModel,
			content = mm.getIdea();
		// claim onto claim: wrapped in a fresh supporting group, not naked
		results.dropOntoClaim = mm.dropNode(13, 12, false);
		const p1 = content.findSubIdeaById(12),
			p1Kids = Object.values(p1.ideas || {});
		results.wrappedInGroup = p1Kids.length === 1 && !!p1Kids[0].attr &&
			p1Kids[0].attr.group === 'supporting' && p1Kids[0].attr.contentLocked === true;
		const groupKids = Object.values((p1Kids[0] && p1Kids[0].ideas) || {});
		results.premiseInsideGroup = groupKids.length === 1 && groupKids[0].id === 13;
		// claim onto group: joins as co-premise; emptied source group removed
		results.dropOntoGroup = mm.dropNode(22, 11, false);
		results.coPremiseJoined = Object.values(content.findSubIdeaById(11).ideas || {})
			.some(n => n.id === 22);
		results.emptyGroupRemoved = !content.findSubIdeaById(21);
		// one undo restores both the move and the removed group
		mm.undo('test');
		const oldGroup = content.findSubIdeaById(21);
		results.undoRestores = !!oldGroup &&
			Object.values(oldGroup.ideas || {}).some(n => n.id === 22);
		return results;
	});
	ok(drop.dropOntoClaim && drop.wrappedInGroup, 'drop claim onto claim wraps it in a supporting group');
	ok(drop.premiseInsideGroup, 'dropped claim sits inside the new group');
	ok(drop.dropOntoGroup && drop.coPremiseJoined, 'drop claim onto group joins as co-premise');
	ok(drop.emptyGroupRemoved, 'emptied source group is removed');
	ok(drop.undoRestores, 'single undo restores move and removed group');

	// status must reflect the FILE state: after an edit it says unsaved and
	// the autosave debounce must not flip it back to "All changes saved"
	await page.evaluate(() => {
		window.__because.engine.mapModel.getIdea().updateTitle(12, 'Edited claim');
	});
	await new Promise(r => setTimeout(r, 1200));
	let statusText = await page.$eval('#save-status', el => el.textContent);
	ok(statusText === 'Unsaved changes', `status stays "Unsaved changes" after autosave (got "${statusText}")`);

	// File > Open with unsaved changes: the guard modal appears; Cancel keeps the map
	// substring match: checked items carry a leading "✓ "
	const clickMenu = (menu, item) => page.evaluate((menuName, itemText) => {
		Array.from(document.querySelectorAll('.menu-title'))
			.find(t => t.textContent === menuName).click();
		Array.from(document.querySelectorAll('.menu-item'))
			.find(i => i.textContent.indexOf(itemText) >= 0).click();
	}, menu, item);
	await clickMenu('File', 'New');
	ok(await page.$('.panel-overlay .panel-actions') !== null, 'unsaved-changes modal appears on File > New');
	await page.click('.panel-actions button[data-act=cancel]');
	let hasEdited = await page.evaluate(() =>
		Array.from(document.querySelectorAll('.mapjs-node')).some(n => n.textContent.indexOf('Edited claim') >= 0));
	ok(hasEdited, 'Cancel keeps the current map');

	// Don't save proceeds; then the fallback Open path (Safari has no File
	// System Access API) must use a DOM-attached picker input that loads
	await page.evaluate(() => { delete window.showOpenFilePicker; });
	await clickMenu('File', 'New');
	await page.click('.panel-actions button[data-act=discard]');
	hasEdited = await page.waitForFunction(() =>
		!Array.from(document.querySelectorAll('.mapjs-node')).some(n => n.textContent.indexOf('Edited claim') >= 0),
	{ timeout: 5000 }).then(() => false).catch(() => true);
	ok(!hasEdited, 'Don\'t save proceeds to the new map');
	await clickMenu('File', 'Open');
	const picker = await page.$('input[type=file]');
	ok(picker !== null, 'fallback picker input is attached to the DOM');
	await picker.uploadFile(require('path').join(__dirname, '..', 'samples', 'death.mup'));
	await page.waitForFunction(() =>
		document.getElementById('map-title').textContent === 'death.mup',
	{ timeout: 5000 }).catch(() => null);
	const openedSecond = await page.evaluate(() => ({
		hasDeath: Array.from(document.querySelectorAll('.mapjs-node'))
			.some(n => n.textContent.indexOf('going to die') >= 0),
		title: document.getElementById('map-title').textContent,
		saved: document.getElementById('save-status').textContent
	}));
	ok(openedSecond.hasDeath && openedSecond.title === 'death.mup',
		`opening a second map replaces the first (title=${openedSecond.title})`);
	ok(openedSecond.saved === 'All changes saved', 'freshly opened map reads as saved');

	// dark mode: flips chrome + map theme, never touches map data, persists
	await clickMenu('View', 'Dark mode');
	const darkState = await page.evaluate(() => ({
		body: document.body.classList.contains('dark'),
		themeDark: document.getElementById('themeCSS').textContent.indexOf('#26292d') >= 0,
		fileDark: window.__because.engine.serialize().indexOf('#26292d') >= 0
	}));
	ok(darkState.body && darkState.themeDark, 'dark mode flips chrome and map theme');
	ok(!darkState.fileDark, 'dark palette never enters the serialized map');
	await page.reload({ waitUntil: 'networkidle0' });
	await page.waitForSelector('.mapjs-node', { timeout: 8000 });
	ok(await page.evaluate(() => document.body.classList.contains('dark')),
		'dark mode persists across reload');
	await clickMenu('View', 'Dark mode');
	ok(await page.evaluate(() => !document.body.classList.contains('dark')),
		'dark mode toggles back to light');

	// screenshot the full app for visual review
	await page.screenshot({ path: '/tmp/app_ui.png' });

	if (errors.length) { console.log('PAGE ERRORS:', errors.join(' | ')); failures += 1; }
	await browser.close();
	console.log(failures === 0 ? 'ALL PASS' : failures + ' FAILURES');
	process.exit(failures === 0 ? 0 : 1);
})();
