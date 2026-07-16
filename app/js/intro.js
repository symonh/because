/*global document, localStorage*/
/*
 * First-visit welcome modal: says what Because is and what argument
 * visualization is for (language adapted from philmaps.com), with a
 * "Don't show this again" checkbox. Shown on every visit until the box
 * is checked; Help > Welcome to Because reopens it on demand. Also part
 * of the Google OAuth branding story: the app states its own name and
 * purpose to first-time users.
 */

const KEY = 'because.intro.dismissed';

export function makeIntro() {
	let overlay = null;

	const close = function (rememberChoice) {
			if (!overlay) { return; }
			if (rememberChoice) {
				const box = overlay.querySelector('#intro-dont-show');
				try {
					localStorage.setItem(KEY, box && box.checked ? '1' : '0');
				} catch (e) { /* private mode */ }
			}
			overlay.remove();
			overlay = null;
		},
		show = function () {
			if (overlay) { return; }
			overlay = document.createElement('div');
			overlay.className = 'panel-overlay';
			overlay.innerHTML =
				'<div class="panel intro-panel">' +
				'<h2>Welcome to Because</h2>' +
				'<p><b>Because</b> is a free, browser-based editor for ' +
				'<b>argument maps</b> — diagrams that display the logic of an ' +
				'argument so you can organize and navigate complex reasoning at ' +
				'a glance. Laying out a conclusion, the reasons for it, and the ' +
				'objections against it encourages clearly articulated reasoning ' +
				'and makes intricate arguments easier to discuss, evaluate, and ' +
				'teach.</p>' +
				'<p>Select the conclusion and press <kbd>Enter</kbd> to add a ' +
				'reason, <kbd>Tab</kbd> to add a co-premise, or <kbd>Alt+O</kbd> ' +
				'to raise an objection. The full list is under ' +
				'<b>Help&nbsp;&gt;&nbsp;Keyboard shortcuts</b>. Your maps stay on ' +
				'your device or in your own Google Drive — there are no accounts ' +
				'and no analytics. Learn more about argument visualization at ' +
				'<a href="https://philmaps.com" target="_blank" rel="noopener">philmaps.com</a>.</p>' +
				'<div class="intro-footer">' +
				'<label><input type="checkbox" id="intro-dont-show"> Don’t show this again</label>' +
				'<button type="button" class="intro-start">Get started</button>' +
				'</div>' +
				'</div>';
			overlay.querySelector('.intro-start').addEventListener('click', () => close(true));
			overlay.addEventListener('click', function (e) {
				if (e.target === overlay) { close(true); }
			});
			document.body.appendChild(overlay);
		};

	let dismissed = null;
	try { dismissed = localStorage.getItem(KEY); } catch (e) { /* private mode */ }
	if (dismissed !== '1') { show(); }

	return { show };
}
