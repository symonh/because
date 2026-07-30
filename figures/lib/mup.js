/*
 * figures/lib/mup.js — (mapJson) -> MindMup formatVersion 3 JSON.
 *
 * A figure's "Download .mup" is the same file the editor saves, so a reader can
 * pick up the map on the page and carry on editing it. Verified structurally
 * against samples/*.mup (death.mup, lee-house.mup, genetic-*.mup,
 * vegetarian.mup) and, in test/site-e2e.js, by loading the generated file into
 * the app itself. Ported from PhilMaps; see docs/figures.md.
 *
 * Shape:
 *   {formatVersion:3, id:"root", title:<root text>,
 *    ideas:{1:{id:1, title:<root text>, attr:{}, ideas:{…}}}}
 *   group idea: {id, title:"group",
 *                attr:{group:"supporting"|"opposing"|"neutral",
 *                      contentLocked:true},
 *                ideas:{1..n: claim ideas}}
 *   implicit claim: attr.styleNames = ["attr_implicit_claim"]
 *   strength: on the GROUP idea, attr.parentConnector = {width:5} (strong)
 *             or {width:1.5} (weak); omitted for normal
 *   inference objection: an opposing group idea nested as a child of the
 *             SUPPORTING GROUP idea itself (a group under a group).
 * Ideas keys are 1-based rank strings; ids are unique ints.
 * Isomorphic ESM, no Node APIs.
 */

import { GROUP_KINDS, groupKind } from './render.js';

export function toMup(mapJson) {
	const root = (mapJson && mapJson.root) || { text: '', groups: [] };
	let nextId = 1;
	const newId = function () { return nextId++; };

	function claimIdea(claim) {
		const id = newId();
		const attr = {};
		if (claim.implicit) { attr.styleNames = ['attr_implicit_claim']; }
		const idea = { id: id, title: String(claim.text == null ? '' : claim.text), attr: attr };
		const children = groupsToIdeas(claim.groups || []);
		if (children) { idea.ideas = children; }
		return idea;
	}

	function groupIdea(group) {
		const id = newId();
		const type = groupKind(group);
		const attr = { group: type, contentLocked: true };
		if (group.strength === 'strong') { attr.parentConnector = { width: 5 }; }
		else if (group.strength === 'weak') { attr.parentConnector = { width: 1.5 }; }

		const inner = {};
		let rank = 1;
		(group.claims || []).forEach(function (claim) {
			inner[String(rank++)] = claimIdea(claim);
		});
		// inference objections: opposing group(s) nested INSIDE this group idea
		(group.inferenceObjections || []).forEach(function (io) {
			inner[String(rank++)] = groupIdea({
				type: 'opposing',
				strength: io.strength,
				claims: io.claims || [],
				inferenceObjections: []
			});
			// child groups of io claims are carried by claimIdea already; if the
			// io itself declares nested groups, attach them under a synthetic
			// wrapper is unnecessary — io.claims carry their own groups.
			void io.groups;
		});

		const idea = { id: id, title: 'group', attr: attr };
		if (Object.keys(inner).length) { idea.ideas = inner; }
		return idea;
	}

	function groupsToIdeas(groups) {
		if (!groups || !groups.length) { return null; }
		const out = {};
		let rank = 1;
		groups.forEach(function (group) { out[String(rank++)] = groupIdea(group); });
		return out;
	}

	const rootId = newId();
	const rootIdea = { id: rootId, title: String(root.text == null ? '' : root.text), attr: {} };
	const rootChildren = groupsToIdeas(root.groups || []);
	if (rootChildren) { rootIdea.ideas = rootChildren; }

	return {
		formatVersion: 3,
		id: 'root',
		title: String(root.text == null ? '' : root.text),
		ideas: { '1': rootIdea }
	};
}

/* Structural validator — returns { ok, errors[] }. Mirrors the sample shape;
 * used by the test harness to guard the .mup export against schema drift. */
export function validateMup(mup) {
	const errors = [];
	const req = function (cond, msg) { if (!cond) { errors.push(msg); } };
	req(mup && typeof mup === 'object', 'not an object');
	if (!mup || typeof mup !== 'object') { return { ok: false, errors: errors }; }
	req(mup.formatVersion === 3, 'formatVersion must be 3');
	req(mup.id === 'root', 'top id must be "root"');
	req(typeof mup.title === 'string', 'title must be a string');
	req(mup.ideas && mup.ideas['1'], 'ideas["1"] (root idea) missing');

	const seen = new Set();
	function walkIdea(idea, path) {
		req(idea && typeof idea === 'object', path + ' not an object');
		if (!idea) { return; }
		req(typeof idea.id === 'number', path + '.id must be a number');
		req(!seen.has(idea.id), path + '.id duplicate: ' + idea.id);
		seen.add(idea.id);
		req(typeof idea.title === 'string', path + '.title must be a string');
		req(idea.attr && typeof idea.attr === 'object', path + '.attr missing');
		const isGroup = idea.attr && idea.attr.group;
		if (isGroup) {
			req(GROUP_KINDS.indexOf(idea.attr.group) >= 0,
				path + '.attr.group invalid: ' + idea.attr.group);
			req(idea.attr.contentLocked === true, path + '.attr.contentLocked must be true');
			req(idea.title === 'group', path + ' group idea title must be "group"');
		}
		if (idea.ideas) {
			Object.keys(idea.ideas).forEach(function (k, i) {
				req(String(Number(k)) === k && Number(k) >= 1,
					path + ' idea key not 1-based rank: ' + k);
				walkIdea(idea.ideas[k], path + '.ideas[' + k + ']');
				void i;
			});
		}
	}
	if (mup.ideas && mup.ideas['1']) { walkIdea(mup.ideas['1'], 'ideas[1]'); }
	return { ok: errors.length === 0, errors: errors };
}

export default toMup;
