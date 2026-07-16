/* ArgumentBase — a standalone argument-map editor.
 *
 * Reads and writes the MindMup `.mup` format (formatVersion 3) natively, and
 * renders argument maps in the MindMup argument-visualization style: a claim at
 * the top; supporting (green) and opposing (red) reason groups joined by
 * brackets; co-premises sharing one bracket; implicit premises with a dotted
 * border; yellow sticky-note annotations; and numbered badges computed on the
 * fly. Layout is a tidy top-down tree (each parent centered over its children).
 *
 * No build step, no dependencies, no network. Everything is in this file.
 */
(function (global) {
	'use strict';

	// ---- format constants --------------------------------------------------
	const SUPPORTING = 'supporting', OPPOSING = 'opposing';
	const STYLE_IMPLICIT = 'attr_implicit_claim';
	const STYLE_STICKY = 'sticky_note';

	// ---- layout constants (tuned to MindMup's argument-mapping theme) ------
	const PAD_X = 15, PAD_Y = 12;
	const FONT_SIZE = 16, LINE_H = 22;
	const FONT_FAMILY = '"Helvetica Neue", Arial, sans-serif';
	const STICKY_FAMILY = '"Segoe Print","Bradley Hand","Comic Sans MS",cursive';
	const MIN_W = 74, MAX_W = 176;         // auto content-width clamp (px)
	const V_GAP = 84;                      // parent bottom -> child top
	const BRACKET_RISE = 26;               // premise top -> bracket bar
	const CHILD_GAP = 22;                  // gap between co-premises within a group
	const GROUP_GAP = 80;                  // gap between separate reasons/objections
	const CORNER = 8;
	const GREEN = '#2e9e52', RED = '#cc4636', BLUE = '#29abe2';
	const BORDER = '#9aa0a4', TEXT = '#3b4045', SELECT = '#f5a623';
	const IMPLICIT_STROKE = '#29abe2';     // bright blue dotted (MindMup implicit)
	const BADGE_FILL = '#5b9bd5', BADGE_RING = '#cfe6fa';

	// ---- text measurement --------------------------------------------------
	const _ctx = document.createElement('canvas').getContext('2d');
	function wrapText(text, maxW, font) {
		_ctx.font = font;
		const raw = String(text == null ? '' : text);
		const paras = raw.split('\n');
		const lines = [];
		for (const para of paras) {
			const words = para.split(/\s+/).filter(Boolean);
			if (!words.length) { lines.push(''); continue; }
			let line = '';
			for (const w of words) {
				const test = line ? line + ' ' + w : w;
				if (_ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
				else line = test;
			}
			if (line) lines.push(line);
		}
		if (!lines.length) lines.push('');
		let width = 0;
		for (const l of lines) width = Math.max(width, _ctx.measureText(l).width);
		return { lines, width };
	}

	// ---- model helpers -----------------------------------------------------
	function attrOf(node) { return (node && node.attr) || (node ? (node.attr = {}) : {}); }
	function styleNames(node) { const sn = attrOf(node).styleNames; return Array.isArray(sn) ? sn : []; }
	function isGroup(node) { const g = attrOf(node).group; return g === SUPPORTING || g === OPPOSING; }
	function isSticky(node) { return styleNames(node).indexOf(STYLE_STICKY) >= 0; }
	function isImplicit(node) { return styleNames(node).indexOf(STYLE_IMPLICIT) >= 0; }
	function isCollapsed(node) { return attrOf(node).collapsed === true; }
	function childrenOf(node) {
		const ideas = (node && node.ideas) || {};
		return Object.keys(ideas)
			.map(k => ({ rank: parseFloat(k), node: ideas[k] }))
			.sort((a, b) => a.rank - b.rank)
			.map(x => x.node);
	}

	// Build a render tree. A content node holds group nodes; each group holds
	// premise (content) nodes + stickies. Bare content/sticky children are kept
	// as loose annotations. Collapsed nodes keep their subtree data but are
	// flagged so layout can hide it.
	function build(node, depth) {
		const rt = { raw: node, title: node.title, depth: depth,
			groups: [], stickies: [], implicit: isImplicit(node), sticky: isSticky(node),
			collapsed: isCollapsed(node) };
		if (rt.collapsed) return rt;
		for (const k of childrenOf(node)) {
			if (isGroup(k)) {
				const g = { raw: k, type: attrOf(k).group, premises: [], stickies: [] };
				for (const p of childrenOf(k)) {
					if (isSticky(p)) g.stickies.push(build(p, depth + 1));
					else g.premises.push(build(p, depth + 1));
				}
				rt.groups.push(g);
			} else if (isSticky(k)) {
				rt.stickies.push(build(k, depth + 1));
			} else {
				rt.groups.push({ raw: null, type: SUPPORTING, premises: [build(k, depth + 1)], stickies: [] });
			}
		}
		return rt;
	}

	// ---- measure -----------------------------------------------------------
	function measure(rt) {
		const st = attrOf(rt.raw).style || {};
		if (rt.sticky) {
			const tw = st.width ? Math.max(60, st.width - 20) : 165;
			const m = wrapText(rt.title, tw, FONT_SIZE + 'px ' + STICKY_FAMILY);
			rt.lines = m.lines;
			rt.w = st.width || Math.min(Math.max(m.width, 60), 210) + 20;
			rt.h = m.lines.length * 20 + 16;
			return rt;
		}
		const mult = st.fontMultiplier || 1;
		rt.fontSize = FONT_SIZE * mult;
		const lh = LINE_H * mult;
		const fam = st.fontFamily ? styleFont(st.fontFamily) : FONT_FAMILY;
		rt.fontFamily = fam;
		const target = st.width ? Math.max(40, st.width - PAD_X * 2) : MAX_W * mult;
		const m = wrapText(rt.title, target, rt.fontSize + 'px ' + fam);
		rt.lines = m.lines;
		rt.w = st.width || Math.min(Math.max(m.width, MIN_W), MAX_W * mult) + PAD_X * 2;
		rt.lineH = lh;
		rt.h = m.lines.length * lh + PAD_Y * 2;
		return rt;
	}
	function styleFont(fam) {
		if (/marker/i.test(fam)) return STICKY_FAMILY;
		if (/serif/i.test(fam)) return 'Georgia, "Times New Roman", serif';
		return FONT_FAMILY;
	}

	// direct layout children = all premises (bracketed) + stickies (loose), in
	// order. Mark the first premise of each group (after the first) so layout can
	// insert a wider gap that visually separates one bracket/group from the next.
	function layoutChildren(rt) {
		const kids = [];
		rt.groups.forEach((g, gi) => {
			g.premises.forEach((p, pi) => { p._newGroup = (pi === 0 && kids.length > 0); kids.push(p); });
			for (const s of g.stickies) { s._newGroup = false; kids.push(s); }
		});
		for (const s of rt.stickies) { s._newGroup = false; kids.push(s); }
		return kids;
	}

	// ---- tidy-tree layout: compute subtree width, parent centered on children
	function layoutTree(rt) {
		measure(rt);
		const kids = layoutChildren(rt);
		if (!kids.length) { rt.subtreeW = rt.w; rt.relCenter = rt.w / 2; rt._kids = []; return rt; }
		kids.forEach(layoutTree);
		let cursor = 0;
		kids.forEach((k, i) => {
			if (i > 0) cursor += k._newGroup ? GROUP_GAP : CHILD_GAP;
			k._rx = cursor; cursor += k.subtreeW;
		});
		const childrenW = cursor;
		const firstC = kids[0]._rx + kids[0].relCenter;
		const lastC = kids[kids.length - 1]._rx + kids[kids.length - 1].relCenter;
		const parentCenter = (firstC + lastC) / 2;
		const left = Math.min(0, parentCenter - rt.w / 2);
		const right = Math.max(childrenW, parentCenter + rt.w / 2);
		rt.subtreeW = right - left;
		rt._childShift = -left;             // add to child _rx to get subtree-local x
		rt.relCenter = parentCenter - left; // node center within subtree box
		rt._kids = kids;
		return rt;
	}

	// ---- place: assign absolute coords, emit draw ops ----------------------
	function placeTree(rt, left, top, out, hi) {
		const cx = left + rt.relCenter;
		rt.x = cx - rt.w / 2; rt.y = top;
		if (rt.sticky) out.stickies.push(rt); else out.nodes.push(rt);
		if (!rt._kids || !rt._kids.length) return;
		const childTop = top + rt.h + V_GAP;
		const base = left + rt._childShift;
		for (const k of rt._kids) placeTree(k, base + k._rx, childTop, out, hi);
		// one bracket per group, spanning that group's premise centers
		for (const g of rt.groups) {
			if (!g.premises.length) continue;
			const centers = g.premises.map(p => p.x + p.w / 2);
			let bx1, bx2;
			if (centers.length === 1) {
				const p = g.premises[0]; bx1 = p.x + 18; bx2 = p.x + p.w - 18;
				if (bx2 <= bx1) { bx1 = centers[0] - 9; bx2 = centers[0] + 9; }
			} else { bx1 = centers[0]; bx2 = centers[centers.length - 1]; }
			const bracketY = childTop - BRACKET_RISE;
			const label = connectorLabel(g, hi);
			out.brackets.push({ type: g.type, x1: bx1, x2: bx2, y: bracketY,
				parentX: cx, parentBottom: rt.y + rt.h,
				premTops: g.premises.map(p => ({ x: p.x + p.w / 2, y: p.y })), label: label });
		}
	}
	function connectorLabel(g, hi) {
		// explicit per-node parentConnector.label wins; else high-impact defaults
		for (const p of g.premises) {
			const pc = attrOf(p.raw).parentConnector;
			if (pc && pc.label) return pc.label;
		}
		if (hi) return g.type === OPPOSING ? 'but…' : 'because…';
		return null;
	}

	// ---- numbering (renderer-computed; BFS by content depth) ---------------
	function number(rt) {
		let level = [rt], depth = 1;
		while (level.length) {
			let idx = 1; const next = [];
			for (const n of level) {
				if (!n.sticky) { n.label = depth + '.' + idx; idx++; }
				if (n._kids) for (const k of n._kids) if (!k.sticky) next.push(k);
			}
			level = next; depth++;
		}
	}

	// ---- normalize canvas to positive coords -------------------------------
	function normalize(out, margin) {
		let minX = Infinity, minY = Infinity;
		const items = out.nodes.concat(out.stickies);
		for (const n of items) { minX = Math.min(minX, n.x); minY = Math.min(minY, n.y); }
		for (const b of out.brackets) { minX = Math.min(minX, b.x1, b.x2); minY = Math.min(minY, b.y); }
		if (!isFinite(minX)) return;
		const dx = margin - minX, dy = margin - minY;
		for (const n of items) { n.x += dx; n.y += dy; }
		for (const b of out.brackets) {
			b.x1 += dx; b.x2 += dx; b.y += dy; b.parentX += dx; b.parentBottom += dy;
			b.premTops = b.premTops.map(t => ({ x: t.x + dx, y: t.y + dy }));
		}
	}

	// ---- SVG rendering -----------------------------------------------------
	const SVGNS = 'http://www.w3.org/2000/svg';
	function el(name, attrs) { const e = document.createElementNS(SVGNS, name); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; }

	function bracketPath(b) {
		const left = b.x1, right = b.x2, y = b.y;
		const r = Math.max(2, Math.min(13, (right - left) / 2));
		return `M ${left} ${y + r} Q ${left} ${y} ${left + r} ${y} L ${right - r} ${y} Q ${right} ${y} ${right} ${y + r}`;
	}

	function render(doc, host, controller) {
		host.innerHTML = '';
		const themeName = (doc.attr && doc.attr.theme) || 'argMappingSimple';
		const hi = themeName === 'argMappingHighImpact';
		const showNumbers = !controller || controller.showNumbers !== false;
		const tops = childrenOf(doc).filter(n => !isGroup(n));
		const out = { nodes: [], brackets: [], stickies: [], links: [] };
		if (!tops.length) return { width: 0, height: 0 };

		// classify: argument trees (have reason groups) vs lone annotation boxes
		// (instructions, feedback, floating notes). Trees get auto-laid-out and
		// numbered; annotations go in a separated strip and are not numbered.
		const trees = [], floats = [];
		for (const t of tops) {
			const rt = build(t, 0);
			layoutTree(rt);
			const pos = attrOf(t).position;
			const hasPos = pos && pos.length >= 2 && isFinite(pos[0]);
			// a floating annotation = a sticky note, or a childless box that was
			// manually positioned off to the side. A bare claim (no premises yet,
			// no position) is a real argument root and gets numbered.
			const isFloat = rt.sticky || (!rt.groups.length && hasPos);
			if (isFloat) { rt._float = true; floats.push(rt); }
			else { number(rt); trees.push(rt); }
		}
		let cursor = 0;
		for (const rt of trees) { placeTree(rt, cursor, 0, out, hi); cursor += rt.subtreeW + 120; }
		// annotation strip to the right, stacked vertically
		let fx = (trees.length ? cursor + 20 : 0), fy = 0;
		for (const rt of floats) { placeTree(rt, fx, fy, out, hi); fy += rt.h + 26; }
		normalize(out, 46);

		let maxX = 0, maxY = 0;
		for (const n of out.nodes.concat(out.stickies)) { maxX = Math.max(maxX, n.x + n.w); maxY = Math.max(maxY, n.y + n.h); }
		const W = maxX + 46, H = maxY + 46;
		const svg = el('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, class: 'argmap-svg' });
		const gLinks = el('g', {}), gNodes = el('g', {});
		svg.appendChild(gLinks); svg.appendChild(gNodes);

		for (const b of out.brackets) drawBracket(gLinks, b);
		// cross-links (root.links) disabled for now: with our own tidy layout the
		// stored endpoints produce long diagonal lines that add noise. Re-enable
		// with proper routing later.
		for (const n of out.nodes) drawNode(gNodes, n, controller, showNumbers);
		for (const s of out.stickies) drawSticky(gNodes, s, controller);

		host.appendChild(svg);
		return { svg, width: W, height: H };
	}

	function drawBracket(g, b) {
		const color = b.type === OPPOSING ? RED : GREEN;
		const cx = (b.x1 + b.x2) / 2;
		// S-curve from the parent's bottom-centre to THIS group's bracket centre.
		// (A straight vertical when the group is centred under the parent; a smooth
		// fan-out when a node has several separate reason/objection groups — so the
		// groups never merge into one horizontal bar.)
		const midY = (b.parentBottom + b.y) / 2;
		g.appendChild(el('path', { d: `M ${b.parentX} ${b.parentBottom} C ${b.parentX} ${midY}, ${cx} ${midY}, ${cx} ${b.y}`,
			fill: 'none', stroke: color, 'stroke-width': 2.3 }));
		g.appendChild(el('path', { d: bracketPath(b), fill: 'none', stroke: color, 'stroke-width': 2.3 }));
		for (const t of b.premTops) g.appendChild(el('path', { d: `M ${t.x} ${b.y} L ${t.x} ${t.y}`, fill: 'none', stroke: color, 'stroke-width': 2.3 }));
		if (b.label) {
			const midY = (b.parentBottom + b.y) / 2;
			const t = el('text', { x: b.parentX + 6, y: midY + 4, fill: color, 'font-size': 13, 'font-style': 'italic', 'font-family': FONT_FAMILY });
			t.textContent = b.label;
			g.appendChild(t);
		}
	}

	function drawNode(g, n, controller, showNumbers) {
		const st = attrOf(n.raw).style || {};
		const bg = st.backgroundColor || st.background || '#ffffff';
		const selected = controller && controller.selectedId === n.raw.id;
		const grp = el('g', { class: 'node', 'data-id': n.raw.id, transform: `translate(${n.x},${n.y})` });
		const rect = el('rect', { width: n.w, height: n.h, rx: CORNER, ry: CORNER, fill: bg,
			stroke: n.implicit ? IMPLICIT_STROKE : (selected ? SELECT : BORDER),
			'stroke-width': n.implicit ? 2.5 : (selected ? 2.4 : 1.3),
			'stroke-dasharray': n.implicit ? '2,4' : '', 'stroke-linecap': 'round',
			filter: 'url(#nodeshadow)' });
		grp.appendChild(rect);
		const tc = (st.text && st.text.color) || TEXT;
		const text = el('text', { x: PAD_X, y: PAD_Y + n.fontSize - 3, fill: tc, 'font-family': n.fontFamily, 'font-size': n.fontSize });
		n.lines.forEach((ln, i) => { const ts = el('tspan', { x: PAD_X, dy: i ? n.lineH : 0 }); ts.textContent = ln; text.appendChild(ts); });
		grp.appendChild(text);
		if (n.attr && false) { /* reserved */ }
		drawDecorations(grp, n);
		if (showNumbers && n.label) {
			const bx = n.w - 6, by = 1;
			grp.appendChild(el('circle', { cx: bx, cy: by, r: 12.5, fill: BADGE_FILL, stroke: BADGE_RING, 'stroke-width': 2.5 }));
			const bl = el('text', { x: bx, y: by + 4, fill: '#ffffff', 'font-size': 11, 'font-weight': 'bold', 'text-anchor': 'middle', 'font-family': 'Arial, sans-serif' });
			bl.textContent = n.label; grp.appendChild(bl);
		}
		if (controller) {
			grp.style.cursor = 'pointer';
			grp.addEventListener('mousedown', e => { e.stopPropagation(); controller.select(n.raw.id); });
			grp.addEventListener('dblclick', e => { e.stopPropagation(); controller.editNode(n.raw.id); });
		}
		g.appendChild(grp);
	}
	function badgeColor(n) { return '#2b8fc0'; }
	function drawDecorations(grp, n) {
		const attr = n.raw.attr || {};
		let ox = 4;
		if (attr.note && attr.note.text) { grp.appendChild(iconBadge(ox, n.h - 2, '📎')); ox += 18; }
		if (attr.attachment) { grp.appendChild(iconBadge(ox, n.h - 2, '🔗')); ox += 18; }
		if (Array.isArray(attr.stickers)) for (const s of attr.stickers) {
			const m = /emoji:([0-9a-fA-F]+)/.exec(s); if (m) { grp.appendChild(iconBadge(ox, n.h - 2, String.fromCodePoint(parseInt(m[1], 16)))); ox += 18; }
		}
	}
	function iconBadge(x, y, ch) { const t = el('text', { x: x, y: y, 'font-size': 12 }); t.textContent = ch; return t; }

	function drawSticky(g, s, controller) {
		const implicit = isImplicit(s.raw);
		const grp = el('g', { class: 'sticky', 'data-id': s.raw.id, transform: `translate(${s.x},${s.y})` });
		grp.appendChild(el('rect', { width: s.w, height: s.h, rx: 2, fill: '#fdfd9a',
			stroke: implicit ? BLUE : '#e0e070', 'stroke-width': implicit ? 2 : 1,
			'stroke-dasharray': implicit ? '2,3' : '', filter: 'url(#nodeshadow)' }));
		const text = el('text', { x: 10, y: 19, fill: '#585836', 'font-size': FONT_SIZE, 'font-family': STICKY_FAMILY });
		(s.lines || [s.title]).forEach((ln, i) => { const ts = el('tspan', { x: 10, dy: i ? 20 : 0 }); ts.textContent = ln; text.appendChild(ts); });
		grp.appendChild(text);
		if (controller) {
			grp.style.cursor = 'pointer';
			grp.addEventListener('mousedown', e => { e.stopPropagation(); controller.select(s.raw.id); });
			grp.addEventListener('dblclick', e => { e.stopPropagation(); controller.editNode(s.raw.id); });
		}
		g.appendChild(grp);
	}

	// cross-links (root.links): dashed/solid connectors between arbitrary nodes
	function buildLinks(doc, out) {
		const links = doc.links;
		if (!Array.isArray(links)) return;
		out._nodeById = {};
		for (const n of out.nodes) out._nodeById[n.raw.id] = n;
		out.links = links.filter(l => l && l.ideaIdFrom != null && l.ideaIdTo != null);
	}
	function drawLink(g, lk, out) {
		const a = out._nodeById[lk.ideaIdFrom], b = out._nodeById[lk.ideaIdTo];
		if (!a || !b) return;
		const st = (lk.attr && lk.attr.style) || {};
		const ax = a.x + a.w / 2, ay = a.y + a.h / 2, bx = b.x + b.w / 2, by = b.y + b.h / 2;
		const path = el('path', { d: `M ${ax} ${ay} L ${bx} ${by}`, fill: 'none',
			stroke: st.color || '#909090', 'stroke-width': 1.5,
			'stroke-dasharray': st.lineStyle === 'dashed' ? '4,4' : '' });
		g.appendChild(path);
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
		let m = 0; for (const k of Object.keys(ideas)) m = Math.max(m, parseFloat(k));
		return m + 1;
	}
	function findParent(doc, id) { let res = null; (function scan(n) { for (const c of childrenOf(n)) { if (c.id === id) { res = n; return; } scan(c); } })(doc); return res; }
	function findNode(doc, id) { let res = null; (function scan(n) { if (n.id === id) { res = n; return; } for (const c of childrenOf(n)) scan(c); })(doc); return res; }

	global.ArgMap = {
		render, build, layoutTree, number,
		isGroup, isSticky, isImplicit, isCollapsed, styleNames, attrOf, childrenOf,
		findNode, findParent, maxId, nextRank,
		SUPPORTING, OPPOSING, STYLE_IMPLICIT, STYLE_STICKY
	};
})(window);
