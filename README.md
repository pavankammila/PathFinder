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

**PATHFINDER** is an interactive educational web application for constructing weighted graphs and visually exploring shortest-path algorithms.

Instead of displaying only the final answer, PATHFINDER shows how an algorithm reaches that answer through step-by-step execution, live distance updates, graph-state changes, and an execution trace.

The project is built with a focus on:

- Algorithm correctness
- Interactive graph construction
- Real-time visualization
- Step-by-step algorithm execution
- Responsive design
- Academic clarity
- Premium developer-tool inspired UI

## Features

### Interactive Graph Editor

- Create graph nodes manually
- Position nodes interactively on the canvas
- Drag and reposition individual nodes
- Connect nodes with edges
- Assign positive edge weights
- Edit graph structure
- Delete nodes and edges
- Select source and destination nodes
- Clear the workspace
- Load predefined graph presets

### Shortest Path Algorithms

#### Dijkstra's Algorithm

Used for shortest paths in weighted graphs with non-negative edge weights.

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

#### Floyd–Warshall Algorithm

Used to compute shortest paths between all pairs of vertices.

The application visualizes the progressive improvement of the distance matrix using intermediate vertices.

**Complexity**

- Time: `O(V³)`
- Space: `O(V²)`

## Visualization

PATHFINDER provides a live visualization of algorithm execution.

During execution, the interface can show:

- Current node
- Visited nodes
- Active edges
- Updated distances
- Predecessors
- Execution steps
- Final shortest path
- Total path cost
- Nodes visited
- Edges explored
- Floyd–Warshall distance matrix

## Execution Controls

The application includes:

- **Run** — animate the algorithm
- **Pause** — temporarily stop execution
- **Step** — execute one meaningful algorithm operation
- **Reset** — restore the editable graph state
- **Speed Control** — `0.5×`, `1×`, `2×`

## Graph Presets

PATHFINDER includes example graphs for quickly demonstrating the algorithms, including:

- Simple 5-node graph
- Classic weighted graph
- Longer route graph
- Unreachable-node graph

These presets are useful for classroom demonstrations and algorithm comparison.

## PATHFINDER AI

The application can include an integrated Gemini-powered educational assistant.

The AI layer is intended to explain the algorithm and current visualization state in student-friendly language.

Example questions:

- What is Dijkstra's algorithm?
- Why was this node selected?
- Why did this distance change?
- Why is this destination unreachable?
- What does this Floyd–Warshall matrix update mean?

**Important:** shortest-path calculations remain deterministic application logic. The AI is an explanation layer rather than the source of algorithm results.

## Camera Input

PATHFINDER can also provide a camera/image input workflow for future or supported graph-recognition functionality.

The camera interface is designed to support:

- Camera input
- Image capture
- Retake
- Upload
- Review/import workflow

Any graph recognition should be based on actual implemented processing rather than simulated results.

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

### Logo

<p align="center">
  <img src="assets/logo-icon.png" alt="PathFinder Icon" width="180"/>
</p>

The repository includes the original PathFinder icon and full wordmark used by the project.

## Responsive Design

PATHFINDER is designed to adapt across:

- Mobile
- Tablet
- Laptop
- Desktop

The graph visualization remains the central experience while controls and information panels adapt to smaller screens.

## Technology Stack

- **React**
- **TypeScript**
- **D3.js**
- **CSS / Responsive UI**
- **Gemini API integration** where configured

## Project Architecture

The application separates major responsibilities into logical layers:

```text
PATHFINDER
│
├── Graph State
│   ├── Nodes
│   ├── Edges
│   └── Weights
│
├── Algorithm Engine
│   ├── Dijkstra
│   └── Floyd–Warshall
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
    ├── Algorithm State
    ├── Distance / Matrix
    ├── Result
    ├── Execution Trace
    ├── Camera
    └── PATHFINDER AI
```

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

## Academic Context

This project was developed as a university-level Data Structures and Algorithms project.

### Main Topic

**Implementation of an Interactive Web App for Shortest Path Algorithm Graph Input with Visual Path Display**

### Algorithms Covered

- Dijkstra's Algorithm
- Floyd–Warshall Algorithm

The project focuses on connecting theoretical algorithm concepts with an interactive visual implementation.

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
Run / Step Through Algorithm
     ↓
Watch Graph State Change
     ↓
Inspect Distance / Matrix Updates
     ↓
View Shortest Path
```

## Educational Goal

PATHFINDER is designed to answer not only:

> "What is the shortest path?"

but also:

> "How did the algorithm find it?"

This makes the application useful for learning, demonstrations, presentations, and understanding the internal behavior of shortest-path algorithms.

## Future Improvements

Potential future improvements include:

- More graph algorithms
- Advanced graph import/export
- Improved graph recognition from images
- Additional visualization modes
- Algorithm comparison tools
- More educational examples

## License

This project is intended primarily as an academic and educational project.

---

<p align="center">
  <img src="assets/logo-icon.png" alt="PathFinder" width="80"/>
  <br/>
  <strong>PATHFINDER</strong>
  <br/>
  <sub>Shortest Path Algorithm Laboratory</sub>
</p>
