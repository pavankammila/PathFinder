import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace <div className="border border-zinc-200/50 dark:border-zinc-800/50 rounded overflow-hidden">
# with overflow-x-auto
content = content.replace(
    '<div className="border border-zinc-200/50 dark:border-zinc-800/50 rounded overflow-hidden">',
    '<div className="border border-zinc-200/50 dark:border-zinc-800/50 rounded overflow-x-auto overflow-y-hidden">'
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Fixed tables")
