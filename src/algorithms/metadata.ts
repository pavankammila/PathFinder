export interface AlgorithmMetadata {
  id: string;
  name: string;
  timeComplexity: string;
  spaceComplexity: string;
  description: string;
}

export const algorithmMetadata: Record<string, AlgorithmMetadata> = {
  DIJKSTRA: {
    id: 'DIJKSTRA',
    name: 'Dijkstra',
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    description: 'Dijkstra\'s algorithm finds the shortest path between a given source node and all other reachable nodes in a graph. It greedily selects the unvisited node with the smallest tentative distance, relaxing all its outgoing edges. It guarantees the shortest path as long as there are no negative edge weights.'
  },
  FLOYD_WARSHALL: {
    id: 'FLOYD_WARSHALL',
    name: 'Floyd-Warshall',
    timeComplexity: 'O(V³)',
    spaceComplexity: 'O(V²)',
    description: 'The Floyd-Warshall algorithm computes shortest paths between all pairs of vertices in a weighted graph. It works by incrementally improving an estimate on the shortest path between two vertices, testing whether a path going through an intermediate vertex is shorter.'
  }
};
