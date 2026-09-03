import { Graph, AlgorithmStep, OperationType, AlgorithmResult } from '../types';

export function runSPFA(graph: Graph, sourceId: string, destId: string | null): AlgorithmResult {
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
  const visited = new Set<string>(); // Tracks actually fully processed nodes for some metrics
  const inQueue = new Set<string>();
  const enqueueCount: Record<string, number> = {};

  for (const node of graph.nodes) {
    distances[node.id] = Infinity;
    predecessors[node.id] = null;
    enqueueCount[node.id] = 0;
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

  pushStep(OperationType.INITIALIZE, null, null, null, null, null, null, `Initialize SPFA.`);

  const queue: string[] = [sourceId];
  inQueue.add(sourceId);
  enqueueCount[sourceId] = 1;
  pushStep(OperationType.ENQUEUE, sourceId, null, null, null, null, null, `Enqueue source node ${getLabel(sourceId)}.`);

  const allEdges = graph.edges.flatMap(e => {
    if (e.directed) return [e];
    return [e, { ...e, source: e.target, target: e.source }];
  });

  let hasNegativeCycle = false;

  while (queue.length > 0) {
    const u = queue.shift()!;
    inQueue.delete(u);
    visited.add(u); // mark as visited once it comes out

    pushStep(OperationType.DEQUEUE, u, null, null, null, null, null, `Dequeue node ${getLabel(u)}. Current distance: ${distances[u]}.`);
    pushStep(OperationType.SELECT_NODE, u, null, null, null, null, null, `Processing node ${getLabel(u)}.`);

    const outgoingEdges = allEdges.filter(e => e.source === u);
    
    for (const edge of outgoingEdges) {
      const v = edge.target;
      edgesExplored++;

      pushStep(OperationType.EXPLORE_EDGE, u, edge.id, v, null, null, null, `Explore edge ${getLabel(u)} → ${getLabel(v)} with weight ${edge.weight}.`);
      
      const alt = distances[u] + edge.weight;
      pushStep(OperationType.RELAX_EDGE, u, edge.id, v, null, null, null, `Evaluate path through ${getLabel(u)}. Tentative distance: ${alt}.`);
      
      if (alt < distances[v]) {
        const prev = distances[v];
        distances[v] = alt;
        predecessors[v] = u;
        
        pushStep(OperationType.DISTANCE_UPDATE, u, edge.id, v, prev, alt, u, `Distance of ${getLabel(v)} updated from ${prev === Infinity ? '∞' : prev} to ${alt}.`);
        
        if (!inQueue.has(v)) {
          queue.push(v);
          inQueue.add(v);
          enqueueCount[v]++;
          pushStep(OperationType.ENQUEUE, v, null, null, null, null, null, `Enqueue ${getLabel(v)}.`);

          if (enqueueCount[v] >= graph.nodes.length) {
            hasNegativeCycle = true;
            pushStep(OperationType.NEGATIVE_CYCLE_DETECTED, u, edge.id, v, prev, alt, u, `Negative-weight cycle detected! Node ${getLabel(v)} enqueued V times.`);
            break;
          }
        }
      }
    }
    
    if (hasNegativeCycle) break;
  }

  let shortestPath: string[] | null = null;
  let totalCost = 0;

  if (hasNegativeCycle) {
    pushStep(OperationType.ERROR, null, null, null, null, null, null, `Negative-weight cycle detected. SPFA terminated.`);
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
