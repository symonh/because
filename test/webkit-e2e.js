// WebKit (Safari engine) test of the File > Open flow — the browser Simon
// uses. WebKit has no File System Access API, so this exercises the real
// fallback path: DOM-attached picker input + unsaved-changes guard.
const { webkit } = require('playwright-core');
const fs = require('fs');
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

	// ---- copy / paste in real WebKit: ⌘C copies the selected claim + its
	// subtree, ⌘V grafts it as a new reason under the selection. Keyboard +
	// selection quirks are exactly what bite in Safari, so it must pass here.
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
	await page.waitForSelector('#node_14', { timeout: 8000 });
	await page.waitForTimeout(300);
	const boxOf = id => page.evaluate(nid => {
		const r = document.querySelector('#node_' + nid).getBoundingClientRect();
		return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
	}, id);
	// click Reason A to select+focus it (real Safari selection), then ⌘C
	let cb = await boxOf(12);
	await page.mouse.click(cb.x, cb.y);
	await page.waitForTimeout(200);
	await page.keyboard.press('Meta+c');
	await page.waitForTimeout(150);
	// click Claim C and paste
	cb = await boxOf(2);
	await page.mouse.click(cb.x, cb.y);
	await page.waitForTimeout(200);
	await page.keyboard.press('Meta+v');
	await page.waitForTimeout(400);
	const wp = await page.evaluate(() => {
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
	ok(wp.groups === 2 && wp.aCount === 2 && wp.fresh,
		`⌘C/⌘V grafts a copied reason in WebKit (groups=${wp.groups}, A=${wp.aCount})`);
	ok(wp.hasA1, 'the pasted subtree keeps its nested reason in WebKit');
	ok(wp.selected === wp.pastedId, 'paste selects the pasted node in WebKit');
	await page.keyboard.press('Meta+z');
	await page.waitForTimeout(300);
	ok(await page.evaluate(() => Object.values(window.__because.engine.mapModel.getIdea()
		.findSubIdeaById(2).ideas).filter(k => k.attr && k.attr.group).length) === 1,
		'one ⌘Z reverts the whole paste in WebKit');

	// ---- claim number badge editing in real WebKit: the badge is a decoration
	// span whose container swallows clicks (so the app listens in the capture
	// phase), and the editor is a floating input driven by the keyboard —
	// exactly the combination that has broken in Safari before
	await page.evaluate(() => {
		window.__because.engine.loadMap({ formatVersion: 3, id: 'root', attr: { theme: 'argMappingHighImpact' }, ideas: {
			1: { id: 2, title: 'Claim N', ideas: {
				1: { id: 11, title: 'group', attr: { group: 'supporting', contentLocked: true }, ideas: {
					1: { id: 12, title: 'Reason N' },
					2: { id: 13, title: 'Reason M' }
				} }
			} }
		} });
	});
	await page.waitForSelector('#node_13', { timeout: 8000 });
	await page.waitForTimeout(400);
	const badgeOf = id => page.evaluate(nid => {
		const r = document.querySelector('#node_' + nid + ' .mapjs-label').getBoundingClientRect();
		return { x: r.x + r.width / 2, y: r.y + r.height / 2, text: document.querySelector('#node_' + nid + ' .mapjs-label').textContent };
	}, id);
	let badge = await badgeOf(12);
	ok(badge.text === '2.1', `WebKit numbers the claims (${badge.text})`);
	await page.mouse.click(badge.x, badge.y);
	await page.waitForSelector('.node-number-editor', { timeout: 5000 });
	ok(await page.$eval('.node-number-editor', e => e.value) === '2.1',
		'clicking a number badge opens its editor in WebKit');
	ok(await page.$eval('.node-number-editor', e => e.selectionEnd - e.selectionStart) === 3,
		'the number arrives selected in WebKit, so typing replaces it');
	await page.keyboard.type('P1');
	await page.keyboard.press('Enter');
	await page.waitForTimeout(400);
	ok((await badgeOf(12)).text === 'P1' && (await badgeOf(13)).text === '2.2',
		'the override lands on the clicked claim only, in WebKit');
	await page.keyboard.press('Meta+z');
	await page.waitForTimeout(400);
	ok((await badgeOf(12)).text === '2.1', '⌘Z undoes a number override in WebKit');

	// ---- Shift+T flips the theme in real WebKit (a bare-letter shortcut with
	// a modifier, which is where Safari's key handling has bitten before) ----
	await page.mouse.click((await badgeOf(12)).x + 60, (await badgeOf(12)).y + 60);
	await page.waitForTimeout(200);
	await page.keyboard.press('Shift+T');
	await page.waitForTimeout(400);
	ok(await page.evaluate(() => document.body.classList.contains('dark')),
		'Shift+T switches to dark mode in WebKit');
	await page.keyboard.press('Shift+T');
	await page.waitForTimeout(400);
	ok(await page.evaluate(() => !document.body.classList.contains('dark')),
		'Shift+T switches back to light in WebKit');

	// ---- labelling an objection to an inference in real WebKit ----
	// The click target is a coordinate band with no element of its own, so
	// the app suppresses the mousedown that would otherwise select the
	// bracket owning those pixels and acts on the click — the kind of
	// capture-phase interception plus floating keyboard-driven input that
	// has broken in Safari before.
	await page.evaluate(() => {
		window.__because.engine.loadMap({ formatVersion: 3, id: 'root', ideas: {
			1: { id: 1, title: 'Claim 1', ideas: {
				1: { id: 10, title: 'group', attr: { group: 'supporting', contentLocked: true }, ideas: {
					1: { id: 7, title: 'Claim 7' },
					2: { id: 20, title: 'group', attr: { group: 'opposing', contentLocked: true }, ideas: {
						1: { id: 9, title: 'Claim 9' }
					} }
				} }
			} }
		} });
	});
	await page.waitForSelector('#node_9', { timeout: 8000 });
	await page.waitForTimeout(500);
	const infBand = await page.evaluate(() => {
		const b = document.getElementById('node_20').getBoundingClientRect();
		return { x: b.left + b.width / 2, y: b.top - b.height / 2 };
	});
	await page.evaluate(() => window.__because.engine.mapModel.selectNode(7));
	await page.waitForTimeout(200);
	await page.mouse.click(infBand.x, infBand.y);
	await page.waitForSelector('.connector-label-editor', { timeout: 5000 });
	ok(true, 'clicking above a nested bracket opens the label editor in WebKit');
	ok(await page.evaluate(() => window.__because.engine.mapModel.getSelectedNodeId()) === 7,
		'the suppressed mousedown leaves the selection alone in WebKit');
	await page.keyboard.type('Inf. objection');
	await page.keyboard.press('Enter');
	await page.waitForTimeout(500);
	ok(await page.evaluate(() => {
		const t = document.querySelector('#connector_10_20 .mapjs-connector-text text');
		return !!t && t.textContent === 'Inf. objection';
	}), 'the inference objection carries its label in WebKit');
	await page.keyboard.press('Meta+z');
	await page.waitForTimeout(400);
	ok(await page.evaluate(() => !document.querySelector('#connector_10_20 .mapjs-connector-text text')),
		'⌘Z removes the inference-objection label in WebKit');

	// ---- Alt+Q (the neutral connector) in real WebKit ----
	// On a Mac, Option+Q types "œ", so the binding keys off e.code, not the
	// character — the same way Alt+O has to. Alt is exactly where a Safari
	// keyboard difference would show up, and both bindings live in the
	// capture-phase handler, so verify the new one here rather than assuming
	// it follows Alt+O. Alt+N must still reach the sticky note.
	//
	// The binding only exists while View > Allow neutral connectors is on, so
	// check both states in real WebKit: off, the key must not be intercepted at
	// all (Safari is exactly where a swallowed Alt combination would bite).
	await page.evaluate(() => {
		window.__because.neutralPref.set(false);
		window.__because.engine.mapModel.selectNode(1);
		document.getElementById('map-container').focus();
	});
	await page.waitForTimeout(250);
	await page.keyboard.press('Alt+q');
	await page.waitForTimeout(400);
	ok(await page.evaluate(() =>
		document.querySelectorAll('.mapjs-node.attr_group_neutral').length) === 0,
		'Alt+Q adds nothing in WebKit while neutral connectors are off');
	await page.evaluate(() => {
		window.__because.neutralPref.set(true);
		window.__because.engine.mapModel.selectNode(1);
		document.getElementById('map-container').focus();
	});
	await page.waitForTimeout(300);
	await page.keyboard.press('Alt+q');
	await page.waitForTimeout(500);
	await page.keyboard.type('An open question');
	await page.keyboard.press('Enter');
	await page.waitForTimeout(500);
	const wkNeutral = await page.evaluate(() => {
		let group = null, parent = null;
		(function walk(n) {
			Object.values(n.ideas || {}).forEach(function (k) {
				if (k.attr && k.attr.group === 'neutral') { group = k; parent = n; }
				walk(k);
			});
		}(window.__because.engine.mapModel.getIdea()));
		const path = group && document.querySelector('#connector_' + parent.id + '_' + group.id +
			' path.mapjs-connector');
		return {
			count: document.querySelectorAll('.mapjs-node.attr_group_neutral').length,
			stroke: path && getComputedStyle(path).stroke,
			tail: (function () {
				const d = path && path.getAttribute('d');
				return d ? d.slice(d.lastIndexOf('m')) : null;
			}()),
			claim: group && Object.values(group.ideas || {}).map(k => k.title).join()
		};
	});
	ok(wkNeutral.count === 1, `Alt+Q adds one neutral group in WebKit (${wkNeutral.count})`);
	ok(wkNeutral.claim === 'An open question',
		`the new claim takes the typed text in WebKit (${wkNeutral.claim})`);
	ok(wkNeutral.stroke === 'rgb(0, 112, 192)',
		`the neutral bracket is #0070C0 in WebKit (${wkNeutral.stroke})`);
	ok(/^m-?[\d.]+,0 h-?[\d.]+$/.test(wkNeutral.tail || ''),
		`the neutral bracket is a bare bar in WebKit (${wkNeutral.tail})`);
	await page.keyboard.press('Meta+z');
	await page.keyboard.press('Meta+z');
	await page.waitForTimeout(500);
	ok(await page.evaluate(() =>
		document.querySelectorAll('.mapjs-node.attr_group_neutral').length) === 0,
		'⌘Z removes the neutral connector in WebKit');
	// put the preference back as it was found — it rebuilds the toolbars, and
	// the layout tests further down count the rail's buttons. Alt+N below is
	// then also checked in the default state, where it has to keep working.
	await page.evaluate(() => {
		window.__because.neutralPref.set(false);
		window.__because.engine.mapModel.selectNode(1);
		document.getElementById('map-container').focus();
	});
	await page.waitForTimeout(250);
	await page.keyboard.press('Alt+n');
	await page.waitForTimeout(450);
	await page.keyboard.press('Escape');
	await page.waitForTimeout(250);
	ok(await page.evaluate(() =>
		document.querySelectorAll('.mapjs-node.sticky_note').length) >= 1,
		'Alt+N still reaches the sticky note in WebKit');

	// ---- ? opens the keyboard reference in real WebKit ----
	// Shift+/ is where a layout-dependent key could go wrong in Safari, and
	// the panel's platform switch has to redraw the table there too.
	await page.keyboard.press('Shift+Slash');
	await page.waitForTimeout(400);
	ok(await page.$('.shortcuts-panel') !== null, '? opens the keyboard reference in WebKit');
	const wkKeys = await page.evaluate(() => {
		document.querySelector('.plat-btn[data-plat=win]').click();
		const win = Array.from(document.querySelectorAll('.kbd-keys')).map(e => e.textContent).join(' ');
		document.querySelector('.plat-btn[data-plat=mac]').click();
		const mac = Array.from(document.querySelectorAll('.kbd-keys')).map(e => e.textContent).join(' ');
		return { win, mac };
	});
	ok(wkKeys.win.indexOf('Ctrl+Z') >= 0 && wkKeys.mac.indexOf('⌘Z') >= 0,
		'the platform switch redraws the keys in WebKit');
	await page.keyboard.press('Escape');
	await page.waitForTimeout(300);
	ok(await page.$('.shortcuts-panel') === null, 'Escape closes it in WebKit');

	// ---- D detaches a claim in real WebKit ----
	await page.evaluate(() => {
		window.__because.engine.loadMap({ formatVersion: 3, id: 'root', attr: { theme: 'argMappingSimple' }, ideas: {
			1: { id: 2, title: 'Conclusion W', ideas: {
				1: { id: 11, title: 'group', attr: { group: 'supporting', contentLocked: true }, ideas: {
					1: { id: 12, title: 'Reason W' },
					2: { id: 13, title: 'Co-premise W' }
				} }
			} }
		} });
	});
	await page.waitForSelector('#node_13', { timeout: 8000 });
	await page.waitForTimeout(400);
	await page.evaluate(() => {
		window.__because.engine.mapModel.selectNode(12);
		document.getElementById('map-container').focus();
	});
	await page.waitForTimeout(200);
	await page.keyboard.press('d');
	await page.waitForTimeout(600);
	ok(await page.evaluate(() => {
		const json = JSON.parse(window.__because.engine.serialize());
		return Object.keys(json.ideas).map(k => json.ideas[k].id).sort().join() === '12,2';
	}), 'D detaches the selected claim in WebKit');
	await page.keyboard.press('Meta+z');
	await page.waitForTimeout(600);
	ok(await page.evaluate(() => {
		const json = JSON.parse(window.__because.engine.serialize());
		return Object.keys(json.ideas).length === 1;
	}), '⌘Z reattaches it in WebKit');

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

	// ---- Share from Google Drive: the popup paths, in the real WebKit ----
	// popups are exactly what Safari polices, so this must pass here
	await page.evaluate(() => {
		window.__confirms = [];
		window.confirm = m => { window.__confirms.push(String(m)); return false; };
	});
	await clickMenu('File', 'Share from Google Drive');
	await page.waitForTimeout(300);
	ok(await page.evaluate(() => window.__confirms.length === 1 &&
		window.__confirms[0].indexOf('isn’t in Google Drive yet') >= 0),
		'share on a local map offers to save to Drive first');
	ok(await page.evaluate(() => !document.querySelector('.panel-overlay a[target]')),
		'declining the offer shows no share panel');

	// stub Google's side (as drive-e2e does) so the Drive paths run for real
	const stubJs = { status: 200, contentType: 'application/javascript', body: '/* stubbed */' };
	const ctx = page.context();
	await ctx.route('**://accounts.google.com/**', r => r.fulfill(stubJs));
	await ctx.route('**://apis.google.com/**', r => r.fulfill(stubJs));
	await ctx.route('**://drive.google.com/**', r => r.fulfill(
		{ status: 200, contentType: 'text/html', body: '<title>drive stub</title>' }));
	await ctx.route('**://onedrive.live.com/**', r => r.fulfill(
		{ status: 200, contentType: 'text/html', body: '<title>onedrive stub</title>' }));
	await page.addInitScript(function (deathMup) {
		// Microsoft auth popup: intercept ONLY the authorize URL (the Drive
		// tests need real window.open) and post a code straight back
		const realOpen = window.open.bind(window);
		window.open = function (url, target, feats) {
			const u = String(url);
			if (u.indexOf('login.microsoftonline.com') >= 0 && u.indexOf('/authorize') >= 0) {
				const state = new URLSearchParams(u.split('?')[1]).get('state');
				window.setTimeout(function () {
					window.postMessage({ msAuth: true, code: 'FAKE_CODE', state: state }, '*');
				}, 30);
				return { closed: false, close() { this.closed = true; } };
			}
			return realOpen(url, target, feats);
		};
		window.google = window.google || {};
		window.google.accounts = { oauth2: { initTokenClient(cfg) {
			return { callback: cfg.callback,
				requestAccessToken() { this.callback({ access_token: 'FAKE_TOKEN', expires_in: 3600 }); } };
		} } };
		const chain = obj => new Proxy(obj || {}, { get: (t, k) => (k in t ? t[k] : () => chain(t)) });
		window.gapi = { load: (name, cb) => cb() };
		window.google.picker = {
			ViewId: { DOCS: 'docs' },
			Response: { ACTION: 'action', DOCUMENTS: 'docs' },
			Action: { PICKED: 'picked', CANCEL: 'cancel' },
			Feature: { SUPPORT_DRIVES: 'supportDrives' },
			DocsView: function () { return chain({}); },
			PickerBuilder: function () {
				const self = {}, builder = chain(self);
				self.setCallback = function (cb) { self.cb = cb; return builder; };
				self.build = function () {
					return { setVisible() { self.cb({ action: 'picked', docs: [{ id: 'drive-file-1', name: 'Drive map.mup' }] }); } };
				};
				return builder;
			}
		};
		const realFetch = window.fetch.bind(window);
		window.fetch = function (url, options) {
			const u = String(url);
			if (u.indexOf('login.microsoftonline.com') >= 0 && u.indexOf('/token') >= 0) {
				return Promise.resolve(new Response(JSON.stringify({
					access_token: 'FAKE_MS', expires_in: 3600, refresh_token: 'FAKE_RT',
					id_token: 'x.' + window.btoa(JSON.stringify({ preferred_username: 'sc@ms.test' })) + '.y'
				}), { status: 200 }));
			}
			if (u.indexOf('graph.microsoft.com') >= 0) {
				if (u.indexOf('/me/drive/root/children') >= 0) {
					return Promise.resolve(new Response(JSON.stringify({ value: [
						{ id: 'odfile1', name: 'OD map.mup', file: {}, webUrl: 'https://onedrive.live.com/x/odfile1' }
					] }), { status: 200 }));
				}
				if (u.indexOf('downloadUrl') >= 0) {
					return Promise.resolve(new Response(JSON.stringify({
						id: 'odfile1', name: 'OD map.mup', webUrl: 'https://onedrive.live.com/x/odfile1',
						'@microsoft.graph.downloadUrl': 'https://download.test/odfile1'
					}), { status: 200 }));
				}
			}
			if (u.indexOf('download.test') >= 0) {
				return Promise.resolve(new Response(deathMup, { status: 200 }));
			}
			if (u.indexOf('googleapis.com') >= 0 && u.indexOf('/drive/v3/') >= 0) {
				if (u.indexOf('/drive/v3/about') >= 0) {
					return Promise.resolve(new Response(JSON.stringify({ user: { emailAddress: 'sc@test' } }), { status: 200 }));
				}
				if (u.indexOf('fields=trashed') >= 0) {
					return Promise.resolve(new Response(JSON.stringify({ trashed: false, capabilities: { canEdit: true } }), { status: 200 }));
				}
				if (u.indexOf('alt=media') >= 0) {
					return Promise.resolve(new Response(deathMup, { status: 200 }));
				}
				if (u.indexOf('uploadType=media') >= 0) {
					return Promise.resolve(new Response('{}', { status: 200 }));
				}
				if (u.indexOf('uploadType=multipart') >= 0) {
					return Promise.resolve(new Response(JSON.stringify({ id: 'new-drive-file', name: 'Shared map.mup' }), { status: 200 }));
				}
			}
			return realFetch(url, options);
		};
		window.prompt = () => 'Shared map';
	}, fs.readFileSync(path.join(__dirname, '..', 'samples', 'death.mup'), 'utf8'));
	page.on('dialog', d => d.accept()); // the beforeunload prompt on reload
	await page.evaluate(() => {
		window.__because.io.markSaved('vegetarian.mup');
		window.__because.io.autosave(); // persist the clean flag for restore
	});
	await page.reload();
	await page.waitForSelector('.mapjs-node', { timeout: 8000 });

	// Safari alone blocks the Picker frame's cookies, so Safari alone is told
	// about it — once, before the frame is on screen (drive.js cookieNote)
	await clickMenu('File', 'Open from Google Drive');
	await page.waitForSelector('.drive-cookie-note', { timeout: 8000 });
	ok(await page.evaluate(() => document.querySelector('.drive-cookie-note p')
		.textContent.indexOf('Can’t access your Google Account') >= 0),
	'WebKit is warned about the cookie block, in Google’s own words');
	ok(await page.evaluate(() => document.getElementById('map-title').textContent !== 'Drive map.mup'),
		'the note comes BEFORE the picker — nothing has opened yet');
	await page.click('.drive-cookie-note button[data-act="continue"]');
	await page.waitForFunction(() => document.getElementById('map-title').textContent === 'Drive map.mup', { timeout: 8000 });
	ok(true, 'Continue goes on to the picker and the picked file opens');

	// said once per browser: a second open goes straight to the picker
	await clickMenu('File', 'New');
	await page.waitForFunction(() => document.getElementById('map-title').textContent === 'untitled.mup', { timeout: 8000 });
	await clickMenu('File', 'Open from Google Drive');
	await page.waitForFunction(() => document.getElementById('map-title').textContent === 'Drive map.mup', { timeout: 8000 });
	ok(await page.evaluate(() => !document.querySelector('.drive-cookie-note')),
		'the note is not repeated once it has been read');

	// direct share: a real user click must survive WebKit's popup policing
	await page.click('.menu-title:text-is("File")');
	const [drivePage] = await Promise.all([
		page.waitForEvent('popup'),
		page.click('.menu-item:has-text("Share from Google Drive")')
	]);
	await drivePage.waitForLoadState();
	ok(drivePage.url() === 'https://drive.google.com/file/d/drive-file-1/view',
		`share opens the file's Drive page in a new tab (${drivePage.url()})`);
	await drivePage.close();

	// save-first share: the panel's real link must open Drive too
	await clickMenu('File', 'New');
	await page.waitForFunction(() => document.getElementById('map-title').textContent === 'untitled.mup', { timeout: 8000 });
	await page.evaluate(() => { window.confirm = () => true; });
	await page.click('.menu-title:text-is("File")');
	await page.click('.menu-item:has-text("Share from Google Drive")');
	await page.waitForSelector('.panel a[target="_blank"]', { timeout: 8000 });
	const [drivePage2] = await Promise.all([
		page.waitForEvent('popup'),
		page.click('.panel a[target="_blank"]')
	]);
	await drivePage2.waitForLoadState();
	ok(drivePage2.url().indexOf('drive.google.com/file/d/new-drive-file/view') >= 0,
		'the save-first share panel link opens the new Drive file');
	ok(await page.evaluate(() => !document.querySelector('.panel-overlay')),
		'following the share link closes the panel');
	await drivePage2.close();

	// ---- OneDrive in real WebKit: in-app picker (no popup) + share tab ----
	await page.evaluate(async () => {
		const mod = await import('./js/config.js');
		mod.onedriveConfig.clientId = 'test-ms-client';
	});
	await clickMenu('File', 'Open from OneDrive');
	await page.waitForSelector('.od-list .od-item', { timeout: 8000 });
	ok(true, 'OneDrive sign-in + picker panel open in WebKit (no embedded widget)');
	await page.evaluate(() => {
		Array.from(document.querySelectorAll('.od-list .od-item'))
			.find(b => b.textContent.indexOf('OD map.mup') >= 0).click();
	});
	await page.waitForFunction(() => document.getElementById('map-title').textContent === 'OD map.mup', { timeout: 8000 });
	ok(true, 'picked OneDrive file loads in WebKit');
	await page.click('.menu-title:text-is("File")');
	const [odPage] = await Promise.all([
		page.waitForEvent('popup'),
		page.click('.menu-item:has-text("Share from OneDrive")')
	]);
	await odPage.waitForLoadState();
	ok(odPage.url() === 'https://onedrive.live.com/x/odfile1',
		`OneDrive share opens the file's page in a new tab (${odPage.url()})`);
	await odPage.close();

	// ---- the floating layout in real WebKit ----
	// No bars: the six menus hang off the pill's ellipsis as a flyout, which
	// is exactly the shape Safari polices — the panel must survive a
	// hover-cascade (mouseenter after a mousedown-prevented click), Escape
	// must hand focus back a level at a time, and an item that opens a popup
	// must still count as running inside the user's gesture.
	await clickMenu('View', 'Floating controls');
	await page.waitForTimeout(500);
	const floating = await page.evaluate(() => ({
		mode: window.__because.layout.getLayout(),
		pill: document.getElementById('float-pill').getBoundingClientRect().width > 0,
		menubarHidden: document.getElementById('menubar').hidden,
		topbarHidden: document.getElementById('topbar').hidden,
		toggleHidden: document.getElementById('theme-toggle').hidden,
		titleInPill: document.getElementById('map-title').parentElement.id === 'float-pill'
	}));
	ok(floating.mode === 'floating' && floating.pill && floating.menubarHidden &&
		floating.topbarHidden && floating.titleInPill,
		`the View menu switches WebKit to the floating layout (${floating.mode})`);

	await page.click('#float-menu');
	await page.waitForTimeout(250);
	ok(await page.evaluate(() => !!document.querySelector('.menu-flyout')),
		'the pill ellipsis opens the flyout in WebKit');
	await page.hover('.menu-flyrow:nth-child(4)'); // View
	await page.waitForTimeout(300);
	ok(await page.evaluate(() => {
		const sub = document.querySelector('.menu-flysub');
		return !!sub && sub.getAttribute('aria-label') === 'View' && !!document.querySelector('.menu-flyout');
	}), 'hovering a title cascades its card and the panel stays open (Safari focus rules)');
	await page.hover('.menu-flyrow:nth-child(1)'); // File
	await page.waitForTimeout(300);
	ok(await page.evaluate(() => document.querySelectorAll('.menu-flysub').length === 1 &&
		document.querySelector('.menu-flysub').getAttribute('aria-label') === 'File' &&
		!!document.querySelector('.menu-flyout')),
		'moving to another title swaps the card without dropping the panel');

	// keyboard: Escape unwinds one level at a time and lands back on the trigger
	await page.evaluate(() => document.querySelectorAll('.menu-flysub .menu-item')[0].focus());
	await page.keyboard.press('Escape');
	await page.waitForTimeout(200);
	ok(await page.evaluate(() => !document.querySelector('.menu-flysub') &&
		!!document.querySelector('.menu-flyout') &&
		document.activeElement === document.querySelector('.menu-flyrow')),
		'Escape closes the card and returns focus to its row in WebKit');
	await page.keyboard.press('Escape');
	await page.waitForTimeout(200);
	ok(await page.evaluate(() => !document.querySelector('.menu-flyout') &&
		document.activeElement === document.getElementById('float-menu')),
		'a second Escape closes the flyout and returns focus to the ellipsis');

	// a File item that opens a popup, run through the flyout's extra hop
	// (row click -> submenu -> activate -> map focus -> window.open): Safari
	// blocks a popup the moment that chain loses the gesture
	await page.click('#float-menu');
	await page.waitForTimeout(250);
	await page.click('.menu-flyrow:nth-child(1)'); // File
	await page.waitForTimeout(250);
	const [flyShare] = await Promise.all([
		page.waitForEvent('popup'),
		page.click('.menu-flysub .menu-item:has-text("Share from OneDrive")')
	]);
	await flyShare.waitForLoadState();
	ok(flyShare.url() === 'https://onedrive.live.com/x/odfile1',
		`a File item run from the flyout still opens its popup (${flyShare.url()})`);
	await flyShare.close();
	ok(await page.evaluate(() => !document.querySelector('.menu-flyout') &&
		!document.querySelector('.menu-flysub')),
		'running the item closed the flyout behind it');

	// Shift+T with no theme toggle on screen: the keyboard path must still
	// reach the same view preference, and must not touch map data
	const beforeShiftT = await page.evaluate(() => ({
		dark: document.body.classList.contains('dark'),
		map: window.__because.engine.serialize()
	}));
	await page.evaluate(() => document.getElementById('map-container').focus());
	await page.keyboard.press('Shift+T');
	await page.waitForTimeout(400);
	const afterShiftT = await page.evaluate(() => ({
		dark: document.body.classList.contains('dark'),
		toggleHidden: document.getElementById('theme-toggle').hidden,
		map: window.__because.engine.serialize()
	}));
	ok(afterShiftT.dark !== beforeShiftT.dark && afterShiftT.toggleHidden,
		'Shift+T still toggles dark mode in the floating layout, where no toggle is shown');
	ok(afterShiftT.map === beforeShiftT.map,
		'and the map serializes byte-identical either side of it');
	await page.keyboard.press('Shift+T');
	await page.waitForTimeout(400);

	// back to the default rail, from the flyout
	await page.click('#float-menu');
	await page.waitForTimeout(250);
	await page.click('.menu-flyrow:nth-child(4)'); // View
	await page.waitForTimeout(250);
	await page.click('.menu-flysub .menu-item:has-text("Left-side controls")');
	await page.waitForTimeout(500);
	ok(await page.evaluate(() => window.__because.layout.getLayout() === 'left' &&
		!document.getElementById('menubar').hidden &&
		document.getElementById('float-chrome').hidden &&
		document.getElementById('toolbar').querySelectorAll('.tb-btn').length === 16),
		'the flyout switches back to the rail and the menubar returns');

	// ---- print / save as PDF, in the engine Simon prints from ----
	// The page geometry is written by print.js at beforeprint; WebKit lays
	// it out from the same stylesheet Chrome does, so what is checked here
	// is that the map really lands inside the page box after a pan, and
	// that the editor gets its view back afterwards.
	await page.evaluate(async () => {
		const json = await (await fetch('/samples/vegetarian.mup')).json();
		window.__because.engine.loadMap(json);
	});
	await page.waitForTimeout(1200);
	const wkPanned = await page.evaluate(() => {
		const c = document.getElementById('map-container'),
			m = window.__because.engine.mapModel,
			ids = Array.from(document.querySelectorAll('[data-mapjs-role=node]'))
				.map(n => Number(n.id.replace('node_', '')))
				.filter(id => id && id !== m.getSelectedNodeId());
		m.selectNode(ids[ids.length - 1]);
		c.scrollLeft = 140;
		c.scrollTop = 90;
		window.__because.print.setOptions({ fit: 'page', orientation: 'auto' });
		window.dispatchEvent(new Event('beforeprint'));
		return {
			left: c.scrollLeft,
			top: c.scrollTop,
			// the two properties the sheet leans on beyond plain box model
			clip: window.CSS.supports('overflow', 'clip'),
			contain: window.CSS.supports('contain', 'strict')
		};
	});
	ok(wkPanned.clip && wkPanned.contain,
		`WebKit supports the containment the print sheet uses (clip=${wkPanned.clip}, contain=${wkPanned.contain})`);
	await page.emulateMedia({ media: 'print' });
	await page.waitForTimeout(250);
	const wkPrint = await page.evaluate(() => {
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
			outlines: document.querySelectorAll('.activated, .selected').length
		};
	});
	ok(wkPrint.parts > 5 && wkPrint.outside === 0,
		`WebKit prints the whole panned map inside the page box (${wkPrint.parts} parts, ${wkPrint.outside} outside)`);
	ok(wkPrint.box.w === 964 && wkPrint.box.h === 680,
		`the page box is the A4/Letter-safe landscape box (${wkPrint.box.w}×${wkPrint.box.h})`);
	ok(wkPrint.chromeHidden && wkPrint.outlines === 0,
		'the chrome and the selection outline stay off the sheet');
	await page.emulateMedia({ media: 'screen' });
	await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
	await page.waitForTimeout(300);
	const wkBack = await page.evaluate(() => {
		const c = document.getElementById('map-container');
		return {
			left: c.scrollLeft,
			top: c.scrollTop,
			maxLeft: Math.max(0, c.scrollWidth - c.clientWidth),
			maxTop: Math.max(0, c.scrollHeight - c.clientHeight),
			outlines: document.querySelectorAll('.activated, .selected').length
		};
	});
	ok(wkBack.left === Math.min(wkPanned.left, wkBack.maxLeft) &&
		wkBack.top === Math.min(wkPanned.top, wkBack.maxTop) && wkBack.outlines > 0,
		`afterprint restores the pan and the selection outline (${wkBack.left},${wkBack.top})`);

	// Safari takes the sheet from its own print dialog and ignores @page
	// size in every form, so the dialog has to say where the orientation
	// really lives. Chrome, which honours it, must not be told the same.
	await page.evaluate(() => window.__because.print.open());
	await page.waitForTimeout(250);
	ok(await page.evaluate(() => {
		const note = document.querySelector('.print-note');
		return !!note && /Safari/.test(note.textContent) && /Landscape/.test(note.textContent);
	}), 'the print dialog points WebKit readers at Safari’s own orientation control');
	await page.keyboard.press('Escape');
	await page.waitForTimeout(150);

	// ---- the opening state (index.html #boot) ----
	// The chrome and the map are both built by JavaScript, so a single
	// stalled request used to leave the previous page on screen with no
	// sign that anything was happening. This is the one thing in the app
	// that has to paint without any of its own JS or CSS having arrived.
	const stalled = await browser.newContext();
	const stalledPage = await stalled.newPage();
	await stalledPage.route('**/js/engine.js', () => { /* never answers */ });
	await stalledPage.goto(BASE + '/app/index.html', { waitUntil: 'commit' });
	await stalledPage.waitForSelector('#boot', { timeout: 5000 });
	ok(await stalledPage.evaluate(() => {
		const b = document.getElementById('boot');
		return !!b && /Opening the editor/.test(b.textContent) &&
			b.getBoundingClientRect().height > 100 &&
			document.getElementById('boot-slow').hidden;
	}), 'a stalled module leaves the opening state on screen, without the slow notice yet');
	ok(await stalledPage.evaluate(() => !document.querySelector('.mapjs-node')),
		'and the editor itself never arrives, which is the case being covered');
	await stalledPage.waitForTimeout(8200);
	ok(await stalledPage.evaluate(() => !document.getElementById('boot-slow').hidden),
		'after eight seconds it says a file has not arrived rather than staying mute');
	await stalled.close();

	// and on a healthy load it is gone by the time the chrome is up
	ok(await page.evaluate(() => !document.getElementById('boot')),
		'a normal load removes the opening state once the chrome exists');

	await page.screenshot({ path: '/tmp/webkit_open.png' });
	if (errors.length) { console.log('PAGE ERRORS:', errors.join(' | ')); failures += 1; }
	await browser.close();
	console.log(failures === 0 ? 'ALL PASS (WebKit)' : failures + ' FAILURES (WebKit)');
	process.exit(failures ? 1 : 0);
})();
