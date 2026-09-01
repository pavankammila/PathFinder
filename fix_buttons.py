import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Fix getModeClass
content = content.replace(
    "const getModeClass = (m: EditorMode) => `w-full flex items-center gap-2 px-3 py-1.5",
    "const getModeClass = (m: EditorMode) => `w-full flex items-center gap-2 px-3 py-3 sm:py-2 xl:py-1.5"
)
content = content.replace(
    "const getDeleteModeClass = () => `w-full flex items-center gap-2 px-3 py-1.5",
    "const getDeleteModeClass = () => `w-full flex items-center gap-2 px-3 py-3 sm:py-2 xl:py-1.5"
)

# Preset buttons
# className="w-full text-left px-3 py-1.5 rounded text-[11px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:outline-none text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 border border-transparent disabled:opacity-50 disabled:pointer-events-none"
content = content.replace(
    'className="w-full text-left px-3 py-1.5 rounded',
    'className="w-full text-left px-3 py-3 sm:py-2 xl:py-1.5 rounded'
)

# Clear all button
# <button \n                  onClick={handleClearAll} \n                  disabled={isExecutionActive} \n                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:outline-none text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-50 disabled:pointer-events-none"\n                >
content = content.replace(
    'className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-[11px]',
    'className="w-full flex items-center gap-2 px-3 py-3 sm:py-2 xl:py-1.5 rounded text-[11px]'
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Fixed mobile buttons")
