import re

with open('src/components/GraphCanvas.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '}, [nodes, edges, mode, sourceNodeId, destNodeId, connectStartNodeId, activeNodeId, activeEdgeId, visitedNodeIds, pathNodeIds, pathEdgeIds, distances, readonly, theme = "light"]);',
    '}, [nodes, edges, mode, movableNodeId, sourceNodeId, destNodeId, connectStartNodeId, activeNodeId, activeEdgeId, visitedNodeIds, pathNodeIds, pathEdgeIds, distances, readonly, theme = "light"]);'
)

with open('src/components/GraphCanvas.tsx', 'w') as f:
    f.write(content)
print("Fixed deps")
