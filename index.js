

var EventEmitter = require('events').EventEmitter

var inherits = require('util').inherits

inherits(Graphmitter, EventEmitter)

module.exports = Graphmitter

function each(obj, iter) {
  for(var k in obj) iter(k, obj[k])
}

//
// Node / Vertice
//

function Node () {
  this.edges = {}
}

var nproto = Node.prototype

//returns the old data for this edge..
nproto.edge = function (to, data) {
  var _data = this.edges[to]
  this.edges[to] = (data == null ? true : data)
  return _data
}

nproto.has = function (to) {
  return this.edges[to]
}

//also returns the old data for this edge..
nproto.del = function (to, data) {
  var _data = this.edges[to]
  delete this.edges[to]
  return _data
}

nproto.each = function (iter) {
  each(this.edges, iter)
  return this
}

//
// the whole graph
//

function Graphmitter () {
  if(!(this instanceof Graphmitter)) return new Graphmitter()
  this.nodes = {}
}

var proto = Graphmitter.prototype

proto.hasNode = function (n) {
  return !!this.nodes[n]
}

proto.hasEdge = function (f, t) {
  return this.hasNode(f) && !!this.nodes[f].edges[t] != null
}

proto.node = function (n) {
  return this.nodes[n] = this.nodes[n] || new Node(n)
}

proto.get = function (f, t) {
  if(t == null) return this.nodes[f]
  return this.hasNode(f) ? this.nodes[f].edges[t] : null
}

proto.edge = function (from, to, data) {
  data = (data == null ? true : data)
  var f = this.node(from)
  this.node(to)
  var _data = f.edge(to, data)

  if(_data !== data)
    this.emit('edge', from, to, data, _data)
  return this
}

proto.del = function (from, to) {
  var data = this.node(from).del(to)
  if (typeof data !== 'undefined')
    this.emit('del', from, to, data)
  return this
}

proto.each = function (iter) {
  each(this.nodes, iter)
  return this
}

proto.eachEdge = function (iter) {
  each(this.nodes, function (from, n) {
    each(n.edges, function (to, data) {
      iter(from, to, data)
    })
  })
  return this
}

//get a random node
proto.random = function () {
  var keys = Object.keys(this.nodes)
  return keys[~~(keys.length*Math.random())]
}

//add another subgraph
proto.add = function (g2) {
  var g1 = this
  g2.eachEdge(function (from, to, data) {
    g1.edge(from, to, data)
  })
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

//
// graph generators
//

Graphmitter.random = function (nodes, edges, prefix) {
  prefix = prefix || '#'
  if(isNaN(+nodes)) throw new Error('nodes must be a number')
  if(isNaN(+edges)) throw new Error('edges must be a number')

  var n = 0, g = new Graphmitter()

  function rand(n) {
    return prefix+~~(Math.random()*n)
  }

  for(var i = 0; i < nodes; i++)
    g.node(prefix+i)

  for(var i = 0; i < edges; i++) {
    var a = rand(nodes), b = rand(nodes)
    g.edge(a, b).edge(b, a)
  }

  return g
}


var algorithms = require('./algorithms')

for(var k in algorithms) proto[k] = algorithms[k]

