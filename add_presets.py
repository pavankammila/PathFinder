import re

with open('src/utils/presets.ts', 'r') as f:
    content = f.read()

new_presets = """  'DAG (Directed Acyclic Graph)': {
    nodes: [
      { id: 'n1', label: 'S', x: 150, y: 250 },
      { id: 'n2', label: 'A', x: 300, y: 150 },
      { id: 'n3', label: 'B', x: 300, y: 350 },
      { id: 'n4', label: 'C', x: 450, y: 150 },
      { id: 'n5', label: 'D', x: 450, y: 350 },
      { id: 'n6', label: 'T', x: 600, y: 250 }
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', weight: 2, directed: true },
      { id: 'e2', source: 'n1', target: 'n3', weight: 5, directed: true },
      { id: 'e3', source: 'n2', target: 'n4', weight: 3, directed: true },
      { id: 'e4', source: 'n2', target: 'n5', weight: 1, directed: true },
      { id: 'e5', source: 'n3', target: 'n5', weight: 2, directed: true },
      { id: 'e6', source: 'n4', target: 'n6', weight: 4, directed: true },
      { id: 'e7', source: 'n5', target: 'n6', weight: 1, directed: true },
      { id: 'e8', source: 'n4', target: 'n5', weight: 1, directed: true } // ensures valid topological order
    ]
  },
  'Dijkstra Trap (Negative Edge)': {
    nodes: [
      { id: 'n1', label: 'S', x: 200, y: 250 },
      { id: 'n2', label: 'A', x: 400, y: 150 },
      { id: 'n3', label: 'B', x: 400, y: 350 },
      { id: 'n4', label: 'T', x: 600, y: 250 }
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', weight: 2, directed: true },
      { id: 'e2', source: 'n1', target: 'n3', weight: 5, directed: true },
      { id: 'e3', source: 'n2', target: 'n4', weight: 5, directed: true },
      { id: 'e4', source: 'n3', target: 'n2', weight: -4, directed: true } // Dijkstra will visit A, update T, and never check B->A
    ]
  },
  'BFS vs Weighted': {
    nodes: [
      { id: 'n1', label: 'S', x: 150, y: 250 },
      { id: 'n2', label: 'A', x: 300, y: 150 },
      { id: 'n3', label: 'B', x: 450, y: 150 },
      { id: 'n4', label: 'T', x: 600, y: 250 },
      { id: 'n5', label: 'C', x: 375, y: 350 }
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', weight: 1, directed: true },
      { id: 'e2', source: 'n2', target: 'n3', weight: 1, directed: true },
      { id: 'e3', source: 'n3', target: 'n4', weight: 1, directed: true },
      { id: 'e4', source: 'n1', target: 'n5', weight: 10, directed: true },
      { id: 'e5', source: 'n5', target: 'n4', weight: 10, directed: true }
    ]
  },
  'A* Obstacle (Heuristic Test)': {
    nodes: [
      { id: 'n1', label: 'S', x: 150, y: 250 },
      { id: 'n2', label: 'W1', x: 300, y: 150 },
      { id: 'n3', label: 'W2', x: 300, y: 250 },
      { id: 'n4', label: 'W3', x: 300, y: 350 },
      { id: 'n5', label: 'T', x: 600, y: 250 },
      { id: 'n6', label: 'U1', x: 450, y: 100 },
      { id: 'n7', label: 'D1', x: 450, y: 400 }
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', weight: 5, directed: false },
      { id: 'e2', source: 'n1', target: 'n3', weight: 3, directed: false },
      { id: 'e3', source: 'n1', target: 'n4', weight: 5, directed: false },
      { id: 'e4', source: 'n2', target: 'n6', weight: 2, directed: false },
      { id: 'e5', source: 'n6', target: 'n5', weight: 2, directed: false },
      { id: 'e6', source: 'n4', target: 'n7', weight: 2, directed: false },
      { id: 'e7', source: 'n7', target: 'n5', weight: 2, directed: false }
    ]
  },
  'Bidirectional Sweetspot': {
    nodes: [
      { id: 'n1', label: 'S', x: 100, y: 250 },
      { id: 'n2', label: 'A', x: 200, y: 250 },
      { id: 'n3', label: 'B', x: 300, y: 250 },
      { id: 'n4', label: 'M', x: 400, y: 250 },
      { id: 'n5', label: 'C', x: 500, y: 250 },
      { id: 'n6', label: 'D', x: 600, y: 250 },
      { id: 'n7', label: 'T', x: 700, y: 250 },
      { id: 'n8', label: 'W1', x: 200, y: 150 },
      { id: 'n9', label: 'W2', x: 600, y: 350 }
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', weight: 1, directed: false },
      { id: 'e2', source: 'n2', target: 'n3', weight: 1, directed: false },
      { id: 'e3', source: 'n3', target: 'n4', weight: 1, directed: false },
      { id: 'e4', source: 'n4', target: 'n5', weight: 1, directed: false },
      { id: 'e5', source: 'n5', target: 'n6', weight: 1, directed: false },
      { id: 'e6', source: 'n6', target: 'n7', weight: 1, directed: false },
      { id: 'e7', source: 'n2', target: 'n8', weight: 5, directed: false },
      { id: 'e8', source: 'n6', target: 'n9', weight: 5, directed: false }
    ]
  }
};"""

content = content.replace("};", new_presets)

with open('src/utils/presets.ts', 'w') as f:
    f.write(content)
