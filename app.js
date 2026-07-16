/* ArgumentBase — a standalone argument-map editor.
 *
 * Reads and writes the MindMup `.mup` format (formatVersion 3) natively, and
 * renders argument maps in the "How We Argue" / MindMup argument-visualization
 * style: a claim at the top, supporting (green) and opposing (red) reason
 * groups joined by brackets, co-premises sharing a bracket, implicit premises
 * drawn with a dotted blue border, yellow sticky-note annotations, and numbered
 * badges computed on the fly.
 *
 * No build step, no dependencies, no network. Everything is in this file.
 */
(function (global) {
	'use strict';

	// ---- format constants --------------------------------------------------
	const SUPPORTING = 'supporting', OPPOSING = 'opposing';
	const STYLE_IMPLICIT = 'attr_implicit_claim';
	const STYLE_STICKY = 'sticky_note';

	// ---- layout constants --------------------------------------------------
	const PAD_X = 12, PAD_Y = 9;          // node text padding
	const LINE_H = 19;                     // text line height
	const FONT = '14px "Helvetica Neue", Arial, sans-serif';
	const FONT_CLAIM = '15px "Helvetica Neue", Arial, sans-serif';
	const MIN_W = 90, MAX_W = 240;         // auto width clamp (px, content box)
	const V_GAP = 74;                      // parent bottom -> premise top
	const BRACKET_RISE = 26;               // premise top -> bracket line
	const PREM_GAP = 18;                   // gap between co-premises
	const GROUP_GAP = 44;                  // gap between groups under one node
	const CORNER = 6;

	// ---- text measurement --------------------------------------------------
	const _canvas = document.createElement('canvas');
	const _ctx = _canvas.getContext('2d');
	function wrapText(text, maxW, font) {
		_ctx.font = font;
		const words = String(text == null ? '' : text).split(/\s+/);
		const lines = [];
		let line = '';
		for (const w of words) {
			const test = line ? line + ' ' + w : w;
			if (_ctx.measureText(test).width > maxW && line) {
				lines.push(line);
				line = w;
			} else {
				line = test;
			}
		}
		if (line) lines.push(line);
		if (!lines.length) lines.push('');
		let width = 0;
		for (const l of lines) width = Math.max(width, _ctx.measureText(l).width);
		return { lines, width };
	}

	// ---- model normalization ----------------------------------------------
	function attrOf(node) { return node.attr || (node.attr = {}); }
	function styleNames(node) {
		const sn = attrOf(node).styleNames;
		return Array.isArray(sn) ? sn : [];
	}
	function isGroup(node) {
		const g = attrOf(node).group;
		return g === SUPPORTING || g === OPPOSING;
	}
	function isSticky(node) { return styleNames(node).indexOf(STYLE_STICKY) >= 0; }
	function isImplicit(node) { return styleNames(node).indexOf(STYLE_IMPLICIT) >= 0; }

	function childrenOf(node) {
		const ideas = node.ideas || {};
		return Object.keys(ideas)
			.map(k => ({ rank: parseFloat(k), node: ideas[k] }))
			.sort((a, b) => a.rank - b.rank)
			.map(x => x.node);
	}

	// Build a render tree from a content node. Content nodes hold group nodes;
	// group nodes hold premise (content) nodes + stickies. Stray sticky/content
	// children directly under a content node are attached as loose annotations.
	function build(node, depth) {
		const kids = childrenOf(node);
		const groups = [];
		const stickies = [];
		for (const k of kids) {
			if (isGroup(k)) {
				const premises = [];
				const gstickies = [];
				for (const p of childrenOf(k)) {
					if (isSticky(p)) gstickies.push({ raw: p, title: p.title });
					else premises.push(build(p, depth + 1));
				}
				groups.push({ raw: k, type: attrOf(k).group, premises, stickies: gstickies });
			} else if (isSticky(k)) {
				stickies.push({ raw: k, title: k.title });
			} else {
				// a bare content child (rare) — treat as an implicit single-node group
				groups.push({ raw: null, type: SUPPORTING, premises: [build(k, depth + 1)], stickies: [] });
			}
		}
		return { raw: node, title: node.title, depth, groups, stickies, implicit: isImplicit(node), sticky: isSticky(node) };
	}

	// ---- measure + layout --------------------------------------------------
	function measure(rt) {
		const font = rt.depth === 0 ? FONT_CLAIM : FONT;
		const st = attrOf(rt.raw).style || {};
		const targetW = st.width ? Math.max(40, st.width - PAD_X * 2) : MAX_W;
		const { lines, width } = wrapText(rt.title, targetW, font);
		rt.lines = lines;
		rt.w = Math.min(Math.max(width, MIN_W), st.width ? st.width : MAX_W) + PAD_X * 2;
		if (st.width) rt.w = st.width;
		rt.h = lines.length * LINE_H + PAD_Y * 2;
		return rt;
	}

	function groupWidth(g) {
		let w = 0;
		g.premises.forEach((p, i) => { w += p.subtreeW + (i ? PREM_GAP : 0); });
		// stickies laid out to the right of the premises in-flow
		g.stickies.forEach(s => { w += PREM_GAP + stickyW(s); });
		return Math.max(w, 40);
	}
	function stickyW(s) {
		const { lines, width } = wrapText(s.title, 150, '14px "Segoe Print","Bradley Hand",cursive');
		s.lines = lines; s.w = width + 20; s.h = lines.length * 18 + 16;
		return s.w;
	}

	function layout(rt) {
		measure(rt);
		rt.groups.forEach(g => g.premises.forEach(layout));
		let groupsRow = 0;
		rt.groups.forEach((g, i) => { g.width = groupWidth(g); groupsRow += g.width + (i ? GROUP_GAP : 0); });
		// loose stickies add to the row
		let stW = 0;
		rt.stickies.forEach(s => { stW += PREM_GAP + stickyW(s); });
		rt.subtreeW = Math.max(rt.w, groupsRow) + stW;
		rt.groupsRow = groupsRow;
		return rt;
	}

	// assign absolute positions; collect draw ops
	function place(rt, x, y, out) {
		const nodeX = x + (rt.subtreeW - rt.w) / 2;
		rt.x = nodeX; rt.y = y;
		out.nodes.push(rt);

		const childY = y + rt.h + V_GAP;
		let cursor = x + (rt.subtreeW - rt.groupsRow) / 2;
		for (const g of rt.groups) {
			let pc = cursor;
			const premCenters = [];
			for (const p of g.premises) {
				place(p, pc, childY, out);
				premCenters.push(p.x + p.w / 2);
				pc += p.subtreeW + PREM_GAP;
			}
			// stickies in this group, placed after premises
			for (const s of g.stickies) {
				s.x = pc; s.y = childY; out.stickies.push(s);
				pc += s.w + PREM_GAP;
			}
			if (premCenters.length) {
				let bx1, bx2;
				if (premCenters.length === 1) {
					const p = g.premises[0];
					bx1 = p.x + 16; bx2 = p.x + p.w - 16;
					if (bx2 <= bx1) { bx1 = p.x + p.w / 2 - 8; bx2 = p.x + p.w / 2 + 8; }
				} else {
					bx1 = premCenters[0]; bx2 = premCenters[premCenters.length - 1];
				}
				const bracketY = childY - BRACKET_RISE;
				out.brackets.push({
					type: g.type, x1: bx1, x2: bx2, y: bracketY,
					parentX: rt.x + rt.w / 2, parentBottom: rt.y + rt.h,
					premTops: g.premises.map(p => ({ x: p.x + p.w / 2, y: p.y }))
				});
			}
			cursor += g.width + GROUP_GAP;
		}
		// loose stickies to the right of the whole subtree
		let sx = x + Math.max(rt.w, rt.groupsRow) + PREM_GAP;
		for (const s of rt.stickies) {
			s.x = sx; s.y = y; out.stickies.push(s);
			sx += s.w + PREM_GAP;
		}
	}

	// ---- numbering (computed, not stored) ----------------------------------
	function number(rt) {
		// breadth-first over content nodes; label = level.indexWithinLevel
		let level = [rt];
		let depth = 1;
		while (level.length) {
			let idx = 1;
			const next = [];
			for (const n of level) {
				if (!n.sticky) { n.label = depth + '.' + idx; idx++; }
				for (const g of n.groups) for (const p of g.premises) next.push(p);
			}
			level = next;
			depth++;
		}
	}

	// ---- SVG rendering -----------------------------------------------------
	const SVGNS = 'http://www.w3.org/2000/svg';
	function el(name, attrs) {
		const e = document.createElementNS(SVGNS, name);
		for (const k in attrs) e.setAttribute(k, attrs[k]);
		return e;
	}
	const GREEN = '#3f9c53', RED = '#d1483a', BLUE = '#22AAE0';

	function bracketPath(b) {
		const left = b.x1, right = b.x2, y = b.y;
		const r = Math.max(2, Math.min(12, (right - left) / 2));
		// horizontal line with ends curving down toward the premises
		return `M ${left} ${y + r} Q ${left} ${y} ${left + r} ${y} `
			+ `L ${right - r} ${y} Q ${right} ${y} ${right} ${y + r}`;
	}

	function render(doc, host, controller) {
		host.innerHTML = '';
		const roots = childrenOf(doc).filter(n => !isGroup(n));
		if (!roots.length) { return { width: 0, height: 0 }; }

		const out = { nodes: [], brackets: [], stickies: [] };
		let x = 40;
		const trees = [];
		for (const r of roots) {
			const rt = build(r, 0);
			layout(rt);
			number(rt);
			place(rt, x, 40, out);
			trees.push(rt);
			x += rt.subtreeW + 80;
		}

		// compute extent
		let maxX = 0, maxY = 0;
		const consider = (o) => { maxX = Math.max(maxX, o.x + (o.w || 0)); maxY = Math.max(maxY, o.y + (o.h || 0)); };
		out.nodes.forEach(consider); out.stickies.forEach(consider);
		const W = maxX + 60, H = maxY + 60;

		const svg = el('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, class: 'argmap-svg' });
		const gLinks = el('g', {}), gNodes = el('g', {});
		svg.appendChild(gLinks); svg.appendChild(gNodes);

		// brackets + connectors (draw under nodes)
		for (const b of out.brackets) {
			const color = b.type === OPPOSING ? RED : GREEN;
			const cx = (b.x1 + b.x2) / 2;
			// stem: parent bottom -> bracket line center
			gLinks.appendChild(el('path', {
				d: `M ${b.parentX} ${b.parentBottom} L ${b.parentX} ${b.y} L ${cx} ${b.y}`,
				fill: 'none', stroke: color, 'stroke-width': 2
			}));
			// bracket + premise risers (always draw a spanning bracket)
			gLinks.appendChild(el('path', { d: bracketPath(b), fill: 'none', stroke: color, 'stroke-width': 2 }));
			for (const t of b.premTops) {
				gLinks.appendChild(el('path', { d: `M ${t.x} ${b.y} L ${t.x} ${t.y}`, fill: 'none', stroke: color, 'stroke-width': 2 }));
			}
		}

		// nodes
		for (const n of out.nodes) drawNode(gNodes, n, controller);
		// stickies
		for (const s of out.stickies) drawSticky(gNodes, s, controller);

		host.appendChild(svg);
		return { svg, width: W, height: H };
	}

	function drawNode(g, n, controller) {
		const st = attrOf(n.raw).style || {};
		const bg = st.background || (st.backgroundColor) || '#ffffff';
		const selected = controller && controller.selectedId === n.raw.id;
		const grp = el('g', { class: 'node', 'data-id': n.raw.id, transform: `translate(${n.x},${n.y})` });
		const rect = el('rect', {
			width: n.w, height: n.h, rx: CORNER, ry: CORNER,
			fill: bg,
			stroke: n.implicit ? BLUE : (selected ? '#f5a623' : '#8a8a8a'),
			'stroke-width': n.implicit ? 2.5 : (selected ? 2.5 : 1.2),
			'stroke-dasharray': n.implicit ? '2,4' : (selected ? '' : ''),
			filter: 'url(#nodeshadow)'
		});
		if (n.implicit) rect.setAttribute('stroke-linecap', 'round');
		grp.appendChild(rect);
		const font = n.depth === 0 ? FONT_CLAIM : FONT;
		const fontSize = n.depth === 0 ? 15 : 14;
		const text = el('text', { x: PAD_X, y: PAD_Y + fontSize - 2, fill: '#4a4a4a', 'font-family': font.replace(/^\d+px /, ''), 'font-size': fontSize });
		n.lines.forEach((ln, i) => {
			const ts = el('tspan', { x: PAD_X, dy: i ? LINE_H : 0 });
			ts.textContent = ln;
			text.appendChild(ts);
		});
		grp.appendChild(text);
		// numbered badge
		if (n.label) {
			const bx = n.w - 4, by = -4;
			grp.appendChild(el('circle', { cx: bx, cy: by, r: 12, fill: '#eaf6fc', stroke: BLUE, 'stroke-width': 1.5 }));
			const bl = el('text', { x: bx, y: by + 4, fill: '#2b8fc0', 'font-size': 11, 'font-weight': 'bold', 'text-anchor': 'middle', 'font-family': 'Arial, sans-serif' });
			bl.textContent = n.label;
			grp.appendChild(bl);
		}
		if (controller) {
			grp.style.cursor = 'pointer';
			grp.addEventListener('mousedown', e => { e.stopPropagation(); controller.select(n.raw.id); });
			grp.addEventListener('dblclick', e => { e.stopPropagation(); controller.editNode(n.raw.id); });
		}
		g.appendChild(grp);
	}

	function drawSticky(g, s, controller) {
		const grp = el('g', { class: 'sticky', 'data-id': s.raw.id, transform: `translate(${s.x},${s.y})` });
		const implicit = isImplicit(s.raw);
		grp.appendChild(el('rect', {
			width: s.w, height: s.h, rx: 2, fill: '#fdfd96',
			stroke: implicit ? BLUE : '#e4e46a', 'stroke-width': implicit ? 2.5 : 1,
			'stroke-dasharray': implicit ? '2,4' : '', filter: 'url(#nodeshadow)'
		}));
		const text = el('text', { x: 10, y: 18, fill: '#5b5b3a', 'font-size': 14, 'font-family': '"Segoe Print","Bradley Hand","Comic Sans MS",cursive' });
		(s.lines || [s.title]).forEach((ln, i) => {
			const ts = el('tspan', { x: 10, dy: i ? 18 : 0 }); ts.textContent = ln; text.appendChild(ts);
		});
		grp.appendChild(text);
		if (controller) {
			grp.style.cursor = 'pointer';
			grp.addEventListener('mousedown', e => { e.stopPropagation(); controller.select(s.raw.id); });
			grp.addEventListener('dblclick', e => { e.stopPropagation(); controller.editNode(s.raw.id); });
		}
		g.appendChild(grp);
	}

	// ---- document mutation helpers -----------------------------------------
	function maxId(doc) {
		let m = 0;
		(function scan(n) {
			const id = n.id;
			if (typeof id === 'number') m = Math.max(m, id);
			else if (typeof id === 'string') { const num = parseInt(id, 10); if (!isNaN(num)) m = Math.max(m, num); }
			for (const c of childrenOf(n)) scan(c);
		})(doc);
		return m;
	}
	function nextRank(node) {
		const ideas = node.ideas || (node.ideas = {});
		let m = 0;
		for (const k of Object.keys(ideas)) m = Math.max(m, parseFloat(k));
		return m + 1;
	}
	function findParent(doc, id) {
		let res = null;
		(function scan(n) {
			for (const c of childrenOf(n)) {
				if (c.id === id) { res = n; return; }
				scan(c);
			}
		})(doc);
		return res;
	}
	function findNode(doc, id) {
		let res = null;
		(function scan(n) {
			if (n.id === id) { res = n; return; }
			for (const c of childrenOf(n)) scan(c);
		})(doc);
		return res;
	}

	global.ArgMap = {
		render, build, layout, number,
		isGroup, isSticky, isImplicit, styleNames, attrOf, childrenOf,
		findNode, findParent, maxId, nextRank,
		SUPPORTING, OPPOSING, STYLE_IMPLICIT, STYLE_STICKY
	};
})(window);
