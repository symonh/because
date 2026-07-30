#!/usr/bin/env node
/*
 * figures/build.mjs — pre-render the landing page's argument-map figures.
 *
 *   node figures/build.mjs           rebuild site/index.html + site/maps/*.mup
 *   node figures/build.mjs --check   fail if either is stale (the test gate)
 *
 * Why a build step for a site that has none: a figure must be right with
 * JavaScript switched off and must not shift when the script does land, so the
 * markup has to be IN the HTML. Rendering it here and committing the output
 * keeps deploy.sh untouched — it still just rsyncs site/ — while the figure's
 * source of truth stays the map JSON, not hand-written divs.
 *
 * Each figure named in FIGURES is written into site/index.html between
 *   <!-- argmap:<id> -->  …  <!-- /argmap:<id> -->
 * and its .mup is written to site/maps/<id>.mup, which the caption bar offers
 * for download and hands to the editor through ?src=.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { render } from './lib/render.js';
import { describe } from './lib/describe.js';
import { toMup } from './lib/mup.js';
import { smartquotes } from './lib/smartquotes.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const MAPS_SRC = path.join(HERE, 'maps');
const MUP_OUT = path.join(ROOT, 'site', 'maps');

/* Where the .mup files live once site/ is rsynced to the deploy root. Like the
 * page's other links (/app/, /privacy) these are root-absolute, so they are
 * correct on app.philmaps.com; a local server rooted at the repo instead of at
 * site/ will 404 them, which is what test/site-e2e.js accounts for. */
const MUP_HREF = '/maps';
const APP_HREF = '/app/';

/* One entry per figure on the page.
 *
 * kind 'figure' (the default) is the full thing: a framed canvas with a caption
 * bar offering the .mup, plus `chrome` for the editor's title bar drawn from the
 * map's own title (which is how this hero has always read, "eradicate-aging.mup").
 *
 * kind 'inline' is a map used as an illustration — the legend cards. Rendered
 * inert and aria-hidden: it has no frame, no caption, no download, and no place
 * in the accessibility tree, because the card's heading and sentence beside it
 * already say what it shows.
 *
 * kind 'card' is the framed canvas without the caption bar: the social card,
 * which is a screenshot and so has nothing to click. Pointing it at the hero's
 * own map is the point — the og:image cannot drift from the page again. */
const FIGURES = [
	{
		id: 'home-aging',
		page: 'site/index.html',
		chrome: true,
		caption: 'Two co-premises that jointly support a conclusion.'
	},
	{ id: 'legend-reason', page: 'site/index.html', kind: 'inline' },
	{ id: 'legend-objection', page: 'site/index.html', kind: 'inline' },
	{ id: 'legend-implicit', page: 'site/index.html', kind: 'inline' },
	{ id: 'home-aging', page: 'docs/og-card.html', kind: 'card', chrome: true }
];

const ESCAPE = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ESCAPE[c]);

/* The brand glyph from the page's nav, reused as the title-bar icon: a claim
 * box, a green connector, a reason and an implicit claim — the grammar the
 * figure below it draws. */
const GLYPH = '<svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15">' +
	'<rect x="7" y="2" width="10" height="6" rx="1.5" fill="#fff" stroke="#707070"/>' +
	'<path d="M12 8v3" stroke="#339966" stroke-width="2"/>' +
	'<path d="M3 12h18M3 12q0 2.5 2.5 2.5M21 12q0 2.5-2.5 2.5" stroke="#339966" stroke-width="2" fill="none"/>' +
	'<rect x="2" y="16" width="8" height="6" rx="1.5" fill="#fff" stroke="#707070"/>' +
	'<rect x="14" y="16" width="8" height="6" rx="1.5" fill="#fff" stroke="#707070" stroke-dasharray="2.5,1.6"/>' +
	'</svg>';

const ARROW = '<svg aria-hidden="true" viewBox="0 0 24 24" width="13" height="13" fill="none" ' +
	'stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' +
	'<path d="M7 17 17 7M9 7h8v8"/></svg>';

function readMap(id) {
	const file = path.join(MAPS_SRC, id + '.json');
	const json = JSON.parse(fs.readFileSync(file, 'utf8'));
	if (json.id !== id) {
		throw new Error('figures/maps/' + id + '.json declares id "' + json.id + '"');
	}
	return json;
}

/* The file the reader gets is named the way the figure says it is: a map whose
 * title is already a file name keeps it, so the title bar, the download and the
 * name the editor shows all agree. */
