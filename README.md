# PATHFINDER — Shortest Path Algorithm Laboratory

<p align="center">
  <img src="assets/logo-full.png" alt="PathFinder Logo" width="760"/>
</p>

<p align="center">
  <strong>Interactive graph visualization and shortest-path algorithm laboratory</strong>
</p>

<p align="center">
  A university-level Data Structures and Algorithms project designed to make graph algorithms visual, interactive, and easy to understand.
</p>

---

## Overview

**PATHFINDER** is an interactive educational web application for constructing graphs and visually exploring shortest-path algorithms.

**Live Website** - https://pathfinder-50f0.onrender.com/

Instead of displaying only the final answer, PATHFINDER shows how an algorithm reaches that answer through step-by-step execution, live distance updates, graph-state changes, and an execution trace.

The project is built with a focus on:

- Algorithm correctness
- Interactive graph construction
- Real-time visualization
- Step-by-step algorithm execution
- Responsive design
- Academic clarity
- Algorithm comparison
- Premium developer-tool inspired UI

---

## Features

### Interactive Graph Editor

- Create graph nodes manually
- Position nodes interactively on the canvas
- Drag and reposition individual nodes
- Connect nodes with edges
- Assign edge weights
- Edit graph structure
- Delete nodes and edges
- Select source and destination nodes
- Clear the workspace
- Load predefined graph presets
- Support directed and weighted graph structures
- Visualize algorithm execution directly on the graph

---

## Shortest Path Algorithms

PATHFINDER supports multiple shortest-path and graph-search algorithms, allowing users to understand how different algorithms approach the same graph problem.

### Dijkstra's Algorithm

Used for finding shortest paths in weighted graphs with non-negative edge weights.

The visualization demonstrates:

1. Distance initialization
2. Selection of the closest unvisited node
3. Neighbor exploration
4. Edge relaxation
5. Distance updates
6. Predecessor updates
7. Final shortest-path reconstruction

**Complexity**

- Time: `O((V + E) log V)`
- Space: `O(V)`

---

### Breadth-First Search (BFS)

BFS can be used to find shortest paths in unweighted graphs, where every edge is treated as having equal cost.

The visualization demonstrates:

1. Queue initialization
2. Source node exploration
3. Neighbor discovery
4. Queue operations
5. Visited-node tracking
6. Parent/predecessor updates
7. Final path reconstruction

**Complexity**

- Time: `O(V + E)`
- Space: `O(V)`

BFS can also be compared with weighted shortest-path algorithms using the **BFS vs Weighted** preset.

---

### Bellman–Ford Algorithm

Bellman–Ford computes shortest paths from a single source and can handle graphs containing negative edge weights.

The algorithm repeatedly relaxes all edges and can also detect reachable negative-weight cycles.

The visualization demonstrates:

1. Distance initialization
2. Edge-by-edge relaxation
3. Repeated relaxation passes
4. Distance updates
5. Predecessor updates
6. Negative-cycle detection
7. Final shortest-path reconstruction

**Complexity**

- Time: `O(VE)`
- Space: `O(V)`

The **Negative Cycle** preset can be used to demonstrate negative-cycle detection.

---

### Floyd–Warshall Algorithm

Floyd–Warshall computes shortest paths between all pairs of vertices.

The application visualizes the progressive improvement of the distance matrix using intermediate vertices.

The visualization demonstrates:

1. Initial distance matrix
2. Selection of intermediate vertices
3. Matrix updates
4. Shortest-distance comparisons
5. Final all-pairs shortest-path matrix

**Complexity**

- Time: `O(V³)`
- Space: `O(V²)`

---

### DAG Shortest Path

The DAG Shortest Path algorithm finds shortest paths in a Directed Acyclic Graph by processing vertices according to their topological ordering.

The visualization demonstrates:

1. Graph structure
2. Topological ordering
3. Source initialization
4. Vertex processing
5. Edge relaxation
6. Distance updates
7. Final shortest-path reconstruction

**Complexity**

- Time: `O(V + E)`
- Space: `O(V)`

