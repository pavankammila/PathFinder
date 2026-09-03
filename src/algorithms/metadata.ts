export interface AlgorithmMetadata {
  id: string;
  name: string;
  timeComplexity: string;
  spaceComplexity: string;
  description: string;
}

export const algorithmMetadata: Record<string, AlgorithmMetadata> = {
  BFS: {
    id: 'BFS',
    name: 'Breadth-First Search',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    description: 'BFS explores a graph level by level. It finds the shortest path by the minimum number of edges (unweighted). Note: BFS finds shortest paths by number of edges, not minimum total weight.'
  },
  DIJKSTRA: {
    id: 'DIJKSTRA',
    name: 'Dijkstra',
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    description: 'Dijkstra\'s algorithm finds the shortest path between a given source node and all other reachable nodes. It guarantees the shortest path as long as there are no negative edge weights.'
  },
  BELLMAN_FORD: {
    id: 'BELLMAN_FORD',
    name: 'Bellman-Ford',
    timeComplexity: 'O(V × E)',
    spaceComplexity: 'O(V)',
    description: 'Bellman-Ford finds shortest paths from a single source vertex to all other vertices. It can handle graphs with negative edge weights and detects negative-weight cycles.'
  },
  FLOYD_WARSHALL: {
    id: 'FLOYD_WARSHALL',
    name: 'Floyd-Warshall',
    timeComplexity: 'O(V³)',
    spaceComplexity: 'O(V²)',
    description: 'The Floyd-Warshall algorithm computes shortest paths between all pairs of vertices. It dynamically tests whether a path going through an intermediate vertex is shorter.'
  },
  DAG_SHORTEST_PATH: {
    id: 'DAG_SHORTEST_PATH',
    name: 'DAG Shortest Path',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    description: 'Finds the shortest paths in a Directed Acyclic Graph (DAG) by processing vertices in topological order. Because it uses topological sorting, it easily supports negative weights.'
  },
  A_STAR: {
    id: 'A_STAR',
    name: 'A* (A-Star)',
    timeComplexity: 'Depends on heuristic',
    spaceComplexity: 'O(V)',
    description: 'A* uses a heuristic to guide the search towards the destination, making it faster than Dijkstra when an admissible spatial heuristic (like Euclidean distance) is available.'
  },
  JOHNSON: {
    id: 'JOHNSON',
    name: 'Johnson\'s Algorithm',
    timeComplexity: 'O(V² log V + VE)',
    spaceComplexity: 'O(V²)',
    description: 'Computes all-pairs shortest paths by using Bellman-Ford to find node potentials, reweighting all edges to be non-negative, and then running Dijkstra from every vertex.'
  },
  BIDIRECTIONAL: {
    id: 'BIDIRECTIONAL',
    name: 'Bidirectional Search',
    timeComplexity: 'O(b^(d/2))',
    spaceComplexity: 'O(b^(d/2))',
    description: 'Runs two simultaneous searches: one forward from the source and one backward from the destination. They meet in the middle, dramatically reducing the search space in many graphs.'
  },
  DIAL: {
    id: 'DIAL',
    name: 'Dial\'s Algorithm',
    timeComplexity: 'O(E + V × C)',
    spaceComplexity: 'O(V × C)',
    description: 'An optimization of Dijkstra\'s algorithm that uses buckets instead of a priority queue. It is extremely fast for graphs with small, non-negative integer edge weights (maximum weight C).'
  },
  SPFA: {
    id: 'SPFA',
    name: 'SPFA',
    timeComplexity: 'O(V × E)',
    spaceComplexity: 'O(V)',
    description: 'Shortest Path Faster Algorithm (SPFA) is an improvement of Bellman-Ford that uses a queue to eliminate redundant relaxations. Fast in practice, but worst-case is still O(VE).'
  }
};
