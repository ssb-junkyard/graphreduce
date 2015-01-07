# graphmitter

```js
var Graphmitter = require('graphmitter')
var g = Graphmitter()

// create edges
g.edge(1, 2).edge(2, 3).edge(3, 4)

// delete an edge
g.del(3, 4)

// iterate each node
g.each(console.log)
// => 1 { edges: { '2': true } }
// => 2 { edges: { '3': true } }
// => 3 { edges: { '2': true } }
// => 4 { edges: {} }

// get full structure
g.toJSON() /* =>
{ '1': { '2': true },
  '2': { '3': true },
  '3': {},
  '4': {} }
*/

// see connected nodes from a start node, including # of hops
g.traverse({ start: 1 }) // => { '1': 0, '2': 1, '3': 2 }
g.traverse({ start: 2 }) // => { '2': 0, '3': 1 }
g.traverse({ start: 1, hops: 1 }) // => { '1': 0, '2': 1 }
g.traverse({ start: 1, max: 2 }) // => { '1': 0, '2': 1 }

// rank the connectedness of nodes using a pagerank derivative
g.rank() /* =>
{ '1': 0.037500000000000006,
  '2': 0.25,
  '3': 0.25,
  '4': 0.037500000000000006 }
*/
g.edge(3, 2)
g.rank() /* =>
{ '1': 0.037500000000000006,
  '2': 0.4625,
  '3': 0.25,
  '4': 0.037500000000000006 }
*/

// helper to generate a random graph
Graphmitter.random(100, 100) // 100 nodes, 100 edges
```


## License

MIT