function mupName(fig, mapJson) {
	return /\.mup$/i.test(mapJson.title || '') ? mapJson.title : fig.id + '.mup';
}

/* An illustration: the map alone on a canvas, out of the accessibility tree. */
function inlineHtml(fig, mapJson) {
	return '<div class="argmap-inline" data-argmap="' + esc(fig.id) + '" aria-hidden="true">' +
			'<div class="fig-scroller">' + render(mapJson, { inert: true }) + '</div>' +
		'</div>';
}

/* The figure frame: optional title bar, the canvas with its scroller and the
 * hidden text alternative, then — for a figure, not a card — the caption bar
 * with the two actions. */
function figureHtml(fig, mapJson) {
	const figId = 'fig-' + fig.id;
	const descId = figId + '-desc';
	const mupHref = MUP_HREF + '/' + encodeURIComponent(mupName(fig, mapJson));
	const chrome = fig.chrome && mapJson.title
		? '<div class="fig-chrome">' + GLYPH +
			'<span class="fig-file">' + esc(mapJson.title) + '</span></div>'
		: '';
	const bar = fig.kind === 'card' ? '' :
		'<figcaption class="fig-bar">' +
			'<span class="fig-caption">' + esc(smartquotes(fig.caption)) + '</span>' +
			'<span class="fig-actions">' +
				'<a class="fig-action" href="' + mupHref + '" download>Download .mup</a>' +
				'<a class="fig-action" href="' + APP_HREF + '?src=' + encodeURIComponent(mupHref) +
					'">Open in the editor' + ARROW + '</a>' +
			'</span>' +
		'</figcaption>';

	return '<figure class="fig" id="' + figId + '">' +
			chrome +
			'<div class="fig-canvas" data-argmap="' + esc(fig.id) + '">' +
				'<div class="fig-scroller">' +
					render(mapJson, { descId: descId }) +
				'</div>' +
				'<p class="visually-hidden" id="' + descId + '">' +
					esc(describe(mapJson)) +
				'</p>' +
			'</div>' +
			bar +
		'</figure>';
}

/* Replace the marked region, preserving the marker line's own indentation. */
function inject(html, id, block) {
	const open = '<!-- argmap:' + id + ' -->';
	const close = '<!-- /argmap:' + id + ' -->';
	const re = new RegExp('([ \\t]*)' + open + '[\\s\\S]*?' + close);
	if (!re.test(html)) {
		throw new Error('no ' + open + ' … ' + close + ' markers to fill');
	}
	return html.replace(re, (m, indent) =>
		indent + open + '\n' + indent + block + '\n' + indent + close);
}

const check = process.argv.includes('--check');
const stale = [];

function put(file, content) {
	const abs = path.join(ROOT, file);
	const had = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : null;
	if (had === content) { return; }
	if (check) { stale.push(file); return; }
	fs.mkdirSync(path.dirname(abs), { recursive: true });
	fs.writeFileSync(abs, content);
	console.log((had === null ? 'created ' : 'updated ') + file);
}

const pages = new Map();
const wanted = new Set();
fs.mkdirSync(MUP_OUT, { recursive: true });

for (const fig of FIGURES) {
	const mapJson = readMap(fig.id);
	if (!pages.has(fig.page)) {
		pages.set(fig.page, fs.readFileSync(path.join(ROOT, fig.page), 'utf8'));
	}
	const html = fig.kind === 'inline' ? inlineHtml(fig, mapJson) : figureHtml(fig, mapJson);
	pages.set(fig.page, inject(pages.get(fig.page), fig.id, html));
	// only a real figure offers a download; nothing links an illustration's or a
	// social card's .mup (the hero entry writes the shared map's file anyway)
	if (fig.kind) { continue; }
	const name = mupName(fig, mapJson);
	wanted.add(name);
	put(path.join('site', 'maps', name), JSON.stringify(toMup(mapJson)) + '\n');
}
for (const [file, html] of pages) { put(file, html); }

// A renamed or retired figure must not leave a .mup behind for the deploy to
// ship as a download nothing links to.
for (const name of fs.readdirSync(MUP_OUT)) {
	if (!/\.mup$/i.test(name) || wanted.has(name)) { continue; }
	if (check) { stale.push('site/maps/' + name + ' (orphaned)'); continue; }
	fs.unlinkSync(path.join(MUP_OUT, name));
	console.log('removed site/maps/' + name);
}

if (check && stale.length) {
	console.error('stale, rerun `node figures/build.mjs`:\n  ' + stale.join('\n  '));
	process.exit(1);
}
if (!check && !pages.size) { console.log('nothing to do'); }
