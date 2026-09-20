import { RecognitionResult } from './types';
import { Node, Edge, Graph } from '../types';
import { DetectedNode, DetectedEdge } from './types';

export async function recognizeGraphFromImage(imageDataUrl: string): Promise<RecognitionResult> {
  try {
    const match = imageDataUrl.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.*)$/);
    if (!match) {
      return { status: 'ERROR', message: 'Invalid image format. Please capture or upload a valid image.' };
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
      return { status: 'ERROR', message: data.error || 'Failed to analyze image.' };
    }

    let text = data.text;
    if (typeof text === 'string') {
      text = text.trim();
      if (text.startsWith('```')) {
        text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      }
    }

    const parsed = typeof text === 'string' ? JSON.parse(text) : text;

    if (!parsed || !Array.isArray(parsed.nodes)) {
      return { status: 'ERROR', message: 'The vision model did not return any graph vertices.' };
    }

    if (parsed.nodes.length === 0) {
      return { 
        status: 'ERROR', 
        message: 'No graph nodes could be detected in this photo. Please ensure nodes (circles with labels) and connecting lines are clearly visible.' 
      };
    }

    // Process nodes with unique IDs and clean labels
    const rawNodes: DetectedNode[] = parsed.nodes.map((n: any, index: number) => {
      const rawId = (n.id || `n${index + 1}`).toString().trim();
      const rawLabel = (n.label || String.fromCharCode(65 + index)).toString().trim();
      return {
        id: rawId || `n${index + 1}`,
        label: rawLabel || String.fromCharCode(65 + index),
        x: typeof n.x === 'number' && !isNaN(n.x) ? n.x : 150 + (index % 4) * 160,
        y: typeof n.y === 'number' && !isNaN(n.y) ? n.y : 120 + Math.floor(index / 4) * 140,
        confidence: 0.95
      };
    });

    // Ensure unique node IDs and unique labels
    const seenIds = new Set<string>();
    const seenLabels = new Set<string>();
    const nodes: DetectedNode[] = rawNodes.map((n, i) => {
      let id = n.id;
      if (seenIds.has(id)) {
        id = `${id}_${i + 1}`;
      }
      seenIds.add(id);

      let label = n.label;
      if (seenLabels.has(label)) {
        label = `${label}${i + 1}`;
      }
      seenLabels.add(label);

      return { ...n, id, label };
    });

    // Normalize coordinates so the graph is centered and fits canvas bounds nicely (x: 120-720, y: 100-480)
    if (nodes.length > 1) {
      const minX = Math.min(...nodes.map(n => n.x));
      const maxX = Math.max(...nodes.map(n => n.x));
      const minY = Math.min(...nodes.map(n => n.y));
      const maxY = Math.max(...nodes.map(n => n.y));

      const spanX = maxX - minX;
      const spanY = maxY - minY;

      const targetMinX = 140;
      const targetMaxX = 720;
      const targetMinY = 100;
      const targetMaxY = 460;

      nodes.forEach(n => {
        if (spanX > 20) {
          n.x = Math.round(targetMinX + ((n.x - minX) / spanX) * (targetMaxX - targetMinX));
        } else {
          n.x = 420;
        }
        if (spanY > 20) {
          n.y = Math.round(targetMinY + ((n.y - minY) / spanY) * (targetMaxY - targetMinY));
        } else {
          n.y = 280;
        }
      });
    } else if (nodes.length === 1) {
      nodes[0].x = 400;
      nodes[0].y = 260;
    }

    // Node lookup helper to resolve source/target by id or label
    const findNodeId = (ref: any): string | null => {
      if (ref === undefined || ref === null) return null;
      const str = String(ref).trim();
      const byId = nodes.find(n => n.id === str);
      if (byId) return byId.id;
      const byIdLower = nodes.find(n => n.id.toLowerCase() === str.toLowerCase());
      if (byIdLower) return byIdLower.id;
      const byLabel = nodes.find(n => n.label.toLowerCase() === str.toLowerCase());
      if (byLabel) return byLabel.id;
      const num = parseInt(str, 10);
      if (!isNaN(num) && nodes[num]) return nodes[num].id;
      return null;
    };

    const warnings: string[] = [];
    const edgeKeySet = new Set<string>();

    const edges: DetectedEdge[] = (Array.isArray(parsed.edges) ? parsed.edges : [])
      .map((e: any, index: number) => {
        const sourceId = findNodeId(e.source);
        const targetId = findNodeId(e.target);
        if (!sourceId || !targetId) {
          return null;
        }
        if (sourceId === targetId) {
          // Self-loop
          return null;
        }

        const directed = e.directed === true;
        const key = directed ? `${sourceId}->${targetId}` : [sourceId, targetId].sort().join('--');
        if (edgeKeySet.has(key)) {
          return null; // Duplicate edge in extraction
        }
        edgeKeySet.add(key);

        let weight = typeof e.weight === 'number' && !isNaN(e.weight) ? e.weight : parseFloat(e.weight);
        if (isNaN(weight) || weight <= 0) {
          weight = 1;
        }

        return {
          id: `e_${Date.now()}_${index}`,
          source: sourceId,
          target: targetId,
          weight: Math.round(weight * 10) / 10,
          directed,
          confidence: 0.95
        };
      })
      .filter((e): e is DetectedEdge => e !== null);

    if (edges.length === 0 && nodes.length > 1) {
      warnings.push("No connecting edges were identified automatically. You can add edges manually in the review screen.");
    }

    return {
      status: 'SUCCESS',
      graph: { nodes, edges, warnings, confidence: 0.95 },
      message: `Detected ${nodes.length} nodes and ${edges.length} edges successfully.`
    };
  } catch (error: any) {
    console.error('Vision API error:', error);
    return {
      status: 'ERROR',
      message: error.message || 'An unexpected error occurred during recognition.'
    };
  }
}
