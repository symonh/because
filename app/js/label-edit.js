/*global window, document*/
/*
 * Inline editing of connector labels ("because…", "Rachels' central
 * argument"). mapjs dispatches lineLabelClicked when the label text on a
 * connector is tapped and — like undo and click-to-select — leaves acting
 * on it to the application layer; this module is that layer.
 *
 * The label is stored on the CHILD node as attr.parentConnector.label
 * (the .mup format MindMup used), so it round-trips through existing
 * files. Clearing the text removes the override, falling back to the
 * theme's default label ("because…" in the high-impact theme, nothing in
 * the simple one).
 */

export function makeLabelEdit(engine) {
	const mapModel = engine.mapModel;
	let activeInput = null;

	const connectorDomId = c => 'connector_' + c.from + '_' + c.to,
		isGroup = n => !!(n && n.attr && n.attr.group);

	function beginEdit(connector) {
		if (activeInput) { return; }
		const content = mapModel.getIdea(),
			node = content && content.findSubIdeaById(connector.to),
			group = document.getElementById(connectorDomId(connector)),
			anchor = (group && group.querySelector('text')) || group,
			container = document.getElementById('map-container');
		if (!node || !anchor || !container) { return; }

		const current = (node.attr && node.attr.parentConnector &&
				node.attr.parentConnector.label) || '',
			rect = anchor.getBoundingClientRect(),
			crect = container.getBoundingClientRect(),
			input = document.createElement('input');
		input.type = 'text';
		input.className = 'connector-label-editor';
		input.value = current;
		input.style.left = Math.max(4, rect.left - crect.left + rect.width / 2 - 110) + 'px';
		input.style.top = Math.max(4, rect.top - crect.top + rect.height / 2 - 14) + 'px';
		container.appendChild(input);
		activeInput = input;
		mapModel.setInputEnabled(false, true); // engine hotkeys off while typing
		input.focus();
		input.select();

		const finish = function (commit) {
			if (!activeInput) { return; }
			const value = input.value.trim();
			activeInput = null;
			input.remove();
			mapModel.setInputEnabled(true);
			if (commit && value !== current) {
				content.mergeAttrProperty(connector.to, 'parentConnector', 'label', value || false);
			}
		};
		input.addEventListener('keydown', function (e) {
			e.stopPropagation();
			if (e.key === 'Enter') { finish(true); }
			if (e.key === 'Escape') { finish(false); }
		});
		input.addEventListener('blur', () => finish(true));
	}

	mapModel.addEventListener('lineLabelClicked', beginEdit);

	return {
		// menu path — works even when no label text is rendered to click.
		// The labelled connector in this grammar runs from a claim to its
		// bracket, so a selected premise resolves to its bracket first.
		editSelectedConnectorLabel() {
			const content = mapModel.getIdea(),
				selectedId = mapModel.getSelectedNodeId(),
				selected = selectedId && content && content.findSubIdeaById(selectedId);
			if (!selected) { return; }
			const parent = content.findParent(selected.id),
				target = (!isGroup(selected) && isGroup(parent)) ? parent : selected,
				targetParent = content.findParent(target.id);
			if (!targetParent || !targetParent.id) { return; }
			beginEdit({ from: targetParent.id, to: target.id });
		}
	};
}
