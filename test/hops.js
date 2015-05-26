
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

  t.plan(5)

  var g = Graphmitter.random(20, 60)

  var h = g.traverse({start: '#0', hops: 2})

  g.changes({start: '#0', hops: 3}, function (from, to, hops) {
    t.equal('#0', from)
    t.equal('#new', to)
    t.equal(hops, 1)
  })

  g.edge('#0', '#new')

  var h2 = g.traverse({start: '#0', hops: 2})
  t.equal(h2['#new'], 1)
  t.equal(Object.keys(h2).length, Object.keys(h).length + 1)
  t.end()
})
