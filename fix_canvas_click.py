import re

with open('src/components/GraphCanvas.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '          callbacks.current.onCanvasClick(x, y);',
    '          setMovableNodeId(null);\n          callbacks.current.onCanvasClick(x, y);'
)

with open('src/components/GraphCanvas.tsx', 'w') as f:
    f.write(content)
print("Fixed canvas click")
