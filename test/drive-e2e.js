// E2e for the Google Drive module with Google's side stubbed: GIS token
// client, Picker, and the Drive REST endpoints are faked at the network /
// global boundary, so everything on OUR side of the boundary runs for
// real (menu wiring, guard modal, save override, request shapes).
// The one thing this cannot cover is Google's real consent popup.
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const { chromePath } = require('./chrome-path');
const CHROME = chromePath();
const BASE = process.env.BASE || 'http://127.0.0.1:8871';
let failures = 0;
const ok = (cond, name) => { console.log((cond ? 'PASS ' : 'FAIL ') + name); if (!cond) { failures += 1; } };

const DEATH_MUP = fs.readFileSync(path.join(__dirname, '..', 'samples', 'death.mup'), 'utf8');

(async () => {
	const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
	const page = await browser.newPage();
	await page.setViewport({ width: 1500, height: 950 });
	const errors = [];
	page.on('pageerror', e => errors.push(e.message));

	// never let the real Google scripts load over the stubs
	await page.setRequestInterception(true);
	page.on('request', r => {
		const u = r.url();
		if (u.indexOf('accounts.google.com') >= 0 || u.indexOf('apis.google.com') >= 0) {
			r.respond({ status: 200, contentType: 'application/javascript', body: '/* stubbed */' });
		} else {
			r.continue();
		}
	});

	await page.evaluateOnNewDocument(function (deathMup) {
		// --- GIS stub: hands out a fake token immediately. The 30s expiry
		// is below the app's 60s early-refresh margin, so EVERY Drive call
		// requests a fresh token — which exercises the account-hint pinning.
		window.__tokenRequests = [];
		window.google = window.google || {};
		window.google.accounts = {
			oauth2: {
				initTokenClient(cfg) {
					return {
						callback: cfg.callback,
						requestAccessToken(overrides) {
							window.__tokenRequests.push(overrides || {});
							this.callback({ access_token: 'FAKE_TOKEN', expires_in: 30 });
						}
					};
				}
			}
		};
		// --- Picker stub: "picks" a fixed Drive doc as soon as it is shown
		const chain = obj => new Proxy(obj || {}, { get: (t, k) => (k in t ? t[k] : () => chain(t)) });
		window.gapi = { load: (name, cb) => cb() };
		// a view records what was configured on it, so the test can assert
		// which tab the picker opens on (the shared-drive list was the only
		// tab it had for a while)
		window.google.picker = {
			ViewId: { DOCS: 'docs' },
			Response: { ACTION: 'action', DOCUMENTS: 'docs' },
			Action: { PICKED: 'picked', CANCEL: 'cancel' },
			Feature: { SUPPORT_DRIVES: 'supportDrives' },
			DocsView: function () {
				const cfg = {},
					view = new Proxy({ cfg: cfg }, { get: (t, k) => (k in t ? t[k] :
						function (arg) { cfg[k] = arguments.length ? arg : true; return view; }) });
				return view;
			},
			PickerBuilder: function () {
				const self = { views: [] }, builder = chain(self);
				self.setCallback = function (cb) { self.cb = cb; return builder; };
				self.addView = function (view) { self.views.push(view.cfg); return builder; };
				self.build = function () {
					window.__pickerViews = self.views;
					return { setVisible() { self.cb({ action: 'picked', docs: [{ id: 'drive-file-1', name: 'Drive map.mup' }] }); } };
				};
				return builder;
			}
		};
		// --- Drive REST stub: record calls, serve canned responses
		window.__driveCalls = [];
		const realFetch = window.fetch.bind(window);
		window.fetch = function (url, options) {
			const u = String(url);
			if (u.indexOf('googleapis.com') >= 0 && u.indexOf('/drive/v3/') >= 0) {
				window.__driveCalls.push({ url: u, method: (options && options.method) || 'GET', body: options && options.body });
				if (u.indexOf('/drive/v3/about') >= 0) {
					return Promise.resolve(new Response(JSON.stringify({ user: { emailAddress: 'sc@test' } }), { status: 200 }));
				}
				if (u.indexOf('fields=trashed') >= 0) { // the capability probe
					return Promise.resolve(window.__probe404 ?
						new Response('nope', { status: 404 }) :
						new Response(JSON.stringify({ trashed: false, capabilities: { canEdit: !window.__viewOnly } }), { status: 200 }));
				}
				if (u.indexOf('alt=media') >= 0) {
					return Promise.resolve(new Response(deathMup, { status: 200 }));
				}
				if (u.indexOf('uploadType=media') >= 0) {
					if (window.__driveFail) { return Promise.resolve(new Response('boom', { status: 500 })); }
					if (window.__driveFail404) {
						return Promise.resolve(new Response(JSON.stringify({ error: { code: 404,
							message: 'File not found: 1FAKEFAKEFAKEFAKEFAKEFAKEFAKE0.' } }), { status: 404 }));
					}
					return Promise.resolve(new Response('{}', { status: 200 }));
				}
				if (u.indexOf('uploadType=multipart') >= 0) {
					return Promise.resolve(new Response(JSON.stringify({ id: 'new-drive-file', name: 'Copy of map.mup' }), { status: 200 }));
				}
			}
			return realFetch(url, options);
		};
		window.prompt = () => 'Copy of map';
	}, DEATH_MUP);

	await page.goto(BASE + '/app/index.html', { waitUntil: 'networkidle0' });
	await page.evaluate(() => localStorage.clear());
	await page.goto(BASE + '/app/index.html', { waitUntil: 'networkidle0' });
	await page.waitForSelector('.mapjs-node', { timeout: 8000 });

	// dismiss the first-visit welcome modal so it never blocks clicks
	await page.evaluate(() => {
		const box = document.getElementById('intro-dont-show');
		if (box) { box.checked = true; document.querySelector('.intro-start').click(); }
	});

	const clickMenu = (menu, item) => page.evaluate(([menuName, itemPrefix]) => {
		Array.from(document.querySelectorAll('.menu-title'))
			.find(t => t.textContent === menuName).click();
		const target = Array.from(document.querySelectorAll('.menu-item'))
			.find(i => i.textContent.indexOf(itemPrefix) >= 0);
		target.click();
	}, [menu, item]);

	// unconfigured deployment: Drive items exist but show the setup panel
	// (the shipped config now has a real clientId, so blank it first —
	// the config module is a singleton and isConfigured() reads it live)
	await page.evaluate(async () => {
		const mod = await import('./js/config.js');
		mod.driveConfig.clientId = '';
	});
	await clickMenu('File', 'Open from Google Drive');
	ok(await page.$eval('.panel', el => el.textContent.indexOf('not connected') >= 0).catch(() => false),
		'unconfigured Drive shows the setup panel');
	await page.click('.panel-close button');

	// re-configure with a test client
	await page.evaluate(async () => {
		const mod = await import('./js/config.js');
		mod.driveConfig.clientId = 'test-client.apps.googleusercontent.com';
	});

	// open from Drive: stubbed picker picks, stubbed REST serves death.mup.
	// Chrome allows the Picker frame its cookies, so the Safari note that
	// explains the block must never appear here — it would be a lie and an
	// extra click for everyone else
	await clickMenu('File', 'Open from Google Drive');
	await page.waitForFunction(() => document.getElementById('map-title').textContent === 'Drive map.mup', { timeout: 5000 });
	const opened = await page.evaluate(() => ({
		title: document.getElementById('map-title').textContent,
		hasMap: Array.from(document.querySelectorAll('.mapjs-node')).some(n => n.textContent.indexOf('going to die') >= 0),
		status: document.getElementById('save-status').textContent,
		mediaGet: window.__driveCalls.some(c => c.method === 'GET' && c.url.indexOf('drive-file-1') >= 0 && c.url.indexOf('alt=media') >= 0)
	}));
	ok(!(await page.$('.drive-cookie-note')), 'no Safari cookie note in Chrome — the picker opens directly');
	ok(opened.hasMap && opened.title === 'Drive map.mup', 'Open from Drive loads the picked file');
	ok(opened.mediaGet, 'file content fetched with files.get?alt=media');
	ok(opened.status === 'All changes saved', 'Drive-opened map reads as saved');

	// which tab the picker opens on: My Drive first, shared drives beside it
	const views = await page.evaluate(() => window.__pickerViews);
	ok(views.length >= 2, 'the picker offers more than one view');
	ok(!views[0].setEnableDrives && views[0].setParent === 'root',
		'the first tab is My Drive, rooted at the Drive root');
	ok(views.slice(1).some(v => v.setEnableDrives === true),
		'shared drives get a tab of their own, not the only one');
	ok(views.every(v => v.setIncludeFolders === true &&
		String(v.setMimeTypes).indexOf('vnd.mindmup') >= 0),
	'every tab shows folders and filters to openable map types');

	// plain Save on a Drive map updates the SAME Drive file (save override)
	await page.evaluate(() => {
		const content = window.__because.engine.mapModel.getIdea(),
			anyId = Object.values(content.ideas)[0].id;
		content.updateTitle(anyId, 'Edited on Drive');
	});
	await clickMenu('File', 'Save');
	await page.waitForFunction(() => document.getElementById('save-status').textContent === 'All changes saved', { timeout: 5000 });
	const patched = await page.evaluate(() =>
		window.__driveCalls.find(c => c.method === 'PATCH' && c.url.indexOf('drive-file-1') >= 0 && c.url.indexOf('uploadType=media') >= 0));
	ok(!!patched, 'Save PATCHes the same Drive file (uploadType=media)');
	ok(patched && String(patched.body).indexOf('Edited on Drive') >= 0, 'PATCH body carries the edited map');

	// the unsaved-changes modal's Save also goes to Drive, then proceeds
	await page.evaluate(() => {
		const content = window.__because.engine.mapModel.getIdea(),
			anyId = Object.values(content.ideas)[0].id;
		content.updateTitle(anyId, 'Second Drive edit');
	});
	await clickMenu('File', 'New');
	ok(await page.$('.panel-actions button[data-act=save]') !== null, 'guard modal appears for a dirty Drive map');
	await page.click('.panel-actions button[data-act=save]');
	await page.waitForFunction(() => document.getElementById('map-title').textContent === 'untitled.mup', { timeout: 5000 });
	const guardPatch = await page.evaluate(() =>
		window.__driveCalls.filter(c => c.method === 'PATCH').length);
	ok(guardPatch >= 2, 'guard-modal Save wrote to Drive before proceeding');

	// save a copy in Drive: multipart create, then the copy becomes current
	await clickMenu('File', 'Save a copy in Drive');
	await page.waitForFunction(() => document.getElementById('map-title').textContent === 'Copy of map.mup', { timeout: 5000 });
	const created = await page.evaluate(() =>
		window.__driveCalls.find(c => c.method === 'POST' && c.url.indexOf('uploadType=multipart') >= 0));
	ok(!!created, 'Save a copy POSTs multipart files.create');
	ok(created && String(created.body).indexOf('application/vnd.mindmup') >= 0, 'new file created with the MindMup mime type');

	// ---- auto-save: each change writes back to the Drive file on its own ----
	const drivePatches = () => page.evaluate(() =>
		window.__driveCalls.filter(c => c.method === 'PATCH' && c.url.indexOf('new-drive-file') >= 0).length);
	await page.evaluate(() => { window.__alerts = []; window.alert = m => window.__alerts.push(String(m)); });
	await clickMenu('File', 'Auto-save');
	const beforeAuto = await drivePatches();
	await page.evaluate(() => {
		const content = window.__because.engine.mapModel.getIdea(),
			anyId = Object.values(content.ideas)[0].id;
		content.updateTitle(anyId, 'Auto edit one');
		content.updateTitle(anyId, 'Auto edit two'); // rapid pair: must coalesce
	});
	await page.waitForFunction(n => window.__driveCalls.filter(c =>
		c.method === 'PATCH' && c.url.indexOf('new-drive-file') >= 0).length > n, { timeout: 6000 }, beforeAuto);
	await new Promise(r => setTimeout(r, 800)); // would catch a second, uncoalesced write
	ok(await drivePatches() === beforeAuto + 1, 'two rapid edits auto-save as ONE Drive PATCH');
	ok(await page.evaluate(() => document.getElementById('save-status').textContent) === 'All changes saved',
		'status settles on All changes saved after the auto-save');
	const lastAutoBody = await page.evaluate(() => {
		const calls = window.__driveCalls.filter(c => c.method === 'PATCH' && c.url.indexOf('new-drive-file') >= 0);
		return String(calls[calls.length - 1].body);
	});
	ok(lastAutoBody.indexOf('Auto edit two') >= 0, 'the auto-saved body carries the newest edit');
	ok(await page.evaluate(() => window.__because.analytics.events().some(e =>
		e.name === 'map_save' && e.params.mode === 'auto' && e.params.destination === 'drive')),
		'auto-save is tracked as map_save mode=auto');

	// a failing backend pauses auto-save quietly; a manual Save re-arms it
	await page.evaluate(() => { window.__driveFail = true; });
	await page.evaluate(() => {
		const content = window.__because.engine.mapModel.getIdea(),
			anyId = Object.values(content.ideas)[0].id;
		content.updateTitle(anyId, 'Fails to save');
	});
	await page.waitForFunction(() =>
		document.getElementById('save-status').textContent.indexOf('Auto-save failed') >= 0, { timeout: 6000 });
	ok(true, 'a failed auto-save reports in the status bar');
	ok(await page.evaluate(() => window.__alerts.length) === 0, 'auto-save failures never alert()');
	ok(await page.evaluate(() => window.__because.analytics.events().some(e => e.name === 'auto_save_error')),
		'the failure lands in analytics as auto_save_error');
	const pausedCount = await drivePatches();
	await page.evaluate(() => {
		const content = window.__because.engine.mapModel.getIdea(),
			anyId = Object.values(content.ideas)[0].id;
		content.updateTitle(anyId, 'Still paused');
	});
	await new Promise(r => setTimeout(r, 2000));
	ok(await drivePatches() === pausedCount, 'auto-save stays paused after a failure (no retry storm)');
	await page.evaluate(() => { window.__driveFail = false; });
	await clickMenu('File', 'Save');
	await page.waitForFunction(() => document.getElementById('save-status').textContent === 'All changes saved', { timeout: 6000 });
	const rearmedCount = await drivePatches();
	await page.evaluate(() => {
		const content = window.__because.engine.mapModel.getIdea(),
			anyId = Object.values(content.ideas)[0].id;
		content.updateTitle(anyId, 'Auto again');
	});
	await page.waitForFunction(n => window.__driveCalls.filter(c =>
		c.method === 'PATCH' && c.url.indexOf('new-drive-file') >= 0).length > n, { timeout: 6000 }, rearmedCount);
	ok(true, 'a successful manual Save re-arms auto-save');

	// ---- Drive hardening: shared-drive flag, account pinning, 404 triage ----
	ok(await page.evaluate(() => window.__driveCalls
		.filter(c => c.url.indexOf('/drive/v3/about') < 0)
		.every(c => c.url.indexOf('supportsAllDrives=true') >= 0)),
		'every Drive file read/write carries supportsAllDrives=true');
	const hints = await page.evaluate(() => window.__tokenRequests.map(r => (r && r.hint) || null));
	ok(hints.length >= 2 && hints[0] === null && hints[hints.length - 1] === 'sc@test',
		`token renewals are pinned to the granting account (${hints[0]} → ${hints[hints.length - 1]})`);

	// a write that 404s (file deleted / other account / shared-drive quirk)
	// gets diagnosed and turned into a save-a-copy offer, not a raw alert
	await page.evaluate(() => {
		window.__driveFail404 = true;
		window.__probe404 = true; // the probe can't see the file either
		window.__confirms = [];
		window.confirm = m => { window.__confirms.push(String(m)); return true; };
	});
	const postsBefore = await page.evaluate(() =>
		window.__driveCalls.filter(c => c.method === 'POST' && c.url.indexOf('uploadType=multipart') >= 0).length);
	await clickMenu('File', 'Save');
	await page.waitForFunction(n => window.__driveCalls.filter(c =>
		c.method === 'POST' && c.url.indexOf('uploadType=multipart') >= 0).length > n, { timeout: 6000 }, postsBefore);
	ok(await page.evaluate(() => window.__confirms.length === 1 &&
		window.__confirms[0].indexOf('no longer see') >= 0 && window.__confirms[0].indexOf('sc@test') >= 0),
		'a 404 on Save is diagnosed (signed-in account named) and offers a new file');
	await page.waitForFunction(() => document.getElementById('save-status').textContent === 'All changes saved', { timeout: 6000 });
	ok(await page.evaluate(() => window.__alerts.length) === 0, 'the 404 path never shows the raw error alert');
	ok(await page.evaluate(() => !window.__because.analytics.events().some(ev =>
		/[\w-]{25,}/.test(JSON.stringify(ev.params)))),
		'no Drive-id-sized token appears in any analytics event');
	await page.evaluate(() => { window.__driveFail404 = false; window.__probe404 = false; });

	// view-only files: warned at open, Save goes straight to a copy
	await page.evaluate(() => { window.__viewOnly = true; });
	await clickMenu('File', 'Open from Google Drive');
	await page.waitForFunction(() => document.getElementById('map-title').textContent === 'Drive map.mup', { timeout: 6000 });
	await page.waitForFunction(() => window.__alerts.length > 0, { timeout: 6000 });
	ok(await page.evaluate(() => window.__alerts.some(a => a.indexOf('view-only') >= 0)),
		'opening a view-only file warns immediately');
	const patchesToOriginal = () => page.evaluate(() =>
		window.__driveCalls.filter(c => c.method === 'PATCH' && c.url.indexOf('drive-file-1') >= 0).length);
	const beforeViewOnlySave = await patchesToOriginal();
	const postsBeforeViewOnly = await page.evaluate(() =>
		window.__driveCalls.filter(c => c.method === 'POST' && c.url.indexOf('uploadType=multipart') >= 0).length);
	await clickMenu('File', 'Save');
	await page.waitForFunction(n => window.__driveCalls.filter(c =>
		c.method === 'POST' && c.url.indexOf('uploadType=multipart') >= 0).length > n, { timeout: 6000 }, postsBeforeViewOnly);
	ok(await patchesToOriginal() === beforeViewOnlySave,
		'Save on a view-only file never PATCHes the original — it creates a copy');
	await page.evaluate(() => { window.__viewOnly = false; });

	// ---- account persistence: no chooser on return visits ----
	ok(await page.evaluate(() => localStorage.getItem('because.drive.account') === 'sc@test'),
		'the granting account persists in localStorage');
	await page.reload({ waitUntil: 'networkidle0' });
	await page.waitForSelector('.mapjs-node', { timeout: 8000 });
	await page.evaluate(() => { window.__alerts = []; window.alert = m => window.__alerts.push(String(m)); });
	await clickMenu('File', 'Open from Google Drive');
	await page.waitForFunction(() => document.getElementById('map-title').textContent === 'Drive map.mup', { timeout: 6000 });
	ok(await page.evaluate(() => window.__tokenRequests.length > 0 && window.__tokenRequests[0].hint === 'sc@test'),
		'after a reload the FIRST token request already carries the account hint');
	await clickMenu('File', 'Switch Google Drive account');
	await page.waitForFunction(() => window.__alerts.length > 0, { timeout: 6000 });
	ok(await page.evaluate(() => window.__tokenRequests.some(r => r.prompt === 'select_account')),
		'switching forces the account chooser (prompt=select_account)');
	ok(await page.evaluate(() => window.__alerts[0].indexOf('sc@test') >= 0),
		'the switch names the connected account');

	// ---- Share from Google Drive ----
	// on a Drive-bound map: one synchronous window.open to the file's page
	await page.evaluate(() => {
		window.__opened = [];
		window.open = (u, t) => { window.__opened.push({ url: String(u), target: String(t) }); return {}; };
	});
	await clickMenu('File', 'Share from Google Drive');
	ok(await page.evaluate(() => window.__opened.length === 1 &&
		window.__opened[0].url === 'https://drive.google.com/file/d/drive-file-1/view' &&
		window.__opened[0].target === '_blank'),
		'Share on a Drive map opens that file’s Drive page in a new tab');
	ok(await page.evaluate(() => window.__because.analytics.events().some(e =>
		e.name === 'drive_share' && e.params.method === 'direct')),
		'direct share is tracked as drive_share method=direct');

	// on a map that is NOT in Drive: offer to save there first
	await clickMenu('File', 'New');
	await page.waitForFunction(() => document.getElementById('map-title').textContent === 'untitled.mup', { timeout: 5000 });
	await page.evaluate(() => {
		window.__confirms = [];
		window.confirm = m => { window.__confirms.push(String(m)); return false; };
		window.__opened = [];
	});
	await clickMenu('File', 'Share from Google Drive');
	await new Promise(r => setTimeout(r, 300));
	ok(await page.evaluate(() => window.__confirms.length === 1 &&
		window.__confirms[0].indexOf('isn’t in Google Drive yet') >= 0),
		'Share without a Drive file asks to save to Drive first');
	ok(await page.evaluate(() => window.__opened.length === 0 && !document.querySelector('.panel')),
		'declining the save-to-Drive offer does nothing');

	// accepting: files.create, then a link panel (never a blockable popup)
	const sharePostsBefore = await page.evaluate(() =>
		window.__driveCalls.filter(c => c.method === 'POST' && c.url.indexOf('uploadType=multipart') >= 0).length);
	await page.evaluate(() => { window.confirm = () => true; });
	await clickMenu('File', 'Share from Google Drive');
	await page.waitForSelector('.panel a[target="_blank"]', { timeout: 6000 });
	const sharePanel = await page.evaluate(() => ({
		href: document.querySelector('.panel a[target="_blank"]').getAttribute('href'),
		text: document.querySelector('.panel').textContent,
		posts: window.__driveCalls.filter(c => c.method === 'POST' && c.url.indexOf('uploadType=multipart') >= 0).length,
		opened: window.__opened.length
	}));
	ok(sharePanel.posts === sharePostsBefore + 1, 'accepting saves the map to Drive (files.create)');
	ok(sharePanel.href === 'https://drive.google.com/file/d/new-drive-file/view' &&
		sharePanel.text.indexOf('Copy of map.mup') >= 0,
		'the share panel links the newly created Drive file by name');
	ok(sharePanel.opened === 0, 'no popup is attempted after the async save (Safari would block it)');
	ok(await page.evaluate(() => window.__because.analytics.events().some(e =>
		e.name === 'drive_share' && e.params.method === 'after_save')),
		'save-then-share is tracked as drive_share method=after_save');
	ok(await page.evaluate(() => !window.__because.analytics.events().some(ev =>
		/[\w-]{25,}/.test(JSON.stringify(ev.params)))),
		'still no Drive-id-sized token in any analytics event');
	await page.click('.panel-close button');

	// ---- a local Save As takes Save back from Drive ----
	ok(await page.evaluate(() => window.__because.drive.currentFile() !== null),
		'precondition: a Drive file owns Save before the local Save As');
	const handedBack = await page.evaluate(async () => {
		let writes = 0;
		window.showSaveFilePicker = async () => ({
			name: 'kept-locally.mup',
			createWritable: async () => ({ write: async () => { writes += 1; }, close: async () => {} })
		});
		const before = window.__driveCalls.length;
		await window.__because.io.save(true);  // File > Save As, to a local file
		await window.__because.io.save(false); // File > Save must follow it there
		return {
			writes,
			driveCalls: window.__driveCalls.length - before,
			driveFile: window.__because.drive.currentFile(),
			name: window.__because.io.fileName()
		};
	});
	ok(handedBack.writes === 2 && handedBack.driveCalls === 0 && handedBack.driveFile === null &&
		handedBack.name === 'kept-locally.mup',
		'a local Save As retires the Drive file and later saves stay local');

	if (errors.length) { console.log('PAGE ERRORS:', errors.join(' | ')); failures += 1; }
	await browser.close();
	console.log(failures === 0 ? 'ALL PASS (drive)' : failures + ' FAILURES (drive)');
	process.exit(failures ? 1 : 0);
})();
