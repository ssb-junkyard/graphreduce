

var EventEmitter = require('events').EventEmitter

function each(obj, iter) {
  for(var k in obj) iter(k, obj[k])
}
function hasEdge (g, f, t) {
  return g[f] && Object.hasOwnProperty(g[f], t)
}

function addNode(g, n) {
  g[n] = g[n] || {}
  return g
}

function get (g, f, t) {
  if(t == null) throw new Error('not implemented')
  return g[f] && g[f][t] || null
}

function addEdge (g, from, to, data) {

  (g[from] = g[from] || {})[to] = (data === undefined ? true : data)
  return g
}

function removeEdge (g, from, to) {
  delete g[from][to]
}

function eachEdge (g, iter) {
  each(g, function (from, n) {
    each(n, function (to, data) {
      iter(from, to, data)
    })
  })
}

//get a random node
function randomNode (g) {
  var keys = Object.keys(g)
  return keys[~~(keys.length*Math.random())]
}

//add another subgraph
function addGraph (g1, g2) {
  eachEdge(g2, function (from, to, data) {
    addEdge(g1, from, to, data)
  })
  return g1
}


//
// graph generators
//

function random (nodes, edges, prefix) {
  prefix = prefix || '#'
  if(isNaN(+nodes)) throw new Error('nodes must be a number')
  if(isNaN(+edges)) throw new Error('edges must be a number')

  var n = 0, g = {}

  function rand(n) {
    return prefix+~~(Math.random()*n)
  }

  for(var i = 0; i < nodes; i++)
    addNode(g, prefix+i)

  for(var i = 0; i < edges; i++) {
    var a = rand(nodes), b = rand(nodes)
    addEdge(g, a, b)
    addEdge(g, b, a)
  }

  return g
}


exports.random = random
exports.each = each
exports.addEdge = addEdge
exports.hasEdge = hasEdge
exports.removeEdge = removeEdge
exports.eachEdge = eachEdge
exports.addGraph = addGraph
exports.get = get

function count(obj) {
  var c = 0
  for(var k in obj) c++
  return c
}

exports.rank = function (g, opts) {
  opts = opts || {}

  var ranks = {}, links = {}, _ranks = {}
  var N = count(g)
  var iterations = opts.iterations || 1
  var damping = opts.damping || 0.85
  var init = (1 - damping) / N

  //initialize
  each(g, function (k, n) {
    ranks[k] = 1/N; _ranks[k] = init
    links[k] = count(n)
  })

  while(iterations --> 0) {

    //iteration
    each(g, function (j, n) {
      var r = damping*(ranks[j]/links[j])
      each(n, function (k) { _ranks[k] += r })
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

exports.hops = function (g, start, initial, max, seen) {
  if(!g[start]) return {}
  var visited = {}
  var queue = [start]
  visited[start] = initial
  while(queue.length) {
    var node = queue.shift()
    var h = visited[node]
    for(var k in g[node]) {
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


