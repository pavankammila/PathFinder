import re

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

new_hook = """  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if ((e.key === 'y' && (e.ctrlKey || e.metaKey)) || (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey)) {
        e.preventDefault();
        handleRedo();
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [handleUndo, handleRedo]);"""

content = content.replace("  const openCameraModal = () => setIsCameraModalOpen(true);", "  const openCameraModal = () => setIsCameraModalOpen(true);\n\n" + new_hook)

with open(filepath, 'w') as f:
    f.write(content)

