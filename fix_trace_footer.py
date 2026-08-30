import re

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Dijkstra Distance Table
content = content.replace(
    '<div className="border border-zinc-200 dark:border-zinc-800 rounded overflow-hidden">',
    '<div className="border border-zinc-200 dark:border-zinc-800 rounded overflow-x-auto">'
)
content = content.replace(
    '<table className="w-full text-left text-[10px]">\n                    <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">',
    '<table className="w-full text-left text-[10px] min-w-[200px]">\n                    <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">'
)

# 2. Trace Footer
content = content.replace(
    '<footer className="h-32 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0">',
    '<footer className="h-auto lg:h-32 min-h-[128px] border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0">'
)
content = content.replace(
    '<div className="flex-1 flex flex-col font-mono text-[10px] bg-zinc-50 dark:bg-zinc-950/30 overflow-y-auto p-2 space-y-1">',
    '<div className="flex-1 flex flex-col font-mono text-[10px] bg-zinc-50 dark:bg-zinc-950/30 overflow-visible lg:overflow-y-auto p-2 space-y-1">'
)


with open(filepath, 'w') as f:
    f.write(content)
