// Clean-click selection test: click (zero mouse movement) on a node that
// is NOT selected and check whether selection moves to it. Then a stress
// loop of drags/undo/edits interleaved with clean-click checks.
const puppeteer = require('puppeteer-core');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = process.env.BASE || 'http://127.0.0.1:8871';
let failures = 0;
const ok = (cond, name) => { console.log((cond ? 'PASS ' : 'FAIL ') + name); if (!cond) { failures += 1; } };

(async () => {
	const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
	const page = await browser.newPage();
	await page.setViewport({ width: 1500, height: 950 });
	page.on('pageerror', e => console.log('PAGE ERROR:', e.message));
	await page.goto(BASE + '/app/index.html', { waitUntil: 'networkidle0' });
	await page.evaluate(() => localStorage.clear());
	await page.goto(BASE + '/app/index.html', { waitUntil: 'networkidle0' });
	await page.waitForSelector('.mapjs-node');

	await page.evaluate(() => {
		window.__argumentbase.engine.loadMap({ formatVersion: 3, id: 1, title: 'root', ideas: {
			1: { id: 11, title: 'group', attr: { group: 'supporting', contentLocked: true }, ideas: {
				1: { id: 12, title: 'Claim A' },
				2: { id: 13, title: 'Claim B' },
				3: { id: 14, title: 'Claim C' }
			} }
		} });
	});
	await new Promise(r => setTimeout(r, 700));

	const centerOf = txt => page.evaluate(t => {
		const el = Array.from(document.querySelectorAll('.mapjs-node')).find(n => n.textContent.indexOf(t) >= 0),
			r = el.getBoundingClientRect();
		return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
	}, txt);
	const selected = () => page.evaluate(() => window.__argumentbase.engine.mapModel.getSelectedNodeId());
	const cleanClick = async txt => {
		const c = await centerOf(txt);
		await page.mouse.move(c.x, c.y);       // move first,
		await new Promise(r => setTimeout(r, 60));
		await page.mouse.down();                // then a motionless press-release
		await new Promise(r => setTimeout(r, 40));
		await page.mouse.up();
		await new Promise(r => setTimeout(r, 150));
	};

	// baseline: clean click on an unselected node
	await cleanClick('Claim B');
	ok(await selected() === 13, `clean click selects Claim B (selected=${await selected()})`);
	await cleanClick('Claim A');
	ok(await selected() === 12, `clean click selects Claim A (selected=${await selected()})`);

	// stress: interleave manipulations with clean-click checks
	const dragTo = async (fromTxt, to) => {
		const f = await centerOf(fromTxt);
		await page.mouse.move(f.x, f.y);
		await page.mouse.down();
		for (let i = 1; i <= 12; i++) {
			await page.mouse.move(f.x + (to.x - f.x) * i / 12, f.y + (to.y - f.y) * i / 12);
			await new Promise(r => setTimeout(r, 12));
		}
		await page.mouse.up();
		await new Promise(r => setTimeout(r, 250));
	};
	for (let round = 1; round <= 6; round++) {
		// reposition C to empty space
		const c = await centerOf('Claim C');
		await dragTo('Claim C', { x: c.x + 120, y: c.y + 140 });
		// drag C onto A (grammar wrap), then undo it
		await dragTo('Claim C', await centerOf('Claim A'));
		await page.evaluate(() => window.__argumentbase.engine.mapModel.undo('test'));
		await new Promise(r => setTimeout(r, 200));
		await page.evaluate(() => window.__argumentbase.engine.mapModel.undo('test'));
		await new Promise(r => setTimeout(r, 200));
		// interrupted drag: press on B, wiggle, release over the toolbar
		const b = await centerOf('Claim B');
		await page.mouse.move(b.x, b.y);
		await page.mouse.down();
		await page.mouse.move(b.x + 30, b.y - 200);
		await page.mouse.move(700, 60); // over the toolbar
		await page.mouse.up();
		await new Promise(r => setTimeout(r, 250));
		await page.evaluate(() => window.__argumentbase.engine.mapModel.undo('test'));
		await new Promise(r => setTimeout(r, 200));
		// clean-click check must still work
		await cleanClick('Claim A');
		const s1 = await selected();
		await cleanClick('Claim B');
		const s2 = await selected();
		ok(s1 === 12 && s2 === 13, `round ${round}: clean click still selects (A=${s1} B=${s2})`);
	}

	await browser.close();
	console.log(failures === 0 ? 'ALL PASS (click-select)' : failures + ' FAILURES (click-select)');
	process.exit(failures ? 1 : 0);
})();
