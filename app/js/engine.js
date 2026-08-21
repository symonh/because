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

const objectValue = value => !!value && typeof value === 'object' && !Array.isArray(value),
	failMap = message => { throw new Error('Invalid map: ' + message); },
	validateRawNode = function (node, path) {
		if (!objectValue(node)) { failMap(path + ' must be an object'); }
		['attr', 'style'].forEach(function (key) {
			if (node[key] !== undefined && !objectValue(node[key])) {
				failMap(path + '.' + key + ' must be an object');
			}
		});
		if (node.ideas !== undefined) {
			if (!objectValue(node.ideas)) { failMap(path + '.ideas must be an object'); }
			const ranks = new Set();
			Object.keys(node.ideas).forEach(function (key) {
				const rank = parseFloat(key);
				if (!Number.isFinite(rank) || rank === 0) {
					failMap(path + '.ideas has invalid rank ' + key);
				}
				if (ranks.has(rank)) { failMap(path + '.ideas has colliding rank ' + key); }
				ranks.add(rank);
				validateRawNode(node.ideas[key], path + '.ideas[' + key + ']');
			});
		}
	},
	validateLinks = function (links) {
		if (links === undefined) { return; }
		if (!Array.isArray(links) || links.some(link => !objectValue(link))) {
			failMap('links must be an array of objects');
		}
	},
	validateThemeValues = function (value, path) {
		if (value === null) { failMap(path + ' must not be null'); }
		if (typeof value === 'number' && !Number.isFinite(value)) {
			failMap(path + ' must be finite');
		}
		if (Array.isArray(value)) {
			value.forEach((item, index) => validateThemeValues(item, path + '[' + index + ']'));
		} else if (objectValue(value)) {
			Object.keys(value).forEach(key => validateThemeValues(value[key], path + '.' + key));
		}
	},
	validateThemeLayout = function (themeJson) {
		const layout = themeJson.layout;
		if (layout === undefined) { return; }
		if (!objectValue(layout)) { failMap('theme.layout must be an object'); }
		if (layout.orientation !== undefined && typeof layout.orientation !== 'string') {
			failMap('theme.layout.orientation must be a string');
		}
		if (layout.spacing === undefined) { return; }
		if (typeof layout.spacing === 'number') {
			if (!Number.isFinite(layout.spacing) || layout.spacing < 0) {
				failMap('theme.layout.spacing must be non-negative and finite');
			}
			return;
		}
		if (!objectValue(layout.spacing)) {
			failMap('theme.layout.spacing must be a number or object');
		}
		['h', 'v'].forEach(function (key) {
			if (!Number.isFinite(layout.spacing[key]) || layout.spacing[key] < 0) {
				failMap('theme.layout.spacing.' + key + ' must be non-negative and finite');
			}
		});
		if (layout.spacing.nestedGroupLabel !== undefined &&
				(!Number.isFinite(layout.spacing.nestedGroupLabel) || layout.spacing.nestedGroupLabel < 0)) {
			failMap('theme.layout.spacing.nestedGroupLabel must be non-negative and finite');
		}
	},
	validateCanonical = function (candidate) {
		if (!objectValue(candidate.ideas) || Object.keys(candidate.ideas).length === 0) {
			failMap('upgraded map must contain a root idea');
		}
		const ids = new Set();
		const visit = function (node, path) {
			if (!objectValue(node)) { failMap(path + ' must be an object'); }
			if (typeof node.title !== 'string') { failMap(path + '.title must be a string'); }
			if (!(typeof node.id === 'string' || (typeof node.id === 'number' && Number.isFinite(node.id)))) {
				failMap(path + '.id must be a string or finite number');
			}
			const id = String(node.id);
			if (ids.has(id)) { failMap('duplicate id ' + id); }
			ids.add(id);
			['attr', 'style'].forEach(function (key) {
				if (node[key] !== undefined && !objectValue(node[key])) {
					failMap(path + '.' + key + ' must be an object');
				}
			});
			if (node.ideas !== undefined) {
				if (!objectValue(node.ideas)) { failMap(path + '.ideas must be an object'); }
				Object.keys(node.ideas).forEach(key => visit(node.ideas[key], path + '.ideas[' + key + ']'));
			}
		};
		visit(candidate, 'root');
		validateLinks(candidate.links);
	};

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
		loadToken = 0, // invalidates deferred work when another map loads first
		pendingLoad = null;
	const mapModel = new MAPJS.MapModel([CONCLUSION_PLACEHOLDER]),
		// above this, loading is deferred behind an overlay; a 68-node map
		// measured ~140ms of layout, so only genuinely huge maps qualify
		LARGE_MAP_NODES = 100,
		listeners = { mapChanged: [], mapLoaded: [], loadStarted: [], loadFinished: [] },
		emit = (name, ...args) => listeners[name].slice().forEach(function (fn) {
			try { fn(...args); } catch (e) { window.console.error(e); }
		}),
		installThemeCSS = function (css) {
			if (!css) { return false; }
			let styleElement = jQuery('#themeCSS');
			if (!styleElement.length) {
				styleElement = jQuery('<style id="themeCSS" type="text/css"></style>').appendTo('head');
			}
			styleElement.text(css);
			return true;
		},
		refreshThemeCSS = function (themeJson) {
			const themeCSS = themeJson && new MAPJS.ThemeProcessor().process(themeJson).css;
			return installThemeCSS(themeCSS);
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
		prepareMap = function (mapJson) {
			if (!objectValue(mapJson)) { failMap('top level must be an object'); }
			if (mapJson.formatVersion !== undefined && !Number.isFinite(Number(mapJson.formatVersion))) {
				failMap('formatVersion must be finite');
			}
			if (mapJson.theme !== undefined && !objectValue(mapJson.theme)) {
				failMap('theme must be an object');
			}
			validateRawNode(mapJson, 'root');
			validateLinks(mapJson.links);
			const clone = JSON.parse(JSON.stringify(mapJson)),
				idea = MAPJS.content(clone);
			validateCanonical(idea);
			const preparedBaseTheme = augmentThemeJson(resolveThemeJson(clone)),
				preparedThemeJson = themeFilter ? themeFilter(preparedBaseTheme) : preparedBaseTheme;
			validateThemeValues(preparedThemeJson, 'theme');
			validateThemeLayout(preparedThemeJson);
			const preparedTheme = new MAPJS.Theme(preparedThemeJson),
				preparedThemeCSS = new MAPJS.ThemeProcessor().process(preparedThemeJson).css;
			preparedTheme.attributeColorFilter = attrColorFilter;
			return { idea, baseTheme: preparedBaseTheme, theme: preparedTheme, css: preparedThemeCSS };
		},
		finishPending = function (record) {
			if (!record || record.finished) { return; }
			record.finished = true;
			if (record.started) { emit('loadFinished'); }
			if (pendingLoad === record) { pendingLoad = null; }
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
			const prepared = prepareMap(mapJson);
			finishPending(pendingLoad);
			// New maps ask to keep the auto-selected conclusion selected and
			// focused; every other load clears it so the map opens clean.
			const selectRoot = !!(options && options.selectRoot);
			loadToken += 1;
			const token = loadToken,
				record = { token: token, started: false, finished: false },
				heavy = function () {
					try {
						baseThemeJson = prepared.baseTheme;
						theme = prepared.theme;
						installThemeCSS(prepared.css);
						applyLabels();
						prepared.idea.addEventListener('changed', () => emit('mapChanged'));
						mapModel.setIdea(prepared.idea);
						currentMapJson = mapJson;
						emit('mapLoaded', mapJson);
					} catch (e) {
						finishPending(record);
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
						finishPending(record);
					}, 250);
				};
			pendingLoad = record;
			if (countNodes(prepared.idea) >= LARGE_MAP_NODES) {
				// big maps block the main thread for seconds in setIdea; two
				// animation frames let the loading overlay paint first
				record.started = true;
				emit('loadStarted', mapJson);
				window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
					if (token !== loadToken) { return; }
					heavy();
				}));
			} else {
				heavy();
				// small loads never showed the overlay; only their delayed
				// centring remains cancellable.
				pendingLoad = null;
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
