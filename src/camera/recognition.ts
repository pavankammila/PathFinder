import { RecognitionResult } from './types';
import { Node, Edge, Graph } from '../types';
import { DetectedNode, DetectedEdge } from './types';

export async function recognizeGraphFromImage(imageDataUrl: string): Promise<RecognitionResult> {
  try {
    const match = imageDataUrl.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.*)$/);
    if (!match) {
      return { status: 'ERROR', message: 'Invalid image format.' };
    }
    
    const mimeType = match[1];
    const base64Data = match[2];

    const response = await fetch('/api/ai/vision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Data, mimeType })
    });

    const data = await response.json();

    if (!response.ok) {
      return { status: 'ERROR', message: data.error || 'Failed to process image.' };
    }

    const text = data.text;
    const parsed = JSON.parse(text);

    if (!parsed.nodes || !parsed.edges) {
      return { status: 'ERROR', message: 'Model returned an invalid format.' };
    }

    const nodes: DetectedNode[] = parsed.nodes.map((n: any, index: number) => ({
      id: n.id || `n${index}`,
      label: n.label || String.fromCharCode(65 + index),
      x: typeof n.x === 'number' ? n.x : 300 + Math.random() * 200,
      y: typeof n.y === 'number' ? n.y : 300 + Math.random() * 200,
      confidence: 1
    }));

    const edges: DetectedEdge[] = parsed.edges.map((e: any, index: number) => ({
      id: `e_${Date.now()}_${index}`,
      source: e.source,
      target: e.target,
      weight: typeof e.weight === 'number' ? e.weight : 1,
      directed: e.directed === true,
      confidence: 1
    })).filter((e: Edge) => 
      nodes.some(n => n.id === e.source) && nodes.some(n => n.id === e.target)
    );

    return {
      status: 'SUCCESS',
      graph: { nodes, edges, warnings: [], confidence: 1 },
      message: 'Graph recognized successfully.'
    };
  } catch (error: any) {
    console.error('Vision API error:', error);
    return {
      status: 'ERROR',
      message: error.message || 'An unexpected error occurred during recognition.'
    };
  }
}
