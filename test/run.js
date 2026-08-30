'use strict';
/*
 * One command for the whole browser gate. Serves the repository root on the
 * port the suites default to, then runs each suite in its own process and
 * stops at the first failure.
 *
 *   node run.js                  every suite, in the order below
 *   node run.js app-e2e.js …     only the suites named
 *
 * PORT overrides 8871; the port reaches the suites as BASE.
 */
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { spawn } = require('node:child_process');

const TEST_DIR = __dirname,
	ROOT = path.resolve(TEST_DIR, '..'),
	PORT = Number(process.env.PORT) || 8871,
	SUITES = [
		'app-e2e.js',
		'click-select-e2e.js',
		'drive-e2e.js',
		'onedrive-e2e.js',
		'features-e2e.js',
		'webkit-e2e.js', // Playwright WebKit — the Safari rule
		'a11y-e2e.js', // WCAG 2.2 AA gate, both engines (docs/accessibility.md)
		'site-e2e.js' // the landing page's pre-rendered figures, both engines
	],
	CONTENT_TYPES = {
		'.css': 'text/css',
		'.html': 'text/html',
		'.ico': 'image/x-icon',
		'.js': 'text/javascript',
		'.json': 'application/json',
		'.mup': 'application/json',
		'.png': 'image/png',
		'.svg': 'image/svg+xml',
		'.webp': 'image/webp',
		'.woff2': 'font/woff2'
	};

// the suite in flight, so one handler covers Ctrl-C for the whole run
let running = null;
process.on('SIGINT', function () {
	if (running) { running.kill('SIGINT'); }
});

const createServer = function () {
		return http.createServer(function (req, res) {
			const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname),
				file = path.join(ROOT, pathname.endsWith('/') ? pathname + 'index.html' : pathname);
			// path.join normalizes away ../, so this is the whole traversal guard
			if (file !== ROOT && !file.startsWith(ROOT + path.sep)) {
				res.writeHead(403).end('Forbidden');
				return;
			}
			fs.readFile(file, function (err, body) {
				if (err) { res.writeHead(404).end('Not found'); return; }
				res.writeHead(200, { 'content-type': CONTENT_TYPES[path.extname(file)] || 'application/octet-stream' });
				res.end(body);
			});
		});
	},
	listen = function (server) {
		return new Promise(function (resolve, reject) {
			server.once('error', reject);
			server.listen(PORT, '127.0.0.1', function () {
				server.off('error', reject);
				resolve();
			});
		});
	},
	// the suites report their own failures; a server that answers 404 for the
	// editor would instead make every one of them fail obscurely
	checkServing = function (pathname) {
		return new Promise(function (resolve, reject) {
			http.get({ hostname: '127.0.0.1', port: PORT, path: pathname }, function (res) {
				res.resume();
				if (res.statusCode === 200) { resolve(); }
				else { reject(new Error(pathname + ' served HTTP ' + res.statusCode)); }
			}).on('error', reject);
		});
	},
	runSuite = function (suite) {
		console.log('\n==> ' + suite);
		return new Promise(function (resolve) {
			running = spawn(process.execPath, [suite], {
				cwd: TEST_DIR,
				stdio: 'inherit',
				env: Object.assign({}, process.env, { BASE: 'http://127.0.0.1:' + PORT })
			});
			running.once('exit', function (code) {
				running = null;
				resolve(code === 0);
			});
		});
	};

(async function () {
	const named = process.argv.slice(2),
		suites = named.length ? named : SUITES,
		missing = suites.filter(suite => !fs.existsSync(path.join(TEST_DIR, suite)));
	if (missing.length) {
		console.error('No such suite: ' + missing.join(', '));
		process.exit(1);
	}
	const server = createServer();
	await listen(server);
	try {
		await checkServing('/app/index.html');
		await checkServing('/site/index.html');
		for (const suite of suites) {
			if (!await runSuite(suite)) {
				console.error('\n' + suite + ' failed.');
				process.exitCode = 1;
				return;
			}
		}
		console.log('\n' + suites.length + ' suite' + (suites.length === 1 ? '' : 's') + ' passed.');
	} finally {
		server.close();
	}
}()).catch(function (e) {
	console.error(e.message);
	process.exitCode = 1;
});
