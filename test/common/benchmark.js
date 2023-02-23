"use strict";

/*<replacement>*/
require('@babel/polyfill');
var util = require('util');
for (var i in util) exports[i] = util[i];
/*</replacement>*/ /* eslint-disable node-core/required-modules */

'use strict';

/*<replacement>*/
var objectKeys = objectKeys || function (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
};
/*</replacement>*/

const assert = require('assert');
const fork = require('child_process').fork;
const path = require('path');
const runjs = path.join(__dirname, '..', '..', 'benchmark', 'run.js');
function runBenchmark(name, args, env) {
  const argv = [];
  for (let i = 0; i < args.length; i++) {
    argv.push('--set');
    argv.push(args[i]);
  }
  argv.push(name);
  const mergedEnv = Object.assign({}, process.env, env);
  const child = fork(runjs, argv, {
    env: mergedEnv,
    stdio: ['inherit', 'pipe', 'inherit', 'ipc']
  });
  child.stdout.setEncoding('utf8');
  let stdout = '';
  child.stdout.on('data', line => {
    stdout += line;
  });
  child.on('exit', (code, signal) => {
    assert.strictEqual(code, 0);
    assert.strictEqual(signal, null);
    // This bit makes sure that each benchmark file is being sent settings such
    // that the benchmark file runs just one set of options. This helps keep the
    // benchmark tests from taking a long time to run. Therefore, each benchmark
    // file should result in three lines of output: a blank line, a line with
    // the name of the benchmark file, and a line with the only results that we
    // get from testing the benchmark file.
    assert.ok(/^(?:\n.+?\n.+?\n)+$/.test(stdout), `benchmark file not running exactly one configuration in test: ${stdout}`);
  });
}
module.exports = runBenchmark;
function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}