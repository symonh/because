/*global window, document, localStorage*/
/*
 * Dark mode is a view preference, not map data: the chrome flips via a
 * body class and the map re-renders through a theme filter, while the
 * .mup on disk (including any embedded theme) stays byte-identical.
 * First visit is always light; the user's choice persists after that,
 * and printing is always light.
 */
import { darkenThemeJson } from './themes.js';

const KEY = 'because.darkmode',
	LEGACY_KEY = 'argumentbase.darkmode';

export function makeDarkMode(engine) {
	let dark = false;

	const applyView = function (asDark) {
			document.body.classList.toggle('dark', asDark);
			engine.setThemeFilter(asDark ? darkenThemeJson : null);
		},
		apply = function () {
			applyView(dark);
			try { localStorage.setItem(KEY, dark ? '1' : '0'); } catch (e) { /* private mode */ }
		};

	let stored = null;
	try {
		stored = localStorage.getItem(KEY);
		if (stored === null) { stored = localStorage.getItem(LEGACY_KEY); }
	} catch (e) { /* private mode */ }
	dark = stored === '1'; // first visit (stored null) opens light
	apply();

	window.addEventListener('beforeprint', () => { if (dark) { applyView(false); } });
	window.addEventListener('afterprint', () => { if (dark) { applyView(true); } });

	return {
		isDark: () => dark,
		toggle() {
			dark = !dark;
			apply();
		}
	};
}
