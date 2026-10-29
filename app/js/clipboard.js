/*global window, document, DOMParser*/
/*
 * The system clipboard for claims. Copy puts the selected claim and
 * everything under it on the clipboard twice over: as an indented outline
 * (text/plain), which reads well pasted into a document or a chat, and as
 * the subtree itself inside an HTML fragment (text/html), which pastes back
 * exactly into any Because tab, on any origin, or into a SwayMaps map.
 *
 * Safari runs copy and paste only where something is selected or editable,
 * so both go through one hidden textarea: copying selects it and runs the
 * browser's copy command, whose copy event carries the data; pasting from
 * the keyboard moves focus to it just before the browser's own paste lands,
 * and reads that paste event. The Edit menu has no key press to ride, so its
 * Paste reads the clipboard through the asynchronous Clipboard API, from
 * inside the click, since Safari allows that read only during the gesture
 * (and shows its own Paste button for the reader to confirm).
 */

const MARK = 'data-because-clipboard',
	// how long a key press's paste is awaited before the textarea is released
	PASTE_WINDOW_MS = 400;

let proxy = null;

const getProxy = function () {
		if (!proxy) {
			proxy = document.createElement('textarea');
			proxy.setAttribute('aria-hidden', 'true');
			proxy.tabIndex = -1;
			proxy.style.cssText = 'position:fixed;left:-10000px;top:0;width:1px;height:1px;opacity:0';
			document.body.appendChild(proxy);
		}
		return proxy;
	},
	plain = title => String(title || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim(),
	kids = idea => (idea.ideas ? Object.keys(idea.ideas).sort((a, b) => parseFloat(a) - parseFloat(b)).map(k => idea.ideas[k]) : []),
	styleNames = idea => (idea.attr && Array.isArray(idea.attr.styleNames) ? idea.attr.styleNames : []),
	KEYWORD = { supporting: 'reason', opposing: 'objection', neutral: 'neutral' },
	escapeAttr = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'),
	escapeText = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

/**
 * The subtree as an indented outline: claims as lines, brackets as
 * "reason:", "objection:" or "neutral:", unstated claims marked [implicit].
 */
export function outlineText(idea) {
	const lines = [],
		visit = function (node, depth) {
			const pad = '  '.repeat(depth);
			if (node.attr && KEYWORD[node.attr.group]) {
				lines.push(pad + KEYWORD[node.attr.group] + ':');
			} else if (styleNames(node).indexOf('sticky_note') >= 0) {
				lines.push(pad + 'note: ' + plain(node.title));
				return;
			} else {
				lines.push(pad + (styleNames(node).indexOf('attr_implicit_claim') >= 0 ? '[implicit] ' : '') + plain(node.title));
			}
			kids(node).forEach(k => visit(k, depth + 1));
		};
	visit(idea, 0);
	return lines.join('\n');
}

/**
 * Puts a subtree (an idea from content.clone) on the system clipboard.
 * Must run inside a user gesture. Returns whether the browser copied.
 */
export function copyIdea(idea) {
	const box = getProxy(),
		previous = document.activeElement,
		text = outlineText(idea),
		html = '<pre ' + MARK + '="' + escapeAttr(JSON.stringify(idea)) + '">' + escapeText(text) + '</pre>',
		onCopy = function (e) {
			e.preventDefault();
			e.clipboardData.setData('text/plain', text);
			e.clipboardData.setData('text/html', html);
		};
	box.value = text;
	box.addEventListener('copy', onCopy);
	box.focus();
	box.select();
	let copied = false;
	try { copied = document.execCommand('copy'); } catch (e) { copied = false; }
	box.removeEventListener('copy', onCopy);
	box.value = '';
	if (previous && previous.focus) { previous.focus(); }
	return copied;
}

/** An idea from what the clipboard held, or null if it held no claims. */
export function ideaFromClipboard(html, text) {
	if (html) {
		const marked = new DOMParser().parseFromString(html, 'text/html').querySelector('[' + MARK + ']');
		if (marked) {
			try { return validIdea(JSON.parse(marked.getAttribute(MARK))); } catch (e) { /* not ours after all */ }
		}
	}
	const trimmed = String(text || '').trim();
	if (trimmed.charAt(0) === '{') {
		// a .mup, or a subtree, copied as text from a file
		try {
			const json = JSON.parse(trimmed);
			if (json && json.ideas && json.formatVersion) { return validIdea(kids(json)[0]); }
			return validIdea(json);
		} catch (e) { /* plain text */ }
	}
	return null;
}

function validIdea(idea) {
	return idea && typeof idea === 'object' && typeof idea.title === 'string' ? idea : null;
}

/** The clipboard through the Clipboard API; must start inside a user gesture. */
async function readClipboard() {
	const clip = window.navigator.clipboard;
	try {
		if (clip && clip.read) {
			let html = '', text = '';
			for (const item of await clip.read()) {
				if (item.types.indexOf('text/html') >= 0) { html = await (await item.getType('text/html')).text(); }
				if (item.types.indexOf('text/plain') >= 0) { text = await (await item.getType('text/plain')).text(); }
			}
			return ideaFromClipboard(html, text);
		}
		return clip && clip.readText ? ideaFromClipboard('', await clip.readText()) : null;
	} catch (e) {
		return null; // the reader declined, or the browser cannot read
	}
}

/**
 * Pastes from the clipboard. From a key press (fromKey), the browser's own
 * paste follows straight after and lands in the hidden textarea; otherwise
 * the clipboard is read at once through the Clipboard API. Calls
 * receive(idea) once, with null if the clipboard held no claims.
 * @param {(idea: object|null) => void} receive
 * @param {{ fromKey?: boolean }} [options]
 */
export function pasteIdea(receive, options) {
	if (!(options && options.fromKey)) {
		readClipboard().then(receive);
		return;
	}
	const box = getProxy(),
		previous = document.activeElement;
	let done = false;
	const finish = function (idea) {
			if (done) { return; }
			done = true;
			box.removeEventListener('paste', onPaste);
			window.clearTimeout(release);
			if (previous && previous.focus && document.activeElement === box) { previous.focus(); }
			receive(idea);
		},
		onPaste = function (e) {
			e.preventDefault();
			finish(ideaFromClipboard(e.clipboardData.getData('text/html'), e.clipboardData.getData('text/plain')));
		},
		release = window.setTimeout(() => finish(null), PASTE_WINDOW_MS);
	box.value = '';
	box.addEventListener('paste', onPaste);
	box.focus();
}
