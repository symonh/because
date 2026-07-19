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

	await clickMenu('File', 'Open from Google Drive');
	await page.waitForFunction(() => document.getElementById('map-title').textContent === 'Drive map.mup', { timeout: 8000 });

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

	await page.screenshot({ path: '/tmp/webkit_open.png' });
	if (errors.length) { console.log('PAGE ERRORS:', errors.join(' | ')); failures += 1; }
	await browser.close();
	console.log(failures === 0 ? 'ALL PASS (WebKit)' : failures + ' FAILURES (WebKit)');
	process.exit(failures ? 1 : 0);
})();
