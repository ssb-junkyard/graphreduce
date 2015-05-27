

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
  this.edges[to] = (data == null ? true : data)
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

proto.hasNode = function (n) {
  return !!this.nodes[n]
}

proto.hasEdge = function (f, t) {
  return this.hasNode(f) && !!this.nodes[f].edges[t] != null
}

proto.node = function (n) {
  return this.nodes[n] = this.nodes[n] || new Node(n)
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


//
// Algorithms
//

// probably move these to another file when there get to be lots of them.


function widthTraverse (graph, reachable, start, depth, hops, max, iter) {
  if(!start)
    throw new Error('Graphmitter#traverse: start must be provided')

  var nodes = 1

  reachable[start] = reachable[start] == null ? 0 : reachable[start]

  var queue = [{key: start, hops: depth}]
  iter = iter || function () {}

  while(queue.length && (!max || nodes < max)) {
    var o = queue.shift()
    var h = o.hops
    var n = graph.nodes[o.key]
    if(n && (!hops || (h + 1 <= hops)))
      n.each(function (k) {
        // If we have already been to this node by a shorter path,
        // then skip this node (this only happens when processing
        // a realtime edge)
        if(reachable[k] != null && reachable[k] < h + 1) return
        iter(o.key, k, h + 1, reachable[k])
        reachable[k] = h + 1
        nodes ++
        queue.push({key: k, hops: h + 1})
      })
  }
  return reachable
}


proto.traverse = function (opts) {
  opts = opts || {}
  return widthTraverse(this, {}, opts.start, 0, opts.hops, opts.max, opts.each)
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

proto.changes = function (opts, listener) {
  var self = this
  var maxHops = opts.hops || 3
  var maxNodes = opts.max || 150
  var hops = this.traverse(opts)
  listener = listener || opts.each

  function onEdge (from, to) {
    //if this edge is part of the initial setd
    if(hops[from] != null && hops[from] < maxHops) {
      //edges to new nodes.
      var h = hops[from] + 1
      var _h = hops[to]
      if(_h == null)
        listener(from, to, hops[to] = h, _h)
      else if(Math.min(h, _h) != _h)
        listener(from, to, hops[to] = Math.min(h, _h), _h)

      if(h <= maxHops && h != _h) {
        //also add other nodes that are now reachable.
        widthTraverse(self, hops, to, h, maxHops, maxNodes, function (from, to, h, _h) {
          listener(from, to, h, _h)
        })

      }
    }
  }

  this.on('edge', onEdge)

  return function () {
    self.removeListener('edge', onEdge)
  }
}
