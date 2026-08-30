// Where does the Because/But label sit now? Measure against the connector's
// vertical span and against the arrowhead, and shoot a crop for the eye.
const puppeteer = require('puppeteer-core');
const { chromePath } = require('./chrome-path');
const CHROME = chromePath();
const BASE = 'http://127.0.0.1:8871';
const OUT = process.argv[2] || '/tmp/shots';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const MAP = theme => ({
	formatVersion: 3, id: 'root', attr: { theme }, ideas: {
		1: {
			id: 2, title: 'The government is right to tax our earnings.', ideas: {
				1: {
					id: 11, title: 'group', attr: { group: 'supporting', contentLocked: true }, ideas: {
						1: { id: 12, title: 'A government is responsible for the safety and security of its citizens' },
						2: { id: 13, title: "You can't protect anyone without resources." }
					}
				},
				2: {
					id: 21, title: 'group', attr: { group: 'opposing', contentLocked: true }, ideas: {
						1: { id: 22, title: 'Taxing our earnings is the same as forcing us to work without pay.' }
					}
				}
			}
		}
	}
});

(async () => {
	const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
	const page = await browser.newPage();
	await page.setViewport({ width: 1400, height: 900, deviceScaleFactor: 3 });
	page.on('pageerror', e => console.log('PAGEERROR', e.message));
	await page.goto(BASE + '/app/index.html', { waitUntil: 'networkidle0' });
	await page.evaluate(() => localStorage.clear());
	await page.goto(BASE + '/app/index.html', { waitUntil: 'networkidle0' });
	await page.waitForSelector('.mapjs-node', { timeout: 8000 });
	await page.evaluate(() => {
		const box = document.getElementById('intro-dont-show');
		if (box) { box.checked = true; document.querySelector('.intro-start').click(); }
	});

	const measure = connId => page.evaluate(id => {
		const conn = document.querySelector('#' + id),
			path = conn.querySelector('path.mapjs-connector'),
			text = conn.querySelector('.mapjs-connector-text text'),
			arrow = conn.querySelector('path.mapjs-arrow'),
			r = text.getBoundingClientRect(),
			ar = arrow.getBoundingClientRect(),
			cx = r.x + r.width / 2,
			cy = r.y + r.height / 2,
			len = path.getTotalLength(),
			ctm = path.getScreenCTM();
		let best = 1e9, i, pt, sp;
		for (i = 0; i <= 600; i++) {
			pt = path.getPointAtLength(len * i / 600);
			sp = new DOMPoint(pt.x, pt.y).matrixTransform(ctm);
			best = Math.min(best, Math.hypot(sp.x - cx, sp.y - cy));
		}
		const p0 = new DOMPoint(path.getPointAtLength(0).x, path.getPointAtLength(0).y).matrixTransform(ctm),
			// the curve ends where the bracket begins; use the connector's own
			// vertical span (parent base -> child top) from the node boxes
			fromBox = document.querySelector('#node_2').getBoundingClientRect(),
			toBox = conn.id.indexOf('_11') > 0 ?
				document.querySelector('#node_11').getBoundingClientRect() :
				document.querySelector('#node_21').getBoundingClientRect(),
			spanTop = fromBox.bottom,
			spanBottom = toBox.top,
			midY = (spanTop + spanBottom) / 2;
		return {
			onCurve: Math.round(best),
			labelCy: Math.round(cy),
			spanTop: Math.round(spanTop),
			spanBottom: Math.round(spanBottom),
			offFromMid: Math.round(cy - midY),
			gapToArrow: Math.round(Math.min(Math.abs(ar.top - r.bottom), Math.abs(r.top - ar.bottom))),
			labelBox: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
			arrowBox: [Math.round(ar.x), Math.round(ar.y), Math.round(ar.width), Math.round(ar.height)],
			pathStart: [Math.round(p0.x), Math.round(p0.y)]
		};
	}, connId);

	for (const theme of ['argMappingHighImpact', 'argMappingHighImpactUpward']) {
		await page.evaluate(m => window.__because.engine.loadMap(m), MAP(theme));
		await sleep(900);
		console.log(theme, 'supporting', await measure('connector_2_11'));
		console.log(theme, 'opposing  ', await measure('connector_2_21'));
		const clip = await page.evaluate(() => {
			const a = document.querySelector('#node_2').getBoundingClientRect(),
				b = document.querySelector('#node_21').getBoundingClientRect();
			return { x: Math.max(0, a.x - 60), y: a.bottom - 20, width: 700, height: (b.top - a.bottom) + 90 };
		});
		await page.screenshot({ path: OUT + '/label-' + theme + '.png', clip });
	}
	await browser.close();
})();
