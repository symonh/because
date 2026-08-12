/*global document*/
/*
 * Shared accessibility plumbing for modal overlays: dialog semantics,
 * a Tab trap, Escape handling, and focus restore. Every .panel-overlay
 * (menus' info panels, the intro, the unsaved-changes guard) goes
 * through initModal so keyboard and screen-reader behaviour is uniform.
 *
 * Contract: build the overlay DOM first, append it to the body, then
 * call initModal. Escape calls onRequestClose (the caller's own close
 * path, which must end in modal.close()); with no onRequestClose,
 * Escape closes directly. close() removes the overlay, releases the
 * trap, and returns focus to where it was — or the map container.
 */

let labelCounter = 0;

/*
 * The way out of the map canvas, for Escape (commands.leaveMap).
 *
 * Inside the map Tab is the co-premise key, so it cannot also be the key
 * that leaves — which left the browser's own F6 as the only exit, and F6
 * is not something a reader can be expected to guess (reported by an NVDA
 * user, 2026-08-03). WCAG 2.1.2 permits an exit that is not Tab as long as
 * the user is told what it is; Escape is that exit, and the keyboard
 * reference and the canvas's own description both name it.
 *
 * Focus lands on the app menu, which is where every command is reachable
 * from — whichever form the current layout gives it. The fallbacks below
 * are ordered so that a layout with no menubar (floating, mobile) still
 * hands focus to something in the chrome rather than dropping it on the
 * body, where nothing is announced and Tab starts over at the top.
 */
export function focusChrome() {
	const pick = function (selector) {
			const el = document.querySelector(selector);
			// a hidden layout keeps its DOM; only what is drawn can take focus
			return (el && el.getClientRects().length) ? el : null;
		},
		target = pick('#menubar [role=menuitem][tabindex="0"]') ||
			pick('#menubar [role=menuitem]') ||
			pick('#float-menu') ||
			pick('#mobilebar button[tabindex="0"]') ||
			pick('#mobilebar button') ||
			pick('#toolbar button[tabindex="0"]') ||
			pick('#skip-link');
	if (!target) { return false; }
	target.focus();
	return true;
}

export function initModal(overlay, { label, initialFocus, onRequestClose } = {}) {
	const panel = overlay.querySelector('.panel') || overlay,
		heading = panel.querySelector('h2'),
		previouslyFocused = document.activeElement,
		focusables = () => Array.from(panel.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		)).filter(el => el.getClientRects().length > 0),
		restoreFocus = function () {
			if (previouslyFocused && previouslyFocused.focus &&
					document.contains(previouslyFocused) && previouslyFocused !== document.body) {
				previouslyFocused.focus();
				return;
			}
			const container = document.getElementById('map-container');
			if (container) { container.focus(); }
		};

	panel.setAttribute('role', 'dialog');
	panel.setAttribute('aria-modal', 'true');
	panel.setAttribute('tabindex', '-1');
	if (label) {
		panel.setAttribute('aria-label', label);
	} else if (heading) {
		if (!heading.id) {
			labelCounter += 1;
			heading.id = 'a11y-dialog-title-' + labelCounter;
		}
		panel.setAttribute('aria-labelledby', heading.id);
	}

	const close = function () {
			document.removeEventListener('keydown', onKeydown, true);
			document.removeEventListener('focusin', onFocusIn, true);
			overlay.remove();
			restoreFocus();
		},
		// the engine steals focus while a map loads (setIdea selects the
		// root and focuses its node); a modal must hold on to it
		onFocusIn = function (e) {
			if (!overlay.contains(e.target)) {
				const items = focusables();
				(initialFocus || items[0] || panel).focus();
			}
		},
		onKeydown = function (e) {
			if (e.key === 'Escape') {
				e.preventDefault();
				e.stopPropagation();
				if (onRequestClose) { onRequestClose(); } else { close(); }
				return;
			}
			if (e.key !== 'Tab') { return; }
			const items = focusables();
			if (!items.length) { e.preventDefault(); panel.focus(); return; }
			e.preventDefault();
			const at = items.indexOf(document.activeElement),
				next = e.shiftKey ?
					(at <= 0 ? items.length - 1 : at - 1) :
					(at < 0 || at === items.length - 1 ? 0 : at + 1);
			items[next].focus();
		};

	// capture phase: wins over the popovers' document-level Escape
	// handlers, so Escape in a modal never also closes what is behind it
	document.addEventListener('keydown', onKeydown, true);
	document.addEventListener('focusin', onFocusIn, true);
	(initialFocus || focusables()[0] || panel).focus();

	return { close };
}
