import re

with open('src/components/GraphCanvas.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'const drag = d3.drag<SVGGElement, Node>()\n      .filter(() => mode === \'DEFAULT\')',
    'const drag = d3.drag<SVGGElement, Node>()\n      .filter((event, d) => mode === \'DEFAULT\' && movableNodeId === d.id)'
)

with open('src/components/GraphCanvas.tsx', 'w') as f:
    f.write(content)
print("Fixed drag filter")
