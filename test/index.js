

var tape = require('tape')
var G = require('../')

tape('get', function (t) {

  var g = G.random(10, 30)

//  G.each(g, function (key, node) {
//    t.equal(node, G.get(g, key))
//  })
//
  G.eachEdge(g, function (src, dst, v) {
    console.log(src, dst)
    t.equal(G.get(g, src, dst), v)
  })

  t.end()

})


//RANDOMLY generate a graph and then check that it
//has some reasonable properties.

tape('hops', function (t) {

  //a is subset of b
  function subset(a, b) {
    for(var k in a) {
      t.equal(b[k], a[k])
    }
  }

  var g = G.random(100, 300)

  var reachable = G.hops(g, '#0', 0, 3) //{start: '#0'})

  var reachable2 = G.hops(g, '#0', 0, 2) //G.traverse(g, {start: '#0', hops: 2})

//  var reachable3 = G G.traverse(g, {start: '#0', max: 20})

  //var reachable4 = G.traverse(g, {start: '#0', hops: 2, max: 20})

  t.ok(Object.keys(reachable).length)

  console.log('reachable2 is subset of reachable')
  subset(reachable2, reachable)
  console.log('reachable3 is subset of reachable')
//  subset(reachable3, reachable)


  //if the random graph happened not to have 20 nodes within 2 hops
  //then reachable3 will be larger than reachable2.

//  if(Object.keys(reachable2).length > 20) {
//    console.log('reachable3 is subset of reachable2')
//    subset(reachable3, reachable2)
//  } else {
//    console.log('reachable2 is subset of reachable3')
//    subset(reachable2, reachable3)
//  }
//
//  //since reachable4 is either 2 hops or 20 nodes
//  //it's always the subset of either 2 or 3.
//
//  subset(reachable4, reachable3)
//  subset(reachable4, reachable2)

  t.end()
})


//make sure the empty graph does not throw
tape('empty graph', function (t) {
  var g = G.random(0,0)
  var o = G.hops(g, 'a', 0, 3) //G.traverse(g, {start:'a'})
  t.deepEqual(o, {})
  t.end()
})

