/*
 * Renderer-computed claim numbering: level.index (1.1, 2.1, 2.2, 3.1 …),
 * breadth-first by content depth; reason/objection groups and sticky notes
 * are skipped (they are structure, not claims).
 */
export const isGroupNode = n =>
	n.attr && (n.attr.group === 'supporting' || n.attr.group === 'opposing');

export const isStickyNode = n =>
	n.attr && Array.isArray(n.attr.styleNames) && n.attr.styleNames.indexOf('sticky_note') >= 0;

export const sortedKids = n =>
	(n.ideas ? Object.keys(n.ideas).sort((a, b) => parseFloat(a) - parseFloat(b)).map(k => n.ideas[k]) : []);

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

export function argLabelGenerator(idea) {
	const labels = {};
	let level = sortedKids(idea).filter(n => !isGroupNode(n) && !isStickyNode(n)),
		depth = 1;
	while (level.length) {
		let idx = 1;
		const next = [];
		level.forEach(n => {
			labels[n.id] = depth + '.' + idx;
			idx += 1;
			premisesOf(n).forEach(p => next.push(p));
		});
		level = next;
		depth += 1;
	}
	return labels;
}
