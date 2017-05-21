
var tape = require('tape')
var G = require('../')

function group (h) {
  var total = {}
  for(var i in h)
    total[h[i]] = (total[h[i]] || 0) + 1
  return total
}

function first (set, iter) {
  for(var k in set)
    if(iter(set[k], k)) return k
}

function _merge(a, b) {
  for(var k in b) a[k] = b[k]
  return a
}
function merge(a, b) {
  return _merge(_merge({}, a), b)
}

tape('test adding one edge', function (t) {

//  t.plan(10)

  var N = 100, E = 200
  var g = G.random(N, E)

  //ensure there is an edge from 0->1 so the test always passes.
  //G.addEdge(g, '#0', '#1')

  var h1 = G.hops(g, '#0', 0, 1)
  var n_h1 = Object.keys(h1).length
  t.ok(n_h1 < N)
  t.ok(n_h1 > 0)


  var h2 = G.hops(g, '#0', 0, 2)
  console.log(h1, h2)
  var n_h2 = Object.keys(h2).length
  t.ok(n_h2 < N)
  t.ok(n_h2 > 0)
  console.log(n_h1, n_h2)
  t.ok(n_h1 < n_h2, 'h1 less than h2')

  var h3 = G.hops(g, '#0', 0, 3)
  var n_h3 = Object.keys(h3).length
  t.ok(n_h3 <= N)
  t.ok(n_h3 > 0)
  t.ok(n_h2 < n_h3)

  console.log(n_h1, n_h2, n_h3)
  console.log(h3)
  for(var k in h1)
    t.ok(!isNaN(h2[k]))
  for(var k in h2)
    t.ok(!isNaN(h3[k]))

  var k = first(h3, function (v, k) {
    return h1[k] == null
  })

  console.log('add', k)
  G.addEdge(g, '#0', k)

  var h2b = G.hops(g, '#0', 0, 2)
  t.ok(Object.keys(h2b).length > Object.keys(h2).length)

  var h2c = G.hops(g, k, h2['#0'] + 1, 2, h2)
  console.log(h2b, h2c)

  t.notDeepEqual(h2b, h2)
  t.notDeepEqual(h2b, h2c)

  var keys = []

  for(var k in h2)
    keys.push(k)

  for(var k in h2c)
    if(h2[k] == null) {
      console.log('k', k, h2[k], h2c[k])
    } else
      console.log('repeat', k, h2c[k], h2[k])

  console.log(keys)

  t.deepEqual(merge(h2, h2c), h2b)

  t.end()


//  console.log('NEW', h)
//
//  var i = 0, __hops
//
//  G.addEdge(g, '#1', '#new')
//  G.addEdge(g, '#0', '#new')
//
//  var h2 = G.traverse(g, {start: '#0', hops: 2})
//  t.equal(h2['#new'], 1)
//  console.log(h)
//  console.log(h2)
//
//  t.equal(Object.keys(h2).length, Object.keys(h).length + 1)
//
//  t.end()
})

tape('empty graph', function (t) {
  var hops = G.hops({}, '#0', 0, 2)
  t.deepEqual(hops, {})
  t.end()
})

tape('single edge graph', function (t) {
  var g = {}
  G.addEdge(g, '#0', '#1')
  var hops = G.hops(g, '#0', 0, 2)
  console.log(hops)
  t.deepEqual(hops, {'#0':0, '#1': 1})
  t.end()
})



return
tape('add a whole graph', function (t) {

  var g1 = G.random(10, 30, '#')
  var g2 = G.random(3, 10, '@')

  G.addGraph(g1, g2)

  var hops = G.traverse(g1, {start: '#0', hops: 5})

  function min (a, b) {
    return null == a ? b : Math.min(a, b)
  }

  G.traverse(g1, {start: '#0', hops: 5, old: false}, function (from, to, h) {
    hops[to] = min(hops[to], h)
  })

  G.addGraph(g1, g2)

  t.equal(Object.keys(g1).length, 13)

//  G.addEdge(g1, '#1', '@2')

  

  console.log(hops)

//  t.deepEqual(g1.traverse({start: '#0', hops: 5}), hops)
//  console.log(g1.toJSON())
  t.end()

})

return

tape('test adding a branch.', function (t) {

  var g = {}
  var edges = [], expected = [
    ['#0', '#1', 1, undefined],
    ['#1', '#2', 2, undefined],
    ['#1', '#3', 2, undefined]
  ]
  //single node graph
  g.node('#0')

  t.deepEqual(g.traverse({start: '#0'}), {'#0': 0})
  g.traverse({start: '#0', each: function (from, to, h, _h) {
    edges.push([from, to, h, _h])
  }})

  g.edge('#1', '#2')
  g.edge('#1', '#3')
  t.deepEqual([], edges)

  g.edge('#0', '#1')

  t.deepEqual(expected, edges)

  t.end()
})

tape('test shortening a chain', function (t) {

  var edges = [], expected = [
    ['#0', '#1', 1, undefined],
    ['#1', '#2', 2, undefined],
    ['#2', '#3', 3, undefined],
    ['#3', '#4', 4, undefined],

    ['#0', '#2', 1, 2],
    ['#2', '#3', 2, 3],
    ['#3', '#4', 3, 4]
  ]
  var g = Graphmitter()
    .edge('#0', '#1').edge('#1', '#2')
    .edge('#2', '#3').edge('#3', '#4')

  g.traverse({start: '#0', each: function (from, to, h, _h) {
    edges.push([from, to, h, _h])
  }})

  t.deepEqual(edges, expected.slice(0, 4))

  g.edge('#0', '#2')

  t.deepEqual(edges, expected)

  t.end()
})

tape('test cancel the edge listener', function (t) {

  var edges = [], expected = [
    ['#0', '#1', 1, undefined],
    ['#0', '#2', 1, undefined]
  ]

  var g = Graphmitter()
    .edge('#0', '#1')

  var cancel = g.traverse({start: '#0', each: function (f,t,h,_h) {
    edges.push([f,t,h,_h])
  }})

  t.deepEqual(expected.slice(0, 1), edges)

  g.edge('#0', '#2')

  t.deepEqual(expected.slice(0, 2), edges)
  cancel()

  g.edge('#1', '#3')
  g.edge('#2', '#3')
  
  t.deepEqual(expected.slice(0, 2), edges)
  t.end()
})

tape('join two paths', function (t) {

  var edges = [], expected = [
    ['#0', '#1', 1, undefined],
    ['#0', '#2', 1, undefined],
    //3->4 is not connected.

    //3 (& 4) to the graph
    ['#1', '#3', 2, undefined],
    ['#3', '#4', 3, undefined],


//    ['#2', '#3', 2, 2]

]

  var g = Graphmitter()
    .edge('#0', '#1')

  var cancel = g.traverse({start: '#0', each: function (f, t, h, _h) {
    edges.push([f,t,h,_h])
  }})

  t.deepEqual(expected.slice(0, 1), edges)

  g.edge('#0', '#2').edge('#3', '#4')

  t.deepEqual(expected.slice(0, 2), edges)

  g.edge('#1', '#3')
  t.deepEqual(expected.slice(0, 4), edges)

  g.edge('#2', '#3')
  
  t.deepEqual(expected.slice(0, 4), edges)

  t.deepEqual(Graphmitter.fromJSON(g.toJSON()).rank(), g.rank())
  console.log(edges)
  t.end()

})










