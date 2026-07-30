/*global document*/
/*
 * Icon toolbar. Every button maps to a command (commands.js) or a file op.
 * The same vocabulary renders in four places — the classic top bar, the
 * left rail, the floating palettes and the mobile bottom bar — so each tool
 * is described once in TOOLS and every layout is just a group string
 * ("a,b|c" = two groups separated by a rule). Icons come from icons.js.
 */

import { iconSVG } from './icons.js';

// icon name -> [tooltip / accessible name, action]. A name missing from this
// table is skipped wherever a group string lists it, which is how the neutral
// connector stays invisible until View > Allow neutral connectors is on.
function tools(commands, io, allowNeutral) {
	const table = {
		newDoc: ['New map', () => io.newMap()],
		open: ['Open .mup…', () => io.open()],
		save: ['Save', () => io.save(false)],
		undo: ['Undo (⌘Z)', commands.undo],
		redo: ['Redo (⌘⇧Z)', commands.redo],
		reason: ['Add reason (Enter)', commands.addReason],
		objection: ['Add objection (Alt+O)', commands.addObjection],
		copremise: ['Add co-premise (Tab)', commands.addCoPremise],
		sticky: ['Add sticky note (Alt+N)', commands.addSticky],
		edit: ['Edit text (F2 / double-click)', commands.editNode],
		trash: ['Delete (⌫)', commands.deleteNode],
		implicit: ['Toggle implicit claim (Alt+T)', commands.toggleImplicit],
		flip: ['Toggle reason ⇄ objection (Alt+T on a bracket)', commands.toggleReasonObjection],
		evalMark: ['Mark claim false / true / clear', commands.cycleEvaluation],
		zoomOut: ['Zoom out (Shift+Z)', commands.zoomOut],
		zoomReset: ['Reset view', commands.zoomReset],
		zoomIn: ['Zoom in (Z)', commands.zoomIn],
		collapse: ['Collapse / expand branch (F)', commands.toggleCollapse],
		numbering: ['Toggle claim numbering', commands.toggleNumbering]
	};
	if (allowNeutral) {
		table.neutral = ['Add neutral connector (Alt+Q)', commands.addNeutral];
	}
	return table;
}

const EDITING = 'reason,objection,neutral,copremise,sticky|edit,trash',
	ZOOM = 'zoomOut,zoomReset,zoomIn',
	// classic is the pre-overhaul group list, unchanged; the rail drops
	// New/Open/Save (the File menu and ⌘O/⌘S cover them) and parks zoom at
	// the foot, below a flex spacer
	GROUPS = {
		classic: 'newDoc,open,save|undo,redo|' + EDITING + '|implicit,flip,evalMark|' +
			ZOOM + '|collapse,numbering',
		left: 'undo,redo|' + EDITING + '|implicit,flip,evalMark|collapse,numbering',
		leftFoot: ZOOM,
		floating: EDITING + '|undo,redo',
		floatingZoom: ZOOM
	},
	// the five commands worth a thumb on a phone; the rest live in the menu
	MOBILE = [
		['reason', 'Reason'],
		['objection', 'Objection'],
		['edit', 'Edit'],
		['undo', 'Undo']
	];

function toolButton(name, title, run) {
	const b = document.createElement('button');
	b.type = 'button';
	b.className = 'tb-btn';
	b.title = title;
	b.setAttribute('aria-label', title);
	b.innerHTML = iconSVG(name);
	b.addEventListener('mousedown', e => e.preventDefault()); // keep map focus
	b.addEventListener('click', () => run());
	return b;
}

function separator(el) {
	const sep = document.createElement('span');
	sep.className = 'tb-sep';
	el.appendChild(sep);
}

