/*
 * figures/lib/render.js — isomorphic argument-map renderer.
 *
 * (mapJson, opts) -> static HTML string. Pure ESM, no Node APIs, so it runs in
 * a browser too if a future figure ever needs to re-render live; today only
 * figures/build.mjs calls it, at build time, and the markup it returns is
 * committed into site/index.html. The visual grammar is the authentic MindMup
 * argument-mapping theme (see app/js/themes.js argMappingSimple); all
 * colour/border/shadow values live in site/css/argmap.css as --am-* tokens, so
 * this module only emits structural markup + deterministic numbering.
 *
 * Ported from PhilMaps (lib/argmap/), which is where this component was first
 * written against this app's theme; docs/figures.md records the port and the
 * one addition — the third group kind, `neutral`, which Because grew after
 * PhilMaps was built.
 *
 * Numbering: depth 1 = root = "1.1". Every claim at depth N, counted
 * left-to-right across the whole map, gets N.1, N.2, ….
 * Inference-objection claims number at the depth BELOW the bracket's claims
 * (i.e. the same depth a child group of those claims would occupy). Numbers
 * are computed here; JSON never stores them.
 */

import { smartquotes } from './smartquotes.js';

const ESCAPE = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export function esc(s) {
	return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ESCAPE[c]; });
}

/* The three bracket kinds the editor draws (app/js/commands.js, and the
 * GROUP_KINDS list in app/js/numbering.js): a reason, an objection, and the
 * uninterpreted neutral connector. Anything unrecognised reads as a reason,
 * so an older figure JSON keeps rendering. */
export const GROUP_KINDS = ['supporting', 'opposing', 'neutral'];
export function groupKind(group) {
	const type = group && group.type;
	return GROUP_KINDS.indexOf(type) >= 0 ? type : 'supporting';
}

/* Assign numbers by a breadth-ordered pass over depths. We walk the tree once
 * collecting, for every claim, the depth it sits at, then number left-to-right
 * within each depth. A node's `depth` is 1 for the root; claims inside a group
 * hanging off a depth-D claim are depth D+1; inference-objection claims are
 * depth D+1 where D is the depth of the group's own claims. */
function collectClaims(root) {
	const byDepth = new Map();
	function push(node, depth) {
		if (!byDepth.has(depth)) { byDepth.set(depth, []); }
		byDepth.get(depth).push(node);
	}
	function walkClaim(claim, depth) {
		push(claim, depth);
		(claim.groups || []).forEach(function (group) { walkGroup(group, depth); });
	}
	function walkGroup(group, parentDepth) {
		const claimDepth = parentDepth + 1;
		(group.claims || []).forEach(function (claim) { walkClaim(claim, claimDepth); });
		// inference-objection claims number at the SAME depth as the
		// bracket's own claims (the authentic MindMup figure numbers the
		// objecting claim 2.3 beside 2.1/2.2)
		(group.inferenceObjections || []).forEach(function (io) {
			(io.claims || []).forEach(function (claim) { walkClaim(claim, claimDepth); });
			(io.groups || []).forEach(function (g) { walkGroup(g, claimDepth); });
		});
	}
	walkClaim(root, 1);
	// stamp .__num onto each collected claim object (transient, per-render)
	const nums = new WeakMap();
	byDepth.forEach(function (nodes, depth) {
		nodes.forEach(function (node, i) { nums.set(node, depth + '.' + (i + 1)); });
	});
	return nums;
}

function normalizeMap(mapJson) {
	const opts = mapJson.options || {};
	return {
		id: mapJson.id || 'map',
		title: mapJson.title || '',
		root: mapJson.root || { text: '', groups: [] },
		numbered: opts.numbered !== false,
		claimMaxCh: opts.claimMaxCh || 26
	};
}

/* Render one claim box (.am-claim) plus its child groups (.am-groups). */
function renderClaim(claim, nums, model, inert) {
	const num = nums.get(claim);
	const cls = ['am-claim'];
	if (claim.implicit) { cls.push('am-implicit'); }
	const tabAttr = inert ? '' : ' tabindex="-1"';
	const badge = (model.numbered && num)
		? '<span class="am-badge" aria-hidden="true">' + esc(num) + '</span>'
		: '';
	// aria-level/aria-selected mirror the app's canvas tree (app/js/a11y-canvas.js)
	// so a screen reader reads a figure the way it reads the editor. The level is
	// the number's own depth, which is what the badge already shows.
	const level = num ? ' aria-level="' + num.split('.')[0] + '"' : '';
	const selected = inert ? '' : ' aria-selected="false"';
	const box =
		'<div class="' + cls.join(' ') + '" role="treeitem"' + tabAttr + level + selected +
			(num ? ' data-num="' + esc(num) + '"' : '') +
			(claim.implicit ? ' data-implicit="1"' : '') + '>' +
			badge +
			'<span class="am-text">' + esc(smartquotes(claim.text)) + '</span>' +
		'</div>';
	const groups = claim.groups && claim.groups.length
		? renderGroups(claim.groups, nums, model, inert)
		: '';
	return '<div class="am-node-wrap">' + box + groups + '</div>';
}

