import re
import os

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Add movingNodeId state
content = content.replace(
    '  const [mode, setMode] = useState<EditorMode>(EditorMode.DEFAULT);',
    '  const [mode, setMode] = useState<EditorMode>(EditorMode.DEFAULT);\n  const [movingNodeId, setMovingNodeId] = useState<string | null>(null);'
)

# Clear it on reset
content = content.replace(
    '    setMode(EditorMode.DEFAULT);',
    '    setMode(EditorMode.DEFAULT);\n    setMovingNodeId(null);'
)
content = content.replace(
    '  const handleModeSelect = (newMode: EditorMode) => {',
    '  const handleModeSelect = (newMode: EditorMode) => {\n    setMovingNodeId(null);'
)

with open(filepath, 'w') as f:
    f.write(content)

print("Added movingNodeId")
