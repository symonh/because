/*
 * Renderer-computed claim numbering: level.index (1.1, 2.1, 2.2, 3.1 …),
 * breadth-first by content depth; reason/objection groups and sticky notes
 * are skipped (they are structure, not claims).
 *
 * A claim may carry its own badge text in attr.claimLabel (set by clicking
 * the badge — see number-edit.js). An override replaces the number on that
 * claim alone: the walk still counts it, so its siblings and everything
 * below keep the numbers the structure gives them and renaming one badge
 * never renumbers the map.
 */
export const MAX_CLAIM_LABEL = 10;

export const isGroupNode = n =>
	n.attr && (n.attr.group === 'supporting' || n.attr.group === 'opposing');

export const isStickyNode = n =>
	n.attr && Array.isArray(n.attr.styleNames) && n.attr.styleNames.indexOf('sticky_note') >= 0;

export const sortedKids = n =>
	(n.ideas ? Object.keys(n.ideas).sort((a, b) => parseFloat(a) - parseFloat(b)).map(k => n.ideas[k]) : []);

// the author's badge text for a claim, or null if it has none
export const labelOverride = function (n) {
	const value = n && n.attr && n.attr.claimLabel;
	return (typeof value === 'string' && value.trim()) ?
		value.trim().slice(0, MAX_CLAIM_LABEL) : null;
};

// premises of a claim: the content children inside its reason/objection groups
export function premisesOf(n) {
	const out = [];
	sortedKids(n).forEach(k => {
		if (isGroupNode(k)) {
			sortedKids(k).forEach(p => { if (!isStickyNode(p)) { out.push(p); } });
		} else if (!isStickyNode(k)) {
			out.push(k);
		}
	});
	return out;
}

const generate = function (idea, withOverrides) {
	const labels = {};
	let level = sortedKids(idea).filter(n => !isGroupNode(n) && !isStickyNode(n)),
		depth = 1;
	while (level.length) {
		let idx = 1;
		const next = [];
		level.forEach(n => {
			const number = depth + '.' + idx;
			labels[n.id] = (withOverrides && labelOverride(n)) || number;
			idx += 1;
			premisesOf(n).forEach(p => next.push(p));
		});
		level = next;
		depth += 1;
	}
	return labels;
};

// what the badges show
export const argLabelGenerator = idea => generate(idea, true);

// what the structure alone gives each claim, ignoring overrides — the badge
// editor opens on this and treats it as "no override needed"
export const autoNumbers = idea => generate(idea, false);
