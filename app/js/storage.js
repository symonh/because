/*global window*/
/*
 * Every browser-storage read and write in the app goes through here.
 *
 * Reaching window.localStorage AT ALL throws when a browser is set to block
 * site data (Safari's "Block all cookies"), not just the getItem call, so an
 * unguarded read while a module is being constructed stops the whole editor
 * booting. Writes throw separately once the quota is full. Both degrade here
 * to "nothing stored", which every caller already handles as a first visit.
 */

const backend = function () {
	try {
		return window.localStorage;
	} catch (e) {
		return null;
	}
};

export const storage = {
	// null means the key is unset OR storage is unavailable; callers must
	// treat the two the same
	read(key) {
		try {
			const store = backend();
			return store ? store.getItem(key) : null;
		} catch (e) {
			return null;
		}
	},
	write(key, value) {
		try {
			const store = backend();
			if (store) { store.setItem(key, value); }
		} catch (e) { /* quota, or blocked mid-session */ }
	},
	remove(key) {
		try {
			const store = backend();
			if (store) { store.removeItem(key); }
		} catch (e) { /* blocked mid-session */ }
	}
};
