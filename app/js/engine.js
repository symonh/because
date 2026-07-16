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

export function initEngine(container) {
	let baseThemeJson = augmentThemeJson(resolveThemeJson(null)),
		themeFilter = null, // view-time transform (dark mode); never saved
		attrColorFilter = null, // companion transform for per-node author colours
		theme = new MAPJS.Theme(baseThemeJson),
		currentMapJson = null,
		labelsOn = true,
		loadToken = 0; // invalidates deferred work when another map loads first
	const mapModel = new MAPJS.MapModel([]),
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
		// "activated" border; a freshly opened map should look clean
		deselectAll = function () {
			jQuery('.mapjs-node').removeClass('activated selected');
			if (document.activeElement && document.activeElement.blur) {
				document.activeElement.blur();
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
		loadMap(mapJson) {
			baseThemeJson = augmentThemeJson(resolveThemeJson(mapJson));
			applyTheme(false);
			applyLabels();
			currentMapJson = mapJson;
			// mapLoaded means "a new map is replacing the old one" and must
			// fire inside this call: drive.js binds its file marker right
			// after loadJson returns and this event must not wipe it later
			emit('mapLoaded', mapJson);
			loadToken += 1;
			const token = loadToken,
				heavy = function () {
					try {
						const idea = MAPJS.content(mapJson);
						idea.addEventListener('changed', () => emit('mapChanged'));
						mapModel.setIdea(idea);
					} catch (e) {
						emit('loadFinished');
						throw e;
					}
					// center once the DomMapController has finished the initial layout
					window.setTimeout(function () {
						if (token !== loadToken) { return; } // superseded by a newer load
						const rootId = mapModel.getSelectedNodeId();
						if (rootId) { mapModel.centerOnNode(rootId); }
						mapModel.resetView();
						deselectAll();
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
