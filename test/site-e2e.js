// E2e for the landing page's argument-map figures (site/, docs/figures.md):
// the pre-rendered figure is in the HTML, hydrates to the authentic MindMup
// geometry in both engines, stays correct with JavaScript off, keeps the WCAG
// 2.2 AA gate clean, and the .mup it offers really opens in the editor.
// Expects `python3 -m http.server 8871` at the repo root.
const { webkit, chromium } = require('playwright-core');
const { execFileSync } = require('node:child_process');
const fs = require('fs');
const path = require('path');
const { resolveChrome } = require('./chrome-path');

const MODE = process.env.BECAUSE_E2E_BROWSER || 'all';
const RUN_WEBKIT = MODE !== 'chrome';
const RUN_CHROME = MODE !== 'webkit';
const CHROME = RUN_CHROME ? resolveChrome() : null;
const BASE = process.env.BASE || 'http://127.0.0.1:8871';
const SITE = BASE + '/site/index.html';
const ROOT = path.join(__dirname, '..');
const axeSource = fs.readFileSync(path.join(__dirname, 'node_modules', 'axe-core', 'axe.min.js'), 'utf8');
const AXE_OPTS = {
	runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }
};

let failures = 0;
const ok = (cond, name) => { console.log((cond ? 'PASS ' : 'FAIL ') + name); if (!cond) { failures += 1; } };

/* Every word in every claim on the page, checked for being rendered in one
 * piece. A wrap cap too narrow for a long word used to split it down the middle
 * ("manipulativ / e."); .am-abs .am-claim's min-width: min-content is what stops
 * that, and a word broken across two lines shows up here as two client rects.
 * A hyphen is a legitimate break point, so "ticking-bomb" counts as two words. */
const brokenWords = () => {
	const bad = [];
	document.querySelectorAll('.argmap .am-text').forEach(text => {
		const node = text.firstChild;
		if (!node || node.nodeType !== 3) { return; }
		const re = /[^\s\-‐-―/]+/g;
		let m;
		while ((m = re.exec(node.textContent)) !== null) {
			const range = document.createRange();
			range.setStart(node, m.index);
			range.setEnd(node, m.index + m[0].length);
			if (range.getClientRects().length > 1) { bad.push(m[0]); }
		}
	});
	return bad;
};

/* What the page looks like, in the terms the figure is specified in. */
const probe = () => {
	const fig = document.querySelector('.fig');
	const map = fig.querySelector('.argmap');
	const claim = n => fig.querySelector('.am-claim[data-num="' + n + '"]');
	const box = el => {
		const r = el.getBoundingClientRect();
		return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
	};
	const bracket = fig.querySelector('.am-bracket');
	return {
		hydrated: map.hasAttribute('data-hydrated'),
		abs: map.classList.contains('am-abs'),
		nums: [...fig.querySelectorAll('.am-claim')].map(c => c.dataset.num),
		badges: [...fig.querySelectorAll('.am-badge')].map(b => b.textContent),
		root: box(claim('1.1')),
		left: box(claim('2.1')),
		right: box(claim('2.2')),
		bracket: box(bracket),
		// A reason's bracket is rounded either way, but by different means: the
		// single hydrated element carries the radius, while the flow fallback
		// draws it on the first claim's corner-cap pseudo-element.
		bracketRadius: parseFloat(getComputedStyle(bracket).borderTopLeftRadius),
		capRadius: parseFloat(getComputedStyle(claim('2.1'), '::before').borderTopLeftRadius),
		stemShown: getComputedStyle(fig.querySelector('.am-stem')).display !== 'none',
		paths: [...fig.querySelectorAll('.am-links path')].map(p => p.getAttribute('d')),
		canvasH: Math.round(document.querySelector('.fig-canvas').getBoundingClientRect().height),
		desc: document.getElementById(map.getAttribute('aria-describedby')).textContent,
		mupHref: fig.querySelector('a[download]').getAttribute('href'),
		appHref: fig.querySelector('.fig-actions a:not([download])').getAttribute('href'),
		tabStops: fig.querySelectorAll('[tabindex="0"]').length,
		pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
		scroller: (() => {
			const s = fig.querySelector('.fig-scroller');
			return { scrollW: s.scrollWidth, clientW: s.clientWidth };
		})()
	};
};

/* The two co-premises sit ADJACENT under a bracket that hugs exactly their row
 * — the geometry the whole layout engine exists to produce. */
