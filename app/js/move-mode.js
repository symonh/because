/*global document, window*/
/*
 * Edit > Move… (M): everything a drag does, without dragging (WCAG 2.1.1,
 * 2.5.7). The selection is picked up; then either a claim or bracket is
 * chosen — clicked, or reached with the arrow keys and Enter — and the
 * selection is attached there, or blank canvas is clicked and it is placed
 * there, standing free. Escape puts it back down where it was.
 *
 * Both endings go through the calls a drag ends in: mapModel.dropNode
 * (which drop-policy.js wraps in the argument grammar) and
 * mapModel.positionNodeAt with a manual position, so a move and a drag
 * write the same map data.
 */

const isGroup = n => !!(n && n.attr && n.attr.group),
	hasChildren = n => !!(n && n.ideas && Object.keys(n.ideas).length),
	domId = id => ('node_' + id).replace(/[^A-Za-z0-9_-]/g, '_');

export function makeMoveMode(engine) {
	const mapModel = engine.mapModel,
		container = document.getElementById('map-container');
	let movingId = null,
		banner = null;

	const content = () => mapModel.getIdea(),
		titleOf = function (node) {
			if (isGroup(node)) {
				return node.attr.group === 'opposing' ? 'the objection' : 'the reason';
			}
			const text = String((node && node.title) || '').replace(/<[^>]+>/g, '').trim();
			return text ? '“' + (text.length > 40 ? text.slice(0, 40) + '…' : text) + '”' : 'the claim';
		},
		sourceEl = () => movingId !== null && document.getElementById(domId(movingId)),
		end = function () {
			const el = sourceEl();
			if (el) { el.classList.remove('move-source'); }
			movingId = null;
			document.body.classList.remove('moving');
			if (banner) {
				banner.remove();
				banner = null;
				window.dispatchEvent(new window.Event('because:chrome'));
			}
		},
		// a node cannot go inside itself, and dropping it on its own parent
		// would only take it out and put it back
		canAttachTo = function (targetId) {
			const c = content(),
				moving = c && c.findSubIdeaById(movingId),
				parent = c && c.findParent(movingId);
			return !!(moving && targetId !== undefined && targetId !== null &&
				String(targetId) !== String(movingId) &&
				!moving.findSubIdeaById(targetId) &&
				!(parent && String(parent.id) === String(targetId)));
		},
		attachTo = function (targetId) {
			if (!canAttachTo(targetId)) { return false; }
			const id = movingId;
			end();
			mapModel.dropNode(id, targetId, false);
			mapModel.selectNode(id);
			return true;
		},
		// stage coordinates of a point on screen, read off any drawn node:
		// its layout x/y and where it sits on screen give the offset, and
		// the stage's scale converts screen pixels to stage pixels
		stagePoint = function (clientX, clientY) {
			const any = container.querySelector('.mapjs-node'),
				stage = container.querySelector('[data-mapjs-role=stage]');
			if (!any || !stage) { return null; }
			const d = window.jQuery(any).data(),
				r = any.getBoundingClientRect(),
				scale = window.jQuery(stage).data('scale') || 1;
			return { x: d.x + (clientX - r.left) / scale, y: d.y + (clientY - r.top) / scale };
		},
		placeAt = function (clientX, clientY) {
			const c = content(),
				id = movingId,
				point = stagePoint(clientX, clientY),
				layout = mapModel.getCurrentLayout(),
				box = layout && layout.nodes && layout.nodes[id];
			if (!c || !point || !box) { return false; }
			const parent = c.findParent(id);
			end();
			c.batch(function () {
				mapModel.positionNodeAt(id, Math.round(point.x - box.width / 2),
					Math.round(point.y - box.height / 2), true);
				// as with a drag, a bracket left with no premises goes too
				if (isGroup(parent) && !hasChildren(c.findSubIdeaById(parent.id))) {
					c.removeSubIdea(parent.id);
				}
			});
			mapModel.selectNode(id);
			return true;
		};

	// capture phase, registered before the shortcuts: while moving, Enter
	// means "attach here" and Escape means "cancel", not their usual commands
	window.addEventListener('keydown', function (e) {
		if (movingId === null) { return; }
		if (e.key === 'Escape') {
			e.preventDefault();
			e.stopImmediatePropagation();
			end();
		} else if (e.key === 'Enter' && !e.altKey && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
			e.preventDefault();
			e.stopImmediatePropagation();
			attachTo(mapModel.getSelectedNodeId());
		}
	}, true);

	container.addEventListener('click', function (e) {
		if (movingId === null) { return; }
		e.preventDefault();
		e.stopPropagation();
		const nodeEl = e.target.closest && e.target.closest('.mapjs-node');
		if (nodeEl) {
			const id = window.jQuery(nodeEl).data('id');
			attachTo(id !== undefined ? id : nodeEl.id.replace(/^node_/, ''));
		} else {
			placeAt(e.clientX, e.clientY);
		}
	}, true);

	return {
		isMoving: () => movingId !== null,
		begin() {
			const c = content(),
				id = mapModel.getSelectedNodeId(),
				node = c && id !== undefined && c.findSubIdeaById(id);
			if (!node) { return; }
			end();
			movingId = id;
			document.body.classList.add('moving');
			const el = sourceEl();
			if (el) { el.classList.add('move-source'); }
			banner = document.createElement('div');
			banner.className = 'move-banner';
			banner.setAttribute('role', 'status');
			document.body.appendChild(banner);
			window.dispatchEvent(new window.Event('because:chrome'));
			// filled after insertion, so the live region announces it
			window.requestAnimationFrame(function () {
				if (banner) {
					banner.textContent = 'Moving ' + titleOf(node) + '. Click a claim, or choose one with the ' +
						'arrow keys and press Enter, to attach it there; click blank canvas to place it there. ' +
						'Escape cancels.';
				}
			});
		},
		cancel: end
	};
}
