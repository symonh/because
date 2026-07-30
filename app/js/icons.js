/*
 * The app icon set. One 20px grid, single 1.5px stroke, round caps and
 * joins. Colour appears only where it carries meaning: .ic-sup (green,
 * support), .ic-opp (red, opposition) and .ic-neu (blue, neither) are
 * styled in app.css for both chrome themes — the same code the map itself
 * uses. The three connector glyphs borrow the canvas's own distinction: a
 * rounded bracket supports, a square bracket opposes, a bare bar asserts
 * nothing.
 *
 * Glyph geometry is a design decision (mockup sign-off 2026-07-25):
 * do not edit path data without a new visual review. `neutral` (added
 * 2026-07-29) is the `objection` glyph with its two arms removed, so all
 * three share one bar position and read as a set.
 */

export const ICONS = {
	newDoc: '<path d="M5.75 2.75h5.9l3.6 3.6v10.9H5.75z"/><path d="M11.65 2.75v3.6h3.6"/><path d="M10.5 10.25v3.5M8.75 12h3.5"/>',
	open: '<path d="M2.9 15.4V5.1q0-1 1-1h3.55l1.5 1.8h6.9q1 0 1 1v1.2"/><path d="M2.9 15.4l1.95-5.6h13l-2.05 5.6z"/>',
	save: '<path d="M10 3v8.4M6.9 8.6L10 11.7l3.1-3.1"/><path d="M3.4 13.6v1.9q0 1 1 1h11.2q1 0 1-1v-1.9"/>',
	undo: '<path d="M6.9 4.6L3.4 8.1l3.5 3.5"/><path d="M3.4 8.1h8.9a4.3 4.3 0 014.3 4.3v.9"/>',
	redo: '<path d="M13.1 4.6l3.5 3.5-3.5 3.5"/><path d="M16.6 8.1H7.7a4.3 4.3 0 00-4.3 4.3v.9"/>',
	reason: '<rect x="6.4" y="2.6" width="7.2" height="4.2" rx="1.2"/><path class="ic-sup" d="M10 6.8v2.4"/><path class="ic-sup" d="M4.4 14.6v-.7q0-2.7 2.7-2.7h5.8q2.7 0 2.7 2.7v.7"/>',
	objection: '<rect x="6.4" y="2.6" width="7.2" height="4.2" rx="1.2"/><path class="ic-opp" d="M10 6.8v2.4"/><path class="ic-opp" d="M4.4 14.6v-3.4h11.2v3.4"/>',
	neutral: '<rect x="6.4" y="2.6" width="7.2" height="4.2" rx="1.2"/><path class="ic-neu" d="M10 6.8v2.4"/><path class="ic-neu" d="M4.4 11.2h11.2"/>',
	copremise: '<rect x="2.75" y="7.9" width="6" height="4.4" rx="1.2"/><rect x="11.25" y="7.9" width="6" height="4.4" rx="1.2"/><path d="M8.75 10.1h2.5" stroke-dasharray="1.8 1.6"/>',
	sticky: '<path d="M3.9 3.9h12.2v8.3l-4 4H3.9z"/><path d="M12.1 16.2v-4h4"/>',
	edit: '<path d="M3.8 16.2l.85-3.35 8.05-8.05a1.75 1.75 0 012.5 2.5L7.15 15.35z"/><path d="M11.4 6.1l2.5 2.5"/>',
	trash: '<path d="M3.75 5.75h12.5"/><path d="M8 5.75V4.25q0-1 1-1h2q1 0 1 1v1.5"/><path d="M5.25 5.75l.65 9.9q.07 1.1 1.1 1.1h6q1.03 0 1.1-1.1l.65-9.9"/><path d="M8.4 9v5M11.6 9v5"/>',
	implicit: '<rect x="2.9" y="5.9" width="14.2" height="8.2" rx="2" stroke-dasharray="3.2 2.4"/>',
	flip: '<path class="ic-sup" d="M6.9 15.4V5.2M4.3 7.8l2.6-2.6 2.6 2.6"/><path class="ic-opp" d="M13.1 4.6v10.2M10.5 12.2l2.6 2.6 2.6-2.6"/>',
	evalMark: '<circle cx="10" cy="10" r="6.6"/><path d="M7.6 7.6l4.8 4.8M12.4 7.6l-4.8 4.8"/>',
	zoomOut: '<circle cx="8.8" cy="8.8" r="5.6"/><path d="M12.9 12.9l3.9 3.9"/><path d="M6.4 8.8h4.8"/>',
	zoomReset: '<path d="M3.1 6.9V4.6q0-1.5 1.5-1.5h2.3M13.1 3.1h2.3q1.5 0 1.5 1.5v2.3M16.9 13.1v2.3q0 1.5-1.5 1.5h-2.3M6.9 16.9H4.6q-1.5 0-1.5-1.5v-2.3"/>',
	zoomIn: '<circle cx="8.8" cy="8.8" r="5.6"/><path d="M12.9 12.9l3.9 3.9"/><path d="M6.4 8.8h4.8M8.8 6.4v4.8"/>',
	collapse: '<path d="M4.6 4.4L10 8.7l5.4-4.3M4.6 15.6L10 11.3l5.4 4.3"/>',
	numbering: '<rect x="3" y="6.4" width="11.4" height="8" rx="1.6"/><circle cx="14.9" cy="6.2" r="2.85"/>',
	hamburger: '<path d="M3.5 5.5h13M3.5 10h13M3.5 14.5h13"/>',
	dots: '<circle cx="4.6" cy="10" r="1.2" fill="currentColor" stroke="none"/><circle cx="10" cy="10" r="1.2" fill="currentColor" stroke="none"/><circle cx="15.4" cy="10" r="1.2" fill="currentColor" stroke="none"/>',
	sun: '<circle cx="10" cy="10" r="3.1"/><path d="M10 2.9v1.9M10 15.2v1.9M2.9 10h1.9M15.2 10h1.9M4.98 4.98l1.35 1.35M13.67 13.67l1.35 1.35M15.02 4.98l-1.35 1.35M6.33 13.67l-1.35 1.35"/>',
	moon: '<path d="M10 2.5a5 5 0 007.5 7.5A7.5 7.5 0 1110 2.5z"/>'
};

export function iconSVG(name, size) {
	const px = size || 18;
	return '<svg aria-hidden="true" focusable="false" viewBox="0 0 20 20" width="' + px + '" height="' + px +
		'" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
		ICONS[name] + '</svg>';
}
