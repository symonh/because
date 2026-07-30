/*
 * site/js/argmap.js — client hydration for the argument-map figures on the
 * landing page.
 *
 * Vanilla ESM, no imports at all. The figures are already in the HTML
 * (figures/build.mjs pre-renders them with figures/lib/render.js), so this
 * module is pure enhancement: it runs the envelope layout that gives the
 * authentic MindMup geometry, draws the real S-curve connectors in place of the
 * CSS fallback stems, wires the roving-tabindex keyboard model, and manages the
 * horizontal-scroll affordances. If it never loads, the page still shows a
 * correct — just squarer — map.
 *
 * Ported from PhilMaps (src/assets/js/argmap.js). Left behind there, because
 * this site has no lessons to use them: the keyed demos (before/after states
 * with FLIP animation), the strength popover, and the quiz cards. The data
 * model and renderer are the same, so any of it can come over later —
 * docs/figures.md says where to look.
 */

const SVGNS = 'http://www.w3.org/2000/svg';

/* ========================================================= layout engine */
/*
 * Envelope layout (docs/figures.md). The authentic MindMup geometry:
 * claims inside a group pack ADJACENT (the bracket hugs them); each claim's
 * descendant subtree hangs BELOW as a block; blocks pack side by side and
 * the whole row centres; parent→child horizontal offsets are absorbed by
 * the S-curve connectors. The nested flow render stays as the no-JS
 * fallback; hydration flips the map to absolute positioning (.am-abs, all
 * wrappers display:contents) and assigns measured coordinates.
 */
/* Geometry constants at the 16px base scale; scaled by the fluid root
 * font-size so the maps ride the same escalator as the type. */
const L_BASE = {
	CLAIM_GAP: 20,   // between claims inside one group (theme h spacing)
	GROUP_GAP: 28,   // between sibling group envelopes under one claim
	FAMILY_GAP: 36,  // between child blocks (and root-level groups)
	DROP_GAP: 33,    // parent-claim bottom -> bracket bar top (curve zone)
	BRACKET_H: 13,   // 3px bar + 10px descending arms
	BRACKET_AIR: 14, // arm ends -> claim-box tops (badges stay clear)
	IO_DY: 17,       // io bar top: BELOW the green bracket's arms (13) + 4 air,
	                 // so the tail passes under them instead of crossing
	IO_CLAIM_DROP: 12, // io claims sit lower than the reason's claims (as in
	                 // the original MindMup figure), giving the red bracket
	                 // its own vertical band
	PAD_X: 24,
	PAD_TOP: 14,     // room for the root claim's straddling badge
	PAD_BOTTOM: 6
};
const L = Object.assign({}, L_BASE);
/* Geometry follows the MAP's own font size (0.9375rem base — which rides
 * the fluid root — times any fit-zoom factor), so zooming a figure scales
 * every constant coherently. */
function updateScale(map) {
	const fs = map ? parseFloat(window.getComputedStyle(map).fontSize) : 15;
	const s = (fs || 15) / 15;
	Object.keys(L_BASE).forEach(function (k) { L[k] = L_BASE[k] * s; });
}

function childEls(parent, cls) {
	return parent ? Array.prototype.filter.call(parent.children, function (el) {
		return el.classList && el.classList.contains(cls);
	}) : [];
}

/* Pack a row of placeable items, centred. `maxW` would wrap the row onto
 * further bands below, like text, but every caller passes 0: vertical level is
 * argumentative level, so a level never wraps — the fit ladder tightens the
 * wrap or zooms instead (docs/figures.md). */
function bandify(items, gap, bandGap, maxW) {
	const bands = [];
	let cur = null;
	items.forEach(function (it) {
		if (!cur || (maxW && cur.items.length && cur.w + gap + it.w > maxW)) {
			cur = { items: [], w: 0, h: 0 };
			bands.push(cur);
		}
		if (cur.items.length) { cur.w += gap; }
		it._bx = cur.w;
		cur.w += it.w;
		cur.h = Math.max(cur.h, it.h);
		cur.items.push(it);
	});
	const w = bands.reduce(function (m, b) { return Math.max(m, b.w); }, 0);
	const h = bands.reduce(function (s, b) { return s + b.h; }, 0) +
		bandGap * Math.max(0, bands.length - 1);
	return {
		w: w, h: h,
		place: function (x, y) {
			let by = y;
			bands.forEach(function (b) {
				const bx = x + (w - b.w) / 2;
				b.items.forEach(function (it) { it.place(bx + it._bx, by); });
				by += b.h + bandGap;
			});
		}
	};
}

