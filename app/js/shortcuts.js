/*global window*/
/*
 * philmaps.com keyboard map (the one Simon's students learned):
 *   Enter  add reason under selected claim
 *   Tab    add co-premise to selected claim
 *   Alt+O  add objection
 *   Alt+T  toggle reason/objection (bracket) or implicit/explicit (claim)
 *   Alt+N  add sticky note
 *   z / Shift+z  zoom in / out
 *   ⌘Z / ⌘⇧Z  undo / redo — mapjs never bound these (undo lived in the
 *   MindMup app layer); unconsumed ⌘Z reaches Safari's own Edit > Undo,
 *   whose top item is often "Undo Close Tab" — it reopened tabs mid-edit
 * Registered in the capture phase so they pre-empt the engine's default
 * mind-map bindings (plain Enter would otherwise add a bare child).
 * preventDefault/stopImmediatePropagation run BEFORE the command so the
 * engine's own binding cannot also fire if the command throws.
 * Arrows / F2 / delete / undo-redo stay with the engine's own handlers.
 */

export function bindShortcuts(engine, commands) {
	const mapModel = engine.mapModel;
	window.addEventListener('keydown', function (e) {
		if (!mapModel.getInputEnabled()) { return; } // editing a node title
		const tag = (e.target && e.target.tagName) || '';
		if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) { return; }
		const alt = e.altKey && !e.metaKey && !e.ctrlKey,
			bare = !e.altKey && !e.metaKey && !e.ctrlKey,
			mod = (e.metaKey || e.ctrlKey) && !e.altKey;
		let command = null;
		if (mod && e.code === 'KeyZ') {
			command = e.shiftKey ? commands.redo : commands.undo;
		} else if (mod && !e.shiftKey && e.code === 'KeyY') {
			command = commands.redo;
		} else if (bare && e.key === 'Enter') {
			command = commands.addReason;
		} else if (bare && e.key === 'Tab') {
			command = commands.addCoPremise;
		} else if (alt && e.code === 'KeyO') {
			command = commands.addObjection;
		} else if (alt && e.code === 'KeyT') {
			const idea = mapModel.findIdeaById(mapModel.getSelectedNodeId());
			command = (idea && idea.attr && idea.attr.group) ?
				commands.toggleReasonObjection : commands.toggleImplicit;
		} else if (alt && e.code === 'KeyN') {
			command = commands.addSticky;
		} else if (bare && e.key === 'z') {
			command = commands.zoomIn;
		} else if (e.shiftKey && !e.altKey && !e.metaKey && !e.ctrlKey && e.key === 'Z') {
			command = commands.zoomOut;
		}
		if (command) {
			e.preventDefault();
			e.stopImmediatePropagation();
			command();
		}
	}, true);
}
