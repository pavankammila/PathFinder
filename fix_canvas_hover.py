import re
import os

filepath = 'src/components/GraphCanvas.tsx'
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace(
    "pathNodeIds?.includes(d.id) ?",
    "(pathNodeIds?.includes(d.id) || d.id === movingNodeId || d.id === connectStartNodeId) ?"
)

content = content.replace(
    "const defaultWidth = (pathNodeIds?.includes(d.id) || activeNodeId === d.id) ? 3 : 2;",
    "const defaultWidth = (pathNodeIds?.includes(d.id) || activeNodeId === d.id || d.id === movingNodeId || d.id === connectStartNodeId) ? 3 : 2;"
)

with open(filepath, 'w') as f:
    f.write(content)

print("Canvas Highlight Added completely")