/* claim + its own child groups, DECOUPLED: the group packs claims by claim
 * width and packs the child blocks separately below. */
function layoutWrapInGroup(wrap, maxW) {
	const claim = wrap.querySelector(':scope > .am-claim');
	const claimW = claim.offsetWidth, claimH = claim.offsetHeight;
	const groupsRow = wrap.querySelector(':scope > .am-groups');
	const envs = childEls(groupsRow, 'am-group').map(function (g) {
		return layoutGroupEnv(g, maxW);
	});
	const block = envs.length ? bandify(envs, L.GROUP_GAP, L.DROP_GAP, 0) : null;
	return {
		claim: claim, claimW: claimW, claimH: claimH,
		blockW: block ? block.w : 0, blockH: block ? block.h : 0,
		placeClaim: function (x, y) {
			claim.style.left = Math.round(x) + 'px';
			claim.style.top = Math.round(y) + 'px';
		},
		placeBlock: function (x, y) {
			if (block) { block.place(x, y); }
		}
	};
}

/* one group: bracket hugging the packed claims row; child blocks pack
 * centred below. An INFERENCE OBJECTION renders the authentic MindMup way
 * (old-site fig: basics "objecting to whole reasons"): its claims sit in
 * the SAME ROW to the right of the reason's claims, under a square red
 * bracket whose bar extends left as a tail beneath the green bracket. No
 * connector crosses the map. Returns an envelope {w,h,place}. */