/* Render the row of groups hanging under a claim. */
function renderGroups(groups, nums, model, inert) {
	const rows = groups.map(function (group) { return renderGroup(group, nums, model, inert); });
	return '<div class="am-groups" role="group">' + rows.join('') + '</div>';
}

/* One group: a bracket (top edge) spanning a flex row of claims, optionally
 * with an inference-objection bar + hanging objection group below. */
function renderGroup(group, nums, model, inert) {
	const type = groupKind(group);
	const strength = group.strength === 'strong' ? 'strong'
		: group.strength === 'weak' ? 'weak' : 'normal';
	const groupCls = ['am-group', 'am-' + type];
	if (strength !== 'normal') { groupCls.push('am-' + strength); }

	const bracket = '<div class="am-bracket" aria-hidden="true">' +
		'<span class="am-stem" aria-hidden="true"></span></div>';

	const claimsHtml = (group.claims || []).map(function (claim) {
		return renderClaim(claim, nums, model, inert);
	}).join('');

	let ioHtml = '';
	(group.inferenceObjections || []).forEach(function (io) {
		ioHtml += renderInferenceObjection(io, nums, model, inert);
	});

	return '<div class="' + groupCls.join(' ') + '" data-group-type="' + type +
			'" data-strength="' + strength + '">' +
			bracket +
			'<div class="am-claims">' + claimsHtml + '</div>' +
			ioHtml +
		'</div>';
}

/* Inference objection: a red bar ~70% of the bracket width,
 * centred, 4px under the supporting bracket's bar (.am-io-bar is absolutely
 * positioned by CSS against the owning group); the objection itself is a
 * full opposing GROUP (square red bracket + claims) hanging below the
 * claims row, connected by a red curve from the bar's underside down to the
 * objection bracket. */
function renderInferenceObjection(io, nums, model, inert) {
	const hangingGroup = renderGroup({
		type: 'opposing',
		strength: io.strength,
		claims: io.claims || [],
		inferenceObjections: []
	}, nums, model, inert);
	return '<div class="am-inference-objection" data-group-type="opposing">' +
			'<div class="am-io-bar" aria-hidden="true"></div>' +
			hangingGroup +
		'</div>';
}

/*
 * Public: render the map to an HTML string. `opts` may carry:
 *   - descId: the id to reference from aria-describedby (the SSR hidden desc).
 *   - description: the describe.js prose to embed (optional; if omitted the
 *     caller wires aria-describedby to an element it owns).
 *   - inert: true => no tab stops / no treeitem interaction (quiz mini-maps).
 *   - embedData: true => embed the source JSON as an application/json script
 *     (needed by client hydration; the 11ty figure wrapper sets this).
 */
export function render(mapJson, opts) {
	opts = opts || {};
	const model = normalizeMap(mapJson);
	const nums = collectClaims(model.root);
	const inert = !!opts.inert;

	const style = 'style="--claim-max-ch:' + model.claimMaxCh + '"';
	const roleDesc = ' aria-roledescription="argument map"';
	const describedby = opts.descId ? ' aria-describedby="' + esc(opts.descId) + '"' : '';
	const activedesc = inert ? '' : ' aria-activedescendant=""';

	const tree = renderClaim(model.root, nums, model, inert);

	const mapEl =
		'<div class="argmap' + (inert ? ' am-inert' : '') + '" role="tree"' +
			roleDesc + describedby + activedesc + ' ' + style + '>' +
			tree +
			'<svg class="am-links" aria-hidden="true" focusable="false"></svg>' +
		'</div>';

	if (opts.embedData) {
		// split the closing tag so this module stays safe to inline inside a
		// <script type="module"> (a literal </script> would close it early).
		const dataScript = '<script type="application/json" class="argmap-data">' +
			jsonForScript(mapJson) + '<' + '/script>';
		return dataScript + mapEl;
	}
	return mapEl;
}

/* Escape a JSON payload for safe embedding inside a <script type=json>. */
export function jsonForScript(obj) {
	return JSON.stringify(obj)
		.replace(/[<>&]/g, function (c) {
			return { "<": "\\u003c", ">": "\\u003e", "&": "\\u0026" }[c];
		})
		.replace(/[\u2028\u2029]/g, function (c) {
			return c === "\u2028" ? "\\u2028" : "\\u2029";
		});
}
/* Expose numbering for describe.js / tests without re-walking. */
export function numberMap(mapJson) {
	const model = normalizeMap(mapJson);
	const nums = collectClaims(model.root);
	const out = [];
	(function walk(claim) {
		out.push({ claim: claim, num: nums.get(claim) });
		(claim.groups || []).forEach(function (g) {
			(g.claims || []).forEach(walk);
			(g.inferenceObjections || []).forEach(function (io) {
				(io.claims || []).forEach(walk);
			});
		});
	})(model.root);
	return { nums: nums, list: out, root: model.root, model: model };
}

export default render;
