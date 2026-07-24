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
	// the beforeunload guard fires on reload when the map is dirty — accept it
	page.on('dialog', d => d.accept());
	// pin the OS preference to dark: first visit must STILL open light
	await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);

	await page.goto(BASE + '/app/index.html', { waitUntil: 'networkidle0' });
	await page.evaluate(() => localStorage.clear());
	await page.goto(BASE + '/app/index.html', { waitUntil: 'networkidle0' });
	await page.waitForSelector('.mapjs-node', { timeout: 8000 });

	ok(await page.evaluate(() => !document.body.classList.contains('dark')),
		'first visit opens light even when the OS prefers dark');

	// first visit shows the welcome modal; "don't show again" persists
	ok(await page.$('.intro-panel') !== null, 'first visit shows the welcome modal');
	await page.evaluate(() => {
		document.getElementById('intro-dont-show').checked = true;
		document.querySelector('.intro-start').click();
	});
	ok(await page.$('.intro-panel') === null, 'welcome modal closes on Get started');
	ok(await page.$('#toolbar .tb-btn') !== null, 'toolbar renders');
	ok(await page.$$eval('.menu-title', els => els.length) === 6, 'six menus render');
	ok(await page.$$eval('.mapjs-node', els => els.length) === 1, 'new map has a single conclusion');

	// a new map opens with the conclusion already selected; opening it (Space
	// works only because focus rides the selected node) selects the whole
	// placeholder, so the first keystroke replaces it rather than appending
	ok(await page.evaluate(() => window.__because.engine.mapModel.getSelectedNodeId()) === 1,
		'new map starts with the conclusion selected');
	await page.keyboard.press('Space');
	await new Promise(r => setTimeout(r, 250));
	ok(await page.evaluate(() => ((window.getSelection && window.getSelection().toString()) || '')) === 'Type your conclusion here',
		'opening the fresh conclusion selects the placeholder text');
	await page.keyboard.press('Escape'); // cancel — leave the placeholder intact
	await new Promise(r => setTimeout(r, 200));

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

	// selected node's own theme border IS the selection indicator (no solid
	// ring on top), so its style must read as the current state while active
	const borderOfSelected = () => page.evaluate(() => {
		const el = document.querySelector('.mapjs-node.activated:not(.attr_group)');
		if (!el) { return null; }
		const c = getComputedStyle(el);
		return { style: c.borderTopStyle, width: c.borderTopWidth, color: c.borderTopColor, outline: c.outlineStyle };
	});

	// implicit toggle on the selected premise
	await page.keyboard.down('Alt');
	await page.keyboard.press('t');
	await page.keyboard.up('Alt');
	await new Promise(r => setTimeout(r, 300));
	ok(await page.$('.mapjs-node.attr_implicit_claim') !== null, 'Alt+T marks claim implicit (dashed)');
	// the implicit state must stay VISIBLE while the claim is selected: the
	// selection indicator is the theme border, which goes dashed when implicit
	// (regression — a solid focus ring used to sit on top and hide this)
	let selBorder = await borderOfSelected();
	ok(selBorder && selBorder.style === 'dashed' && selBorder.width === '3px' && selBorder.color !== 'rgba(0, 0, 0, 0)',
		`selected implicit claim shows a dashed 3px border (${selBorder && selBorder.style + ' ' + selBorder.width + ' ' + selBorder.color})`);
	ok(selBorder && selBorder.outline !== 'solid', 'no second solid ring is drawn over the selected claim');

	// bare T toggles the same way: back to explicit, then implicit again
	await page.keyboard.press('t');
	await new Promise(r => setTimeout(r, 300));
	ok(await page.$('.mapjs-node.attr_implicit_claim') === null, 'T toggles the claim back to explicit');
	// and the selected border flips back to dotted — the toggle is visible live
	selBorder = await borderOfSelected();
	ok(selBorder && selBorder.style === 'dotted' && selBorder.color !== 'rgba(0, 0, 0, 0)',
		`selected explicit claim shows a dotted border (${selBorder && selBorder.style + ' ' + selBorder.color})`);
	await page.keyboard.press('t');
	await new Promise(r => setTimeout(r, 300));
	ok(await page.$('.mapjs-node.attr_implicit_claim') !== null, 'T toggles implicit again');

	// bare T on a bracket flips reason to objection and back
	const groupFlip = await page.evaluate(() => {
		const mm = window.__because.engine.mapModel,
			content = mm.getIdea(),
			walk = (n, acc) => {
				(Object.values(n.ideas || {})).forEach(k => walk(k, acc));
				if (n.attr && n.attr.group) { acc.push(n); }
				return acc;
			},
			group = walk(content, [])[0];
		mm.selectNode(group.id);
		return group.id;
	});
	await page.keyboard.press('t');
	await new Promise(r => setTimeout(r, 300));
	let flipped = await page.evaluate(id =>
		window.__because.engine.mapModel.getIdea().findSubIdeaById(id).attr.group, groupFlip);
	ok(flipped === 'opposing', `T flips the bracket to an objection (${flipped})`);
	await page.keyboard.press('t');
	await new Promise(r => setTimeout(r, 300));
	flipped = await page.evaluate(id =>
		window.__because.engine.mapModel.getIdea().findSubIdeaById(id).attr.group, groupFlip);
	ok(flipped === 'supporting', 'T flips the bracket back to a reason');
	// restore selection to a claim for the tests that follow
	await page.evaluate(() => {
		const mm = window.__because.engine.mapModel,
			content = mm.getIdea(),
			claims = [];
		(function walk(n) {
			if (n.attr === undefined || !n.attr || !n.attr.group) {
				if (n.title && n.title !== 'group') { claims.push(n); }
			}
			Object.values(n.ideas || {}).forEach(walk);
		}(content));
		mm.selectNode(claims[claims.length - 1].id);
	});

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

	// ---- copy / paste: ⌘C copies the selected claim and everything beneath
	// it; ⌘V grafts that copy as a new reason under the selection (the same
	// grammar a drag uses), one ⌘Z reverts the whole graft. There is always a
	// selection, so paste always attaches — detaching is done by dragging.
	await page.evaluate(() => {
		window.__because.engine.loadMap({ formatVersion: 3, id: 'root', attr: { theme: 'argMappingSimple' }, ideas: {
			1: { id: 2, title: 'Claim C', ideas: {
				1: { id: 11, title: 'group', attr: { group: 'supporting', contentLocked: true }, ideas: {
					1: { id: 12, title: 'Reason A', ideas: {
						1: { id: 13, title: 'group', attr: { group: 'supporting', contentLocked: true }, ideas: {
							1: { id: 14, title: 'Reason A1' }
						} }
					} }
				} }
			} }
		} });
	});
	await page.waitForFunction(() => document.querySelector('#node_14'), { timeout: 5000 });
	await new Promise(r => setTimeout(r, 300));
	const groupsUnder = id => page.evaluate(nid => Object.values(window.__because.engine.mapModel
		.getIdea().findSubIdeaById(nid).ideas).filter(k => k.attr && k.attr.group).length, id);
	// select Reason A, copy it with the keyboard; select Claim C, paste
	await page.evaluate(() => { window.__because.engine.mapModel.selectNode(12); document.getElementById('map-container').focus(); });
	await metaPress('c');
	await page.evaluate(() => { window.__because.engine.mapModel.selectNode(2); document.getElementById('map-container').focus(); });
	await metaPress('v');
	const cp = await page.evaluate(() => {
		const content = window.__because.engine.mapModel.getIdea(),
			c = content.findSubIdeaById(2),
			groups = Object.values(c.ideas).filter(k => k.attr && k.attr.group === 'supporting'),
			aClaims = groups.map(g => Object.values(g.ideas)).flat().filter(k => k.title === 'Reason A'),
			pasted = aClaims.find(a => a.id !== 12),
			a1 = pasted && Object.values(pasted.ideas || {}).filter(g => g.attr && g.attr.group)
				.map(g => Object.values(g.ideas)).flat().find(k => k.title === 'Reason A1');
		return { groups: groups.length, aCount: aClaims.length, fresh: !!pasted && pasted.id !== 12,
			hasA1: !!a1, selected: window.__because.engine.mapModel.getSelectedNodeId(), pastedId: pasted && pasted.id };
	});
	ok(cp.groups === 2, `⌘V grafts a new reason group onto the selection (${cp.groups})`);
	ok(cp.aCount === 2 && cp.fresh, 'the pasted reason is a fresh-id copy of the copied subtree');
	ok(cp.hasA1, 'the pasted subtree keeps its nested sub-reason');
	ok(cp.selected === cp.pastedId, 'paste selects the pasted node');
	await metaPress('z');
	ok(await groupsUnder(2) === 1, 'one ⌘Z reverts the whole paste');

	// ⌘V while editing a title must NOT graft a reason (the contenteditable
	// and input-disabled guards keep text editing from being hijacked)
	await page.evaluate(() => { window.__because.engine.mapModel.selectNode(2); document.getElementById('map-container').focus(); window.__because.commands.editNode(); });
	await new Promise(r => setTimeout(r, 400));
	const groupsBeforeEditPaste = await groupsUnder(2);
	await metaPress('v');
	ok(await groupsUnder(2) === groupsBeforeEditPaste, '⌘V while editing a title does not graft a reason');
	await page.keyboard.press('Escape');
	await new Promise(r => setTimeout(r, 200));

	// copying a bracket is a no-op (a group is structure, not a portable unit),
	// so the clipboard keeps the last claim and ⌘V still pastes that claim
	await page.evaluate(() => {
		const g = Object.values(window.__because.engine.mapModel.getIdea().findSubIdeaById(2).ideas).find(k => k.attr && k.attr.group);
		window.__because.engine.mapModel.selectNode(g.id);
		document.getElementById('map-container').focus();
	});
	await metaPress('c');
	await page.evaluate(() => { window.__because.engine.mapModel.selectNode(2); document.getElementById('map-container').focus(); });
	await metaPress('v');
	const afterGroupCopy = await page.evaluate(() => {
		const node = window.__because.engine.mapModel.getIdea().findSubIdeaById(window.__because.engine.mapModel.getSelectedNodeId());
		return { title: node && node.title, isGroup: !!(node && node.attr && node.attr.group) };
	});
	ok(afterGroupCopy.title === 'Reason A' && !afterGroupCopy.isGroup,
		`copying a bracket is ignored — ⌘V still pastes the last copied claim (${afterGroupCopy.title})`);

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

	// connector labels: click the label text to edit inline (mapjs only
	// dispatches lineLabelClicked; the app implements the editing)
	await page.evaluate(() => {
		window.__because.engine.loadMap({ formatVersion: 3, id: 'root', ideas: {
			1: { id: 2, title: 'Conclusion', ideas: {
				1: { id: 11, title: 'group',
					attr: { group: 'supporting', contentLocked: true,
						parentConnector: { label: 'Original label' } },
					ideas: { 1: { id: 12, title: 'Premise' } } }
			} }
		} });
	});
	await page.waitForFunction(() =>
		Array.from(document.querySelectorAll('[data-mapjs-role=connector] text'))
			.some(t => t.textContent.indexOf('Original label') >= 0), { timeout: 5000 });
	const labelRect = await page.evaluate(() => {
		const t = Array.from(document.querySelectorAll('[data-mapjs-role=connector] text'))
			.find(el => el.textContent.indexOf('Original label') >= 0),
			r = t.getBoundingClientRect();
		return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
	});
	await page.mouse.click(labelRect.x, labelRect.y);
	await page.waitForSelector('.connector-label-editor', { timeout: 5000 });
	ok(await page.$eval('.connector-label-editor', el => el.value) === 'Original label',
		'clicking the label opens an editor with the current text');
	await page.evaluate(() => { document.querySelector('.connector-label-editor').value = ''; });
	await page.keyboard.type('Rachels\' central argument');
	await page.keyboard.press('Enter');
	await page.waitForFunction(() =>
		Array.from(document.querySelectorAll('[data-mapjs-role=connector] text'))
			.some(t => t.textContent.indexOf('Rachels') >= 0), { timeout: 5000 });
	const labelState = await page.evaluate(() => ({
		attr: window.__because.engine.mapModel.getIdea().findSubIdeaById(11).attr.parentConnector.label,
		saved: window.__because.engine.serialize().indexOf('Rachels') >= 0
	}));
	ok(labelState.attr === 'Rachels\' central argument', 'edited label lands in parentConnector.label');
	ok(labelState.saved, 'edited label serializes into the .mup');

	// menu path opens the same editor for the selected bracket; Escape cancels
	await page.evaluate(() => window.__because.engine.mapModel.selectNode(12));
	await clickMenu('Argument Visualization', 'Edit connector label');
	await page.waitForSelector('.connector-label-editor', { timeout: 5000 });
	ok(await page.$eval('.connector-label-editor', el => el.value) === 'Rachels\' central argument',
		'menu opens the label editor for the premise\'s bracket');
	await page.keyboard.press('Escape');
	ok(await page.$('.connector-label-editor') === null, 'Escape closes the editor without saving');

	// numbering off must leave NO badge remnants (the engine hides the
	// label span but keeps the decorations container — it must paint nothing)
	await clickMenu('View', 'Claim numbering');
	await new Promise(r => setTimeout(r, 400));
	const badgeOff = await page.evaluate(() => {
		const d = document.querySelector('.mapjs-node .mapjs-decorations'),
			label = d && d.querySelector('.mapjs-label');
		return {
			containerBg: d ? getComputedStyle(d).backgroundColor : 'none',
			labelHidden: !label || getComputedStyle(label).display === 'none'
		};
	});
	ok(badgeOff.containerBg === 'rgba(0, 0, 0, 0)' && badgeOff.labelHidden,
		`numbering off leaves no blue circle (bg=${badgeOff.containerBg})`);
	await clickMenu('View', 'Claim numbering');

	// connector label sizing: an embedded theme that specs the label font in
	// points (no sizePx — how newer MindMup saves look) must not fall back
	// to the browser default 16px
	const ptLabelFont = await page.evaluate(async () => {
		const eng = window.__because.engine,
			themesMod = await import('./js/themes.js'),
			theme = JSON.parse(JSON.stringify(themesMod.argMappingSimple)),
			stripPx = function (obj) {
				Object.keys(obj).forEach(function (k) {
					const v = obj[k];
					if (k === 'font' && v && v.sizePx) {
						v.size = Math.round(v.sizePx * 72 / 96); // pt, like newer saves
						delete v.sizePx;
					} else if (v && typeof v === 'object') { stripPx(v); }
				});
			};
		stripPx(theme);
		eng.loadMap({ formatVersion: 3, id: 'root', theme: theme, ideas: { 1: { id: 2, title: 'Conclusion', ideas: {
			1: { id: 11, title: 'group',
				attr: { group: 'supporting', contentLocked: true, parentConnector: { label: 'Sized from points' } },
				ideas: { 1: { id: 12, title: 'Premise' } } }
		} } } });
		return new Promise(res => setTimeout(() => {
			const t = document.querySelector('[data-mapjs-role=connector] text');
			res(t ? t.style.fontSize : 'missing');
		}, 600));
	});
	ok(ptLabelFont === '12px', `pt-only embedded theme still sizes the label (${ptLabelFont})`);

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

	// Shift+T is the keyboard path to the same view preference. Bare t
	// toggles the selection, so the two must not be confused: this presses
	// both, from the map, and checks each did only its own job.
	await page.click('.mapjs-node');
	await new Promise(r => setTimeout(r, 200));
	const beforeShiftT = await page.evaluate(() => ({
		implicit: !!document.querySelector('.mapjs-node.attr_implicit_claim'),
		map: window.__because.engine.serialize()
	}));
	await page.keyboard.down('Shift');
	await page.keyboard.press('T');
	await page.keyboard.up('Shift');
	await new Promise(r => setTimeout(r, 300));
	const afterShiftT = await page.evaluate(() => ({
		dark: document.body.classList.contains('dark'),
		implicit: !!document.querySelector('.mapjs-node.attr_implicit_claim'),
		map: window.__because.engine.serialize(),
		toggleHint: document.getElementById('theme-toggle').title,
		toggleName: document.getElementById('theme-toggle').getAttribute('aria-label')
	}));
	ok(afterShiftT.dark, 'Shift+T switches to dark mode from the map');
	ok(afterShiftT.implicit === beforeShiftT.implicit && afterShiftT.map === beforeShiftT.map,
		'Shift+T leaves the map untouched — it is not bare t, and no data changes');
	ok(afterShiftT.toggleHint === 'Switch to light mode (Shift+T)' &&
		afterShiftT.toggleName === 'Switch to light mode',
		`the topbar button advertises the key in its tooltip only (${afterShiftT.toggleHint})`);
	await page.keyboard.down('Shift');
	await page.keyboard.press('T');
	await page.keyboard.up('Shift');
	await new Promise(r => setTimeout(r, 300));
	ok(await page.evaluate(() => !document.body.classList.contains('dark')),
		'Shift+T switches back to light');
	// while a claim is being edited it is just a capital T
	await page.keyboard.press('F2');
	await new Promise(r => setTimeout(r, 300));
	await page.keyboard.down('Shift');
	await page.keyboard.press('T');
	await page.keyboard.up('Shift');
	await new Promise(r => setTimeout(r, 250));
	const whileEditing = await page.evaluate(() => ({
		dark: document.body.classList.contains('dark'),
		text: (document.querySelector('[data-mapjs-role=title]') || {}).textContent
	}));
	await page.keyboard.press('Escape');
	await new Promise(r => setTimeout(r, 250));
	ok(!whileEditing.dark && (whileEditing.text || '').indexOf('T') >= 0,
		`Shift+T types a T while editing a claim instead of flipping the theme (${JSON.stringify(whileEditing.text)})`);

	// keyboard-layout independence (kept last so it can't shift the timing of
	// the checks above): ⌘C/⌘V/⌘Z must follow the CHARACTER, not the physical
	// QWERTY key. On Colemak-DH / Dvorak the c/v/z characters are typed from
	// other physical keys, and macOS binds Cmd shortcuts to the char (native
	// apps work; keying off e.code silently lost them). Simulate a moved layout
	// by firing events whose `code` is a DIFFERENT physical key than the `key`.
	await page.evaluate(() => {
		window.__because.engine.loadMap({ formatVersion: 3, id: 'root', attr: { theme: 'argMappingSimple' }, ideas: {
			1: { id: 2, title: 'Root C', ideas: {
				1: { id: 11, title: 'group', attr: { group: 'supporting', contentLocked: true }, ideas: {
					1: { id: 12, title: 'Prem' }
				} }
			} }
		} });
	});
	await page.waitForFunction(() => document.querySelector('#node_12'), { timeout: 5000 });
	await new Promise(r => setTimeout(r, 300));
	const layoutIndep = await page.evaluate(() => {
		const mm = window.__because.engine.mapModel,
			content = mm.getIdea(),
			container = document.getElementById('map-container'),
			fire = (key, code) => container.dispatchEvent(new KeyboardEvent('keydown',
				{ key: key, code: code, metaKey: true, bubbles: true, cancelable: true })),
			groupsUnder = id => Object.values(content.findSubIdeaById(id).ideas).filter(k => k.attr && k.attr.group).length;
		mm.selectNode(12); container.focus();
		fire('c', 'KeyJ');                 // ⌘C with 'c' arriving from a non-KeyC slot
		mm.selectNode(2); container.focus();
		const before = groupsUnder(2);
		fire('v', 'KeyB');                 // ⌘V with 'v' from the QWERTY-B slot (Colemak-DH)
		const afterPaste = groupsUnder(2);
		fire('z', 'KeyX');                 // ⌘Z with 'z' from a moved slot
		const afterUndo = groupsUnder(2);
		return { before, afterPaste, afterUndo };
	});
	ok(layoutIndep.afterPaste === layoutIndep.before + 1,
		`⌘V follows the character, not the QWERTY slot (${layoutIndep.before} -> ${layoutIndep.afterPaste})`);
	ok(layoutIndep.afterUndo === layoutIndep.before,
		'⌘Z follows the character too — undo reverts the layout-independent paste');

	// screenshot the full app for visual review
	await page.screenshot({ path: '/tmp/app_ui.png' });

	if (errors.length) { console.log('PAGE ERRORS:', errors.join(' | ')); failures += 1; }
	await browser.close();
	console.log(failures === 0 ? 'ALL PASS' : failures + ' FAILURES');
	process.exit(failures === 0 ? 0 : 1);
})();