function layoutGroupEnv(group, maxW) {
	const claimsRow = group.querySelector(':scope > .am-claims');
	const items = childEls(claimsRow, 'am-node-wrap').map(function (wr) {
		return layoutWrapInGroup(wr, maxW);
	});
	const packW = function (ws, gap) {
		return ws.reduce(function (s, v) { return s + v; }, 0) + gap * Math.max(0, ws.length - 1);
	};
	const rowW = packW(items.map(function (i) { return i.claimW; }), L.CLAIM_GAP);
	const rowH = items.length ? Math.max.apply(null, items.map(function (i) { return i.claimH; })) : 0;

	const ios = childEls(group, 'am-inference-objection').map(function (io) {
		const g = io.querySelector(':scope > .am-group');
		const ioItems = childEls(g && g.querySelector(':scope > .am-claims'), 'am-node-wrap')
			.map(function (wr) { return layoutWrapInGroup(wr, maxW); });
		return {
			el: io,
			items: ioItems,
			rowW: packW(ioItems.map(function (i) { return i.claimW; }), L.CLAIM_GAP),
			rowH: ioItems.length ? Math.max.apply(null, ioItems.map(function (i) { return i.claimH; })) : 0
		};
	});
	// One shared horizontal coordinate space for the whole row: main claims
	// packed adjacent, then each io section after a FAMILY_GAP.
	let off = 0;
	items.forEach(function (i, k) {
		i._rowOff = off;
		off += i.claimW;
		if (k < items.length - 1) { off += L.CLAIM_GAP; }
	});
	ios.forEach(function (io) {
		off += L.FAMILY_GAP;
		io._rowOff = off;
		io.items.forEach(function (i, k) {
			i._rowOff = off;
			off += i.claimW;
			if (k < io.items.length - 1) { off += L.CLAIM_GAP; }
		});
		off = io._rowOff + io.rowW;
	});
	const fullRowW = off;
	const fullRowH = Math.max.apply(null, [rowH].concat(
		ios.map(function (io) { return L.IO_CLAIM_DROP + io.rowH; })));

	// Child blocks are ANCHORED under their parent claims: each wants to sit
	// centred beneath its parent, shifting right only to clear an earlier
	// sibling. (An objection to claim 2.3 belongs under 2.3, not under the
	// middle of the group.)
	const blocks = [];
	items.concat(ios.reduce(function (a, io) { return a.concat(io.items); }, []))
		.forEach(function (i) {
			if (i.blockW > 0) {
				blocks.push({
					w: i.blockW, h: i.blockH, place: i.placeBlock,
					desired: i._rowOff + i.claimW / 2 - i.blockW / 2
				});
			}
		});
	// Families that collide share the displacement (weighted cluster merge):
	// a lone family stays dead-centred under its parent claim, but families
	// that must spread to clear each other split the shift between them.
	// (The old greedy push-right let the leftmost family keep perfect
	// centring while the rest absorbed all of it — which rendered as one
	// straight connector beside one huge sweep.)
	const clusters = [];
	blocks.forEach(function (b) {
		let c = { items: [{ b: b, off: 0 }], w: b.w, sum: b.desired, n: 1 };
		while (clusters.length) {
			const p = clusters[clusters.length - 1];
			if (c.sum / c.n < p.sum / p.n + p.w + L.FAMILY_GAP) {
				const shift = p.w + L.FAMILY_GAP;
				c.items.forEach(function (m) {
					m.off += shift;
					p.items.push(m);
				});
				p.sum += c.sum - c.n * shift;
				p.n += c.n;
				p.w += L.FAMILY_GAP + c.w;
				c = clusters.pop();
			} else { break; }
		}
		clusters.push(c);
	});
	clusters.forEach(function (c) {
		const pos = c.sum / c.n;
		c.items.forEach(function (m) { m.b.rel = pos + m.off; });
	});
	const blocksLeft = blocks.length
		? Math.min.apply(null, blocks.map(function (b) { return b.rel; })) : 0;
	const blocksRight = blocks.length
		? Math.max.apply(null, blocks.map(function (b) { return b.rel + b.w; })) : 0;
	let blocksH = blocks.length
		? Math.max.apply(null, blocks.map(function (b) { return b.h; })) : 0;

	let rowShift = Math.max(0, -blocksLeft);
	let w = rowShift + Math.max(fullRowW, blocksRight);
	// anchored placement first; if that exceeds the available width, fall
	// back to packed-and-centred blocks — SAME LEVEL always (the vertical
	// axis is argumentative depth and is never bent for fit)
	if (maxW && blocks.length && w > maxW) {
		const packedW = packW(blocks.map(function (b) { return b.w; }), L.FAMILY_GAP);
		const w2 = Math.max(fullRowW, packedW);
		if (w2 < w) {
			w = w2;
			rowShift = (w2 - fullRowW) / 2;
			let rel = (w2 - packedW) / 2 - rowShift;
			blocks.forEach(function (b) { b.rel = rel; rel += b.w + L.FAMILY_GAP; });
		}
	}
	const h = L.BRACKET_H + L.BRACKET_AIR + fullRowH +
		(blocks.length ? L.DROP_GAP + blocksH : 0);
	const bracket = group.querySelector(':scope > .am-bracket');

	const env = {
		w: w, h: h,
		// centre of the bracket bar within this envelope — the anchor a
		// parent centres itself over (layoutMap) for a plumb connector
		bracketCx: rowShift + fullRowW / 2,
		place: function (x, y) {
			env.x = x;
			const rowX = x + rowShift;
			if (bracket) {
				// with an inference objection the bracket embraces the WHOLE
				// row — the objection sits inside the bracket's scope
				bracket.style.left = Math.round(rowX) + 'px';
				bracket.style.top = Math.round(y) + 'px';
				bracket.style.width = Math.round(fullRowW) + 'px';
			}
			const cy = y + L.BRACKET_H + L.BRACKET_AIR;
			items.forEach(function (i) { i.placeClaim(rowX + i._rowOff, cy); });
			// io sections: claims sit slightly LOWER than the reason's claims;
			// the red bar is a square bracket over them, its tail reaching
			// back under (below the arms of) the green bracket.
			ios.forEach(function (io) {
				const bar = io.el.querySelector('.am-io-bar');
				const ix = rowX + io._rowOff;
				if (bar) {
					bar.style.left = Math.round(ix) + 'px';
					bar.style.top = Math.round(y + L.IO_DY) + 'px';
					bar.style.width = Math.round(io.rowW) + 'px';
				}
				io.items.forEach(function (i) {
					i.placeClaim(rowX + i._rowOff, cy + L.IO_CLAIM_DROP);
				});
			});
			const by = cy + fullRowH + L.DROP_GAP;
			blocks.forEach(function (b) { b.place(x + rowShift + b.rel, by); });
		}
	};
	return env;
}

/* Shrink a claim box to hug its widest RENDERED line (plus padding), so
 * boxes never carry baggy right margins after wrapping. Safe: no rendered
 * line exceeds this width, so the wrap points cannot change. */
function hugClaim(claim, text) {
	const range = document.createRange();
	range.selectNodeContents(text);
	let maxW = 0;
	const rects = range.getClientRects();
	for (let i = 0; i < rects.length; i += 1) {
		if (rects[i].width > maxW) { maxW = rects[i].width; }
	}
	if (maxW > 0) {
		const cs = window.getComputedStyle(claim);
		const extra = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) +
			parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);
		claim.style.width = Math.ceil(maxW + extra + 1) + 'px';
	}
}

