import re
import os

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Canvas click
canvas_click = """  const handleCanvasClick = useCallback((x: number, y: number) => {
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

content = re.sub(
    r"  const handleCanvasClick = useCallback\(\(x: number, y: number\) => \{[\s\S]*?\}, \[mode, nodes, clearExecutionState\]\);",
    canvas_click,
    content
)

double_click = """  const handleNodeDoubleClick = useCallback((nodeId: string) => {
    if (mode === EditorMode.DEFAULT) {
      setMovingNodeId(prev => prev === nodeId ? null : nodeId);
    }
  }, [mode]);

  const handleNodeClick = useCallback((nodeId: string) => {"""

content = content.replace("  const handleNodeClick = useCallback((nodeId: string) => {", double_click)

with open(filepath, 'w') as f:
    f.write(content)

print("Added handlers")