function checksGeometry(label, g) {
	const gap = g.right.x - (g.left.x + g.left.w);
	ok(g.nums.join() === '1.1,2.1,2.2', label + ': claims numbered by depth, left to right');
	ok(g.badges.join() === '1.1,2.1,2.2', label + ': every claim carries its number badge');
	// one claim gap: 20px hydrated (the theme's spacing), 0.8em = 12px in the
	// flow fallback. Either way the two boxes touch, rather than being pushed
	// apart by their subtrees — which was the whole point of the layout engine.
	ok(gap >= 10 && gap <= 30, label + `: co-premises are adjacent (${gap}px apart, one claim gap)`);
	ok(Math.abs(g.bracket.x - g.left.x) <= 2 &&
		Math.abs((g.bracket.x + g.bracket.w) - (g.right.x + g.right.w)) <= 2,
		label + ': the bracket hugs the claims row, not the subtree');
	ok(g.bracket.y > g.root.y + g.root.h && g.bracket.y < g.left.y,
		label + ': the bracket sits between the conclusion and its claims');
	const rootCx = g.root.x + g.root.w / 2;
	ok(Math.abs(rootCx - (g.bracket.x + g.bracket.w / 2)) <= 2,
		label + ': the conclusion is centred over the bracket');
	ok(g.pageOverflow <= 0, label + ': the page never scrolls horizontally');
	ok(/eradicate aging/.test(g.desc) && /supported by one reason/.test(g.desc),
		label + ': the hidden description states the argument');
}

