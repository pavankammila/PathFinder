import re

with open('src/components/GraphCanvas.tsx', 'r') as f:
    content = f.read()

style_line = "         else if (movableNodeId === d.id) { stroke = theme === 'dark' ? '#a855f7' : '#9333ea'; strokeWidth = 3; }"

content = content.replace(
    '         else if (d.id === connectStartNodeId) { fill = theme === \'dark\' ? \'#0c4a6e\' : \'#e0f2fe\'; stroke = (theme === \'dark\' ? \'#38bdf8\' : \'#0284c7\'); strokeWidth = 3; }',
    '         else if (d.id === connectStartNodeId) { fill = theme === \'dark\' ? \'#0c4a6e\' : \'#e0f2fe\'; stroke = (theme === \'dark\' ? \'#38bdf8\' : \'#0284c7\'); strokeWidth = 3; }\n' + style_line
)

with open('src/components/GraphCanvas.tsx', 'w') as f:
    f.write(content)
print("Added movable style")
