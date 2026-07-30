/*
 * figures/lib/describe.js — (mapJson) -> deterministic plain-English prose.
 *
 * This string is the pre-rendered figure's hidden description (the
 * aria-describedby target), so a reader who never sees the drawing still gets
 * the argument's structure. Must be stable and self-contained. Isomorphic ESM,
 * no Node APIs. Ported from PhilMaps; see docs/figures.md.
 */

import { numberMap, groupKind } from './render.js';

function quote(text) {
	return '‘' + String(text == null ? '' : text).trim() + '’';
}

/* A full stop, unless the sentence already ends on one inside a closing quote.
 * Claim text normally ends in a period, and "…eradicate aging.’." reads as a
 * stutter to a screen reader as much as it does on the page. */
function stop(s) {
	return /[.!?][’”'"]?$/.test(s) ? '' : '.';
}

function countPhrase(n, singular, plural) {
	const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
	const word = n < words.length ? words[n] : String(n);
	return word + ' ' + (n === 1 ? singular : plural);
}

/* Describe the claims of a group/objection as "claims 2.1 'x' and 2.2 (implicit) 'y'". */
function describeClaims(claims, nums) {
	const parts = claims.map(function (claim) {
		const num = nums.get(claim);
		const imp = claim.implicit ? ' (implicit)' : '';
		return num + imp + ' ' + quote(claim.text);
	});
	if (parts.length === 0) { return ''; }
	if (parts.length === 1) { return 'claim ' + parts[0]; }
	const last = parts.pop();
	return 'claims ' + parts.join(', ') + (parts.length > 1 ? ',' : '') + ' and ' + last;
}

function strengthNote(strength, type) {
	const what = type === 'opposing' ? 'objection' : type === 'neutral' ? 'link' : 'inference';
	if (strength === 'strong') {
		return ' Its connector is drawn thicker, marking a stronger ' + what + '.';
	}
	if (strength === 'weak') {
		return ' Its connector is drawn thinner, marking a weaker ' + what + '.';
	}
	return '';
}

/* Describe a group as one sentence, then recurse into any child structure.
 * The neutral kind asserts neither support nor opposition, so its sentence says
 * only that the claims are attached — the prose must not smuggle in a reading
 * the map deliberately refuses to make. */
function describeGroup(group, nums, parentLabel) {
	const type = groupKind(group);
	const claims = group.claims || [];
	let s;
	if (type === 'neutral') {
		s = 'A neutral connector, which asserts neither support nor opposition, ' +
			'links ' + parentLabel + ' to ' + describeClaims(claims, nums);
	} else {
		const verb = type === 'opposing' ? 'objects to' : 'supports';
		const noun = type === 'opposing' ? 'An objection' : 'A reason';
		s = noun + ' ' + verb + ' ' + parentLabel + ', containing ' +
			describeClaims(claims, nums);
	}
	s += stop(s);
	s += strengthNote(group.strength, type);

	// nested groups on this group's claims
	claims.forEach(function (claim) {
		const label = 'claim ' + nums.get(claim);
		(claim.groups || []).forEach(function (g) {
			s += ' ' + describeGroup(g, nums, label);
		});
	});

	// inference objections
	(group.inferenceObjections || []).forEach(function (io) {
		const ioClaims = io.claims || [];
		const range = ioClaims.length
			? nums.get(claims[0]) + '–' + nums.get(claims[claims.length - 1])
			: '';
		s += ' A further objection — ' + describeClaims(ioClaims, nums) +
			' — objects to the inference from ' + claimRange(claims, nums) +
			', not to any single claim.';
		ioClaims.forEach(function (claim) {
			(claim.groups || []).forEach(function (g) {
				s += ' ' + describeGroup(g, nums, 'claim ' + nums.get(claim));
			});
		});
		void range;
	});
	return s;
}

function claimRange(claims, nums) {
	if (!claims.length) { return ''; }
	if (claims.length === 1) { return nums.get(claims[0]); }
	return nums.get(claims[0]) + '–' + nums.get(claims[claims.length - 1]);
}

export function describe(mapJson) {
	const info = numberMap(mapJson);
	const nums = info.nums;
	const root = info.root;
	const rootNum = nums.get(root);
	const groups = root.groups || [];

	let s = 'Conclusion (' + rootNum + '): ' + quote(root.text);
	s += stop(s);

	if (groups.length === 0) {
		s += ' It has no reasons or objections yet.';
		return s;
	}

	const kinds = groups.map(groupKind);
	const count = function (kind) {
		return kinds.filter(function (k) { return k === kind; }).length;
	};
	const reasons = count('supporting');
	const objections = count('opposing');
	const neutrals = count('neutral');
	const summary = [];
	if (reasons) { summary.push('supported by ' + countPhrase(reasons, 'reason', 'reasons')); }
	if (objections) { summary.push('opposed by ' + countPhrase(objections, 'objection', 'objections')); }
	if (summary.length) { s += ' It is ' + summary.join(' and ') + '.'; }
	if (neutrals) {
		s += ' It carries ' + countPhrase(neutrals, 'neutral connector', 'neutral connectors') + '.';
	}

	groups.forEach(function (group) {
		s += ' ' + describeGroup(group, nums, 'the conclusion');
	});
	return s;
}

export default describe;
