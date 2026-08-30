import re

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Revert middle container
content = content.replace(
    '<div className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden">',
    '<div className="flex flex-1 overflow-hidden">'
)

# Revert Left Sidebar
content = content.replace(
    'className={`w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 lg:overflow-y-auto order-2 lg:order-none max-lg:!flex ${!isLeftSidebarOpen ? \'hidden lg:hidden\' : \'\'}`}',
    'className={`w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 overflow-y-auto ${!isLeftSidebarOpen ? \'hidden\' : \'\'}`}'
)

# Revert Right Sidebar
content = content.replace(
    'className={`w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 lg:overflow-y-auto order-3 lg:order-none max-lg:!flex ${!isRightSidebarOpen ? \'hidden lg:hidden\' : \'\'}`}',
    'className={`w-80 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 overflow-y-auto ${!isRightSidebarOpen ? \'hidden\' : \'\'}`}'
)

# Revert Main Canvas Container
content = content.replace(
    '<main className="flex-1 flex flex-col min-w-0 bg-zinc-100 dark:bg-zinc-800 relative order-1 lg:order-none min-h-[400px] lg:min-h-0 shrink-0 lg:shrink">',
    '<main className="flex-1 flex flex-col min-w-0 bg-zinc-100 dark:bg-zinc-800 relative">'
)

with open(filepath, 'w') as f:
    f.write(content)
