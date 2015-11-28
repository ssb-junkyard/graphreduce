'use strict';
//
// Algorithms
//

// probably move these to another file when there get to be lots of them.

function count(obj) {
  var c = 0
  for(var k in obj) c++
  return c
}

function widthTraverse (graph, reachable, start, depth, hops, max, iter) {
  if(!start)
    throw new Error('Graphmitter#traverse: start must be provided')

  var nodes = 1

  reachable[start] = reachable[start] == null ? 0 : reachable[start]

  var queue = [{key: start, hops: depth}]
  iter = iter || function () {}
  var abort = false
  while(queue.length && (!max || nodes < max) && !abort) {
    var o = queue.shift()
    var h = o.hops
    var n = graph.nodes[o.key]
    if(n && (!hops || (h + 1 <= hops)))
      for(var k in n.edges) {
        // If we have already been to this node by a shorter path,
        // then skip this node (this only happens when processing
        // a realtime edge)
        if(!(reachable[k] != null && reachable[k] < h + 1)) {
          if(false === iter(o.key, k, h + 1, reachable[k]))
            return reachable

          reachable[k] = h + 1
          nodes ++
          queue.push({key: k, hops: h + 1})
        }
    }
  }

  return reachable
}

exports.traverse = function (opts, onEach) {
  var self = this
  var maxHops = opts.hops || 3
  var maxNodes = opts.max || 150
  var reachable = {}
  opts.each = onEach = onEach || opts.each

  widthTraverse(
    this, reachable,
    opts.start,
    0,             //initial hops
    opts.hops,     //max hops
    opts.max,      //max nodes
    opts.old !== false && onEach
  )

  if(!onEach || opts.live === false) return reachable

  function onEdge (from, to) {
    //if this edge is part of the initial setd
    if(reachable[from] != null && reachable[from] < maxHops) {
      //edges to new nodes.
      var h = reachable[from] + 1
      var _h = reachable[to]
      if(_h == null)
        onEach(from, to, reachable[to] = h, _h)
      else if(Math.min(h, _h) != _h)
        onEach(from, to, reachable[to] = Math.min(h, _h), _h)

      if(h <= maxHops && h != _h) {
        //also add other nodes that are now reachable.
        widthTraverse(self, reachable, to, h, maxHops, maxNodes, onEach)

      }
    }
  }

  this.on('edge', onEdge)

  return function () {
    self.removeListener('edge', onEdge)
  }
}

// page rank. I adapted the algorithm to use
// forward links instead of backward links which means
// we only have to traverse the graph one time.

exports.rank = function (opts) {
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

//find the shortest path between two nodes.
//if there was no path within max hops, return null.

//convert a spanning tree to an array.
function toArray (span, root) {
  if(!span[root]) return null
  var a = [root]
  while(span[root])
    a.push(root = span[root])
  return a.reverse()
}

exports.path = function (opts) {
  var reverse = {}
  if(opts.source == opts.dest)
    return [opts.source]

  opts.start = opts.source
  opts.live = false
  opts.each = function (f, t, h) {
    reverse[t] = f
  }

  this.traverse(opts)
  return toArray(reverse, opts.dest)
}


