// Regenerate site/og.png, the 1200x630 social card, from docs/og-card.html —
// which renders the hero's own map through the real figure component, so the
// card and the page cannot drift apart (docs/figures.md).
//
// Needs the repo root served at BASE (default http://127.0.0.1:8871): the card
// loads site/js/argmap.js as a module, and file:// will not.
//
//   cd test && node og-shot.js
//
// Chrome rather than WebKit deliberately: this writes a committed artefact, so
// one engine has to own it, and it is the engine the deviceScaleFactor and the
// dot-grid rendering were eyeballed in. The suites still check the page itself
// in both.
const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const { chromePath } = require('./chrome-path');
const CHROME = chromePath();
const BASE = process.env.BASE || 'http://127.0.0.1:8871';
const OUT = path.join(__dirname, '..', 'site', 'og.png');

(async () => {
	const browser = await chromium.launch({ executablePath: CHROME });
	// reducedMotion, so the map's entrance animation never runs: a still image
	// has nothing to animate, and waiting it out would be a race the shot loses.
	const context = await browser.newContext({
		viewport: { width: 1200, height: 630 },
		deviceScaleFactor: 1,
		reducedMotion: 'reduce'
	});
	const page = await context.newPage();
	// Chrome asks for /favicon.ico unprompted; a card has no need of one.
	const ignorable = url => /favicon\.ico$/.test(url || '');
	const errors = [];
	page.on('pageerror', e => errors.push('pageerror: ' + e.message));
	page.on('console', m => {
		if (m.type() === 'error' && !ignorable(m.location() && m.location().url)) {
			errors.push('console: ' + m.text());
		}
	});
	page.on('requestfailed', r => { if (!ignorable(r.url())) { errors.push('failed: ' + r.url()); } });
	page.on('response', r => {
		if (r.status() >= 400 && !ignorable(r.url())) { errors.push('HTTP ' + r.status() + ': ' + r.url()); }
	});

	await page.goto(BASE + '/docs/og-card.html', { waitUntil: 'load' });
	await page.waitForFunction(() => document.querySelector('.argmap[data-hydrated]'), { timeout: 8000 });
	// Noto Sans arrives after first paint and changes the wrapping, so wait for
	// the font-driven relayout to settle before shooting.
	await page.evaluate(() => document.fonts && document.fonts.ready);
	await page.waitForTimeout(600);

	// The card must be one flat image of a map that fits: no scrollbar, nothing
	// clipped, no page overflow.
	const state = await page.evaluate(() => {
		const s = document.querySelector('.fig-scroller');
		const fig = document.querySelector('.fig').getBoundingClientRect();
		return {
			overflowX: s.scrollWidth - s.clientWidth,
			overflowY: s.scrollHeight - s.clientHeight,
			figBottom: Math.round(fig.bottom),
			figRight: Math.round(fig.right),
			pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
			hydrated: !!document.querySelector('.argmap[data-hydrated]'),
			font: getComputedStyle(document.querySelector('.am-claim')).fontFamily.split(',')[0],
			faded: [...document.querySelectorAll('.am-claim, .am-bracket, .am-links')]
				.filter(el => getComputedStyle(el).opacity !== '1').length
		};
	});
	const bad = [];
	if (state.faded) { bad.push(state.faded + ' element(s) still mid-fade — the card would ship half-drawn'); }
	if (state.overflowX > 1 || state.overflowY > 1) { bad.push('the map does not fit the canvas: ' + JSON.stringify(state)); }
	if (state.figBottom > 630 || state.figRight > 1200) { bad.push('the figure is clipped by the card: ' + JSON.stringify(state)); }
	if (state.pageOverflow > 0) { bad.push('the card overflows 1200px'); }
	if (!state.hydrated) { bad.push('the map never hydrated'); }
	if (errors.length) { bad.push(errors.join(' | ')); }
	if (bad.length) {
		console.error('FAIL og-shot:\n  ' + bad.join('\n  '));
		await browser.close();
		process.exit(1);
	}

	await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: 1200, height: 630 } });
	await browser.close();
	const kb = (fs.statSync(OUT).size / 1024).toFixed(1);
	console.log('wrote site/og.png (1200x630, ' + kb + ' KB, map in ' + state.font + ')');
})();
