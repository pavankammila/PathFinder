import re
import os

filepath = 'src/components/GraphCanvas.tsx'
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace('onNodeClick: (nodeId: string) => void;', 'onNodeClick: (nodeId: string) => void;\n  onNodeDoubleClick?: (nodeId: string) => void;')
content = content.replace('onNodeClick, onEdgeClick, onCanvasClick, onNodeMove\n}: GraphCanvasProps', 'onNodeClick, onNodeDoubleClick, onEdgeClick, onCanvasClick, onNodeMove\n}: GraphCanvasProps')
content = content.replace('callbacks.current = { onNodeClick, onEdgeClick, onCanvasClick, onNodeMove };', 'callbacks.current = { onNodeClick, onNodeDoubleClick, onEdgeClick, onCanvasClick, onNodeMove };')
content = content.replace('const callbacks = useRef({ onNodeClick, onEdgeClick, onCanvasClick, onNodeMove });', 'const callbacks = useRef({ onNodeClick, onNodeDoubleClick, onEdgeClick, onCanvasClick, onNodeMove });')
content = content.replace('[onNodeClick, onEdgeClick, onCanvasClick, onNodeMove, nodes]', '[onNodeClick, onNodeDoubleClick, onEdgeClick, onCanvasClick, onNodeMove, nodes]')

click_handler = """      .on('click', (event, d) => {
        event.stopPropagation();
        callbacks.current.onNodeClick(d.id);
      })"""

new_click_handler = """      .on('click', (event, d) => {
        event.stopPropagation();
        callbacks.current.onNodeClick(d.id);
      })
      .on('dblclick', (event, d) => {
        event.stopPropagation();
        if (callbacks.current.onNodeDoubleClick) {
          callbacks.current.onNodeDoubleClick(d.id);
        }
      })"""

content = content.replace(click_handler, new_click_handler)

with open(filepath, 'w') as f:
    f.write(content)

print("Double click implemented in Canvas")
