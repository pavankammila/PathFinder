import re

filepath = 'src/components/GraphCanvas.tsx'
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace('  movingNodeId?: string | null;\n', '')
content = content.replace(', movingNodeId', '')

highlight = r"         if \(d\.id === movingNodeId\) \{ fill = theme === 'dark' \? '#312e81' : '#e0e7ff'; stroke = \(theme === 'dark' \? '#818cf8' : '#4f46e5'\); strokeWidth = 3; \}\n         else if \(pathNodeIds\?\.includes\(d\.id\)\) \{"
new_highlight = "         if (pathNodeIds?.includes(d.id)) {"
content = re.sub(highlight, new_highlight, content)

content = content.replace("d.id === movingNodeId || d.id === connectStartNodeId", "d.id === connectStartNodeId")

with open(filepath, 'w') as f:
    f.write(content)
