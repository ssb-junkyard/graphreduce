var statistics = require('statistics')
var G = require('../')
var tape = require('tape')

tape('pagerank', function (t) {

  var g = {}

  
  G.addEdge(g, 'A', 'C')
  G.addEdge(g, 'B', 'A')
  G.addEdge(g, 'A', 'C')
  G.addEdge(g, 'C', 'A')
  G.addEdge(g, 'D', 'A')
  G.addEdge(g, 'D', 'B')
  G.addEdge(g, 'D', 'C')

  var r = G.rank(g, {})

  console.log(r)

  t.deepEqual(r,
    { A: 0.5333333333333333,
      C: 0.3208333333333333,
      B: 0.10833333333333334,
      D: 0.037500000000000006
    })

  t.end()

})

tape('random graph', function (t) {
  var total, N = 100
  for(var i = 0; i < N; i++) {
    var g = G.random(20, 30)
    var ranks = G.rank(g, {iterations: 15})
    var sum = 0
    for(var k in ranks)
      sum += ranks[k]
    total = statistics(total, sum)
//    console.log(sum)
  }
  console.log(total)
  //rank should be around 1.
  t.ok(total.mean + total.stdev*2 > 1)
  t.ok(total.mean - total.stdev*2 < 1)

  t.end()
})




