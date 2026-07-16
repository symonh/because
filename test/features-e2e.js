// E2e for the 2026-07-16 evening feature batch: theme switcher button,
// loading overlay, rich text (⌘B/I/U + font size), connector popover
// (Stronger/Weaker) and label editing by double-click, right-click node
// styling, and dark-mode handling of author-set node colours.
// Expects `python3 -m http.server 8871` at repo root.
const puppeteer = require('puppeteer-core');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = process.env.BASE || 'http://127.0.0.1:8871';
let failures = 0;
const ok = (cond, name) => { console.log((cond ? 'PASS ' : 'FAIL ') + name); if (!cond) { failures += 1; } };
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
	const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
	const page = await browser.newPage();
	await page.setViewport({ width: 1500, height: 950, deviceScaleFactor: 2 });
	const errors = [];
	page.on('pageerror', e => errors.push(e.message));
	page.on('dialog', d => d.accept());

	await page.goto(BASE + '/app/index.html', { waitUntil: 'networkidle0' });
	await page.evaluate(() => localStorage.clear());
	await page.goto(BASE + '/app/index.html', { waitUntil: 'networkidle0' });
	await page.waitForSelector('.mapjs-node', { timeout: 8000 });
	await page.evaluate(() => {
		const box = document.getElementById('intro-dont-show');
		if (box) { box.checked = true; document.querySelector('.intro-start').click(); }
	});

	// ---- theme switcher button ----
	ok(await page.$('#topbar #theme-toggle') !== null, 'theme toggle button renders in the topbar');
	await page.click('#theme-toggle');
	await sleep(300);
	ok(await page.evaluate(() => document.body.classList.contains('dark')),
		'clicking the toggle switches to dark mode');
	ok(await page.$eval('#theme-toggle', el => el.getAttribute('aria-label')) === 'Switch to light mode',
		'toggle label flips with the mode');
	await page.click('#theme-toggle');
	await sleep(300);
	ok(await page.evaluate(() => !document.body.classList.contains('dark')),
		'clicking again switches back to light');

	// ---- rich text: whole-node shortcuts on a selected claim ----
	await page.evaluate(() => {
		window.__because.engine.loadMap({ formatVersion: 3, id: 'root', ideas: {
			1: { id: 2, title: 'Conclusion claim', ideas: {
				1: { id: 11, title: 'group', attr: { group: 'supporting', contentLocked: true }, ideas: {
					1: { id: 12, title: 'Premise text' }
				} }
			} }
		} });
	});
	await sleep(700);
	// real interaction: click the node so focus sits inside the map widget
	// (F2 and the engine's own keys are container-scoped)
	const clickNode = async id => {
		const c = await page.evaluate(nodeId => {
			const r = document.querySelector('#node_' + nodeId).getBoundingClientRect();
			return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
		}, id);
		await page.mouse.click(c.x, c.y);
		await sleep(250);
	};
	await clickNode(12);
	const metaPress = async (key, shift) => {
		await page.keyboard.down('Meta');
		if (shift) { await page.keyboard.down('Shift'); }
		await page.keyboard.press(key);
		if (shift) { await page.keyboard.up('Shift'); }
		await page.keyboard.up('Meta');
		await sleep(250);
	};
	await metaPress('b');
	let title = await page.evaluate(() => window.__because.engine.mapModel.getIdea().findSubIdeaById(12).title);
	ok(title === '<b>Premise text</b>', `⌘B bolds the whole selected claim (${title})`);
	ok(await page.evaluate(() => !!document.querySelector('#node_12 [data-mapjs-role=title] b')),
		'bold renders as a real <b> element in the node');
	await metaPress('i');
	title = await page.evaluate(() => window.__because.engine.mapModel.getIdea().findSubIdeaById(12).title);
	ok(title === '<b><i>Premise text</i></b>', `⌘I stacks italics on the bold title (${title})`);
	await metaPress('b');
	await metaPress('i');
	title = await page.evaluate(() => window.__because.engine.mapModel.getIdea().findSubIdeaById(12).title);
	ok(title === 'Premise text', `toggling both off returns the plain title (${title})`);

	// ---- rich text: formatting a selection inside the editor ----
	await page.keyboard.press('F2');
	await sleep(400);
	await page.evaluate(() => {
		// select just the word "Premise" inside the contenteditable
		const span = document.querySelector('#node_12 [data-mapjs-role=title]'),
			textNode = span.firstChild,
			range = document.createRange(),
			sel = window.getSelection();
		range.setStart(textNode, 0);
		range.setEnd(textNode, 7);
		sel.removeAllRanges();
		sel.addRange(range);
	});
	await metaPress('u');
	await page.keyboard.press('Enter');
	await sleep(400);
	title = await page.evaluate(() => window.__because.engine.mapModel.getIdea().findSubIdeaById(12).title);
	ok(title === '<u>Premise</u> text', `⌘U in the editor underlines only the selection (${title})`);
	ok(await page.evaluate(() => window.__because.engine.serialize().indexOf('<u>Premise</u> text') >= 0),
		'rich title serializes into the .mup');
	await metaPress('z');
	title = await page.evaluate(() => window.__because.engine.mapModel.getIdea().findSubIdeaById(12).title);
	ok(title === 'Premise text', `⌘Z undoes the rich edit in one step (${title})`);

	// ---- cancelled edits must re-enable input (the Mini-0 freeze) ----
	// Escape out of an editor
	await clickNode(12);
	await page.keyboard.press('F2');
	await sleep(400);
	await page.keyboard.press('Escape');
	await sleep(300);
	ok(await page.evaluate(() => window.__because.engine.mapModel.getInputEnabled()),
		'Escape from the editor re-enables input');
	// Enter creates a new premise whose editor opens; clicking away without
	// typing must cancel, undo the new node, and leave the app alive
	const nodesBefore = await page.evaluate(() => document.querySelectorAll('.mapjs-node').length);
	await page.keyboard.press('Enter');
	await sleep(500);
	await page.mouse.click(30, 300); // blur the fresh editor without typing
	await sleep(500);
	const afterAbandoned = await page.evaluate(() => ({
		inputEnabled: window.__because.engine.mapModel.getInputEnabled(),
		nodes: document.querySelectorAll('.mapjs-node').length
	}));
	ok(afterAbandoned.inputEnabled, 'abandoning a brand-new node editor re-enables input');
	ok(afterAbandoned.nodes === nodesBefore,
		`abandoned new node is rolled back (${afterAbandoned.nodes} vs ${nodesBefore})`);
	await clickNode(12); // keyboard must actually work again
	await metaPress('.', true);
	ok(await page.evaluate(() => {
		const s = (window.__because.engine.mapModel.getIdea().findSubIdeaById(12).attr || {}).style;
		return s && s.fontMultiplier === 1.2;
	}), 'keyboard commands still work after the cancelled edits');
	await metaPress(',', true); // restore default

	// ---- font size shortcuts ----
	await clickNode(12);
	await metaPress('.', true);
	let style = await page.evaluate(() => (window.__because.engine.mapModel.getIdea().findSubIdeaById(12).attr || {}).style);
	ok(style && style.fontMultiplier === 1.2, `⌘⇧. sets fontMultiplier 1.2 (${JSON.stringify(style)})`);
	ok(await page.evaluate(() => document.querySelector('#node_12').style.fontSize !== ''),
		'bigger text actually changes the rendered font size');
	await metaPress(',', true);
	style = await page.evaluate(() => (window.__because.engine.mapModel.getIdea().findSubIdeaById(12).attr || {}).style);
	ok(!style || !style.fontMultiplier, '⌘⇧, back to default removes the attribute');
	await metaPress(',', true);
	style = await page.evaluate(() => (window.__because.engine.mapModel.getIdea().findSubIdeaById(12).attr || {}).style);
	ok(style && style.fontMultiplier === 0.83, `⌘⇧, below default sets 0.83 (${JSON.stringify(style)})`);
	await metaPress('.', true); // restore default for the next sections

	// ---- connector popover: click a connector, Stronger / Weaker ----
	const connectorPoint = await page.evaluate(() => {
		const path = document.querySelector('#connector_2_11 path.mapjs-link-hit') ||
			document.querySelector('#connector_2_11 path'),
			r = path.getBoundingClientRect();
		return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
	});
	await page.mouse.click(connectorPoint.x, connectorPoint.y);
	await sleep(300);
	ok(await page.$('.connector-popover') !== null, 'clicking a connector opens the Stronger/Weaker popover');
	await page.evaluate(() => {
		Array.from(document.querySelectorAll('.cp-tile'))
			.find(t => t.textContent.indexOf('Stronger') >= 0).click();
	});
	await sleep(300);
	let pc = await page.evaluate(() => window.__because.engine.mapModel.getIdea().getAttrById(11, 'parentConnector'));
	ok(pc && pc.width === 4, `Stronger bumps parentConnector.width to 4 (${JSON.stringify(pc)})`);
	await page.evaluate(() => {
		Array.from(document.querySelectorAll('.cp-tile'))
			.find(t => t.textContent.indexOf('Weaker') >= 0).click();
	});
	await page.evaluate(() => {
		Array.from(document.querySelectorAll('.cp-tile'))
			.find(t => t.textContent.indexOf('Weaker') >= 0).click();
	});
	await sleep(300);
	pc = await page.evaluate(() => window.__because.engine.mapModel.getIdea().getAttrById(11, 'parentConnector'));
	ok(pc && pc.width === 2, `Weaker twice brings it to 2 (${JSON.stringify(pc)})`);
	ok(await page.evaluate(() => {
		const p = document.querySelector('#connector_2_11 path.mapjs-connector');
		return p && p.getAttribute('stroke-width') === '2';
	}), 'rendered connector stroke follows the override');
	await page.keyboard.press('Escape');
	await sleep(200);
	ok(await page.$('.connector-popover') === null, 'Escape closes the connector popover');

	// ---- double-click an unlabelled connector opens the label editor ----
	await page.mouse.click(connectorPoint.x, connectorPoint.y, { clickCount: 2 });
	await page.waitForSelector('.connector-label-editor', { timeout: 5000 });
	ok(true, 'double-clicking an unlabelled connector opens the label editor');
	await page.keyboard.type('New label via dblclick');
	await page.keyboard.press('Enter');
	await sleep(400);
	pc = await page.evaluate(() => window.__because.engine.mapModel.getIdea().getAttrById(11, 'parentConnector'));
	ok(pc && pc.label === 'New label via dblclick', `label lands in parentConnector.label (${JSON.stringify(pc)})`);

	// clicking the label body (its background rect, not the glyphs) edits it
	await sleep(400);
	const labelBox = await page.evaluate(() => {
		const rect = document.querySelector('#connector_2_11 .mapjs-connector-text rect'),
			r = rect.getBoundingClientRect();
		return { x: r.x + 3, y: r.y + 3 }; // corner: off the text glyphs
	});
	await page.mouse.click(labelBox.x, labelBox.y);
	await page.waitForSelector('.connector-label-editor', { timeout: 5000 });
	ok(await page.$eval('.connector-label-editor', el => el.value) === 'New label via dblclick',
		'clicking the label background opens the editor with current text');
	await page.keyboard.press('Escape');

	// ---- right-click node styling ----
	const nodeBox = await page.evaluate(() => {
		const r = document.querySelector('#node_12').getBoundingClientRect();
		return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
	});
	await page.mouse.click(nodeBox.x, nodeBox.y, { button: 'right' });
	await sleep(300);
	ok(await page.$('.node-style-popover') !== null, 'right-clicking a node opens the style popover');
	await page.evaluate(() => {
		Array.from(document.querySelectorAll('.ns-swatch'))
			.find(s => s.title === 'Coral').click();
	});
	await sleep(300);
	style = await page.evaluate(() => (window.__because.engine.mapModel.getIdea().findSubIdeaById(12).attr || {}).style);
	ok(style && style.background === '#f08080', `coral swatch sets attr.style.background (${JSON.stringify(style)})`);
	ok(await page.evaluate(() => {
		const bg = getComputedStyle(document.querySelector('#node_12')).backgroundColor;
		return bg === 'rgb(240, 128, 128)';
	}), 'node paints the chosen colour');
	await page.evaluate(() => {
		Array.from(document.querySelectorAll('.ns-swatch'))
			.find(s => s.title === 'None').click();
	});
	await sleep(300);
	style = await page.evaluate(() => (window.__because.engine.mapModel.getIdea().findSubIdeaById(12).attr || {}).style);
	ok(!style || !style.background, 'None clears the background attribute');
	await page.keyboard.press('Escape');

	// ---- dark mode with author-set colours (the rachels-foot bug) ----
	await page.evaluate(() => {
		window.__because.engine.loadMap({ formatVersion: 3, id: 'root', ideas: {
			1: { id: 2, title: 'White node', attr: { style: { background: '#ffffff', text: { color: '#000000' } } }, ideas: {
				1: { id: 11, title: 'group', attr: { group: 'supporting', contentLocked: true, parentConnector: { label: 'because…' } }, ideas: {
					1: { id: 12, title: 'Legacy colour', attr: { style: { backgroundColor: '#fafad2' } } }
				} }
			} }
		} });
	});
	await sleep(700);
	ok(await page.evaluate(() => {
		const bg = getComputedStyle(document.querySelector('#node_12')).backgroundColor;
		return bg === 'rgb(250, 250, 210)';
	}), 'light mode honours the legacy backgroundColor key');
	await page.click('#theme-toggle');
	await sleep(600);
	const darkColors = await page.evaluate(() => ({
		white: getComputedStyle(document.querySelector('#node_2')).backgroundColor,
		text: getComputedStyle(document.querySelector('#node_2')).color,
		legacy: getComputedStyle(document.querySelector('#node_12')).backgroundColor,
		labelMask: (document.querySelector('.mapjs-connector-text rect') || {style: {}}).style.fill,
		serialized: window.__because.engine.serialize()
	}));
	ok(darkColors.white !== 'rgb(255, 255, 255)', `author-white node darkens in dark mode (${darkColors.white})`);
	ok(darkColors.text !== 'rgb(0, 0, 0)', `author-black text lightens in dark mode (${darkColors.text})`);
	ok(darkColors.legacy !== 'rgb(250, 250, 210)', `legacy-key colour darkens too (${darkColors.legacy})`);
	ok(darkColors.labelMask === 'rgb(27, 29, 32)', `connector label mask matches the dark canvas (${darkColors.labelMask})`);
	ok(darkColors.serialized.indexOf('#ffffff') >= 0 && darkColors.serialized.indexOf('#fafad2') >= 0,
		'serialized map keeps the author colours untouched');
	await page.click('#theme-toggle');
	await sleep(400);

	// ---- connector label alignment on a wide fan (huemer-guns bug) ----
	await page.evaluate(() => {
		const wide = {};
		for (let i = 1; i <= 6; i++) {
			wide[i] = { id: 200 + i, title: 'A premise with a reasonably long text so the bracket gets wide ' + i };
		}
		window.__because.engine.loadMap({ formatVersion: 3, id: 'root', attr: { theme: 'argMappingHighImpact' }, ideas: {
			1: { id: 2, title: 'Conclusion', ideas: {
				1: { id: 11, title: 'group', attr: { group: 'opposing', contentLocked: true }, ideas: wide }
			} }
		} });
	});
	await sleep(900);
	const labelDrift = await page.evaluate(() => {
		const g = document.querySelector('#connector_2_11'),
			text = g.querySelector('.mapjs-connector-text text'),
			path = g.querySelector('path.mapjs-connector'),
			lr = text.getBoundingClientRect(),
			labelCx = lr.x + lr.width / 2,
			labelCy = lr.y + lr.height / 2,
			total = path.getTotalLength();
		let best = 1e9;
		for (let i = 0; i <= 400; i++) {
			const p = path.getPointAtLength(total * i / 400),
				sp = new DOMPoint(p.x, p.y).matrixTransform(path.getScreenCTM());
			if (Math.abs(sp.y - labelCy) < 8) { best = Math.min(best, Math.abs(sp.x - labelCx)); }
		}
		return Math.round(best);
	});
	ok(labelDrift <= 15, `"but…" label sits on its curve on a wide fan (drift ${labelDrift}px)`);

	// ---- label editor opens AT the connector on a scrolled viewport ----
	// (the editor is absolute inside the scrolling container; without the
	// scroll offsets it appeared far from the connector being edited)
	await page.evaluate(() => {
		const c = document.getElementById('map-container');
		c.scrollLeft += 180;
		c.scrollTop += 120;
	});
	await sleep(200);
	const scrolledPoint = await page.evaluate(() => {
		const path = document.querySelector('#connector_2_11 path.mapjs-link-hit'),
			r = path.getBoundingClientRect();
		return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
	});
	await page.mouse.click(scrolledPoint.x, scrolledPoint.y, { clickCount: 2 });
	await page.waitForSelector('.connector-label-editor', { timeout: 5000 });
	const editorDistance = await page.evaluate(p => {
		const r = document.querySelector('.connector-label-editor').getBoundingClientRect();
		return Math.round(Math.hypot(r.x + r.width / 2 - p.x, r.y + r.height / 2 - p.y));
	}, scrolledPoint);
	ok(editorDistance < 200, `label editor opens next to the connector when scrolled (${editorDistance}px away)`);
	await page.keyboard.press('Escape');
	await sleep(200);

	// ---- loading overlay on big maps ----
	const overlayShown = await page.evaluate(() => {
		const ideas = {};
		for (let i = 1; i <= 120; i++) {
			ideas[i] = { id: 100 + i, title: 'Claim number ' + i };
		}
		window.__because.io.loadJson({ formatVersion: 3, id: 'root',
			ideas: { 1: { id: 2, title: 'Big map root', ideas: ideas } } }, 'big.mup');
		// loadMap defers the heavy layout, so the overlay must be up NOW
		return !!document.querySelector('.loading-overlay');
	});
	ok(overlayShown, 'loading overlay appears synchronously when a big map starts loading');
	await page.waitForFunction(() => !document.querySelector('.loading-overlay'), { timeout: 15000 });
	ok(await page.evaluate(() => document.querySelectorAll('.mapjs-node').length > 50),
		'big map finishes rendering and the overlay goes away');

	if (errors.length) { console.log('PAGE ERRORS:', errors.join(' | ')); failures += 1; }
	await browser.close();
	console.log(failures === 0 ? 'ALL PASS' : failures + ' FAILURES');
	process.exit(failures === 0 ? 0 : 1);
})();
