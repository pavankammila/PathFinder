import re

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Make header flex-wrap and remove fixed height
content = content.replace(
    '<header className="h-12 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-4 shrink-0 z-50">',
    '<header className="min-h-[48px] py-2 lg:py-0 lg:h-12 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-wrap lg:flex-nowrap items-center justify-between px-4 gap-2 shrink-0 z-50">'
)

# Execution controls gap
content = content.replace(
    '<div className="flex items-center gap-6">',
    '<div className="flex flex-wrap items-center gap-2 lg:gap-6 justify-center w-full lg:w-auto order-3 lg:order-none mt-2 lg:mt-0">'
)

with open(filepath, 'w') as f:
    f.write(content)
