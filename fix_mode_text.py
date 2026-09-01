import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'MODE: <span className="text-zinc-900 dark:text-zinc-100">{mode.replace(\'_\', \' \')}</span>',
    'MODE: <span className="text-zinc-900 dark:text-zinc-100">{mode.replace(\'_\', \' \')}</span>{mode === EditorMode.DEFAULT && <span className="hidden sm:inline opacity-50 ml-2">(Double-click node to move)</span>}'
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Fixed mode text")
