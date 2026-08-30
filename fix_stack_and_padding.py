import re

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Update middle container to flex-col on mobile
content = content.replace(
    '<div className="flex flex-1 overflow-hidden">',
    '<div className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden">'
)

# Update Left Sidebar and ADD PADDING
content = re.sub(
    r'className=\{\`w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 lg:overflow-y-auto order-2 lg:order-none \$\{\!isLeftSidebarOpen \? \'hidden lg:flex\' : \'\'\} block\`\}',
    r'className={`w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 lg:overflow-y-auto order-2 lg:order-none max-lg:!flex p-4 sm:p-6 lg:p-0 ${!isLeftSidebarOpen ? "hidden lg:hidden" : ""}`}',
    content
)

# Also support if it was already reverted
content = re.sub(
    r'className=\{\`w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 overflow-y-auto \$\{\!isLeftSidebarOpen \? \'hidden\' : \'\'\}\`\}',
    r'className={`w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 lg:overflow-y-auto order-2 lg:order-none max-lg:!flex p-4 sm:p-6 lg:p-0 ${!isLeftSidebarOpen ? "hidden lg:hidden" : ""}`}',
    content
)


# Update Right Sidebar
content = content.replace(
    'className={`w-80 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 overflow-y-auto ${!isRightSidebarOpen ? \'hidden\' : \'\'}`}',
    'className={`w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 lg:overflow-y-auto order-3 lg:order-none max-lg:!flex p-4 sm:p-6 lg:p-0 ${!isRightSidebarOpen ? \'hidden lg:hidden\' : \'\'}`}'
)

# Update Main Canvas Container
content = content.replace(
    '<main className="flex-1 flex flex-col min-w-0 bg-zinc-100 dark:bg-zinc-800 relative">',
    '<main className="flex-1 flex flex-col min-w-0 bg-zinc-100 dark:bg-zinc-800 relative order-1 lg:order-none min-h-[400px] lg:min-h-0 shrink-0 lg:shrink">'
)

with open(filepath, 'w') as f:
    f.write(content)
