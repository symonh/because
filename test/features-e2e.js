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
	// the default layout is the left rail, which docks the toggle at its foot
	// (the classic layout keeps it in the top bar; see the layout section)
	ok(await page.$('#toolbar #theme-toggle') !== null, 'theme toggle button renders at the rail foot');
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
	// blur the fresh editor without typing, on bare canvas — x=30 used to be
	// empty map, but the 46px rail now sits there, so click clear of it
	await page.mouse.click(200, 850);
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

	// ---- labelling an objection (or reason) aimed at an inference ----
	// A bracket nested inside a bracket answers the inference, not the claim,
	// and draws as a bare bar under its parent's bracket. Its connector is
	// the theme's no-connector style — no curve, no hit line — and the label
	// it carries renders inside the parent bracket's strip, which sits above
	// the SVG layer. The band directly above the nested bar is the click
	// target that reaches it.
	await page.evaluate(() => {
		window.__because.engine.loadMap({ formatVersion: 3, id: 'root', ideas: {
			1: { id: 1, title: 'Claim 1', ideas: {
				1: { id: 10, title: 'group', attr: { group: 'supporting', contentLocked: true }, ideas: {
					1: { id: 7, title: 'Claim 7' },
					2: { id: 20, title: 'group', attr: { group: 'opposing', contentLocked: true }, ideas: {
						1: { id: 9, title: 'Claim 9' }
					} },
					3: { id: 30, title: 'group', attr: { group: 'supporting', contentLocked: true }, ideas: {
						1: { id: 11, title: 'Claim 11' }
					} }
				} }
			} }
		} });
	});
	await sleep(800);
	const bracketBox = id => page.evaluate(i => {
			const e = document.getElementById(i);
			if (!e) { return null; }
			const b = e.getBoundingClientRect();
			return { l: b.left, t: b.top, w: b.width, h: b.height };
		}, id),
		// the band is the nested bracket's own width, one strip height above
		// its bar — where the label renders
		bandCentre = async function (id) {
			const b = await bracketBox(id);
			return { x: b.l + b.w / 2, y: b.t - b.h / 2 };
		};

	ok(await page.$('#connector_10_20') !== null,
		'a bracket nested in a bracket gets its own connector');
	// where everything sits before any label exists — the nested bar is flush
	// under its parent's, which is where MindMup left it
	// (read off the layout rather than the DOM, and relative to the parent
	// bracket: a selected claim wears a 3px border that moves its own box)
	const offsets = () => page.evaluate(() => {
		const y = window.__because.engine.mapModel.getCurrentLayout().nodes;
		return { bar: y[20].y - y[10].y, sibling: y[7].y - y[10].y, premise: y[9].y - y[10].y };
	});
	const flush = await offsets();
	ok(flush.bar === 16 && flush.premise === 32 && flush.sibling === 16,
		`an unlabelled nested bracket stays flush under its parent (${JSON.stringify(flush)})`);
	await page.evaluate(() => window.__because.engine.mapModel.selectNode(7));
	await sleep(150);
	let band = await bandCentre('node_20');
	await page.mouse.move(band.x, band.y);
	await sleep(150);
	ok(await page.evaluate(() => document.getElementById('map-container').classList.contains('label-band-hover')),
		'the pointer over the band says text');
	const parentStrip = await bracketBox('node_10');
	await page.mouse.move(parentStrip.l + 4, parentStrip.t + parentStrip.h / 2);
	await sleep(150);
	ok(await page.evaluate(() => !document.getElementById('map-container').classList.contains('label-band-hover')),
		'the rest of the parent bracket does not');

	await page.mouse.click(band.x, band.y);
	await page.waitForSelector('.connector-label-editor', { timeout: 5000 });
	ok(true, 'clicking the band opens the label editor');
	ok(await page.evaluate(() => window.__because.engine.mapModel.getSelectedNodeId()) === 7,
		'the click does not select the bracket that owns those pixels');
	await page.keyboard.type('Inf. objection');
	await page.keyboard.press('Enter');
	await sleep(500);
	let nestedPc = await page.evaluate(() => window.__because.engine.mapModel.getIdea().getAttrById(20, 'parentConnector'));
	ok(nestedPc && nestedPc.label === 'Inf. objection',
		`the label lands in the nested bracket's parentConnector.label (${JSON.stringify(nestedPc)})`);

	const infLabel = await page.evaluate(() => {
		const text = document.querySelector('#connector_10_20 .mapjs-connector-text text'),
			bar = document.getElementById('node_20');
		if (!text) { return null; }
		const t = text.getBoundingClientRect(), b = bar.getBoundingClientRect(),
			stripTop = document.getElementById('node_10').getBoundingClientRect().top;
		return {
			content: text.textContent,
			fill: getComputedStyle(text).fill,
			above: Math.round(b.top - t.bottom),
			below: Math.round(t.top - stripTop),
			offCentre: Math.round(Math.abs((t.left + t.width / 2) - (b.left + b.width / 2)))
		};
	});
	const dropped = await offsets();
	ok(infLabel && infLabel.content === 'Inf. objection', 'the label renders on the map');
	ok(infLabel && infLabel.offCentre <= 2,
		`centred on the bar (${infLabel && infLabel.offCentre}px off)`);
	ok(infLabel && infLabel.fill === 'rgb(255, 0, 0)',
		`red, like the bar it labels (${infLabel && infLabel.fill})`);
	// the label needs room, so a LABELLED nested bracket drops 12px and takes
	// its premises with it — the claim beside it stays on its own level
	ok(dropped.bar === flush.bar + 12,
		`labelling drops the bar 12px below its parent's (${JSON.stringify(dropped)})`);
	ok(dropped.premise === flush.premise + 12 && dropped.sibling === flush.sibling,
		'its premise comes with it and the claim beside it does not move');
	ok(infLabel && infLabel.above >= 4 && infLabel.above <= 9,
		`the label clears the red bar (${infLabel && infLabel.above}px)`);
	ok(infLabel && infLabel.below >= 6 && infLabel.below <= 12,
		`and clears the bracket it hangs under (${infLabel && infLabel.below}px)`);

	// the rendered label is inside the band, so clicking it re-opens the editor
	await page.mouse.click(band.x, band.y);
	await page.waitForSelector('.connector-label-editor', { timeout: 5000 });
	ok(await page.$eval('.connector-label-editor', el => el.value) === 'Inf. objection',
		'clicking the rendered label re-opens the editor on its text');
	await page.keyboard.press('Escape');
	await sleep(200);

	// one undo takes it back; the same band labels a nested REASON in green
	await page.evaluate(() => window.__because.commands.undo());
	await sleep(400);
	nestedPc = await page.evaluate(() => window.__because.engine.mapModel.getIdea().getAttrById(20, 'parentConnector'));
	ok(!nestedPc || !nestedPc.label, `one undo removes the label (${JSON.stringify(nestedPc)})`);
	ok((await offsets()).bar === flush.bar,
		'and the bar goes back flush under its parent');
	await page.evaluate(() => window.__because.commands.redo());
	await sleep(400);

	band = await bandCentre('node_30');
	await page.mouse.click(band.x, band.y);
	await page.waitForSelector('.connector-label-editor', { timeout: 5000 });
	await page.keyboard.type('Inf. support');
	await page.keyboard.press('Enter');
	await sleep(500);
	ok(await page.evaluate(() => {
		const t = document.querySelector('#connector_10_30 .mapjs-connector-text text');
		return t && t.textContent === 'Inf. support' && getComputedStyle(t).fill === 'rgb(51, 153, 102)';
	}), 'a reason for the inference is labelled the same way, in green');

	// selecting the brackets themselves still works either side of the band
	await page.mouse.click(parentStrip.l + 4, parentStrip.t + parentStrip.h / 2);
	await sleep(300);
	ok(await page.evaluate(() => window.__because.engine.mapModel.getSelectedNodeId()) === 10,
		'the rest of the parent bracket still selects it');
	const nested = await bracketBox('node_20');
	await page.mouse.click(nested.l + nested.w / 2, nested.t + nested.h - 3);
	await sleep(300);
	ok(await page.evaluate(() => window.__because.engine.mapModel.getSelectedNodeId()) === 20,
		'the nested bracket below its bar still selects it');
	// …and with it selected, the menu path reaches the same label
	await page.evaluate(() => window.__because.labelEdit.editSelectedConnectorLabel());
	await page.waitForSelector('.connector-label-editor', { timeout: 5000 });
	ok(await page.$eval('.connector-label-editor', el => el.value) === 'Inf. objection',
		'Edit > Edit connector label… reaches it from the selected bracket');
	await page.keyboard.press('Escape');
	await sleep(200);

	// the label is map data: it must survive a save/load round trip untouched
	const withLabels = await page.evaluate(() => JSON.stringify(window.__because.engine.mapModel.getIdea()));
	ok(withLabels.indexOf('Inf. objection') > 0 && withLabels.indexOf('Inf. support') > 0,
		'both labels serialize into the .mup');
	await page.evaluate(() => window.__because.darkMode.toggle());
	await sleep(500);
	ok(await page.evaluate(() => getComputedStyle(document.querySelector('#connector_10_20 .mapjs-connector-text text')).fill) === 'rgb(255, 93, 93)',
		'dark mode softens the label red with the rest of the theme');
	ok(await page.evaluate(() => JSON.stringify(window.__because.engine.mapModel.getIdea())) === withLabels,
		'dark mode leaves the labelled map byte-identical');
	await page.evaluate(() => window.__because.darkMode.toggle());
	await sleep(500);

	// zoom scales the band with everything else
	await page.evaluate(() => { window.__because.commands.zoomIn(); window.__because.commands.zoomIn(); });
	await sleep(600);
	band = await bandCentre('node_20');
	await page.mouse.click(band.x, band.y);
	await page.waitForSelector('.connector-label-editor', { timeout: 5000 });
	ok(true, 'the band still lands when the map is zoomed in');
	await page.keyboard.press('Escape');
	await page.evaluate(() => window.__because.commands.zoomReset());
	await sleep(500);

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
		const path = document.querySelector('#connector_2_11 path.mapjs-connector'),
			arrowD = document.querySelector('#connector_2_11 path.mapjs-arrow').getAttribute('d'),
			n = arrowD.match(/-?\d+(?:\.\d+)?/g).map(Number),
			// this head sits at the bracket end, so the curve is trimmed there;
			// the bracket overline is appended relative to the path's current
			// point, so it must still be drawn at the group's top edge
			groupTop = document.querySelector('#node_11').getBoundingClientRect().top;
		return {
			labelOnLine: (function () {
				// the connector must pass through the MIDDLE of its label
				// (masked behind the text), not graze its underside
				const t = document.querySelector('#connector_2_11 .mapjs-connector-text text');
				if (!t) { return null; }
				const r = t.getBoundingClientRect(),
					cx = r.x + r.width / 2,
					cy = r.y + r.height / 2,
					len = path.getTotalLength();
				let best = 1e9, i, pt, sp;
				for (i = 0; i <= 400; i++) {
					pt = path.getPointAtLength(len * i / 400);
					sp = new DOMPoint(pt.x, pt.y).matrixTransform(path.getScreenCTM());
					best = Math.min(best, Math.hypot(sp.x - cx, sp.y - cy));
				}
				return Math.round(best);
			}()),
			bracketOffsetFromGroupTop: Math.round(Math.abs(path.getBoundingClientRect().bottom - groupTop)),
			// the label belongs halfway down the connector: the gap between the
			// parent claim's base and the bracket it points at
			labelOffMidSpan: (function () {
				const t = document.querySelector('#connector_2_11 .mapjs-connector-text text').getBoundingClientRect(),
					parentBottom = document.querySelector('#node_2').getBoundingClientRect().bottom,
					childTop = document.querySelector('#node_11').getBoundingClientRect().top;
				return Math.round(Math.abs(t.y + t.height / 2 - (parentBottom + childTop) / 2));
			}()),
			labelClearsArrow: (function () {
				const t = document.querySelector('#connector_2_11 .mapjs-connector-text').getBoundingClientRect(),
					a = document.querySelector('#connector_2_11 path.mapjs-arrow').getBoundingClientRect();
				return !(t.left < a.right && a.left < t.right && t.top < a.bottom && a.top < t.bottom);
			}()),
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
	ok(impactState.labelOnLine <= 4,
		`the connector runs through the middle of the Because label (${impactState.labelOnLine}px from its centre)`);
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
			// the stroke must stop where the head begins (otherwise the 4px
			// line runs through the head and pokes out of the bend's outside
			// and past the apex), and leave it at close to the head's angle.
			// The path starts at the parent end, where the 'from' head sits.
			baseMid = {x: (n[0] + n[4]) / 2, y: (n[1] + n[5]) / 2},
			p0 = path.getPointAtLength(0),
			p4 = path.getPointAtLength(4),
			seam = Math.atan2(p4.y - p0.y, p4.x - p0.x),
			axis = Math.atan2(n[3] - baseMid.y, n[2] - baseMid.x),
			kink = Math.abs(((axis + Math.PI - seam + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
		return {
			labelOnLine: (function () {
				// the connector must pass through the MIDDLE of its label
				// (masked behind the text), not graze its underside
				const t = document.querySelector('#connector_2_11 .mapjs-connector-text text');
				if (!t) { return null; }
				const r = t.getBoundingClientRect(),
					cx = r.x + r.width / 2,
					cy = r.y + r.height / 2,
					len = path.getTotalLength();
				let best = 1e9, i, pt, sp;
				for (i = 0; i <= 400; i++) {
					pt = path.getPointAtLength(len * i / 400);
					sp = new DOMPoint(pt.x, pt.y).matrixTransform(path.getScreenCTM());
					best = Math.min(best, Math.hypot(sp.x - cx, sp.y - cy));
				}
				return Math.round(best);
			}()),
			// same measure as the downward theme's bracket check, but taken
			// where the bracket end is NOT trimmed — the two must agree
			bracketOffsetFromGroupTop: Math.round(Math.abs(path.getBoundingClientRect().bottom -
				document.querySelector('#node_11').getBoundingClientRect().top)),
			baseGap: Math.round(Math.hypot(p0.x - baseMid.x, p0.y - baseMid.y) * 10) / 10,
			seamKinkDeg: Math.round(kink * 180 / Math.PI),
			width: path.getAttribute('stroke-width'),
			arrows: Array.from(document.querySelectorAll('[data-mapjs-role=connector] path.mapjs-arrow'))
				.filter(a => a.style.display !== 'none').length,
			pointsUp: n[3] < n[1],
			arrowAtTop: (aRect.top - pRect.top) < pRect.height / 2,
			labelOffMidSpan: (function () {
				const t = conn.querySelector('.mapjs-connector-text text').getBoundingClientRect(),
					parentBottom = document.querySelector('#node_2').getBoundingClientRect().bottom,
					childTop = document.querySelector('#node_11').getBoundingClientRect().top;
				return Math.round(Math.abs(t.y + t.height / 2 - (parentBottom + childTop) / 2));
			}()),
			labelClearsArrow: !(lRect.left < aRect.right && aRect.left < lRect.right &&
				lRect.top < aRect.bottom && aRect.top < lRect.bottom),
			reasonLabel: labelFor('connector_2_11'),
			objectionLabel: labelFor('connector_2_21'),
			themeAttr: window.__because.engine.mapModel.getIdea().attr.theme
		};
	});
	ok(upState.width === '4', `High-impact upward: thicker connector/bracket stroke (${upState.width})`);
	ok(upState.arrows === 2, `High-impact upward: arrows on both group connectors (${upState.arrows})`);
	ok(upState.pointsUp, 'upward arrowheads point up');
	// the downward head is at the bracket end, so that curve is trimmed there;
	// the upward theme leaves the same end alone, so the bracket must sit
	// identically in both — the overline is appended relative to the path's
	// current point and would slide if trimming didn't hand back the true end
	ok(impactState.bracketOffsetFromGroupTop === upState.bracketOffsetFromGroupTop,
		`trimming the curve for the head leaves the bracket where it was (${impactState.bracketOffsetFromGroupTop}px vs ${upState.bracketOffsetFromGroupTop}px untrimmed)`);
	ok(upState.baseGap <= 1.5, `the line stops at the head's base instead of running through it (${upState.baseGap}px)`);
	ok(upState.seamKinkDeg <= 25, `head continues the line's direction at the join (${upState.seamKinkDeg}°)`);
	ok(upState.arrowAtTop, 'upward arrowhead sits at the parent-claim end of the connector');
	ok(upState.labelOffMidSpan <= 3 && impactState.labelOffMidSpan <= 3,
		`both high-impact themes put the label halfway down the connector (${impactState.labelOffMidSpan}px / ${upState.labelOffMidSpan}px off the middle)`);
	ok(upState.labelClearsArrow && impactState.labelClearsArrow,
		'the label no longer sits on top of the arrowhead in either theme');
	ok(upState.labelOnLine <= 4,
		`the connector runs through the middle of the Therefore label (${upState.labelOnLine}px from its centre)`);
	ok(upState.reasonLabel === 'Therefore' && upState.objectionLabel === 'Therefore, it is false that',
		`reasons say Therefore, objections say Therefore-it-is-false-that (${upState.reasonLabel}/${upState.objectionLabel})`);
	ok(upState.themeAttr === 'argMappingHighImpactUpward', 'upward theme choice is recorded in the map');
	await clickMenu('View', 'Theme: Simple');
	await sleep(800);
	ok(await page.evaluate(() =>
		Array.from(document.querySelectorAll('[data-mapjs-role=connector] path.mapjs-arrow'))
			.filter(a => a.style.display !== 'none').length) === 0,
		'switching back to Simple removes the arrows');

	// ---- three bracket kinds, three bracket SHAPES ----
	// docs/accessibility.md exception 1 claims each group kind is told apart
	// with colour perception removed entirely: a reason's bracket turns up in
	// two quadratic corners, an objection's in two right angles, and the
	// neutral connector's not at all. That claim is only true while the theme
	// keeps `squareCorners`/`noCorners` and the connector.js LOCAL PATCH keeps
	// reading them, so measure the geometry rather than trusting the flags.
	// Also checked in both high-impact themes: the head trims the curve at the
	// bracket end, and the bar must not move when it does.
	//
	// The map is loaded with the preference still OFF on purpose: authoring a
	// neutral connector is gated, but drawing one never is, or a map shared by
	// somebody who has the feature on would open with its blue brackets
	// silently repainted green for everyone else.
	await page.evaluate(() => {
		window.__because.engine.loadMap({ formatVersion: 3, id: 'root', ideas: {
			1: { id: 2, title: 'Conclusion', ideas: {
				1: { id: 11, title: 'group', attr: { group: 'supporting', contentLocked: true }, ideas: {
					1: { id: 12, title: 'A reason' }
				} },
				2: { id: 21, title: 'group', attr: { group: 'opposing', contentLocked: true }, ideas: {
					1: { id: 22, title: 'An objection' }
				} },
				3: { id: 31, title: 'group', attr: { group: 'neutral', contentLocked: true }, ideas: {
					1: { id: 32, title: 'Neither — just related' }
				} }
			} }
		} });
	});
	await sleep(900);
	// the bracket is the tail of the connector path, appended relative to the
	// curve's last point: everything from the final relative moveto onward
	const shapesOf = () => page.evaluate(() => {
		const tail = id => {
			const p = document.querySelector('#connector_2_' + id + ' path.mapjs-connector'),
				d = p && p.getAttribute('d');
			return d ? d.slice(d.lastIndexOf('m')) : null;
		},
			// Where the bar itself lies. Not the path's bounding box: a reason
			// and an objection turn 10px DOWN at each end, so their box runs
			// below their bar and the flat one's does not. Sample the curve
			// instead and keep the points sitting on the bracket node's top
			// edge — that is the bar, whatever shape reached it. `inset` is how
			// far short of the node's full width it stops (the corner radius
			// for a reason; nothing much for the other two).
			bar = id => {
				const p = document.querySelector('#connector_2_' + id + ' path.mapjs-connector'),
					box = document.querySelector('#node_' + id).getBoundingClientRect(),
					len = p.getTotalLength(),
					ctm = p.getScreenCTM();
				let lo = Infinity, hi = -Infinity, hits = 0, i, pt, sp;
				for (i = 0; i <= 800; i++) {
					pt = p.getPointAtLength(len * i / 800);
					sp = new DOMPoint(pt.x, pt.y).matrixTransform(ctm);
					if (Math.abs(sp.y - box.top) <= 1.5) {
						lo = Math.min(lo, sp.x);
						hi = Math.max(hi, sp.x);
						hits += 1;
					}
				}
				return { hits: hits, inset: hits ? Math.round(box.width - (hi - lo)) : null };
			},
			stroke = id => getComputedStyle(
				document.querySelector('#connector_2_' + id + ' path.mapjs-connector')).stroke;
		return {
			reason: tail(11), objection: tail(21), neutral: tail(31),
			bars: [bar(11), bar(21), bar(31)],
			strokes: [stroke(11), stroke(21), stroke(31)],
			classes: [11, 21, 31].map(id => document.querySelector('#node_' + id).className
				.split(/\s+/).filter(c => /^attr_group_/.test(c)).join()),
			// the ARIA name a screen reader reads for each bracket
			labels: [11, 21, 31].map(id =>
				document.querySelector('#node_' + id).getAttribute('aria-label'))
		};
	});
	const shapes = await shapesOf();
	ok(await page.evaluate(() => !window.__because.neutralPref.isOn()),
		'a map using neutral connectors draws them with the preference still off');
	ok(/^m-?[\d.]+,[\d.]+q/.test(shapes.reason || ''),
		`a reason's bracket turns in quadratic corners (${shapes.reason})`);
	ok(/^m-?[\d.]+,[\d.]+v-?[\d.]+ h-?[\d.]+v-?[\d.]+$/.test(shapes.objection || ''),
		`an objection's bracket turns in right angles (${shapes.objection})`);
	ok(/^m-?[\d.]+,0 h-?[\d.]+$/.test(shapes.neutral || ''),
		`the neutral bracket is a bare bar — no q, no v (${shapes.neutral})`);
	ok(shapes.bars.every(b => b.hits > 0),
		`all three bars lie on the top edge of the bracket they belong to (${shapes.bars.map(b => b.hits).join('/')} sampled points)`);
	// the flat bar must reach as far as the square one, or dropping the corners
	// would have quietly shortened the neutral bracket rather than just
	// squaring it off; a reason's is inset by its 10px corner radius at each end
	ok(Math.abs(shapes.bars[2].inset - shapes.bars[1].inset) <= 1,
		`the flat bar spans its bracket exactly as the square one does (inset ${shapes.bars[2].inset}px vs ${shapes.bars[1].inset}px)`);
	// a reason's bar stops a corner radius short at each end. The gap measures
	// smaller than the 10px radius doubled, because the band that counts as
	// "on the top edge" is 1.5px deep and the corner curve is inside it for
	// its last couple of pixels — the point is that only this kind is inset.
	ok(shapes.bars[0].inset - shapes.bars[1].inset >= 10,
		`a reason's bar stops short at each end for its corners (inset ${shapes.bars[0].inset}px vs ${shapes.bars[1].inset}px)`);
	ok(shapes.strokes.join() === 'rgb(51, 153, 102),rgb(255, 0, 0),rgb(0, 112, 192)',
		`green / red / blue, in that order (${shapes.strokes.join(' ')})`);
	ok(shapes.classes.join() === 'attr_group_supporting,attr_group_opposing,attr_group_neutral',
		`each kind resolves its own theme style (${shapes.classes.join(' ')})`);
	ok(shapes.labels[2] === 'Neutral connector (group)',
		`the neutral bracket has its own accessible name (${shapes.labels[2]})`);
	// the neutral connector takes the family's weight and arrowhead in the
	// high-impact themes, but never an auto label — it asserts no relation, so
	// there is no word that would fit every use of it
	for (const [item, name] of [['Theme: High-impact downward', 'downward'],
		['Theme: High-impact upward', 'upward']]) {
		await clickMenu('View', item);
		await sleep(800);
		const hi = await page.evaluate(() => ({
			shape: (function () {
				const d = document.querySelector('#connector_2_31 path.mapjs-connector').getAttribute('d');
				return d.slice(d.lastIndexOf('m'));
			}()),
			width: document.querySelector('#connector_2_31 path.mapjs-connector').getAttribute('stroke-width'),
			arrow: !!document.querySelector('#connector_2_31 path.mapjs-arrow'),
			label: !!document.querySelector('#connector_2_31 .mapjs-connector-text text')
		}));
		ok(/^m-?[\d.]+,0 h-?[\d.]+$/.test(hi.shape),
			`High-impact ${name}: the neutral bar stays flat when the head trims the curve (${hi.shape})`);
		ok(hi.width === '4', `High-impact ${name}: the neutral connector thickens with the rest (${hi.width})`);
		ok(hi.arrow, `High-impact ${name}: the neutral connector gets an arrowhead`);
		ok(!hi.label, `High-impact ${name}: the neutral connector carries no default label`);
	}
	await clickMenu('View', 'Theme: Simple');
	await sleep(800);

	// ---- claim number badges: default numbering and per-claim overrides ----
	const badgeText = id => page.evaluate(nid => {
			const el = document.querySelector('#node_' + nid + ' .mapjs-label');
			return el && el.offsetParent ? el.textContent : null;
		}, id),
		badgeCentre = id => page.evaluate(nid => {
			const r = document.querySelector('#node_' + nid + ' .mapjs-label').getBoundingClientRect();
			return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width };
		}, id),
		clickBadge = async function (id) {
			const c = await badgeCentre(id);
			await page.mouse.click(c.x, c.y);
			await page.waitForSelector('.node-number-editor', { timeout: 5000 });
			return c;
		},
		claimAttr = (path) => page.evaluate(p => {
			const idea = JSON.parse(window.__because.engine.serialize());
			return p.reduce((n, k) => n.ideas[k], idea).attr || {};
		}, path);
	ok(await badgeText(2) === '1.1' && await badgeText(12) === '2.1' && await badgeText(22) === '2.2',
		'claims are numbered level.index by default');
	// the badge overhangs the claim's top edge, where the group's own
	// (transparent, later-drawn) strip sits: it has to win the hit test or
	// there is nothing to click
	ok(await page.evaluate(() => {
		const r = document.querySelector('#node_12 .mapjs-label').getBoundingClientRect(),
			at = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
		return !!(at && at.classList.contains('mapjs-label'));
	}), 'the badge of a grouped claim is on top of its bracket strip');

	const openedOn = await clickBadge(12),
		editorState = await page.evaluate(() => {
			const e = document.querySelector('.node-number-editor'),
				r = e.getBoundingClientRect();
			return { value: e.value, selected: e.selectionEnd - e.selectionStart,
				maxLength: e.maxLength, x: r.x + r.width / 2, y: r.y + r.height / 2 };
		});
	ok(editorState.value === '2.1' && editorState.selected === 3,
		`clicking a number opens an editor on it, all selected (${JSON.stringify(editorState.value)})`);
	ok(Math.abs(editorState.x - openedOn.x) <= 3 && Math.abs(editorState.y - openedOn.y) <= 3,
		'the editor opens over the badge it replaces');
	ok(editorState.maxLength === 10, `the editor caps the label at 10 characters (${editorState.maxLength})`);

	await page.keyboard.type('SECRET7abcdefg');
	ok(await page.$eval('.node-number-editor', e => e.value) === 'SECRET7abc',
		'typing past 10 characters is refused rather than truncated on save');
	const grewTo = await page.$eval('.node-number-editor', e => e.getBoundingClientRect().width);
	await page.keyboard.press('Enter');
	await sleep(400);
	ok(await badgeText(12) === 'SECRET7abc', 'the override replaces the number on that claim');
	ok((await claimAttr(['1', '1', '1'])).claimLabel === 'SECRET7abc',
		'the override is stored on the claim as attr.claimLabel');
	ok(await badgeText(2) === '1.1' && await badgeText(22) === '2.2',
		'overriding one number leaves every other claim numbered by the structure');
	const wide = await badgeCentre(12);
	ok(wide.w > openedOn.w + 20 && grewTo > 40,
		`the pill grows with its text (${Math.round(openedOn.w)}px for 2.1, ${Math.round(wide.w)}px for 10 characters)`);
	ok(await page.evaluate(() => {
		const el = document.querySelector('#node_12 .mapjs-label');
		return el.scrollWidth <= el.clientWidth + 1;
	}), 'a 10-character label is not clipped by the pill');
	ok(await page.evaluate(() => {
		const c = document.getElementById('map-container');
		return document.activeElement === c || c.contains(document.activeElement);
	}), 'committing hands the keyboard back to the map');

	await page.evaluate(() => window.__because.commands.undo());
	await sleep(400);
	ok(await badgeText(12) === '2.1', 'undo restores the computed number');
	await page.evaluate(() => window.__because.commands.redo());
	await sleep(400);
	ok(await badgeText(12) === 'SECRET7abc', 'redo puts the override back');

	// Escape leaves the claim alone
	await clickBadge(12);
	await page.keyboard.type('zzz');
	await page.keyboard.press('Escape');
	await sleep(300);
	ok(await page.$('.node-number-editor') === null && await badgeText(12) === 'SECRET7abc',
		'Escape closes the editor without changing the label');

	// clearing the text drops the override and the numbering takes over again
	await clickBadge(12);
	await page.evaluate(() => { document.querySelector('.node-number-editor').value = ''; });
	await page.keyboard.press('Enter');
	await sleep(400);
	ok(await badgeText(12) === '2.1', 'clearing the editor returns the claim to its computed number');
	ok(!(await claimAttr(['1', '1', '1'])).claimLabel,
		'clearing removes attr.claimLabel rather than storing an empty one');

	// typing the number the structure already gives the claim is not an override
	await clickBadge(12);
	await page.keyboard.press('Enter');
	await sleep(300);
	ok(!(await claimAttr(['1', '1', '1'])).claimLabel,
		're-entering the computed number does not pin it as an override');

	// the editor is fixed to the viewport, so a scrolled map must not shift it
	// away from the badge it belongs to
	await page.evaluate(() => {
		const c = document.getElementById('map-container');
		c.scrollLeft += 120;
		c.scrollTop += 90;
	});
	await sleep(200);
	const scrolledBadge = await clickBadge(12),
		scrolledEditor = await page.evaluate(() => {
			const r = document.querySelector('.node-number-editor').getBoundingClientRect();
			return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
		});
	ok(Math.abs(scrolledEditor.x - scrolledBadge.x) <= 3 && Math.abs(scrolledEditor.y - scrolledBadge.y) <= 3,
		'the editor still opens over the badge on a scrolled map');
	await page.keyboard.press('Escape');
	await sleep(200);
	await page.evaluate(() => {
		const c = document.getElementById('map-container');
		c.scrollLeft = 0;
		c.scrollTop = 0;
	});

	// keyboard path: the menu opens the editor on the selected claim
	await page.evaluate(() => window.__because.engine.mapModel.selectNode(22));
	await sleep(200);
	await clickMenu('Edit', 'Edit claim number');
	await page.waitForSelector('.node-number-editor', { timeout: 5000 });
	ok(await page.$eval('.node-number-editor', e => e.value) === '2.2',
		'Edit > Edit claim number opens the editor on the selected claim');
	await page.keyboard.press('Escape');
	await sleep(200);

	// ---- the keyboard reference (? / Help > Keyboard shortcuts) ----
	// It is the app's own account of its keys, so the test that matters is the
	// drift one: every command bound in shortcuts.js has to appear in the
	// table, and every command the table names has to exist.
	await page.evaluate(() => {
		window.__because.engine.mapModel.selectNode(2);
		document.getElementById('map-container').focus();
	});
	await sleep(150);
	await page.keyboard.down('Shift');
	await page.keyboard.press('Slash');
	await page.keyboard.up('Shift');
	await sleep(300);
	ok(await page.$('.shortcuts-panel') !== null, '? opens the keyboard reference');

	const drift = await page.evaluate(async function () {
		const src = await (await fetch('js/shortcuts.js')).text(),
			bound = [];
		let m;
		const re = /commands\.([A-Za-z]+)/g;
		while ((m = re.exec(src)) !== null) {
			if (bound.indexOf(m[1]) < 0) { bound.push(m[1]); }
		}
		const documented = window.__because.shortcutHelp.documentedCommands();
		return {
			bound: bound,
			undocumented: bound.filter(c => documented.indexOf(c) < 0),
			missingCommand: documented.filter(c => typeof window.__because.commands[c] !== 'function')
		};
	});
	ok(drift.bound.length > 15, `shortcuts.js binds ${drift.bound.length} commands (source is readable)`);
	ok(drift.undocumented.length === 0,
		'every key-bound command is documented in the reference' +
			(drift.undocumented.length ? ' — missing: ' + drift.undocumented.join(', ') : ''));
	ok(drift.missingCommand.length === 0,
		'every command the reference names still exists' +
			(drift.missingCommand.length ? ' — stale: ' + drift.missingCommand.join(', ') : ''));

	// the same table, rendered for each platform
	const keysFor = plat => page.evaluate(function (p) {
		document.querySelector('.plat-btn[data-plat=' + p + ']').click();
		return {
			keys: Array.from(document.querySelectorAll('.shortcut-group .kbd-keys')).map(e => e.textContent).join(' | '),
			pressed: Array.from(document.querySelectorAll('.plat-btn')).map(b => b.dataset.plat + '=' + b.getAttribute('aria-pressed')).join(',')
		};
	}, plat);
	const macView = await keysFor('mac'),
		winView = await keysFor('win');
	ok(macView.keys.indexOf('⌘Z') >= 0 && macView.keys.indexOf('⌥O') >= 0 && !/Ctrl|Alt\+/.test(macView.keys),
		'Mac view uses ⌘ and ⌥ and never says Ctrl or Alt');
	ok(winView.keys.indexOf('Ctrl+Z') >= 0 && winView.keys.indexOf('Alt+O') >= 0 && !/[⌘⌥]/.test(winView.keys),
		'Windows view uses Ctrl and Alt and never shows Mac glyphs');
	ok(winView.keys.indexOf('Ctrl+Y') >= 0 && macView.keys.indexOf('Ctrl+Y') < 0,
		'Ctrl+Y is offered as redo on Windows only');
	ok(winView.keys.indexOf('Backspace') >= 0 && macView.keys.indexOf('⌫') >= 0,
		'the erase key is named per platform (⌫ / Delete or Backspace)');
	ok(macView.pressed === 'mac=true,win=false' && winView.pressed === 'mac=false,win=true',
		'the platform switch reports its state with aria-pressed');
	// Escape must also reset the module's own open/closed state
	await page.keyboard.press('Escape');
	await sleep(200);
	ok(await page.$('.shortcuts-panel') === null, 'Escape closes the reference');
	await clickMenu('Help', 'Keyboard shortcuts');
	await sleep(250);
	ok(await page.$('.shortcuts-panel') !== null,
		'Help > Keyboard shortcuts reopens it after an Escape (no stale state)');
	await page.keyboard.press('Escape');
	await sleep(200);

	// The Alt+Q row stays in SHORTCUT_GROUPS whatever the preference says —
	// the drift check above reads that table, and the binding is in
	// shortcuts.js either way — but it must not be RENDERED while the feature
	// is off. A key the reference lists and the app ignores just reads as broken.
	const neutralRowShown = async function () {
		await clickMenu('Help', 'Keyboard shortcuts');
		await sleep(250);
		const found = await page.evaluate(() =>
			Array.from(document.querySelectorAll('.shortcut-group tr'))
				.some(r => /neutral connector/i.test(r.textContent)));
		await page.keyboard.press('Escape');
		await sleep(200);
		return found;
	};
	ok(!(await neutralRowShown()),
		'the reference leaves Alt+Q out while neutral connectors are off');
	ok(await page.evaluate(() => window.__because.shortcutHelp.documentedCommands().indexOf('addNeutral') >= 0),
		'…while still documenting addNeutral for the drift check');
	await page.evaluate(() => window.__because.neutralPref.set(true));
	await sleep(300);
	ok(await neutralRowShown(),
		'switching the preference on puts Alt+Q into the reference');
	await page.evaluate(() => window.__because.neutralPref.set(false));
	await sleep(300);
	ok(!(await neutralRowShown()), 'and switching it off takes the row away again');

	// the reference claims Shift+Enter breaks a line while editing — check it
	await page.evaluate(() => window.__because.engine.mapModel.selectNode(22));
	await page.keyboard.press('F2');
	await sleep(300);
	await page.keyboard.type('first');
	await page.keyboard.down('Shift');
	await page.keyboard.press('Enter');
	await page.keyboard.up('Shift');
	await page.keyboard.type('second');
	await page.keyboard.press('Enter');
	await sleep(300);
	ok(/first\s*\n\s*second/.test(await page.evaluate(() =>
		window.__because.engine.mapModel.findIdeaById(22).title)),
	'Shift+Enter breaks the line while editing, as the reference says');
	await page.keyboard.down('Meta');
	await page.keyboard.press('z');
	await page.keyboard.up('Meta');
	await sleep(250);

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
	ok(!!findEv('claim_number', p => p.action === 'set') &&
		!!findEv('claim_number', p => p.action === 'cleared'),
		'claim number overrides and their removal are tracked');
	ok(!!findEv('map_open', p => p.node_count === 122 && p.node_bucket === '101-250'),
		'map_open carries the node count and bucket');
	const batch = findEv('edit_batch');
	ok(!!batch && batch.params.changes > 0,
		`edit batch flushes on pagehide (${batch && batch.params.changes} changes)`);
	// the privacy contract: nothing the user typed may appear in any event —
	// these three strings were all typed or rendered as map content above
	const gaPayload = JSON.stringify(ga.events);
	ok(gaPayload.indexOf('Premise') < 0 && gaPayload.indexOf('dblclick') < 0 &&
		gaPayload.indexOf('Claim number') < 0 && gaPayload.indexOf('SECRET7') < 0,
		'no map text or typed labels leak into any analytics event');

	// ---- chrome layouts: left (default) / floating / classic ----
	// Three arrangements of the same controls, chosen from the View menu and
	// remembered in localStorage. Like dark mode this is a view preference:
	// the .mup must serialize byte-identical in every one of them.
	await page.evaluate(() => {
		if (window.__because.darkMode.isDark()) { window.__because.darkMode.toggle(); }
	});
	await sleep(200);
	const layoutState = () => page.evaluate(() => {
		const el = id => document.getElementById(id),
			box = id => { const r = el(id).getBoundingClientRect(); return r.width > 0 && r.height > 0; },
			toolbar = el('toolbar');
		return {
			stored: localStorage.getItem('because.layout'),
			mode: window.__because.layout.getLayout(),
			bodyClass: document.body.className,
			topbarShown: !el('topbar').hidden,
			menubarShown: !el('menubar').hidden,
			railOrientation: toolbar.getAttribute('aria-orientation'),
			toolbarRole: toolbar.getAttribute('role'),
			toolbarLabel: toolbar.getAttribute('aria-label'),
			toolbarShown: !toolbar.hidden,
			toolbarButtons: toolbar.querySelectorAll('.tb-btn').length,
			hasNewDoc: !!toolbar.querySelector('.tb-btn[aria-label^="New map"]'),
			hasOpen: !!toolbar.querySelector('.tb-btn[aria-label^="Open"]'),
			hasSave: !!toolbar.querySelector('.tb-btn[aria-label^="Save"]'),
			themeToggleIn: el('theme-toggle').parentElement.id,
			themeToggleShown: !el('theme-toggle').hidden,
			floatShown: !el('float-chrome').hidden,
			pill: box('float-pill'), tools: box('float-tools'),
			zoom: box('float-zoom'), chip: box('float-status'),
			floatTools: el('float-tools').querySelectorAll('.tb-btn').length,
			floatZoom: el('float-zoom').querySelectorAll('.tb-btn').length,
			titleIn: el('map-title').parentElement.id,
			statusIn: el('save-status').parentElement.id,
			map: window.__because.engine.serialize()
		};
	});

	const left0 = await layoutState();
	ok(left0.stored === null && left0.mode === 'left' && left0.bodyClass.indexOf('layout-left') >= 0,
		`the default layout is the left rail, with nothing stored yet (${left0.mode})`);
	ok(left0.toolbarRole === 'toolbar' && left0.toolbarLabel === 'Editing toolbar' &&
		left0.railOrientation === 'vertical',
		`the rail is a labelled vertical toolbar (${left0.railOrientation})`);
	ok(!left0.hasNewDoc && !left0.hasOpen && !left0.hasSave && left0.toolbarButtons === 16,
		`the rail drops New/Open/Save — the File menu and ⌘O/⌘S cover them (${left0.toolbarButtons} buttons)`);
	ok(left0.themeToggleIn === 'toolbar' && left0.themeToggleShown && left0.topbarShown && left0.menubarShown,
		'left keeps the slim top bar and menus, and docks the theme toggle at the rail foot');
	ok(!left0.floatShown, 'the floating cards stay out of the way in the left layout');

	// View > Floating controls, live (no reload)
	await clickMenu('View', 'Floating controls');
	await sleep(400);
	const floating = await layoutState();
	ok(floating.mode === 'floating' && floating.bodyClass.indexOf('layout-floating') >= 0 &&
		floating.stored === 'floating', 'View > Floating controls switches live and records the choice');
	ok(floating.floatShown && floating.pill && floating.tools && floating.zoom && floating.chip,
		'floating shows the identity pill, tool palette, zoom cluster and save chip');
	ok(!floating.topbarShown && !floating.menubarShown && !floating.toolbarShown &&
		!floating.themeToggleShown,
		'floating hides the top bar, the menubar, the rail and the theme toggle');
	ok(floating.titleIn === 'float-pill' && floating.statusIn === 'float-status',
		'the file title moves into the pill and the live save status into the chip');
	ok(floating.floatTools === 8 && floating.floatZoom === 3,
		`the palette carries the editing tools and the cluster the three zooms (${floating.floatTools}/${floating.floatZoom})`);

	// the event carries the layout enum and nothing else
	const layoutEvents = await page.evaluate(() =>
		window.__because.analytics.events().filter(e => e.name === 'layout_select'));
	ok(layoutEvents.length === 1 && layoutEvents[0].params.layout === 'floating' &&
		Object.keys(layoutEvents[0].params).length === 1,
		`choosing a layout fires layout_select with the layout enum only (${JSON.stringify(layoutEvents[0] && layoutEvents[0].params)})`);
	ok(['left', 'floating', 'classic'].indexOf(layoutEvents[0].params.layout) >= 0 &&
		JSON.stringify(layoutEvents).indexOf('Premise') < 0 &&
		JSON.stringify(layoutEvents).indexOf('SECRET7') < 0 &&
		JSON.stringify(layoutEvents).indexOf('.mup') < 0,
		'no map content, title or file name rides along in the layout event');

	// ---- the flyout: the same six menus behind the pill's ellipsis ----
	await page.click('#float-menu');
	await sleep(250);
	const flyOpen = await page.evaluate(() => {
		const panel = document.querySelector('.menu-flyout'),
			rows = panel && Array.from(panel.querySelectorAll('.menu-flyrow'));
		return panel && {
			role: panel.getAttribute('role'),
			expanded: document.getElementById('float-menu').getAttribute('aria-expanded'),
			haspopup: document.getElementById('float-menu').getAttribute('aria-haspopup'),
			titles: rows.map(r => r.textContent).join(','),
			rowPopup: rows.every(r => r.getAttribute('aria-haspopup') === 'menu')
		};
	});
	ok(!!flyOpen && flyOpen.role === 'menu' && flyOpen.expanded === 'true' && flyOpen.haspopup === 'menu',
		'the ellipsis is a menu button opening a role=menu panel');
	ok(flyOpen && flyOpen.titles === 'File,Insert,Edit,View,Argument,Help' && flyOpen.rowPopup,
		`the flyout lists the same six menus, each cascading (${flyOpen && flyOpen.titles})`);

	// hovering a title cascades its items beside the panel
	await page.hover('.menu-flyrow:nth-child(4)'); // View
	await sleep(250);
	const cascade = await page.evaluate(() => {
		const sub = document.querySelector('.menu-flysub'),
			panel = document.querySelector('.menu-flyout');
		return sub && {
			role: sub.getAttribute('role'),
			label: sub.getAttribute('aria-label'),
			panelStillOpen: !!panel,
			items: sub.querySelectorAll('.menu-item').length,
			radios: Array.from(sub.querySelectorAll('[role=menuitemradio]')).map(i => i.textContent).join('|'),
			beside: sub.getBoundingClientRect().left >= panel.getBoundingClientRect().right - 1
		};
	});
	ok(!!cascade && cascade.role === 'menu' && cascade.label === 'View' && cascade.panelStillOpen,
		'hovering a title cascades its items while the panel stays open');
	ok(cascade && cascade.beside && cascade.items > 5,
		`the submenu opens beside the panel, not over it (${cascade && cascade.items} items)`);
	ok(cascade && cascade.radios.indexOf('✓ Floating controls') >= 0,
		`the layout radios read their state at open time (${cascade && cascade.radios.split('|').filter(r => r.indexOf('controls') >= 0).join(', ')})`);

	// hovering a second title swaps the cascade rather than stacking cards
	await page.hover('.menu-flyrow:nth-child(2)'); // Insert
	await sleep(250);
	ok(await page.evaluate(() => document.querySelectorAll('.menu-flysub').length === 1 &&
		document.querySelector('.menu-flysub').getAttribute('aria-label') === 'Insert'),
		'hovering another title replaces the cascaded card');

	// Escape from outside the menu closes the whole flyout (the level-by-level
	// keyboard walk is the a11y suite's job — it needs focus inside the cards)
	await page.keyboard.press('Escape');
	await sleep(200);
	ok(await page.evaluate(() => !document.querySelector('.menu-flyout') &&
		!document.querySelector('.menu-flysub') &&
		document.getElementById('float-menu').getAttribute('aria-expanded') === 'false'),
		'Escape closes the flyout and its cascade, and resets aria-expanded');

	// a flyout item really runs its command
	const labelsBefore = await page.evaluate(() => window.__because.engine.getLabelsOn());
	const clickFlyout = async (menu, item) => {
		await page.click('#float-menu');
		await sleep(200);
		await page.evaluate(m => {
			Array.from(document.querySelectorAll('.menu-flyrow')).find(r => r.textContent === m).click();
		}, menu);
		await sleep(250);
		await page.evaluate(i => {
			Array.from(document.querySelectorAll('.menu-flysub .menu-item'))
				.find(x => x.textContent.indexOf(i) >= 0).click();
		}, item);
		await sleep(400);
	};
	await clickFlyout('View', 'Claim numbering');
	ok(await page.evaluate(() => window.__because.engine.getLabelsOn()) !== labelsBefore,
		'an item run from the flyout executes its command');
	ok(await page.evaluate(() => !document.querySelector('.menu-flyout') && !document.querySelector('.menu-flysub')),
		'running a flyout item closes the whole flyout');
	await clickFlyout('View', 'Claim numbering'); // restore

	// back to classic, from the flyout (there is no menubar to click here)
	await clickFlyout('View', 'Classic top controls');
	const classic = await layoutState();
	ok(classic.mode === 'classic' && classic.bodyClass.indexOf('layout-classic') >= 0,
		'Classic top controls restores the pre-overhaul arrangement');
	ok(classic.toolbarButtons === 19 && classic.railOrientation === 'horizontal',
		`the classic toolbar is the full horizontal strip of 19 buttons (${classic.toolbarButtons})`);
	ok(classic.hasNewDoc && classic.hasOpen && classic.hasSave,
		'classic keeps New/Open/Save in the toolbar');
	ok(classic.topbarShown && classic.menubarShown && classic.themeToggleIn === 'topbar' &&
		classic.titleIn === 'topbar' && classic.statusIn === 'topbar' && !classic.floatShown,
		'classic puts the title, save status and theme toggle back in the top bar');

	await clickMenu('View', 'Left-side controls');
	await sleep(400);
	const left1 = await layoutState();
	ok(left1.mode === 'left' && left1.toolbarButtons === 16 && left1.stored === 'left',
		'the View menu switches back to the rail');

	// the fidelity rule: no layout may touch map data
	ok(left0.map === floating.map && floating.map === classic.map && classic.map === left1.map,
		'the .mup serializes byte-identical in every layout (left → floating → classic → left)');

	// the choice survives a reload
	await clickMenu('View', 'Floating controls');
	await sleep(300);
	await page.reload({ waitUntil: 'networkidle0' });
	await page.waitForSelector('.mapjs-node', { timeout: 8000 });
	await sleep(500);
	const reloaded = await layoutState();
	ok(reloaded.mode === 'floating' && reloaded.floatShown && !reloaded.topbarShown,
		`the layout choice persists across a reload (${reloaded.mode})`);
	await clickFlyout('View', 'Left-side controls');
	ok(await page.evaluate(() => window.__because.layout.getLayout()) === 'left',
		'and the flyout can put it back');

	// ---- mobile breakpoint (max-width 719px) ----
	// Below 720px the stored desktop choice is overridden, not changed: a
	// slim top bar plus a bottom command bar with real thumb targets.
	await page.setViewport({ width: 375, height: 700, deviceScaleFactor: 2 });
	await sleep(500);
	const mobile = await page.evaluate(() => {
		const bar = document.getElementById('mobilebar'),
			btns = Array.from(bar.querySelectorAll('.mb-btn')).map(b => {
				const r = b.getBoundingClientRect();
				return { label: b.textContent, w: Math.round(r.width), h: Math.round(r.height) };
			});
		return {
			stored: localStorage.getItem('because.layout'),
			mode: window.__because.layout.getLayout(),
			barShown: !bar.hidden && bar.getBoundingClientRect().height > 0,
			role: bar.getAttribute('role'), label: bar.getAttribute('aria-label'),
			buttons: btns,
			railHidden: document.getElementById('toolbar').hidden,
			menubarHidden: document.getElementById('menubar').hidden,
			floatHidden: document.getElementById('float-chrome').hidden,
			topbarShown: !document.getElementById('topbar').hidden,
			noOverflow: document.body.scrollWidth <= window.innerWidth + 1
		};
	});
	ok(mobile.barShown && mobile.role === 'toolbar' && !!mobile.label &&
		mobile.buttons.map(b => b.label).join(',') === 'Reason,Objection,Edit,Undo,Menu',
		`the bottom bar carries the five thumb commands (${mobile.buttons.map(b => b.label).join(',')})`);
	ok(mobile.buttons.every(b => b.w >= 44 && b.h >= 44),
		`every bottom-bar target clears 44×44 (${mobile.buttons.map(b => b.w + '×' + b.h).join(' ')})`);
	ok(mobile.railHidden && mobile.menubarHidden && mobile.floatHidden && mobile.topbarShown,
		'the rail, the menubar and the floating cards give way to the mobile bars');
	ok(mobile.noOverflow, 'nothing overflows the 375px viewport');
	ok(mobile.stored === 'left' && mobile.mode === 'left',
		`the stored desktop choice is overridden, not rewritten (${mobile.stored})`);

	// the Menu button opens the same spec as a bottom sheet
	await page.evaluate(() => {
		Array.from(document.querySelectorAll('.mb-btn')).find(b => b.textContent === 'Menu').click();
	});
	await sleep(300);
	const sheet = await page.evaluate(() => {
		const panel = document.querySelector('.menu-flyout'),
			bar = document.getElementById('mobilebar');
		return panel && {
			role: panel.getAttribute('role'),
			titles: Array.from(panel.querySelectorAll('.menu-flyrow')).map(r => r.textContent).join(','),
			aboveBar: panel.getBoundingClientRect().bottom <= bar.getBoundingClientRect().top + 1,
			withinViewport: panel.getBoundingClientRect().left >= 0 &&
				panel.getBoundingClientRect().right <= window.innerWidth
		};
	});
	ok(!!sheet && sheet.role === 'menu' && sheet.titles === 'File,Insert,Edit,View,Argument,Help',
		'the mobile Menu button opens the same six menus');
	ok(sheet && sheet.aboveBar && sheet.withinViewport,
		'the sheet is anchored above the bar and stays inside the 375px viewport');
	await page.keyboard.press('Escape');
	await sleep(200);
	ok(await page.evaluate(() => !document.querySelector('.menu-flyout')), 'Escape closes the sheet');

	// and the bar's own buttons run the map commands
	const mobileAdd = await page.evaluate(() => {
		const m = window.__because.engine.mapModel,
			firstClaim = function (idea) {
				for (const k of Object.keys(idea.ideas || {})) {
					const child = idea.ideas[k];
					if (!(child.attr && child.attr.group)) { return child; }
					const found = firstClaim(child);
					if (found) { return found; }
				}
				return null;
			};
		m.selectNode(firstClaim(m.getIdea()).id);
		return document.querySelectorAll('.mapjs-node').length;
	});
	await page.evaluate(() => {
		Array.from(document.querySelectorAll('.mb-btn')).find(b => b.textContent === 'Reason').click();
	});
	await sleep(600);
	await page.keyboard.type('from the phone');
	await page.keyboard.press('Enter'); // commit the new claim's editor
	await sleep(500);
	const mobileAfter = await page.evaluate(() => document.querySelectorAll('.mapjs-node').length);
	ok(mobileAfter > mobileAdd,
		`the bottom bar's Reason button adds a reason (${mobileAdd} → ${mobileAfter})`);

	await page.setViewport({ width: 1500, height: 950, deviceScaleFactor: 2 });
	await sleep(400);
	ok(await page.evaluate(() => !document.getElementById('toolbar').hidden &&
		document.getElementById('mobilebar').hidden),
		'widening the viewport hands control back to the stored desktop layout');

	// ---- print / save as PDF (print.js) ----
	// The map lives in a scrolling viewport at whatever pan the user left
	// it at, so printing used to send the paper whatever happened to fall
	// under its top-left corner — usually nothing. Everything below is
	// measured through beforeprint, which is the path ⌘P takes too.
	await page.evaluate(async () => {
		const json = await (await window.fetch('/samples/vegetarian.mup')).json();
		window.__because.engine.loadMap(json);
	});
	await sleep(1200);
	// pan hard, and select a claim: the printed sheet must carry neither the
	// pan nor the selection outline, and the editor must get both back
	const panned = await page.evaluate(() => {
		const c = document.getElementById('map-container'),
			m = window.__because.engine.mapModel,
			// a claim other than the one the loader selected, so the
			// selection really changes and paints its outline
			ids = Array.from(document.querySelectorAll('[data-mapjs-role=node]'))
				.map(n => Number(n.id.replace('node_', '')))
				.filter(id => id && id !== m.getSelectedNodeId());
		m.selectNode(ids[ids.length - 1]);
		c.scrollLeft = 140;
		c.scrollTop = 90;
		window.__because.print.setOptions({ fit: 'page', orientation: 'auto' });
		return { left: c.scrollLeft, top: c.scrollTop };
	});
	await sleep(300);
	ok(await page.evaluate(() => document.querySelectorAll('.activated, .selected').length) > 0,
		'a claim is selected before printing');

	// page.pdf drives the browser's own print, beforeprint and afterprint
	// included — the same path ⌘P takes. The bytes are the deliverable.
	const raw = pdf => Buffer.from(pdf).toString('latin1'),
		pageCount = pdf => (raw(pdf).match(/\/Type\s*\/Page[^s]/g) || []).length,
		mediaBox = pdf => (raw(pdf).match(/\/MediaBox\s*\[([^\]]*)\]/) || [])[1];
	const fitPagePdf = await page.pdf({ printBackground: true, preferCSSPageSize: true });
	ok(pageCount(fitPagePdf) === 1, `fit to page produces exactly one page (${pageCount(fitPagePdf)})`);
	ok(/^0 0 792 612\s*$/.test(mediaBox(fitPagePdf) || ''),
		`and it is a landscape sheet (MediaBox ${mediaBox(fitPagePdf)})`);
	await sleep(300);
	const restored = await page.evaluate(() => {
		const c = document.getElementById('map-container');
		return {
			left: c.scrollLeft,
			top: c.scrollTop,
			// only compare against what the viewport can still scroll to
			maxLeft: Math.max(0, c.scrollWidth - c.clientWidth),
			maxTop: Math.max(0, c.scrollHeight - c.clientHeight),
			outlines: document.querySelectorAll('.activated, .selected').length,
			width: c.getBoundingClientRect().width
		};
	});
	ok(restored.left === Math.min(panned.left, restored.maxLeft) &&
		restored.top === Math.min(panned.top, restored.maxTop),
		`printing hands the editor its scroll position back (${panned.left},${panned.top} -> ` +
		`${restored.left},${restored.top})`);
	ok(restored.outlines > 0, 'and the selection outline comes back');

	// full size: the page is cut to the map instead of the map to the page
	await page.evaluate(() => window.__because.print.setOptions({ fit: 'map' }));
	const fullPdf = await page.pdf({ printBackground: true, preferCSSPageSize: true });
	const fullPlan = await page.evaluate(() => window.__because.print.plan()),
		fullBox = (mediaBox(fullPdf) || '').split(/\s+/).map(Number);
	ok(pageCount(fullPdf) === 1, 'full size is still a single page');
	ok(Math.abs(fullBox[2] - fullPlan.boxW * 0.75) < 2 && Math.abs(fullBox[3] - fullPlan.boxH * 0.75) < 2,
		`the full-size page is cut to the map (${fullBox[2]}×${fullBox[3]}pt for a ` +
		`${Math.round(fullPlan.map.w)}×${Math.round(fullPlan.map.h)} map)`);

	// and the geometry itself, in the print layout
	await page.evaluate(() => window.__because.print.setOptions({ fit: 'page', orientation: 'auto' }));
	const screenWidth = await page.evaluate(() =>
		document.getElementById('map-container').getBoundingClientRect().width);
	await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
	ok(await page.evaluate(() =>
		document.getElementById('map-container').getBoundingClientRect().width) === screenWidth,
		'the print stylesheet leaves the screen layout alone');

	await page.emulateMediaType('print');
	await sleep(200);
	const printed = await page.evaluate(() => {
		const c = document.getElementById('map-container'),
			box = c.getBoundingClientRect(),
			parts = Array.from(document.querySelectorAll('[data-mapjs-role=node],' +
				'[data-mapjs-role=svg-container] path'))
				.map(el => el.getBoundingClientRect())
				.filter(r => r.width || r.height);
		return {
			parts: parts.length,
			outside: parts.filter(r => r.left < box.left - 1 || r.right > box.right + 1 ||
				r.top < box.top - 1 || r.bottom > box.bottom + 1).length,
			box: { w: Math.round(box.width), h: Math.round(box.height) },
			chromeHidden: getComputedStyle(document.getElementById('topbar')).display === 'none',
			selectionOutlines: document.querySelectorAll('.activated, .selected').length
		};
	});
	ok(printed.parts > 5 && printed.outside === 0,
		`the whole panned map prints inside the page box (${printed.parts} parts, ${printed.outside} outside)`);
	// 255×180mm at 96dpi: the box A4 and US Letter both contain in landscape
	ok(printed.box.w === 964 && printed.box.h === 680,
		`the page box is the A4/Letter-safe landscape box (${printed.box.w}×${printed.box.h})`);
	ok(printed.chromeHidden, 'the chrome is off the printed sheet');
	ok(printed.selectionOutlines === 0, 'the selection outline is off the printed sheet');
	await page.emulateMediaType(null);
	await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
	await sleep(200);

	// the File menu opens the options dialog, and Escape leaves without printing
	let printCalls = 0;
	page.on('dialog', () => { printCalls += 1; });
	await page.evaluate(() => {
		Array.from(document.querySelectorAll('.menu-title')).find(t => t.textContent === 'File').click();
		Array.from(document.querySelectorAll('.menu-item'))
			.find(i => i.textContent.indexOf('Print') === 0).click();
	});
	await sleep(250);
	ok(await page.evaluate(() => {
		const p = document.querySelector('.print-panel');
		return !!p && p.querySelectorAll('input[type=radio]').length === 5 &&
			document.activeElement.dataset.act === 'save';
	}), 'File > Print opens the options dialog with Print focused');
	// the hint reads the map that is actually loaded
	ok(await page.evaluate(() => /page/.test(document.querySelector('.print-hint').textContent)),
		'the dialog says what the sheet will be');
	// Chrome honours the orientation this dialog sets, so it must not carry
	// the Safari note about setting it in the browser's own dialog instead
	ok(await page.evaluate(() => !/Safari/.test(document.querySelector('.print-note').textContent)),
		'and does not send Chrome readers looking for Safari’s orientation control');
	await page.keyboard.press('Escape');
	await sleep(200);
	ok(await page.evaluate(() => !document.querySelector('.print-panel')) && printCalls === 0,
		'Escape closes the dialog without printing');

	// and the Print button itself: the sheet is laid out and focus goes back
	// to the map, inside the click that started it (Safari spends the gesture
	// the moment the handler returns)
	await page.evaluate(() => {
		document.getElementById('print-css').remove();
		window.__because.print.open();
	});
	await sleep(200);
	await page.click('.print-panel button[data-act=save]');
	await sleep(300);
	ok(await page.evaluate(() => {
		const map = document.getElementById('map-container'),
			a = document.activeElement;
		return !document.querySelector('.print-panel') &&
			!!document.getElementById('print-css') &&
			!!a && (a === map || map.contains(a));
	}), 'Print lays out the sheet, closes the dialog and returns focus to the map');

	if (errors.length) { console.log('PAGE ERRORS:', errors.join(' | ')); failures += 1; }
	await browser.close();
	console.log(failures === 0 ? 'ALL PASS' : failures + ' FAILURES');
	process.exit(failures === 0 ? 0 : 1);
})();
