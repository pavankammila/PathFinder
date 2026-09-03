export interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  weight: number;
  directed: boolean;
}

export interface Graph {
  nodes: Node[];
  edges: Edge[];
}

export enum AlgorithmType {
  BFS = 'BFS',
  DIJKSTRA = 'DIJKSTRA',
  BELLMAN_FORD = 'BELLMAN_FORD',
  FLOYD_WARSHALL = 'FLOYD_WARSHALL',
  DAG_SHORTEST_PATH = 'DAG_SHORTEST_PATH',
  A_STAR = 'A_STAR',
  JOHNSON = 'JOHNSON',
  BIDIRECTIONAL = 'BIDIRECTIONAL',
  DIAL = 'DIAL',
  SPFA = 'SPFA'
}

export interface AlgorithmResult {
  shortestPath: string[] | null;
  totalCost: number;
  nodesVisited: number;
  edgesExplored: number;
  distances?: Record<string, number>;
  predecessors?: Record<string, string | null>;
  steps: AlgorithmStep[];
  error?: string;
  negativeCycle?: boolean;
}

export enum Algorithm {
  DIJKSTRA = 'DIJKSTRA',
  A_STAR = 'A_STAR',
  BELLMAN_FORD = 'BELLMAN_FORD',
  FLOYD_WARSHALL = 'FLOYD_WARSHALL',
}

export enum OperationType {
  INITIALIZE = 'INITIALIZE',
  SELECT_NODE = 'SELECT_NODE',
  EXPLORE_EDGE = 'EXPLORE_EDGE',
  RELAX_EDGE = 'RELAX_EDGE',
  DISTANCE_UPDATE = 'DISTANCE_UPDATE',
  MARK_VISITED = 'MARK_VISITED',
  DESTINATION_REACHED = 'DESTINATION_REACHED',
  COMPLETE = 'COMPLETE',
  UNREACHABLE = 'UNREACHABLE',
  ERROR = 'ERROR',
  ENQUEUE = 'ENQUEUE',
  DEQUEUE = 'DEQUEUE',
  DISCOVER_NODE = 'DISCOVER_NODE',
  PASS_COMPLETE = 'PASS_COMPLETE',
  NEGATIVE_CYCLE_CHECK = 'NEGATIVE_CYCLE_CHECK',
  NEGATIVE_CYCLE_DETECTED = 'NEGATIVE_CYCLE_DETECTED',
  INITIALIZE_MATRIX = 'INITIALIZE_MATRIX',
  SELECT_INTERMEDIATE = 'SELECT_INTERMEDIATE',
  COMPARE_PATH = 'COMPARE_PATH',
  UPDATE_DISTANCE = 'UPDATE_DISTANCE',
  NO_UPDATE = 'NO_UPDATE',
  HEURISTIC_UPDATE = 'HEURISTIC_UPDATE',
  MEETING_FOUND = 'MEETING_FOUND',
  TOPOLOGICAL_SORT = 'TOPOLOGICAL_SORT',
  PROCESS_VERTEX = 'PROCESS_VERTEX',
  BUCKET_PROCESS = 'BUCKET_PROCESS',
  PHASE_START = 'PHASE_START',
  EDGE_REWEIGHT = 'EDGE_REWEIGHT',
}

export interface AlgorithmStep {
  stepNumber: number;
  operationType: OperationType;
  currentNode: string | null;
  affectedEdge: string | null;
  updatedNode: string | null;
  previousDistance: number | null;
  newDistance: number | null;
  predecessor: string | null;
  visitedNodes: string[];
  distanceSnapshot: Record<string, number>;
  predecessorSnapshot: Record<string, string | null>;
  distanceMatrixSnapshot?: Record<string, Record<string, number>>;
  nextMatrixSnapshot?: Record<string, Record<string, string | null>>;
  explanationText: string;
}

export enum ExecutionStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface AlgorithmState {
  algorithm: Algorithm;
  status: ExecutionStatus;
  currentStepIndex: number;
  steps: AlgorithmStep[];
}

export interface GraphPreset {
  id: string;
  name: string;
  description: string;
  graph: Graph;
}
