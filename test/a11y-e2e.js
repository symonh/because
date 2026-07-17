// WCAG 2.2 AA regression gate, in WebKit (the Safari rule): axe-core
// scans of every chrome state must come back clean, and the keyboard
// model must hold — Tab walks the chrome, the menubar is a real ARIA
// menubar, dialogs trap and restore focus, and the philmaps keys still
// work with focus in the map. Expects `python3 -m http.server 8871`
// at the repo root (same as the other suites).
const { webkit } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const axeSource = fs.readFileSync(path.join(__dirname, 'node_modules', 'axe-core', 'axe.min.js'), 'utf8');
const BASE = process.env.BASE || 'http://127.0.0.1:8871';
let failures = 0;
const ok = (cond, name) => { console.log((cond ? 'PASS ' : 'FAIL ') + name); if (!cond) { failures += 1; } };

const AXE_OPTS = {
	runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }
};

(async () => {
	const browser = await webkit.launch();
	const page = await browser.newPage({ viewport: { width: 1500, height: 950 } });
	const errors = [];
	page.on('pageerror', e => errors.push(e.message));

	const axeScan = async label => {
		await page.evaluate(axeSource);
		const r = await page.evaluate(opts => window.axe.run(document, opts), AXE_OPTS);
		const summary = r.violations.map(v => v.id + '(' + v.nodes.length + ')').join(', ');
		ok(r.violations.length === 0, 'axe clean: ' + label + (summary ? ' — ' + summary : ''));
	};
	const active = () => page.evaluate(() => {
		const a = document.activeElement;
		return a ? (a.tagName + '|' + (a.id || '') + '|' + (a.className || '').toString() + '|' + (a.textContent || '').slice(0, 25)) : 'none';
	});

	// ---- fresh load: intro modal ----
	await page.goto(BASE + '/app/index.html');
	await page.evaluate(() => localStorage.clear());
	await page.reload();
	await page.waitForSelector('.mapjs-node', { timeout: 8000 });
	await page.waitForTimeout(400);

	ok(await page.evaluate(() => document.documentElement.lang) === 'en', 'html has lang');
	const introPanel = await page.evaluate(() => {
		const p = document.querySelector('.panel-overlay .panel');
		return p && { role: p.getAttribute('role'), modal: p.getAttribute('aria-modal') };
	});
	ok(introPanel && introPanel.role === 'dialog' && introPanel.modal === 'true', 'intro is a modal dialog');
	ok((await active()).indexOf('intro-start') >= 0, 'intro focuses Get started');
	await page.keyboard.press('Tab');
	await page.keyboard.press('Tab');
	ok(await page.evaluate(() => document.querySelector('.panel-overlay').contains(document.activeElement)),
		'Tab is trapped inside the intro dialog');
	await axeScan('intro modal');
	await page.keyboard.press('Escape');
	ok(await page.evaluate(() => !document.querySelector('.panel-overlay')), 'Escape closes the intro');

	// ---- real map (intro dismissed for good first) ----
	await page.evaluate(() => localStorage.setItem('because.intro.dismissed', '1'));
	await page.goto(BASE + '/app/index.html?src=../samples/death.mup');
	await page.waitForSelector('.mapjs-node', { timeout: 8000 });
	await page.waitForTimeout(600);
	await axeScan('map, light mode');

	// canvas semantics
	const sem = await page.evaluate(() => {
		const c = document.getElementById('map-container'), n = document.querySelector('.mapjs-node');
		return { role: c.getAttribute('role'), tab: c.getAttribute('tabindex'),
			nodeRole: n.getAttribute('role'), nodeTab: n.getAttribute('tabindex') };
	});
	ok(sem.role === 'tree' && sem.tab === '0', 'map container is a tree with tabindex 0');
	ok(sem.nodeRole === 'treeitem' && sem.nodeTab === '-1', 'nodes are treeitems, not tab stops');
	ok(await page.evaluate(() => document.getElementById('save-status').getAttribute('role')) === 'status',
		'save status is a live region');
	ok(await page.evaluate(() => getComputedStyle(document.getElementById('save-status')).color) === 'rgb(110, 110, 110)',
		'save status contrast color applied');

	// ---- Tab walk: skip link, then chrome ----
	await page.evaluate(() => { if (document.activeElement) { document.activeElement.blur(); } });
	await page.keyboard.press('Tab');
	ok((await active()).indexOf('skip-link') >= 0, 'first Tab stop is the skip link');
	await page.keyboard.press('Enter');
	ok((await active()).indexOf('map-container') >= 0, 'skip link focuses the map');

	await page.evaluate(() => { document.activeElement.blur(); });
	await page.keyboard.press('Tab'); // skip link
	await page.keyboard.press('Tab'); // menubar (one roving stop)
	const onMenubar = (await active()).indexOf('menu-title') >= 0;
	ok(onMenubar, 'second Tab stop is the menubar');

	// ---- menubar keyboard pattern ----
	if (onMenubar) {
		ok((await active()).indexOf('File') >= 0, 'menubar stop is File');
		await page.keyboard.press('ArrowRight');
		ok((await active()).indexOf('Insert') >= 0, 'ArrowRight moves to Insert');
		await page.keyboard.press('ArrowDown');
		await page.waitForTimeout(150);
		const inMenu = await page.evaluate(() => {
			const m = document.querySelector('.menu-dropdown');
			return m && { role: m.getAttribute('role'), has: m.contains(document.activeElement) };
		});
		ok(inMenu && inMenu.role === 'menu' && inMenu.has, 'ArrowDown opens menu and focuses an item');
		await page.keyboard.press('ArrowDown');
		ok((await active()).indexOf('menu-item') >= 0, 'ArrowDown moves through items');
		await page.keyboard.press('Escape');
		await page.waitForTimeout(150);
		ok(await page.evaluate(() => !document.querySelector('.menu-dropdown')), 'Escape closes the menu');
		ok((await active()).indexOf('Insert') >= 0, 'Escape returns focus to the title');
	}

	// menubar checkbox semantics (View > Dark mode)
	const checked = await page.evaluate(() => {
		Array.from(document.querySelectorAll('.menu-title')).find(t => t.textContent === 'View').click();
		const item = Array.from(document.querySelectorAll('.menu-item')).find(i => i.textContent.indexOf('Dark mode') >= 0);
		const out = item && { role: item.getAttribute('role'), checked: item.getAttribute('aria-checked') };
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		return out;
	});
	ok(checked && checked.role === 'menuitemcheckbox' && checked.checked === 'false',
		'Dark mode is an unchecked menuitemcheckbox');
	await page.keyboard.press('Escape');

	// ---- shortcuts panel dialog: trap + restore ----
	await page.evaluate(() => {
		Array.from(document.querySelectorAll('.menu-title')).find(t => t.textContent === 'Help').click();
		Array.from(document.querySelectorAll('.menu-item')).find(i => i.textContent.indexOf('Keyboard') === 0).click();
	});
	await page.waitForTimeout(200);
	ok(await page.evaluate(() => {
		const p = document.querySelector('.panel-overlay .panel');
		return p && p.getAttribute('role') === 'dialog' && p.contains(document.activeElement);
	}), 'shortcuts panel is a dialog holding focus');
	await axeScan('shortcuts panel');
	await page.keyboard.press('Escape');
	await page.waitForTimeout(150);
	ok(await page.evaluate(() => !document.querySelector('.panel-overlay')), 'Escape closes the panel');

	// ---- toolbar: focused button activates, no map hijack ----
	const nodesBefore = await page.evaluate(() => document.querySelectorAll('.mapjs-node').length);
	await page.evaluate(() => { document.querySelectorAll('.tb-btn')[3].focus(); }); // undo
	await page.keyboard.press('Enter');
	await page.waitForTimeout(250);
	ok(await page.evaluate(() => document.querySelectorAll('.mapjs-node').length) === nodesBefore,
		'Enter on a focused toolbar button does not add map nodes');
	const tb = await page.evaluate(() => {
		const b = document.querySelector('.tb-btn'), s = b.querySelector('svg');
		return { label: b.getAttribute('aria-label'), hidden: s.getAttribute('aria-hidden') };
	});
	ok(!!tb.label && tb.hidden === 'true', 'toolbar buttons labelled, icons aria-hidden');

	// ---- map scope: philmaps keys still work; focus is visible ----
	const claim = await page.evaluate(() => {
		const nodes = Array.from(document.querySelectorAll('.mapjs-node'))
			.filter(n => !n.className.includes('attr_group') && !n.className.includes('level_1'));
		const r = nodes[0].getBoundingClientRect();
		return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
	});
	await page.mouse.click(claim.x, claim.y);
	await page.waitForTimeout(250);
	const n0 = await page.evaluate(() => document.querySelectorAll('.mapjs-node').length);
	await page.keyboard.press('Tab'); // co-premise (opens its inline editor)
	await page.waitForTimeout(350);
	await page.keyboard.press('Escape'); // leave the editor
	await page.waitForTimeout(250);
	const n1 = await page.evaluate(() => document.querySelectorAll('.mapjs-node').length);
	ok(n1 === n0 + 1, 'Tab on a claim in the map still adds a co-premise');
	await page.keyboard.press('Enter'); // reason under the selection
	await page.waitForTimeout(350);
	await page.keyboard.press('Escape');
	await page.waitForTimeout(250);
	ok(await page.evaluate(() => document.querySelectorAll('.mapjs-node').length) > n1,
		'Enter in the map still adds a reason');
	// arrows move the SELECTION while the container keeps DOM focus
	// (activedescendant pattern) — the visible indicator must sit on the
	// selected node whenever the container is focused
	await page.evaluate(() => document.getElementById('map-container').focus());
	await page.keyboard.press('ArrowRight');
	await page.waitForTimeout(250);
	const nodeOutline = await page.evaluate(() => {
		if (document.activeElement !== document.getElementById('map-container')) { return 'container-not-focused'; }
		const el = document.querySelector('.mapjs-node.a11y-keyboard-selected');
		if (!el) { return 'no-marked-node'; }
		const c = getComputedStyle(el);
		return c.outlineStyle + ' ' + c.outlineWidth;
	});
	ok(/solid/.test(nodeOutline), 'keyboard selection shows a visible outline (' + nodeOutline + ')');
	// and the indicator leaves with container focus
	await page.evaluate(() => document.getElementById('map-container').blur());
	ok(await page.evaluate(() => !document.querySelector('.a11y-keyboard-selected')),
		'indicator clears when the map loses focus');
	// selection state is exposed
	ok(await page.evaluate(() => {
		const id = window.__because.engine.mapModel.getSelectedNodeId();
		const el = document.getElementById(('node_' + id).replace(/[^A-Za-z0-9_-]/g, '_'));
		return el && el.getAttribute('aria-selected') === 'true';
	}), 'selected node exposes aria-selected');

	// ---- node style popover: focus managed, states exposed ----
	await page.evaluate(() => window.__because.nodeStyle.openForSelection());
	await page.waitForTimeout(200);
	ok(await page.evaluate(() => {
		const p = document.querySelector('.node-style-popover');
		return p && p.getAttribute('role') === 'dialog' && p.contains(document.activeElement);
	}), 'style popover is a dialog holding focus');
	ok(await page.evaluate(() =>
		document.querySelectorAll('.node-style-popover [aria-pressed]').length > 0),
		'swatches expose pressed state');
	await axeScan('node style popover');
	await page.keyboard.press('Escape');
	await page.waitForTimeout(150);
	ok(await page.evaluate(() => !document.querySelector('.node-style-popover')), 'Escape closes the popover');

	// ---- keyboard path for connector strength ----
	const width = await page.evaluate(() => {
		const m = window.__because.engine.mapModel;
		// v3 .mup: the content root wraps the conclusion; groups sit deeper —
		// walk down to the first bracket group and take a claim inside it
		const firstGroup = function (idea) {
			for (const k of Object.keys(idea.ideas || {})) {
				const child = idea.ideas[k];
				if (child.attr && child.attr.group) { return child; }
				const found = firstGroup(child);
				if (found) { return found; }
			}
			return null;
		};
		const group = firstGroup(m.getIdea());
		const claimNode = Object.values(group.ideas)[0];
		m.selectNode(claimNode.id);
		// the width write lands on the group's own parent connector
		const parent = m.getIdea().findParent(group.id) || m.getIdea();
		const domId = ('connector_' + parent.id + '_' + group.id).replace(/[^A-Za-z0-9_-]/g, '_');
		const pathOf = () => document.getElementById(domId).querySelector('path.mapjs-connector');
		const before = pathOf().getAttribute('stroke-width');
		window.__because.labelEdit.strongerSelectedConnector();
		return { before, after: pathOf().getAttribute('stroke-width') };
	});
	ok(parseFloat(width.after) > parseFloat(width.before),
		'Stronger connector works from the keyboard path (' + width.before + ' -> ' + width.after + ')');

	// ---- unsaved-changes guard dialog ----
	await page.evaluate(() => { window.__because.io.markDirty(); window.__because.io.open(); });
	await page.waitForTimeout(250);
	ok(await page.evaluate(() => {
		const p = document.querySelector('.panel-overlay .panel');
		const a = document.activeElement;
		return p && p.getAttribute('role') === 'dialog' && a && a.dataset && a.dataset.act === 'save';
	}), 'unsaved guard focuses Save');
	await page.keyboard.press('Escape');
	await page.waitForTimeout(150);
	ok(await page.evaluate(() => !document.querySelector('.panel-overlay') && window.__because.io.isDirty()),
		'Escape cancels the guard, map stays dirty');

	// ---- dark mode ----
	await page.evaluate(() => window.__because.darkMode.toggle());
	await page.waitForTimeout(400);
	await axeScan('map, dark mode');
	ok(await page.evaluate(() => getComputedStyle(document.getElementById('save-status')).color) === 'rgb(162, 169, 176)',
		'dark save status contrast color applied');

	// ---- reflow: narrow viewport keeps chrome usable ----
	await page.setViewportSize({ width: 640, height: 800 });
	await page.waitForTimeout(400);
	const reflow = await page.evaluate(() => ({
		bodyScroll: document.body.scrollWidth <= window.innerWidth + 1,
		toolbarVisible: document.querySelectorAll('#toolbar .tb-btn').length ===
			Array.from(document.querySelectorAll('#toolbar .tb-btn'))
				.filter(b => b.getBoundingClientRect().right <= window.innerWidth + 1 && b.getBoundingClientRect().width > 0).length
	}));
	ok(reflow.bodyScroll, 'no horizontal body overflow at 640px');
	ok(reflow.toolbarVisible, 'every toolbar button visible at 640px');

	ok(errors.length === 0, 'no page errors (' + errors.join('; ').slice(0, 200) + ')');
	await browser.close();
	console.log(failures ? 'FAILURES: ' + failures : 'ALL PASS');
	process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
