/*global document*/
/*
 * Full-window "Opening map…" overlay shown while a large map lays out.
 * The layout pass is one long synchronous block, so the spinner animates
 * via a compositor-driven CSS transform and the overlay is painted (two
 * animation frames, see engine.loadMap) before the block starts.
 */

export function makeLoading() {
	let overlay = null;
	return {
		show(message) {
			if (!overlay) {
				overlay = document.createElement('div');
				overlay.className = 'loading-overlay';
				overlay.setAttribute('role', 'status');
				overlay.innerHTML =
					'<div class="loading-card"><div class="loading-spinner"></div><span class="loading-text"></span></div>';
				document.body.appendChild(overlay);
			}
			overlay.querySelector('.loading-text').textContent = message || 'Opening map…';
		},
		hide() {
			if (overlay) {
				overlay.remove();
				overlay = null;
			}
		}
	};
}