/*
 * One Tab stop per strip, arrow keys between the buttons — the WAI-ARIA
 * toolbar pattern the containers already promise with role="toolbar", and the
 * same shape menus.js uses for the menubar.
 *
 * This is not a tidy-up. WebKit only puts a <button> in the sequential focus
 * order if it carries an explicit tabindex (on macOS, Safari's "Press Tab to
 * highlight each item on a webpage" is off by default), so with no tabindex at
 * all every one of these strips was skipped entirely: in Safari, Tab went skip
 * link → menubar → straight into the map, and the rail could not be reached by
 * keyboard at all (WCAG 2.1.1). The menubar was fine only because its titles
 * set their own tabindex. The buttons were always focusable programmatically,
 * and the :focus-visible ring on them was always correct — nothing could ever
 * put focus there to show it.
 */
export function applyToolbarRoving(el) {
	const items = () => Array.from(el.querySelectorAll('button')),
		setStop = function (target) {
			items().forEach(b => b.setAttribute('tabindex', b === target ? '0' : '-1'));
		};
	if (!el.dataset.roving) {
		el.dataset.roving = '1';
		// the stop follows the last button used, so Tab comes back where it left
		el.addEventListener('focusin', function (e) {
			if (e.target.tagName === 'BUTTON') { setStop(e.target); }
		});
		// both axes on every strip: the rail is vertical and the others
		// horizontal, and a user who reaches for the wrong pair still gets out
		el.addEventListener('keydown', function (e) {
			if (e.altKey || e.metaKey || e.ctrlKey) { return; }
			const list = items(),
				at = list.indexOf(document.activeElement);
			if (at < 0) { return; }
			const next = (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? (at + 1) % list.length :
				(e.key === 'ArrowUp' || e.key === 'ArrowLeft') ? (at - 1 + list.length) % list.length :
				e.key === 'Home' ? 0 :
				e.key === 'End' ? list.length - 1 : -1;
			if (next < 0) { return; }
			e.preventDefault();
			list[next].focus();
		});
	}
	// a rebuild replaces the buttons, so the stop starts over at the first
	const list = items();
	if (list.length) { setStop(list[0]); }
}

// Names the table does not define are dropped, and the rule between groups is
// counted off what actually rendered — so a group that empties out entirely
// takes its separator with it instead of leaving a doubled rule behind.
function renderGroups(el, table, groups) {
	let rendered = 0;
	groups.split('|').forEach(function (group) {
		const names = group.split(',').filter(name => table[name]);
		if (!names.length) { return; }
		if (rendered) { separator(el); }
		names.forEach(function (name) {
			const tool = table[name];
			el.appendChild(toolButton(name, tool[0], tool[1]));
		});
		rendered += 1;
	});
}

// mode: 'classic' | 'left' | 'floating' | 'floatingZoom'. The caller empties
// the container first — layout.js rebuilds these on every mode change, and on
// every change to the neutral-connector preference.
export function buildToolbar(el, commands, io, mode, allowNeutral) {
	const table = tools(commands, io, allowNeutral),
		which = GROUPS[mode] ? mode : 'classic';
	renderGroups(el, table, GROUPS[which]);
	if (which === 'left') {
		const spacer = document.createElement('span');
		spacer.className = 'tb-spacer';
		el.appendChild(spacer);
		renderGroups(el, table, GROUPS.leftFoot);
		separator(el); // layout.js appends #theme-toggle after this
	}
}

// Bottom bar for the mobile breakpoint: icon over a short visible label, so
// the label IS the accessible name (WCAG 2.5.3). Returns the Menu button for
// the caller to wire to the flyout.
export function buildMobileBar(el, commands, io) {
	const table = tools(commands, io);
	MOBILE.forEach(function ([name, label]) {
		const b = toolButton(name, table[name][0], table[name][1]),
			text = document.createElement('span');
		b.className = 'mb-btn';
		b.removeAttribute('aria-label');
		text.className = 'mb-label';
		text.textContent = label;
		b.appendChild(text);
		el.appendChild(b);
	});
	const menu = document.createElement('button'),
		text = document.createElement('span');
	menu.type = 'button';
	menu.className = 'mb-btn';
	menu.title = 'Menu';
	menu.innerHTML = iconSVG('hamburger');
	text.className = 'mb-label';
	text.textContent = 'Menu';
	menu.appendChild(text);
	el.appendChild(menu);
	return menu;
}
