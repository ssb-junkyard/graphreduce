

var EventEmitter = require('events').EventEmitter

var inherits = require('util').inherits

inherits(Graphmitter, EventEmitter)

module.exports = Graphmitter

function each(obj, iter) {
  for(var k in obj) iter(k, obj[k])
}


function Graphmitter () {
  this.nodes = {}
}

var proto = Graphmitter.prototype

proto.node = function (n) {
  return this.nodes[n] = this.nodes[n] || new Node(n)
}

proto.edge = function (from, to, data) {
  var _data = this.node(from).edge(to, data || true)
  if(_data !== data)
    this.emit('edge', from, to, data, _data)
  return this
}

proto.each = function (iter) {
  each(this.nodes, iter)
  return this
}

proto.toJSON = function (iter) {
  var g = {}
  this.each(function (k, v) {
    var e = {}
    v.each(function (k, v) {
      e[k] = v
    })
    g[k] = e
  })
  return g
}

function Node () {
  this.edges = {}
}

var nproto = Node.prototype

//returns the old data for this edge..
nproto.edge = function (to, data) {
  var _data = this.edges[to]
  this.edges[to] = data
  return _data
}

nproto.each = function (iter) {
  each(this.edges, iter)
  return this
}

