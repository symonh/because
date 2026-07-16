/*global require, document, window, console */
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
const MAPJS = require('../src/npm-main'),
	jQuery = require('jquery'),
	themeProvider = require('./theme-argmap'),
	testMap = require('./example-map'),
	content = MAPJS.content,
	init = function () {
		'use strict';
		let domMapController = false;
		const container = jQuery('#container'),
			idea = content(testMap),
			touchEnabled = false,
			mapModel = new MAPJS.MapModel([]),
			layoutThemeStyle = function (themeJson) {
				const themeCSS = themeJson && new MAPJS.ThemeProcessor().process(themeJson).css;
				if (!themeCSS) {
					return false;
				}

				if (!window.themeCSS) {
					jQuery('<style id="themeCSS" type="text/css"></style>').appendTo('head').text(themeCSS);
				}
				return true;
			},
			themeJson = themeProvider.default || MAPJS.defaultTheme,
			theme = new MAPJS.Theme(themeJson),
			getTheme = () => theme;

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
		//jQuery('#themecss').themeCssWidget(themeProvider, new MAPJS.ThemeProcessor(), mapModel, domMapController);
		// activityLog, mapModel, touchEnabled, imageInsertController, dragContainer, centerSelectedNodeOnOrientationChange

		jQuery('body').attachmentEditorWidget(mapModel);
		layoutThemeStyle(themeJson);
		mapModel.setLabelGenerator(argLabelGenerator, 'argument-mapping');
		mapModel.setIdea(idea);


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
						mapModel.setIdea(content(JSON.parse(oFREvent.target.result)));
					};
					oFReader.readAsText(fileInfo, 'UTF-8');
				}
			}
		});
	};
document.addEventListener('DOMContentLoaded', init);
