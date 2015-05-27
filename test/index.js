

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

  var g = Graphmitter.random(100, 300)

  var reachable = g.traverse({start: '#0'})

  var reachable2 = g.traverse({start: '#0', hops: 2})

  var reachable3 = g.traverse({start: '#0', max: 20})

  var reachable4 = g.traverse({start: '#0', hops: 2, max: 20})

  t.ok(Object.keys(reachable).length)

  console.log('reachable2 is subset of reachable')
  subset(reachable2, reachable)
  console.log('reachable3 is subset of reachable')
  subset(reachable3, reachable)


  //if the random graph happened not to have 20 nodes within 2 hops
  //then reachable3 will be larger than reachable2.

  if(Object.keys(reachable2).length > 20) {
    console.log('reachable3 is subset of reachable2')
    subset(reachable3, reachable2)
  } else {
    console.log('reachable2 is subset of reachable3')
    subset(reachable2, reachable3)
  }

  //since reachable4 is either 2 hops or 20 nodes
  //it's always the subset of either 2 or 3.

  subset(reachable4, reachable3)
  subset(reachable4, reachable2)

  t.end()
})

//make sure the empty graph does not throw
tape('empty graph', function (t) {
  var g = new Graphmitter()
  var o = g.traverse({start:'a'})
  t.deepEqual(o, {a: 0})
  t.end()
})

