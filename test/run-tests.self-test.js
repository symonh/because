'use strict';

const assert = require('node:assert');
const http = require('node:http');
const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const TEST_DIR = __dirname;
const RUNNER = path.join(TEST_DIR, 'run-tests.js');

function run(env, cwd = TEST_DIR) {
	return new Promise(resolve => {
		const child = spawn(process.execPath, [RUNNER], { cwd, env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
		let output = '';
		child.stdout.on('data', data => { output += data; });
		child.stderr.on('data', data => { output += data; });
		child.on('exit', (code, signal) => resolve({ code, signal, output }));
	});
}

function freePort() { return new Promise(resolve => { const server = http.createServer(); server.listen(0, '127.0.0.1', () => { const port = server.address().port; server.close(() => resolve(port)); }); }); }
function serverOn(port) { return new Promise(resolve => { const server = http.createServer(); server.listen(port, '127.0.0.1', () => resolve(server)); }); }
function probe(port) { return new Promise(resolve => { const request = http.get({ hostname: '127.0.0.1', port, path: '/app/index.html' }, response => { response.resume(); resolve(response.statusCode); }); request.on('error', () => resolve(0)); }); }

(async () => {
	let port = await freePort();
	const testSources = fs.readdirSync(TEST_DIR).filter(name => name.endsWith('.js') && name !== 'chrome-path.js' && name !== 'run-tests.self-test.js');
	for (const name of testSources) {
		const source = fs.readFileSync(path.join(TEST_DIR, name), 'utf8');
		assert.doesNotMatch(source, /networkidle0/, name + ' must not wait for network idle');
		assert.doesNotMatch(source, /\/Applications\/Google Chrome\.app/, name + ' must use chrome-path.js');
	}
	const appJsDir = path.join(TEST_DIR, '..', 'app', 'js');
	for (const name of fs.readdirSync(appJsDir).filter(name => name.endsWith('.js') && name !== 'safe-storage.js')) {
		const source = fs.readFileSync(path.join(appJsDir, name), 'utf8');
		assert.doesNotMatch(source, /\blocalStorage\b/,
			name + ' must access localStorage through safe-storage.js');
	}

	let result = await run({ BECAUSE_TEST_PORT: String(port), BECAUSE_TEST_SUITES: 'runner-fixture.js' });
	assert.equal(result.code, 0, result.output);
	assert.equal(await probe(port), 0, 'runner cleans up its server');

	port = await freePort();
	const holder = await serverOn(port);
	result = await run({ BECAUSE_TEST_PORT: String(port), BECAUSE_TEST_SUITES: 'runner-fixture.js' });
	assert.notEqual(result.code, 0); assert.match(result.output, /EADDRINUSE/);
	await new Promise(resolve => holder.close(resolve));

	port = await freePort();
	result = await run({ BECAUSE_TEST_PORT: String(port), BECAUSE_TEST_SMOKE_PATH: '/missing', BECAUSE_TEST_SUITES: 'runner-fixture.js' });
	assert.notEqual(result.code, 0); assert.match(result.output, /Smoke check/);

	port = await freePort();
	result = await run({ BECAUSE_TEST_PORT: String(port), BECAUSE_TEST_SUITES: 'runner-fixture.js', BECAUSE_RUNNER_FIXTURE: 'fail' }, path.join(TEST_DIR, '..'));
	assert.notEqual(result.code, 0); assert.match(result.output, /runner-fixture\.js failed/);

	port = await freePort();
	const child = spawn(process.execPath, [RUNNER], { cwd: TEST_DIR, env: { ...process.env, BECAUSE_TEST_PORT: String(port), BECAUSE_TEST_SUITES: 'runner-fixture.js', BECAUSE_RUNNER_FIXTURE: 'hang' }, stdio: ['ignore', 'pipe', 'pipe'] });
	let output = '';
	child.stdout.on('data', data => { output += data; }); child.stderr.on('data', data => { output += data; });
	await new Promise(resolve => setTimeout(resolve, 250)); child.kill('SIGTERM');
	result = await new Promise(resolve => child.on('exit', (code, signal) => resolve({ code, signal, output })));
	assert.match(result.output, /fixture received SIGTERM/); assert.equal(await probe(port), 0, 'signal path cleans up server');
	console.log('run-tests self-tests: PASS');
})().catch(error => { console.error(error.stack || error); process.exit(1); });
