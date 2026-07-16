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
		theme = new MAPJS.Theme(baseThemeJson),
		currentMapJson = null,
		labelsOn = true;
	const mapModel = new MAPJS.MapModel([]),
		listeners = { mapChanged: [], mapLoaded: [] },
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
			refreshThemeCSS(themeJson);
			if (rebuild && mapModel.getIdea()) {
				mapModel.rebuildRequired();
			}
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
			const idea = MAPJS.content(mapJson);
			idea.addEventListener('changed', () => emit('mapChanged'));
			mapModel.setIdea(idea);
			// center once the DomMapController has finished the initial layout
			window.setTimeout(function () {
				const rootId = mapModel.getSelectedNodeId();
				if (rootId) { mapModel.centerOnNode(rootId); }
				mapModel.resetView();
				deselectAll();
			}, 250);
			emit('mapLoaded', mapJson);
		},
		// re-resolve and apply a named theme, recording it on the map
		setThemeByName(name) {
			const idea = mapModel.getIdea();
			if (!idea) { return; }
			idea.updateAttr(idea.id, 'theme', name);
			if (currentMapJson && currentMapJson.theme) { delete currentMapJson.theme; }
			baseThemeJson = augmentThemeJson(resolveThemeJson({ attr: { theme: name } }));
			applyTheme(true);
		},
		// view-time theme transform (dark mode); pass null to clear
		setThemeFilter(fn) {
			themeFilter = fn || null;
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
