/*global window, document*/
/*
 * philmaps.com keyboard map (the one Simon's students learned):
 *   Enter  add reason under selected claim
 *   Tab    add co-premise to selected claim
 *   Alt+O  add objection
 *   Alt+Q  add neutral connector — uninterpreted, for questions and their
 *   answers ("Q" for question; Alt+N was already the sticky note). Bound only
 *   while View > Allow neutral connectors is on: with it off the key is not
 *   intercepted at all, so it reaches the browser exactly as it used to.
 *   T (or Alt+T)  toggle reason/objection (bracket) or implicit/explicit (claim)
 *   d      detach the selection (a claim, or a whole reason/objection)
 *   Alt+N  add sticky note
 *   z / Shift+z  zoom in / out
 *   Shift+t  dark mode on / off (a view preference; map data is untouched)
 *   ?      the keyboard reference (shortcut-help.js, which documents this map)
 *   ⌘B / ⌘I / ⌘U  bold / italic / underline the selected claim's title
 *   (inside the text editor the same keys format the text selection)
 *   ⌘C / ⌘V  copy the selected claim + its subtree; paste it as a reason
 *   under the selection (inside the text editor the same keys copy/paste text)
 *   ⌘⇧. / ⌘⇧,  bigger / smaller claim text (attr.style.fontMultiplier)
 *   ⌘Z / ⌘⇧Z  undo / redo — mapjs never bound these (undo lived in the
 *   MindMup app layer); unconsumed ⌘Z reaches Safari's own Edit > Undo,
 *   whose top item is often "Undo Close Tab" — it reopened tabs mid-edit
 * Registered in the capture phase so they pre-empt the engine's default
 * mind-map bindings (plain Enter would otherwise add a bare child).
 * preventDefault/stopImmediatePropagation run BEFORE the command so the
 * engine's own binding cannot also fire if the command throws.
 * Arrows / F2 / delete / undo-redo stay with the engine's own handlers.
 */

export function bindShortcuts(engine, commands, neutralPref) {
	const mapModel = engine.mapModel;
	window.addEventListener('keydown', function (e) {
		if (!mapModel.getInputEnabled()) { return; } // editing a node title
		const tag = (e.target && e.target.tagName) || '';
		if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) { return; }
		// map-scoped only (WCAG 2.1.1/2.1.4): with focus in the chrome —
		// toolbar, menus, dialogs, popovers — Tab must move focus and
		// Enter must activate the focused control, so nothing is
		// intercepted there. Body counts as map scope ("open a map,
		// press Enter" must keep working with nothing focused) EXCEPT
		// for Tab: from the resting state Tab has to walk into the
		// chrome, or the toolbar and menus are unreachable by keyboard.
		// Nothing is lost — Tab-as-co-premise needs a selected node
		// with a group parent, which only happens with focus in the map.
		const container = document.getElementById('map-container'),
			onBody = e.target === document.body;
		if (!onBody && !(container && container.contains(e.target))) { return; }
		if (onBody && e.key === 'Tab') { return; }
		const alt = e.altKey && !e.metaKey && !e.ctrlKey,
			bare = !e.altKey && !e.metaKey && !e.ctrlKey,
			mod = (e.metaKey || e.ctrlKey) && !e.altKey;
		let command = null;
		// ⌘/⌃ + letter shortcuts key off the CHARACTER the pressed key
		// produces (e.key), not its physical QWERTY slot (e.code). macOS binds
		// Cmd shortcuts to the character, so on a non-QWERTY layout (Colemak-DH,
		// Dvorak…) ⌘C/⌘V/⌘Z/⌘B/⌘I/⌘U must follow wherever those letters are
		// typed — exactly as every native app does. e.code pinned them to the
		// QWERTY position, so they silently died once the layout moved a letter.
		// (Punctuation shortcuts below stay on e.code: ,./ don't move in these
		// layouts and a shifted-punctuation e.key is layout-noisy.)
		const modLetter = (e.key && e.key.length === 1) ? e.key.toLowerCase() : '';
		if (mod && modLetter === 'z') {
			command = e.shiftKey ? commands.redo : commands.undo;
		} else if (mod && !e.shiftKey && modLetter === 'y') {
			command = commands.redo;
		} else if (mod && !e.shiftKey && modLetter === 'b') {
			// on a selected node these format the whole title; while editing
			// they never reach here (contenteditable guard above) and the
			// text editor applies them to the selection instead
			command = commands.toggleBold;
		} else if (mod && !e.shiftKey && modLetter === 'i') {
			command = commands.toggleItalic;
		} else if (mod && !e.shiftKey && modLetter === 'u') {
			command = commands.toggleUnderline;
		} else if (mod && !e.shiftKey && modLetter === 'c') {
			// on a selected node this copies the claim + subtree; while editing
			// the contenteditable guard above lets ⌘C copy the text selection
			command = commands.copy;
		} else if (mod && !e.shiftKey && modLetter === 'v') {
			command = commands.paste;
		} else if (mod && e.shiftKey && e.code === 'Period') {
			command = commands.fontBigger;
		} else if (mod && e.shiftKey && e.code === 'Comma') {
			command = commands.fontSmaller;
		} else if (bare && e.key === 'Enter') {
			command = commands.addReason;
		} else if (bare && e.key === 'Tab') {
			command = commands.addCoPremise;
		} else if (alt && e.code === 'KeyO') {
			command = commands.addObjection;
		} else if (alt && e.code === 'KeyQ' && neutralPref && neutralPref.isOn()) {
			command = commands.addNeutral;
		} else if ((bare && e.key === 't') || (alt && e.code === 'KeyT')) {
			// T toggles whatever is selected: a bracket flips
			// reason ⇄ objection, a claim flips implicit ⇄ explicit
			const idea = mapModel.findIdeaById(mapModel.getSelectedNodeId());
			command = (idea && idea.attr && idea.attr.group) ?
				commands.toggleReasonObjection : commands.toggleImplicit;
		} else if (bare && e.key === 'd') {
			command = commands.detachNode;
		} else if (alt && e.code === 'KeyN') {
			command = commands.addSticky;
		} else if (bare && e.key === 'z') {
			command = commands.zoomIn;
		} else if (e.shiftKey && !e.altKey && !e.metaKey && !e.ctrlKey && e.key === 'Z') {
			command = commands.zoomOut;
		} else if (e.shiftKey && !e.altKey && !e.metaKey && !e.ctrlKey && e.key === 'T') {
			// shifted T is free: bare t (toggle the selection) tests for the
			// lower-case character, so it never sees this one
			command = commands.toggleDarkMode;
		} else if (!e.altKey && !e.metaKey && !e.ctrlKey && e.key === '?') {
			// the character, not Shift+/: on layouts where ? is unshifted or
			// sits elsewhere it stays wherever the user types it. mapjs binds
			// bare / to collapse through a keypress handler, which never runs
			// once this preventDefault lands
			command = commands.showShortcuts;
		}
		if (command) {
			e.preventDefault();
			e.stopImmediatePropagation();
			command();
		}
	}, true);
}
