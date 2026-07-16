/*global require, document, window, console, fetch, URLSearchParams */
const isGroupNode = n => n.attr && (n.attr.group === 'supporting' || n.attr.group === 'opposing'),
	isStickyNode = n => n.attr && Array.isArray(n.attr.styleNames) && n.attr.styleNames.indexOf('sticky_note') >= 0,
	sortedKids = n => (n.ideas ? Object.keys(n.ideas).sort((a, b) => parseFloat(a) - parseFloat(b)).map(k => n.ideas[k]) : []),
	// premises of a claim: the content children inside its reason/objection groups
	premisesOf = function (n) {
		const out = [];
		sortedKids(n).forEach(function (k) {
			if (isGroupNode(k)) { sortedKids(k).forEach(function (p) { if (!isStickyNode(p)) out.push(p); }); }
			else if (!isStickyNode(k)) { out.push(k); }
		});
		return out;
	},
	// renderer-computed numbering: level.index (1.1, 2.1, 2.2, 3.1 …), BFS by
	// content depth; groups and sticky notes are skipped.
	argLabelGenerator = function (idea) {
		const labels = {};
		let level = sortedKids(idea).filter(n => !isGroupNode(n) && !isStickyNode(n)), depth = 1;
		while (level.length) {
			let idx = 1; const next = [];
			level.forEach(function (n) { labels[n.id] = depth + '.' + idx; idx += 1; premisesOf(n).forEach(p => next.push(p)); });
			level = next; depth += 1;
		}
		return labels;
	};
const MAPJS = require('../vendor/mapjs/src/npm-main'),
	jQuery = require('jquery'),
	themeRegistry = require('../theme-argmap'),
	testMap = require('./example-map.json'),
	content = MAPJS.content,
	// .mup files either embed their resolved theme (top-level "theme" key) or
	// name one in attr.theme; fall back to the authentic argument-mapping theme.
	resolveThemeJson = function (mapJson) {
		return (mapJson && mapJson.theme) ||
			(mapJson && mapJson.attr && themeRegistry[mapJson.attr.theme]) ||
			themeRegistry.default;
	},
	// the argument-mapping themes don't cover sticky notes or their dotted
	// connectors (MindMup's newer renderer styles those outside the theme), so
	// fill the gaps on a copy; never mutate the map's own theme object.
	augmentThemeJson = function (json) {
		const t = JSON.parse(JSON.stringify(json)),
			hasNode = name => (t.node || []).some(n => n.name === name);
		t.node = t.node || [];
		if (!hasNode('sticky_note')) {
			t.node.push({
				'name': 'sticky_note',
				'cornerRadius': 2,
				'backgroundColor': '#ffff99',
				'border': {'type': 'surround', 'line': {'color': 'transparent', 'width': 1, 'style': 'solid'}},
				'shadow': [{'color': '#070707', 'opacity': 0.4, 'offset': {'width': 2, 'height': 3}, 'radius': 3}],
				'text': {
					'margin': 8, 'alignment': 'start', 'maxWidth': 200,
					'color': '#4F4F4F', 'lightColor': '#EEEEEE', 'darkColor': '#000000',
					'font': {'lineSpacing': 6, 'size': 13, 'weight': 'normal'}
				},
				'connections': {
					'style': 'note-link',
					'default': {'h': 'center-separated', 'v': 'base'},
					'from': {'horizontal': {'h': 'center-separated', 'v': 'base'}},
					'to': {'h': 'center', 'v': 'top'}
				}
			});
		}
		if (!hasNode('activated.sticky_note')) {
			t.node.push({
				'name': 'activated.sticky_note',
				'border': {'type': 'surround', 'line': {'color': '#22AAE0', 'width': 3, 'style': 'dashed'}}
			});
		}
		t.connector = t.connector || {};
		if (!t.connector['note-link']) {
			t.connector['note-link'] = {'type': 'vertical-quadratic-s-curve', 'line': {'color': '#707070', 'width': 1.5, 'style': 'dotted'}};
		}
		return t;
	},
	init = function () {
		'use strict';
		let domMapController = false,
			theme = new MAPJS.Theme(themeRegistry.default);
		const container = jQuery('#container'),
			touchEnabled = false,
			mapModel = new MAPJS.MapModel([]),
			refreshThemeCSS = function (themeJson) {
				const themeCSS = themeJson && new MAPJS.ThemeProcessor().process(themeJson).css;
				if (!themeCSS) {
					return false;
				}
				let styleElement = jQuery('#themeCSS');
				if (!styleElement.length) {
					styleElement = jQuery('<style id="themeCSS" type="text/css"></style>').appendTo('head');
				}
				styleElement.text(themeCSS);
				return true;
			},
			getTheme = () => theme,
			// visually deselect after load: the editor auto-selects the root,
			// which draws the blue dotted "activated" border. A saved/published
			// map should open looking clean.
			deselectAll = function () {
				jQuery('.mapjs-node').removeClass('activated selected');
				if (document.activeElement && document.activeElement.blur) {
					document.activeElement.blur();
				}
			},
			loadIdea = function (mapJson) {
				const themeJson = augmentThemeJson(resolveThemeJson(mapJson));
				theme = new MAPJS.Theme(themeJson);
				refreshThemeCSS(themeJson);
				mapModel.setIdea(content(mapJson));
				window.setTimeout(deselectAll, 50);
			};

		jQuery.fn.attachmentEditorWidget = function (mapModel) {
			return this.each(function () {
				mapModel.addEventListener('attachmentOpened', function (nodeId, attachment) {
					mapModel.setAttachment(
						'attachmentEditorWidget',
						nodeId, {
							contentType: 'text/html',
							content: window.prompt('attachment', attachment && attachment.content)
						});
				});
			});
		};
		window.onerror = window.alert;
		window.jQuery = jQuery;

		container.domMapWidget(console, mapModel, touchEnabled);

		domMapController = new MAPJS.DomMapController(
			mapModel,
			container.find('[data-mapjs-role=stage]'),
			touchEnabled,
			undefined, // resourceTranslator
			getTheme
		);

		jQuery('body').attachmentEditorWidget(mapModel);
		// numbering (1.1, 2.1 …) is a view toggle; ?labels=0 turns it off
		const params = new URLSearchParams(window.location.search);
		if (params.get('labels') !== '0') {
			mapModel.setLabelGenerator(argLabelGenerator, 'argument-mapping');
		}

		// load: ?src=<url-of-.mup-json> if given, else the baked-in example
		const src = params.get('src');
		if (src) {
			fetch(src).then(r => {
				if (!r.ok) { throw new Error('HTTP ' + r.status); }
				return r.json();
			}).then(loadIdea).catch(e => window.alert('could not load ' + src + ': ' + e.message));
		} else {
			loadIdea(testMap);
		}

		jQuery('#linkEditWidget').linkEditWidget(mapModel);
		window.mapModel = mapModel;
		jQuery('.arrow').click(function () {
			jQuery(this).toggleClass('active');
		});

		container.on('drop', function (e) {
			const dataTransfer = e.originalEvent.dataTransfer;
			e.stopPropagation();
			e.preventDefault();
			if (dataTransfer && dataTransfer.files && dataTransfer.files.length > 0) {
				const fileInfo = dataTransfer.files[0];
				if (/\.mup$/.test(fileInfo.name)) {
					const oFReader = new window.FileReader();
					oFReader.onload = function (oFREvent) {
						loadIdea(JSON.parse(oFREvent.target.result));
					};
					oFReader.readAsText(fileInfo, 'UTF-8');
				}
			}
		});
	};
document.addEventListener('DOMContentLoaded', init);
