/*global document*/
/*
 * Icon toolbar. Every button maps to a command (commands.js) or a file op.
 * The same vocabulary renders in four places — the classic top bar, the
 * left rail, the floating palettes and the mobile bottom bar — so each tool
 * is described once in TOOLS and every layout is just a group string
 * ("a,b|c" = two groups separated by a rule). Icons come from icons.js.
 */

import { iconSVG } from './icons.js';

// icon name -> [tooltip / accessible name, action]
function tools(commands, io) {
	return {
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
}

const EDITING = 'reason,objection,copremise,sticky|edit,trash',
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

function renderGroups(el, table, groups) {
	groups.split('|').forEach(function (group, gi) {
		if (gi) { separator(el); }
		group.split(',').forEach(function (name) {
			const tool = table[name];
			el.appendChild(toolButton(name, tool[0], tool[1]));
		});
	});
}

// mode: 'classic' | 'left' | 'floating' | 'floatingZoom'. The caller empties
// the container first — layout.js rebuilds these on every mode change.
export function buildToolbar(el, commands, io, mode) {
	const table = tools(commands, io),
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
