/*global module*/
/*
 * LOCAL ADDITION (not upstream mapjs): minimal rich text for node titles.
 *
 * A title may carry a restricted inline-HTML subset — <b>, <i>, <u> —
 * with all other text entity-escaped (&lt; &gt; &amp; …). Only the
 * canonical serializer below produces that form, so rendering is a
 * whitelist parse: tokens that are not exactly an allowed tag are text.
 * Titles without any allowed tag token keep the historical plain-text
 * path everywhere, so existing files round-trip byte-identically.
 */
const TAG_TOKEN = /<\/?[biu]>/i,
	SPLIT_TOKEN = /(<\/?[biu]>)/gi,
	FLAGS = ['b', 'i', 'u'],

	isRich = function (title) {
		return typeof title === 'string' && TAG_TOKEN.test(title);
	},
	decodeEntities = function (text) {
		return text
			.replace(/&lt;/gi, '<')
			.replace(/&gt;/gi, '>')
			.replace(/&quot;/gi, '"')
			.replace(/&#39;/g, '\'')
			.replace(/&amp;/gi, '&');
	},
	escapeText = function (text) {
		return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	},
	// canonical title -> [{text, b, i, u}] runs; newlines stay inside text
	parseRuns = function (title) {
		const runs = [],
			state = {b: false, i: false, u: false},
			stack = [];
		String(title || '').split(SPLIT_TOKEN).forEach(function (token) {
			const m = /^<(\/?)([biu])>$/i.exec(token);
			if (m) {
				const tag = m[2].toLowerCase();
				if (!m[1]) {
					stack.push(tag);
					state[tag] = true;
				} else {
					const at = stack.lastIndexOf(tag);
					if (at >= 0) {
						stack.splice(at, 1);
					}
					state[tag] = stack.indexOf(tag) >= 0;
				}
			} else if (token) {
				runs.push({text: decodeEntities(token), b: state.b, i: state.i, u: state.u});
			}
		});
		return runs;
	},
	mergeRuns = function (runs) {
		const merged = [];
		runs.forEach(function (run) {
			const last = merged[merged.length - 1];
			if (last && FLAGS.every(f => last[f] === run[f])) {
				last.text += run.text;
			} else {
				merged.push({text: run.text, b: run.b, i: run.i, u: run.u});
			}
		});
		return merged.filter(run => run.text !== '');
	},
	trimRuns = function (runs) {
		const trimmed = runs.slice();
		if (trimmed.length) {
			trimmed[0] = Object.assign({}, trimmed[0], {text: trimmed[0].text.replace(/^\s+/, '')});
			const lastAt = trimmed.length - 1;
			trimmed[lastAt] = Object.assign({}, trimmed[lastAt], {text: trimmed[lastAt].text.replace(/\s+$/, '')});
		}
		return trimmed.filter(run => run.text !== '');
	},
	hasFormatting = function (runs) {
		return runs.some(run => (run.b || run.i || run.u) && run.text.trim() !== '');
	},
	// runs -> canonical title (fixed per-run b>i>u nesting, adjacent equal
	// runs merged, text escaped)
	runsToTitle = function (runs) {
		return mergeRuns(runs).map(function (run) {
			let out = escapeText(run.text);
			['u', 'i', 'b'].forEach(function (tag) {
				if (run[tag]) {
					out = '<' + tag + '>' + out + '</' + tag + '>';
				}
			});
			return out;
		}).join('');
	},
	plainText = function (title) {
		return isRich(title) ? parseRuns(title).map(run => run.text).join('') : String(title || '');
	},
	// render a title into a DOM element (replacing content); the only DOM
	// nodes ever created are b/i/u elements and text nodes, so arbitrary
	// markup in a hand-edited file cannot inject anything else
	renderInto = function (domElement, title) {
		const doc = domElement.ownerDocument;
		domElement.textContent = '';
		mergeRuns(parseRuns(title)).forEach(function (run) {
			let node = doc.createTextNode(run.text);
			FLAGS.forEach(function (tag) {
				if (run[tag]) {
					const el = doc.createElement(tag);
					el.appendChild(node);
					node = el;
				}
			});
			domElement.appendChild(node);
		});
	},
	boldish = function (style) {
		if (!style) {
			return false;
		}
		const weight = style.fontWeight || '';
		return (/^(bold|bolder)$/i).test(weight) || parseInt(weight, 10) >= 600;
	},
	// extract runs from an edited contenteditable DOM; recognises both the
	// b/i/u tags we render and the styled spans some browsers produce from
	// execCommand, and turns block boundaries and <br> into newlines
	runsFromDom = function (rootElement) {
		const runs = [],
			push = function (text, state) {
				runs.push({text: text, b: state.b, i: state.i, u: state.u});
			},
			lastChar = function () {
				return runs.length ? runs[runs.length - 1].text.slice(-1) : '\n';
			},
			walk = function (node, state) {
				if (node.nodeType === 3) {
					push(node.nodeValue, state);
					return;
				}
				if (node.nodeType !== 1) {
					return;
				}
				const tag = node.tagName;
				if (tag === 'BR') {
					push('\n', state);
					return;
				}
				if ((tag === 'DIV' || tag === 'P' || tag === 'LI') && lastChar() !== '\n') {
					push('\n', state);
				}
				const style = node.style,
					next = {
						b: state.b || tag === 'B' || tag === 'STRONG' || boldish(style),
						i: state.i || tag === 'I' || tag === 'EM' || (/italic|oblique/i).test((style && style.fontStyle) || ''),
						u: state.u || tag === 'U' || (/underline/i).test((style && (style.textDecorationLine || style.textDecoration)) || '')
					};
				Array.prototype.forEach.call(node.childNodes, child => walk(child, next));
			};
		Array.prototype.forEach.call(rootElement.childNodes,
			child => walk(child, {b: false, i: false, u: false}));
		return runs;
	},
	// toggle one format across a whole title: off if every visible run
	// already has it, otherwise on everywhere; returns a plain title when
	// no formatting remains
	toggleFormat = function (title, tag) {
		const runs = mergeRuns(parseRuns(title));
		if (!runs.length) {
			return title;
		}
		const allOn = runs.every(run => run[tag] || run.text.trim() === '');
		runs.forEach(function (run) {
			run[tag] = !allOn;
		});
		if (runs.some(run => run.b || run.i || run.u)) {
			return runsToTitle(runs);
		}
		return runs.map(run => run.text).join('');
	};

module.exports = {
	isRich: isRich,
	plainText: plainText,
	parseRuns: parseRuns,
	mergeRuns: mergeRuns,
	trimRuns: trimRuns,
	hasFormatting: hasFormatting,
	runsToTitle: runsToTitle,
	runsFromDom: runsFromDom,
	renderInto: renderInto,
	toggleFormat: toggleFormat
};
