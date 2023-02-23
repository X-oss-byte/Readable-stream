"use strict";

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

/*<replacement>*/
const bufferShim = require('safe-buffer').Buffer;
/*</replacement>*/
require('../common');
const assert = require('assert/');

// This test verifies that stream.unshift(bufferShim.alloc(0)) or
// stream.unshift('') does not set state.reading=false.
const Readable = require('../../').Readable;
const r = new Readable();
let nChunks = 10;
const chunk = bufferShim.alloc(10, 'x');
r._read = function (n) {
  setImmediate(() => {
    r.push(--nChunks === 0 ? null : chunk);
  });
};
let readAll = false;
const seen = [];
r.on('readable', () => {
  let chunk;
  while (chunk = r.read()) {
    seen.push(chunk.toString());
    // simulate only reading a certain amount of the data,
    // and then putting the rest of the chunk back into the
    // stream, like a parser might do.  We just fill it with
    // 'y' so that it's easy to see which bits were touched,
    // and which were not.
    const putBack = bufferShim.alloc(readAll ? 0 : 5, 'y');
    readAll = !readAll;
    r.unshift(putBack);
  }
});
const expect = ['xxxxxxxxxx', 'yyyyy', 'xxxxxxxxxx', 'yyyyy', 'xxxxxxxxxx', 'yyyyy', 'xxxxxxxxxx', 'yyyyy', 'xxxxxxxxxx', 'yyyyy', 'xxxxxxxxxx', 'yyyyy', 'xxxxxxxxxx', 'yyyyy', 'xxxxxxxxxx', 'yyyyy', 'xxxxxxxxxx', 'yyyyy'];
r.on('end', () => {
  assert.deepStrictEqual(seen, expect);
  require('tap').pass();
});
;
(function () {
  var t = require('tap');
  t.pass('sync run');
})();
var _list = process.listeners('uncaughtException');
process.removeAllListeners('uncaughtException');
_list.pop();
_list.forEach(e => process.on('uncaughtException', e));