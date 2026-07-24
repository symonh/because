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

	// ---- themes from the View menu ----
	const clickMenu = (menu, item) => page.evaluate(([menuName, itemText]) => {
		Array.from(document.querySelectorAll('.menu-title'))
			.find(t => t.textContent === menuName).click();
		Array.from(document.querySelectorAll('.menu-item'))
			.find(i => i.textContent.indexOf(itemText) >= 0).click();
	}, [menu, item]);
	await page.evaluate(() => {
		window.__because.engine.loadMap({ formatVersion: 3, id: 'root', ideas: {
			1: { id: 2, title: 'Conclusion', ideas: {
				1: { id: 11, title: 'group', attr: { group: 'supporting', contentLocked: true }, ideas: {
					1: { id: 12, title: 'A reason' }
				} },
				2: { id: 21, title: 'group', attr: { group: 'opposing', contentLocked: true }, ideas: {
					1: { id: 22, title: 'An objection' }
				} }
			} }
		} });
	});
	await sleep(800);
	const simpleState = await page.evaluate(() => ({
		width: document.querySelector('#connector_2_11 path.mapjs-connector').getAttribute('stroke-width'),
		arrows: Array.from(document.querySelectorAll('[data-mapjs-role=connector] path.mapjs-arrow'))
			.filter(a => a.style.display !== 'none').length,
		labels: document.querySelectorAll('[data-mapjs-role=connector] .mapjs-connector-text text').length
	}));
	ok(simpleState.width === '3' && simpleState.arrows === 0 && simpleState.labels === 0,
		`Simple theme: width 3, no arrows, no auto labels (${JSON.stringify(simpleState)})`);
	await clickMenu('View', 'Theme: High-impact downward');
	await sleep(800);
	const impactState = await page.evaluate(() => {
		const labelFor = id => {
			const t = document.querySelector('#' + id + ' .mapjs-connector-text text');
			return t ? t.textContent : null;
		};
		// arrow d = "M barb1 L apex L barb2 Z" (arrow-path.js)
		const arrowD = document.querySelector('#connector_2_11 path.mapjs-arrow').getAttribute('d'),
			n = arrowD.match(/-?\d+(?:\.\d+)?/g).map(Number);
		return {
			width: document.querySelector('#connector_2_11 path.mapjs-connector').getAttribute('stroke-width'),
			arrows: Array.from(document.querySelectorAll('[data-mapjs-role=connector] path.mapjs-arrow'))
				.filter(a => a.style.display !== 'none').length,
			arrowFill: (document.querySelector('#connector_2_11 path.mapjs-arrow') || {getAttribute: () => null}).getAttribute('fill'),
			pointsDown: n[3] > n[1],
			reasonLabel: labelFor('connector_2_11'),
			objectionLabel: labelFor('connector_2_21'),
			themeAttr: window.__because.engine.mapModel.getIdea().attr.theme
		};
	});
	ok(impactState.width === '4', `High-impact downward: thicker connector/bracket stroke (${impactState.width})`);
	ok(impactState.arrows === 2, `High-impact downward: arrows on both group connectors (${impactState.arrows})`);
	ok(impactState.arrowFill === '#339966', `arrow fill matches the supporting line (${impactState.arrowFill})`);
	ok(impactState.pointsDown, 'downward arrowheads point down into the bracket');
	ok(impactState.reasonLabel === 'Because' && impactState.objectionLabel === 'But',
		`reasons say Because, objections say But (${impactState.reasonLabel}/${impactState.objectionLabel})`);
	ok(impactState.themeAttr === 'argMappingHighImpact', 'theme choice is recorded in the map');
	await clickMenu('View', 'Theme: High-impact upward');
	await sleep(800);
	const upState = await page.evaluate(() => {
		const labelFor = id => {
			const t = document.querySelector('#' + id + ' .mapjs-connector-text text');
			return t ? t.textContent : null;
		};
		const conn = document.querySelector('#connector_2_11'),
			path = conn.querySelector('path.mapjs-connector'),
			arrow = conn.querySelector('path.mapjs-arrow'),
			label = conn.querySelector('.mapjs-connector-text'),
			pRect = path.getBoundingClientRect(),
			aRect = arrow.getBoundingClientRect(),
			lRect = label.getBoundingClientRect(),
			n = arrow.getAttribute('d').match(/-?\d+(?:\.\d+)?/g).map(Number),
			// head angle must continue the curve: compare the head's direction
			// (barb midpoint -> apex) with the path chord over its first 20px
			// (the path starts at the parent end, where the 'from' arrow sits)
			p0 = path.getPointAtLength(0),
			p1 = path.getPointAtLength(20),
			chord = Math.atan2(p1.y - p0.y, p1.x - p0.x),
			head = Math.atan2(n[3] - (n[1] + n[5]) / 2, n[2] - (n[0] + n[4]) / 2),
			misalignment = Math.abs((head + Math.PI - chord + Math.PI * 3) % (Math.PI * 2) - Math.PI);
		return {
			alignedDeg: Math.round(misalignment * 180 / Math.PI),
			width: path.getAttribute('stroke-width'),
			arrows: Array.from(document.querySelectorAll('[data-mapjs-role=connector] path.mapjs-arrow'))
				.filter(a => a.style.display !== 'none').length,
			pointsUp: n[3] < n[1],
			arrowAtTop: (aRect.top - pRect.top) < pRect.height / 2,
			labelAtTop: (lRect.top + lRect.height / 2 - pRect.top) < pRect.height / 2,
			reasonLabel: labelFor('connector_2_11'),
			objectionLabel: labelFor('connector_2_21'),
			themeAttr: window.__because.engine.mapModel.getIdea().attr.theme
		};
	});
	ok(upState.width === '4', `High-impact upward: thicker connector/bracket stroke (${upState.width})`);
	ok(upState.arrows === 2, `High-impact upward: arrows on both group connectors (${upState.arrows})`);
	ok(upState.pointsUp, 'upward arrowheads point up');
	ok(upState.alignedDeg <= 15, `arrowhead angle follows the curve at the join (${upState.alignedDeg}° off the chord)`);
	ok(upState.arrowAtTop, 'upward arrowhead sits at the parent-claim end of the connector');
	ok(upState.labelAtTop, 'upward label hangs below the parent claim, not above the bracket');
	ok(upState.reasonLabel === 'Therefore' && upState.objectionLabel === 'Therefore, it is false that',
		`reasons say Therefore, objections say Therefore-it-is-false-that (${upState.reasonLabel}/${upState.objectionLabel})`);
	ok(upState.themeAttr === 'argMappingHighImpactUpward', 'upward theme choice is recorded in the map');
	await clickMenu('View', 'Theme: Simple');
	await sleep(800);
	ok(await page.evaluate(() =>
		Array.from(document.querySelectorAll('[data-mapjs-role=connector] path.mapjs-arrow'))
			.filter(a => a.style.display !== 'none').length) === 0,
		'switching back to Simple removes the arrows');

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

	// ---- auto-save: opt-in, and inert without a writable file target ----
	// (this map has no Drive file and no FS Access handle, so enabling must
	// explain itself and edits must stay merely dirty — never a download)
	await page.evaluate(() => {
		Array.from(document.querySelectorAll('.menu-title')).find(t => t.textContent === 'File').click();
	});
	const autoLabel = await page.evaluate(() =>
		Array.from(document.querySelectorAll('.menu-item')).map(i => i.textContent).find(t => t.indexOf('Auto-save') >= 0));
	ok(autoLabel === 'Auto-save', `File menu offers Auto-save, off by default (${autoLabel})`);
	await page.keyboard.press('Escape');
	await clickMenu('File', 'Auto-save');
	await sleep(200);
	ok(await page.$eval('.panel', el => el.textContent.indexOf('Auto-save is on') >= 0).catch(() => false),
		'enabling without a writable target explains where auto-save applies');
	await page.click('.panel-close button');
	ok(await page.evaluate(() => localStorage.getItem('because.autosave.auto') === '1'),
		'the auto-save preference persists in localStorage');
	await page.evaluate(() => {
		Array.from(document.querySelectorAll('.menu-title')).find(t => t.textContent === 'File').click();
	});
	ok(await page.evaluate(() => Array.from(document.querySelectorAll('.menu-item'))
		.some(i => i.textContent === '✓ Auto-save')), 'the menu shows Auto-save checked');
	await page.keyboard.press('Escape');
	await page.evaluate(() => {
		const content = window.__because.engine.mapModel.getIdea(),
			anyId = Object.values(content.ideas)[0].id;
		content.updateTitle(anyId, 'auto probe');
	});
	await sleep(2000);
	ok(await page.evaluate(() => document.getElementById('save-status').textContent) === 'Unsaved changes',
		'without a target an edit stays merely Unsaved (no phantom auto-save)');
	ok(await page.evaluate(() => !window.__because.analytics.events().some(e =>
		e.name === 'map_save' && e.params.mode === 'auto')),
		'no map_save mode=auto is emitted without a target');
	await clickMenu('File', 'Auto-save'); // back off for the rest of the suite
	await sleep(200);

	// ---- analytics: local buffer, surface tagging, privacy ----
	// on localhost analytics must never send (and with no measurement id it
	// couldn't anyway), but every event still lands in the inspectable
	// buffer, so the whole pipeline is assertable offline
	const ga = await page.evaluate(() => {
		window.dispatchEvent(new Event('pagehide')); // flush the edit batch
		return {
			enabled: window.__because.analytics.isEnabled(),
			gtagScript: !!document.querySelector('script[src*="googletagmanager"]'),
			events: window.__because.analytics.events()
		};
	});
	const findEv = (name, pred) => ga.events.find(e => e.name === name && (!pred || pred(e.params)));
	ok(ga.enabled === false && ga.gtagScript === false,
		'analytics stays disabled on localhost (no gtag script injected)');
	ok(!!findEv('app_open'), 'app_open tracked at boot');
	ok(!!findEv('intro_shown', p => p.trigger === 'first_visit') &&
		!!findEv('intro_dismissed', p => p.dont_show_again === 'yes'),
		'welcome modal tracks its show and dismissal');
	ok(!!findEv('command', p => p.command_name === 'toggleBold' && p.method === 'shortcut'),
		'commands are tracked with their UI surface (⌘B → shortcut)');
	ok(!!findEv('dark_mode_toggle', p => p.enabled === 'on'), 'dark mode toggles are tracked');
	ok(!!findEv('auto_save_toggle', p => p.enabled === 'on') && !!findEv('auto_save_toggle', p => p.enabled === 'off'),
		'auto-save toggles are tracked');
	ok(!!findEv('theme_select', p => p.theme === 'high_impact'), 'View-menu theme choice is tracked');
	ok(!!findEv('connector_action', p => p.action === 'stronger') &&
		!!findEv('connector_action', p => p.action === 'label_set'),
		'connector strengthening and labelling are tracked');
	ok(!!findEv('node_style', p => p.action === 'background_swatch' && p.swatch === 'Coral'),
		'node styling tracks the swatch by name');
	ok(!!findEv('map_open', p => p.node_count === 122 && p.node_bucket === '101-250'),
		'map_open carries the node count and bucket');
	const batch = findEv('edit_batch');
	ok(!!batch && batch.params.changes > 0,
		`edit batch flushes on pagehide (${batch && batch.params.changes} changes)`);
	// the privacy contract: nothing the user typed may appear in any event —
	// these three strings were all typed or rendered as map content above
	const gaPayload = JSON.stringify(ga.events);
	ok(gaPayload.indexOf('Premise') < 0 && gaPayload.indexOf('dblclick') < 0 &&
		gaPayload.indexOf('Claim number') < 0,
		'no map text or typed labels leak into any analytics event');

	if (errors.length) { console.log('PAGE ERRORS:', errors.join(' | ')); failures += 1; }
	await browser.close();
	console.log(failures === 0 ? 'ALL PASS' : failures + ' FAILURES');
	process.exit(failures === 0 ? 0 : 1);
})();
