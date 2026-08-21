/*global window, document, navigator*/
/*
 * Google Analytics (GA4) integration. This module owns every gtag touch:
 * config.js holds the measurement id, this file the sending machinery,
 * and docs/analytics.md documents the event vocabulary — keep them in
 * sync when adding events.
 *
 * Privacy contract (stated in the privacy policy and the welcome modal,
 * which must both stay true): events carry feature names, fixed enum
 * values and counts ONLY. Map content, claim titles, file names, Drive
 * ids and anything else the user typed never leave the browser. track()
 * truncates strings defensively, but the real rule lives at the call
 * sites: never pass user text.
 *
 * Fails safe in every direction: an empty measurement id, localhost
 * (unless the debug flag is set), Global Privacy Control, or a blocked
 * googletagmanager.com all leave the app fully working. Events still
 * land in the local ring buffer — inspect them in the console via
 * window.__because.analytics.events() — they just are not sent.
 */
import { gaConfig } from './config.js';
import { get as storageGet } from './safe-storage.js';

const APP_VERSION = 'dev', // deploy.sh stamps the git commit into the deployed copy
	DEBUG_KEY = 'because.ga.debug', // stored '1': send from localhost + GA DebugView
	BUFFER_MAX = 300,
	MAX_ERRORS = 10, // per session; a render loop must not flood the property
	buffer = [];

let enabled = false,
	gtagFn = null,
	pendingMapSource = null,
	editCount = 0;

const debugOn = function () {
		return storageGet(DEBUG_KEY) === '1';
	},
	// dev servers and the e2e suites run on loopback; keep their traffic
	// out of the production property unless explicitly forced
	isLocal = () => /^(localhost$|127\.|0\.0\.0\.0$|\[::1\]$)/.test(window.location.hostname),
	clean = function (params) {
		const out = {};
		Object.keys(params || {}).forEach(function (k) {
			const v = params[k];
			// unbroken 25+ char tokens are ids (Drive file ids run 25–44
			// chars; the longest legit enum value is 21) — mask them so a
			// stray error message can never leak one into an event
			out[k] = typeof v === 'string' ?
				v.replace(/[\w-]{25,}/g, '…').slice(0, 100) : v;
		});
		return out;
	};

export function track(name, params) {
	const entry = { name: name, params: clean(params) };
	buffer.push(entry);
	if (buffer.length > BUFFER_MAX) { buffer.shift(); }
	if (enabled && gtagFn) { gtagFn('event', name, entry.params); }
}

// user-scoped state (dark mode, current theme…) — segments every report
// rather than showing up as its own event
export function setUserProperty(name, value) {
	const props = {};
	props[name] = value;
	buffer.push({ name: '__user_property', params: props });
	if (buffer.length > BUFFER_MAX) { buffer.shift(); }
	if (enabled && gtagFn) { gtagFn('set', 'user_properties', props); }
}

// Load paths (picker, drag-drop, Drive, ?src=, autosave, New) note how the
// incoming map arrived; the single map_open event fired on mapLoaded picks
// the note up, so every path shares one taxonomy.
export function noteMapSource(source) { pendingMapSource = source; }
export function takeMapSource() {
	const s = pendingMapSource;
	pendingMapSource = null;
	return s;
}

// Editing intensity: every model change counts here and is flushed as one
// edit_batch event when the tab hides (and on a slow timer for long
// sessions), so typing never sprays per-keystroke events.
export function countEdit() { editCount += 1; }
const flushEdits = function () {
	if (editCount > 0) {
		track('edit_batch', { changes: editCount });
		editCount = 0;
	}
};

// map size as a low-cardinality dimension GA reports can group by
// (node_count rides along as the exact number)
export function nodeBucket(count) {
	if (count <= 10) { return '1-10'; }
	if (count <= 25) { return '11-25'; }
	if (count <= 50) { return '26-50'; }
	if (count <= 100) { return '51-100'; }
	if (count <= 250) { return '101-250'; }
	return '250+';
}

export const analyticsApi = {
	track: track,
	isEnabled: () => enabled,
	events: () => buffer.slice(),
	pendingEdits: () => editCount
};

export function initAnalytics(options) {
	const opts = options || {},
		id = gaConfig.measurementId,
		// the browser-level opt-out signal with legal weight (CCPA/CPRA);
		// honouring it means analytics stays off entirely for that user
		gpc = navigator.globalPrivacyControl === true,
		debug = debugOn();
	enabled = !!id && !gpc && (!isLocal() || debug);
	if (enabled) {
		window.dataLayer = window.dataLayer || [];
		gtagFn = function () { window.dataLayer.push(arguments); };
		window.gtag = gtagFn; // the conventional global, handy in the console
		gtagFn('js', new Date());
		const cfg = {
			app_version: APP_VERSION,
			// measurement only: no ads features, no cross-site signals
			allow_google_signals: false,
			allow_ad_personalization_signals: false
		};
		if (debug) { cfg.debug_mode = true; }
		gtagFn('config', id, cfg);
		const s = document.createElement('script');
		s.async = true;
		s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
		document.head.appendChild(s);
	}
	if (opts.page === 'app') {
		document.addEventListener('visibilitychange', function () {
			// gtag falls back to sendBeacon once the page is hiding, so the
			// batch survives a tab close
			if (document.visibilityState === 'hidden') { flushEdits(); }
		});
		window.addEventListener('pagehide', flushEdits);
		window.setInterval(flushEdits, 120000);

		// GA4's conventional exception event, deduplicated and capped
		const seen = {};
		let errorsSent = 0;
		const reportError = function (message) {
			const key = String(message || 'unknown').slice(0, 150);
			if (errorsSent >= MAX_ERRORS || seen[key]) { return; }
			seen[key] = true;
			errorsSent += 1;
			track('exception', { description: key, fatal: false });
		};
		window.addEventListener('error', e => reportError(e.message));
		window.addEventListener('unhandledrejection',
			e => reportError((e.reason && e.reason.message) || e.reason));

		track('app_open', {});
	}
	return analyticsApi;
}
