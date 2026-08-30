import re
import os

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

keyboard_effect = """  // Keyboard nudging
  useEffect(() => {
    if (!movingNodeId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const step = e.shiftKey ? 20 : 5; // Fast or slow nudge
      let dx = 0, dy = 0;
      switch(e.key) {
        case 'ArrowUp': dy = -step; break;
        case 'ArrowDown': dy = step; break;
        case 'ArrowLeft': dx = -step; break;
        case 'ArrowRight': dx = step; break;
        case 'Escape': setMovingNodeId(null); return;
        default: return;
      }
      
      e.preventDefault();
      setNodes(prev => prev.map(n => n.id === movingNodeId ? { ...n, x: n.x + dx, y: n.y + dy } : n));
      clearExecutionState();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movingNodeId, clearExecutionState]);

  const clearExecutionState = useCallback(() => {"""

content = content.replace("  const clearExecutionState = useCallback(() => {", keyboard_effect)

content = content.replace(
    'onNodeClick={handleNodeClick}',
    'onNodeClick={handleNodeClick}\n                onNodeDoubleClick={handleNodeDoubleClick}'
)

moving_toast = """            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white dark:bg-zinc-900 transition-colors border border-zinc-200 dark:border-zinc-800 rounded-full px-4 py-2 shadow-sm z-20">"""
moving_toast_replacement = """            {movingNodeId && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-2 rounded-full text-[11px] font-medium shadow-lg z-30 animate-in slide-in-from-top-4">
                Moving {nodes.find(n => n.id === movingNodeId)?.label}. Click canvas to drop or use Arrow Keys (Shift to move faster).
              </div>
            )}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white dark:bg-zinc-900 transition-colors border border-zinc-200 dark:border-zinc-800 rounded-full px-4 py-2 shadow-sm z-20">"""
content = content.replace(moving_toast, moving_toast_replacement)


with open(filepath, 'w') as f:
    f.write(content)

print("Keyboard handlers added")
