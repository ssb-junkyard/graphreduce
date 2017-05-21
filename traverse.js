'use strict';
//
// Algorithms
//

// probably move these to another file when there get to be lots of them.

exports.hops = function (g, start, initial, max, seen) {
  var visited = {}
  var queue = [start]
  visited[start] = initial
  while(queue.length) {
    var node = queue.shift()
    var h = visited[node]
  //  console.log('EXPAND', node, h)
    for(var k in g[node]) {
//      console.log(node, k, visited[k], h)
      if(
        visited[k] == null
      && (!seen || (seen[k] == null || seen[k] > h+1))
      && h < max
      ) {
        queue.push(k)
        visited[k] = h + 1
      }
    }
  }
  return visited
}


//mutates `reachable`, btw
function widthTraverse (graph, reachable, start, depth, hops, iter) {
  if(!start)
    throw new Error('Graphmitter#traverse: start must be provided')

  //var nodes = 1

  reachable[start] = reachable[start] == null ? 0 : reachable[start]

  var queue = [start] //{key: start, hops: depth}]
  iter = iter || function () {}
  while(queue.length) {
    var o = queue.shift()
    var h = reachable[o]
    var node = graph[o]
    if(node && (!hops || (h + 1 <= hops)))
      for(var k in node) {
        // If we have already been to this node by a shorter path,
        // then skip this node (this only happens when processing
        // a realtime edge)
        if(!(reachable[k] != null && reachable[k] < h + 1)) {
          if(false === iter(o, k, h + 1, reachable[k]))
            return reachable

          reachable[k] = h + 1
//          nodes ++
          queue.push(k)
        }
    }
  }

  return reachable
}

// traverse(g, start, opts, onEach) => seen

// batch(g, seen, ary, {hops: h}, onEach) => seen

exports.traverse = function (g, opts, onEach) {
  var maxHops = opts.hops || 3
  var reachable = {}
  opts.each = onEach = onEach || opts.each

  console.log(maxHops, opts)

  widthTraverse(
    g, reachable,
    opts.start,
    0,             //initial hops
    maxHops,     //max hops
    opts.old !== false && onEach
  )

  if(!onEach || opts.live === false) return reachable

  function onEdge (from, to) {
    //if this edge is part of the initial set
    if(reachable[from] != null && reachable[from] < maxHops) {
      //edges to new nodes.
      var h = reachable[from] + 1
      var _h = reachable[to]
      if(_h == null)
        onEach(from, to, reachable[to] = h, _h)
      else if(Math.min(h, _h) != _h)
        onEach(from, to, reachable[to] = Math.min(h, _h), _h)

      //this is used only for realtime adds.
      if(h <= maxHops && h != _h) {
        //also add other nodes that are now reachable.
        widthTraverse(self, reachable, to, h, maxHops, onEach)

      }
    }
  }
}

// page rank. I adapted the algorithm to use
// forward links instead of backward links which means
// we only have to traverse the graph one time.

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

