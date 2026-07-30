/*
 * smartquotes.js — typographic quotes for display text. Straight quotes
 * become curly: apostrophes and closing singles ’, opening singles ‘,
 * doubles “ ”. Idempotent (curly input passes through untouched). Data
 * (.mup exports, map JSON) keeps its raw text; this is display-only.
 */
export function smartquotes(s) {
	if (s == null) { return s; }
	return String(s)
		// apostrophes inside words (don't, it's, Simon's)
		.replace(/(\w)'(\w)/g, '$1’$2')
		// decade/elision apostrophes ('90s, 'tis) after whitespace or start
		.replace(/(^|[\s([{<])'(\d|tis\b|twas\b)/g, '$1’$2')
		// opening singles
		.replace(/(^|[\s([{<“])'/g, '$1‘')
		// remaining singles close
		.replace(/'/g, '’')
		// opening doubles
		.replace(/(^|[\s([{<‘])"/g, '$1“')
		// remaining doubles close
		.replace(/"/g, '”');
}

export default smartquotes;
