// Render a map headlessly through the app or engine-demo, inject an override
// CSS file, produce a clean view (no selection/activation), crop tightly to the
// map, and screenshot. Usage:
//   node render_engine.js --css override.css --out out.png [--keep-selection] [--url URL]
const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
function arg(name, def) { const i = process.argv.indexOf('--' + name); return i >= 0 ? process.argv[i + 1] : def; }
const has = name => process.argv.includes('--' + name);

const cssFile = arg('css', '');
const out = arg('out', '/tmp/engine-out.png');
const url = arg('url', 'http://127.0.0.1:8870/index.html');
const pad = parseInt(arg('pad', '48'), 10);

(async () => {
	const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--force-device-scale-factor=2'] });
	const page = await browser.newPage();
	await page.setViewport({ width: parseInt(arg('vw','1600'),10), height: parseInt(arg('vh','1100'),10), deviceScaleFactor: 2 });
	const errors = [];
	page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
	page.on('pageerror', e => errors.push('pageerror: ' + e.message));

	await page.goto(url, { waitUntil: 'networkidle0', timeout: 20000 });
	await page.waitForSelector('.mapjs-node', { timeout: 8000 });
	// hide the dev toolbar so it never intrudes
	await page.evaluate(() => {
		const tc = document.getElementById('testcontrols'); if (tc) tc.style.display = 'none';
		const c = document.getElementById('container'); if (c) { c.style.height = '100vh'; c.style.border = 'none'; }
	});
	// inject override CSS
	if (cssFile && fs.existsSync(cssFile)) {
		const css = fs.readFileSync(cssFile, 'utf8');
		await page.addStyleTag({ content: css });
	}
	// clean view: drop selection/activation classes unless asked to keep
	if (!has('keep-selection')) {
		await page.evaluate(() => {
			document.querySelectorAll('.activated, .selected').forEach(n => n.classList.remove('activated', 'selected'));
		});
	}
	await new Promise(r => setTimeout(r, 400));

	// union bbox of nodes + connector svg paths
	const box = await page.evaluate(() => {
		const rects = [];
		document.querySelectorAll('.mapjs-node').forEach(n => rects.push(n.getBoundingClientRect()));
		document.querySelectorAll('.mapjs-draw-container path, svg path').forEach(p => { try { rects.push(p.getBoundingClientRect()); } catch (e) {} });
		if (!rects.length) return null;
		let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
		rects.forEach(r => { if (r.width && r.height) { x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top); x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom); } });
		return { x0, y0, x1, y1 };
	});
	if (!box) { console.log('NO NODES'); await browser.close(); process.exit(1); }
	const clip = {
		x: Math.max(0, box.x0 - pad),
		y: Math.max(0, box.y0 - pad),
		width: (box.x1 - box.x0) + pad * 2,
		height: (box.y1 - box.y0) + pad * 2
	};
	await page.screenshot({ path: out, clip });
	// DOM diagnostics
	const dom = await page.evaluate(() => {
		const one = document.querySelector('.mapjs-node:not(.attr_group)');
		const label = document.querySelector('.mapjs-label');
		const impl = document.querySelector('.attr_implicit_claim');
		const cs = el => el ? window.getComputedStyle(el) : null;
		const pick = s => s ? { bg: s.backgroundColor, border: s.border, radius: s.borderRadius, font: s.fontSize + '/' + s.lineHeight, color: s.color, pad: s.padding } : null;
		return {
			nodeCount: document.querySelectorAll('.mapjs-node:not(.attr_group)').length,
			classesOnFirst: one ? one.className : null,
			node: pick(cs(one)),
			label: label ? { text: label.textContent, ...pick(cs(label)), pos: (() => { const d = label.closest('.mapjs-decorations'); const c = cs(d); return c ? { left: c.left, top: c.top, right: c.right, position: c.position } : null; })() } : null,
			implicit: impl ? pick(cs(impl)) : null
		};
	});
	console.log(JSON.stringify(dom, null, 2));
	if (errors.length) console.log('ERRORS:', errors.join(' | '));
	console.log('wrote', out, JSON.stringify(clip));
	await browser.close();
})();
