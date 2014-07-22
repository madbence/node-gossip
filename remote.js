'use strict';

function Remote() {
  this.lag = 50;
}

function sleep(ms) {
  return function(cb) {
    setTimeout(cb, ms);
  };
}

Remote.prototype.gossip = function* gossip(digest) {
  var node = this.node;
  yield sleep(Math.random() * this.lag);
  var delta = yield node.delta(digest);
  var result = {
    data: yield* node.delta(digest),
    digest: yield* node.digest()
  };
  yield sleep(Math.random() * this.lag);
  return result;
};

Remote.prototype.sync = function* sync(delta) {
  var node = this.node;
  yield sleep(Math.random() * this.lag);
  yield* node.merge(delta);
};

module.exports = Remote;
