// Experiment: what does detaching a reason/objection BRACKET to the root
// actually produce? The bracket line is drawn by the connector between the
// parent claim and the group, so a group with no parent may lose it.
const puppeteer = require('puppeteer-core');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = 'http://127.0.0.1:8871';
const OUT = process.argv[2] || '/tmp/shots';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const MAP = {
	formatVersion: 3, id: 'root', attr: { theme: 'argMappingHighImpact' }, ideas: {
		1: {
			id: 2, title: 'Conclusion claim', ideas: {
				1: {
					id: 11, title: 'group', attr: { group: 'supporting', contentLocked: true }, ideas: {
						1: { id: 12, title: 'Reason one', ideas: {
							1: { id: 30, title: 'group', attr: { group: 'supporting', contentLocked: true }, ideas: {
								1: { id: 31, title: 'Sub-reason of one' }
							} }
						} },
						2: { id: 13, title: 'Co-premise two' }
					}
				},
				2: {
					id: 21, title: 'group', attr: { group: 'opposing', contentLocked: true }, ideas: {
						1: { id: 22, title: 'Lone objection' }
					}
				}
			}
		}
	}
};

(async () => {
	const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
	const page = await browser.newPage();
	await page.setViewport({ width: 1400, height: 900, deviceScaleFactor: 2 });
	page.on('pageerror', e => console.log('PAGEERROR', e.message));
	await page.goto(BASE + '/app/index.html', { waitUntil: 'networkidle0' });
	await page.evaluate(() => localStorage.clear());
	await page.goto(BASE + '/app/index.html', { waitUntil: 'networkidle0' });
	await page.waitForSelector('.mapjs-node', { timeout: 8000 });
	await page.evaluate(() => {
		const box = document.getElementById('intro-dont-show');
		if (box) { box.checked = true; document.querySelector('.intro-start').click(); }
	});
	await page.evaluate(m => window.__because.engine.loadMap(m), MAP);
	await sleep(900);

	const state = () => page.evaluate(() => {
		const json = JSON.parse(window.__because.engine.serialize());
		return {
			topLevel: Object.keys(json.ideas).map(k => json.ideas[k].id).sort(),
			nodes: Array.from(document.querySelectorAll('.mapjs-node')).map(n => n.id).sort(),
			connectors: Array.from(document.querySelectorAll('[data-mapjs-role=connector]')).map(c => c.id).sort(),
			groupNodeBox: (function () {
				const el = document.querySelector('#node_11');
				if (!el) { return null; }
				const r = el.getBoundingClientRect();
				return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)];
			}())
		};
	});
	console.log('BEFORE', await state());

	// the engine's own group detach, exactly as dragging the bracket to a
	// blank area does
	await page.evaluate(() => {
		const mm = window.__because.engine.mapModel,
			box = mm.getCurrentLayout().nodes[11];
		mm.positionNodeAt(11, box.x, box.y, true);
	});
	await sleep(800);
	console.log('AFTER positionNodeAt(group 11)', await state());
	console.log('group classes', await page.evaluate(() => {
		const el = document.querySelector('#node_11');
		return { cls: el.className, level: el.getAttribute('mapjs-level'), bg: getComputedStyle(el).backgroundColor, border: getComputedStyle(el).borderTopColor };
	}));
	const gb = await page.evaluate(() => {
		const r = document.querySelector('#node_11').getBoundingClientRect();
		return { x: r.x, y: r.y, w: r.width, h: r.height };
	});
	await page.screenshot({ path: OUT + '/detach-group.png', clip: { x: gb.x - 40, y: gb.y - 40, width: gb.w + 120, height: 200 } });
	await page.click('#theme-toggle');
	await sleep(500);
	await page.screenshot({ path: OUT + '/detach-group-dark.png', clip: { x: gb.x - 40, y: gb.y - 40, width: gb.w + 120, height: 200 } });
	await browser.close();
})();
