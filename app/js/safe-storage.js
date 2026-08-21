/*global window*/

const storage = function () {
	try {
		return window.localStorage;
	} catch (e) {
		return null;
	}
};

export function get(key, fallback = null) {
	try {
		const target = storage();
		if (!target) { return fallback; }
		const value = target.getItem(key);
		return value === null ? fallback : value;
	} catch (e) {
		return fallback;
	}
}

export function set(key, value) {
	try {
		const target = storage();
		if (!target) { return false; }
		target.setItem(key, value);
		return true;
	} catch (e) {
		return false;
	}
}

export function remove(key) {
	try {
		const target = storage();
		if (!target) { return false; }
		target.removeItem(key);
		return true;
	} catch (e) {
		return false;
	}
}
