/*global window*/
/*
 * Argument-mapping commands over the raw mapModel. Every UI surface
 * (toolbar, menus, shortcuts) goes through these, so the argument grammar
 * stays consistent: claims get reasons/objections (bracketed groups) and
 * co-premises, never bare mind-map children — except sticky notes.
 */

import { GROUP_ATTR } from './drop-policy.js';
import { isStickyNode } from './numbering.js';

const SOURCE = 'ui',
	FONT_STEP = 1.2,
	FONT_MIN = 0.4,
	FONT_MAX = 4,
	// a pasted subtree always lays out under its new parent; drop any manual
	// positions (a copied root claim carries one) so nothing lands off in
	// absolute space — the detached case is reached by dragging, not pasting
	stripPositions = function (node) {
		if (!node) { return; }
		if (node.attr && node.attr.position) { delete node.attr.position; }
		if (node.ideas) { Object.keys(node.ideas).forEach(k => stripPositions(node.ideas[k])); }
	};

export function makeCommands(engine, darkMode, shortcutHelp, neutralPref) {
	// in-memory clipboard: the JSON subtree copied by the last Copy. Kept in
	// the app layer because mapjs exposes clone/paste on content but no
	// clipboard of its own (MindMup's cut/copy/paste lived in its closed app).
	let clipboard = null;
	const mapModel = engine.mapModel,
		idea = () => mapModel.getIdea(),
		selectedId = () => mapModel.getSelectedNodeId(),
		selectedIdea = () => mapModel.findIdeaById(selectedId()),
		findParent = id => idea() && idea().findParent(id),
		isGroup = n => n && n.attr && n.attr.group,
		isSticky = n => isStickyNode(n),
		// whole-title formatting for a selected node (while editing, the
		// text editor applies these to the text selection instead)
		toggleTitleFormat = function (tag) {
			const node = selectedIdea();
			if (!node || isGroup(node) || !node.title) { return; }
			const newTitle = window.MAPJS.richText.toggleFormat(node.title, tag);
			if (newTitle !== node.title) { mapModel.updateTitle(node.id, newTitle); }
		},
		stepFontSize = function (factor) {
			const node = selectedIdea();
			if (!node || isGroup(node)) { return; }
			const current = (node.attr && node.attr.style && node.attr.style.fontMultiplier) || 1;
			let next = Math.round(current * factor * 100) / 100;
			next = Math.min(FONT_MAX, Math.max(FONT_MIN, next));
			// fontMultiplier is the .mup-native per-node size (MindMup wrote
			// it too); ~1 means default, so drop the attribute entirely
			mapModel.updateStyle(SOURCE, 'fontMultiplier', Math.abs(next - 1) <= 0.01 ? false : next);
		},
		styleNamesOf = n => (n && n.attr && Array.isArray(n.attr.styleNames)) ? n.attr.styleNames.slice() : [],
		setStyleNames = (id, names) => idea().updateAttr(id, 'styleNames', names.length ? names : false),
		toggleStyleName = function (id, name) {
			const node = idea().findSubIdeaById(id) || idea(),
				names = styleNamesOf(node),
				at = names.indexOf(name);
			if (at >= 0) { names.splice(at, 1); } else { names.push(name); }
			setStyleNames(id, names);
		};

	const commands = {
		addReason() { mapModel.addGroupSubidea(SOURCE, { group: 'supporting' }); },
		addObjection() { mapModel.addGroupSubidea(SOURCE, { group: 'opposing' }); },
		// An uninterpreted connector: it says only that the two are related,
		// leaving what the relation is to the map's author. The use it exists
		// for is questions — a claim that answers a question, or a question the
		// reasoning above it raised — but nothing here commits it to that.
		// Off unless View > Allow neutral connectors is on. The surfaces hide
		// their own affordances (no icon, no Insert item, no Alt+Q); this guard
		// is the backstop for anything that reaches the command directly.
		addNeutral() {
			if (neutralPref && !neutralPref.isOn()) { return; }
			mapModel.addGroupSubidea(SOURCE, { group: 'neutral' });
		},
		addCoPremise() {
			// a co-premise is a sibling claim inside the same reason/objection
			// group; on a node with no group parent there is nothing to join
			const parent = findParent(selectedId());
			if (isGroup(parent)) {
				mapModel.addSiblingIdea(SOURCE);
			}
		},
		addSticky() {
			const id = selectedId();
			if (!id) { return; }
			const newId = idea().addSubIdea(id, 'note', undefined, { styleNames: ['sticky_note'] });
			if (newId) {
				mapModel.selectNode(newId);
				mapModel.editNode(SOURCE, true, true);
			}
		},
		insertParentReason() { mapModel.insertIntermediateGroup(SOURCE, { group: 'supporting' }); },
		// Copy the selected claim and everything beneath it (a deep snapshot,
		// so it survives the source being edited or deleted). Groups (bare
		// brackets) and sticky notes are structure/annotation, not portable
		// argument units, so they are not copied.
		copy() {
			const node = selectedIdea();
			if (!node || isGroup(node) || isSticky(node)) { return; }
			const clone = idea().clone(node.id);
			if (clone) { stripPositions(clone); clipboard = clone; }
		},
		// Paste the clipboard onto the selection, exactly as dragging it there
		// would (drop-policy grammar): onto a claim it becomes a new reason in
		// its own fresh green group; onto a bracket it joins as a co-premise.
		// There is always a selection (the model falls back to the root), so
		// paste always attaches — detaching is done afterwards by dragging the
		// pasted subtree to a blank area. One undo reverts the whole paste.
		paste() {
			const content = idea();
			if (!clipboard || !content) { return; }
			const targetId = selectedId(),
				target = content.findSubIdeaById(targetId) || content;
			let newId = null;
			content.batch(function () {
				if (isGroup(target)) {
					newId = content.paste(target.id, clipboard);
				} else if (!isSticky(target)) {
					const groupId = content.addSubIdea(targetId, 'group', undefined, GROUP_ATTR);
					if (groupId) { newId = content.paste(groupId, clipboard); }
				}
			});
			if (newId) { mapModel.selectNode(newId); }
		},
		editNode() { mapModel.editNode(SOURCE, false, false); },
		deleteNode() { mapModel.removeSubIdea(SOURCE); },
		// Take the selection and everything under it out of the tree: it
		// becomes a root of its own, standing free on the canvas. On a claim
		// that is the claim and its sub-argument; on a bracket it is the whole
		// reason or objection — the bracket and every premise in it, which is
		// what selecting a bracket means. This is the keyboard equivalent of
		// dragging to a blank area and uses the engine's own path for that
		// (positionNodeAt with a manual position reparents to the content root
		// and pins attr.position, the .mup's own way of recording a detached
		// root).
		detachNode() {
			const content = idea(),
				node = selectedIdea(),
				nodeId = selectedId();
			if (!content || !node) { return; }
			const parent = findParent(nodeId);
			// already a root of its own — nothing to come away from
			if (!parent || parent.id === content.id) { return; }
			const layout = mapModel.getCurrentLayout(),
				box = layout && layout.nodes && layout.nodes[nodeId];
			if (!box) { return; }
			content.batch(function () {
				// its current coordinates, so what is detached does not jump
				mapModel.positionNodeAt(nodeId, box.x, box.y, true);
				// don't leave an empty bracket behind (the drag policy does the
				// same); batched, so one undo puts the claim and its bracket back
				const oldParent = content.findSubIdeaById(parent.id);
				if (isGroup(oldParent) && !Object.keys(oldParent.ideas || {}).length) {
					content.removeSubIdea(oldParent.id);
				}
			});
			mapModel.selectNode(nodeId);
		},
		undo() { mapModel.undo(SOURCE); },
		redo() { mapModel.redo(SOURCE); },
		toggleImplicit() {
			const node = selectedIdea();
			if (node && !isGroup(node)) { toggleStyleName(node.id, 'attr_implicit_claim'); }
		},
		toggleReasonObjection() {
			// flips the group that contains the selection (or the selected
			// group itself) between supporting and opposing. A neutral bracket
			// falls to supporting rather than cycling on to a third state:
			// deliberate, so T stays the two-way flip students learned
			// (Simon's call, 2026-07-29) — Alt+Q is the way back to neutral.
			const node = selectedIdea(),
				group = isGroup(node) ? node : findParent(selectedId());
			if (isGroup(group)) {
				idea().updateAttr(group.id, 'group',
					group.attr.group === 'supporting' ? 'opposing' : 'supporting');
			}
		},
		cycleEvaluation() {
			// none -> rejected -> accepted -> none
			const node = selectedIdea();
			if (!node || isGroup(node)) { return; }
			const names = styleNamesOf(node),
				rejected = names.indexOf('attr_eval_rejected'),
				accepted = names.indexOf('attr_eval_accepted');
			if (rejected >= 0) {
				names.splice(rejected, 1);
				names.push('attr_eval_accepted');
			} else if (accepted >= 0) {
				names.splice(accepted, 1);
			} else {
				names.push('attr_eval_rejected');
			}
			setStyleNames(node.id, names);
		},
		toggleBold() { toggleTitleFormat('b'); },
		toggleItalic() { toggleTitleFormat('i'); },
		toggleUnderline() { toggleTitleFormat('u'); },
		fontBigger() { stepFontSize(FONT_STEP); },
		fontSmaller() { stepFontSize(1 / FONT_STEP); },
		toggleCollapse() { mapModel.toggleCollapse(SOURCE); },
		zoomIn() { mapModel.scaleUp(SOURCE); },
		zoomOut() { mapModel.scaleDown(SOURCE); },
		zoomReset() { mapModel.resetView(SOURCE); },
		toggleNumbering() { engine.setLabelsOn(!engine.getLabelsOn()); },
		// a view preference rather than an edit, but it belongs here so the
		// Shift+T shortcut is tracked by surface like every other key
		toggleDarkMode() { if (darkMode) { darkMode.toggle(); } },
		// the ? key and Help > Keyboard shortcuts are the same command, so both
		// routes are counted and neither can drift from the other's list
		showShortcuts() { if (shortcutHelp) { shortcutHelp.show(); } }
	};
	return commands;
}
