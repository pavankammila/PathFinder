import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add the missing state
state_declarations = "  const [isTutorOpen, setIsTutorOpen] = useState(false);\n  const [tutorQuery, setTutorQuery] = useState<string | undefined>();"
if "isCompareModalOpen" not in content:
    content = content.replace(state_declarations, state_declarations + "\n  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);")

# Fix the handleRun
# Currently we have:
# const validation = validateAlgorithmRequirements({nodes, edges}, algo, sourceNodeId, destNodeId);
# if (!validation.valid) { ... return false; }
# if (res.error) { ...
bad_block = """    const validation = validateAlgorithmRequirements({nodes, edges}, algo, sourceNodeId, destNodeId);
    if (!validation.valid) {
      showError(`CANNOT RUN ${algorithmMetadata[algo].name}: ${validation.message}`);
      return false;
    }
    
    if (res.error) {"""

good_block = """    const validation = validateAlgorithmRequirements({nodes, edges}, algo, sourceNodeId, destNodeId);
    if (!validation.valid) {
      showError(`CANNOT RUN ${algorithmMetadata[algo].name}: ${validation.message}`);
      return false;
    }

    let res;
    switch (algo) {
      case AlgorithmType.BFS: res = algos.runBFS({ nodes, edges }, sourceNodeId, destNodeId); break;
      case AlgorithmType.DIJKSTRA: res = algos.runDijkstra({ nodes, edges }, sourceNodeId, destNodeId); break;
      case AlgorithmType.BELLMAN_FORD: res = algos.runBellmanFord({ nodes, edges }, sourceNodeId, destNodeId); break;
      case AlgorithmType.FLOYD_WARSHALL: res = algos.runFloydWarshall({ nodes, edges }, sourceNodeId, destNodeId); break;
      case AlgorithmType.DAG_SHORTEST_PATH: res = algos.runDAGShortestPath({ nodes, edges }, sourceNodeId, destNodeId); break;
      case AlgorithmType.A_STAR: res = algos.runAStar({ nodes, edges }, sourceNodeId, destNodeId); break;
      case AlgorithmType.JOHNSON: res = algos.runJohnson({ nodes, edges }); break;
      case AlgorithmType.BIDIRECTIONAL: res = algos.runBidirectional({ nodes, edges }, sourceNodeId, destNodeId); break;
      case AlgorithmType.DIAL: res = algos.runDial({ nodes, edges }, sourceNodeId, destNodeId); break;
      case AlgorithmType.SPFA: res = algos.runSPFA({ nodes, edges }, sourceNodeId, destNodeId); break;
      default: res = algos.runDijkstra({ nodes, edges }, sourceNodeId, destNodeId);
    }
    
    if (res.error) {"""

content = content.replace(bad_block, good_block)

with open('src/App.tsx', 'w') as f:
    f.write(content)
