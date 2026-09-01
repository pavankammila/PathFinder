import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Remove handleNodeDoubleClick definition
content = re.sub(r'  const handleNodeDoubleClick = useCallback\(\(nodeId: string\) => \{.*?  \}, \[mode, nodes, clearExecutionState\]\);\n', '', content, flags=re.DOTALL)

# Remove the onNodeDoubleClick prop from GraphCanvas
content = content.replace('onNodeDoubleClick={handleNodeDoubleClick}\n', '')

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Removed handleNodeDoubleClick")
