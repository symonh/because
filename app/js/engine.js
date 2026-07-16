/*global window, document*/
/*
 * Engine wrapper: owns the mapjs MapModel/DomMapController pair, per-map
 * theme resolution (embedded > named > default), theme CSS regeneration,
 * and load/serialize. UI modules talk to the returned api, not to mapjs.
 */
import { resolveThemeJson, augmentThemeJson } from './themes.js';
import { argLabelGenerator } from './numbering.js';

const MAPJS = window.MAPJS,
	jQuery = window.jQuery;

export function initEngine(container) {
	let theme = new MAPJS.Theme(augmentThemeJson(resolveThemeJson(null))),
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
		};

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
			const themeJson = augmentThemeJson(resolveThemeJson(mapJson));
			theme = new MAPJS.Theme(themeJson);
			refreshThemeCSS(themeJson);
			applyLabels();
			currentMapJson = mapJson;
			const idea = MAPJS.content(mapJson);
			idea.addEventListener('changed', () => emit('mapChanged'));
			mapModel.setIdea(idea);
			window.setTimeout(function () {
				mapModel.resetView();
				deselectAll();
			}, 50);
			emit('mapLoaded', mapJson);
		},
		// re-resolve and apply a named theme, recording it on the map
		setThemeByName(name) {
			const idea = mapModel.getIdea();
			if (!idea) { return; }
			idea.updateAttr(idea.id, 'theme', name);
			if (currentMapJson && currentMapJson.theme) { delete currentMapJson.theme; }
			const themeJson = augmentThemeJson(resolveThemeJson({ attr: { theme: name } }));
			theme = new MAPJS.Theme(themeJson);
			refreshThemeCSS(themeJson);
			mapModel.setTheme(theme);
			mapModel.rebuildRequired();
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
