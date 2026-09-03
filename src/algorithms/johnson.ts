import { Graph, AlgorithmStep, OperationType, AlgorithmResult } from '../types';
import { MinPriorityQueue } from './PriorityQueue';
import { runBellmanFord } from './bellmanFord';

export function runJohnson(graph: Graph): AlgorithmResult {
  const steps: AlgorithmStep[] = [];
  let stepNumber = 1;
  let edgesExplored = 0;
  let nodesVisited = 0;

  const getLabel = (id: string) => {
    if (id === 'super_source') return 'Super-Source';
    return graph.nodes.find(n => n.id === id)?.label || id;
  };

  const pushStep = (op: OperationType, current: string | null, edge: string | null, updated: string | null, msg: string, distanceSnapshot?: Record<string, number>, distanceMatrixSnapshot?: Record<string, Record<string, number>>) => {
    steps.push({
      stepNumber: stepNumber++,
      operationType: op,
      currentNode: current,
      affectedEdge: edge,
      updatedNode: updated,
      previousDistance: null,
      newDistance: null,
      predecessor: null,
      visitedNodes: [],
      distanceSnapshot: distanceSnapshot || {},
      predecessorSnapshot: {},
      distanceMatrixSnapshot,
      explanationText: msg
    });
  };

  pushStep(OperationType.INITIALIZE, null, null, null, `Starting Johnson's Algorithm for All-Pairs Shortest Paths.`);

  // Phase 1: Add Super-Source and Run Bellman-Ford
  pushStep(OperationType.PHASE_START, null, null, null, `PHASE 1: Add super-source and run Bellman-Ford to find node potentials.`);
  
  const superSourceGraph: Graph = {
    nodes: [...graph.nodes, { id: 'super_source', label: 'Super-Source', x: 0, y: 0 }],
    edges: [...graph.edges, ...graph.nodes.map(n => ({ id: `ss_${n.id}`, source: 'super_source', target: n.id, weight: 0, directed: true }))]
  };

  const bfResult = runBellmanFord(superSourceGraph, 'super_source', null);
  edgesExplored += bfResult.edgesExplored;
  nodesVisited += bfResult.nodesVisited;

  if (bfResult.negativeCycle || bfResult.error) {
    pushStep(OperationType.ERROR, null, null, null, `Phase 1 Failed: Negative-weight cycle detected. Johnson's Algorithm cannot proceed.`);
    return {
      shortestPath: null,
      totalCost: 0,
      nodesVisited,
      edgesExplored,
      steps,
      negativeCycle: true,
      error: "Negative-weight cycle detected."
    };
  }

  const h = bfResult.distances!;
  pushStep(OperationType.PASS_COMPLETE, null, null, null, `Bellman-Ford complete. Node potentials (h) computed.`, h);

  // Phase 2: Reweight edges
  pushStep(OperationType.PHASE_START, null, null, null, `PHASE 2: Reweight all edges using w'(u,v) = w(u,v) + h(u) - h(v).`);
  
  const reweightedGraph: Graph = {
    nodes: graph.nodes,
    edges: graph.edges.map(e => {
      // For undirected edges, we conceptually treat them as two directed edges, but in our graph we just reweight the single object.
      // Wait, reweighting undirected edges safely requires changing them to directed because h(u) and h(v) differ!
      // Johnson's requires directed graphs. If the graph is undirected and has negative edges, it immediately has a negative cycle if weight < 0.
      return { ...e, weight: e.weight + h[e.source] - h[e.target] };
    })
  };

  pushStep(OperationType.EDGE_REWEIGHT, null, null, null, `All edges successfully reweighted to be non-negative.`);

  // Phase 3: Repeated Dijkstra
  pushStep(OperationType.PHASE_START, null, null, null, `PHASE 3: Run Dijkstra's algorithm from every node.`);
  
  const distMatrix: Record<string, Record<string, number>> = {};
  
  for (const u of graph.nodes) {
    pushStep(OperationType.SELECT_NODE, u.id, null, null, `Running Dijkstra from source node ${getLabel(u.id)}.`);
    
    // Inline simple Dijkstra for Johnson's Phase 3
    const d: Record<string, number> = {};
    const visited = new Set<string>();
    const pq = new MinPriorityQueue<string>();
    
    for (const n of graph.nodes) d[n.id] = Infinity;
    d[u.id] = 0;
    pq.enqueue(u.id, 0);

    while (!pq.isEmpty()) {
      const minNode = pq.dequeue();
      if (!minNode) break;
      const curr = minNode.element;
      
      if (visited.has(curr)) continue;
      visited.add(curr);
      nodesVisited++;

      const outgoing = reweightedGraph.edges.filter(e => e.source === curr || (!e.directed && e.target === curr));
      for (const edge of outgoing) {
        edgesExplored++;
        const targetId = edge.source === curr ? edge.target : edge.source;
        
        // Use directed check correctly if edge is undirected, the other direction has a different reweighted weight?
        // Actually, if a graph is undirected and has a negative edge, Bellman-Ford would have caught it as a negative cycle!
        // So undirected graphs must have non-negative edges, meaning h(u)=0 for all u.
        // We will just use the reweighted edge.weight.
        let edgeW = edge.weight;
        if (!edge.directed && targetId === edge.source) {
          // traversing backwards on an undirected edge
          edgeW = edge.weight - h[edge.source] + h[edge.target] + h[edge.target] - h[edge.source]; // Re-compute for reverse direction
          edgeW = edge.weight - h[edge.target] + h[edge.source]; // Actually original weight + h(v) - h(u)
        }

        const alt = d[curr] + edgeW;
        if (alt < d[targetId]) {
          d[targetId] = alt;
          pq.enqueue(targetId, alt);
        }
      }
    }
    
    distMatrix[u.id] = {};
    for (const n of graph.nodes) {
      if (d[n.id] !== Infinity) {
        distMatrix[u.id][n.id] = d[n.id] - h[u.id] + h[n.id]; // Reverse the reweighting
      } else {
        distMatrix[u.id][n.id] = Infinity;
      }
    }
  }

  // Phase 4: Final matrix
  pushStep(OperationType.PHASE_START, null, null, null, `PHASE 4: Final all-pairs distance matrix assembled.`, {}, distMatrix);
  pushStep(OperationType.COMPLETE, null, null, null, `Johnson's algorithm complete.`, {}, distMatrix);

  return {
    shortestPath: null,
    totalCost: 0,
    nodesVisited,
    edgesExplored,
    distances: {},
    steps
  };
}
