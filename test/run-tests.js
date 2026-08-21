'use strict';

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { spawn } = require('node:child_process');

const TEST_DIR = __dirname;
const ROOT = path.resolve(TEST_DIR, '..');
const PORT = Number(process.env.BECAUSE_TEST_PORT || 8871);
const ALL_SUITES = ['reliability-e2e.js', 'app-e2e.js', 'click-select-e2e.js', 'drive-e2e.js', 'onedrive-e2e.js', 'features-e2e.js', 'webkit-e2e.js', 'a11y-e2e.js', 'site-e2e.js'];
const CHROME_SUITES = ['reliability-e2e.js', 'app-e2e.js', 'click-select-e2e.js', 'drive-e2e.js', 'onedrive-e2e.js', 'features-e2e.js', 'a11y-e2e.js', 'site-e2e.js'];
const WEBKIT_SUITES = ['webkit-e2e.js', 'a11y-e2e.js', 'site-e2e.js'];

function contentType(file) {
	return ({ '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.mup': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' })[path.extname(file)] || 'application/octet-stream';
}

function createServer(root = ROOT) {
	return http.createServer((req, res) => {
		const relative = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname).replace(/^\/+/, '');
		const file = path.resolve(root, relative || 'index.html');
		if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end('Forbidden'); return; }
		fs.stat(file, (err, stat) => {
			if (err || !stat.isFile()) { res.writeHead(404).end('Not found'); return; }
			res.writeHead(200, { 'content-type': contentType(file) });
			fs.createReadStream(file).pipe(res);
		});
	});
}

function listen(server, port = PORT) {
	return new Promise((resolve, reject) => {
		server.once('error', reject);
		server.listen(port, '127.0.0.1', () => { server.off('error', reject); resolve(); });
	});
}

function close(server) {
	return new Promise(resolve => server.close(() => resolve()));
}

function smoke(port = PORT, pathname = process.env.BECAUSE_TEST_SMOKE_PATH || '/app/index.html') {
	return new Promise((resolve, reject) => {
		const request = http.get({ hostname: '127.0.0.1', port, path: pathname }, response => {
			response.resume();
			response.statusCode === 200 ? resolve() : reject(new Error('Smoke check ' + pathname + ' returned HTTP ' + response.statusCode));
		});
		request.on('error', reject);
	});
}

function suitesFor(mode) {
	if (process.env.BECAUSE_TEST_SUITES) { return process.env.BECAUSE_TEST_SUITES.split(',').filter(Boolean); }
	if (mode === 'chrome') { return CHROME_SUITES; }
	if (mode === 'webkit') { return WEBKIT_SUITES; }
	return ALL_SUITES;
}

async function main() {
	const mode = process.argv[2] || 'all';
	if (!['all', 'chrome', 'webkit'].includes(mode)) { throw new Error('Usage: node run-tests.js [all|chrome|webkit]'); }
	const server = createServer();
	let child;
	let signal;
	const forward = received => { signal = signal || received; if (child && !child.killed) { child.kill(received); } };
	process.once('SIGINT', () => forward('SIGINT'));
	process.once('SIGTERM', () => forward('SIGTERM'));
	try {
		await listen(server);
		await smoke();
		for (const suite of suitesFor(mode)) {
			if (path.basename(suite) !== suite || !suite.endsWith('.js')) { throw new Error('Invalid test suite: ' + suite); }
			console.log('\n==> ' + suite);
			child = spawn(process.execPath, [suite], { cwd: TEST_DIR, stdio: 'inherit', env: { ...process.env, BECAUSE_E2E_BROWSER: mode, BASE: `http://127.0.0.1:${PORT}` } });
			const result = await new Promise(resolve => child.once('exit', (code, receivedSignal) => resolve({ code, receivedSignal })));
			child = undefined;
			if (signal) { process.exitCode = 128 + (signal === 'SIGINT' ? 2 : 15); break; }
			if (result.code !== 0) { throw new Error(suite + ' failed' + (result.receivedSignal ? ' (' + result.receivedSignal + ')' : '')); }
		}
	} finally {
		if (child && !child.killed) { child.kill(signal || 'SIGTERM'); }
		await close(server);
	}
}

if (require.main === module) { main().catch(error => { console.error(error.message); process.exitCode = 1; }); }

module.exports = { createServer, listen, close, smoke, suitesFor };
