import { describe, it, expect } from 'vitest';
import { runDijkstra } from './dijkstra';
import { Graph, OperationType } from '../types';

describe('Dijkstra Algorithm', () => {
  it('1. Basic shortest path', () => {
    const graph: Graph = {
      nodes: [
        { id: 'n1', label: 'A', x: 0, y: 0 },
        { id: 'n2', label: 'B', x: 0, y: 0 },
        { id: 'n3', label: 'C', x: 0, y: 0 }
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', weight: 2, directed: true },
        { id: 'e2', source: 'n2', target: 'n3', weight: 3, directed: true }
      ]
    };
    
    const result = runDijkstra(graph, 'n1', 'n3');
    expect(result.error).toBeUndefined();
    expect(result.totalCost).toBe(5);
    expect(result.shortestPath).toEqual(['n1', 'n2', 'n3']);
    expect(result.nodesVisited).toBe(3);
    expect(result.edgesExplored).toBe(2);
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.steps[result.steps.length - 1].operationType).toBe(OperationType.COMPLETE);
  });

  it('2. Multiple routes', () => {
    const graph: Graph = {
      nodes: [
        { id: 'n1', label: 'A', x: 0, y: 0 },
        { id: 'n2', label: 'B', x: 0, y: 0 },
        { id: 'n3', label: 'C', x: 0, y: 0 },
        { id: 'n4', label: 'D', x: 0, y: 0 }
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', weight: 1, directed: true },
        { id: 'e2', source: 'n2', target: 'n4', weight: 5, directed: true },
        { id: 'e3', source: 'n1', target: 'n3', weight: 2, directed: true },
        { id: 'e4', source: 'n3', target: 'n4', weight: 1, directed: true }
      ]
    };
    
    const result = runDijkstra(graph, 'n1', 'n4');
    expect(result.error).toBeUndefined();
    expect(result.totalCost).toBe(3);
    expect(result.shortestPath).toEqual(['n1', 'n3', 'n4']);
  });

  it('3. Longer indirect route', () => {
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
    
    const result = runDijkstra(graph, 'n1', 'n4');
    expect(result.error).toBeUndefined();
    expect(result.totalCost).toBe(3);
    expect(result.shortestPath).toEqual(['n1', 'n2', 'n3', 'n4']);
  });

  it('4. Unreachable destination', () => {
    const graph: Graph = {
      nodes: [
        { id: 'n1', label: 'A', x: 0, y: 0 },
        { id: 'n2', label: 'B', x: 0, y: 0 },
        { id: 'n3', label: 'C', x: 0, y: 0 }
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', weight: 2, directed: true }
      ]
    };
    
    const result = runDijkstra(graph, 'n1', 'n3');
    expect(result.error).toBeUndefined();
    expect(result.shortestPath).toBeNull();
    
    const lastStep = result.steps[result.steps.length - 1];
    expect(lastStep.operationType).toBe(OperationType.UNREACHABLE);
  });

  it('5. Source equals destination', () => {
    const graph: Graph = {
      nodes: [
        { id: 'n1', label: 'A', x: 0, y: 0 },
        { id: 'n2', label: 'B', x: 0, y: 0 }
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', weight: 2, directed: true }
      ]
    };
    
    const result = runDijkstra(graph, 'n1', 'n1');
    expect(result.error).toBeUndefined();
    expect(result.totalCost).toBe(0);
    expect(result.shortestPath).toEqual(['n1']);
  });

  it('6. Single-node graph', () => {
    const graph: Graph = {
      nodes: [
        { id: 'n1', label: 'A', x: 0, y: 0 }
      ],
      edges: []
    };
    
    const result = runDijkstra(graph, 'n1', 'n1');
    expect(result.error).toBeUndefined();
    expect(result.totalCost).toBe(0);
    expect(result.shortestPath).toEqual(['n1']);
  });

  it('7. Empty graph', () => {
    const graph: Graph = { nodes: [], edges: [] };
    const result = runDijkstra(graph, 'n1', 'n2');
    expect(result.error).toBe('Graph is empty.');
    expect(result.shortestPath).toBeNull();
  });

  it('8. Negative edge rejection', () => {
    const graph: Graph = {
      nodes: [
        { id: 'n1', label: 'A', x: 0, y: 0 },
        { id: 'n2', label: 'B', x: 0, y: 0 }
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', weight: -2, directed: true }
      ]
    };
    
    const result = runDijkstra(graph, 'n1', 'n2');
    expect(result.error).toBe('Dijkstra requires non-negative edge weights.');
    expect(result.steps.length).toBe(0);
  });

  it('9. Multiple equal-cost paths', () => {
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
    
    const result = runDijkstra(graph, 'n1', 'n4');
    expect(result.error).toBeUndefined();
    expect(result.totalCost).toBe(4);
    // Since we sort nodes lexicographically:
    // n1 -> n2 and n1 -> n3 both cost 2. n2 is chosen before n3 because 'n2' < 'n3'.
    // Then n2 goes to n4 (cost 4).
    expect(result.shortestPath).toEqual(['n1', 'n2', 'n4']);
  });
});

