'use strict';

function State(id) {
  this.id = id;
  this.participants = {};
}

State.prototype.get = function* get(key, id) {
  id = id || this.id;
  var participant = this.participants[id];
  if(!participant) {
    return {
      version: -Infinity,
      value: null
    };
  }
  var item = participant[key];
  if(!item) {
    return {
      version: -Infinity,
      value: null
    };
  }
  return item;
};

State.prototype.set = function* set(key, newItem, id) {
  id = id || this.id;
  console.log('[%d] Set %d.%s to %j', this.id, id, key, newItem);
  var participant = this.participants[id];
  if(!participant) {
    this.participants[id] = {};
    this.participants[id][key] = newItem;
    return;
  }
  var oldItem = yield* this.get(key, id);
  if(oldItem.version < newItem.version) {
    participant[key] = newItem;
  }
};

State.prototype.merge = function* merge(key, newItem) {
  var keys = Object.keys(participants);
  for(var i in keys) {
    yield* this.set(key, newItem, keys[i]);
  }
};

State.prototype.max = function* max(id) {
  var participant = this.participants[id];
  if(!participant) {
    return -Infinity;
  }
  return Object.keys(participant).reduce(function(max, key) {
    var version = participant[key].version;
    return max > version ? max : version;
  }, -Infinity);
};

module.exports = State;
