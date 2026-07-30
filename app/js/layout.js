/*global window, document, localStorage*/
/*
 * Chrome layout: a slim top bar plus a left icon rail ('left', the
 * default), cards floating over an edge-to-edge canvas ('floating'), or the
 * old top bar and horizontal toolbar ('classic'). Chosen from the View
 * menu. Like dark mode this is a view preference and nothing else: it lives
 * in localStorage under because.layout and never touches map data, so a
 * .mup serializes byte-identical in any of the three.
 *
 * Below 720px a mobile arrangement (top bar + bottom command bar)
 * overrides whichever desktop mode is stored; the stored choice is left
 * alone and takes effect again when the viewport widens.
 *
 * The pieces that appear in more than one mode — #map-title, #save-status
 * (a live region), #theme-toggle (carries listeners), #menubar — are single
 * elements moved between containers, never rebuilt, so their identity
 * survives a mode change. Only the button strips are rebuilt.
 */

import { buildToolbar, buildMobileBar, applyToolbarRoving } from './toolbar.js';
import { iconSVG } from './icons.js';

const KEY = 'because.layout',
	MODES = ['left', 'floating', 'classic'],
	MOBILE_QUERY = '(max-width: 719px)';

export function initLayout(commands, io, menus, neutralPref) {
	const topbar = document.getElementById('topbar'),
		toolbar = document.getElementById('toolbar'),
		menubar = document.getElementById('menubar'),
		mapTitle = document.getElementById('map-title'),
		saveStatus = document.getElementById('save-status'),
		themeToggle = document.getElementById('theme-toggle'),
		brand = topbar.querySelector('.brand'),
		floatChrome = document.getElementById('float-chrome'),
		floatPill = document.getElementById('float-pill'),
		floatTools = document.getElementById('float-tools'),
		floatZoom = document.getElementById('float-zoom'),
		floatStatus = document.getElementById('float-status'),
		floatMenu = document.getElementById('float-menu'),
		mobilebar = document.getElementById('mobilebar'),
		mobileQuery = window.matchMedia(MOBILE_QUERY);

	let mode = 'left',
		stored = null;
	try { stored = localStorage.getItem(KEY); } catch (e) { /* private mode */ }
	if (MODES.indexOf(stored) >= 0) { mode = stored; }

	// the pill carries the same brand mark as the top bar; cloning beats a
	// second copy of the markup in index.html, which would drift
	floatPill.insertBefore(brand.cloneNode(true), floatPill.firstChild);
	floatMenu.innerHTML = iconSVG('dots');
	floatMenu.title = 'Menu';
	menus.bindFlyoutTrigger(floatMenu, 'right');

	// what is actually on screen: the stored mode, or mobile below 720px
	const effective = () => (mobileQuery.matches ? 'mobile' : mode),
		allowNeutral = () => !!(neutralPref && neutralPref.isOn()),
		apply = function () {
			const eff = effective();
			menus.closeAll();
			// park every movable element back in the top bar before emptying
			// the containers that might be holding it
			topbar.insertBefore(mapTitle, menubar);
			topbar.appendChild(saveStatus);
			topbar.appendChild(themeToggle);
			toolbar.textContent = '';
			floatTools.textContent = '';
			floatZoom.textContent = '';
			mobilebar.textContent = '';

			MODES.forEach(m => document.body.classList.toggle('layout-' + m, m === mode));
			topbar.hidden = eff === 'floating';
			toolbar.hidden = eff === 'floating' || eff === 'mobile';
			menubar.hidden = eff === 'floating' || eff === 'mobile';
			themeToggle.hidden = eff === 'floating' || eff === 'mobile';
			floatChrome.hidden = eff !== 'floating';
			mobilebar.hidden = eff !== 'mobile';
			toolbar.setAttribute('aria-orientation', eff === 'left' ? 'vertical' : 'horizontal');

			if (eff === 'left') {
				buildToolbar(toolbar, commands, io, 'left', allowNeutral());
				toolbar.appendChild(themeToggle); // the rail foot
				applyToolbarRoving(toolbar); // after the toggle: it is in the set
			} else if (eff === 'classic') {
				buildToolbar(toolbar, commands, io, 'classic', allowNeutral());
				applyToolbarRoving(toolbar);
			} else if (eff === 'floating') {
				buildToolbar(floatTools, commands, io, 'floating', allowNeutral());
				buildToolbar(floatZoom, commands, io, 'floatingZoom', allowNeutral());
				applyToolbarRoving(floatTools);
				applyToolbarRoving(floatZoom);
				floatPill.insertBefore(mapTitle, floatMenu);
				floatStatus.appendChild(saveStatus);
			} else {
				// mobile: the theme toggle and the menubar live in the flyout's
				// View menu, which Shift+T also reaches
				menus.bindFlyoutTrigger(buildMobileBar(mobilebar, commands, io), 'up');
				applyToolbarRoving(mobilebar);
			}
			// The two chrome buttons that stand outside a role=toolbar strip
			// need the tabindex themselves, for the same WebKit reason (see
			// applyToolbarRoving): the theme toggle while it sits in the top
			// bar, and the floating layout's menu button. In the left rail the
			// toggle is inside the strip and the roving pattern has just set
			// its tabindex, so leave that one alone.
			if (eff !== 'left') { themeToggle.setAttribute('tabindex', '0'); }
			floatMenu.setAttribute('tabindex', '0');
		},
		setLayout = function (next) {
			if (MODES.indexOf(next) < 0 || next === mode) { return; }
			mode = next;
			try { localStorage.setItem(KEY, mode); } catch (e) { /* private mode */ }
			apply();
		};

	if (mobileQuery.addEventListener) {
		mobileQuery.addEventListener('change', apply);
	} else {
		mobileQuery.addListener(apply); // Safari before 14
	}
	// the neutral-connector tool appears in three of the four button strips, so
	// switching the preference rebuilds them the same way a mode change does
	if (neutralPref) { neutralPref.onChange(apply); }
	apply();

	return {
		getLayout: () => mode,
		setLayout: setLayout,
		isMobile: () => mobileQuery.matches
	};
}
