import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

handleRunPattern = re.compile(r'(const handleRun = useCallback\(\(\) => \{).*?(if \(!sourceNodeId\))', re.DOTALL)
handleRunReplace = r'''\1
    if (isExecutionActive) return false;
    
    \2'''
content = re.sub(handleRunPattern, handleRunReplace, content)

dijkstraCheck = re.compile(r'if \(algo === AlgorithmType.DIJKSTRA\) \{.*?\}(?=\s*let res;)', re.DOTALL)

runAlgos = """
    const validation = validateAlgorithmRequirements({nodes, edges}, algo, sourceNodeId, destNodeId);
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
"""
content = re.sub(dijkstraCheck, runAlgos, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

