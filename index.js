

var EventEmitter = require('events').EventEmitter

var inherits = require('util').inherits

inherits(Graphmitter, EventEmitter)

module.exports = Graphmitter

function each(obj, iter) {
  for(var k in obj) iter(k, obj[k])
}

function count(obj) {
  var c = 0
  for(var k in obj) c++
  return c
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
  this.edges[to] = data
  return _data
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

proto.node = function (n) {
  return this.nodes[n] = this.nodes[n] || new Node(n)
}

proto.edge = function (from, to, data) {
  this.node(from)
  this.node(to)
  var _data = this.node(from).edge(to, data || true)
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

Graphmitter.random = function (nodes, edges) {
  if(isNaN(+nodes)) throw new Error('nodes must be a number')
  if(isNaN(+edges)) throw new Error('edges must be a number')

  var n = 0, g = new Graphmitter()

  function rand(n) {
    return '#'+~~(Math.random()*n)
  }

  for(var i = 0; i < nodes; i++)
    g.node('#'+i)

  for(var i = 0; i < edges; i++) {
    var a = rand(nodes), b = rand(nodes)
    g.edge(a, b).edge(b, a)
  }

  return g
}


//
// Algorithms
//

// probably move these to another file when there get to be lots of them.

proto.traverse = function (opts) {
  opts = opts || {}
  var start = opts.start
  var hops = opts.hops
  var max = opts.max

  if(!start) throw new Error('Graphmitter#traverse: start must be provided')

  var nodes = 1

  var reachable = {}
  var queue

  var queue = [{key: start, hops: 0}]

  reachable[start] = 0

  while(queue.length && (!max || nodes < max)) {
    var o = queue.shift()
    var h = o.hops
    var n = this.nodes[o.key]
    if(n && (!hops || (h + 1 <= hops)))
      n.each(function (k) {
        if(reachable[k] != null) return
        reachable[k] = h + 1
        nodes ++
        queue.push({key: k, hops: h + 1})
      })
  }

  return reachable

}

// page rank. I adapted the algorithm to use
// forward links instead of backward links which means
// we only have to traverse the graph one time.

proto.rank = function (opts) {
  opts = opts || {}

  var ranks = {}, links = {}, _ranks = {}
  var N = count(this.nodes)
  var iterations = opts.iterations || 1
  var damping = opts.damping || 0.85
  var init = (1 - damping) / N

  //initialize
  this.each(function (k, n) {
    ranks[k] = 1/N; _ranks[k] = init
    links[k] = count(n.edges)
  })

  while(iterations --> 0) {

    //iteration
    this.each(function (j, n) {
      var r = damping*(ranks[j]/links[j])
      n.each(function (k) { _ranks[k] += r })
    })

    //reset
    for(var k in ranks)
      ranks[k] = init

    var __ranks = ranks
    ranks = _ranks
    _ranks = __ranks
  }
  return ranks
}

