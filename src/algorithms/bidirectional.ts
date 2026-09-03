import { Graph, AlgorithmStep, OperationType, AlgorithmResult } from '../types';
import { MinPriorityQueue } from './PriorityQueue';

export function runBidirectional(graph: Graph, sourceId: string, destId: string | null): AlgorithmResult {
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
  if (!nodesMap.has(sourceId) || !destId || !nodesMap.has(destId)) return createEmptyResult('Bidirectional search requires both source and destination.');
  if (graph.edges.some(e => e.weight < 0)) return createEmptyResult('Bidirectional search requires non-negative edge weights.');

  const fDist: Record<string, number> = {};
  const bDist: Record<string, number> = {};
  const fPred: Record<string, string | null> = {};
  const bPred: Record<string, string | null> = {};
  const fVisited = new Set<string>();
  const bVisited = new Set<string>();

  for (const node of graph.nodes) {
    fDist[node.id] = Infinity;
    bDist[node.id] = Infinity;
    fPred[node.id] = null;
    bPred[node.id] = null;
  }
  
  fDist[sourceId] = 0;
  bDist[destId] = 0;

  const getLabel = (id: string) => nodesMap.get(id)?.label || id;
  const pushStep = (op: OperationType, current: string | null, edge: string | null, updated: string | null, msg: string) => {
    steps.push({
      stepNumber: stepNumber++,
      operationType: op,
      currentNode: current,
      affectedEdge: edge,
      updatedNode: updated,
      previousDistance: null,
      newDistance: null,
      predecessor: null,
      visitedNodes: Array.from(new Set([...fVisited, ...bVisited])),
      distanceSnapshot: { ...fDist }, 
      predecessorSnapshot: { ...fPred },
      explanationText: msg
    });
  };

  pushStep(OperationType.INITIALIZE, null, null, null, `Initialize Forward Search from ${getLabel(sourceId)} and Backward Search from ${getLabel(destId)}.`);

  const fPq = new MinPriorityQueue<string>();
  const bPq = new MinPriorityQueue<string>();
  fPq.enqueue(sourceId, 0);
  bPq.enqueue(destId, 0);

  let meetingNode: string | null = null;
  let mu = Infinity;

  while (!fPq.isEmpty() && !bPq.isEmpty()) {
    const fMin = fPq.dequeue();
    const bMin = bPq.dequeue();
    
    if (!fMin || !bMin) break;

    const u = fMin.element;
    const v = bMin.element;

    if (fDist[u] + bDist[v] >= mu) {
      pushStep(OperationType.MEETING_FOUND, null, null, null, `Stopping condition met. Minimum path cost is ${mu}.`);
      break;
    }

    // Process Forward
    if (!fVisited.has(u)) {
      pushStep(OperationType.SELECT_NODE, u, null, null, `[Forward] Select node ${getLabel(u)}.`);
      const fOutgoing = graph.edges.filter(e => e.source === u || (!e.directed && e.target === u));
      for (const edge of fOutgoing) {
        const target = edge.source === u ? edge.target : edge.source;
        edgesExplored++;
        pushStep(OperationType.EXPLORE_EDGE, u, edge.id, target, `[Forward] Explore edge ${getLabel(u)} → ${getLabel(target)}.`);
        
        const alt = fDist[u] + edge.weight;
        if (alt < fDist[target]) {
          fDist[target] = alt;
          fPred[target] = u;
          fPq.enqueue(target, alt);
        }
        
        if (bVisited.has(target) && fDist[target] + bDist[target] < mu) {
          mu = fDist[target] + bDist[target];
          meetingNode = target;
          pushStep(OperationType.MEETING_FOUND, target, null, null, `[Forward] Path meeting at ${getLabel(target)} with total cost ${mu}.`);
        }
      }
      fVisited.add(u);
    }

    // Process Backward
    if (!bVisited.has(v)) {
      pushStep(OperationType.SELECT_NODE, v, null, null, `[Backward] Select node ${getLabel(v)}.`);
      const bIncoming = graph.edges.filter(e => e.target === v || (!e.directed && e.source === v));
      for (const edge of bIncoming) {
        const source = edge.target === v ? edge.source : edge.target;
        edgesExplored++;
        pushStep(OperationType.EXPLORE_EDGE, v, edge.id, source, `[Backward] Explore reverse edge ${getLabel(v)} ← ${getLabel(source)}.`);
        
        const alt = bDist[v] + edge.weight;
        if (alt < bDist[source]) {
          bDist[source] = alt;
          bPred[source] = v;
          bPq.enqueue(source, alt);
        }
        
        if (fVisited.has(source) && fDist[source] + bDist[source] < mu) {
          mu = fDist[source] + bDist[source];
          meetingNode = source;
          pushStep(OperationType.MEETING_FOUND, source, null, null, `[Backward] Path meeting at ${getLabel(source)} with total cost ${mu}.`);
        }
      }
      bVisited.add(v);
    }
  }

  let shortestPath: string[] | null = null;
  let totalCost = 0;

  if (meetingNode) {
    totalCost = mu;
    shortestPath = [];
    
    let curr: string | null = meetingNode;
    while (curr !== null) {
      shortestPath.unshift(curr);
      curr = fPred[curr];
    }
    
    curr = bPred[meetingNode];
    while (curr !== null) {
      shortestPath.push(curr);
      curr = bPred[curr];
    }
    
    pushStep(OperationType.COMPLETE, meetingNode, null, null, `Algorithm complete. Shortest path found connecting forward and backward searches.`);
  } else {
    pushStep(OperationType.UNREACHABLE, null, null, null, `Destination is unreachable from source.`);
  }

  return {
    shortestPath,
    totalCost,
    nodesVisited: new Set([...fVisited, ...bVisited]).size,
    edgesExplored,
    distances: fDist,
    predecessors: fPred,
    steps
  };
}