The **DAG (Directed Acyclic Graph)** preset provides a ready-made example.

---

### A* Search

A* is a goal-directed graph-search algorithm that combines the cost already traveled with a heuristic estimate of the remaining distance.

The algorithm uses:

`f(n) = g(n) + h(n)`

where:

- `g(n)` = cost from the source to the current node
- `h(n)` = heuristic estimate to the destination
- `f(n)` = estimated total path cost

The visualization demonstrates:

1. Source initialization
2. Open-set exploration
3. Heuristic evaluation
4. `g(n)` cost updates
5. `h(n)` heuristic values
6. `f(n)` priority calculations
7. Path reconstruction

The **A* Obstacle (Heuristic Test)** preset provides an example for examining heuristic-guided search.

---

### Johnson's Algorithm

Johnson's algorithm is designed for finding shortest paths between all pairs of vertices in sparse weighted graphs.

It combines reweighting techniques with single-source shortest-path computation.

The algorithm can use Bellman–Ford for reweighting and Dijkstra's algorithm for the resulting non-negative edge weights.

The visualization can demonstrate:

1. Graph initialization
2. Reweighting process
3. Potential values
4. Transformed edge weights
5. Repeated single-source shortest-path computations
6. Restoration of original shortest-path distances

**Complexity**

- Time: `O(VE + V² log V)` with a binary heap implementation
- Space: `O(V²)` for storing all-pairs results

---

### Bidirectional Search

Bidirectional Search performs graph search simultaneously from the source and destination.

The two searches continue until their explored regions meet.

The visualization demonstrates:

1. Forward search initialization
2. Backward search initialization
3. Alternating frontier expansion
4. Visited-node tracking
5. Meeting-point detection
6. Path reconstruction

The **Bidirectional Sweetspot** preset provides an example for exploring the behavior of bidirectional search.

---

### Dial's Algorithm

Dial's Algorithm is a specialized shortest-path algorithm for graphs with non-negative integer edge weights within a limited range.

It uses bucket-based processing instead of a traditional priority queue.

The visualization demonstrates:

1. Distance initialization
2. Bucket creation
3. Vertex insertion into buckets
4. Minimum-distance bucket processing
5. Edge relaxation
6. Distance updates
7. Shortest-path reconstruction

Dial's Algorithm is particularly useful for demonstrating how edge-weight constraints can influence algorithm design.

---

### SPFA — Shortest Path Faster Algorithm

SPFA is a queue-based optimization of the Bellman–Ford approach.

Instead of repeatedly scanning every edge, SPFA processes vertices whose distances have recently changed.

The visualization demonstrates:

1. Queue initialization
2. Source processing
3. Neighbor relaxation
4. Queue insertion
5. Distance updates
6. Repeated vertex processing
7. Negative-cycle detection

SPFA can work with negative edge weights, provided there is no reachable negative cycle.

---

## Algorithm Comparison

PATHFINDER allows students to observe how different algorithms behave on the same graph.

Algorithms currently supported include:

| Algorithm | Graph Type | Negative Weights | Main Use |
|---|---|---:|---|
| BFS | Unweighted | No | Shortest path in unweighted graphs |
| Dijkstra | Weighted | No | Single-source shortest path |
| Bellman–Ford | Weighted | Yes | Single-source shortest path |
| Floyd–Warshall | Weighted | Yes | All-pairs shortest path |
| DAG Shortest Path | DAG | Yes | Shortest path in DAGs |
| A* | Weighted | Generally no | Goal-directed shortest path |
| Johnson's | Weighted | Yes* | All-pairs shortest path |
| Bidirectional Search | Graph | Depends on implementation | Goal-directed search |
| Dial's Algorithm | Weighted | No | Integer-weight shortest paths |
| SPFA | Weighted | Yes | Queue-based shortest path |

`*` Johnson's algorithm can handle negative edges as long as there are no negative-weight cycles.

---

## Visualization

PATHFINDER provides a live visualization of algorithm execution.

During execution, the interface can show:

