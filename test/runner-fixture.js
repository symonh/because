'use strict';

if (process.env.BECAUSE_RUNNER_FIXTURE === 'fail') { process.exit(7); }
if (process.env.BECAUSE_RUNNER_FIXTURE === 'hang') {
	process.on('SIGTERM', () => { console.log('fixture received SIGTERM'); process.exit(0); });
	process.on('SIGINT', () => { console.log('fixture received SIGINT'); process.exit(0); });
	setInterval(() => {}, 1000);
}