/* Even out claim-box wrapping at a given wrap cap (ch) and line target:
 * boxes longer than the target are widened (bisected to the narrowest
 * fitting width), then every box shrinks to hug its widest line. */
function sizeClaims(map, capCh, maxLines) {
	map.style.setProperty('--claim-max-ch', capCh);
	map.querySelectorAll('.am-claim').forEach(function (claim) {
		claim.style.width = '';
		claim.style.maxWidth = '';
		const text = claim.querySelector('.am-text');
		if (!text) { return; }
		const chPx = parseFloat(window.getComputedStyle(claim).fontSize) * 0.55;
		// short claims never wrap: if the whole claim fits on one natural
		// line of ≤20ch, keep it on one line ("My conclusion." must not
		// break) regardless of the figure's wrap cap
		claim.style.maxWidth = 'none';
		const oneLineW = claim.offsetWidth;
		if (oneLineW <= 20 * chPx) { return; }
		claim.style.maxWidth = '';
		const lineH = parseFloat(window.getComputedStyle(text).lineHeight) || 21;
		let lines = Math.round(text.offsetHeight / lineH);
		if (lines > maxLines) {
			const capW = 34 * parseFloat(window.getComputedStyle(claim).fontSize) * 0.55;
			const linesAt = function (w) {
				claim.style.width = Math.round(w) + 'px';
				return Math.round(text.offsetHeight / lineH);
			};
			// capture the capped (too-narrow) width BEFORE lifting the cap,
			// else the box springs to its one-line max-content width
			let lo = claim.offsetWidth;
			claim.style.maxWidth = 'none';
			claim.style.width = lo + 'px';
			let hi = lo;
			let guard = 0;
			while (lines > maxLines && hi < capW && guard < 6) {
				lo = hi;
				hi = Math.min(capW, hi * 1.3);
				lines = linesAt(hi);
				guard += 1;
			}
			if (lines <= maxLines) {
				for (let i = 0; i < 5; i += 1) {
					const mid = (lo + hi) / 2;
					if (linesAt(mid) <= maxLines) { hi = mid; } else { lo = mid; }
				}
				linesAt(hi);
			}
		}
		hugClaim(claim, text);
	});
}

/* Fit a map to the available width: try the figure's own wrap cap at the
 * comfortable 3-line target, then progressively tighten the wrap (and only
 * then relax the line target) until the whole map fits. Scrolling is the
 * LAST resort, not the default — a cropped claim is never acceptable.
 *
 * Step 2 of the ladder widens the figure past its container, which suits a
 * figure in a prose column but would burst a grid cell (the landing page's
 * hero sits in one), so it is opt-in per figure via data-breakout. */
