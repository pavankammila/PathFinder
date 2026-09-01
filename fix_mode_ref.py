import re

with open('src/components/GraphCanvas.tsx', 'r') as f:
    content = f.read()

# Add modeRef
content = content.replace(
    '  const nodesRef = useRef(nodes);',
    '  const nodesRef = useRef(nodes);\n  const modeRef = useRef(mode);'
)

# Update modeRef in useEffect
content = content.replace(
    '    nodesRef.current = nodes;\n  }, [onNodeClick',
    '    nodesRef.current = nodes;\n    modeRef.current = mode;\n  }, [onNodeClick'
)

# Use modeRef in click handler
content = content.replace(
    'if (mode === \'DEFAULT\') {',
    'if (modeRef.current === \'DEFAULT\') {'
)

with open('src/components/GraphCanvas.tsx', 'w') as f:
    f.write(content)
print("Fixed mode ref")
