'use strict';
/*
 * Where the browser suites find Chrome, in one place: a nonstandard install
 * needs CHROME_PATH set once rather than an edit in every suite. Setting
 * CHROME_PATH suppresses the defaults entirely, so a typo in it fails loudly
 * instead of quietly running some other browser.
 */
const fs = require('node:fs');

const DEFAULTS = {
	darwin: [
		'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
		'/Applications/Chromium.app/Contents/MacOS/Chromium'
	],
	linux: [
		'/usr/bin/google-chrome',
		'/usr/bin/google-chrome-stable',
		'/usr/bin/chromium',
		'/usr/bin/chromium-browser'
	],
	win32: [
		'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
		'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
	]
};

exports.chromePath = function () {
	const tried = process.env.CHROME_PATH ?
			[process.env.CHROME_PATH] :
			(DEFAULTS[process.platform] || []),
		found = tried.find(candidate => fs.existsSync(candidate));
	if (found) { return found; }
	throw new Error('Chrome not found. Install Google Chrome, or point CHROME_PATH at it. ' +
		'Tried: ' + (tried.join(', ') || '(no default for ' + process.platform + ')'));
};
