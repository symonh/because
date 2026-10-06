/*global window, document*/
/*
 * Dark mode and high-contrast map colours are view preferences, not map
 * data: the chrome flips via body classes and the map re-renders through a
 * theme filter, while the .mup on disk (including any embedded theme) stays
 * byte-identical. Both start off; the user's choices persist after that.
 * Printing is always light, and keeps high contrast if it is on.
 */
import { darkenThemeJson, darkenUserColor, highContrastThemeJson, highContrastUserColor } from './themes.js';
import { storage } from './storage.js';

const KEY = 'because.darkmode',
	LEGACY_KEY = 'argumentbase.darkmode',
	CONTRAST_KEY = 'because.highcontrast';

export function makeDarkMode(engine) {
	let dark = false,
		contrast = storage.read(CONTRAST_KEY) === '1';
	const listeners = [],
		contrastListeners = [];

	const applyView = function (asDark) {
			document.body.classList.toggle('dark', asDark);
			document.body.classList.toggle('high-contrast', contrast);
			// the dark palette already clears the contrast thresholds, so
			// high contrast changes only light theme colours (plus the CSS
			// badge, which the body class covers in both modes).
			// darkenUserColor covers per-node author colours (attr.style.*),
			// which live outside the theme JSON the main filter transforms
			engine.setThemeFilter(asDark ? darkenThemeJson : (contrast ? highContrastThemeJson : null),
				asDark ? darkenUserColor : (contrast ? highContrastUserColor : null));
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
		},
		isHighContrast: () => contrast,
		onHighContrastChange(fn) { contrastListeners.push(fn); },
		toggleHighContrast() {
			contrast = !contrast;
			storage.write(CONTRAST_KEY, contrast ? '1' : '0');
			applyView(dark);
			contrastListeners.forEach(fn => fn(contrast));
		}
	};
}
