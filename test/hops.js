
var tape = require('tape')
var Graphmitter = require('../')

// 1. generate a graph.
// 2. calculate nodes reachable (R1)
// 3. listen for new reachable nodes (R_realtime)
// 4. incrementially add nodes and edges
// 5. calculate nodes reachable (R2)
// 6. assert that R2 = R_realtime


function group (h) {
  var total = {}
  for(var i in h)
    total[h[i]] = (total[h[i]] || 0) + 1
  return total
}

tape('test adding one edge', function (t) {

  t.plan(10)

  var g = Graphmitter.random(20, 60)

  //ensure there is an edge from 0->1 so the test always passes.
  g.edge('#0', '#1')

  var h = g.traverse({start: '#0', hops: 2})

  var i = 0, __hops

  g.traverse({start: '#0', hops: 3, old: false}, function (from, to, hops, _hops) {
    i++
    console.log(i, from, to, hops, _hops)
    if(i === 1) {
      t.notOk(_hops)
      t.equal('#1', from)
      t.equal('#new', to)
      t.ok(__hops = hops)
    }
    else if(i === 2) {
      t.equal(_hops, __hops)
      t.equal('#0', from)
      t.equal('#new', to)
      t.equal(__hops = hops, 1)
    }
  })

  g.edge('#1', '#new')
  g.edge('#0', '#new')

  var h2 = g.traverse({start: '#0', hops: 2})
  t.equal(h2['#new'], 1)
  t.equal(Object.keys(h2).length, Object.keys(h).length + 1)
  t.end()
})

tape('add a whole graph', function (t) {

  var g1 = Graphmitter.random(10, 30, '#')
  var g2 = Graphmitter.random(3, 10, '@')

  g1.add(g2)

  var hops = g1.traverse({start: '#0', hops: 5})

  function min (a, b) {
    return null == a ? b : Math.min(a, b)
  }

  g1.traverse({start: '#0', hops: 5, old: false}, function (from, to, h, _h) {
    hops[to] = min(hops[to], h)
  })

  g1.add(g2)

  t.equal(Object.keys(g1.nodes).length, 13)

  g1.edge('#1', '@2')

  

  console.log(hops)
  console.log(g2.traverse({start: '@0', hops: 5}))
  console.log(g1.traverse({start: '#0', hops: 5}))
  t.deepEqual(g1.traverse({start: '#0', hops: 5}), hops)
//  console.log(g1.toJSON())
  t.end()

})

tape('test adding a branch.', function (t) {

  var g = Graphmitter()
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
  console.log(edges)
  t.end()

})
