import { Graph, AlgorithmStep, OperationType, AlgorithmResult } from '../types';

export function runDAGShortestPath(graph: Graph, sourceId: string, destId: string | null): AlgorithmResult {
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
  
  const isUndirected = graph.edges.some(e => !e.directed);
  if (isUndirected) return createEmptyResult('DAG Shortest Path requires a directed acyclic graph.');

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

  // Topological Sort
  pushStep(OperationType.TOPOLOGICAL_SORT, null, null, null, null, null, null, `Starting topological sort.`);
  const topoVisited = new Set<string>();
  const recursionStack = new Set<string>();
  const topoOrder: string[] = [];
  let hasCycle = false;

  const adjList = new Map<string, string[]>();
  for (const node of graph.nodes) adjList.set(node.id, []);
  for (const edge of graph.edges) {
    if (edge.directed) {
      adjList.get(edge.source)!.push(edge.target);
    }
  }

  function dfs(u: string) {
    topoVisited.add(u);
    recursionStack.add(u);

    for (const v of adjList.get(u)!) {
      if (!topoVisited.has(v)) {
        dfs(v);
      } else if (recursionStack.has(v)) {
        hasCycle = true;
      }
    }
    
    recursionStack.delete(u);
    topoOrder.push(u);
  }

  for (const node of graph.nodes) {
    if (!topoVisited.has(node.id)) {
      dfs(node.id);
    }
  }

  if (hasCycle) {
    pushStep(OperationType.ERROR, null, null, null, null, null, null, `Cycle detected! DAG Shortest Path requires an acyclic graph.`);
    return createEmptyResult('DAG Shortest Path requires an acyclic directed graph.');
  }

  topoOrder.reverse();
  pushStep(OperationType.TOPOLOGICAL_SORT, null, null, null, null, null, null, `Topological sort complete: ${topoOrder.map(getLabel).join(' → ')}`);

  // Relax edges in topological order
  for (const u of topoOrder) {
    pushStep(OperationType.PROCESS_VERTEX, u, null, null, null, null, null, `Processing node ${getLabel(u)} in topological order.`);
    
    if (distances[u] !== Infinity) {
      const outgoingEdges = graph.edges.filter(e => e.source === u);
      for (const edge of outgoingEdges) {
        const v = edge.target;
        edgesExplored++;
        visited.add(u);
        visited.add(v);

        pushStep(OperationType.EXPLORE_EDGE, u, edge.id, v, null, null, null, `Explore edge ${getLabel(u)} → ${getLabel(v)} with weight ${edge.weight}.`);
        const alt = distances[u] + edge.weight;
        
        pushStep(OperationType.RELAX_EDGE, u, edge.id, v, null, null, null, `Relax edge ${getLabel(u)} → ${getLabel(v)}. Tentative distance: ${alt}.`);
        if (alt < distances[v]) {
          const prev = distances[v];
          distances[v] = alt;
          predecessors[v] = u;
          pushStep(OperationType.DISTANCE_UPDATE, u, edge.id, v, prev, alt, u, `Distance of ${getLabel(v)} updated from ${prev === Infinity ? '∞' : prev} to ${alt}.`);
        }
      }
    }
    visited.add(u);
    pushStep(OperationType.MARK_VISITED, u, null, null, null, null, null, `Mark ${getLabel(u)} as visited.`);
  }

  let shortestPath: string[] | null = null;
  let totalCost = 0;

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
    pushStep(OperationType.COMPLETE, null, null, null, null, null, null, `Algorithm complete. Processed all nodes in topological order.`);
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
