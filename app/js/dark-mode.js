/*global window, document*/
/*
 * Dark mode is a view preference, not map data: the chrome flips via a
 * body class and the map re-renders through a theme filter, while the
 * .mup on disk (including any embedded theme) stays byte-identical.
 * First visit is always light; the user's choice persists after that,
 * and printing is always light.
 */
import { darkenThemeJson, darkenUserColor } from './themes.js';
import { storage } from './storage.js';

const KEY = 'because.darkmode',
	LEGACY_KEY = 'argumentbase.darkmode';

export function makeDarkMode(engine) {
	let dark = false;
	const listeners = [];

	const applyView = function (asDark) {
			document.body.classList.toggle('dark', asDark);
			// darkenUserColor covers per-node author colours (attr.style.*),
			// which live outside the theme JSON the main filter transforms
			engine.setThemeFilter(asDark ? darkenThemeJson : null,
				asDark ? darkenUserColor : null);
		},
		apply = function () {
			applyView(dark);
			storage.write(KEY, dark ? '1' : '0');
			listeners.forEach(fn => fn(dark));
		};

	let stored = storage.read(KEY);
	if (stored === null) { stored = storage.read(LEGACY_KEY); }
	dark = stored === '1'; // first visit (stored null) opens light
	apply();

	window.addEventListener('beforeprint', () => { if (dark) { applyView(false); } });
	window.addEventListener('afterprint', () => { if (dark) { applyView(true); } });

	return {
		isDark: () => dark,
		onChange(fn) { listeners.push(fn); },
		toggle() {
			dark = !dark;
			apply();
		}
	};
}
