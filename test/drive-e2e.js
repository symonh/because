// E2e for the Google Drive module with Google's side stubbed: GIS token
// client, Picker, and the Drive REST endpoints are faked at the network /
// global boundary, so everything on OUR side of the boundary runs for
// real (menu wiring, guard modal, save override, request shapes).
// The one thing this cannot cover is Google's real consent popup.
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
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
		// --- GIS stub: hands out a fake token immediately
		window.google = window.google || {};
		window.google.accounts = {
			oauth2: {
				initTokenClient(cfg) {
					return {
						callback: cfg.callback,
						requestAccessToken() {
							this.callback({ access_token: 'FAKE_TOKEN', expires_in: 3600 });
						}
					};
				}
			}
		};
		// --- Picker stub: "picks" a fixed Drive doc as soon as it is shown
		const chain = obj => new Proxy(obj || {}, { get: (t, k) => (k in t ? t[k] : () => chain(t)) });
		window.gapi = { load: (name, cb) => cb() };
		window.google.picker = {
			ViewId: { DOCS: 'docs' },
			Response: { ACTION: 'action', DOCUMENTS: 'docs' },
			Action: { PICKED: 'picked', CANCEL: 'cancel' },
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
		// --- Drive REST stub: record calls, serve canned responses
		window.__driveCalls = [];
		const realFetch = window.fetch.bind(window);
		window.fetch = function (url, options) {
			const u = String(url);
			if (u.indexOf('googleapis.com') >= 0 && u.indexOf('/drive/v3/') >= 0) {
				window.__driveCalls.push({ url: u, method: (options && options.method) || 'GET', body: options && options.body });
				if (u.indexOf('alt=media') >= 0) {
					return Promise.resolve(new Response(deathMup, { status: 200 }));
				}
				if (u.indexOf('uploadType=media') >= 0) {
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

	// open from Drive: stubbed picker picks, stubbed REST serves death.mup
	await clickMenu('File', 'Open from Google Drive');
	await page.waitForFunction(() => document.getElementById('map-title').textContent === 'Drive map.mup', { timeout: 5000 });
	const opened = await page.evaluate(() => ({
		title: document.getElementById('map-title').textContent,
		hasMap: Array.from(document.querySelectorAll('.mapjs-node')).some(n => n.textContent.indexOf('going to die') >= 0),
		status: document.getElementById('save-status').textContent,
		mediaGet: window.__driveCalls.some(c => c.method === 'GET' && c.url.indexOf('drive-file-1') >= 0 && c.url.indexOf('alt=media') >= 0)
	}));
	ok(opened.hasMap && opened.title === 'Drive map.mup', 'Open from Drive loads the picked file');
	ok(opened.mediaGet, 'file content fetched with files.get?alt=media');
	ok(opened.status === 'All changes saved', 'Drive-opened map reads as saved');

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

	if (errors.length) { console.log('PAGE ERRORS:', errors.join(' | ')); failures += 1; }
	await browser.close();
	console.log(failures === 0 ? 'ALL PASS (drive)' : failures + ' FAILURES (drive)');
	process.exit(failures ? 1 : 0);
})();
