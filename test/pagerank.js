
var Graphmitter = require('../')
var tape = require('tape')

tape('pagerank', function (t) {

  var g = Graphmitter()

  g
    .edge('A', 'C')
    .edge('B', 'A').edge('A', 'C')
    .edge('C', 'A')
    .edge('D', 'A').edge('D', 'B').edge('D', 'C')

  var r = g.rank({})

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

  var g = Graphmitter.random(20, 30)
  console.log(g.toJSON())
    var ranks = g.rank({iterations: 15})
  console.log(ranks)
  var sum = 0
  for(var k in ranks)
    sum += ranks[k]
  console.log(sum)

  t.end()
})
