// WCAG 2.2 AA regression gate, in WebKit (the Safari rule): axe-core
// scans of every chrome state must come back clean, and the keyboard
// model must hold — Tab walks the chrome, the menubar is a real ARIA
// menubar, dialogs trap and restore focus, and the philmaps keys still
// work with focus in the map. Expects `python3 -m http.server 8871`
// at the repo root (same as the other suites).
const { webkit, chromium } = require('playwright-core');
const { resolveChrome } = require('./chrome-path');
const fs = require('fs');
const path = require('path');
const axeSource = fs.readFileSync(path.join(__dirname, 'node_modules', 'axe-core', 'axe.min.js'), 'utf8');
const BASE = process.env.BASE || 'http://127.0.0.1:8871';
const MODE = process.env.BECAUSE_E2E_BROWSER || 'all';
const RUN_WEBKIT = MODE !== 'chrome';
const RUN_CHROME = MODE !== 'webkit';
const CHROME = RUN_CHROME ? resolveChrome() : null;
let failures = 0;
const ok = (cond, name) => { console.log((cond ? 'PASS ' : 'FAIL ') + name); if (!cond) { failures += 1; } };

const AXE_OPTS = {
	runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }
};

(async () => {
	if (RUN_WEBKIT) {
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
	// roving focus: the container delegates to the selected claim, so the
	// skip link lands REAL focus on a treeitem (what a screen reader reads)
	ok((await active()).indexOf('mapjs-node') >= 0, 'skip link focuses the selected claim');

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
	// the platform switch is a real toggle pair, reachable and reported
	ok(await page.evaluate(() => {
		const group = document.querySelector('.plat-switch'),
			btns = group && Array.from(group.querySelectorAll('.plat-btn'));
		return !!group && group.getAttribute('role') === 'group' &&
			!!group.getAttribute('aria-label') && btns.length === 2 &&
			btns.every(b => b.getAttribute('aria-pressed') === 'true' || b.getAttribute('aria-pressed') === 'false') &&
			btns.filter(b => b.getAttribute('aria-pressed') === 'true').length === 1;
	}), 'the platform switch is a labelled group of two aria-pressed buttons');
	await axeScan('shortcuts panel');
	// and again in dark mode: the switch introduces its own colours
	await page.evaluate(() => document.body.classList.add('dark'));
	await page.waitForTimeout(150);
	await axeScan('shortcuts panel, dark');
	await page.evaluate(() => document.body.classList.remove('dark'));
	await page.keyboard.press('Escape');
	await page.waitForTimeout(150);
	ok(await page.evaluate(() => !document.querySelector('.panel-overlay')), 'Escape closes the panel');
	// focus comes back to the map — on the selected node, since the engine
	// hands focus to it as soon as the map has focus again
	ok(await page.evaluate(() => {
		const map = document.getElementById('map-container'),
			a = document.activeElement;
		return !!a && a !== document.body && (a === map || map.contains(a) || a.classList.contains('menu-title'));
	}), 'closing the reference returns focus to the map, not the page body');

	// ---- ? from the map opens the same dialog (map-scoped, WCAG 2.1.4) ----
	await page.evaluate(() => document.getElementById('map-container').focus());
	await page.keyboard.press('Shift+Slash');
	await page.waitForTimeout(300);
	ok(await page.evaluate(() => !!document.querySelector('.shortcuts-panel')),
		'? from the map opens the keyboard reference');
	await page.keyboard.press('Escape');
	await page.waitForTimeout(200);
	// with focus in the chrome the same character must be free (a single
	// character shortcut may only act while its component has focus)
	await page.evaluate(() => document.querySelector('.menu-title').focus());
	await page.keyboard.press('Shift+Slash');
	await page.waitForTimeout(250);
	ok(await page.evaluate(() => !document.querySelector('.shortcuts-panel')),
		'? does nothing with focus in the menubar');

	// ---- toolbar: focused button activates, no map hijack ----
	const nodesBefore = await page.evaluate(() => document.querySelectorAll('.mapjs-node').length);
	// by name, not by index: the rail and the classic bar order their groups
	// differently, and index 3 is Add objection in the rail
	await page.evaluate(() => {
		document.querySelector('#toolbar .tb-btn[aria-label^="Undo"]').focus();
	});
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
	// Count what the map holds, not what the stage still shows, and count it
	// while the new node is still there: Escape cancels a node that was only
	// just created, so it is gone by the time the editor closes. Counting DOM
	// elements after Escape used to work only because the cancelled node's
	// element lingered on the stage (see the stale-badge section of
	// features-e2e — it could linger for good).
	const mapNodes = () => page.evaluate(() =>
		Object.keys(window.__because.engine.mapModel.getCurrentLayout().nodes).length);
	const n0 = await mapNodes();
	await page.keyboard.press('Tab'); // co-premise (opens its inline editor)
	await page.waitForTimeout(350);
	const n1 = await mapNodes();
	ok(n1 === n0 + 1, `Tab on a claim in the map still adds a co-premise (${n0} -> ${n1})`);
	await page.keyboard.press('Escape'); // cancelling an untyped new node takes it back
	await page.waitForTimeout(250);
	ok(await mapNodes() === n0, 'and Escape takes the untyped co-premise back off the map');
	await page.keyboard.press('Enter'); // reason under the selection: a bracket and a claim
	await page.waitForTimeout(350);
	const n2 = await mapNodes();
	ok(n2 === n0 + 2, `Enter in the map still adds a reason (${n0} -> ${n2})`);
	await page.keyboard.press('Escape');
	await page.waitForTimeout(250);
	// arrows move the selection AND real DOM focus rides along on the
	// selected node (roving focus — the activedescendant indirection is
	// what NVDA+Chrome failed to follow); the visible indicator sits on
	// the focused node
	await page.evaluate(() => document.getElementById('map-container').focus());
	await page.keyboard.press('ArrowRight');
	await page.waitForTimeout(250);
	// real DOM focus rides the selected node (roving focus — this is what a
	// screen reader follows); the VISIBLE indicator is the node's own theme
	// "activated" border, dotted+3px, not a separate drawn outline
	const focusState = await page.evaluate(() => {
		const id = window.__because.engine.mapModel.getSelectedNodeId();
		const el = document.getElementById(('node_' + id).replace(/[^A-Za-z0-9_-]/g, '_'));
		if (!el) { return { err: 'no-el-for-selection' }; }
		const c = getComputedStyle(el);
		return {
			focusRides: document.activeElement === el,
			borderStyle: c.borderTopStyle, borderWidth: c.borderTopWidth, borderColor: c.borderTopColor,
			outlineStyle: c.outlineStyle
		};
	});
	ok(focusState.focusRides, 'keyboard focus rides the selected node (roving focus)');
	// the border is 3px and dotted (explicit) or dashed (implicit) — the style
	// itself carries the claim's state, which is the whole point of using it
	ok((focusState.borderStyle === 'dotted' || focusState.borderStyle === 'dashed') &&
		focusState.borderWidth === '3px' && focusState.borderColor !== 'rgba(0, 0, 0, 0)',
		'the selection indicator is the 3px activated border (' + focusState.borderStyle + ' ' + focusState.borderWidth + ')');
	// single indicator: no solid ring is drawn on top of that border
	ok(focusState.outlineStyle !== 'solid',
		'no second solid outline is layered over the activated border (outline: ' + focusState.outlineStyle + ')');
	// the border is a SELECTION cue, so it persists when focus leaves the map
	// (unlike the old ring), keeping the current selection visible
	await page.evaluate(() => document.activeElement && document.activeElement.blur());
	await page.waitForTimeout(100);
	ok(await page.evaluate(() => {
		const id = window.__because.engine.mapModel.getSelectedNodeId();
		const el = document.getElementById(('node_' + id).replace(/[^A-Za-z0-9_-]/g, '_'));
		const s = el && getComputedStyle(el).borderTopStyle;
		return s === 'dotted' || s === 'dashed';
	}), 'the selection border stays after the map loses focus');
	// selection state is exposed
	ok(await page.evaluate(() => {
		const id = window.__because.engine.mapModel.getSelectedNodeId();
		const el = document.getElementById(('node_' + id).replace(/[^A-Za-z0-9_-]/g, '_'));
		return el && el.getAttribute('aria-selected') === 'true';
	}), 'selected node exposes aria-selected');

	// ---- connector labels are announced as the map is walked ----
	// The label is drawn in the SVG layer, which is aria-hidden here, so a
	// reader moving through the map with the arrow keys heard nothing of it
	// (NVDA report, 2026-08-03: audible while being typed, silent afterwards).
	// A bracket's name is ours to write, so the label joins it; a claim's name
	// is the claim's own text, so a claim's label rides in a description.
	const connIds = await page.evaluate(() => {
		const m = window.__because.engine.mapModel,
			firstGroup = function (idea) {
				for (const k of Object.keys(idea.ideas || {})) {
					const c = idea.ideas[k];
					if (c.attr && c.attr.group) { return c; }
					const found = firstGroup(c);
					if (found) { return found; }
				}
				return null;
			},
			group = firstGroup(m.getIdea());
		return { group: group.id, claim: Object.values(group.ideas)[0].id };
	});
	const nodeA11y = id => page.evaluate(function (i) {
		const el = document.getElementById(('node_' + i).replace(/[^A-Za-z0-9_-]/g, '_')),
			d = el && el.getAttribute('aria-describedby'),
			span = d && document.getElementById(d);
		return { label: el && el.getAttribute('aria-label'), desc: span && span.textContent,
			clipped: !!span && getComputedStyle(span.parentNode).position === 'absolute' };
	}, id);
	ok((await nodeA11y(connIds.group)).label === 'Supporting reasons (group)',
		'an unlabelled bracket keeps its plain name');
	await page.evaluate(function (ids) {
		const content = window.__because.engine.mapModel.getIdea();
		content.mergeAttrProperty(ids.group, 'parentConnector', 'label', 'Because');
		content.mergeAttrProperty(ids.claim, 'parentConnector', 'label', 'and');
	}, connIds);
	await page.waitForTimeout(400);
	const labelled = await nodeA11y(connIds.group),
		described = await nodeA11y(connIds.claim);
	ok(labelled.label === 'Supporting reasons (group), labelled Because',
		`a bracket's connector label joins its accessible name (${labelled.label})`);
	ok(described.desc === 'Connector labelled and' && described.clipped,
		`a claim's connector label rides in a visually-hidden description (${described.desc})`);
	await axeScan('map with connector labels');
	// clearing the label takes both back, rather than leaving a stale name
	await page.evaluate(function (ids) {
		const content = window.__because.engine.mapModel.getIdea();
		content.mergeAttrProperty(ids.group, 'parentConnector', 'label', false);
		content.mergeAttrProperty(ids.claim, 'parentConnector', 'label', false);
	}, connIds);
	await page.waitForTimeout(400);
	ok((await nodeA11y(connIds.group)).label === 'Supporting reasons (group)' &&
		(await nodeA11y(connIds.claim)).desc === null,
	'clearing a label takes the announcement with it');

	// ---- Escape leaves the map (WCAG 2.1.2) ----
	// Tab inside the map is the co-premise key and so cannot also be the way
	// out, which left the browser's own F6 as the only exit — not something a
	// reader can be expected to find. Escape is the exit, and both the
	// keyboard reference and the canvas's own description say so.
	ok(await page.evaluate(() => {
		const c = document.getElementById('map-container'),
			d = c.getAttribute('aria-describedby'),
			hint = d && document.getElementById(d);
		return !!hint && /Escape/.test(hint.textContent);
	}), 'the map canvas describes its own way out');
	await page.evaluate(() => {
		window.__because.engine.mapModel.selectNode(window.__because.engine.mapModel.getSelectedNodeId());
		document.getElementById('map-container').focus();
	});
	await page.waitForTimeout(200);
	ok(await page.evaluate(() => {
		const c = document.getElementById('map-container');
		return c.contains(document.activeElement);
	}), 'focus starts inside the map');
	const serializedBeforeEscape = await page.evaluate(() => window.__because.engine.serialize());
	await page.keyboard.press('Escape');
	await page.waitForTimeout(200);
	const afterEscape = await page.evaluate(() => {
		const c = document.getElementById('map-container'), a = document.activeElement;
		return { inMap: c === a || c.contains(a), onBody: a === document.body,
			name: (a.getAttribute('aria-label') || a.textContent || '').slice(0, 20),
			cls: a.className.toString() };
	});
	ok(!afterEscape.inMap && !afterEscape.onBody,
		`Escape moves focus out of the map and onto a real control (${afterEscape.cls} "${afterEscape.name}")`);
	ok(afterEscape.cls.indexOf('menu-title') >= 0,
		'…the app menu, where every command is reachable');
	ok(await page.evaluate(() => window.__because.engine.serialize()) === serializedBeforeEscape,
		'leaving the map changes no map data');
	// and Tab carries on through the chrome from there, rather than starting over
	await page.keyboard.press('Tab');
	await page.waitForTimeout(150);
	ok(await page.evaluate(() => document.getElementById('toolbar').contains(document.activeElement)),
		'Tab from there walks on into the toolbar');
	// with focus in the chrome Escape is free again — it belongs to whatever
	// is open there (a menu, a dialog), not to the map
	await page.evaluate(() => document.querySelector('.menu-title').focus());
	await page.keyboard.press('Escape');
	await page.waitForTimeout(150);
	ok(await page.evaluate(() => document.activeElement.classList.contains('menu-title')),
		'Escape in the chrome does not bounce focus around');

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

	// ---- claim number editor: named, focused, and hands focus back ----
	await page.evaluate(() => {
		const m = window.__because.engine.mapModel,
			firstClaim = function (idea) {
				for (const k of Object.keys(idea.ideas || {})) {
					const child = idea.ideas[k];
					if (!(child.attr && child.attr.group)) { return child; }
					const found = firstClaim(child);
					if (found) { return found; }
				}
				return null;
			};
		m.selectNode(firstClaim(m.getIdea()).id);
		window.__because.numberEdit.editSelectedNumber();
	});
	await page.waitForTimeout(250);
	ok(await page.evaluate(() => {
		const e = document.querySelector('.node-number-editor');
		return !!e && document.activeElement === e && e.getAttribute('aria-label') === 'Claim number';
	}), 'the claim number editor opens focused and named');
	await axeScan('claim number editor');
	await page.keyboard.press('Escape');
	await page.waitForTimeout(250);
	ok(await page.evaluate(() => {
		const c = document.getElementById('map-container');
		return !document.querySelector('.node-number-editor') &&
			(document.activeElement === c || c.contains(document.activeElement));
	}), 'closing the number editor returns focus to the map');

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

	// ---- print options dialog ----
	await page.evaluate(() => window.__because.print.open());
	await page.waitForTimeout(250);
	ok(await page.evaluate(() => {
		const p = document.querySelector('.print-panel'),
			a = document.activeElement;
		return p && p.getAttribute('role') === 'dialog' && p.getAttribute('aria-modal') === 'true' &&
			a && a.dataset && a.dataset.act === 'save';
	}), 'print dialog is a modal dialog focusing Print');
	// each choice is a named radio group, so a screen reader announces what
	// is being chosen and arrow keys move within it
	ok(await page.evaluate(() => {
		const sets = Array.from(document.querySelectorAll('.print-panel fieldset'));
		return sets.length === 2 && sets.every(s => !!s.querySelector('legend') &&
			s.querySelectorAll('input[type=radio]').length >= 2 &&
			s.querySelectorAll('label input').length === s.querySelectorAll('input').length);
	}), 'both choices are legend-labelled radio groups with labelled options');
	// with the warning colour showing: a map too big to print legibly at
	// page size is the only extra colour this dialog introduces
	await page.evaluate(() => document.querySelector('.print-hint').classList.add('print-warn'));
	await axeScan('print dialog');
	await page.evaluate(() => document.body.classList.add('dark'));
	await page.waitForTimeout(150);
	await axeScan('print dialog, dark');
	await page.evaluate(() => document.body.classList.remove('dark'));
	// picking the map-sized page disables the orientation group rather than
	// leaving a control that does nothing
	await page.evaluate(() => {
		const map = document.querySelector('.print-panel input[value=map]');
		map.checked = true;
		map.dispatchEvent(new Event('change', { bubbles: true }));
	});
	await page.waitForTimeout(150);
	ok(await page.evaluate(() =>
		document.querySelectorAll('.print-panel fieldset')[1].disabled),
		'a page cut to the map disables the orientation group');
	await page.keyboard.press('Escape');
	await page.waitForTimeout(150);
	ok(await page.evaluate(() => !document.querySelector('.print-panel')),
		'Escape closes the print dialog');
	await page.evaluate(() => window.__because.print.setOptions({ fit: 'page', orientation: 'auto' }));

	// ---- dark mode ----
	await page.evaluate(() => window.__because.darkMode.toggle());
	await page.waitForTimeout(400);
	await axeScan('map, dark mode');
	ok(await page.evaluate(() => getComputedStyle(document.getElementById('save-status')).color) === 'rgb(162, 169, 176)',
		'dark save status contrast color applied');

	// ---- left rail: a labelled toolbar landmark with a visible focus ring ----
	await page.evaluate(() => window.__because.darkMode.toggle()); // back to light
	await page.waitForTimeout(300);
	const rail = await page.evaluate(() => {
		const t = document.getElementById('toolbar');
		return {
			mode: window.__because.layout.getLayout(),
			role: t.getAttribute('role'),
			label: t.getAttribute('aria-label'),
			orientation: t.getAttribute('aria-orientation'),
			themeAtFoot: t.lastElementChild.id,
			allNamed: Array.from(t.querySelectorAll('.tb-btn'))
				.every(b => !!b.getAttribute('aria-label') && b.querySelector('svg[aria-hidden=true]'))
		};
	});
	ok(rail.mode === 'left' && rail.role === 'toolbar' && rail.label === 'Editing toolbar' &&
		rail.orientation === 'vertical',
		`the default rail is a labelled vertical toolbar (${rail.role}/${rail.orientation})`);
	ok(rail.themeAtFoot === 'theme-toggle' && rail.allNamed,
		'the theme toggle sits at the rail foot and every rail button is named');
	// Tab must reach the rail, and keyboard focus must be visible on it
	await page.evaluate(() => { if (document.activeElement) { document.activeElement.blur(); } });
	await page.keyboard.press('Tab'); // skip link
	await page.keyboard.press('Tab'); // menubar (one roving stop)
	await page.keyboard.press('Tab'); // first rail button
	const railFocus = await page.evaluate(() => {
		const a = document.activeElement, c = getComputedStyle(a);
		return {
			inRail: document.getElementById('toolbar').contains(a),
			name: a.getAttribute('aria-label'),
			style: c.outlineStyle, width: c.outlineWidth, color: c.outlineColor
		};
	});
	ok(railFocus.inRail, `the third Tab stop is a rail button (${railFocus.name})`);
	ok(railFocus.style === 'solid' && parseFloat(railFocus.width) >= 2 &&
		railFocus.color === 'rgb(22, 116, 159)',
		`rail buttons draw a focus-visible ring (${railFocus.style} ${railFocus.width} ${railFocus.color})`);
	// The rail is ONE Tab stop with the arrows moving inside it (the WAI-ARIA
	// toolbar pattern its role=toolbar promises). The explicit tabindex that
	// pattern puts on the roving button is also the only reason Tab reaches
	// this strip in WebKit at all: Safari leaves a <button> out of the
	// sequential focus order unless it carries one, so before this the whole
	// rail was unreachable by keyboard here and the two assertions above failed.
	ok(await page.evaluate(() =>
		Array.from(document.querySelectorAll('#toolbar button'))
			.filter(b => b.getAttribute('tabindex') === '0').length === 1),
		'the rail is a single Tab stop, not one per button');
	const railArrows = [];
	for (const key of ['ArrowDown', 'ArrowDown', 'ArrowUp', 'End', 'Home']) {
		await page.keyboard.press(key);
		await page.waitForTimeout(80);
		railArrows.push(await page.evaluate(() => {
			const a = document.activeElement;
			return (document.getElementById('toolbar').contains(a) ? '' : '!') +
				a.getAttribute('aria-label');
		}));
	}
	// down, down, up, End, Home from the first button: two steps in, one back
	// to where the first step landed, then the foot of the rail and the head
	ok(railArrows.every(n => n.charAt(0) !== '!') &&
		railArrows[0] !== railArrows[1] && railArrows[2] === railArrows[0] &&
		railArrows[3] === 'Switch to dark mode' && railArrows[4] === 'Undo (⌘Z)',
		`arrows, Home and End move within the rail (${railArrows.join(' → ')})`);
	// and Tab still leaves it, rather than trapping focus in the strip
	await page.keyboard.press('Tab');
	await page.waitForTimeout(150);
	ok(await page.evaluate(() => !document.getElementById('toolbar').contains(document.activeElement)),
		'Tab moves on out of the rail instead of trapping focus');

	// ---- floating layout: axe clean, and the flyout is a real menu button ----
	await page.evaluate(() => window.__because.layout.setLayout('floating'));
	await page.waitForTimeout(400);
	await axeScan('floating layout, light');
	await page.evaluate(() => window.__because.darkMode.toggle());
	await page.waitForTimeout(300);
	await axeScan('floating layout, dark');
	await page.evaluate(() => window.__because.darkMode.toggle());
	await page.waitForTimeout(300);

	const trigger = await page.evaluate(() => {
		const b = document.getElementById('float-menu');
		return { haspopup: b.getAttribute('aria-haspopup'), expanded: b.getAttribute('aria-expanded'),
			name: b.getAttribute('aria-label') };
	});
	ok(trigger.haspopup === 'menu' && trigger.expanded === 'false' && trigger.name === 'Menu',
		`the flyout trigger follows the menu-button pattern (${trigger.haspopup}/${trigger.expanded})`);
	await page.evaluate(() => document.getElementById('float-menu').focus());
	await page.keyboard.press('Enter');
	await page.waitForTimeout(250);
	const opened = await page.evaluate(() => {
		const panel = document.querySelector('.menu-flyout'), a = document.activeElement;
		return panel && {
			role: panel.getAttribute('role'),
			expanded: document.getElementById('float-menu').getAttribute('aria-expanded'),
			onFirstRow: a === panel.querySelector('.menu-flyrow'),
			itemRole: a.getAttribute('role'), name: a.textContent
		};
	});
	ok(!!opened && opened.role === 'menu' && opened.expanded === 'true',
		'Enter on the trigger opens the panel and sets aria-expanded');
	ok(opened && opened.onFirstRow && opened.itemRole === 'menuitem',
		`Enter focuses the first menuitem (${opened && opened.name})`);
	await page.keyboard.press('ArrowRight');
	await page.waitForTimeout(250);
	const cascaded = await page.evaluate(() => {
		const sub = document.querySelector('.menu-flysub'), a = document.activeElement;
		return sub && {
			role: sub.getAttribute('role'), label: sub.getAttribute('aria-label'),
			rowExpanded: document.querySelector('.menu-flyrow').getAttribute('aria-expanded'),
			onFirstItem: a === sub.querySelector('.menu-item'), name: a.textContent
		};
	});
	ok(!!cascaded && cascaded.role === 'menu' && cascaded.label === 'File' &&
		cascaded.rowExpanded === 'true',
		'ArrowRight opens the submenu and marks its row expanded');
	ok(cascaded && cascaded.onFirstItem, `and focuses the submenu's first item (${cascaded && cascaded.name})`);
	await axeScan('floating flyout, cascaded');
	await page.keyboard.press('Escape');
	await page.waitForTimeout(200);
	ok(await page.evaluate(() => !document.querySelector('.menu-flysub') &&
		!!document.querySelector('.menu-flyout') &&
		document.activeElement === document.querySelector('.menu-flyrow')),
		'Escape closes just the submenu and returns focus to its row');
	await page.keyboard.press('Escape');
	await page.waitForTimeout(200);
	ok(await page.evaluate(() => !document.querySelector('.menu-flyout') &&
		document.activeElement === document.getElementById('float-menu') &&
		document.getElementById('float-menu').getAttribute('aria-expanded') === 'false'),
		'a second Escape closes the flyout and returns focus to the trigger');
	// this layout has no menubar at all, so the exit from the map has to fall
	// through to the one button the same menu spec hangs behind
	await page.evaluate(() => document.getElementById('map-container').focus());
	await page.waitForTimeout(200);
	await page.keyboard.press('Escape');
	await page.waitForTimeout(200);
	ok(await page.evaluate(() => document.activeElement === document.getElementById('float-menu')),
		'in the floating layout Escape leaves the map for the menu button');
	await page.evaluate(() => window.__because.layout.setLayout('left'));
	await page.waitForTimeout(300);

	// ---- reflow: narrow viewport keeps chrome usable ----
	// below 720px every layout reflows to the mobile bars, so "the toolbar"
	// at this width IS the bottom command bar
	await page.setViewportSize({ width: 640, height: 800 });
	await page.waitForTimeout(400);
	const reflow = await page.evaluate(() => ({
		bodyScroll: document.body.scrollWidth <= window.innerWidth + 1,
		toolbarVisible: document.querySelectorAll('#mobilebar .mb-btn').length === 5 &&
			Array.from(document.querySelectorAll('#mobilebar .mb-btn'))
				.every(b => b.getBoundingClientRect().right <= window.innerWidth + 1 &&
					b.getBoundingClientRect().width >= 44 && b.getBoundingClientRect().height >= 44),
		named: Array.from(document.querySelectorAll('#mobilebar .mb-btn'))
			.every(b => b.textContent.trim().length > 0 &&
				(b.getAttribute('title') || '').toLowerCase().indexOf(b.textContent.trim().toLowerCase()) >= 0)
	}));
	ok(reflow.bodyScroll, 'no horizontal body overflow at 640px');
	ok(reflow.toolbarVisible, 'every bottom-bar button is visible and at least 44×44 at 640px');
	// no aria-label overrides these, so the accessible name IS the visible
	// label (WCAG 2.5.3 satisfied by construction); this checks the longer
	// tooltip stays consistent with the word actually shown
	ok(reflow.named, 'each bottom-bar label is a word of the tooltip it abbreviates');
	// the last rung of the exit's fallback chain: no menubar and no floating
	// menu button here either, so it has to land in the bottom bar
	await page.evaluate(() => document.getElementById('map-container').focus());
	await page.waitForTimeout(200);
	await page.keyboard.press('Escape');
	await page.waitForTimeout(200);
	ok(await page.evaluate(() =>
		document.getElementById('mobilebar').contains(document.activeElement)),
	'at 640px Escape leaves the map for the bottom bar');
	await axeScan('mobile layout');

	ok(errors.length === 0, 'no page errors (' + errors.join('; ').slice(0, 200) + ')');
	await browser.close();
	}

	// ---- NVDA proxy: Chromium's COMPUTED accessibility tree ----
	// The attributes checked above are what we author; a Windows screen
	// reader consumes the tree Chromium computes from them, which can
	// diverge (an NVDA user got "unknown invisible" from the old
	// activedescendant indirection while every DOM check here passed).
	// Real Chrome, real computed tree: focusing the map must land actual
	// focus on a NAMED treeitem — no indirection for the AT to follow.
	if (RUN_CHROME) {
	const cr = await chromium.launch({ executablePath: CHROME });
	const cpage = await cr.newPage({ viewport: { width: 1500, height: 950 } });
	await cpage.goto(BASE + '/app/index.html');
	await cpage.evaluate(() => localStorage.setItem('because.intro.dismissed', '1'));
	await cpage.goto(BASE + '/app/index.html?src=../samples/death.mup');
	await cpage.waitForSelector('.mapjs-node', { timeout: 8000 });
	await cpage.waitForTimeout(900);
	// label one connector of each kind first: the DOM attributes above are
	// what we author, and whether a label survives into the computed name or
	// description is exactly the sort of thing that diverges
	const cIds = await cpage.evaluate(() => {
		const m = window.__because.engine.mapModel,
			firstGroup = function (idea) {
				for (const k of Object.keys(idea.ideas || {})) {
					const c = idea.ideas[k];
					if (c.attr && c.attr.group) { return c; }
					const found = firstGroup(c);
					if (found) { return found; }
				}
				return null;
			},
			group = firstGroup(m.getIdea()),
			claim = Object.values(group.ideas)[0];
		m.getIdea().mergeAttrProperty(group.id, 'parentConnector', 'label', 'Because');
		m.getIdea().mergeAttrProperty(claim.id, 'parentConnector', 'label', 'and');
		m.selectNode(claim.id);
		return { group: group.id, claim: claim.id };
	});
	await cpage.evaluate(() => document.getElementById('map-container').focus());
	await cpage.waitForTimeout(400);
	const cdp = await cpage.context().newCDPSession(cpage);
	await cdp.send('Accessibility.enable');
	const axNodes = (await cdp.send('Accessibility.getFullAXTree')).nodes,
		axById = new Map(axNodes.map(n => [n.nodeId, n])),
		axTrees = axNodes.filter(n => n.role && n.role.value === 'tree'),
		axItems = axNodes.filter(n => n.role && n.role.value === 'treeitem'),
		domNodeCount = await cpage.evaluate(() => document.querySelectorAll('.mapjs-node').length);
	ok(axTrees.length === 1 && axTrees[0].name && axTrees[0].name.value === 'Argument map',
		'computed AX tree exposes one tree named "Argument map"');
	ok(axItems.length === domNodeCount && axItems.every(i => i.name && i.name.value),
		'every map node is a named treeitem in the computed AX tree (' +
			axItems.length + '/' + domNodeCount + ')');
	ok(axTrees.length === 1 && (axTrees[0].childIds || []).some(id => {
		const n = axById.get(id);
		return n && n.role && n.role.value === 'group';
	}), 'treeitems hang off a group child of the tree (required-children chain)');
	const axFocused = axNodes.filter(n =>
		(n.properties || []).some(p => p.name === 'focused' && p.value.value) &&
		n.role && n.role.value !== 'RootWebArea');
	ok(axFocused.length === 1 && axFocused[0].role.value === 'treeitem' &&
		axFocused[0].name && !!axFocused[0].name.value,
		'focusing the map lands real focus on a named treeitem (' +
			(axFocused.length ? axFocused.map(n => n.role.value).join(',') : 'none') + ')');
	// the connector labels, in the tree a Windows screen reader actually reads
	ok(axItems.some(i => i.name.value.indexOf('labelled Because') >= 0),
		'the bracket\'s connector label is in its COMPUTED name (' + cIds.group + ')');
	ok(axFocused.length === 1 && axFocused[0].description &&
		axFocused[0].description.value === 'Connector labelled and',
		'the claim\'s connector label is in its COMPUTED description (' +
			(axFocused[0] && axFocused[0].description && axFocused[0].description.value) + ')');
	ok(axTrees.length === 1 && axTrees[0].description &&
		/Escape/.test(axTrees[0].description.value),
		'the map\'s way out is in the tree\'s COMPUTED description');
	await cr.close();
	}

	console.log(failures ? 'FAILURES: ' + failures : 'ALL PASS');
	process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
