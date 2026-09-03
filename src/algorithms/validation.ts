import { Graph, AlgorithmType } from '../types';

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export function validateAlgorithmRequirements(
  graph: Graph,
  algo: AlgorithmType | string,
  sourceId: string | null,
  destId: string | null
): ValidationResult {
  const hasNegativeWeights = graph.edges.some(e => e.weight < 0);
  const hasNonIntegerWeights = graph.edges.some(e => !Number.isInteger(e.weight));
  
  if (graph.nodes.length === 0) {
    return { valid: false, message: 'Graph is empty.' };
  }

  switch (algo) {
    case 'BFS':
    case 'DIJKSTRA':
      if (hasNegativeWeights) {
        return { valid: false, message: `${algo} requires non-negative edge weights.` };
      }
      if (!sourceId) {
        return { valid: false, message: 'Source node required.' };
      }
      break;

    case 'BELLMAN_FORD':
    case 'SPFA':
      if (!sourceId) {
        return { valid: false, message: 'Source node required.' };
      }
      break;

    case 'FLOYD_WARSHALL':
    case 'JOHNSON':
      // All pairs, no specific source needed to run, but if they want path they need source/dest
      break;

    case 'DAG_SHORTEST_PATH':
      if (!sourceId) {
        return { valid: false, message: 'Source node required.' };
      }
      // Cycle detection is done during topological sort
      const isUndirected = graph.edges.some(e => !e.directed);
      if (isUndirected) {
         return { valid: false, message: 'DAG Shortest Path requires a directed graph.' };
      }
      break;

    case 'A_STAR':
    case 'BIDIRECTIONAL':
      if (!sourceId || !destId) {
        return { valid: false, message: `${algo} requires both a source and a destination.` };
      }
      break;

    case 'DIAL':
      if (hasNegativeWeights || hasNonIntegerWeights) {
        return { valid: false, message: "Dial's Algorithm requires non-negative integer edge weights." };
      }
      if (!sourceId) {
        return { valid: false, message: 'Source node required.' };
      }
      break;
  }

  return { valid: true };
}
