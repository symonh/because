/*global window, document*/
/*
 * Print / Save as PDF.
 *
 * The browser prints the document as it is laid out, not as the editor
 * shows it. #map-container is a scrolling viewport, and inside it the
 * stage is mostly empty space with the map parked at whatever pan offset
 * the user left it at — so a bare window.print() printed whatever
 * happened to fall under the top-left corner of the paper, which for a
 * map panned to the right was nothing at all. mapjs has no print path of
 * its own (MindMup's PDF export was a server-side render in its closed
 * app layer), so this module is it.
 *
 * What it does, from a beforeprint listener so it covers ⌘P and the
 * browser's own menu as well as File > Print: measures the map's real
 * extent from the DOM, then writes a print-only stylesheet that turns
 * #map-container into a page-sized box and transforms the stage so the
 * map lands inside it, centred and scaled to fit. Everything it writes
 * is inside @media print, so a stale rule can never affect the screen;
 * the only live-DOM changes are the scroll offset and the selection
 * outline, both restored on afterprint (and by a fallback timer if that
 * never fires).
 *
 * Paper: the browser owns it and never tells us which sheet is loaded,
 * so "Fit to page" targets a box that A4 (210×297mm) and US Letter
 * (216×279mm) both contain with at least 10mm of margin to spare, and
 * declares only an orientation in @page — never a paper size, which
 * would fight the user's own choice in the print dialog. "Full size"
 * instead declares a page exactly as big as the map: one big PDF page,
 * the way MindMup's own "fit to map" export behaved.
 */

import { track } from './analytics.js';
import { initModal } from './a11y.js';
import { get as storageGet, set as storageSet } from './safe-storage.js';

const KEY = 'because.print',
	STYLE_ID = 'print-css',
	PX_PER_MM = 96 / 25.4,
	// 255×180mm: inside A4 landscape (297×210) and Letter landscape
	// (279×216) alike, with ≥10mm clear on every edge of either
	SAFE_LONG_MM = 255,
	SAFE_SHORT_MM = 180,
	// Chrome's PDF pages stop at 200in, which is also PDF's own 14400pt
	MAX_PAGE_MM = 5000,
	MIN_PAGE_MM = 20,
	PAD_PX = 16, // breathing room around the map inside the page box
	clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v)),
	round2 = v => Math.round(v * 100) / 100,
	// the fit scale needs the digits: rounding 0.17488 to 0.17 is a 3%
	// error on a map printed at a sixth of its size
	round5 = v => Math.round(v * 100000) / 100000,
	// Safari takes the sheet from its own print dialog and from nowhere
	// else: probed 2026-08-03 against Safari 18 with `size: landscape`,
	// `size: A4 landscape` and explicit `size: 279.4mm 215.9mm` — all three
	// parse (they round-trip through CSSOM) and all three leave the sheet
	// portrait. Chrome honours the same declaration. Nothing about a page
	// can tell the two apart, so the dialog says which one the reader is in.
	APPLE_WEBKIT = /apple/i.test((window.navigator && window.navigator.vendor) || ''),
	normalize = o => ({
		fit: o && o.fit === 'map' ? 'map' : 'page',
		orientation: o && /^(landscape|portrait)$/.test(o.orientation) ? o.orientation : 'auto'
	}),
	readOpts = function () {
		let stored = null;
		try { stored = JSON.parse(storageGet(KEY) || 'null'); } catch (e) { /* junk */ }
		return normalize(stored);
	},
	saveOpts = function (opts) {
		storageSet(KEY, JSON.stringify(opts));
	};