function fitMap(map, availW, figure) {
	map.style.fontSize = '';
	if (figure) {
		figure.classList.remove('fig--breakout');
		figure.style.width = '';
	}
	updateScale(map);
	if (!map._baseCh) {
		map._baseCh = parseFloat(map.style.getPropertyValue('--claim-max-ch')) || 26;
	}
	const base = map._baseCh;
	const scroller = figure ? figure.querySelector('.fig-scroller') : null;
	const avail = function () { return scroller ? scroller.clientWidth : (availW || 0); };
	const fits = function () { const a = avail(); return !a || map.offsetWidth <= a + 1; };
	const runAttempts = function (list) {
		let prev = null;
		for (let i = 0; i < list.length; i += 1) {
			const a = list[i];
			if (prev && prev.ch === a.ch && prev.lines === a.lines) { continue; }
			prev = a;
			sizeClaims(map, a.ch, a.lines);
			layoutMap(map, avail());
			if (fits()) { return true; }
		}
		return false;
	};

	// airy targets: spend available width before ever compressing
	const relaxed = [
		{ ch: Math.min(Math.max(base * 1.8, 26), 34), lines: 2 },
		{ ch: Math.min(Math.max(base * 1.3, base + 4), 34), lines: 2 },
		{ ch: base, lines: 3 },
		{ ch: Math.min(base, 21), lines: 3 }
	];
	// compact targets: only after breakout width has been tried
	const compact = [
		{ ch: Math.min(base, 18), lines: 4 },
		{ ch: Math.min(base, 15), lines: 5 }
	];

	// 1. relaxed at natural width
	if (runAttempts(relaxed)) { return; }

	// 2. break the figure out of its column (left edge fixed) and try the
	//    relaxed targets again at the wider canvas
	let brokeOut = false;
	let chrome = 0;
	let maxFig = 0;
	if (figure && figure.hasAttribute('data-breakout')) {
		const rect = figure.getBoundingClientRect();
		chrome = rect.width - (scroller ? scroller.clientWidth : rect.width);
		maxFig = window.innerWidth - rect.left - 24;
		if (maxFig > rect.width + 8) {
			brokeOut = true;
			figure.classList.add('fig--breakout');
			figure.style.width = Math.round(maxFig) + 'px';
			if (runAttempts(relaxed)) {
				// snug the card back down to what the map needs
				figure.style.width = Math.round(Math.max(
					Math.min(maxFig, map.offsetWidth + chrome), 0)) + 'px';
				layoutMap(map, avail());
				return;
			}
		}
	}

	// 3. compact wrap targets (at breakout width if applied)
	if (runAttempts(compact)) {
		if (brokeOut) {
			figure.style.width = Math.round(Math.max(
				Math.min(maxFig, map.offsetWidth + chrome), 0)) + 'px';
			layoutMap(map, avail());
		}
		return;
	}

	// 4. zoom the whole map down (real layout at reduced metrics)
	const zooms = [0.9, 0.82, 0.75];
	for (let z = 0; z < zooms.length; z += 1) {
		map.style.fontSize = 'calc(0.9375rem * ' + zooms[z] + ')';
		updateScale(map);
		sizeClaims(map, Math.min(base, 15), 5);
		layoutMap(map, avail());
		if (fits()) { return; }
	}
	// 5. last resort: horizontal scroll at the smallest zoom (the caller
	//    centres the view on the root claim; edge fades signal the rest)
}

/* the root: one claim centred over its top-level group envelopes (which
 * band-wrap if the available width demands it). Pure positioning — claim
 * sizing happens in sizeClaims/fitMap first. */
function layoutMap(map, maxW) {
	const rootWrap = map.querySelector(':scope > .am-node-wrap');
	if (!rootWrap) { return; }
	map.classList.add('am-abs');
	const effMax = maxW ? Math.max(0, maxW - 2 * L.PAD_X) : 0;
	const claim = rootWrap.querySelector(':scope > .am-claim');
	const groupsRow = rootWrap.querySelector(':scope > .am-groups');
	const envs = childEls(groupsRow, 'am-group').map(function (g) {
		return layoutGroupEnv(g, effMax);
	});
	const cw = claim.offsetWidth, ch = claim.offsetHeight;
	const children = envs.length ? bandify(envs, L.FAMILY_GAP, L.DROP_GAP, 0) : null;

	// The conclusion is the centre: it sits over the centre of its groups'
	// BRACKET BARS — with one group, dead over the bracket, so its connector
	// is a plumb-vertical line — not over the whole descendant envelope,
	// whose centre drifts when grandchild blocks spread asymmetrically.
	let rootCx = cw / 2;
	if (children) {
		children.place(0, 0); // provisional pass: learn each env's x offset
		const cxs = envs.map(function (e) { return e.x + e.bracketCx; });
		rootCx = (Math.min.apply(null, cxs) + Math.max.apply(null, cxs)) / 2;
	}
	const claimL = rootCx - cw / 2;
	const left = Math.min(0, claimL);
	const w = Math.max(children ? children.w : 0, claimL + cw) - left;
	const h = ch + (children ? L.DROP_GAP + children.h : 0);

	claim.style.left = Math.round(L.PAD_X + claimL - left) + 'px';
	claim.style.top = L.PAD_TOP + 'px';
	if (children) {
		children.place(L.PAD_X - left, L.PAD_TOP + ch + L.DROP_GAP);
	}

	map.style.width = (w + 2 * L.PAD_X) + 'px';
	map.style.height = (h + L.PAD_TOP + L.PAD_BOTTOM) + 'px';
}

/* ============================================================ connectors */

/* S-curve, as the editor draws one: dy = clamp(18, (y2-y1)*0.55, 46). A near-plumb drop
 * snaps to a true straight line — the conclusion over its bracket must read
 * as ruled, not as a vestigial S. */
