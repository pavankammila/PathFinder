import re
import os

filepath = 'src/components/GraphCanvas.tsx'
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace('connectStartNodeId: string | null;', 'connectStartNodeId: string | null;\n  movingNodeId?: string | null;')
content = content.replace('connectStartNodeId,\n  activeNodeId', 'connectStartNodeId, movingNodeId,\n  activeNodeId')

# Highlight moving node
highlight = """         if (d.id === movingNodeId) { fill = theme === 'dark' ? '#312e81' : '#e0e7ff'; stroke = (theme === 'dark' ? '#818cf8' : '#4f46e5'); strokeWidth = 3; }
         else if (pathNodeIds?.includes(d.id)) {"""
content = content.replace("         if (pathNodeIds?.includes(d.id)) {", highlight)

# Also fix hover style
content = content.replace("d.id === connectStartNodeId ? '#4f46e5'", "d.id === connectStartNodeId || d.id === movingNodeId ? '#4f46e5'")
content = content.replace("d.id === connectStartNodeId ? (theme === 'dark' ? '#818cf8' : '#4f46e5')", "d.id === connectStartNodeId || d.id === movingNodeId ? (theme === 'dark' ? '#818cf8' : '#4f46e5')")

# Fallback string replace for hover if the previous one didn't exactly match
content = re.sub(
    r"\(d\.id === connectStartNodeId \? \(theme === 'dark' \? '#818cf8' : '#4f46e5'\)",
    r"((d.id === connectStartNodeId || d.id === movingNodeId) ? (theme === 'dark' ? '#818cf8' : '#4f46e5')",
    content
)

with open(filepath, 'w') as f:
    f.write(content)

print("Canvas Highlight Added")
