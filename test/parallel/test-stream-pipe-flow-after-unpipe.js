"use strict";

/*<replacement>*/
const bufferShim = require('safe-buffer').Buffer;
/*</replacement>*/
const common = require('../common');
const _require = require('../../'),
  Readable = _require.Readable,
  Writable = _require.Writable;

// Tests that calling .unpipe() un-blocks a stream that is paused because
// it is waiting on the writable side to finish a write().

const rs = new Readable({
  highWaterMark: 1,
  // That this gets called at least 20 times is the real test here.
  read: common.mustCallAtLeast(() => rs.push('foo'), 20)
});
const ws = new Writable({
  highWaterMark: 1,
  write: common.mustCall(() => {
    // Ignore the callback, this write() simply never finishes.
    setImmediate(() => rs.unpipe(ws));
  })
});
let chunks = 0;
rs.on('data', common.mustCallAtLeast(() => {
  chunks++;
  if (chunks >= 20) rs.pause(); // Finish this test.
}));

rs.pipe(ws);
;
(function () {
  var t = require('tap');
  t.pass('sync run');
})();
var _list = process.listeners('uncaughtException');
process.removeAllListeners('uncaughtException');
_list.pop();
_list.forEach(e => process.on('uncaughtException', e));