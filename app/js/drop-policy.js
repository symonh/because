/*
 * Argument-grammar drag-and-drop policy.
 *
 * The stock mapjs dropNode reparents the dragged node directly under the
 * drop target, which in argument-mapping terms turns a claim into a bare
 * mind-map child — neither reason nor objection, no bracket. In this
 * grammar a claim dropped onto another claim becomes a supporting reason:
 * it gets wrapped in a fresh green group (a new independent reason;
 * Alt+T flips it to an objection afterwards). Dropping onto a group keeps
 * the stock behavior, which is already correct — the claim joins the
 * group as a co-premise. Groups and sticky notes also keep stock behavior:
 * moving a group moves the whole bracket, and stickies are never reasons.
 *
 * A reason group whose last premise is dragged away is removed in the same
 * batch, so no empty bracket is left behind and a single undo restores both.
 */

const GROUP_ATTR = { contentLocked: true, group: 'supporting' },
	isGroup = n => !!(n && n.attr && n.attr.group),
	isSticky = n => !!(n && n.attr && Array.isArray(n.attr.styleNames) &&
		n.attr.styleNames.indexOf('sticky_note') >= 0),
	isClaim = n => n && !isGroup(n) && !isSticky(n),
	hasChildren = n => !!(n && n.ideas && Object.keys(n.ideas).length);

export function installDropPolicy(mapModel) {
	const stockDropNode = mapModel.dropNode.bind(mapModel);

	mapModel.dropNode = function (nodeId, dropTargetId, shiftKey) {
		const content = mapModel.getIdea(),
			dropped = content && content.findSubIdeaById(nodeId),
			target = content && content.findSubIdeaById(dropTargetId),
			oldParent = content && content.findParent(nodeId),
			wrapInGroup = isClaim(dropped) && isClaim(target) &&
				nodeId !== dropTargetId &&
				!(oldParent && oldParent.id === dropTargetId) &&
				!(dropped && dropped.findSubIdeaById(dropTargetId));

		if (!content) {
			return stockDropNode(nodeId, dropTargetId, shiftKey);
		}
		if (!wrapInGroup) {
			let result = false;
			content.batch(function () {
				result = stockDropNode(nodeId, dropTargetId, shiftKey);
				// a co-premise moved between groups can empty its old group
				if (result && isGroup(oldParent) && !hasChildren(oldParent)) {
					content.removeSubIdea(oldParent.id);
				}
			});
			return result;
		}
		if (shiftKey) {
			// shift-drop copies: the clone becomes a new reason for the target
			const clone = content.clone(nodeId);
			if (clone) {
				content.batch(function () {
					const groupId = content.addSubIdea(dropTargetId, 'group', undefined, GROUP_ATTR);
					if (groupId) { content.paste(groupId, clone); }
				});
			}
			return false;
		}
		let moved = false;
		content.batch(function () {
			const groupId = content.addSubIdea(dropTargetId, 'group', undefined, GROUP_ATTR);
			moved = !!(groupId && content.changeParent(nodeId, groupId));
			if (!moved && groupId) {
				content.removeSubIdea(groupId);
			}
			if (moved && isGroup(oldParent) && !hasChildren(oldParent)) {
				content.removeSubIdea(oldParent.id);
			}
		});
		return moved;
	};
}
