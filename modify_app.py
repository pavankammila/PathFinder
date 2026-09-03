import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Imports
# Need to import algorithm validation and metadata, CompareAlgorithmsModal
imports = """
import { AlgorithmMetadata, algorithmMetadata } from './algorithms/metadata';
import { validateAlgorithmRequirements } from './algorithms/validation';
import * as algos from './algorithms';
import { CompareAlgorithmsModal } from './components/CompareAlgorithmsModal';
"""

content = content.replace("import { runDijkstra } from './algorithms/dijkstra';\nimport { runFloydWarshall } from './algorithms/floydWarshall';\nimport { algorithmMetadata } from './algorithms/metadata';", imports)

# 2. Add compare modal state
state_declarations = "  const [isTutorOpen, setIsTutorOpen] = useState(false);\n  const [tutorQuery, setTutorQuery] = useState<string | undefined>();"
new_state = state_declarations + "\n  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);"
content = content.replace(state_declarations, new_state)

# 3. Add compare button to header
header_buttons = '<div className="flex gap-2">'
new_header_buttons = header_buttons + '\n          <button onClick={() => setIsCompareModalOpen(true)} className="px-3 py-1.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5"><Play className="w-3.5 h-3.5" /> Compare</button>'
content = content.replace(header_buttons, new_header_buttons)

# 4. Replace handlePlay contents
handlePlayPattern = re.compile(r'(const handlePlay = useCallback\(\(\) => \{).*?(if \(!sourceNodeId\))', re.DOTALL)
handlePlayReplace = r'''\1
    if (isExecutionActive) return false;
    
    \2'''
content = re.sub(handlePlayPattern, handlePlayReplace, content)

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
content = re.sub(r'let res;[\s\S]*?\} else \{[\s\S]*?runFloydWarshall.*?;[\s\S]*?\}', '', content) # Removes the old if/else for runDijkstra/runFloydWarshall

# 5. Algorithm UI Select
algo_ui_start = '<section>\n              <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter block mb-3">Algorithm</label>\n              <div className="space-y-1">'
algo_ui_end = '              </div>\n            </section>'

algo_ui_replacement = '''<section>
              <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter block mb-3">Algorithm</label>
              <div className="relative">
                <select 
                  value={algo}
                  onChange={(e) => setAlgo(e.target.value as AlgorithmType)}
                  disabled={isExecutionActive}
                  className="w-full appearance-none bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/50 rounded px-3 py-2 text-[11px] font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-900"
                >
                  {Object.values(AlgorithmType).map(a => (
                    <option key={a} value={a} className="bg-white dark:bg-zinc-900">{algorithmMetadata[a].name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </section>'''

# I will use a simple find and replace for the UI
content = re.sub(r'<section>\s*<label className="text-\[9px\] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter block mb-3">Algorithm</label>\s*<div className="space-y-1">.*?</div>\s*</section>', algo_ui_replacement, content, flags=re.DOTALL)

# 6. Add modal to JSX
modal_injection = '''
      <CompareAlgorithmsModal 
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        graph={{ nodes, edges }}
        sourceId={sourceNodeId}
        destId={destNodeId}
      />
      <AITutorPanel
'''
content = content.replace('<AITutorPanel', modal_injection)

with open('src/App.tsx', 'w') as f:
    f.write(content)

