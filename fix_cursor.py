import re

with open('src/components/GraphCanvas.tsx', 'r') as f:
    content = f.read()

# Update node-bg cursor
content = content.replace(
    ".style('cursor', mode === 'ADD_NODE' ? 'default' : 'pointer')",
    ".style('cursor', d => movableNodeId === d.id ? 'grab' : (mode === 'ADD_NODE' ? 'default' : 'pointer'))"
)

# Update drag start/end to manage grabbing cursor
content = content.replace(
    ".on('start', function(event) { d3.select(this).raise(); })",
    ".on('start', function(event) { d3.select(this).raise(); d3.select(this).select('.node-bg').style('cursor', 'grabbing'); })"
)

content = content.replace(
    ".on('end', function(event, d) {\n        callbacks.current.onNodeMove",
    ".on('end', function(event, d) {\n        d3.select(this).select('.node-bg').style('cursor', 'grab');\n        callbacks.current.onNodeMove"
)

with open('src/components/GraphCanvas.tsx', 'w') as f:
    f.write(content)
