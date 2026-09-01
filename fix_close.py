import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<button onClick={() => setIsLeftSidebarOpen(false)} className="p-1 -mr-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" title="Close Panel">',
    '<button onClick={() => setIsLeftSidebarOpen(false)} className="p-1 -mr-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors hidden xl:block" title="Close Panel">'
)

content = content.replace(
    '<button onClick={() => setIsRightSidebarOpen(false)} className="p-1 -mr-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" title="Close Panel">',
    '<button onClick={() => setIsRightSidebarOpen(false)} className="p-1 -mr-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors hidden xl:block" title="Close Panel">'
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Fixed close buttons")
