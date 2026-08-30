import { Node, Edge } from '../types';

export const PRESETS: Record<string, { nodes: Node[], edges: Edge[] }> = {
  'Simple 5 Node': {
    nodes: [
      { id: 'n1', label: 'A', x: 200, y: 200 },
      { id: 'n2', label: 'B', x: 350, y: 100 },
      { id: 'n3', label: 'C', x: 350, y: 300 },
      { id: 'n4', label: 'D', x: 500, y: 150 },
      { id: 'n5', label: 'E', x: 500, y: 250 }
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', weight: 4, directed: true },
      { id: 'e2', source: 'n1', target: 'n3', weight: 2, directed: true },
      { id: 'e3', source: 'n2', target: 'n4', weight: 5, directed: true },
      { id: 'e4', source: 'n3', target: 'n2', weight: 1, directed: true },
      { id: 'e5', source: 'n3', target: 'n5', weight: 8, directed: true },
      { id: 'e6', source: 'n5', target: 'n4', weight: 2, directed: true }
    ]
  },
  'Classic Weighted': {
    nodes: [
      { id: 'n1', label: 'S', x: 150, y: 250 },
      { id: 'n2', label: 'A', x: 300, y: 150 },
      { id: 'n3', label: 'B', x: 300, y: 350 },
      { id: 'n4', label: 'C', x: 450, y: 200 },
      { id: 'n5', label: 'D', x: 450, y: 300 },
      { id: 'n6', label: 'T', x: 600, y: 250 }
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', weight: 7, directed: true },
      { id: 'e2', source: 'n1', target: 'n3', weight: 9, directed: true },
      { id: 'e3', source: 'n2', target: 'n3', weight: -2, directed: true },
      { id: 'e4', source: 'n2', target: 'n4', weight: 4, directed: true },
      { id: 'e5', source: 'n3', target: 'n5', weight: 3, directed: true },
      { id: 'e6', source: 'n4', target: 'n6', weight: 1, directed: true },
      { id: 'e7', source: 'n5', target: 'n4', weight: -3, directed: true },
      { id: 'e8', source: 'n5', target: 'n6', weight: 2, directed: true }
    ]
  },
  'Longer Route': {
    nodes: [
      { id: 'n1', label: 'A', x: 150, y: 200 },
      { id: 'n2', label: 'B', x: 300, y: 100 },
      { id: 'n3', label: 'C', x: 300, y: 300 },
      { id: 'n4', label: 'D', x: 450, y: 200 },
      { id: 'n5', label: 'E', x: 600, y: 200 }
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', weight: 10, directed: true },
      { id: 'e2', source: 'n1', target: 'n3', weight: 1, directed: true },
      { id: 'e3', source: 'n3', target: 'n4', weight: 1, directed: true },
      { id: 'e4', source: 'n4', target: 'n2', weight: 1, directed: true },
      { id: 'e5', source: 'n2', target: 'n5', weight: 1, directed: true }
    ]
  },
  'Unreachable Node': {
    nodes: [
      { id: 'n1', label: 'A', x: 200, y: 200 },
      { id: 'n2', label: 'B', x: 350, y: 200 },
      { id: 'n3', label: 'C', x: 500, y: 200 }
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', weight: 5, directed: true }
    ]
  },
  'Negative Cycle': {
    nodes: [
      { id: 'n1', label: 'A', x: 250, y: 150 },
      { id: 'n2', label: 'B', x: 400, y: 300 },
      { id: 'n3', label: 'C', x: 100, y: 300 }
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', weight: 2, directed: true },
      { id: 'e2', source: 'n2', target: 'n3', weight: -5, directed: true },
      { id: 'e3', source: 'n3', target: 'n1', weight: 1, directed: true }
    ]
  },
  'Binary Tree': {
    nodes: [
      { id: 'n1', label: 'A', x: 400, y: 100 },
      { id: 'n2', label: 'B', x: 250, y: 200 },
      { id: 'n3', label: 'C', x: 550, y: 200 },
      { id: 'n4', label: 'D', x: 150, y: 300 },
      { id: 'n5', label: 'E', x: 350, y: 300 },
      { id: 'n6', label: 'F', x: 450, y: 300 },
      { id: 'n7', label: 'G', x: 650, y: 300 }
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', weight: 2, directed: true },
      { id: 'e2', source: 'n1', target: 'n3', weight: 3, directed: true },
      { id: 'e3', source: 'n2', target: 'n4', weight: 4, directed: true },
      { id: 'e4', source: 'n2', target: 'n5', weight: 1, directed: true },
      { id: 'e5', source: 'n3', target: 'n6', weight: 5, directed: true },
      { id: 'e6', source: 'n3', target: 'n7', weight: 2, directed: true }
    ]
  },
  'Maze 3x3': {
    nodes: [
      { id: 'n1', label: '0,0', x: 200, y: 100 },
      { id: 'n2', label: '1,0', x: 350, y: 100 },
      { id: 'n3', label: '2,0', x: 500, y: 100 },
      { id: 'n4', label: '0,1', x: 200, y: 200 },
      { id: 'n5', label: '1,1', x: 350, y: 200 },
      { id: 'n6', label: '2,1', x: 500, y: 200 },
      { id: 'n7', label: '0,2', x: 200, y: 300 },
      { id: 'n8', label: '1,2', x: 350, y: 300 },
      { id: 'n9', label: '2,2', x: 500, y: 300 }
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', weight: 1, directed: false },
      { id: 'e2', source: 'n2', target: 'n3', weight: 5, directed: false },
      { id: 'e3', source: 'n1', target: 'n4', weight: 5, directed: false },
      { id: 'e4', source: 'n2', target: 'n5', weight: 1, directed: false },
      { id: 'e5', source: 'n4', target: 'n5', weight: 5, directed: false },
      { id: 'e6', source: 'n5', target: 'n6', weight: 1, directed: false },
      { id: 'e7', source: 'n3', target: 'n6', weight: 1, directed: false },
      { id: 'e8', source: 'n4', target: 'n7', weight: 1, directed: false },
      { id: 'e9', source: 'n7', target: 'n8', weight: 1, directed: false },
      { id: 'e10', source: 'n8', target: 'n9', weight: 1, directed: false },
      { id: 'e11', source: 'n6', target: 'n9', weight: 5, directed: false },
      { id: 'e12', source: 'n5', target: 'n8', weight: 5, directed: false }
    ]
  },
  'Complete Graph (K5)': {
    nodes: [
      { id: 'n1', label: 'A', x: 350, y: 100 },
      { id: 'n2', label: 'B', x: 500, y: 200 },
      { id: 'n3', label: 'C', x: 450, y: 350 },
      { id: 'n4', label: 'D', x: 250, y: 350 },
      { id: 'n5', label: 'E', x: 200, y: 200 }
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', weight: 3, directed: false },
      { id: 'e2', source: 'n1', target: 'n3', weight: 7, directed: false },
      { id: 'e3', source: 'n1', target: 'n4', weight: 4, directed: false },
      { id: 'e4', source: 'n1', target: 'n5', weight: 2, directed: false },
      { id: 'e5', source: 'n2', target: 'n3', weight: 1, directed: false },
      { id: 'e6', source: 'n2', target: 'n4', weight: 6, directed: false },
      { id: 'e7', source: 'n2', target: 'n5', weight: 5, directed: false },
      { id: 'e8', source: 'n3', target: 'n4', weight: 3, directed: false },
      { id: 'e9', source: 'n3', target: 'n5', weight: 8, directed: false },
      { id: 'e10', source: 'n4', target: 'n5', weight: 4, directed: false }
    ]
  }
};

