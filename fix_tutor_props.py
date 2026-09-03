import re

with open('src/components/AITutorPanel.tsx', 'r') as f:
    content = f.read()

content = content.replace("interface AITutorPanelProps {\n  isOpen: boolean;", "interface AITutorPanelProps {\n  isOpen: boolean;\n  currentAlgorithm: string;")
content = content.replace("export function AITutorPanel({ isOpen, onClose, buildContext, externalQuery, onExternalQueryHandled }: AITutorPanelProps) {", "export function AITutorPanel({ isOpen, onClose, buildContext, externalQuery, onExternalQueryHandled, currentAlgorithm }: AITutorPanelProps) {")

actions_code = """
  const getQuickActions = (algo: string) => {
    switch (algo) {
      case 'BFS': return ["Explain BFS", "Why is this path shortest?", "Compare BFS with Dijkstra"];
      case 'DIJKSTRA': return ["Explain this execution", "Why was this node selected?", "Why can't Dijkstra use negative weights?"];
      case 'BELLMAN_FORD': return ["Explain the relaxation", "Check for a negative cycle", "Compare Bellman-Ford with Dijkstra"];
      case 'FLOYD_WARSHALL': return ["Explain the matrix", "Why did this distance change?", "Explain the current intermediate vertex"];
      case 'DAG_SHORTEST_PATH': return ["Explain the topological order", "Why must the graph be acyclic?"];
      case 'A_STAR': return ["Explain the heuristic", "Why did A* choose this node?", "Compare A* with Dijkstra"];
      case 'JOHNSON': return ["Explain reweighting", "Why does Johnson's use Bellman-Ford?"];
      case 'BIDIRECTIONAL': return ["Explain the two searches", "Where did the searches meet?"];
      case 'DIAL': return ["Explain the buckets", "Why must weights be integers?"];
      case 'SPFA': return ["Explain the queue", "Why was this node re-added?", "Check for a negative cycle"];
      default: return ["Explain this algorithm", "Why was this node selected?"];
    }
  };

  const quickActions = getQuickActions(currentAlgorithm);
"""

content = content.replace("  const messagesEndRef = useRef<HTMLDivElement>(null);", "  const messagesEndRef = useRef<HTMLDivElement>(null);\n" + actions_code)

buttons_block = """<button onClick={() => handleSend("Explain this step")} className="bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Explain this step</button>
                <button onClick={() => handleSend("Explain Dijkstra")} className="bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Explain Dijkstra</button>"""

dynamic_buttons = """{quickActions.map(action => (
                  <button key={action} onClick={() => handleSend(action)} className="bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-left">{action}</button>
                ))}"""

content = content.replace(buttons_block, dynamic_buttons)

with open('src/components/AITutorPanel.tsx', 'w') as f:
    f.write(content)

with open('src/App.tsx', 'r') as f:
    app_content = f.read()

app_content = app_content.replace("<AITutorPanel\n        isOpen={isTutorOpen}", "<AITutorPanel\n        isOpen={isTutorOpen}\n        currentAlgorithm={algo}")

with open('src/App.tsx', 'w') as f:
    f.write(app_content)
