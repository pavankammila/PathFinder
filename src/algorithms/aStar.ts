import { Graph, AlgorithmStep, OperationType, AlgorithmResult, Edge } from '../types';
import { MinPriorityQueue } from './PriorityQueue';

export function runAStar(graph: Graph, sourceId: string, destId: string | null, heuristicType: 'EUCLIDEAN' | 'MANHATTAN' = 'EUCLIDEAN'): AlgorithmResult {
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
  if (!destId || !nodesMap.has(destId)) return createEmptyResult('A* requires both a source and a destination.');
  
  const destNode = nodesMap.get(destId)!;

  const heuristic = (u: string) => {
    const node = nodesMap.get(u);
    if (!node) return 0;
    if (heuristicType === 'MANHATTAN') {
      return Math.abs(node.x - destNode.x) + Math.abs(node.y - destNode.y);
    }
    return Math.sqrt(Math.pow(node.x - destNode.x, 2) + Math.pow(node.y - destNode.y, 2));
  };

  const distances: Record<string, number> = {}; // g-scores
  const fScores: Record<string, number> = {};
  const predecessors: Record<string, string | null> = {};
  const visited = new Set<string>();

  for (const node of graph.nodes) {
    distances[node.id] = Infinity;
    fScores[node.id] = Infinity;
    predecessors[node.id] = null;
  }
  
  distances[sourceId] = 0;
  fScores[sourceId] = heuristic(sourceId);
  
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
      distanceSnapshot: { ...distances }, // passing g-scores
      predecessorSnapshot: { ...predecessors },
      explanationText: msg
    });
  };

  pushStep(OperationType.INITIALIZE, null, null, null, null, null, null, `Initialize A* search. Using ${heuristicType} heuristic.`);

  const pq = new MinPriorityQueue<string>();
  pq.enqueue(sourceId, fScores[sourceId]);

  let destReached = false;

  while (!pq.isEmpty()) {
    const currentQueueItem = pq.dequeue();
    if (!currentQueueItem) break;
    const u = currentQueueItem.element;

    if (visited.has(u)) continue;

    pushStep(OperationType.SELECT_NODE, u, null, null, null, null, null, `Select node ${getLabel(u)} with minimum f-score ${fScores[u].toFixed(1)} (g: ${distances[u]}, h: ${heuristic(u).toFixed(1)}).`);

    if (u === destId) {
      visited.add(u);
      pushStep(OperationType.MARK_VISITED, u, null, null, null, null, null, `Mark ${getLabel(u)} as visited.`);
      pushStep(OperationType.DESTINATION_REACHED, u, null, null, null, null, null, `Destination reached.`);
      destReached = true;
      break;
    }

    const outgoingEdges = graph.edges.filter(e => e.source === u || (!e.directed && e.target === u));
    
    for (const edge of outgoingEdges) {
      const v = edge.source === u ? edge.target : edge.source;
      if (visited.has(v)) continue;
      
      edgesExplored++;
      pushStep(OperationType.EXPLORE_EDGE, u, edge.id, v, null, null, null, `Explore edge ${getLabel(u)} → ${getLabel(v)} with weight ${edge.weight}.`);
      
      const tentativeG = distances[u] + edge.weight;
      pushStep(OperationType.RELAX_EDGE, u, edge.id, v, null, null, null, `Evaluate path through ${getLabel(u)}. Tentative g-score: ${tentativeG}.`);
      
      if (tentativeG < distances[v]) {
        const prev = distances[v];
        distances[v] = tentativeG;
        fScores[v] = tentativeG + heuristic(v);
        predecessors[v] = u;
        
        pq.enqueue(v, fScores[v]);
        pushStep(OperationType.DISTANCE_UPDATE, u, edge.id, v, prev, tentativeG, u, `Update ${getLabel(v)}: g-score = ${tentativeG.toFixed(1)}, f-score = ${fScores[v].toFixed(1)}.`);
      }
    }
    
    visited.add(u);
    pushStep(OperationType.MARK_VISITED, u, null, null, null, null, null, `Mark ${getLabel(u)} as visited.`);
  }

  let shortestPath: string[] | null = null;
  let totalCost = 0;

  if (destReached) {
    shortestPath = [];
    let curr: string | null = destId;
    while (curr !== null) {
      shortestPath.unshift(curr);
      curr = predecessors[curr];
    }
    totalCost = distances[destId];
    pushStep(OperationType.COMPLETE, null, null, null, null, null, null, `Algorithm complete. Shortest path found using A*.`);
  } else {
    pushStep(OperationType.UNREACHABLE, null, null, null, null, null, null, `Destination ${getLabel(destId)} is unreachable.`);
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
