'use strict';

var Node = require('./');
var co = require('co');

var n = new Node();


co(function*() {
  yield* n.state.set('foo', { value: 1, version: 1 }, 1);
  yield* n.state.set('foo', { value: 1, version: 2 }, 2);
  var digest = yield* n.digest();
  console.log(digest);
  yield* n.state.set('foo', { value: 1, version: 3 }, 2);
  var delta = yield* n.delta(digest);
  console.log(delta);
})();
