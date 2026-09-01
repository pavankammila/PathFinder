import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'Undo2, Redo2\n  ChevronDown, Check',
    'Undo2, Redo2,\n  ChevronDown, Check'
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
