import { Graph, AlgorithmStep, OperationType, AlgorithmResult, Edge } from '../types';

export function runBFS(graph: Graph, sourceId: string, destId: string | null): AlgorithmResult {
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

  pushStep(OperationType.INITIALIZE, null, null, null, null, null, null, 'Initialize source distance to 0. Note: BFS finds shortest paths by number of edges, not minimum total weight.');

  const queue: string[] = [sourceId];
  visited.add(sourceId);
  pushStep(OperationType.ENQUEUE, sourceId, null, null, null, null, null, `Enqueue source node ${getLabel(sourceId)}.`);

  let destReached = false;

  while (queue.length > 0) {
    const u = queue.shift()!;
    pushStep(OperationType.DEQUEUE, u, null, null, null, null, null, `Dequeue node ${getLabel(u)}.`);
    
    pushStep(OperationType.SELECT_NODE, u, null, null, null, null, null, `Processing node ${getLabel(u)}.`);

    if (u === destId) {
      pushStep(OperationType.DESTINATION_REACHED, u, null, null, null, null, null, `Destination reached.`);
      destReached = true;
      break;
    }

    const outgoingEdges = graph.edges.filter(e => e.source === u || (!e.directed && e.target === u));
    
    for (const edge of outgoingEdges) {
      const targetId = edge.source === u ? edge.target : edge.source;
      edgesExplored++;

      pushStep(OperationType.EXPLORE_EDGE, u, edge.id, targetId, null, null, null, `Explore edge ${getLabel(u)} → ${getLabel(targetId)}.`);
      
      if (!visited.has(targetId)) {
        visited.add(targetId);
        distances[targetId] = distances[u] + 1; // Unweighted edge distance
        predecessors[targetId] = u;
        
        pushStep(OperationType.DISTANCE_UPDATE, u, edge.id, targetId, Infinity, distances[targetId], u, `Discovered ${getLabel(targetId)}. Distance updated to ${distances[targetId]} edges.`);
        
        queue.push(targetId);
        pushStep(OperationType.ENQUEUE, targetId, null, null, null, null, null, `Enqueue ${getLabel(targetId)}.`);
      }
    }
    
    pushStep(OperationType.MARK_VISITED, u, null, null, null, null, null, `Finished processing ${getLabel(u)}.`);
  }

  let shortestPath: string[] | null = null;
  let totalCost = 0;

  if (destId) {
    if (!destReached && distances[destId] === Infinity) {
      pushStep(OperationType.UNREACHABLE, null, null, null, null, null, null, `Destination ${getLabel(destId)} is unreachable.`);
    } else {
      shortestPath = [];
      let curr: string | null = destId;
      while (curr !== null) {
        shortestPath.unshift(curr);
        // Compute total weight properly for the true path cost, even though BFS ignores it for routing
        const pred = predecessors[curr];
        if (pred) {
          const edge = graph.edges.find(e => (e.source === pred && e.target === curr) || (!e.directed && e.target === pred && e.source === curr));
          if (edge) totalCost += edge.weight;
        }
        curr = pred;
      }
      pushStep(OperationType.COMPLETE, null, null, null, null, null, null, `Algorithm complete. Shortest path found by edge count.`);
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
