'use strict';

var State = require('./state');

// replace this with uuid
var i = 0;

function Node() {
  this.id = i++;
  this._peers = [];
  this.state = new State(this.id);
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
  var result = yield gossipee.gossip(digest);
  yield gossiper.merge(result.data);
  var delta = yield gossiper.delta(result.digest);
  yield gossipee.sync(delta);
}

Node.prototype.digest = function* digest() {
  var digest = {};
  for(var id in this.state.participants) {
    digest[id] = yield* this.state.max(id);
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
      console.log(id, key, item);
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
}

module.exports = Node;