- Current node
- Visited nodes
- Active edges
- Updated distances
- Predecessors
- Queue/frontier state
- Priority information
- Heuristic values for A*
- Execution steps
- Final shortest path
- Total path cost
- Nodes visited
- Edges explored
- Floyd–Warshall distance matrix
- Negative-cycle detection where applicable
- Algorithm-specific execution information

The goal is to show not only the final result, but also the internal process used to reach that result.

---

## Execution Controls

The application includes:

- **Run** — animate the algorithm
- **Pause** — temporarily stop execution
- **Step** — execute one meaningful algorithm operation
- **Reset** — restore the editable graph state
- **Speed Control** — `0.5×`, `1×`, `2×`

These controls allow students to observe an algorithm operation-by-operation rather than only watching the final result.

---

## Graph Presets

PATHFINDER includes a collection of predefined graph examples for demonstrations, testing, and algorithm comparison.

### Basic Graph Presets

- Simple 5 Node
- Classic Weighted
- Longer Route
- Unreachable Node

### Special Algorithm Presets

- Negative Cycle
- Dijkstra Trap (Negative Edge)
- BFS vs Weighted
- A* Obstacle (Heuristic Test)
- Bidirectional Sweetspot

### Graph Structure Presets

- Binary Tree
- Maze 3×3
- Complete Graph (K5)
- DAG (Directed Acyclic Graph)

These presets allow users to quickly demonstrate specific algorithm behaviors and edge cases without manually constructing every graph.

---

## Algorithm Edge Cases

PATHFINDER includes graph presets designed to demonstrate important algorithmic edge cases.

### Unreachable Node

Demonstrates how algorithms behave when the destination cannot be reached from the selected source.

### Negative Cycle

Demonstrates the presence of a negative-weight cycle and allows compatible algorithms such as Bellman–Ford and SPFA to demonstrate negative-cycle detection.

### Dijkstra Trap

Demonstrates why Dijkstra's algorithm requires non-negative edge weights.

The preset contains a negative edge that can produce behavior unsuitable for standard Dijkstra's assumptions.

### BFS vs Weighted

Demonstrates the difference between shortest path by number of edges and shortest path by total edge weight.

### A* Obstacle

Provides an environment for observing how heuristic information influences A* search.

### Bidirectional Sweetspot

Provides a graph structure suitable for observing how simultaneous forward and backward search can reduce the explored search region.

---

## PATHFINDER AI

The application can include an integrated Gemini-powered educational assistant.

The AI layer is intended to explain the algorithm and current visualization state in student-friendly language.

Example questions:

- What is Dijkstra's algorithm?
- Why was this node selected?
- Why did this distance change?
- Why did BFS choose this path?
- Why can't Dijkstra handle negative edges?
- What is a negative cycle?
- Why did Bellman–Ford continue relaxing edges?
- What does this Floyd–Warshall matrix update mean?
- How does A* choose the next node?
- What is the heuristic value?
- Why does DAG shortest path use topological ordering?
- How does Bidirectional Search work?
- What is the difference between SPFA and Bellman–Ford?
- When can Dial's Algorithm be useful?
- How does Johnson's Algorithm calculate all-pairs shortest paths?

**Important:** shortest-path calculations remain deterministic application logic. The AI is an explanation layer rather than the source of algorithm results.

---

## Camera Input

PATHFINDER can also provide a camera/image input workflow for future or supported graph-recognition functionality.

The camera interface is designed to support:

- Camera input
- Image capture
- Retake
- Upload
- Review/import workflow

Any graph recognition should be based on actual implemented processing rather than simulated results.

---

## UI & Design

The interface follows a premium technical/editorial aesthetic rather than a conventional SaaS template.

Design principles include:

- Clean typography
- Neutral surfaces
- Restrained accent colors
- Subtle gradients
- Fine borders
- Developer-tool inspired controls
- Monospace algorithm data
- Smooth but restrained animation
- Light and dark themes
- Responsive layouts
- Clear algorithm state visualization

### Logo

<p align="center">
  <img src="assets/logo-icon.png" alt="PathFinder Icon" width="180"/>