function curvePath(x1, y1, x2, y2) {
	if (Math.abs(x2 - x1) < 2) {
		return 'M' + x1 + ',' + y1 + ' L' + x2 + ',' + y2;
	}
	const dy = Math.max(18, Math.min((y2 - y1) * 0.55, 46));
	return 'M' + x1 + ',' + y1 +
		' C' + x1 + ',' + (y1 + dy) + ' ' + x2 + ',' + (y2 - dy) + ' ' + x2 + ',' + y2;
}

function widthFor(strength) {
	return strength === 'strong' ? 5 : strength === 'weak' ? 1.5 : 3;
}

/* rectangle of `el` relative to the map frame. */
function relRect(el, frameRect) {
	const r = el.getBoundingClientRect();
	const left = r.left - frameRect.left;
	const top = r.top - frameRect.top;
	return {
		left: left, top: top, width: r.width, height: r.height,
		cx: left + r.width / 2, cy: top + r.height / 2,
		bottom: top + r.height, right: left + r.width
	};
}

/* Curves land on the TOP-CENTRE of the group's bracket bar. After the
 * layout pass the bracket element spans exactly the packed claims row, so
 * its own rect is the anchor. */
function bracketPoint(group, frameRect) {
	const bracket = group.querySelector(':scope > .am-bracket');
	const g = relRect(bracket || group, frameRect);
	return { x: g.cx, y: g.top + 1 };
}

function drawConnectors(map) {
	const svg = map.querySelector(':scope > svg.am-links');
	if (!svg) { return; }
	const frameRect = map.getBoundingClientRect();
	svg.setAttribute('width', map.offsetWidth);
	svg.setAttribute('height', map.offsetHeight);
	svg.setAttribute('viewBox', '0 0 ' + map.offsetWidth + ' ' + map.offsetHeight);
	while (svg.firstChild) { svg.removeChild(svg.firstChild); }

	// each group hangs from its nearest ancestor claim — EXCEPT the group
	// hanging directly under an inference-objection bar (connected from the
	// red bar instead).
	map.querySelectorAll('.am-group').forEach(function (group) {
		if (group.parentElement && group.parentElement.classList.contains('am-inference-objection')) { return; }
		const wrap = group.closest('.am-node-wrap');
		const parentClaim = wrap && wrap.querySelector(':scope > .am-claim');
		if (!parentClaim) { return; }
		const type = group.getAttribute('data-group-type');
		const strength = group.getAttribute('data-strength') || 'normal';
		const pr = relRect(parentClaim, frameRect);
		const bp = bracketPoint(group, frameRect);
		addPath(svg, pr.cx, pr.bottom, bp.x, bp.y, type, strength, group);
	});

	// inference objections need no connector: their red bar IS the link —
	// a square bracket over the objecting claims whose tail reaches back
	// under the reason's bracket (authentic MindMup rendering).

	map.setAttribute('data-hydrated', '1');
}

function addPath(svg, x1, y1, x2, y2, type, strength, owner) {
	const color = type === 'opposing' ? 'var(--am-red)'
		: type === 'neutral' ? 'var(--am-neutral)' : 'var(--am-green)';
	const p = document.createElementNS(SVGNS, 'path');
	p.setAttribute('class', 'am-link');
	p.setAttribute('d', curvePath(x1, y1, x2, y2));
	p.setAttribute('stroke', color);
	p.setAttribute('stroke-width', widthFor(strength));
	svg.appendChild(p);
	owner._link = p;
	owner._linkBase = widthFor(strength);
}

/* =============================================== scroll affordance + a11y */

function updateScroll(figure) {
	const canvas = figure.querySelector('.fig-canvas');
	const scroller = figure.querySelector('.fig-scroller');
	if (!canvas || !scroller) { return; }
	const canScroll = scroller.scrollWidth > scroller.clientWidth + 1;
	const max = scroller.scrollWidth - scroller.clientWidth;
	canvas.classList.toggle('am-scroll-l', canScroll && scroller.scrollLeft > 2);
	canvas.classList.toggle('am-scroll-r', canScroll && scroller.scrollLeft < max - 2);
	// a scrollable region must be keyboard-reachable; drop the tab stop when
	// there is nothing to scroll.
	if (canScroll) {
		scroller.setAttribute('tabindex', '0');
		scroller.setAttribute('role', 'region');
		if (!scroller.getAttribute('aria-label')) {
			scroller.setAttribute('aria-label', 'Argument map (scrolls horizontally)');
		}
	} else {
		scroller.removeAttribute('tabindex');
		scroller.removeAttribute('role');
		scroller.removeAttribute('aria-label');
	}
}

