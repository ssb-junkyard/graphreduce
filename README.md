# graphreduce

```js
var G = require('graphmitter')
var g = {}

// create edges
G.edge(g, 1, 2)
G.edge(g, 2, 3)
G.edge(g, 3, 4)

// delete an edge
G.del(g, 3, 4)

// iterate each node
G.each(g, console.log)
// => 1 { edges: { '2': true } }
// => 2 { edges: { '3': true } }
// => 3 { edges: { '2': true } }
// => 4 { edges: {} }

// g is a plain old javascript object
g /* =>
{ '1': { '2': true },
  '2': { '3': true },
  '3': {},
  '4': {} }
*/


// rank the connectedness of nodes using a pagerank derivative
G.rank(g) /* =>
{ '1': 0.037500000000000006,
  '2': 0.25,
  '3': 0.25,
  '4': 0.037500000000000006 }
*/
G.edge(g, 3, 2)
G.rank(g) /* =>
{ '1': 0.037500000000000006,
  '2': 0.4625,
  '3': 0.25,
  '4': 0.037500000000000006 }
*/

// helper to generate a random graph
var _g = G.random(100, 100) // 100 nodes, 100 edges
```


## License

MIT

