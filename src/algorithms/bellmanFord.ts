import { Graph, AlgorithmStep, OperationType, AlgorithmResult } from '../types';

export function runBellmanFord(graph: Graph, sourceId: string, destId: string | null): AlgorithmResult {
  const steps: AlgorithmStep[] = [];
  let stepNumber = 1;
  let edgesExplored = 0;

  const createEmptyResult = (error?: string): AlgorithmResult => ({
    shortestPath: null,
    totalCost: 0,
    nodesVisited: 0,
    edgesExplored: 0,
    distances: {},
    predecessors: {},
    steps,
    ...(error ? { error } : {})
  });

  if (graph.nodes.length === 0) return createEmptyResult('Graph is empty.');
  const nodesMap = new Map(graph.nodes.map(n => [n.id, n]));
  if (!nodesMap.has(sourceId)) return createEmptyResult('Source node not found.');
  
  const distances: Record<string, number> = {};
  const predecessors: Record<string, string | null> = {};
  const visited = new Set<string>();

  for (const node of graph.nodes) {
    distances[node.id] = Infinity;
    predecessors[node.id] = null;
  }
  
  distances[sourceId] = 0;
  
  const getLabel = (id: string) => nodesMap.get(id)?.label || id;
  const pushStep = (op: OperationType, current: string | null, edge: string | null, updated: string | null, prevDist: number | null, newDist: number | null, pred: string | null, msg: string) => {
    steps.push({
      stepNumber: stepNumber++,
      operationType: op,
      currentNode: current,
      affectedEdge: edge,
      updatedNode: updated,
      previousDistance: prevDist,
      newDistance: newDist,
      predecessor: pred,
      visitedNodes: Array.from(visited),
      distanceSnapshot: { ...distances },
      predecessorSnapshot: { ...predecessors },
      explanationText: msg
    });
  };

  pushStep(OperationType.INITIALIZE, null, null, null, null, null, null, 'Initialize source distance to 0. All other distances to Infinity.');

  const V = graph.nodes.length;
  // Convert all edges to directed for Bellman-Ford iteration
  const allEdges = graph.edges.flatMap(e => {
    if (e.directed) return [e];
    return [e, { ...e, source: e.target, target: e.source }];
  });

  let hasNegativeCycle = false;

  for (let i = 1; i <= V - 1; i++) {
    pushStep(OperationType.PHASE_START, null, null, null, null, null, null, `Starting Iteration ${i} of ${V - 1}.`);
    let updatedInIteration = false;

    for (const edge of allEdges) {
      const u = edge.source;
      const v = edge.target;
      
      if (distances[u] === Infinity) continue;
      edgesExplored++;

      visited.add(u);
      visited.add(v);

      const alt = distances[u] + edge.weight;
      pushStep(OperationType.RELAX_EDGE, u, edge.id, v, null, null, null, `Relax edge ${getLabel(u)} → ${getLabel(v)} (weight: ${edge.weight}). Tentative distance: ${alt}.`);
      
      if (alt < distances[v]) {
        const prev = distances[v];
        distances[v] = alt;
        predecessors[v] = u;
        updatedInIteration = true;
        pushStep(OperationType.DISTANCE_UPDATE, u, edge.id, v, prev, alt, u, `Distance of ${getLabel(v)} updated from ${prev === Infinity ? '∞' : prev} to ${alt}.`);
      }
    }

    if (!updatedInIteration) {
      pushStep(OperationType.PASS_COMPLETE, null, null, null, null, null, null, `No distances updated in iteration ${i}. Terminating early.`);
      break;
    }
  }

  pushStep(OperationType.NEGATIVE_CYCLE_CHECK, null, null, null, null, null, null, `Checking for negative-weight cycles...`);
  for (const edge of allEdges) {
    const u = edge.source;
    const v = edge.target;
    if (distances[u] !== Infinity && distances[u] + edge.weight < distances[v]) {
      hasNegativeCycle = true;
      pushStep(OperationType.NEGATIVE_CYCLE_DETECTED, u, edge.id, v, distances[v], distances[u] + edge.weight, null, `Negative-weight cycle detected! Edge ${getLabel(u)} → ${getLabel(v)} can still be relaxed.`);
      break;
    }
  }

  let shortestPath: string[] | null = null;
  let totalCost = 0;

  if (hasNegativeCycle) {
    pushStep(OperationType.ERROR, null, null, null, null, null, null, `Negative-weight cycle detected. Shortest path is undefined.`);
    return {
      shortestPath: null,
      totalCost: 0,
      nodesVisited: visited.size,
      edgesExplored,
      distances,
      predecessors,
      steps,
      negativeCycle: true,
      error: 'Negative-weight cycle detected. Shortest path is undefined.'
    };
  }

  if (destId) {
    if (distances[destId] === Infinity) {
      pushStep(OperationType.UNREACHABLE, null, null, null, null, null, null, `Destination ${getLabel(destId)} is unreachable.`);
    } else {
      shortestPath = [];
      let curr: string | null = destId;
      while (curr !== null) {
        shortestPath.unshift(curr);
        curr = predecessors[curr];
      }
      totalCost = distances[destId];
      pushStep(OperationType.COMPLETE, null, null, null, null, null, null, `Algorithm complete. Shortest path found.`);
    }
  } else {
    pushStep(OperationType.COMPLETE, null, null, null, null, null, null, `Algorithm complete. Processed all reachable nodes.`);
  }

  return {
    shortestPath,
    totalCost,
    nodesVisited: visited.size,
    edgesExplored,
    distances,
    predecessors,
    steps
  };
}
