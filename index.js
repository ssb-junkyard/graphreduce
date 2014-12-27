

var EventEmitter = require('events').EventEmitter

var inherits = require('util').inherits

inherits(Graphmitter, EventEmitter)

module.exports = Graphmitter

function each(obj, iter) {
  for(var k in obj) iter(k, obj[k])
}


function Graphmitter () {
  if(!(this instanceof Graphmitter)) return new Graphmitter()
  this.nodes = {}
}

var proto = Graphmitter.prototype

proto.node = function (n) {
  return this.nodes[n] = this.nodes[n] || new Node(n)
}

proto.edge = function (from, to, data) {
  this.node(to)
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

proto.traverse = function (opts) {
  opts = opts || {}
  var start = opts.start
  var hops = opts.hops
  var max = opts.max

  var nodes = 1

  var reachable = {}
  var queue

  var queue = [{key: start, hops: 0}]

  reachable[start] = 0

  while(queue.length && (!max || nodes < max)) {
    var o = queue.shift()
    var h = o.hops
    if(!hops || (h + 1 <= hops))
      this.nodes[o.key].each(function (k) {
        if(reachable[k] != null) return
        reachable[k] = h + 1
        nodes ++
        queue.push({key: k, hops: h + 1})
      })
  }

  return reachable

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
