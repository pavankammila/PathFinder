import { Graph, AlgorithmStep, OperationType, AlgorithmResult } from '../types';

export function runDial(graph: Graph, sourceId: string, destId: string | null): AlgorithmResult {
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
  
  let maxWeight = 0;
  for (const edge of graph.edges) {
    if (edge.weight < 0 || !Number.isInteger(edge.weight)) {
      return createEmptyResult('Dial\'s Algorithm requires non-negative integer edge weights.');
    }
    if (edge.weight > maxWeight) maxWeight = edge.weight;
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

  pushStep(OperationType.INITIALIZE, null, null, null, null, null, null, `Initialize Dial's algorithm. Max edge weight is ${maxWeight}.`);

  const numBuckets = (maxWeight * graph.nodes.length) + 1; // Wait, actually standard Dial's just needs W * V + 1, but we can do circular buckets of size W+1. Let's do simple buckets for simplicity since graphs here are small.
  const buckets: string[][] = [];
  
  // Safe circular bucket implementation
  const W = maxWeight + 1;
  for (let i = 0; i < W; i++) buckets.push([]);
  
  buckets[0].push(sourceId);
  let idx = 0;
  let nodesProcessed = 0;

  let destReached = false;

  while (nodesProcessed < graph.nodes.length) {
    // Find next non-empty bucket
    let found = false;
    for (let i = 0; i < W; i++) {
      if (buckets[idx].length > 0) {
        found = true;
        break;
      }
      idx = (idx + 1) % W;
    }
    if (!found) break; // All buckets empty

    const u = buckets[idx].shift()!;
    pushStep(OperationType.BUCKET_PROCESS, u, null, null, null, null, null, `Extract node ${getLabel(u)} from bucket ${idx}. Distance is ${distances[u]}.`);

    if (visited.has(u)) continue;

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
      
      const alt = distances[u] + edge.weight;
      pushStep(OperationType.RELAX_EDGE, u, edge.id, v, null, null, null, `Evaluate path through ${getLabel(u)}. Tentative distance: ${alt}.`);
      
      if (alt < distances[v]) {
        const prev = distances[v];
        if (distances[v] !== Infinity) {
          // Remove from old bucket (inefficient but works for small graphs)
          const oldBucketIdx = distances[v] % W;
          const indexInBucket = buckets[oldBucketIdx].indexOf(v);
          if (indexInBucket > -1) buckets[oldBucketIdx].splice(indexInBucket, 1);
        }

        distances[v] = alt;
        predecessors[v] = u;
        
        const newBucketIdx = alt % W;
        buckets[newBucketIdx].push(v);
        
        pushStep(OperationType.DISTANCE_UPDATE, u, edge.id, v, prev, alt, u, `Update ${getLabel(v)}: distance = ${alt}. Placed in bucket ${newBucketIdx}.`);
      }
    }
    
    visited.add(u);
    nodesProcessed++;
    pushStep(OperationType.MARK_VISITED, u, null, null, null, null, null, `Mark ${getLabel(u)} as visited.`);
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
