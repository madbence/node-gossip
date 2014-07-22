'use strict';

var State = require('./state');

// replace this with uuid
var i = 0;

function Node() {
  this.id = i++;
  this._peers = [];
  this.state = new State(this.id);
  this.performGossip = pushPullGossip;
}

Node.prototype.choosePeer = function* () {
  var l = this._peers.length;
  var i = Math.floor(Math.random()*l);
  return this._peers[i];
};

Node.prototype.peers = function* peers() {
  for(var i = 0; i < this._peers.length; i++) {
    yield this._peers[i];
  }
};

Node.prototype.gossip = function* gossip() {
  var peer = yield this.choosePeer();
  yield this.performGossip(this, peer);
};

function* pushPullGossip(gossiper, gossipee) {
  var digest = yield gossiper.digest();
  console.log('[%d] my digest is %j', this.id, digest);
  var result = yield* gossipee.gossip(digest);
  console.log('[%d] recieved', this.id, result);
  yield gossiper.merge(result.data);
  var delta = yield gossiper.delta(result.digest);
  console.log('[%d] calculated delta is %j from digest', this.id, delta, result.digest);
  yield gossipee.sync(delta);
}

Node.prototype.digest = function* digest() {
  var digest = {};
  for(var id in this.state.participants) {
    digest[id] = yield* this.state.max(id);
    console.log(this.id, id, digest);
  }
  return digest;
};

Node.prototype.delta = function* delta(digest) {
  var delta = [];
  for(var id in this.state.participants) {
    var keys = Object.keys(this.state.participants[id]);
    for(var i in keys) {
      var key = keys[i];
      var item = this.state.participants[id][key];
      if(item.version > digest[id]) {
        delta.push({
          id: id,
          key: key,
          value: item.value,
          version: item.version
        });
      }
    }
  }
  return delta;
};

Node.prototype.merge = function* merge(delta) {
  console.log('[%d] merge %j', this.id, delta);
  for(var i in delta) {
    var data = delta[i];
    yield* this.state.set(data.key, {
      version: data.version,
      value: data.value
    }, data.id)
  }
}

module.exports = Node;
