import re

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Remove movingNodeId state
content = re.sub(r'  const \[movingNodeId, setMovingNodeId\] = useState<string \| null>\(null\);\n', '', content)

# Remove keyboard nudging block
keyboard_nudge_pattern = r'  // Keyboard nudging\n  useEffect\(\(\) => \{[\s\S]*?\}, \[movingNodeId, clearExecutionState\]\);\n'
content = re.sub(keyboard_nudge_pattern, '', content)

# Remove canvas click logic
canvas_click_old = """  const handleCanvasClick = useCallback((x: number, y: number) => {
    if (movingNodeId) {
      setNodes(prev => prev.map(n => n.id === movingNodeId ? { ...n, x, y } : n));
      setMovingNodeId(null);
      return;
    }
    if (mode === EditorMode.ADD_NODE) {
      const label = getNextNodeLabel(nodes.map(n => n.label));
      setNodes(prev => [...prev, { id: `n_${Date.now()}`, label, x, y }]);
      clearExecutionState();
    }
  }, [mode, nodes, movingNodeId, clearExecutionState]);"""

canvas_click_new = """  const handleCanvasClick = useCallback((x: number, y: number) => {
    if (mode === EditorMode.ADD_NODE) {
      const label = getNextNodeLabel(nodes.map(n => n.label));
      setNodes(prev => [...prev, { id: `n_${Date.now()}`, label, x, y }]);
      clearExecutionState();
    }
  }, [mode, nodes, clearExecutionState]);"""

content = content.replace(canvas_click_old, canvas_click_new)

# Update double click logic to prompt for rename
double_click_old = """  const handleNodeDoubleClick = useCallback((nodeId: string) => {
    if (mode === EditorMode.DEFAULT) {
      setMovingNodeId(prev => prev === nodeId ? null : nodeId);
    }
  }, [mode]);"""

double_click_new = """  const handleNodeDoubleClick = useCallback((nodeId: string) => {
    if (mode === EditorMode.DEFAULT) {
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        const newLabel = window.prompt("Enter new label for this node:", node.label);
        if (newLabel !== null && newLabel.trim() !== "") {
          setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, label: newLabel.trim() } : n));
          clearExecutionState();
        }
      }
    }
  }, [mode, nodes, clearExecutionState]);"""

content = content.replace(double_click_old, double_click_new)

# Remove prop
content = re.sub(r'                movingNodeId=\{movingNodeId\}\n', '', content)

# Remove toast
toast_pattern = r'            \{movingNodeId && \(\n              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-2 rounded-full text-\[11px\] font-medium shadow-lg z-30 animate-in slide-in-from-top-4">\n                Moving \{nodes\.find\(n => n\.id === movingNodeId\)\?\.label\}\. Click canvas to drop or use Arrow Keys \(Shift to move faster\)\.\n              </div>\n            \)}\n'
content = re.sub(toast_pattern, '', content)

with open(filepath, 'w') as f:
    f.write(content)

