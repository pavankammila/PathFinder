import re
import os

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# buildContext function
buildContext = """  const buildTutorContext = useCallback(() => {
    return {
      algorithm: algo,
      source: nodes.find(n => n.id === sourceNodeId)?.label || null,
      destination: nodes.find(n => n.id === destNodeId)?.label || null,
      graph: {
        nodes: nodes.map(n => n.label),
        edges: edges.map(e => ({
          source: nodes.find(n => n.id === e.source)?.label,
          target: nodes.find(n => n.id === e.target)?.label,
          weight: e.weight,
          directed: e.directed
        }))
      },
      currentStep: currentStepIndex,
      algorithmState: execState,
      currentDistances: algo === AlgorithmType.DIJKSTRA 
        ? Object.fromEntries(nodes.map(n => [n.label, currentStep?.distanceSnapshot?.[n.id] ?? '∞']))
        : currentStep?.distanceMatrixSnapshot,
      currentPredecessors: algo === AlgorithmType.DIJKSTRA 
        ? Object.fromEntries(nodes.map(n => [n.label, nodes.find(p => p.id === currentStep?.predecessorSnapshot?.[n.id])?.label || null]))
        : currentStep?.predecessorMatrixSnapshot,
      traceStep: currentStep?.message,
      result: algoResult
    };
  }, [algo, nodes, edges, sourceNodeId, destNodeId, currentStepIndex, execState, currentStep, algoResult]);"""

content = content.replace('  const handleModeSelect = (newMode: EditorMode) => {', buildContext + '\n\n  const handleModeSelect = (newMode: EditorMode) => {')

# Add AI button to floating action bar
old_actions = """              <button className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-500 dark:text-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:outline-none transition-colors" title="Settings">
                <Settings2 className="w-3.5 h-3.5" />
              </button>"""

new_actions = """              <button onClick={() => setIsTutorOpen(!isTutorOpen)} className={`p-1.5 rounded-full focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:outline-none transition-colors flex items-center gap-1.5 pl-2 ${isTutorOpen ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`} title="PATHFINDER AI">
                <Bot className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold tracking-widest uppercase leading-none mr-1">AI</span>
              </button>
              <button className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-500 dark:text-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:outline-none transition-colors" title="Settings">
                <Settings2 className="w-3.5 h-3.5" />
              </button>"""
content = content.replace(old_actions, new_actions)

# Add AI panel
old_panel = """      <CameraModal 
        isOpen={isCameraModalOpen} 
        onClose={() => setIsCameraModalOpen(false)} 
      />"""

new_panel = """      <CameraModal 
        isOpen={isCameraModalOpen} 
        onClose={() => setIsCameraModalOpen(false)} 
      />
      <AITutorPanel
        isOpen={isTutorOpen}
        onClose={() => setIsTutorOpen(false)}
        buildContext={buildTutorContext}
      />"""
content = content.replace(old_panel, new_panel)

with open(filepath, 'w') as f:
    f.write(content)

