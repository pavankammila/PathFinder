import re

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

old_key = """    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, clearExecutionState, handleNodeMove]);"""

new_key = """    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if ((e.key === 'y' && (e.ctrlKey || e.metaKey)) || (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey)) {
        e.preventDefault();
        handleRedo();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [mode, clearExecutionState, handleNodeMove, handleUndo, handleRedo]);"""
content = content.replace(old_key, new_key)

with open(filepath, 'w') as f:
    f.write(content)

