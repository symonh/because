// Render each sample map headlessly and screenshot it for visual inspection.
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = process.env.BASE || 'http://127.0.0.1:8850';
const OUT = path.join(__dirname, 'screenshots');

const MAPS = process.argv.slice(2).length ? process.argv.slice(2) : [
	'samples/death.mup',
	'samples/lee-house.mup',
	'samples/vegetarian.mup',
	'samples-local/GeneticEnhancement.mup',
	'samples-local/huemer-guns-present-image.mup',
	'samples-local/Why AGI could be an existential risk (1).mup'
];

(async () => {
	fs.mkdirSync(OUT, { recursive: true });
	const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--force-device-scale-factor=1'] });
	const page = await browser.newPage();
	await page.setViewport({ width: 1500, height: 1000, deviceScaleFactor: 2 });
	const errors = [];
	page.on('console', m => { if (m.type() === 'error') errors.push('console.error: ' + m.text()); });
	page.on('pageerror', e => errors.push('pageerror: ' + e.message));

	for (const map of MAPS) {
		errors.length = 0;
		const url = BASE + '/index.html?src=' + encodeURIComponent(map);
		try {
			await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
			await page.waitForSelector('svg.argmap-svg', { timeout: 8000 });
			await page.click('#btnFit').catch(() => {});
			await new Promise(r => setTimeout(r, 300));
			const stats = await page.evaluate(() => {
				const svg = document.querySelector('svg.argmap-svg');
				const nodes = document.querySelectorAll('.node').length;
				const stickies = document.querySelectorAll('.sticky').length;
				const paths = document.querySelectorAll('path').length;
				// detect NaN in any path/rect/transform
				let nan = 0;
				document.querySelectorAll('svg *').forEach(el => {
					for (const a of el.attributes) if (/NaN|undefined/.test(a.value)) nan++;
				});
				return { w: svg ? svg.getAttribute('width') : null, nodes, stickies, paths, nan };
			});
			const name = map.replace(/.*\//, '').replace(/\.mup$/i, '').replace(/[^\w-]+/g, '_');
			await page.screenshot({ path: path.join(OUT, name + '.png'), fullPage: false });
			console.log(`OK  ${map}  nodes=${stats.nodes} stickies=${stats.stickies} paths=${stats.paths} nan=${stats.nan} w=${stats.w}` + (errors.length ? '  ERRORS: ' + errors.join(' | ') : ''));
		} catch (e) {
			console.log(`FAIL ${map}  ${e.message}` + (errors.length ? '  ' + errors.join(' | ') : ''));
		}
	}
	await browser.close();
})();
