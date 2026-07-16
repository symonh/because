/*
 * Argument-mapping commands over the raw mapModel. Every UI surface
 * (toolbar, menus, shortcuts) goes through these, so the argument grammar
 * stays consistent: claims get reasons/objections (bracketed groups) and
 * co-premises, never bare mind-map children — except sticky notes.
 */

const SOURCE = 'ui';

export function makeCommands(engine) {
	const mapModel = engine.mapModel,
		idea = () => mapModel.getIdea(),
		selectedId = () => mapModel.getSelectedNodeId(),
		selectedIdea = () => mapModel.findIdeaById(selectedId()),
		findParent = id => idea() && idea().findParent(id),
		isGroup = n => n && n.attr && n.attr.group,
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
		editNode() { mapModel.editNode(SOURCE, false, false); },
		deleteNode() { mapModel.removeSubIdea(SOURCE); },
		undo() { mapModel.undo(SOURCE); },
		redo() { mapModel.redo(SOURCE); },
		toggleImplicit() {
			const node = selectedIdea();
			if (node && !isGroup(node)) { toggleStyleName(node.id, 'attr_implicit_claim'); }
		},
		toggleReasonObjection() {
			// flips the group that contains the selection (or the selected
			// group itself) between supporting and opposing
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
		toggleCollapse() { mapModel.toggleCollapse(SOURCE); },
		zoomIn() { mapModel.scaleUp(SOURCE); },
		zoomOut() { mapModel.scaleDown(SOURCE); },
		zoomReset() { mapModel.resetView(SOURCE); },
		toggleNumbering() { engine.setLabelsOn(!engine.getLabelsOn()); }
	};
	return commands;
}
