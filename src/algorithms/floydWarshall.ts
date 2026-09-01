import { Graph, AlgorithmStep, OperationType, Edge } from '../types';

export interface FloydWarshallResult {
  distanceMatrix: Record<string, Record<string, number>>;
  nextMatrix: Record<string, Record<string, string | null>>;
  shortestPath: string[] | null;
  totalCost: number;
  negativeCycle: boolean;
  steps: AlgorithmStep[];
  error?: string;
  nodesVisited: number;
  edgesExplored: number;
}

export function runFloydWarshall(graph: Graph, sourceId: string | null, destId: string | null): FloydWarshallResult {
  const steps: AlgorithmStep[] = [];
  let stepNumber = 1;

  const createEmptyResult = (error?: string): FloydWarshallResult => ({
    distanceMatrix: {},
    nextMatrix: {},
    shortestPath: null,
    totalCost: 0,
    negativeCycle: false,
    nodesVisited: 0,
    edgesExplored: 0,
    steps,
    ...(error ? { error } : {})
  });

  if (graph.nodes.length === 0) {
    return createEmptyResult('Graph is empty.');
  }

  const nodesMap = new Map(graph.nodes.map(n => [n.id, n]));
  
  if (sourceId && !nodesMap.has(sourceId)) {
    return createEmptyResult('Source node not found in graph.');
  }
  if (destId && !nodesMap.has(destId)) {
    return createEmptyResult('Destination node not found in graph.');
  }

  const distanceMatrix: Record<string, Record<string, number>> = {};
  const nextMatrix: Record<string, Record<string, string | null>> = {};

  const getLabel = (id: string) => nodesMap.get(id)?.label || id;

  let currentDistSnapshot: Record<string, Record<string, number>> | null = null;
  let currentNextSnapshot: Record<string, Record<string, string | null>> | null = null;

  const takeSnapshot = () => {
    const distSnap: Record<string, Record<string, number>> = {};
    const nextSnap: Record<string, Record<string, string | null>> = {};
    for (const src of Object.keys(distanceMatrix)) {
      distSnap[src] = { ...distanceMatrix[src] };
      nextSnap[src] = { ...nextMatrix[src] };
    }
    currentDistSnapshot = distSnap;
    currentNextSnapshot = nextSnap;
  };

  const pushStep = (
    op: OperationType,
    msg: string,
    current: string | null = null,
    edge: string | null = null,
    updated: string | null = null,
    prevDist: number | null = null,
    newDist: number | null = null,
    pred: string | null = null,
    matrixUpdated = false
  ) => {
    if (matrixUpdated || !currentDistSnapshot) {
      takeSnapshot();
    }

    const distanceSnapshot: Record<string, number> = {};
    const predecessorSnapshot: Record<string, string | null> = {};
    
    if (sourceId && distanceMatrix[sourceId]) {
      for (const targetId of Object.keys(distanceMatrix[sourceId])) {
        distanceSnapshot[targetId] = distanceMatrix[sourceId][targetId];
        predecessorSnapshot[targetId] = nextMatrix[sourceId][targetId];
      }
    }

    steps.push({
      stepNumber: stepNumber++,
      operationType: op,
      currentNode: current,
      affectedEdge: edge,
      updatedNode: updated,
      previousDistance: prevDist,
      newDistance: newDist,
      predecessor: pred,
      visitedNodes: [],
      distanceSnapshot,
      predecessorSnapshot,
      distanceMatrixSnapshot: currentDistSnapshot!,
      nextMatrixSnapshot: currentNextSnapshot!,
      explanationText: msg
    });
  };

  // 1. Initialize matrices
  for (const u of graph.nodes) {
    distanceMatrix[u.id] = {};
    nextMatrix[u.id] = {};
    for (const v of graph.nodes) {
      if (u.id === v.id) {
        distanceMatrix[u.id][v.id] = 0;
        nextMatrix[u.id][v.id] = u.id;
      } else {
        distanceMatrix[u.id][v.id] = Infinity;
        nextMatrix[u.id][v.id] = null;
      }
    }
  }

  // Find shortest edges between nodes to handle multi-graphs
  const edgeMap = new Map<string, Edge>();
  for (const e of graph.edges) {
    const key = `${e.source}->${e.target}`;
    if (!edgeMap.has(key) || e.weight < edgeMap.get(key)!.weight) {
      edgeMap.set(key, e);
    }
    if (!e.directed) {
      const keyRev = `${e.target}->${e.source}`;
      if (!edgeMap.has(keyRev) || e.weight < edgeMap.get(keyRev)!.weight) {
        edgeMap.set(keyRev, { ...e, source: e.target, target: e.source });
      }
    }
  }

  for (const e of edgeMap.values()) {
    distanceMatrix[e.source][e.target] = e.weight;
    nextMatrix[e.source][e.target] = e.target;
  }

  takeSnapshot();
  pushStep(
    OperationType.INITIALIZE_MATRIX,
    `Initialize distance and next matrices.`,
    null, null, null, null, null, null,
    true
  );

  const nodeIds = graph.nodes.map(n => n.id).sort((a, b) => a.localeCompare(b));

  // 2. Core Algorithm
  for (const k of nodeIds) {
    pushStep(
      OperationType.SELECT_INTERMEDIATE,
      `Select intermediate vertex ${getLabel(k)}.`,
      k
    );

    for (const i of nodeIds) {
      for (const j of nodeIds) {
        const currentDist = distanceMatrix[i][j];
        const pathThroughK = (distanceMatrix[i][k] === Infinity || distanceMatrix[k][j] === Infinity) 
          ? Infinity 
          : distanceMatrix[i][k] + distanceMatrix[k][j];

        pushStep(
          OperationType.COMPARE_PATH,
          `Compare path ${getLabel(i)} → ${getLabel(j)} with ${getLabel(i)} → ${getLabel(k)} → ${getLabel(j)}.`,
          k, null, j, currentDist, pathThroughK, i
        );

        if (pathThroughK < currentDist) {
          distanceMatrix[i][j] = pathThroughK;
          nextMatrix[i][j] = nextMatrix[i][k];
          
          pushStep(
            OperationType.UPDATE_DISTANCE,
            `Using ${getLabel(k)} as an intermediate vertex, the path ${getLabel(i)} → ${getLabel(k)} → ${getLabel(j)} is shorter than the current ${getLabel(i)} → ${getLabel(j)} distance.`,
            k, null, j, currentDist, pathThroughK, i,
            true
          );
        } else {
          pushStep(
            OperationType.NO_UPDATE,
            `Using ${getLabel(k)} as an intermediate vertex does not improve the distance from ${getLabel(i)} to ${getLabel(j)}.`,
            k, null, j, currentDist, pathThroughK, i
          );
        }
      }
    }
  }

  // 3. Negative Cycle Detection
  let negativeCycle = false;
  for (const i of nodeIds) {
    if (distanceMatrix[i][i] < 0) {
      negativeCycle = true;
      pushStep(
        OperationType.NEGATIVE_CYCLE_DETECTED,
        `Negative cycle detected at vertex ${getLabel(i)}.`
      );
      break;
    }
  }

  let shortestPath: string[] | null = null;
  let totalCost = 0;

  if (negativeCycle) {
    return {
      distanceMatrix,
      nextMatrix,
      shortestPath: null,
      totalCost: 0,
      negativeCycle: true,
      nodesVisited: nodeIds.length,
      edgesExplored: graph.edges.length,
      steps,
    };
  }

  if (sourceId && destId) {
    if (distanceMatrix[sourceId][destId] === Infinity) {
      pushStep(
        OperationType.UNREACHABLE,
        `Destination ${getLabel(destId)} is unreachable from ${getLabel(sourceId)}.`
      );
    } else {
      shortestPath = [];
      let curr: string | null = sourceId;
      while (curr !== destId) {
        shortestPath.push(curr);
        curr = nextMatrix[curr][destId];
        if (curr === null) break;
      }
      if (curr === destId) {
        shortestPath.push(curr);
        totalCost = distanceMatrix[sourceId][destId];
        pushStep(
          OperationType.COMPLETE,
          `Algorithm complete. Shortest path found.`
        );
      } else {
        shortestPath = null;
        totalCost = 0;
        pushStep(
          OperationType.UNREACHABLE,
          `Path reconstruction failed.`
        );
      }
    }
  } else {
    pushStep(
      OperationType.COMPLETE,
      `Algorithm complete. Processed all vertex pairs.`
    );
  }

  return {
    distanceMatrix,
    nextMatrix,
    shortestPath,
    totalCost,
    negativeCycle: false,
    nodesVisited: nodeIds.length,
    edgesExplored: graph.edges.length,
    steps,
  };
}
