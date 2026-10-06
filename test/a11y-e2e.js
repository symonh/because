// WCAG 2.2 AA regression gate, in WebKit (the Safari rule): axe-core
// scans of every chrome state must come back clean, and the keyboard
// model must hold — Tab walks the chrome, the menubar is a real ARIA
// menubar, dialogs trap and restore focus, and the philmaps keys still
// work with focus in the map. Run through `npm test`, which serves the
// repo root, or set BASE.
const { webkit, chromium } = require('playwright-core');
const { chromePath } = require('./chrome-path');
const CHROME = chromePath();
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
	ok(labelled.label === 'Supporting reasons (group), labeled Because',
		`a bracket's connector label joins its accessible name (${labelled.label})`);
	ok(described.desc === 'Connector labeled and' && described.clipped,
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

	// ---- bold / italic / underline expose their state ----
	const formats = await page.evaluate(async () => {
		const m = window.__because.engine.mapModel,
			firstClaim = function (idea) {
				for (const k of Object.keys(idea.ideas || {})) {
					const child = idea.ideas[k];
					if (!(child.attr && child.attr.group)) { return child; }
					const found = firstClaim(child);
					if (found) { return found; }
				}
				return null;
			},
			id = firstClaim(m.getIdea()).id,
			original = m.findIdeaById(id).title,
			pressed = () => Object.fromEntries(Array.from(
				document.querySelectorAll('.node-style-popover .ns-format'))
				.map(b => [b.getAttribute('aria-label'), b.getAttribute('aria-pressed')])),
			wait = () => new Promise(r => setTimeout(r, 150));
		m.selectNode(id);
		m.updateTitle(id, 'Plain words');
		window.__because.nodeStyle.openForSelection();
		await wait();
		const plain = pressed();
		document.querySelector('.node-style-popover .ns-b').click();
		await wait();
		const bolded = pressed();
		window.__because.nodeStyle.close();
		m.updateTitle(id, '<b>Half</b> plain');
		window.__because.nodeStyle.openForSelection();
		await wait();
		const half = pressed();
		window.__because.nodeStyle.close();
		m.updateTitle(id, original);
		return { plain, bolded, half };
	});
	ok(JSON.stringify(Object.keys(formats.plain)) === '["Bold","Italic","Underline"]' &&
		Object.values(formats.plain).every(v => v === 'false'),
		'B, I and U are named Bold, Italic and Underline, unpressed on plain text (' + JSON.stringify(formats.plain) + ')');
	ok(formats.bolded.Bold === 'true' && formats.bolded.Italic === 'false',
		'pressing Bold reports it pressed (' + JSON.stringify(formats.bolded) + ')');
	ok(formats.half.Bold === 'mixed',
		'a partly bold claim reports Bold as mixed (' + JSON.stringify(formats.half) + ')');

	// ---- the inline claim editor is a named text box while it is open ----
	const claimEditor = await page.evaluate(async () => {
		document.getElementById('map-container').focus();
		window.__because.commands.editNode();
		await new Promise(r => setTimeout(r, 200));
		const ed = document.querySelector('[data-mapjs-role=title][contenteditable="true"]'),
			open = ed && {
				role: ed.getAttribute('role'),
				name: ed.getAttribute('aria-label'),
				focused: document.activeElement === ed
			};
		return open;
	});
	ok(claimEditor && claimEditor.role === 'textbox' && claimEditor.name === 'Claim text' && claimEditor.focused,
		'the claim editor opens as a focused text box named "Claim text" (' + JSON.stringify(claimEditor) + ')');
	await page.keyboard.press('Escape');
	await page.waitForTimeout(200);
	ok(await page.evaluate(() => !document.querySelector('[data-mapjs-role=title][role]')),
		'closing the editor takes the text-box role off the claim again');

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

	// the mobile flyout stacks its submenus ABOVE the panel, so the pointer
	// crosses the other rows on the way: hovering must not swap the submenu
	const stacked = await page.evaluate(async () => {
		const wait = ms => new Promise(r => setTimeout(r, ms)),
			trigger = document.querySelector('#mobilebar [aria-haspopup]');
		trigger.click();
		await wait(200);
		const rows = Array.from(document.querySelectorAll('.menu-flyrow'));
		rows[0].dispatchEvent(new MouseEvent('mouseenter'));
		await wait(100);
		const hoverOpened = !!document.querySelector('.menu-flysub');
		rows[2].click();
		await wait(150);
		const clicked = document.querySelector('.menu-flysub');
		const label = clicked && clicked.getAttribute('aria-label');
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		return { hoverOpened, label, rows: rows.map(r => r.textContent) };
	});
	ok(!stacked.hoverOpened && stacked.label === stacked.rows[2],
		`in the mobile flyout a submenu opens on click, not on hover (${JSON.stringify(stacked)})`);
	await page.keyboard.press('Escape');
	await page.keyboard.press('Escape');

	// ---- short window: a menu taller than the space below it scrolls ----
	await page.setViewportSize({ width: 960, height: 540 });
	await page.waitForTimeout(400);
	await page.evaluate(() => Array.from(document.querySelectorAll('.menu-title'))
		.find(t => t.textContent === 'File').focus());
	await page.keyboard.press('Enter');
	await page.waitForTimeout(200);
	await page.keyboard.press('End');
	await page.waitForTimeout(200);
	const shortMenu = await page.evaluate(() => {
		const m = document.querySelector('.menu-dropdown'), a = document.activeElement,
			r = a.getBoundingClientRect();
		return { scrolls: m.scrollHeight > m.clientHeight, last: a.textContent,
			inView: r.bottom <= window.innerHeight && r.top >= 0 };
	});
	ok(shortMenu.scrolls && /Print/.test(shortMenu.last) && shortMenu.inView,
		`at 960×540 the File menu scrolls and End brings its last item into view (${JSON.stringify(shortMenu)})`);
	await page.keyboard.press('Escape');
	await page.setViewportSize({ width: 1500, height: 950 });
	await page.waitForTimeout(400);

	// ---- reading order: the tree's levels and order describe the argument ----
	await page.goto(BASE + '/app/index.html?src=../samples/death.mup');
	await page.waitForSelector('.mapjs-node', { timeout: 8000 });
	await page.waitForTimeout(700);
	// what assistive technology infers: each treeitem's parent is the nearest
	// earlier item one level up. That must be the claim it really hangs from.
	const inferredParents = () => page.evaluate(() => {
		const m = window.__because.engine.mapModel,
			byId = new Map(),
			parentOf = new Map(),
			walk = function (idea, parent) {
				byId.set(String(idea.id), idea);
				Object.values(idea.ideas || {}).forEach(k => { parentOf.set(String(k.id), idea); walk(k, idea); });
			};
		walk(m.getIdea(), null);
		const items = Array.from(document.querySelectorAll('[data-mapjs-role=stage] > [role=treeitem]'))
				.filter(el => getComputedStyle(el).opacity !== '0'),
			idOf = el => el.id.replace(/^node_/, ''),
			stack = [],
			wrong = [];
		items.forEach(function (el) {
			const level = Number(el.getAttribute('aria-level'));
			stack.length = level - 1;
			const inferred = level > 1 ? stack[level - 2] : null;
			let real = parentOf.get(idOf(el));
			while (real && !document.getElementById(('node_' + real.id).replace(/[^A-Za-z0-9_-]/g, '_'))) {
				real = parentOf.get(String(real.id));
			}
			const realId = real ? String(real.id) : null;
			if ((inferred ? idOf(inferred) : null) !== realId) { wrong.push(el.textContent.slice(0, 30)); }
			stack[level - 1] = el;
		});
		return { count: items.length, wrong };
	});
	let order = await inferredParents();
	ok(order.count > 3 && order.wrong.length === 0,
		`as loaded, every treeitem's level and position name its real parent (${JSON.stringify(order)})`);
	await page.evaluate(async () => {
		const m = window.__because.engine.mapModel, wait = ms => new Promise(r => setTimeout(r, ms)),
			conclusion = Object.values(m.getIdea().ideas)[0];
		m.selectNode(conclusion.id);
		document.getElementById('map-container').focus();
		window.__because.commands.addObjection();
		await wait(300);
		document.activeElement.textContent = 'An objection added later';
		document.activeElement.blur();
		await wait(300);
		const premise = Object.values(Object.values(conclusion.ideas)[0].ideas)[0];
		m.selectNode(premise.id);
		window.__because.commands.addReason();
		await wait(300);
		document.activeElement.textContent = 'A sub-reason added later';
		document.activeElement.blur();
		await wait(600);
	});
	order = await inferredParents();
	ok(order.wrong.length === 0,
		`after adding an objection and then a sub-reason, the order still names every real parent (${JSON.stringify(order)})`);
	ok(await page.evaluate(() => {
		const a = document.activeElement;
		return a && a.getAttribute('role') === 'treeitem' && a.textContent.indexOf('A sub-reason added later') >= 0;
	}), 'resequencing leaves focus on the claim just written');

	// ---- a claim's state is spoken, not just drawn ----
	const states = await page.evaluate(async () => {
		const m = window.__because.engine.mapModel, wait = ms => new Promise(r => setTimeout(r, ms)),
			conclusion = Object.values(m.getIdea().ideas)[0],
			premise = Object.values(Object.values(conclusion.ideas)[0].ideas)[0],
			el = () => document.getElementById(('node_' + premise.id).replace(/[^A-Za-z0-9_-]/g, '_')),
			desc = () => {
				const id = el().getAttribute('aria-describedby');
				return id ? document.getElementById(id).textContent : '';
			};
		m.selectNode(premise.id);
		window.__because.commands.toggleImplicit();
		window.__because.commands.cycleEvaluation();
		await wait(300);
		const both = desc();
		window.__because.commands.cycleEvaluation();
		await wait(300);
		const accepted = desc();
		window.__because.commands.cycleEvaluation();
		window.__because.commands.toggleImplicit();
		await wait(300);
		return { both, accepted, cleared: desc() };
	});
	ok(states.both === 'Implicit claim. Marked false' && states.accepted === 'Implicit claim. Marked true' &&
		states.cleared === '',
		`implicit and evaluation states are in the claim's description (${JSON.stringify(states)})`);

	// ---- checked menu items say so once ----
	await page.evaluate(() => Array.from(document.querySelectorAll('.menu-title'))
		.find(t => t.textContent === 'View').click());
	await page.waitForTimeout(150);
	ok(await page.evaluate(() => {
		const item = Array.from(document.querySelectorAll('.menu-dropdown [role=menuitemradio]'))
			.find(i => i.getAttribute('aria-checked') === 'true');
		return item && item.firstChild.nodeType === 1 && item.firstChild.getAttribute('aria-hidden') === 'true' &&
			item.firstChild.textContent === '✓ ';
	}), 'a checked item\'s ✓ is hidden from its name, which aria-checked already covers');
	await page.keyboard.press('Escape');

	// ---- the connector-label editor is not a child of the tree ----
	await page.evaluate(() => {
		const m = window.__because.engine.mapModel,
			conclusion = Object.values(m.getIdea().ideas)[0],
			premise = Object.values(Object.values(conclusion.ideas)[0].ideas)[0];
		m.selectNode(premise.id);
		document.getElementById('map-container').focus();
	});
	await page.keyboard.press('l');
	await page.waitForSelector('.connector-label-editor', { timeout: 4000 });
	ok(await page.evaluate(() => {
		const input = document.querySelector('.connector-label-editor');
		return input.parentElement === document.body && document.activeElement === input;
	}), 'the connector-label editor opens focused, outside role=tree');
	await axeScan('connector label editor open');
	await page.keyboard.press('Escape');

	// ---- high-contrast map colours: a view preference ----
	const savedBefore = await page.evaluate(() => window.__because.engine.serialize());
	await page.evaluate(() => Array.from(document.querySelectorAll('.menu-title'))
		.find(t => t.textContent === 'View').click());
	await page.waitForTimeout(150);
	await page.evaluate(() => Array.from(document.querySelectorAll('.menu-dropdown .menu-item'))
		.find(i => i.textContent.indexOf('High-contrast map colors') >= 0).click());
	await page.waitForTimeout(500);
	const contrast = await page.evaluate(() => {
		const m = window.__because.engine.mapModel,
			conclusion = Object.values(m.getIdea().ideas)[0],
			group = Object.values(conclusion.ideas).find(i => i.attr && i.attr.group === 'supporting'),
			claim = Object.values(group.ideas)[0];
		m.selectNode(claim.id);
		document.getElementById('map-container').focus();
		const badge = document.querySelector('.mapjs-label');
		return {
			body: document.body.classList.contains('high-contrast'),
			stored: localStorage.getItem('because.highcontrast'),
			badge: badge && getComputedStyle(badge).backgroundColor,
			strokes: Array.from(document.querySelectorAll('path.mapjs-connector'))
				.map(p => getComputedStyle(p).stroke).filter(c => c && c !== 'none')
		};
	});
	await page.waitForTimeout(300);
	const border = await page.evaluate(() => {
		const el = document.activeElement;
		return getComputedStyle(el).borderTopColor;
	});
	ok(contrast.body && contrast.stored === '1' && contrast.badge === 'rgb(11, 106, 160)',
		`high contrast is on, remembered, and the badges are #0b6aa0 (${JSON.stringify(contrast)})`);
	ok(contrast.strokes.length > 0 && contrast.strokes.every(c =>
		['rgb(31, 122, 77)', 'rgb(192, 0, 0)', 'rgb(0, 112, 192)', 'rgb(112, 112, 112)'].indexOf(c) >= 0),
		`every connector is drawn in a colour that clears 3:1 on white (${[...new Set(contrast.strokes)].join(', ')})`);
	ok(border === 'rgb(11, 106, 160)', `the selected claim's border is #0b6aa0 (${border})`);
	ok(await page.evaluate(() => window.__because.engine.serialize()) === savedBefore,
		'high contrast changes no map data');
	// an author's Coral paper takes #4f4f4f ink at 3.16:1; high contrast lightens it
	const coral = await page.evaluate(async () => {
		const m = window.__because.engine.mapModel;
		m.updateStyle('ui', 'background', '#f08080');
		await new Promise(r => setTimeout(r, 400));
		const el = document.getElementById(('node_' + m.getSelectedNodeId()).replace(/[^A-Za-z0-9_-]/g, '_')),
			title = el.querySelector('[data-mapjs-role=title]') || el,
			rgb = c => c.match(/\d+/g).slice(0, 3).map(Number),
			lum = c => {
				const [r, g, b] = rgb(c).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
				return 0.2126 * r + 0.7152 * g + 0.0722 * b;
			},
			bg = getComputedStyle(el).backgroundColor, fg = getComputedStyle(title).color,
			ratio = (Math.max(lum(bg), lum(fg)) + 0.05) / (Math.min(lum(bg), lum(fg)) + 0.05),
			stored = m.findIdeaById(m.getSelectedNodeId()).attr.style.background;
		window.__because.commands.undo();
		return { bg, fg, ratio: Math.round(ratio * 100) / 100, stored };
	});
	ok(coral.ratio >= 4.5 && coral.stored === '#f08080',
		`under high contrast an author's Coral claim is drawn with 4.5:1 text, and still saves as Coral (${JSON.stringify(coral)})`);
	await axeScan('map, high contrast');
	await page.evaluate(() => window.__because.darkMode.toggle());
	await page.waitForTimeout(400);
	ok(await page.evaluate(() => getComputedStyle(document.querySelector('.mapjs-label')).backgroundColor) === 'rgb(11, 106, 160)',
		'in dark mode high contrast still gives the badges #0b6aa0');
	await axeScan('map, high contrast, dark');
	await page.evaluate(() => { window.__because.darkMode.toggle(); window.__because.darkMode.toggleHighContrast(); });
	await page.waitForTimeout(400);
	ok(await page.evaluate(() => !document.body.classList.contains('high-contrast') &&
		localStorage.getItem('because.highcontrast') === '0'), 'high contrast turns off again');

	// ---- text spacing applied to an open map (WCAG 1.4.12) ----
	// the WCAG text-spacing bookmarklet's stylesheet, added after layout
	const overlaps = () => page.evaluate(() => {
		const boxes = Array.from(document.querySelectorAll('.mapjs-node:not(.attr_group)'))
				.map(n => ({ text: n.textContent.slice(0, 20), r: n.getBoundingClientRect(),
					clipped: n.scrollHeight > n.clientHeight + 1 })),
			hits = [];
		boxes.forEach((a, i) => boxes.slice(i + 1).forEach(b => {
			if (a.r.left < b.r.right - 1 && b.r.left < a.r.right - 1 &&
					a.r.top < b.r.bottom - 1 && b.r.top < a.r.bottom - 1) { hits.push(a.text + ' / ' + b.text); }
		}));
		return { hits, clipped: boxes.filter(b => b.clipped).map(b => b.text) };
	});
	await page.evaluate(() => {
		const st = document.createElement('style');
		st.id = 'phltsbkmklt';
		st.textContent = '*{line-height:1.5 !important;letter-spacing:0.12em !important;' +
			'word-spacing:0.16em !important;}p{margin-bottom:2em !important;}';
		document.head.appendChild(st);
	});
	await page.waitForTimeout(1500);
	const spaced = await overlaps();
	ok(spaced.hits.length === 0 && spaced.clipped.length === 0,
		`text spacing added to an open map lays it out again: no claims overlap or clip (${JSON.stringify(spaced)})`);
	await page.evaluate(() => document.getElementById('phltsbkmklt').remove());
	await page.waitForTimeout(1200);

	// ---- everything a drag does, without dragging (WCAG 2.1.1, 2.5.7) ----
	const fresh = async () => {
		await page.goto(BASE + '/app/index.html?src=../samples/death.mup');
		await page.waitForSelector('.mapjs-node', { timeout: 8000 });
		await page.waitForTimeout(700);
	};
	// the map's shape: conclusion -> reason bracket -> premises
	const shape = () => page.evaluate(() => {
		const m = window.__because.engine.mapModel,
			conclusion = Object.values(m.getIdea().ideas)[0],
			groups = Object.values(conclusion.ideas || {}).filter(i => i.attr && i.attr.group),
			premises = groups.length ? Object.values(groups[0].ideas || {}) : [];
		return { root: m.getIdea().id, conclusion: conclusion.id, groups: groups.map(g => g.id),
			premises: premises.map(p => p.id), titles: premises.map(p => p.title) };
	});
	const parentOf = id => page.evaluate(i => {
		const p = window.__because.engine.mapModel.getIdea().findParent(i);
		return p && { id: p.id, group: p.attr && p.attr.group, parent: (window.__because.engine.mapModel.getIdea().findParent(p.id) || {}).id };
	}, id);
	await fresh();
	let sh = await shape();
	// keyboard: M on the second premise, arrow to the first, Enter
	await page.evaluate(id => { window.__because.engine.mapModel.selectNode(id); document.getElementById('map-container').focus(); }, sh.premises[1]);
	await page.keyboard.press('m');
	await page.waitForTimeout(250);
	const banner = await page.evaluate(() => {
		const b = document.querySelector('.move-banner');
		return b && { role: b.getAttribute('role'), text: b.textContent };
	});
	ok(banner && banner.role === 'status' && /Moving/.test(banner.text) && /Escape cancels/.test(banner.text),
		`M picks the selection up and says how to put it down (${banner && banner.text.slice(0, 60)})`);
	await page.evaluate(id => window.__because.engine.mapModel.selectNode(id), sh.premises[0]);
	await page.keyboard.press('Enter');
	await page.waitForTimeout(500);
	let p = await parentOf(sh.premises[1]);
	ok(p && p.group === 'supporting' && p.parent === sh.premises[0] && !(await page.evaluate(() => !!document.querySelector('.move-banner'))),
		`Enter attaches it to the chosen claim as a reason, as a drag would (${JSON.stringify(p)})`);
	await page.keyboard.press('Meta+z');
	await page.waitForTimeout(400);
	ok(JSON.stringify((await parentOf(sh.premises[1])).id) === JSON.stringify(sh.groups[0]), 'one undo puts it back');
	// Escape cancels
	await page.evaluate(id => window.__because.engine.mapModel.selectNode(id), sh.premises[1]);
	await page.keyboard.press('m');
	await page.waitForTimeout(150);
	await page.keyboard.press('Escape');
	await page.waitForTimeout(250);
	ok(await page.evaluate(() => !document.querySelector('.move-banner') && !window.__because.moveMode.isMoving()) &&
		(await parentOf(sh.premises[1])).id === sh.groups[0], 'Escape puts it down where it was');
	// pointer, single clicks: move the whole bracket under a premise
	await page.evaluate(id => window.__because.engine.mapModel.selectNode(id), sh.groups[0]);
	await page.evaluate(() => window.__because.commands.beginMove());
	await page.waitForTimeout(200);
	await fresh();
	sh = await shape();
	await page.evaluate(() => {
		const m = window.__because.engine.mapModel, conclusion = Object.values(m.getIdea().ideas)[0];
		window.__because.commands.addObjection();
		return conclusion.id;
	});
	await page.waitForTimeout(300);
	await page.keyboard.type('An objection');
	await page.keyboard.press('Enter');
	await page.waitForTimeout(400);
	const objection = await page.evaluate(() => {
		const m = window.__because.engine.mapModel, conclusion = Object.values(m.getIdea().ideas)[0];
		return Object.values(conclusion.ideas).find(i => i.attr && i.attr.group === 'opposing').id;
	});
	await page.evaluate(id => window.__because.engine.mapModel.selectNode(id), objection);
	await page.evaluate(() => Array.from(document.querySelectorAll('.menu-title')).find(t => t.textContent === 'Edit').click());
	await page.waitForTimeout(150);
	await page.evaluate(() => Array.from(document.querySelectorAll('.menu-dropdown .menu-item')).find(i => /^Move…/.test(i.textContent)).click());
	await page.waitForTimeout(250);
	const targetBox = await page.evaluate(id => {
		const r = document.getElementById(('node_' + id).replace(/[^A-Za-z0-9_-]/g, '_')).getBoundingClientRect();
		return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
	}, sh.premises[0]);
	await page.mouse.click(targetBox.x, targetBox.y);
	await page.waitForTimeout(500);
	p = await parentOf(objection);
	ok(p && p.id === sh.premises[0], `Edit > Move… then a click attaches a whole objection under another claim (${JSON.stringify(p)})`);
	// pointer onto blank canvas: the claim comes out and stands there
	await page.evaluate(id => window.__because.engine.mapModel.selectNode(id), sh.premises[1]);
	await page.evaluate(() => window.__because.commands.beginMove());
	await page.waitForTimeout(200);
	const blank = await page.evaluate(() => {
		const r = document.getElementById('map-container').getBoundingClientRect();
		return { x: r.right - 120, y: r.top + 80 };
	});
	await page.mouse.click(blank.x, blank.y);
	await page.waitForTimeout(500);
	const placed = await page.evaluate(id => {
		const m = window.__because.engine.mapModel, idea = m.getIdea(),
			node = idea.findSubIdeaById(id), r = document.getElementById(('node_' + id).replace(/[^A-Za-z0-9_-]/g, '_')).getBoundingClientRect();
		const parent = idea.findParent(id);
		return { parent: parent ? parent.id : idea.id, root: idea.id, position: node.attr && node.attr.position, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
	}, sh.premises[1]);
	ok(placed.parent === placed.root && Array.isArray(placed.position) &&
		Math.abs(placed.cx - blank.x) < 30 && Math.abs(placed.cy - blank.y) < 30,
		`a click on blank canvas places the claim there, standing free (${JSON.stringify(placed)} vs ${JSON.stringify(blank)})`);
	// keyboard nudge, then width, reorder and the bracket
	const before = placed.position.slice();
	await page.evaluate(() => document.getElementById('map-container').focus());
	await page.keyboard.press('Meta+Shift+ArrowRight');
	await page.keyboard.press('Meta+Shift+ArrowDown');
	await page.waitForTimeout(400);
	const after = await page.evaluate(id => window.__because.engine.mapModel.getIdea().findSubIdeaById(id).attr.position, sh.premises[1]);
	ok(after[0] === before[0] + 20 && after[1] === before[1] + 20,
		`⌘⇧ + arrows nudge a free-standing claim by 20px (${JSON.stringify(before)} -> ${JSON.stringify(after)})`);
	const widths = await page.evaluate(async id => {
		const m = window.__because.engine.mapModel, w = () => document.getElementById(('node_' + id).replace(/[^A-Za-z0-9_-]/g, '_')).getBoundingClientRect().width;
		m.selectNode(id);
		const a = w();
		window.__because.commands.widerClaim();
		await new Promise(r => setTimeout(r, 400));
		const b = w();
		window.__because.commands.narrowerClaim();
		window.__because.commands.narrowerClaim();
		await new Promise(r => setTimeout(r, 400));
		return { a, b, c: w() };
	}, sh.premises[0]);
	ok(widths.b > widths.a + 20 && widths.c < widths.b - 40,
		`Wider and Narrower claim resize without the drag handle (${JSON.stringify(widths)})`);
	const bracket = await page.evaluate(id => {
		const m = window.__because.engine.mapModel;
		m.selectNode(id);
		window.__because.commands.selectBracket();
		return { selected: m.getSelectedNodeId(), parent: m.getIdea().findParent(id).id };
	}, sh.premises[0]);
	ok(bracket.selected === bracket.parent, 'Select bracket selects the premise\'s bracket without hitting the 16px strip');
	const numbering = await page.evaluate(async () => {
		const pressed = () => document.querySelector('#toolbar [data-tool="numbering"]').getAttribute('aria-pressed'),
			name = document.querySelector('#toolbar [data-tool="numbering"]').getAttribute('aria-label'),
			before = pressed();
		window.__because.commands.toggleNumbering();
		await new Promise(r => setTimeout(r, 200));
		const after = pressed();
		window.__because.commands.toggleNumbering();
		return { name, before, after };
	});
	ok(numbering.name === 'Claim numbering' && numbering.before === 'true' && numbering.after === 'false',
		`the claim-numbering button reports whether numbering is on (${JSON.stringify(numbering)})`);

	// ---- entering a freshly loaded map shows where focus is (WCAG 2.4.7) ----
	await fresh();
	await page.evaluate(() => { if (document.activeElement) { document.activeElement.blur(); } });
	await page.keyboard.press('Tab'); // the skip link
	await page.keyboard.press('Enter');
	await page.waitForTimeout(300);
	const entry = await page.evaluate(() => {
		const a = document.activeElement, cs = getComputedStyle(a);
		return { role: a.getAttribute('role'), width: cs.borderTopWidth, style: cs.borderTopStyle };
	});
	ok(entry.role === 'treeitem' && entry.width === '3px' && entry.style !== 'solid',
		`the skip link lands on a claim drawn with the 3px focus border (${JSON.stringify(entry)})`);

	// ---- single-character keys need the map to have focus (WCAG 2.1.4) ----
	await fresh();
	const stray = await page.evaluate(async () => {
		if (document.activeElement) { document.activeElement.blur(); }
		const before = window.__because.engine.serialize();
		['t', 'd', 'm', 'z'].forEach(key => document.body.dispatchEvent(
			new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })));
		await new Promise(r => setTimeout(r, 300));
		return { unchanged: window.__because.engine.serialize() === before,
			moving: window.__because.moveMode.isMoving() };
	});
	ok(stray.unchanged && !stray.moving, 'with nothing focused, t, d, m and z change nothing');

	// ---- the floating cards never hide the focused claim (WCAG 2.4.11) ----
	await page.evaluate(() => window.__because.layout.setLayout('floating'));
	await page.setViewportSize({ width: 980, height: 700 });
	await page.waitForTimeout(300);
	await page.evaluate(() => {
		const ideas = {};
		let id = 2;
		for (let i = 1; i <= 24; i += 1) {
			const g = id++, c = id++;
			ideas[i] = { id: g, title: '', attr: { group: i % 2 ? 'supporting' : 'opposing', contentLocked: true },
				ideas: { 1: { id: c, title: ['No.', 'Yes.', 'Ok.', 'Hm.'][i % 4] } } };
		}
		window.__because.io.loadJson({ id: 'root', formatVersion: 3, ideas: { 1: { id: 1, title: 'Wide root', ideas } } }, 'wide.mup');
	});
	await page.waitForTimeout(700);
	await page.evaluate(() => document.getElementById('map-container').focus());
	await page.keyboard.press('Shift+Z');
	await page.waitForTimeout(250);
	await page.keyboard.press('Shift+Z');
	await page.waitForTimeout(250);
	await page.evaluate(() => { window.__because.engine.mapModel.selectNode(1); document.getElementById('map-container').focus(); });
	await page.waitForTimeout(400);
	await page.keyboard.press('ArrowDown');
	await page.waitForTimeout(400);
	const hidden = [];
	for (let i = 0; i < 26; i += 1) {
		await page.keyboard.press('ArrowLeft');
		await page.waitForTimeout(350);
		const seen = await page.evaluate(() => {
			const a = document.activeElement, r = a.getBoundingClientRect();
			let vis = 0;
			for (let y = r.top + 0.5; y < r.bottom; y += 2) {
				for (let x = r.left + 0.5; x < r.right; x += 2) {
					const e = document.elementFromPoint(x, y);
					if (e && (e === a || a.contains(e))) { vis += 1; }
				}
			}
			return { id: a.id, vis };
		});
		if (seen.vis === 0) { hidden.push(seen.id); }
	}
	ok(hidden.length === 0, `walking a wide map in the floating layout, no focused claim is wholly under a card (${hidden.join(', ')})`);
	await page.evaluate(() => window.__because.layout.setLayout('left'));
	await page.setViewportSize({ width: 1500, height: 950 });
	await page.waitForTimeout(300);

	ok(errors.length === 0, 'no page errors (' + errors.join('; ').slice(0, 200) + ')');
	await browser.close();

	// ---- NVDA proxy: Chromium's COMPUTED accessibility tree ----
	// The attributes checked above are what we author; a Windows screen
	// reader consumes the tree Chromium computes from them, which can
	// diverge (an NVDA user got "unknown invisible" from the old
	// activedescendant indirection while every DOM check here passed).
	// Real Chrome, real computed tree: focusing the map must land actual
	// focus on a NAMED treeitem — no indirection for the AT to follow.
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
	ok(axItems.some(i => i.name.value.indexOf('labeled Because') >= 0),
		'the bracket\'s connector label is in its COMPUTED name (' + cIds.group + ')');
	ok(axFocused.length === 1 && axFocused[0].description &&
		axFocused[0].description.value === 'Connector labeled and',
		'the claim\'s connector label is in its COMPUTED description (' +
			(axFocused[0] && axFocused[0].description && axFocused[0].description.value) + ')');
	ok(axTrees.length === 1 && axTrees[0].description &&
		/Escape/.test(axTrees[0].description.value),
		'the map\'s way out is in the tree\'s COMPUTED description');
	// the inline claim editor, as the computed tree presents it
	await cpage.evaluate(() => window.__because.commands.editNode());
	await cpage.waitForTimeout(300);
	const axEditing = (await cdp.send('Accessibility.getFullAXTree')).nodes.filter(n =>
		(n.properties || []).some(p => p.name === 'focused' && p.value.value) &&
		n.role && n.role.value !== 'RootWebArea');
	ok(axEditing.length === 1 && axEditing[0].role.value === 'textbox' &&
		axEditing[0].name && axEditing[0].name.value === 'Claim text',
		'the claim editor is a textbox named "Claim text" in the COMPUTED tree (' +
			axEditing.map(n => n.role.value + ' "' + (n.name && n.name.value) + '"').join(',') + ')');
	await cpage.keyboard.press('Escape');
	// an evaluation mark is described in words, and its emoji is not in the name
	await cpage.evaluate(() => {
		document.getElementById('map-container').focus();
		window.__because.commands.cycleEvaluation();
	});
	await cpage.waitForTimeout(400);
	const axMarked = (await cdp.send('Accessibility.getFullAXTree')).nodes.filter(n =>
		(n.properties || []).some(p => p.name === 'focused' && p.value.value) &&
		n.role && n.role.value === 'treeitem');
	ok(axMarked.length === 1 && !/\u{1F6AB}/u.test(axMarked[0].name.value) &&
		axMarked[0].description && /^Marked false/.test(axMarked[0].description.value),
		'a claim marked false is described as "Marked false" and its name carries no emoji (' +
			(axMarked[0] && JSON.stringify([axMarked[0].name.value, axMarked[0].description && axMarked[0].description.value])) + ')');
	await cr.close();

	console.log(failures ? 'FAILURES: ' + failures : 'ALL PASS');
	process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