</p>

The repository includes the original PathFinder icon and full wordmark used by the project.

---

## Responsive Design

PATHFINDER is designed to adapt across:

- Mobile
- Tablet
- Laptop
- Desktop

The graph visualization remains the central experience while controls and information panels adapt to smaller screens.

---

## Technology Stack

- **React**
- **TypeScript**
- **D3.js**
- **CSS / Responsive UI**
- **Gemini API integration** where configured

---

## Project Architecture

The application separates major responsibilities into logical layers:

```text
PATHFINDER
│
├── Graph State
│   ├── Nodes
│   ├── Edges
│   ├── Weights
│   └── Graph Direction
│
├── Algorithm Engine
│   ├── BFS
│   ├── Dijkstra
│   ├── Bellman-Ford
│   ├── Floyd-Warshall
│   ├── DAG Shortest Path
│   ├── A*
│   ├── Johnson's Algorithm
│   ├── Bidirectional Search
│   ├── Dial's Algorithm
│   └── SPFA
│
├── Visualization
│   └── D3.js Graph Renderer
│
├── Execution Controller
│   ├── Run
│   ├── Pause
│   ├── Step
│   └── Reset
│
└── UI
    ├── Graph Controls
    ├── Algorithm Selection
    ├── Algorithm State
    ├── Distance / Matrix
    ├── Result
    ├── Execution Trace
    ├── Graph Presets
    ├── Camera
    └── PATHFINDER AI
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone <YOUR-GITHUB-REPOSITORY-URL>
cd pathfinder
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

### 4. Open the application

Open the local development URL shown by your terminal.

---

## Academic Context

This project was developed as a university-level Data Structures and Algorithms project.

### Main Topic

**Implementation of an Interactive Web App for Shortest Path Algorithm Graph Input with Visual Path Display**

### Algorithms Covered

- Breadth-First Search (BFS)
- Dijkstra's Algorithm
- Bellman–Ford Algorithm
- Floyd–Warshall Algorithm
- DAG Shortest Path
- A* Search
- Johnson's Algorithm
- Bidirectional Search
- Dial's Algorithm
- SPFA

The project focuses on connecting theoretical algorithm concepts with an interactive visual implementation.

---

## Example Workflow

```text
Create Nodes
     ↓
Connect Nodes
     ↓
Assign Weights
     ↓
Select Source
     ↓
Select Destination
     ↓
Choose Algorithm
     ↓
Select / Load Graph Preset
     ↓
Run / Step Through Algorithm
     ↓
Watch Graph State Change
     ↓
Inspect Distance / Matrix Updates
     ↓
Analyze Execution Trace
     ↓
View Shortest Path
```

---

## Educational Goal

PATHFINDER is designed to answer not only:

> "What is the shortest path?"

but also:

> "How did the algorithm find it?"

By providing multiple algorithms, interactive graph construction, execution controls, graph presets, and algorithm-specific visualizations, PATHFINDER helps students understand the internal behavior of graph algorithms rather than treating them as black-box solutions.

The application is designed to support:

- Classroom demonstrations
- DAA laboratory work
- Algorithm presentations
- Self-learning
- Algorithm comparison
- Understanding graph-search behavior
- Exploring algorithm edge cases

---

## Future Improvements

Potential future improvements include:

- More graph algorithms
- Advanced graph import/export
- Improved graph recognition from images
- Additional visualization modes
- Algorithm comparison tools
- More educational examples
- Advanced graph analytics
- Improved AI-assisted algorithm explanations

---

## License

This project is intended primarily as an academic and educational project.

---

<p align="center">
  <img src="assets/logo-icon.png" alt="PathFinder" width="80"/>
  <br/>
  <strong>PATHFINDER</strong>
  <br/>
  <sub>Shortest Path Algorithm Laboratory</sub>
  <br/><br/>
  <sub>Made with ❤️ by Pavan & Team</sub>
  <br/>
  <sub>Built for learning • Designed for exploration • Powered by algorithms</sub>
</p>
