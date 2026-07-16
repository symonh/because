/*global require */
const jQuery = require('jquery'),
	richText = require('../core/content/rich-text');

require('./inner-text');
require('./place-caret-at-end');
require('./select-all');
require('./hammer-draggable');


jQuery.fn.editNode = function (shouldSelectAll) {
	'use strict';
	const node = this,
		textBox = this.find('[data-mapjs-role=title]'),
		unformattedText = this.data('title'),
		/* LOCAL PATCH (rich text): compare and restore against the plain
		   projection / rendered DOM, not the raw markup */
		plainUnformatted = richText.plainText(unformattedText),
		originalText = textBox.text(),
		originalHtml = textBox.html();

	if (plainUnformatted !== originalText) { /* links or some other potential formatting issues */
		textBox.css('word-break', 'break-all');
	}
	if (richText.isRich(unformattedText)) {
		richText.renderInto(textBox[0], unformattedText);
	} else {
		textBox.text(unformattedText);
	}
	textBox.attr('contenteditable', true).focus();
	if (shouldSelectAll) {
		textBox.selectAll();
	} else if (unformattedText) {
		textBox.placeCaretAtEnd();
	}
	node.shadowDraggable({disable: true});

	return new Promise((resolve, reject) => {
		const clear = function () {
				detachListeners(); //eslint-disable-line no-use-before-define
				textBox.css('word-break', '');
				textBox.removeAttr('contenteditable');
				node.shadowDraggable();
			},
			finishEditing = function () {
				/* LOCAL PATCH (rich text): serialize the edited DOM to the
				   canonical markup when formatting is present, otherwise keep
				   the historical plain-text extraction byte for byte */
				const runs = richText.trimRuns(richText.runsFromDom(textBox[0])),
					content = richText.hasFormatting(runs) ?
						richText.runsToTitle(runs) : textBox.innerText();
				if (content === unformattedText) {
					return cancelEditing(); //eslint-disable-line no-use-before-define
				}
				clear();
				resolve(content);
			},
			cancelEditing = function () {
				clear();
				textBox.html(originalHtml);
			},
			keyboardEvents = function (e) {
				const ENTER_KEY_CODE = 13,
					ESC_KEY_CODE = 27,
					TAB_KEY_CODE = 9,
					S_KEY_CODE = 83,
					Z_KEY_CODE = 90,
					/* LOCAL PATCH: deterministic inline formatting — Safari,
					   Chrome and Firefox differ in what they apply natively */
					FORMAT_COMMANDS = {66: 'bold', 73: 'italic', 85: 'underline'};
				if (e.which === ENTER_KEY_CODE && !e.shiftKey) { // allow shift+enter to break lines
					finishEditing();
					e.stopPropagation();
				} else if (e.which === ESC_KEY_CODE) {
					cancelEditing();
					e.preventDefault();
					e.stopPropagation();
				} else if (FORMAT_COMMANDS[e.which] && (e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey) {
					textBox[0].ownerDocument.execCommand(FORMAT_COMMANDS[e.which], false, null);
					e.preventDefault();
					e.stopPropagation();
				} else if (e.which === TAB_KEY_CODE || (e.which === S_KEY_CODE && (e.metaKey || e.ctrlKey) && !e.altKey)) {
					finishEditing();
					e.preventDefault(); /* stop focus on another object */
				} else if (!e.shiftKey && e.which === Z_KEY_CODE && (e.metaKey || e.ctrlKey) && !e.altKey) { /* undo node edit on ctrl+z if text was not changed */
					if (textBox.text() === plainUnformatted) {
						cancelEditing();
					}
					e.stopPropagation();
				}
				textBox.trigger('keydown-complete');
			},
			attachListeners = function () {
				textBox.on('blur', finishEditing).on('keydown', keyboardEvents);
			},
			detachListeners = function () {
				textBox.off('blur', finishEditing).off('keydown', keyboardEvents);
			};
		attachListeners();
	});
};
