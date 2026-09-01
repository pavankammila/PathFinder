import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add Share2 to lucide imports
content = content.replace(
    'Undo2, Redo2,\n  ChevronDown, Check',
    'Undo2, Redo2,\n  ChevronDown, Check, Share2'
)

# Add hooks after line 125 (where handleUndo, handleRedo effect ends)
hooks = """  }, [handleUndo, handleRedo]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const graphData = urlParams.get('graph');
    if (graphData) {
      try {
        const decoded = decodeURIComponent(atob(graphData));
        const parsed = JSON.parse(decoded);
        if (parsed.nodes && parsed.edges) {
          setNodes(parsed.nodes);
          setEdges(parsed.edges);
          if (parsed.nodes.length > 0) {
            setSourceNodeId(parsed.nodes[0].id);
            setDestNodeId(parsed.nodes[parsed.nodes.length - 1].id);
          }
        }
      } catch (e) {
        console.error("Failed to parse graph from URL", e);
      }
    }
  }, []);

  const handleShareGraph = () => {
    try {
      const data = JSON.stringify({ nodes, edges });
      const encoded = btoa(encodeURIComponent(data));
      const url = new URL(window.location.href);
      url.searchParams.set('graph', encoded);
      
      navigator.clipboard.writeText(url.toString());
      alert('Link copied to clipboard!');
    } catch (e) {
      console.error('Failed to share graph', e);
      alert('Failed to generate share link.');
    }
  };"""

content = content.replace('  }, [handleUndo, handleRedo]);', hooks)

# Add button to header
button = """        <div className="flex items-center gap-3">
          <button 
            onClick={handleShareGraph}
            title="Share Graph"
            className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded text-[10px] font-bold hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:outline-none"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SHARE</span>
          </button>
          <button 
            onClick={openCameraModal}"""

content = content.replace(
    '        <div className="flex items-center gap-3">\n          <button \n            onClick={openCameraModal}',
    button
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