(async () => {
	// ---- the committed render matches the map JSON ----
	try {
		execFileSync(process.execPath, ['figures/build.mjs', '--check'], { cwd: ROOT, stdio: 'pipe' });
		ok(true, 'site/index.html + site/maps/*.mup are up to date with figures/maps/');
	} catch (err) {
		ok(false, 'figures/build.mjs --check: ' + String(err.stdout || '') + String(err.stderr || ''));
	}

	const browsers = [];
	if (RUN_CHROME) { browsers.push(['chrome', chromium, { executablePath: CHROME }]); }
	if (RUN_WEBKIT) { browsers.push(['webkit', webkit, {}]); }
	for (const [name, launcher, opts] of browsers) {
		const browser = await launcher.launch(opts);

		// ---- no JS: the figure is already right ----
		const plain = await browser.newContext({ viewport: { width: 1440, height: 950 }, javaScriptEnabled: false });
		const bare = await plain.newPage();
		await bare.goto(SITE, { waitUntil: 'load' });
		const before = await bare.evaluate(probe);
		ok(!before.hydrated && !before.abs, name + ' no-JS: the map is the flow render');
		ok(before.stemShown, name + ' no-JS: the CSS fallback stem stands in for the curve');
		ok(before.paths.length === 0, name + ' no-JS: no SVG connectors are drawn');
		ok(before.capRadius > 3, name + ' no-JS: the bracket\'s corner cap is rounded');
		const bareBroken = await bare.evaluate(brokenWords);
		ok(bareBroken.length === 0, name + ' no-JS: no claim breaks a word across lines' +
			(bareBroken.length ? ' — ' + bareBroken.join(', ') : ''));
		checksGeometry(name + ' no-JS', before);
		await plain.close();

		// ---- hydrated ----
		const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
		const errors = [];
		page.on('pageerror', e => errors.push('pageerror: ' + e.message));
		page.on('console', m => { if (m.type() === 'error') { errors.push('console: ' + m.text()); } });
		await page.goto(SITE, { waitUntil: 'load' });
		await page.waitForFunction(() => document.querySelector('.argmap[data-hydrated]'), { timeout: 8000 });
		await page.waitForTimeout(600);
		const g = await page.evaluate(probe);
		ok(g.hydrated && g.abs, name + ': hydration flips the map to the measured layout');
		ok(!g.stemShown, name + ': the fallback stem hides once the curve is drawn');
		ok(g.paths.length === 1, name + ': one connector, conclusion to bracket');
		ok(/^M[\d.]+,[\d.]+ L[\d.]+,[\d.]+$/.test(g.paths[0]),
			name + ': a plumb drop is drawn as a straight line, not a vestigial S — ' + g.paths[0]);
		ok(g.bracketRadius > 3, name + ': a reason\'s bracket is rounded');
		checksGeometry(name, g);
		ok(Math.abs(g.canvasH - before.canvasH) <= 4,
			`${name}: hydration shifts the canvas by at most 4px (${before.canvasH} → ${g.canvasH})`);
		ok(g.scroller.scrollW <= g.scroller.clientW + 1,
			name + ': the hero map fits its canvas without scrolling');
		// the file is named for the map, so the title bar, the download and the
		// name the editor shows all say eradicate-aging.mup
		ok(g.mupHref === '/maps/eradicate-aging.mup',
			name + ': Download .mup points at the deployed file — ' + g.mupHref);
		ok(g.appHref === '/app/?src=%2Fmaps%2Feradicate-aging.mup',
			name + ': Open in the editor hands the map to the app — ' + g.appHref);

		// ---- keyboard: one tab stop, arrows move selection ----
		ok(g.tabStops === 1, name + ': the whole figure is a single tab stop');
		await page.evaluate(() => document.querySelector('.am-claim[data-num="1.1"]').focus());
		await page.keyboard.press('ArrowDown');
		let sel = await page.evaluate(() => ({
			focus: document.activeElement.dataset.num,
			active: document.querySelector('.argmap').getAttribute('aria-activedescendant'),
			selected: [...document.querySelectorAll('.am-claim')]
				.filter(c => c.getAttribute('aria-selected') === 'true').map(c => c.dataset.num)
		}));
		ok(sel.focus === '2.1' && sel.selected.join() === '2.1' && /2\.1$/.test(sel.active),
			name + ': Down enters the reason and moves selection with focus');
		await page.keyboard.press('ArrowRight');
		ok(await page.evaluate(() => document.activeElement.dataset.num) === '2.2',
			name + ': Right moves to the co-premise');
		await page.keyboard.press('ArrowUp');
		ok(await page.evaluate(() => document.activeElement.dataset.num) === '1.1',
			name + ': Up returns to the conclusion');
		await page.keyboard.press('Escape');
		sel = await page.evaluate(() => ({
			selected: document.querySelectorAll('.am-claim.is-selected').length,
			active: document.querySelector('.argmap').getAttribute('aria-activedescendant')
		}));
		ok(sel.selected === 0 && sel.active === null, name + ': Escape clears the selection');

		// ---- every bracket kind, told apart by shape alone ----
		// (docs/accessibility.md exception 1: rounded reason, square objection,
		// flat neutral bar — so colour is never the only cue)
		const { render } = await import('../figures/lib/render.js');
		const kinds = render({
			id: 'kinds',
			root: {
				text: 'Torture is always wrong.',
				groups: [
					{ type: 'supporting',
						claims: [{ text: 'It treats a person as a mere means.' },
							{ text: 'Treating a person as a mere means is wrong.', implicit: true }],
						inferenceObjections: [{ claims: [{ text: 'Some means-treatment is consented to.' }] }] },
					{ type: 'opposing', claims: [{ text: 'A ticking-bomb case could justify it.' }] },
					{ type: 'neutral', claims: [{ text: 'Is torture ever justified?' }] }
				]
			},
			options: { claimMaxCh: 20 }
		}, {});
		const shapes = await page.evaluate(async html => {
			const fig = document.createElement('figure');
			fig.className = 'fig';
			fig.id = 'fig-kinds';
			fig.innerHTML = '<div class="fig-canvas"><div class="fig-scroller">' + html + '</div></div>';
			document.querySelector('main').appendChild(fig);
			const mod = await import('/site/js/argmap.js');
			mod.init(fig);
			await new Promise(r => requestAnimationFrame(r));
			const read = b => {
				const cs = getComputedStyle(b);
				return {
					kind: b.parentElement.getAttribute('data-group-type'),
					radius: Math.round(parseFloat(cs.borderTopLeftRadius)),
					arms: parseFloat(cs.borderLeftWidth),
					h: Math.round(b.getBoundingClientRect().height),
					colour: cs.borderTopColor
				};
			};
			const brackets = [...fig.querySelectorAll('.am-bracket')]
				.map(read).filter(b => b.h > 0);
			return {
				brackets: brackets,
				ioBars: fig.querySelectorAll('.am-io-bar').length,
				implicit: getComputedStyle(fig.querySelector('.am-implicit')).borderTopStyle,
				paths: fig.querySelectorAll('.am-links path').length,
				nums: [...fig.querySelectorAll('.am-claim')].map(c => c.dataset.num).join()
			};
		}, kinds);
		const kind = k => shapes.brackets.filter(b => b.kind === k)[0];
		ok(kind('supporting') && kind('supporting').radius > 3 && kind('supporting').arms > 0,
			name + ' kinds: a reason\'s bracket is rounded with descending arms');
		ok(kind('opposing') && kind('opposing').radius === 0 && kind('opposing').arms > 0,
			name + ' kinds: an objection\'s bracket is square');
		ok(kind('neutral') && kind('neutral').radius === 0 && kind('neutral').arms === 0 &&
			kind('neutral').h <= 4,
			name + ' kinds: the neutral connector\'s bracket is a bare flat bar');
		ok(new Set(shapes.brackets.map(b => b.colour)).size === 3,
			name + ' kinds: and the three still differ in colour too');
		ok(shapes.ioBars === 1, name + ' kinds: the objection to the inference draws its own bar');
		ok(shapes.implicit === 'dashed', name + ' kinds: an implicit claim is dashed');
		ok(shapes.nums === '1.1,2.1,2.2,2.3,2.4,2.5',
			name + ' kinds: inference-objection claims number beside the bracket\'s own — ' + shapes.nums);
		ok(shapes.paths === 3, name + ' kinds: one connector per top-level group');

		// ---- the legend cards are real maps too ----
		// One running argument shown three ways. They are illustrations: inert,
		// aria-hidden (the card's heading and sentence carry the meaning), no tab
		// stop, and one height across the row so the cards line up.
		const legend = await page.evaluate(() =>
			[...document.querySelectorAll('.legend .argmap-inline')].map(panel => {
				const map = panel.querySelector('.argmap');
				const group = panel.querySelector('.am-group');
				const bracket = panel.querySelector('.am-bracket');
				const claims = [...panel.querySelectorAll('.am-claim')];
				const scroller = panel.querySelector('.fig-scroller');
				return {
					id: panel.dataset.argmap,
					hidden: panel.getAttribute('aria-hidden'),
					inert: map.classList.contains('am-inert'),
					hydrated: map.hasAttribute('data-hydrated'),
					focusable: panel.querySelectorAll('[tabindex]').length,
					badges: panel.querySelectorAll('.am-badge').length,
					kind: group.getAttribute('data-group-type'),
					radius: Math.round(parseFloat(getComputedStyle(bracket).borderTopLeftRadius)),
					dashed: claims.filter(c => getComputedStyle(c).borderTopStyle === 'dashed').length,
					paths: panel.querySelectorAll('.am-links path').length,
					panelH: Math.round(panel.getBoundingClientRect().height),
					fits: scroller.scrollWidth <= scroller.clientWidth + 1,
					roots: claims.filter(c => /Lying is wrong/.test(c.textContent)).length
				};
			}));
		const card = id => legend.filter(l => l.id === id)[0];
		ok(legend.length === 3, name + ' legend: three cards, three maps');
		ok(legend.every(l => l.hydrated && l.paths === 1 && l.fits),
			name + ' legend: each is laid out, connected, and fits its card');
		ok(legend.every(l => l.hidden === 'true' && l.inert && l.focusable === 0 && l.badges === 0),
			name + ' legend: illustrations — inert, unnumbered, out of the a11y tree');
		ok(legend.every(l => l.roots === 1),
			name + ' legend: all three show the same argument, three ways');
		ok(new Set(legend.map(l => l.panelH)).size === 1,
			name + ' legend: one panel height across the row — ' + legend.map(l => l.panelH).join('/'));
		ok(card('legend-reason') && card('legend-reason').kind === 'supporting' &&
			card('legend-reason').radius > 3,
			name + ' legend: the reason card draws a rounded green bracket');
		ok(card('legend-objection') && card('legend-objection').kind === 'opposing' &&
			card('legend-objection').radius === 0,
			name + ' legend: the objection card draws a square red bracket');
		ok(card('legend-implicit') && card('legend-implicit').dashed === 1,
			name + ' legend: the implicit card draws exactly one dashed claim');

		// ---- no claim box ever splits a word ----
		const broken = await page.evaluate(brokenWords);
		ok(broken.length === 0,
			name + ': no claim breaks a word across lines' +
				(broken.length ? ' — ' + broken.join(', ') : ''));

		// ---- narrow viewport: tighten the wrap, never scroll the page ----
		await page.setViewportSize({ width: 390, height: 844 });
		await page.waitForTimeout(700);
		const narrow = await page.evaluate(probe);
		ok(narrow.pageOverflow <= 0, name + ' narrow: the page still never scrolls horizontally');
		ok(await page.evaluate(() => [...document.querySelectorAll('.legend .fig-scroller')]
			.every(s => s.scrollWidth <= s.clientWidth + 1)),
			name + ' narrow: the legend maps refit to the stacked cards');
		const narrowBroken = await page.evaluate(brokenWords);
		ok(narrowBroken.length === 0,
			name + ' narrow: still no word broken across lines' +
				(narrowBroken.length ? ' — ' + narrowBroken.join(', ') : ''));
		ok(narrow.right.x > narrow.left.x + narrow.left.w,
			name + ' narrow: the co-premises stay side by side — the adjacency is the meaning');
		ok(narrow.scroller.scrollW <= narrow.scroller.clientW + 1,
			name + ' narrow: the fit ladder tightens the wrap instead of scrolling');

		if (errors.length) { ok(false, name + ': no console errors — ' + errors.join(' | ')); }
		else { ok(true, name + ': no console errors'); }
		await page.close();

		// ---- reduced motion ----
		const still = await browser.newContext({ viewport: { width: 1440, height: 950 }, reducedMotion: 'reduce' });
		const rm = await still.newPage();
		await rm.goto(SITE, { waitUntil: 'load' });
		await rm.waitForFunction(() => document.querySelector('.argmap[data-hydrated]'), { timeout: 8000 });
		ok(await rm.evaluate(() => [...document.querySelectorAll('.am-claim')]
			.every(c => getComputedStyle(c).opacity === '1')),
			name + ' reduced motion: the map is there at once, no entrance animation');
		await still.close();

		await browser.close();
	}

	// ---- axe: the page with the figure in it must stay AA-clean (WebKit) ----
	// Scanned with reduced motion, so nothing is measured mid-fade: the page's
	// scroll-reveal holds text at partial opacity, and axe reads that as a
	// contrast failure on copy that is fine once it has arrived.
	if (RUN_WEBKIT) {
		const browser = await webkit.launch();
		const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 }, reducedMotion: 'reduce' });
		const page = await ctx.newPage();
		await page.goto(SITE, { waitUntil: 'load' });
		await page.waitForFunction(() => document.querySelector('.argmap[data-hydrated]'), { timeout: 8000 });
		await page.evaluate(axeSource);
		let r = await page.evaluate(o => window.axe.run(document, o), AXE_OPTS);
		ok(r.violations.length === 0, 'axe clean: landing page — ' +
			r.violations.map(v => v.id + '(' + v.nodes.length + ')').join(', '));
		// and with a claim selected, which is when the tree state is live
		await page.evaluate(() => document.querySelector('.am-claim[data-num="1.1"]').focus());
		await page.keyboard.press('ArrowDown');
		r = await page.evaluate(o => window.axe.run(document, o), AXE_OPTS);
		ok(r.violations.length === 0, 'axe clean: landing page, claim selected — ' +
			r.violations.map(v => v.id + '(' + v.nodes.length + ')').join(', '));
		await browser.close();
	}

	// ---- the .mup the caption offers really opens in Because ----
	if (RUN_WEBKIT) {
		const browser = await webkit.launch();
		const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
		const errors = [];
		page.on('pageerror', e => errors.push(e.message));
		await page.goto(BASE + '/app/index.html');
		await page.evaluate(() => localStorage.setItem('because.intro.dismissed', '1'));
		// the deployed href is /maps/…; served from the repo root it lives under site/
		await page.goto(BASE + '/app/index.html?src=/site/maps/eradicate-aging.mup');
		await page.waitForSelector('.mapjs-node', { timeout: 8000 });
		await page.waitForTimeout(500);
		const loaded = await page.evaluate(() => ({
			texts: [...document.querySelectorAll('.mapjs-node')]
				.map(n => n.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean),
			title: document.title
		}));
		ok(loaded.texts.some(t => /moral duty to eradicate aging/.test(t)) &&
			loaded.texts.some(t => /Aging is a great evil/.test(t)) &&
			loaded.texts.some(t => /eradicate great evils/.test(t)),
			'the generated .mup opens in the editor with all three claims');
		ok(errors.length === 0, 'the editor loads it without errors — ' + errors.join(' | '));
		await browser.close();
	}

	console.log(failures === 0 ? 'ALL PASS' : failures + ' FAILURES');
	process.exit(failures === 0 ? 0 : 1);
})();
