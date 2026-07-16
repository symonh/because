// End-to-end editor tests: drive the real UI and assert DOM + internal state.
const puppeteer = require('puppeteer-core');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = process.env.BASE || 'http://127.0.0.1:8850';

let pass = 0, fail = 0; const problems = [];
function ok(name, cond, detail) {
	if (cond) { pass++; } else { fail++; problems.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
	const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
	const page = await browser.newPage();
	page.setDefaultTimeout(6000);
	await page.setViewport({ width: 1400, height: 900 });
	const pageErrors = [];
	page.on('pageerror', e => pageErrors.push(e.message));
	page.on('console', m => { if (m.type() === 'error' && !/favicon/.test(m.text())) pageErrors.push('console.error ' + m.text()); });

	const AB = (fn, ...a) => page.evaluate(fn, ...a);
	const state = () => AB(() => window.ArgumentBase.state());
	const nNodes = () => page.$$eval('.node', els => els.length);
	const dismissEditor = async () => { await AB(() => window.ArgumentBase.cancelEdit()); };

	async function fresh() {
		await page.goto(BASE + '/index.html', { waitUntil: 'networkidle0' });
		await page.click('#btnNew');
		await page.waitForSelector('.node');
		await dismissEditor();
	}
	const rootId = async () => Number((await page.$$eval('.node', els => els.map(e => e.getAttribute('data-id'))))[0]);

	try {
		// 1. New map
		await fresh();
		ok('new map has 1 node', (await nNodes()) === 1);
		ok('root has a numbered badge', await AB(() => !!document.querySelector('.node circle')));

		// 2. Add supporting reason
		const rid = await rootId();
		await AB(id => window.ArgumentBase.select(id), rid);
		await page.click('#btnReason');
		await page.waitForFunction(() => document.querySelectorAll('.node').length === 2);
		await dismissEditor();
		ok('add reason -> 2 nodes', (await nNodes()) === 2);
		ok('reason created a supporting group', await AB(() => Object.values(window.ArgumentBase.doc.ideas['1'].ideas).some(g => g.attr && g.attr.group === 'supporting')));

		// 3. Edit text via startEdit hook
		const reasonId = await AB(() => { const g = Object.values(window.ArgumentBase.doc.ideas['1'].ideas).find(x => x.attr && x.attr.group === 'supporting'); return g ? Object.values(g.ideas)[0].id : null; });
		ok('found reason id', reasonId != null, 'reasonId=' + reasonId);
		await AB(id => window.ArgumentBase.startEdit(id, true), reasonId);
		await sleep(150);
		const dsp = await AB(() => document.getElementById('editbox').style.display);
		ok('editor opened for reason', dsp === 'block', 'display=' + dsp);
		await page.evaluate(() => { document.getElementById('editbox').value = ''; });
		await page.type('#editbox', 'Because reasons');
		await page.keyboard.press('Enter');
		await sleep(150);
		ok('edited text persisted', await AB(() => window.ArgumentBase.serialize().includes('Because reasons')));

		// 4. Add co-premise
		await AB(id => window.ArgumentBase.select(id), reasonId);
		await page.click('#btnCo');
		await sleep(200);
		await dismissEditor();
		{ const c = await nNodes(); ok('add co-premise -> 3 nodes', c === 3, 'got ' + c); }
		ok('co-premise in same group (2 members)', await AB(() => { const g = Object.values(window.ArgumentBase.doc.ideas['1'].ideas).find(x => x.attr && x.attr.group === 'supporting'); return Object.keys(g.ideas).length === 2; }));

		// 5. Add opposing objection to root
		await AB(id => window.ArgumentBase.select(id), rid);
		await page.click('#btnObjection');
		await sleep(200);
		await dismissEditor();
		{ const c = await nNodes(); ok('add objection -> 4 nodes', c === 4, 'got ' + c); }
		ok('opposing group exists', await AB(() => Object.values(window.ArgumentBase.doc.ideas['1'].ideas).some(g => g.attr && g.attr.group === 'opposing')));
		ok('opposing bracket renders red', await AB(() => Array.from(document.querySelectorAll('path')).some(p => (p.getAttribute('stroke') || '').toLowerCase() === '#d1483a')));

		// 6. Implicit toggle
		const objId = await AB(() => { const g = Object.values(window.ArgumentBase.doc.ideas['1'].ideas).find(x => x.attr && x.attr.group === 'opposing'); return Object.values(g.ideas)[0].id; });
		await AB(id => window.ArgumentBase.select(id), objId);
		await page.click('#btnImplicit');
		await sleep(150);
		ok('implicit on: styleNames set', await AB(id => { const n = window.ArgumentBase.findNode(id); return n.attr.styleNames && n.attr.styleNames.includes('attr_implicit_claim'); }, objId));
		ok('implicit renders dotted blue', await AB(id => { const r = document.querySelector('.node[data-id="' + id + '"] rect'); return r && r.getAttribute('stroke') === '#22AAE0' && !!r.getAttribute('stroke-dasharray'); }, objId));
		await page.click('#btnImplicit');
		await sleep(150);
		ok('implicit off', await AB(id => { const n = window.ArgumentBase.findNode(id); return !n.attr.styleNames || !n.attr.styleNames.includes('attr_implicit_claim'); }, objId));

		// 7. Undo / redo
		let s0 = await state();
		await page.click('#btnUndo'); await sleep(80);
		let s1 = await state();
		ok('undo increases redo stack', s1.redo > s0.redo);
		await page.click('#btnRedo'); await sleep(80);
		ok('redo consumes redo stack', (await state()).redo < s1.redo);

		// 8. Delete (and empty-group cleanup)
		const cnt = await nNodes();
		await AB(id => window.ArgumentBase.select(id), objId);
		await page.click('#btnDelete');
		await sleep(200);
		ok('delete removed a node', (await nNodes()) < cnt);
		ok('empty opposing group cleaned up', await AB(() => !Object.values(window.ArgumentBase.doc.ideas['1'].ideas).some(g => g.attr && g.attr.group === 'opposing')));

		// 9. Round-trip
		const serialized = await AB(() => window.ArgumentBase.serialize());
		ok('serialized is formatVersion 3', await AB(x => JSON.parse(x).formatVersion === 3, serialized));
		const n = await AB(x => { window.ArgumentBase.load(JSON.parse(x), 'rt'); return document.querySelectorAll('.node').length; }, serialized);
		ok('serialize->reload round-trips node count', n === 3);

		// 10. Samples load
		for (const smp of ['death', 'lee-house', 'vegetarian']) {
			await page.goto(BASE + '/index.html?src=samples/' + smp + '.mup', { waitUntil: 'networkidle0' });
			const okLoad = await page.waitForSelector('.node', { timeout: 5000 }).then(() => true).catch(() => false);
			ok('sample loads: ' + smp, okLoad && (await nNodes()) > 0);
		}

		ok('no uncaught page errors', pageErrors.length === 0, pageErrors.join(' | '));
	} catch (e) {
		fail++; problems.push('HARNESS EXCEPTION: ' + e.message);
		console.log('  HARNESS EXCEPTION: ' + e.message);
	}

	await browser.close();
	console.log(`\n${pass} passed, ${fail} failed`);
	if (fail) { console.log('FAILURES:\n - ' + problems.join('\n - ')); process.exit(1); }
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
