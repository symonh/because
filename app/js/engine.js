/*global window, document*/
/*
 * Engine wrapper: owns the mapjs MapModel/DomMapController pair, per-map
 * theme resolution (embedded > named > default), theme CSS regeneration,
 * and load/serialize. UI modules talk to the returned api, not to mapjs.
 */
import { resolveThemeJson, augmentThemeJson } from './themes.js';
import { argLabelGenerator } from './numbering.js';
import { installDropPolicy } from './drop-policy.js';

const MAPJS = window.MAPJS,
	jQuery = window.jQuery;

// A new map's conclusion claim carries this as real title text. Listing it
// in the MapModel's selectAllTitles (below) makes editNode select the whole
// title on every open path — Space, F2, double-click, or the menu — so the
// first keystroke replaces the placeholder instead of appending to it. This
// is the mechanism MindMup used for its own 'Press Space or double-click to
// edit' root. file-io.js imports it for the new-map title so the title and
// this list can never drift apart.
export const CONCLUSION_PLACEHOLDER = 'Type your conclusion here';

export function initEngine(container) {
	let baseThemeJson = augmentThemeJson(resolveThemeJson(null)),
		themeFilter = null, // view-time transform (dark mode); never saved
		attrColorFilter = null, // companion transform for per-node author colours
		theme = new MAPJS.Theme(baseThemeJson),
		currentMapJson = null,
		labelsOn = true,
		loadToken = 0; // invalidates deferred work when another map loads first
	const mapModel = new MAPJS.MapModel([CONCLUSION_PLACEHOLDER]),
		// above this, loading is deferred behind an overlay; a 68-node map
		// measured ~140ms of layout, so only genuinely huge maps qualify
		LARGE_MAP_NODES = 100,
		listeners = { mapChanged: [], mapLoaded: [], loadStarted: [], loadFinished: [] },
		emit = (name, ...args) => listeners[name].forEach(fn => fn(...args)),
		refreshThemeCSS = function (themeJson) {
			const themeCSS = themeJson && new MAPJS.ThemeProcessor().process(themeJson).css;
			if (!themeCSS) { return false; }
			let styleElement = jQuery('#themeCSS');
			if (!styleElement.length) {
				styleElement = jQuery('<style id="themeCSS" type="text/css"></style>').appendTo('head');
			}
			styleElement.text(themeCSS);
			return true;
		},
		// the editor auto-selects the root on load, which draws the dotted
		// "activated" border; a freshly opened map should look clean.
		// Only blur when a map node holds focus: this runs 250ms after
		// load, and an unscoped blur was yanking focus out of whatever
		// dialog had opened meanwhile (the first-visit welcome modal)
		deselectAll = function () {
			jQuery('.mapjs-node').removeClass('activated selected');
			const active = document.activeElement;
			if (active && active.blur && active.classList &&
					active.classList.contains('mapjs-node')) {
				active.blur();
			}
		},
		applyLabels = function () {
			if (labelsOn) {
				mapModel.setLabelGenerator(argLabelGenerator, 'argument-mapping');
			} else {
				mapModel.setLabelGenerator(false, 'argument-mapping');
			}
		},
		applyTheme = function (rebuild) {
			const themeJson = themeFilter ? themeFilter(baseThemeJson) : baseThemeJson;
			// the DomMapController reads the replaced closure via its
			// themeSource callback; rebuildRequired makes it re-render
			theme = new MAPJS.Theme(themeJson);
			// updateNodeContent passes author-set colours (attr.style.*)
			// through this before painting — see LOCAL-PATCHES.diff
			theme.attributeColorFilter = attrColorFilter;
			refreshThemeCSS(themeJson);
			if (rebuild && mapModel.getIdea()) {
				mapModel.rebuildRequired();
			}
		},
		countNodes = function (json) {
			const kids = (json && json.ideas) || {};
			return 1 + Object.keys(kids).reduce((n, k) => n + countNodes(kids[k]), 0);
		},
		// mapjs fills in a missing title but hands a non-string one straight
		// to the renderer, which calls string methods on it. Coerce in
		// place: the object the model ends up holding has to stay the one
		// currentMapJson points at (see loadMap).
		normalizeTitles = function (node) {
			if (node.title !== undefined && node.title !== null && typeof node.title !== 'string') {
				node.title = String(node.title);
			}
			const kids = node.ideas || {};
			Object.keys(kids).forEach(key => normalizeTitles(kids[key]));
		};

	// mapjs dispatches nodeClicked for a plain left-button tap and leaves
	// acting on it to the application layer (MindMup's app did the
	// selecting) — without this, only drags and arrow keys move the
	// selection and clean clicks silently do nothing
	mapModel.addEventListener('nodeClicked', id => mapModel.selectNode(id));

	installDropPolicy(mapModel);
	jQuery(container).domMapWidget(console, mapModel, false);
	// eslint-disable-next-line no-new
	new MAPJS.DomMapController(
		mapModel,
		jQuery(container).find('[data-mapjs-role=stage]'),
		false,
		undefined,
		() => theme
	);

	const api = {
		mapModel,
		on(name, fn) { listeners[name].push(fn); },
		loadMap(mapJson, options) {
			// a .mup is an object holding at least one root idea; anything
			// else models as a single blank node, silently replacing the
			// open map with nothing
			if (!mapJson || typeof mapJson !== 'object' ||
					!mapJson.ideas || !Object.keys(mapJson.ideas).length) {
				throw new Error('not an argument map');
			}
			normalizeTitles(mapJson);
			// New maps ask to keep the auto-selected conclusion selected and
			// focused; every other load clears it so the map opens clean.
			const selectRoot = !!(options && options.selectRoot);
			// build the aggregate before touching any app state, so a map
			// mapjs cannot model is refused with nothing replaced yet
			const idea = MAPJS.content(mapJson);
			baseThemeJson = augmentThemeJson(resolveThemeJson(mapJson));
			applyTheme(false);
			applyLabels();
			// the same object the model holds: setThemeByName deletes an
			// embedded theme through this reference, and that deletion has
			// to reach what serialize() writes
			currentMapJson = mapJson;
			// mapLoaded means "a new map is replacing the old one" and must
			// fire inside this call: drive.js binds its file marker right
			// after loadJson returns and this event must not wipe it later
			emit('mapLoaded', mapJson);
			loadToken += 1;
			const token = loadToken,
				previousIdea = mapModel.getIdea(),
				heavy = function () {
					try {
						idea.addEventListener('changed', () => emit('mapChanged'));
						mapModel.setIdea(idea);
					} catch (e) {
						// a map mapjs can model but not draw must not take
						// the editor with it: put the last drawable one back
						if (previousIdea) { mapModel.setIdea(previousIdea); }
						emit('loadFinished');
						throw e;
					}
					// center once the DomMapController has finished the initial layout
					window.setTimeout(function () {
						if (token !== loadToken) { return; } // superseded by a newer load
						const rootId = mapModel.getSelectedNodeId();
						if (rootId) { mapModel.centerOnNode(rootId); }
						mapModel.resetView();
						if (selectRoot) {
							// leave the conclusion selected (skip deselectAll) and
							// hand it keyboard focus, so Space opens it — with the
							// placeholder text selected — and Enter adds a reason.
							// Never pull focus out of an open dialog: the first-visit
							// welcome modal shows alongside the very first new map and
							// its own focus trap must win (a11y.js). Skip the grab
							// while it is open; dismissing it restores focus to the
							// container, which delegates to this same selected node.
							if (!document.querySelector('.panel-overlay')) {
								container.focus();
							}
						} else {
							deselectAll();
						}
						emit('loadFinished');
					}, 250);
				};
			if (countNodes(mapJson) >= LARGE_MAP_NODES) {
				// big maps block the main thread for seconds in setIdea; two
				// animation frames let the loading overlay paint first
				emit('loadStarted', mapJson);
				window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
					if (token !== loadToken) { return; }
					heavy();
				}));
			} else {
				heavy();
			}
		},
		// re-resolve and apply a named theme, recording it on the map.
		// The new theme must be installed BEFORE updateAttr: the attr change
		// fires the rebuild (themeChanged=true → every node re-renders and
		// re-draws its connectors), and that rebuild must already see the
		// new theme — the old order re-rendered everything against the old
		// theme and the follow-up rebuild found nothing left to change.
		setThemeByName(name) {
			const idea = mapModel.getIdea();
			if (!idea) { return; }
			if (currentMapJson && currentMapJson.theme) { delete currentMapJson.theme; }
			baseThemeJson = augmentThemeJson(resolveThemeJson({ attr: { theme: name } }));
			applyTheme(false);
			idea.updateAttr(idea.id, 'theme', name);
		},
		// view-time theme transform (dark mode); pass null to clear.
		// colorFn additionally transforms per-node author colours
		// (attr.style.background etc.), which live outside the theme JSON
		setThemeFilter(fn, colorFn) {
			themeFilter = fn || null;
			attrColorFilter = colorFn || null;
			applyTheme(true);
		},
		getThemeName() {
			const idea = mapModel.getIdea();
			return (idea && idea.attr && idea.attr.theme) || 'argMappingSimple';
		},
		setLabelsOn(on) {
			labelsOn = !!on;
			applyLabels();
		},
		getLabelsOn() { return labelsOn; },
		serialize() {
			const idea = mapModel.getIdea();
			// the content aggregate keeps data as enumerable own properties;
			// functions are dropped by JSON.stringify
			return JSON.stringify(idea, null, 1);
		},
		deselectAll
	};
	return api;
}
