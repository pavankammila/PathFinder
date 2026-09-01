import re

with open('src/components/GraphCanvas.tsx', 'r') as f:
    content = f.read()

content = content.replace('nodesEnter.call(drag);', '')
content = content.replace('const nodesMerge = nodesEnter.merge(nodesSelection);', 'const nodesMerge = nodesEnter.merge(nodesSelection);\n    nodesMerge.call(drag);')

with open('src/components/GraphCanvas.tsx', 'w') as f:
    f.write(content)
print("Fixed drag binding")
