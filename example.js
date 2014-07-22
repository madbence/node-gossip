'use strict';

var Node = require('./');
var Remote = require('./remote');
var co = require('co');

var n = new Node();
var m = new Node();
var r = new Remote();
r.node = m;
n._peers.push(r);

co(function*() {
  yield* n.state.set('foo', { value: 1, version: 1 }, 0);
  yield* n.state.set('foo', { value: 1, version: 2 }, 1);
  m.state.participants[0] = {};
  m.state.participants[1] = {};
  yield* n.gossip();
})();
