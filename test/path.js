

var tape = require('tape')
var Graphmitter = require('../')


tape('path', function (t) {

  var g = Graphmitter()

  g
    .edge('A', 'C')
    .edge('B', 'A').edge('A', 'C')
    .edge('C', 'A')
    .edge('D', 'A').edge('D', 'B').edge('D', 'C')

  console.log(g.toJSON())

  g.traverse({start: 'A', hops: 3, max: 150, each: console.log})
  g.traverse({start: 'B', hops: 3, max: 150, each: console.log})

  console.log(g.traverse({start: 'B'}))

  t.deepEqual(g.traverse({start: 'B'}), {B:0, A:1, C:2})
  t.deepEqual(g.traverse({start: 'B', max: 2}), {B:0, A:1})

  console.log(g.traverse({start: 'B'}))
  console.log(g.traverse({start: 'B'}))

  var i = 2
  t.deepEqual(g.traverse({start: 'B', each: function (e) {
    return !!(--i)
  }, live: false}), {B:0, A:1})

  var i = 3
  t.deepEqual(
    g.traverse({
      start: 'D',
      each: function (e) {
        return !!(--i)
      },
      live: false
    }),
  {D: 0, B:1, A:1})

  t.end()
})

tape('path, zero hops', function (t) {

  var g = Graphmitter()

  g
    .edge('A', 'C')
    .edge('B', 'A')
    .edge('C', 'A')

  t.deepEqual(
    g.path({source: 'A', dest: 'A'}),
    ['A']
  )

  t.end()

})


tape('path, 1 hop', function (t) {

  var g = Graphmitter()

  g
    .edge('A', 'C')
    .edge('B', 'A')
    .edge('C', 'A')

  t.deepEqual(
    g.path({source: 'A', dest: 'C'}),
    ['A', 'C']
  )

  t.end()

})

tape('path, 2 hops', function (t) {

  var g = Graphmitter()

  g
    .edge('A', 'C')
    .edge('B', 'A')
    .edge('C', 'A')
    .edge('D', 'A')
    .edge('D', 'B')

  t.deepEqual(
    g.path({source: 'D', dest: 'C'}),
    ['D', 'A', 'C']
  )

  t.deepEqual(
    g.path({source: 'D', dest: 'C', hops: 2}),
    ['D', 'A', 'C']
  )

  t.end()

})


tape('path, 3 hops', function (t) {

  var g = Graphmitter()

  g
    .edge('A', 'C')
    .edge('B', 'A')
    .edge('D', 'B')

  t.deepEqual(
    g.path({source: 'D', dest: 'C'}),
    ['D', 'B', 'A', 'C']
  )

  t.deepEqual(
    g.path({source: 'D', dest: 'C', hops: 2}),
    null
  )

  t.end()

})

