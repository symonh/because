'use strict';

// Keep browser discovery in one place so contributors can use a nonstandard
// install without editing every browser suite.
const fs = require('node:fs');

const DEFAULTS = process.platform === 'darwin'
	? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
		'/Applications/Chromium.app/Contents/MacOS/Chromium']
	: process.platform === 'win32'
		? [
			'\x43:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
			'\x43:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
		]
		: ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'];

function resolveChrome() {
	const candidates = process.env.CHROME_PATH ? [process.env.CHROME_PATH, ...DEFAULTS] : DEFAULTS;
	const found = candidates.find(candidate => fs.existsSync(candidate));
	if (found) { return found; }
	throw new Error(
		'Chrome prerequisite missing. Install system Google Chrome (or Chromium), or set CHROME_PATH to its executable. ' +
		'Checked: ' + candidates.join(', ')
	);
}

module.exports = { resolveChrome };