/* one pass: fit + layout, curves, affordances */
function layoutFigure(figure, map) {
	fitMap(map, 0, figure);
	drawConnectors(map);
	updateScroll(figure);
}

/* ============================================================= selection */

function claims(map) {
	return Array.prototype.slice.call(map.querySelectorAll('.am-claim'));
}

function select(map, claim) {
	claims(map).forEach(function (c) {
		const on = c === claim;
		c.classList.toggle('is-selected', on);
		c.tabIndex = on ? 0 : -1;
		// the state the renderer stamped as false; keep it truthful, as the
		// editor's canvas tree does (app/js/a11y-canvas.js)
		c.setAttribute('aria-selected', on ? 'true' : 'false');
	});
	if (claim) {
		if (!claim.id) { claim.id = map.id + '-c-' + (claim.getAttribute('data-num') || Math.random().toString(36).slice(2)); }
		map.setAttribute('aria-activedescendant', claim.id);
		map._selected = claim;
	} else {
		map.setAttribute('aria-activedescendant', '');
		map._selected = null;
	}
}

/* structural navigation within one figure: Down into the first child group,
 * Up to the parent claim, Left/Right between sibling claims. */
function navFrom(map, claim, dir) {
	const wrap = claim.closest('.am-node-wrap');
	if (dir === 'up') {
		const parentGroups = wrap && wrap.parentElement && wrap.parentElement.closest('.am-groups, .am-claims');
		const up = parentGroups && parentGroups.closest('.am-node-wrap');
		const pc = up && up.querySelector(':scope > .am-claim');
		return pc || null;
	}
	if (dir === 'down') {
		const firstGroup = wrap.querySelector(':scope > .am-groups .am-claim');
		return firstGroup || null;
	}
	if (dir === 'left' || dir === 'right') {
		const siblingsRow = wrap.parentElement;
		const sibWraps = Array.prototype.filter.call(siblingsRow.children, function (n) {
			return n.classList && n.classList.contains('am-node-wrap');
		});
		const i = sibWraps.indexOf(wrap);
		const j = dir === 'left' ? i - 1 : i + 1;
		const target = sibWraps[j];
		return target ? target.querySelector(':scope > .am-claim') : null;
	}
	return null;
}

/* =============================================================== hovers */

function wireHover(map) {
	map.querySelectorAll('.am-group, .am-inference-objection').forEach(function (owner) {
		const wrap = owner.closest('.am-node-wrap');
		const parentClaim = wrap && wrap.querySelector(':scope > .am-claim');
		function emphasize(on) {
			if (owner._link) {
				owner._link.setAttribute('stroke-width', on ? owner._linkBase + 0.5 : owner._linkBase);
			}
		}
		if (parentClaim) {
			parentClaim.addEventListener('mouseenter', function () { emphasize(true); });
			parentClaim.addEventListener('mouseleave', function () { emphasize(false); });
		}
	});
}

/* ========================================================= keyboard model */

function wireKeyboard(map, figure) {
	const first = claims(map)[0];
	if (first) { first.tabIndex = 0; }

	map.addEventListener('focusin', function (e) {
		const c = e.target.closest('.am-claim');
		if (c) { select(map, c); }
		figure._hasFocus = true;
	});
	map.addEventListener('focusout', function () {
		window.setTimeout(function () {
			figure._hasFocus = figure.contains(document.activeElement);
		}, 0);
	});

	map.addEventListener('keydown', function (e) {
		const cur = map._selected || claims(map)[0];
		if (!cur) { return; }
		let target = null;
		switch (e.key) {
			case 'ArrowDown': target = navFrom(map, cur, 'down'); break;
			case 'ArrowUp': target = navFrom(map, cur, 'up'); break;
			case 'ArrowLeft': target = navFrom(map, cur, 'left'); break;
			case 'ArrowRight': target = navFrom(map, cur, 'right'); break;
			case 'Home': target = claims(map)[0]; break;
			case 'Escape':
				select(map, null);
				claims(map).forEach(function (c, i) { c.tabIndex = i === 0 ? 0 : -1; });
				map.removeAttribute('aria-activedescendant');
				return;
			default: return;
		}
		if (target) {
			e.preventDefault();
			select(map, target);
			target.focus();
		}
	});

	map.addEventListener('click', function (e) {
		const c = e.target.closest('.am-claim');
		if (c && map.contains(c)) { select(map, c); c.focus(); }
	});
}

/* =========================================================== hydrate all */

function hydrateMap(map, figure) {
	wireHover(map);
	if (figure) { wireKeyboard(map, figure); }
}