export function makePrint(container) {
	let opts = readOpts(),
		undo = null, // restores the live DOM after a print run
		undoTimer = null;

	const stage = () => container && container.querySelector('[data-mapjs-role=stage]'),

		// The map's real extent in stage coordinates (the space the nodes'
		// left/top live in, before the stage's own pan/zoom transform).
		// Every rect is read from the rendered DOM rather than from the
		// model, so connector curves, arrowheads, bracket strips, labels
		// and sticky notes are all inside it — and so is anything a future
		// renderer draws, without this having to learn about it.
		bounds = function () {
			const st = stage();
			if (!st) { return null; }
			const rect = st.getBoundingClientRect(),
				// the stage carries the zoom: rect is post-transform,
				// offsetWidth is not, so their ratio IS the current scale
				scale = st.offsetWidth ? rect.width / st.offsetWidth : 1;
			let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
			const add = function (el) {
					const r = el.getBoundingClientRect();
					if (!r.width && !r.height) { return; } // collapsed or hidden
					const x = (r.left - rect.left) / scale,
						y = (r.top - rect.top) / scale;
					x0 = Math.min(x0, x);
					y0 = Math.min(y0, y);
					x1 = Math.max(x1, x + r.width / scale);
					y1 = Math.max(y1, y + r.height / scale);
				},
				svg = '[data-mapjs-role=svg-container] ',
				shapes = ['path', 'text', 'rect', 'polygon', 'polyline', 'line',
					'circle', 'ellipse', 'image'].map(t => svg + t).join(',');
			st.querySelectorAll('[data-mapjs-role=node]').forEach(add);
			st.querySelectorAll(shapes).forEach(add);
			if (!isFinite(x0)) { return null; }
			return { x: x0, y: y0, w: Math.max(1, x1 - x0), h: Math.max(1, y1 - y0) };
		},

		// landscape or portrait — whichever fits the map at a larger scale
		orientationFor = function (b) {
			if (opts.orientation !== 'auto') { return opts.orientation; }
			const long = SAFE_LONG_MM * PX_PER_MM,
				short = SAFE_SHORT_MM * PX_PER_MM;
			return Math.min(long / b.w, short / b.h) >= Math.min(short / b.w, long / b.h) ?
				'landscape' : 'portrait';
		},

		// the page box, and the transform that drops the map into it
		geometry = function (b) {
			const orientation = orientationFor(b),
				fitToMap = opts.fit === 'map';
			let boxW, boxH, page;
			if (fitToMap) {
				boxW = clamp(b.w + PAD_PX * 2, MIN_PAGE_MM * PX_PER_MM, MAX_PAGE_MM * PX_PER_MM);
				boxH = clamp(b.h + PAD_PX * 2, MIN_PAGE_MM * PX_PER_MM, MAX_PAGE_MM * PX_PER_MM);
				// a page cut to the map: the sheet IS the drawing, no margin
				page = '@page { size: ' + round2(boxW / PX_PER_MM) + 'mm ' +
					round2(boxH / PX_PER_MM) + 'mm; margin: 0; }';
			} else {
				boxW = (orientation === 'landscape' ? SAFE_LONG_MM : SAFE_SHORT_MM) * PX_PER_MM;
				boxH = (orientation === 'landscape' ? SAFE_SHORT_MM : SAFE_LONG_MM) * PX_PER_MM;
				// orientation only: the paper stays the user's own choice,
				// and the box above already fits inside A4 or Letter
				page = '@page { size: ' + orientation + '; margin: 10mm; }';
			}
			// shrink to fit, never magnify: a two-claim map blown up to fill
			// A4 is not what "print the map" means. On a page cut to the map
			// this is 1 by construction, except for a map bigger than any
			// page may be — there it is the difference between a map printed
			// small and a map printed cut off.
			const scale = Math.min(1, (boxW - PAD_PX * 2) / b.w, (boxH - PAD_PX * 2) / b.h),
				// a stage point p prints at translate + scale·p; this centres
				// the map's own box inside the page box
				tx = (boxW - b.w * scale) / 2 - b.x * scale,
				ty = (boxH - b.h * scale) / 2 - b.y * scale,
				// half the vertical slack on the shortest sheet the box was
				// cut to fit: A4 landscape (210-20=190mm) or Letter portrait
				// (279-20=259mm), against a box of 180 or 255
				shortestSheetMM = orientation === 'landscape' ? SAFE_SHORT_MM + 10 : SAFE_LONG_MM + 4,
				marginTopMM = fitToMap ? 0 : (shortestSheetMM - boxH / PX_PER_MM) / 2;
			return {
				boxW: boxW, boxH: boxH, scale: scale, tx: tx, ty: ty,
				marginTopMM: marginTopMM, page: page, orientation: orientation, map: b
			};
		},

		cssFor = g => '@media print {\n' +
			g.page + '\n' +
			'html, body { width: auto !important; height: auto !important;' +
			' margin: 0 !important; padding: 0 !important;' +
			' background: #fff !important; overflow: visible !important; }\n' +
			'body { display: block !important; }\n' +
			// the chrome, every popover, and any overlay: the sheet is the
			// map and nothing else
			'body > *:not(#map-container) { display: none !important; }\n' +
			'#map-container {\n' +
			' display: block !important;\n' +
			' position: relative !important;\n' +
			' box-sizing: border-box !important;\n' +
			' width: ' + round2(g.boxW) + 'px !important;\n' +
			' height: ' + round2(g.boxH) + 'px !important;\n' +
			// centred across whatever paper the browser is actually using,
			// and pushed down by half the slack the SMALLEST sheet it could
			// be would leave over. Centring vertically for real would take
			// the page box's height, and no page can read that: viewport
			// units are the page box in Chrome but print media queries
			// report the paper-before-CSS there and the browser window in
			// WebKit, so a layout that leant on either would paginate on
			// somebody's screen. A fixed offset cannot: the true sheet is
			// never smaller than the one this was measured against.
			' margin: ' + round2(g.marginTopMM) + 'mm auto !important;\n' +
			// clip, and — where it is supported — clip WITHOUT being a
			// scroll container, so that no scroll offset (nor one of
			// mapjs's animated ones, still in flight from a rebuild) can
			// slide the map back off the sheet. The hidden line is the
			// fallback for engines that don't know `clip`; takeOverDOM
			// zeroes the offset for those.
			' overflow: hidden !important;\n' +
			' overflow: clip !important;\n' +
			// and the reason the sheet is not silently shrunk: a browser
			// asked to print a document wider than the paper scales the
			// whole page down to fit, and Chrome counts the stage's
			// off-page extent towards that width even though the box
			// above clips it — a wide map printed at two thirds of the
			// size it was fitted to, in the middle of the sheet. Size
			// containment is what stops the contents counting; `strict`
			// is safe here precisely because the width and height above
			// are explicit. Engines without it fall back to the shrink,
			// which is smaller but still whole.
			' contain: strict !important;\n' +
			' background: #fff !important;\n' +
			' outline: none !important;\n' +
			'}\n' +
			'#map-container > [data-mapjs-role=stage] {\n' +
			' transform: translate(' + round2(g.tx) + 'px, ' + round2(g.ty) + 'px)' +
			' scale(' + round5(g.scale) + ') !important;\n' +
			' transform-origin: 0 0 !important;\n' +
			'}\n' +
			'}\n',

		writeCSS = function (css) {
			let el = document.getElementById(STYLE_ID);
			if (!el) {
				el = document.createElement('style');
				el.id = STYLE_ID;
				document.head.appendChild(el);
			}
			el.textContent = css;
		},

		// the two things the print layout needs from the live DOM. Both are
		// view state, never map data, and both come back afterwards.
		takeOverDOM = function () {
			const scrollLeft = container.scrollLeft,
				scrollTop = container.scrollTop,
				// a printout should not carry the editor's selection outline
				marked = Array.from(container.querySelectorAll('.activated, .selected'))
					.map(el => ({
						el: el,
						activated: el.classList.contains('activated'),
						selected: el.classList.contains('selected')
					}));
			marked.forEach(m => m.el.classList.remove('activated', 'selected'));
			// mapjs scrolls the viewport by animating it (ensureNodeVisible,
			// centerOnNode), and a rebuild — dark mode's flip to light for
			// printing is one — starts a fresh animation that would still be
			// writing scroll offsets while the sheet is being laid out
			if (window.jQuery) { window.jQuery(container).stop(true); }
			container.scrollLeft = 0;
			container.scrollTop = 0;
			return function () {
				marked.forEach(function (m) {
					if (m.activated) { m.el.classList.add('activated'); }
					if (m.selected) { m.el.classList.add('selected'); }
				});
				const scrollBack = function () {
					container.scrollLeft = scrollLeft;
					container.scrollTop = scrollTop;
				};
				scrollBack();
				// the screen layout is not always back by the time
				// afterprint fires, and a container still cut to the page
				// box has nowhere to scroll to — the offset would clamp to
				// zero and the map would jump
				window.requestAnimationFrame(scrollBack);
			};
		},

		release = function () {
			if (undoTimer) { window.clearTimeout(undoTimer); undoTimer = null; }
			if (undo) { undo(); undo = null; }
		},

		// everything a print run needs, whatever started it
		prepare = function () {
			const b = bounds();
			if (!b) { return null; }
			const g = geometry(b);
			writeCSS(cssFor(g));
			if (!undo) { undo = takeOverDOM(); }
			// a cancelled print can leave afterprint unfired; the editor
			// must not be left without its selection outline because of it
			if (undoTimer) { window.clearTimeout(undoTimer); }
			undoTimer = window.setTimeout(release, 60000);
			return g;
		},

		run = function () {
			// prepared here as well as on beforeprint, so a browser that
			// never fires that event still prints a laid-out sheet
			prepare();
			window.print();
		},

		// what the dialog tells the user before they commit
		summary = function () {
			const b = bounds();
			if (!b) { return { text: 'There is nothing on the map to print yet.' }; }
			const g = geometry(b);
			if (opts.fit === 'map') {
				return {
					text: 'One page ' + Math.round(g.boxW / PX_PER_MM) + ' × ' +
						Math.round(g.boxH / PX_PER_MM) + ' mm (' +
						round2(g.boxW / 96) + ' × ' + round2(g.boxH / 96) + ' in), ' +
						// only a map too big for any page prints below 1:1 here
						(g.scale < 1 ? 'with the map at ' + Math.round(g.scale * 100) +
							'% — the largest page a PDF can hold.' : 'with the map at full size.')
				};
			}
			// below 40% the claim text is under about 5pt: legible on screen
			// in a PDF, not on paper
			const percent = Math.round(g.scale * 100),
				small = percent < 40;
			return {
				text: 'The whole map on one ' + g.orientation + ' page, at ' +
					percent + '% of its size.' +
					(small ? ' At that size the claim text will be too small to read on ' +
						'paper; Full size prints it legibly on a larger page.' : ''),
				small: small
			};
		},

		open = function () {
			let modal = null;
			const overlay = document.createElement('div'),
				panel = document.createElement('div'),
				heading = document.createElement('h2'),
				hint = document.createElement('p'),
				note = document.createElement('p'),
				actions = document.createElement('div'),
				cancel = document.createElement('button'),
				go = document.createElement('button'),
				close = () => { if (modal) { modal.close(); modal = null; } },
				group = function (legendText, name, choices, current, onChange) {
					const set = document.createElement('fieldset'),
						legend = document.createElement('legend');
					legend.textContent = legendText;
					set.appendChild(legend);
					choices.forEach(function (choice) {
						const label = document.createElement('label'),
							input = document.createElement('input');
						input.type = 'radio';
						input.name = name;
						input.value = choice[0];
						input.checked = choice[0] === current;
						input.addEventListener('change', function () {
							if (input.checked) { onChange(choice[0]); }
						});
						label.append(input, document.createTextNode(' ' + choice[1]));
						set.appendChild(label);
					});
					return set;
				},
				sizeSet = group('Size', 'print-fit', [
					['page', 'Fit the whole map on one page'],
					['map', 'Full size, on a page as large as the map']
				], opts.fit, function (v) {
					opts = normalize({ fit: v, orientation: opts.orientation });
					saveOpts(opts);
					refresh();
				}),
				orientationSet = group('Orientation', 'print-orientation', [
					['auto', 'Auto'],
					['landscape', 'Landscape'],
					['portrait', 'Portrait']
				], opts.orientation, function (v) {
					opts = normalize({ fit: opts.fit, orientation: v });
					saveOpts(opts);
					refresh();
				});

			function refresh() {
				const s = summary();
				hint.textContent = s.text;
				hint.classList.toggle('print-warn', !!s.small);
				// a page cut to the map has no orientation to choose
				orientationSet.disabled = opts.fit === 'map';
			}

			overlay.className = 'panel-overlay';
			panel.className = 'panel print-panel';
			heading.textContent = 'Print / Save as PDF';
			hint.className = 'print-hint';
			hint.setAttribute('role', 'status');
			note.className = 'print-note';
			note.textContent = APPLE_WEBKIT ?
				// stated where it is true and nowhere else: in Chrome the
				// orientation above sets the sheet, and saying otherwise
				// would send the reader looking for a control that agrees
				'Safari takes the paper orientation from its own print dialog rather ' +
					'than from the page, so a wide map needs Landscape chosen there as ' +
					'well. Pick a printer — or Save as PDF — in the same dialog.' :
				'Pick a printer — or Save as PDF — in the browser’s own print dialog next.';
			actions.className = 'panel-actions';
			cancel.type = 'button';
			cancel.textContent = 'Cancel';
			cancel.dataset.act = 'cancel';
			cancel.addEventListener('click', close);
			go.type = 'button';
			go.textContent = 'Print…';
			go.dataset.act = 'save';
			go.addEventListener('click', function () {
				// close first (the modal is a body child, and the print
				// stylesheet hides those) but print inside the click itself:
				// Safari gates what a handler may do on the gesture, and the
				// gesture is spent the moment this returns
				close();
				run();
			});
			actions.append(cancel, go);
			panel.append(heading, sizeSet, orientationSet, hint, note, actions);
			overlay.appendChild(panel);
			overlay.addEventListener('click', e => { if (e.target === overlay) { close(); } });
			document.body.appendChild(overlay);
			refresh();
			modal = initModal(overlay, { initialFocus: go, onRequestClose: close });
		};

	window.addEventListener('beforeprint', function () {
		prepare();
		track('map_print', { fit: opts.fit, orientation: opts.orientation });
	});
	window.addEventListener('afterprint', release);

	return {
		open: open,
		print: run,
		getOptions: () => ({ fit: opts.fit, orientation: opts.orientation }),
		setOptions(next) {
			opts = normalize(next);
			saveOpts(opts);
		},
		// the geometry the next print will use — the test gate reads this
		plan() {
			const b = bounds();
			return b && geometry(b);
		}
	};
}
