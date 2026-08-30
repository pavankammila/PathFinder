import { describe, it, expect } from 'vitest';
import { runFloydWarshall } from './floydWarshall';
import { Graph, OperationType } from '../types';

describe('Floyd-Warshall Algorithm', () => {
  it('1. Simple weighted graph', () => {
    const graph: Graph = {
      nodes: [
        { id: 'n1', label: 'A', x: 0, y: 0 },
        { id: 'n2', label: 'B', x: 0, y: 0 },
        { id: 'n3', label: 'C', x: 0, y: 0 }
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', weight: 1, directed: true },
        { id: 'e2', source: 'n2', target: 'n3', weight: 2, directed: true }
      ]
    };
    
    const result = runFloydWarshall(graph, 'n1', 'n3');
    expect(result.error).toBeUndefined();
    expect(result.negativeCycle).toBe(false);
    expect(result.totalCost).toBe(3);
    expect(result.shortestPath).toEqual(['n1', 'n2', 'n3']);
    expect(result.distanceMatrix['n1']['n3']).toBe(3);
  });

  it('2. Multiple routes', () => {
    const graph: Graph = {
      nodes: [
        { id: 'n1', label: 'A', x: 0, y: 0 },
        { id: 'n2', label: 'B', x: 0, y: 0 },
        { id: 'n3', label: 'C', x: 0, y: 0 }
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n3', weight: 10, directed: true },
        { id: 'e2', source: 'n1', target: 'n2', weight: 1, directed: true },
        { id: 'e3', source: 'n2', target: 'n3', weight: 2, directed: true }
      ]
    };
    
    const result = runFloydWarshall(graph, 'n1', 'n3');
    expect(result.totalCost).toBe(3);
    expect(result.shortestPath).toEqual(['n1', 'n2', 'n3']);
  });

  it('3. Shorter route through an intermediate vertex', () => {
    const graph: Graph = {
      nodes: [
        { id: 'n1', label: 'A', x: 0, y: 0 },
        { id: 'n2', label: 'B', x: 0, y: 0 },
        { id: 'n3', label: 'C', x: 0, y: 0 },
        { id: 'n4', label: 'D', x: 0, y: 0 }
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n4', weight: 10, directed: true },
        { id: 'e2', source: 'n1', target: 'n2', weight: 1, directed: true },
        { id: 'e3', source: 'n2', target: 'n3', weight: 1, directed: true },
        { id: 'e4', source: 'n3', target: 'n4', weight: 1, directed: true }
      ]
    };
    const result = runFloydWarshall(graph, 'n1', 'n4');
    expect(result.totalCost).toBe(3);
    expect(result.shortestPath).toEqual(['n1', 'n2', 'n3', 'n4']);
  });

  it('4. Unreachable vertices', () => {
    const graph: Graph = {
      nodes: [
        { id: 'n1', label: 'A', x: 0, y: 0 },
        { id: 'n2', label: 'B', x: 0, y: 0 }
      ],
      edges: []
    };
    
    const result = runFloydWarshall(graph, 'n1', 'n2');
    expect(result.shortestPath).toBeNull();
    expect(result.distanceMatrix['n1']['n2']).toBe(Infinity);
  });

  it('5. Single-node graph', () => {
    const graph: Graph = {
      nodes: [
        { id: 'n1', label: 'A', x: 0, y: 0 }
      ],
      edges: []
    };
    
    const result = runFloydWarshall(graph, 'n1', 'n1');
    expect(result.totalCost).toBe(0);
    expect(result.shortestPath).toEqual(['n1']);
  });

  it('6. Empty graph', () => {
    const result = runFloydWarshall({ nodes: [], edges: [] }, 'n1', 'n2');
    expect(result.error).toBe('Graph is empty.');
  });

  it('7. Negative edge', () => {
    const graph: Graph = {
      nodes: [
        { id: 'n1', label: 'A', x: 0, y: 0 },
        { id: 'n2', label: 'B', x: 0, y: 0 }
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', weight: -5, directed: true }
      ]
    };
    
    const result = runFloydWarshall(graph, 'n1', 'n2');
    expect(result.negativeCycle).toBe(false);
    expect(result.totalCost).toBe(-5);
    expect(result.shortestPath).toEqual(['n1', 'n2']);
  });

  it('8. Negative cycle', () => {
    const graph: Graph = {
      nodes: [
        { id: 'n1', label: 'A', x: 0, y: 0 },
        { id: 'n2', label: 'B', x: 0, y: 0 },
        { id: 'n3', label: 'C', x: 0, y: 0 }
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', weight: 1, directed: true },
        { id: 'e2', source: 'n2', target: 'n3', weight: -5, directed: true },
        { id: 'e3', source: 'n3', target: 'n1', weight: 2, directed: true }
      ]
    };
    
    const result = runFloydWarshall(graph, 'n1', 'n3');
    expect(result.negativeCycle).toBe(true);
    expect(result.shortestPath).toBeNull();
  });

  it('9. Source-to-destination path reconstruction', () => {
    const graph: Graph = {
      nodes: [
        { id: 'n1', label: 'A', x: 0, y: 0 },
        { id: 'n2', label: 'B', x: 0, y: 0 },
        { id: 'n3', label: 'C', x: 0, y: 0 },
        { id: 'n4', label: 'D', x: 0, y: 0 }
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', weight: 2, directed: true },
        { id: 'e2', source: 'n2', target: 'n4', weight: 2, directed: true },
        { id: 'e3', source: 'n1', target: 'n3', weight: 2, directed: true },
        { id: 'e4', source: 'n3', target: 'n4', weight: 2, directed: true }
      ]
    };
    const result = runFloydWarshall(graph, 'n1', 'n4');
    expect(result.totalCost).toBe(4);
    // Path should reconstruct deterministically depending on node sorting
    expect(result.shortestPath?.length).toBe(3);
  });
});
