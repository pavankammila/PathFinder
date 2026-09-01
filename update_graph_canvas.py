import re

with open('src/components/GraphCanvas.tsx', 'r') as f:
    content = f.read()

# Add to interface
content = content.replace(
    '  readonly?: boolean;',
    '  readonly?: boolean;\n  allowDoubleClickMove?: boolean;'
)

# Add to props destructuring
content = content.replace(
    '  distances, readonly, theme = "light",',
    '  distances, readonly, theme = "light", allowDoubleClickMove = false,'
)

# Add allowDoubleClickMoveRef
content = content.replace(
    '  const modeRef = useRef(mode);',
    '  const modeRef = useRef(mode);\n  const allowDoubleClickMoveRef = useRef(allowDoubleClickMove);'
)

# Update refs in useEffect
content = content.replace(
    '    modeRef.current = mode;\n  }, [onNodeClick',
    '    modeRef.current = mode;\n    allowDoubleClickMoveRef.current = allowDoubleClickMove;\n  }, [onNodeClick, allowDoubleClickMove, '
)

# Update movableNodeId clear effect
content = content.replace(
    '  useEffect(() => { if (mode !== \'DEFAULT\' || readonly) setMovableNodeId(null); }, [mode, readonly]);',
    '  useEffect(() => { if (mode !== \'DEFAULT\' || readonly || !allowDoubleClickMove) setMovableNodeId(null); }, [mode, readonly, allowDoubleClickMove]);'
)

# Update click handler
content = content.replace(
    'if (modeRef.current === \'DEFAULT\' && !readonly) {',
    'if (modeRef.current === \'DEFAULT\' && !readonly && allowDoubleClickMoveRef.current) {'
)

with open('src/components/GraphCanvas.tsx', 'w') as f:
    f.write(content)
