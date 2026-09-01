import re

with open('src/components/GraphCanvas.tsx', 'r') as f:
    content = f.read()

keyboard_code = """
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!movableNodeId) return;
      const step = e.shiftKey ? 20 : 5;
      let dx = 0; let dy = 0;
      if (e.key === 'ArrowUp') dy = -step;
      else if (e.key === 'ArrowDown') dy = step;
      else if (e.key === 'ArrowLeft') dx = -step;
      else if (e.key === 'ArrowRight') dx = step;
      
      if (dx !== 0 || dy !== 0) {
        e.preventDefault();
        const node = nodesRef.current.find(n => n.id === movableNodeId);
        if (node) {
          callbacks.current.onNodeMove(movableNodeId, node.x + dx, node.y + dy);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movableNodeId]);
"""

content = content.replace(
    '  useEffect(() => { if (mode !== \'DEFAULT\') setMovableNodeId(null); }, [mode]);',
    '  useEffect(() => { if (mode !== \'DEFAULT\') setMovableNodeId(null); }, [mode]);\n' + keyboard_code
)

with open('src/components/GraphCanvas.tsx', 'w') as f:
    f.write(content)
print("Added keyboard support")
