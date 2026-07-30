/*global localStorage*/
/*
 * "Allow neutral connectors" (View menu) — an AUTHORING preference, off by
 * default. With it off the app is the app it was before the neutral connector
 * existed: no icon in any of the four toolbars, Alt+Q is not intercepted at
 * all (so it still reaches the browser), no Insert item, no row in the
 * keyboard reference, and commands.addNeutral does nothing if something calls
 * it anyway. Turning it on lights all of that up. Like dark mode and the
 * layout choice this lives in localStorage and never touches map data.
 *
 * What it deliberately does NOT gate is RENDERING. The theme keeps its
 * neutral-group styles whatever this is set to, so a .mup that already uses
 * neutral connectors — one shared by a colleague, say — opens drawn correctly
 * for everyone. Gating the theme too would silently repaint those brackets
 * green (an unknown attr.group falls back to the plain `attr_group` style,
 * whose connector is supporting-group), which is a good deal worse than
 * showing one icon somebody did not ask for. Reading a map is never the thing
 * this preference is about; writing one is.
 */

const KEY = 'because.neutral';

export function makeNeutralPref() {
	const listeners = [];
	let on = false,
		stored = null;
	try { stored = localStorage.getItem(KEY); } catch (e) { /* private mode */ }
	on = stored === '1'; // first visit, and any unset value, is off

	return {
		isOn: () => on,
		onChange(fn) { listeners.push(fn); },
		set(next) {
			const value = !!next;
			if (value === on) { return; }
			on = value;
			try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) { /* private mode */ }
			listeners.forEach(fn => fn(on));
		},
		toggle() { this.set(!on); }
	};
}