/* Wide maps open centred on the ROOT claim (like the editor centres a
 * loaded map), not pinned to the left edge. First layout only. */
function centreOnRoot(figure, map) {
	const scroller = figure.querySelector('.fig-scroller');
	const root = map.querySelector('.am-claim');
	if (!scroller || !root) { return; }
	if (scroller.scrollWidth <= scroller.clientWidth + 1) { return; }
	const mapRect = map.getBoundingClientRect();
	const rootRect = root.getBoundingClientRect();
	const rootCx = (rootRect.left - mapRect.left) + rootRect.width / 2 + map.offsetLeft;
	scroller.scrollLeft = Math.max(0, Math.round(rootCx - scroller.clientWidth / 2));
	updateScroll(figure);
}

function initFigure(figure) {
	const map = figure.querySelector('.argmap');
	if (!map) { return; }
	if (!map.id) { map.id = (figure.id || 'fig') + '-map'; }
	figure._hasFocus = false;
	hydrateMap(map, figure);
	layoutFigure(figure, map);
	centreOnRoot(figure, map);

	// Cache the layout inputs: a relayout can itself resize the scroller, which
	// would refire the ResizeObserver forever. Skip when nothing relevant moved.
	const relayout = function () {
		const m = figure.querySelector('.argmap');
		if (!m) { return; }
		const s = figure.querySelector('.fig-scroller');
		const key = (s ? s.clientWidth : 0) + 'x' + m.offsetWidth + 'x' + m.offsetHeight +
			'x' + document.documentElement.getAttribute('data-theme');
		if (figure._layoutKey === key) { return; }
		figure._layoutKey = key;
		layoutFigure(figure, m);
	};
	// …and never relayout from inside the observer callback: laying out resizes
	// the boxes being observed, and WebKit reports that as "ResizeObserver loop
	// completed with undelivered notifications". A frame's grace is enough to
	// break the cycle, and the key guard then stops it after one pass.
	let queued = false;
	const scheduleRelayout = function () {
		if (queued) { return; }
		queued = true;
		window.requestAnimationFrame(function () { queued = false; relayout(); });
	};
	const scroller = figure.querySelector('.fig-scroller');
	if (scroller) {
		scroller.addEventListener('scroll', function () { updateScroll(figure); }, { passive: true });
	}
	if (window.ResizeObserver) {
		const ro = new ResizeObserver(scheduleRelayout);
		ro.observe(map);
		if (scroller) { ro.observe(scroller); }
	}
	if (document.fonts && document.fonts.ready) {
		// font metrics change line wrapping without changing container sizes,
		// so the layout-key guard must not swallow this pass
		document.fonts.ready.then(function () {
			figure._layoutKey = null;
			relayout();
			centreOnRoot(figure, figure.querySelector('.argmap'));
		});
	}
	window.addEventListener('resize', debounce(scheduleRelayout, 120));
	const mo = new MutationObserver(scheduleRelayout);
	mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}

function debounce(fn, ms) {
	let t;
	return function () { clearTimeout(t); t = setTimeout(fn, ms); };
}

/* An illustration map (the legend cards): no frame, no interaction, no tab stop
 * — just fit it to the panel and draw the curves. It is aria-hidden in the
 * markup, so it stays out of the way of the prose that explains it. */
function initInline(panel) {
	const map = panel.querySelector('.argmap');
	if (!map) { return; }
	const fitAndDraw = function () {
		const scroller = panel.querySelector('.fig-scroller');
		fitMap(map, (scroller || panel).clientWidth, null);
		drawConnectors(map);
	};
	fitAndDraw();
	if (window.ResizeObserver) {
		let queued = false;
		new ResizeObserver(function () {
			if (queued) { return; }
			queued = true;
			window.requestAnimationFrame(function () { queued = false; fitAndDraw(); });
		}).observe(panel);
	}
	if (document.fonts && document.fonts.ready) { document.fonts.ready.then(fitAndDraw); }
}

export function init(root) {
	const scope = root || document;
	scope.querySelectorAll('.fig .argmap').forEach(function (map) {
		const figure = map.closest('.fig');
		if (figure && !figure._amInit) { figure._amInit = true; initFigure(figure); }
	});
	scope.querySelectorAll('.argmap-inline').forEach(function (panel) {
		if (!panel._amInit) { panel._amInit = true; initInline(panel); }
	});
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', function () { init(); });
} else {
	init();
}

export { drawConnectors };
export default init;
