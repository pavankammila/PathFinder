import re

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Imports
content = content.replace(
    "Eraser, Bot, PanelLeftClose, PanelRightClose, PanelLeftOpen, PanelRightOpen",
    "Eraser, Bot, PanelLeftClose, PanelRightClose, PanelLeftOpen, PanelRightOpen, Undo2, Redo2"
)

# 2. State
old_state = "  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);"
new_state = """  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

  // Undo/Redo State
  const [past, setPast] = useState<{nodes: Node[], edges: Edge[]}[]>([]);
  const [future, setFuture] = useState<{nodes: Node[], edges: Edge[]}[]>([]);

  const saveHistory = useCallback((currentNodes: Node[], currentEdges: Edge[]) => {
    setPast(prev => [...prev, { nodes: [...currentNodes], edges: [...currentEdges] }]);
    setFuture([]);
  }, []);

  const handleUndo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setPast(prev => prev.slice(0, prev.length - 1));
    setFuture(prev => [{ nodes, edges }, ...prev]);
    setNodes(previous.nodes);
    setEdges(previous.edges);
    clearExecutionState();
  }, [past, nodes, edges]);

  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture(prev => prev.slice(1));
    setPast(prev => [...prev, { nodes, edges }]);
    setNodes(next.nodes);
    setEdges(next.edges);
    clearExecutionState();
  }, [future, nodes, edges]);"""
content = content.replace(old_state, new_state)

# 3. Inject saveHistory() into modifying functions
# handleAddNode
content = re.sub(
    r'(const label = getNextNodeLabel\(nodes\.map\(n => n\.label\)\);)',
    r'saveHistory(nodes, edges);\n      \1',
    content
)

# handleNodeDoubleClick
content = re.sub(
    r'(const newLabel = prompt\("Enter new label for node:", nodeToEdit\.label\);.*?if \(newLabel !== null && newLabel\.trim\(\) !== ""\) \{)',
    r'\1\n          saveHistory(nodes, edges);',
    content,
    flags=re.DOTALL
)

# handleNodeClick (Delete Node)
content = re.sub(
    r'(case EditorMode\.DELETE:\n\s*)(setNodes\(prev => prev\.filter\(n => n\.id !== nodeId\)\);)',
    r'\1saveHistory(nodes, edges);\n        \2',
    content
)

# handleEdgeClick (Delete Edge)
content = re.sub(
    r'(if \(mode === EditorMode\.DELETE\) \{)',
    r'\1\n      saveHistory(nodes, edges);',
    content
)

# handleNodeMove
content = re.sub(
    r'(const handleNodeMove = useCallback\(\(nodeId: string, x: number, y: number\) => \{\n)',
    r'\1    saveHistory(nodes, edges);\n',
    content
)

# handleCreateEdge
content = re.sub(
    r'(const newEdge: Edge = \{\n\s*id: `e_\$\{Date\.now\(\)\}`,\n\s*source: pendingEdge\.sourceId,\n\s*target: pendingEdge\.targetId,\n\s*weight\n\s*\};\n)',
    r'\1    saveHistory(nodes, edges);\n',
    content
)

# handleEdgeWeightChange
content = re.sub(
    r'(if \(!editingEdgeId\) return;\n)',
    r'\1    saveHistory(nodes, edges);\n',
    content
)

# clearWorkspace
content = re.sub(
    r'(const clearWorkspace = \(\) => \{\n\s*)(if \(window\.confirm)',
    r'\1saveHistory(nodes, edges);\n    \2',
    content
)

# loadPreset
content = re.sub(
    r'(if \(preset\) \{)',
    r'saveHistory(nodes, edges);\n    \1',
    content
)

# onImport
content = re.sub(
    r'(handleReset\(\);\n\s*)(setNodes\(importedGraph\.nodes\);)',
    r'\1saveHistory(nodes, edges);\n          \2',
    content
)

# 4. Add Undo and Redo buttons to the top middle controls (next to Reset)
old_controls = """          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-800 p-0.5">
            <button onClick={handleReset}"""
new_controls = """          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-800 p-0.5 mr-2">
            <button onClick={handleUndo} disabled={past.length === 0} className="w-7 h-7 flex items-center justify-center rounded hover:bg-white dark:hover:bg-zinc-800 hover:shadow-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-50 disabled:pointer-events-none transition-all focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:outline-none" title="Undo (Ctrl+Z)">
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleRedo} disabled={future.length === 0} className="w-7 h-7 flex items-center justify-center rounded hover:bg-white dark:hover:bg-zinc-800 hover:shadow-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-50 disabled:pointer-events-none transition-all focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:outline-none" title="Redo (Ctrl+Y)">
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-800 p-0.5">
            <button onClick={handleReset}"""
content = content.replace(old_controls, new_controls)

with open(filepath, 'w') as f:
    f.write(content)

