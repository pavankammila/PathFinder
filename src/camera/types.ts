export interface DetectedNode {
  id: string;
  label: string;
  x: number;
  y: number;
  confidence: number;
}

export interface DetectedEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
  directed: boolean;
  confidence: number;
}

export interface DetectedGraph {
  nodes: DetectedNode[];
  edges: DetectedEdge[];
  warnings: string[];
  confidence: number;
}

export interface RecognitionResult {
  status: 'SUCCESS' | 'ERROR' | 'UNAVAILABLE';
  graph?: DetectedGraph;
  message?: string;
}

export interface ImagePrecheckResult {
  isValid: boolean;
  score: number;
  edgeDensity: number;
  contrast: number;
  message: string;
  warning?: string;
  details: {
    hasSufficientContrast: boolean;
    hasIdentifiableEdges: boolean;
    hasDistinctFeatures: boolean;
    isNotBlankOrSolid: boolean;
  };
}
