// E2e for the OneDrive module with Microsoft's side stubbed: the OAuth
// popup (window.open), the token endpoint, and the Graph REST endpoints
// are faked at the network / global boundary, so everything on OUR side
// runs for real (menu wiring, PKCE request shapes, the in-app picker
// panel, save override, auto-save). The one thing this cannot cover is
// Microsoft's real sign-in UI.
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

	// never let the real Google scripts load (drive.js preloads them)
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
		// --- auth popup stub: "Microsoft" immediately posts a code back
		window.__authPopups = [];
		window.__opened = [];
		window.open = function (url, target) {
			const u = String(url);
			if (u.indexOf('login.microsoftonline.com') >= 0 && u.indexOf('/authorize') >= 0) {
				window.__authPopups.push(u);
				const state = new URLSearchParams(u.split('?')[1]).get('state');
				window.setTimeout(function () {
					window.postMessage({ msAuth: true, code: 'FAKE_CODE', state: state }, '*');
				}, 30);
				return { closed: false, close() { this.closed = true; } };
			}
			window.__opened.push({ url: u, target: String(target) });
			return {};
		};
		// --- token endpoint + Graph stubs
		window.__tokenPosts = [];
		window.__odCalls = [];
		const idToken = 'x.' + window.btoa(JSON.stringify({ preferred_username: 'sc@ms.test' })) + '.y';
		const realFetch = window.fetch.bind(window);
		window.fetch = function (url, options) {
			const u = String(url);
			if (u.indexOf('login.microsoftonline.com') >= 0 && u.indexOf('/token') >= 0) {
				window.__tokenPosts.push(String(options && options.body));
				return Promise.resolve(new Response(JSON.stringify({
					access_token: 'FAKE_MS', expires_in: 3600,
					refresh_token: 'FAKE_RT', id_token: idToken
				}), { status: 200 }));
			}
			if (u.indexOf('graph.microsoft.com') >= 0) {
				window.__odCalls.push({ url: u, method: (options && options.method) || 'GET', body: options && options.body });
				if (u.indexOf('/me/drive/root/children') >= 0) {
					return Promise.resolve(new Response(JSON.stringify({ value: [
						{ id: 'fold1', name: 'Teaching', folder: { childCount: 1 } },
						{ id: 'odfile1', name: 'OD map.mup', file: {}, webUrl: 'https://onedrive.live.com/x/odfile1' },
						{ id: 'docx1', name: 'notes.docx', file: {}, webUrl: 'https://onedrive.live.com/x/docx1' }
					] }), { status: 200 }));
				}
				if (u.indexOf('/me/drive/items/fold1/children') >= 0) {
					return Promise.resolve(new Response(JSON.stringify({ value: [
						{ id: 'odfile2', name: 'Nested.mup', file: {}, webUrl: 'https://onedrive.live.com/x/odfile2' }
					] }), { status: 200 }));
				}
				if (u.indexOf('downloadUrl') >= 0) { // metadata probe before content read
					const id = decodeURIComponent(u.split('/me/drive/items/')[1].split('?')[0]);
					return Promise.resolve(new Response(JSON.stringify({
						id: id, name: 'OD map.mup', webUrl: 'https://onedrive.live.com/x/' + id,
						'@microsoft.graph.downloadUrl': 'https://download.test/' + id
					}), { status: 200 }));
				}
				if (u.indexOf('/me/drive/root:/') >= 0 && u.indexOf(':/content') >= 0) {
					const name = decodeURIComponent(u.split('/me/drive/root:/')[1].split(':/content')[0]);
					return Promise.resolve(new Response(JSON.stringify({
						id: 'od-new', name: name, webUrl: 'https://onedrive.live.com/x/od-new'
					}), { status: 200 }));
				}
				if (u.indexOf('/content') >= 0 && options && options.method === 'PUT') {
					return Promise.resolve(window.__odFail ?
						new Response('locked', { status: 403 }) :
						new Response('{}', { status: 200 }));
				}
			}
			if (u.indexOf('download.test') >= 0) {
				return Promise.resolve(new Response(deathMup, { status: 200 }));
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

	// unconfigured deployment: OneDrive items explain setup (the shipped
	// config now has a real client id, so blank it first — the config
	// module is a singleton and isConfigured() reads it live)
	await page.evaluate(async () => {
		const mod = await import('./js/config.js');
		mod.onedriveConfig.clientId = '';
	});
	await clickMenu('File', 'Open from OneDrive');
	ok(await page.$eval('.panel', el => el.textContent.indexOf('OneDrive is not connected') >= 0).catch(() => false),
		'unconfigured OneDrive shows the setup panel');
	await page.click('.panel-close button');

	// configure a test client id (module is a live singleton)
	await page.evaluate(async () => {
		const mod = await import('./js/config.js');
		mod.onedriveConfig.clientId = 'test-ms-client';
	});

	// open: PKCE popup, then the in-app picker panel over Graph listings
	await clickMenu('File', 'Open from OneDrive');
	await page.waitForSelector('.od-list .od-item', { timeout: 6000 });
	const authUrl = await page.evaluate(() => window.__authPopups[0] || '');
	ok(authUrl.indexOf('response_type=code') >= 0 && authUrl.indexOf('code_challenge=') >= 0 &&
		authUrl.indexOf('code_challenge_method=S256') >= 0,
		'sign-in uses the authorization-code + PKCE popup');
	ok(await page.evaluate(() => window.__tokenPosts[0].indexOf('grant_type=authorization_code') >= 0 &&
		window.__tokenPosts[0].indexOf('code_verifier=') >= 0),
		'the code is exchanged with the PKCE verifier');
	const rootList = await page.evaluate(() =>
		Array.from(document.querySelectorAll('.od-list .od-item')).map(b => b.textContent));
	ok(rootList.some(t => t.indexOf('Teaching') >= 0) && rootList.some(t => t.indexOf('OD map.mup') >= 0) &&
		!rootList.some(t => t.indexOf('notes.docx') >= 0),
		'picker lists folders and .mup files, hides other files');

	// drill into a folder and back
	await page.evaluate(() => {
		Array.from(document.querySelectorAll('.od-list .od-item'))
			.find(b => b.textContent.indexOf('Teaching') >= 0).click();
	});
	await page.waitForFunction(() => Array.from(document.querySelectorAll('.od-list .od-item'))
		.some(b => b.textContent.indexOf('Nested.mup') >= 0), { timeout: 6000 });
	ok(await page.evaluate(() => document.querySelector('.od-path').textContent === 'OneDrive › Teaching'),
		'folder drill-down lists its children');
	await page.click('.od-up');
	await page.waitForFunction(() => Array.from(document.querySelectorAll('.od-list .od-item'))
		.some(b => b.textContent.indexOf('OD map.mup') >= 0), { timeout: 6000 });

	// pick the file: content comes via @microsoft.graph.downloadUrl
	await page.evaluate(() => {
		Array.from(document.querySelectorAll('.od-list .od-item'))
			.find(b => b.textContent.indexOf('OD map.mup') >= 0).click();
	});
	await page.waitForFunction(() => document.getElementById('map-title').textContent === 'OD map.mup', { timeout: 6000 });
	const opened = await page.evaluate(() => ({
		hasMap: Array.from(document.querySelectorAll('.mapjs-node')).some(n => n.textContent.indexOf('going to die') >= 0),
		status: document.getElementById('save-status').textContent,
		account: localStorage.getItem('because.onedrive.account'),
		rt: localStorage.getItem('because.onedrive.refresh')
	}));
	ok(opened.hasMap && opened.status === 'All changes saved', 'picked OneDrive file loads and reads as saved');
	ok(opened.account === 'sc@ms.test' && opened.rt === 'FAKE_RT',
		'the granting account and refresh token persist');

	// plain Save writes back to the SAME OneDrive file (save override)
	await page.evaluate(() => {
		const content = window.__because.engine.mapModel.getIdea(),
			anyId = Object.values(content.ideas)[0].id;
		content.updateTitle(anyId, 'Edited on OneDrive');
	});
	await clickMenu('File', 'Save');
	await page.waitForFunction(() => document.getElementById('save-status').textContent === 'All changes saved', { timeout: 6000 });
	const put = await page.evaluate(() =>
		window.__odCalls.find(c => c.method === 'PUT' && c.url.indexOf('/items/odfile1/content') >= 0));
	ok(!!put && String(put.body).indexOf('Edited on OneDrive') >= 0,
		'Save PUTs the edited map to the same item');

	// auto-save targets the OneDrive file through the same override
	const odPuts = () => page.evaluate(() =>
		window.__odCalls.filter(c => c.method === 'PUT' && c.url.indexOf('/items/odfile1/content') >= 0).length);
	await clickMenu('File', 'Auto-save');
	const beforeAuto = await odPuts();
	await page.evaluate(() => {
		const content = window.__because.engine.mapModel.getIdea(),
			anyId = Object.values(content.ideas)[0].id;
		content.updateTitle(anyId, 'Auto od one');
		content.updateTitle(anyId, 'Auto od two');
	});
	await page.waitForFunction(n => window.__odCalls.filter(c =>
		c.method === 'PUT' && c.url.indexOf('/items/odfile1/content') >= 0).length > n, { timeout: 6000 }, beforeAuto);
	await new Promise(r => setTimeout(r, 800));
	ok(await odPuts() === beforeAuto + 1, 'two rapid edits auto-save as ONE OneDrive PUT');
	ok(await page.evaluate(() => window.__because.analytics.events().some(e =>
		e.name === 'map_save' && e.params.destination === 'onedrive' && e.params.mode === 'auto')),
		'auto-save is tracked as map_save destination=onedrive mode=auto');

	// save a copy: PUT into the root with rename-on-conflict
	await clickMenu('File', 'Save a copy in OneDrive');
	await page.waitForFunction(() => document.getElementById('map-title').textContent === 'Copy of map.mup', { timeout: 6000 });
	const created = await page.evaluate(() =>
		window.__odCalls.find(c => c.method === 'PUT' && c.url.indexOf('/me/drive/root:/') >= 0));
	ok(!!created && created.url.indexOf('conflictBehavior=rename') >= 0,
		'Save a copy PUTs a new file into the OneDrive root');

	// share: the file's own OneDrive page, one synchronous window.open
	await page.evaluate(() => { window.__opened = []; });
	await clickMenu('File', 'Share from OneDrive');
	ok(await page.evaluate(() => window.__opened.length === 1 &&
		window.__opened[0].url === 'https://onedrive.live.com/x/od-new' &&
		window.__opened[0].target === '_blank'),
		'Share on a OneDrive map opens that file’s OneDrive page');
	ok(await page.evaluate(() => window.__because.analytics.events().some(e =>
		e.name === 'onedrive_share' && e.params.method === 'direct')),
		'direct share is tracked as onedrive_share method=direct');

	// share on a NON-OneDrive map: offer to save there first, then link
	await clickMenu('File', 'New');
	await page.waitForFunction(() => document.getElementById('map-title').textContent === 'untitled.mup', { timeout: 6000 });
	await page.evaluate(() => {
		window.__confirms = [];
		window.confirm = m => { window.__confirms.push(String(m)); return true; };
		window.__opened = [];
	});
	await clickMenu('File', 'Share from OneDrive');
	await page.waitForSelector('.panel a[target="_blank"]', { timeout: 6000 });
	ok(await page.evaluate(() => window.__confirms[0].indexOf('isn’t in OneDrive yet') >= 0),
		'Share without a OneDrive file asks to save there first');
	ok(await page.evaluate(() =>
		document.querySelector('.panel a[target="_blank"]').getAttribute('href') === 'https://onedrive.live.com/x/od-new' &&
		window.__opened.length === 0),
		'the share panel links the new file (no blockable popup)');
	ok(await page.evaluate(() => window.__because.analytics.events().some(e =>
		e.name === 'onedrive_share' && e.params.method === 'after_save')),
		'save-then-share is tracked as onedrive_share method=after_save');
	await page.click('.panel-close button');

	// a failing write is explained and turned into a save-a-copy offer
	await page.evaluate(() => {
		window.__odFail = true;
		window.__confirms = [];
		window.confirm = m => { window.__confirms.push(String(m)); return true; };
	});
	await page.evaluate(() => {
		const content = window.__because.engine.mapModel.getIdea(),
			anyId = Object.values(content.ideas)[0].id;
		content.updateTitle(anyId, 'Fails on OneDrive');
	});
	// auto-save hits the 403 first and pauses quietly; manual Save triages
	await page.waitForFunction(() =>
		document.getElementById('save-status').textContent.indexOf('Auto-save failed') >= 0, { timeout: 6000 });
	await clickMenu('File', 'Save');
	await page.waitForFunction(() => window.__confirms.length > 0, { timeout: 6000 });
	ok(await page.evaluate(() => window.__confirms[0].indexOf('NEW OneDrive file') >= 0),
		'a failed write offers saving as a new OneDrive file');
	await page.waitForFunction(() => document.getElementById('save-status').textContent === 'All changes saved', { timeout: 6000 });
	ok(await page.evaluate(() => window.__because.analytics.events().some(e => e.name === 'onedrive_error')),
		'the failure lands in analytics as onedrive_error');
	await page.evaluate(() => { window.__odFail = false; });

	// ---- a local Save As takes Save back from OneDrive ----
	ok(await page.evaluate(() => window.__because.onedrive.currentFile() !== null),
		'precondition: a OneDrive file owns Save before the local Save As');
	const odHandedBack = await page.evaluate(async () => {
		let writes = 0;
		window.showSaveFilePicker = async () => ({
			name: 'kept-locally.mup',
			createWritable: async () => ({ write: async () => { writes += 1; }, close: async () => {} })
		});
		const before = window.__odCalls.length;
		await window.__because.io.save(true);
		await window.__because.io.save(false);
		return {
			writes,
			odCalls: window.__odCalls.length - before,
			odFile: window.__because.onedrive.currentFile(),
			name: window.__because.io.fileName()
		};
	});
	ok(odHandedBack.writes === 2 && odHandedBack.odCalls === 0 && odHandedBack.odFile === null &&
		odHandedBack.name === 'kept-locally.mup',
		'a local Save As retires the OneDrive file and later saves stay local');

	// switch account forces the account picker and names the new account
	await page.evaluate(() => { window.__alerts = []; window.alert = m => window.__alerts.push(String(m)); });
	await clickMenu('File', 'Switch Microsoft account');
	await page.waitForFunction(() => window.__alerts.length > 0, { timeout: 6000 });
	ok(await page.evaluate(() => window.__authPopups.some(u => u.indexOf('prompt=select_account') >= 0)),
		'switching forces the account picker (prompt=select_account)');
	ok(await page.evaluate(() => window.__alerts[0].indexOf('sc@ms.test') >= 0),
		'the switch names the connected account');

	// return visit: the persisted refresh token skips the popup entirely
	await page.reload({ waitUntil: 'networkidle0' });
	await page.waitForSelector('.mapjs-node', { timeout: 8000 });
	await page.evaluate(async () => { // the config module reset on reload
		const mod = await import('./js/config.js');
		mod.onedriveConfig.clientId = 'test-ms-client';
	});
	await clickMenu('File', 'Open from OneDrive');
	await page.waitForSelector('.od-list .od-item', { timeout: 6000 });
	ok(await page.evaluate(() => window.__authPopups.length === 0 &&
		window.__tokenPosts.length > 0 && window.__tokenPosts[0].indexOf('grant_type=refresh_token') >= 0),
		'after a reload the refresh token renews silently — no popup');
	await page.evaluate(() => {
		const btn = document.querySelector('.panel-close button');
		if (btn) { btn.click(); }
	});

	ok(await page.evaluate(() => !window.__because.analytics.events().some(ev =>
		/[\w-]{25,}/.test(JSON.stringify(ev.params)))),
		'no long token ever appears in analytics event params');

	if (errors.length) { console.log('PAGE ERRORS:', errors.join(' | ')); failures += 1; }
	await browser.close();
	console.log(failures === 0 ? 'ALL PASS (onedrive)' : failures + ' FAILURES (onedrive)');
	process.exit(failures ? 1 : 0);
})();
