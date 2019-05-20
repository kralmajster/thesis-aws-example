const { exec: promisifiedExec } = require('promisify-child-process');
const { info, warn } = require('signale');
const commandLineArgs = require('command-line-args');

function exec(cmd, env = {}) {
  const stream = promisifiedExec(cmd, { env: { ...process.env, ...env } });
  stream.stdout.pipe(process.stdout);
  stream.stderr.pipe(process.stderr);
  return stream;
}
const { stage, script } = commandLineArgs([{ name: 'stage', type: String }, { name: 'script', type: String }]);

if (!stage) warn('No stage specified!')
info(`Executing script _/scripts/${script}.ts${stage ? `, stage: ${stage}` : ''}...`);
exec(`npx webpack --config script.webpack.config.js --mode production`, { SCRIPT: script, STAGE: stage }).then(() => {
  exec(`node --max-old-space-size=4096 __generated/build/_scripts/script-output.js`, { STAGE: stage });
});
