

var tape = require('tape')
var Graphmitter = require('../')

//RANDOMLY generate a graph and then check that it
//has some reasonable properties.

tape('hops', function (t) {

  //a is subset of b
  function subset(a, b) {
    for(var k in a) {
      t.equal(b[k], a[k])
    }
  }

  var g = new Graphmitter()
  var n = 0

  function rand(n) {
    return '#'+~~(Math.random()*n)
  }

  var edges = 200, nodes = 100
  for(var i = 0; i < nodes; i++)
    g.node(i)
  for(var i = 0; i < edges; i++) {
    var a = rand(nodes), b = rand(nodes)
    g.edge(a, b).edge(b, a)
  }

  var reachable = g.traverse({start: '#0'})

  var reachable2 = g.traverse({start: '#0', hops: 2})

  var reachable3 = g.traverse({start: '#0', max: 20})

  t.ok(Object.keys(reachable).length)

  subset(reachable2, reachable)
  subset(reachable3, reachable)

  subset(reachable2, reachable3)

  t.end()
})
