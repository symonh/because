/*global document*/
/*
 * Icon toolbar. Every button maps to a command (commands.js) or a file op.
 * Icons are inline SVGs (16x16 viewBox, stroke-based) — no external assets.
 */

const ICONS = {
	newDoc: '<path d="M4 1h6l3 3v11H4z" fill="none"/><path d="M10 1v3h3"/>',
	open: '<path d="M1 4h5l2 2h7v8H1z" fill="none"/>',
	save: '<path d="M2 2h10l2 2v10H2z" fill="none"/><path d="M5 2v4h6V2M5 14v-5h6v5"/>',
	undo: '<path d="M6 3L2 7l4 4"/><path d="M2 7h8a4 4 0 014 4v1" fill="none"/>',
	redo: '<path d="M10 3l4 4-4 4"/><path d="M14 7H6a4 4 0 00-4 4v1" fill="none"/>',
	reason: '<rect x="5" y="1" width="7" height="4" rx="1" fill="none"/><path d="M8.5 5v3" stroke="#339966" stroke-width="2"/><path d="M2 8h13M2 8q0 2 2 2m9-2q0 2 2 2" stroke="#339966" stroke-width="2" fill="none"/><rect x="2" y="11" width="5" height="4" rx="1" fill="none"/><rect x="9" y="11" width="5" height="4" rx="1" fill="none"/>',
	objection: '<rect x="5" y="1" width="7" height="4" rx="1" fill="none"/><path d="M8.5 5v3" stroke="#e02222" stroke-width="2"/><path d="M2 8h13M2 8q0 2 2 2m9-2q0 2 2 2" stroke="#e02222" stroke-width="2" fill="none"/><rect x="4" y="11" width="8" height="4" rx="1" fill="none"/>',
	copremise: '<rect x="1" y="6" width="6" height="5" rx="1" fill="none"/><rect x="9" y="6" width="6" height="5" rx="1" fill="none"/><path d="M7 8.5h2" stroke-dasharray="1.5,1.5"/>',
	sticky: '<path d="M2 2h12v9l-3 3H2z" fill="#ffef8a" stroke="#c9b300"/><path d="M11 14v-3h3"/>',
	edit: '<path d="M3 13l1-4 7-7 3 3-7 7z" fill="none"/><path d="M10 3l3 3"/>',
	trash: '<path d="M3 4h10M6 4V2h4v2M4 4l1 10h6l1-10" fill="none"/>',
	implicit: '<rect x="2" y="4" width="12" height="8" rx="2" fill="none" stroke-dasharray="3,2"/>',
	flip: '<path d="M4 6q4-4 8 0" fill="none" stroke="#339966" stroke-width="2"/><path d="M4 10q4 4 8 0" fill="none" stroke="#e02222" stroke-width="2"/><path d="M12 4v2h-2M4 12v-2h2"/>',
	evalMark: '<circle cx="8" cy="8" r="6" fill="none" stroke="#22aae0" stroke-width="2"/><path d="M4 12L12 4" stroke="#e02222" stroke-width="2"/>',
	zoomIn: '<circle cx="7" cy="7" r="5" fill="none"/><path d="M11 11l4 4M5 7h4M7 5v4"/>',
	zoomOut: '<circle cx="7" cy="7" r="5" fill="none"/><path d="M11 11l4 4M5 7h4"/>',
	zoomReset: '<circle cx="7" cy="7" r="5" fill="none"/><path d="M11 11l4 4"/><path d="M5.5 8.5v-3l3 3v-3" stroke-width="1.2"/>',
	collapse: '<path d="M3 6l5-4 5 4M3 10l5 4 5-4" fill="none"/>',
	numbering: '<circle cx="8" cy="8" r="6.5" fill="#22aae0" stroke="#fff"/><text x="8" y="11" font-size="8" text-anchor="middle" fill="#fff" stroke="none" font-family="sans-serif" font-weight="bold">1.1</text>'
};

function iconSVG(name) {
	return '<svg viewBox="0 0 16 16" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">' + ICONS[name] + '</svg>';
}

export function buildToolbar(el, commands, io) {
	const groups = [
		[
			{ icon: 'newDoc', title: 'New map', run: () => io.newMap() },
			{ icon: 'open', title: 'Open .mup…', run: () => io.open() },
			{ icon: 'save', title: 'Save', run: () => io.save(false) }
		],
		[
			{ icon: 'undo', title: 'Undo (⌘Z)', run: commands.undo },
			{ icon: 'redo', title: 'Redo (⌘⇧Z)', run: commands.redo }
		],
		[
			{ icon: 'reason', title: 'Add reason (Enter)', run: commands.addReason },
			{ icon: 'objection', title: 'Add objection (Alt+O)', run: commands.addObjection },
			{ icon: 'copremise', title: 'Add co-premise (Tab)', run: commands.addCoPremise },
			{ icon: 'sticky', title: 'Add sticky note (Alt+N)', run: commands.addSticky }
		],
		[
			{ icon: 'edit', title: 'Edit text (F2 / double-click)', run: commands.editNode },
			{ icon: 'trash', title: 'Delete (⌫)', run: commands.deleteNode }
		],
		[
			{ icon: 'implicit', title: 'Toggle implicit claim (Alt+T)', run: commands.toggleImplicit },
			{ icon: 'flip', title: 'Toggle reason ⇄ objection (Alt+T on a bracket)', run: commands.toggleReasonObjection },
			{ icon: 'evalMark', title: 'Mark claim false / true / clear', run: commands.cycleEvaluation }
		],
		[
			{ icon: 'zoomOut', title: 'Zoom out (Shift+Z)', run: commands.zoomOut },
			{ icon: 'zoomReset', title: 'Reset view', run: commands.zoomReset },
			{ icon: 'zoomIn', title: 'Zoom in (Z)', run: commands.zoomIn }
		],
		[
			{ icon: 'collapse', title: 'Collapse / expand branch (F)', run: commands.toggleCollapse },
			{ icon: 'numbering', title: 'Toggle claim numbering', run: commands.toggleNumbering }
		]
	];
	groups.forEach((group, gi) => {
		if (gi) {
			const sep = document.createElement('span');
			sep.className = 'tb-sep';
			el.appendChild(sep);
		}
		group.forEach(btn => {
			const b = document.createElement('button');
			b.className = 'tb-btn';
			b.title = btn.title;
			b.innerHTML = iconSVG(btn.icon);
			b.addEventListener('mousedown', e => e.preventDefault()); // keep map focus
			b.addEventListener('click', () => btn.run());
			el.appendChild(b);
		});
	});
}
