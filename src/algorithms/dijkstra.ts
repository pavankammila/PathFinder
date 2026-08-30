import { Graph, AlgorithmStep, OperationType, Edge } from '../types';

export interface DijkstraResult {
  shortestPath: string[] | null;
  totalCost: number;
  nodesVisited: number;
  edgesExplored: number;
  distances: Record<string, number>;
  predecessors: Record<string, string | null>;
  steps: AlgorithmStep[];
  error?: string;
}

export function runDijkstra(graph: Graph, sourceId: string, destId: string | null): DijkstraResult {
  const steps: AlgorithmStep[] = [];
  let stepNumber = 1;
  let edgesExplored = 0;
  
  const createEmptyResult = (error?: string): DijkstraResult => ({
    shortestPath: null,
    totalCost: 0,
    nodesVisited: 0,
    edgesExplored: 0,
    distances: {},
    predecessors: {},
    steps,
    ...(error ? { error } : {})
  });

  if (graph.nodes.length === 0) {
    return createEmptyResult('Graph is empty.');
  }
  
  const hasNegativeWeight = graph.edges.some(e => e.weight < 0);
  if (hasNegativeWeight) {
    return createEmptyResult('Dijkstra requires non-negative edge weights.');
  }

  const nodesMap = new Map(graph.nodes.map(n => [n.id, n]));
  if (!nodesMap.has(sourceId)) {
    return createEmptyResult('Source node not found in graph.');
  }
  if (destId && !nodesMap.has(destId)) {
    return createEmptyResult('Destination node not found in graph.');
  }

  const distances: Record<string, number> = {};
  const predecessors: Record<string, string | null> = {};
  const visited = new Set<string>();

  for (const node of graph.nodes) {
    distances[node.id] = Infinity;
    predecessors[node.id] = null;
  }
  distances[sourceId] = 0;

  const getLabel = (id: string) => nodesMap.get(id)?.label || id;

  const pushStep = (
    op: OperationType,
    current: string | null,
    edge: string | null,
    updated: string | null,
    prevDist: number | null,
    newDist: number | null,
    pred: string | null,
    msg: string
  ) => {
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

  pushStep(
    OperationType.INITIALIZE, 
    null, null, null, null, null, null, 
    `Initialize source distance to 0.`
  );

  while (visited.size < graph.nodes.length) {
    const unvisitedNodes = graph.nodes.filter(n => !visited.has(n.id));
    unvisitedNodes.sort((a, b) => {
      const distA = distances[a.id];
      const distB = distances[b.id];
      
      if (distA !== distB) {
        return distA < distB ? -1 : 1;
      }
      return a.id.localeCompare(b.id);
    });

    let minDist = Infinity;
    let u: string | null = null;

    if (unvisitedNodes.length > 0 && distances[unvisitedNodes[0].id] !== Infinity) {
      u = unvisitedNodes[0].id;
      minDist = distances[u];
    }

    if (u === null) {
      // Remaining nodes are unreachable.
      break;
    }

    pushStep(
      OperationType.SELECT_NODE, 
      u, null, null, null, null, null,
      `Select node ${getLabel(u)} with minimum tentative distance ${minDist === Infinity ? '∞' : minDist}.`
    );

    if (u === destId) {
      visited.add(u);
      pushStep(
        OperationType.MARK_VISITED,
        u, null, null, null, null, null,
        `Mark ${getLabel(u)} as visited.`
      );
      pushStep(
        OperationType.DESTINATION_REACHED,
        u, null, null, null, null, null,
        `Destination reached.`
      );
      break;
    }

    const outgoingEdges = graph.edges.filter(e => 
      e.source === u || (!e.directed && e.target === u)
    );

    // Keep only the shortest edge to each target to prevent duplicate edge issues.
    const edgeMap = new Map<string, Edge>();
    for (const e of outgoingEdges) {
      const targetId = e.source === u ? e.target : e.source;
      if (!edgeMap.has(targetId) || e.weight < edgeMap.get(targetId)!.weight) {
        edgeMap.set(targetId, e);
      }
    }

    const sortedTargets = Array.from(edgeMap.keys()).sort((a, b) => a.localeCompare(b));

    for (const targetId of sortedTargets) {
      if (visited.has(targetId)) continue;
      const edge = edgeMap.get(targetId)!;
      
      edgesExplored++;
      pushStep(
        OperationType.EXPLORE_EDGE,
        u, edge.id, targetId, null, null, null,
        `Explore edge ${getLabel(u)} → ${getLabel(targetId)} with weight ${edge.weight}.`
      );

      const alt = distances[u] + edge.weight;
      pushStep(
        OperationType.RELAX_EDGE,
        u, edge.id, targetId, null, null, null,
        `Relax edge ${getLabel(u)} → ${getLabel(targetId)}. Tentative distance is ${distances[u]} + ${edge.weight} = ${alt}.`
      );

      if (alt < distances[targetId]) {
        const prev = distances[targetId];
        distances[targetId] = alt;
        predecessors[targetId] = u;
        
        pushStep(
          OperationType.DISTANCE_UPDATE,
          u, edge.id, targetId, prev, alt, u,
          `Distance of ${getLabel(targetId)} updated from ${prev === Infinity ? '∞' : prev} to ${alt}.`
        );
      }
    }

    visited.add(u);
    pushStep(
      OperationType.MARK_VISITED,
      u, null, null, null, null, null,
      `Mark ${getLabel(u)} as visited.`
    );
  }

  let shortestPath: string[] | null = null;
  let totalCost = 0;

  if (destId) {
    if (distances[destId] === Infinity) {
      pushStep(
        OperationType.UNREACHABLE,
        null, null, null, null, null, null,
        `Destination ${getLabel(destId)} is unreachable.`
      );
    } else {
      shortestPath = [];
      let curr: string | null = destId;
      while (curr !== null) {
        shortestPath.unshift(curr);
        curr = predecessors[curr];
      }
      totalCost = distances[destId];
      pushStep(
        OperationType.COMPLETE,
        null, null, null, null, null, null,
        `Algorithm complete. Shortest path found.`
      );
    }
  } else {
    pushStep(
      OperationType.COMPLETE,
      null, null, null, null, null, null,
      `Algorithm complete. Processed all reachable nodes.`
    );
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
