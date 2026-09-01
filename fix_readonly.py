import re

with open('src/components/GraphCanvas.tsx', 'r') as f:
    content = f.read()

# Add readonly check
content = content.replace(
    '  useEffect(() => { if (mode !== \'DEFAULT\') setMovableNodeId(null); }, [mode]);',
    '  useEffect(() => { if (mode !== \'DEFAULT\' || readonly) setMovableNodeId(null); }, [mode, readonly]);'
)

# Fix keyboard handler
content = content.replace(
    'if (!movableNodeId) return;',
    'if (!movableNodeId || readonly) return;'
)

# Fix double click
content = content.replace(
    'if (modeRef.current === \'DEFAULT\') {',
    'if (modeRef.current === \'DEFAULT\' && !readonly) {'
)

with open('src/components/GraphCanvas.tsx', 'w') as f:
    f.write(content)
print("Fixed readonly")
