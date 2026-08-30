import re

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Update root wrapper
content = content.replace(
    'className="flex flex-col h-screen w-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors font-sans overflow-hidden select-none selection:bg-zinc-200 dark:selection:bg-zinc-700"',
    'className="flex flex-col min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors font-sans lg:h-screen lg:overflow-hidden select-none selection:bg-zinc-200 dark:selection:bg-zinc-700"'
)

# 2. Update middle container (flex-1)
content = content.replace(
    '<div className="flex flex-1 overflow-hidden">',
    '<div className="flex flex-col lg:flex-row flex-1 lg:overflow-hidden">'
)

# 3. Update Left Sidebar
content = content.replace(
    'className={`w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 overflow-y-auto ${!isLeftSidebarOpen ? \'hidden\' : \'\'}`}',
    'className={`w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 lg:overflow-y-auto order-2 lg:order-none ${!isLeftSidebarOpen ? \'hidden lg:flex\' : \'\'} block`}' # wait, let\'s just use block on mobile if we want it always visible, or we can use hidden lg:flex if it\'s false? 
)
# Actually, the user says "Do not hide important controls". If the sidebars are hidden by state, they are gone. Let's make them always visible on mobile by overriding the hidden class.
content = re.sub(
    r'className=\{\`w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 overflow-y-auto \$\{\!isLeftSidebarOpen \? \'hidden\' : \'\'\}\`\}',
    r'className={`w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 lg:overflow-y-auto order-2 lg:order-none ${!isLeftSidebarOpen ? "hidden lg:hidden" : ""} max-lg:!flex`}',
    content
)

# 4. Update Right Sidebar
content = re.sub(
    r'className=\{\`w-80 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 overflow-y-auto \$\{\!isRightSidebarOpen \? \'hidden\' : \'\'\}\`\}',
    r'className={`w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 lg:overflow-y-auto order-3 lg:order-none ${!isRightSidebarOpen ? "hidden lg:hidden" : ""} max-lg:!flex`}',
    content
)

# 5. Update Main Canvas Container
content = content.replace(
    '<main className="flex-1 flex flex-col min-w-0 bg-zinc-100 dark:bg-zinc-800 relative">',
    '<main className="flex-1 flex flex-col min-w-0 bg-zinc-100 dark:bg-zinc-800 relative order-1 lg:order-none min-h-[500px] lg:min-h-0">'
)

# Hide toggle buttons on mobile because panels are always visible
content = content.replace(
    'className="absolute top-4 left-4 z-20 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:outline-none"',
    'className="hidden lg:block absolute top-4 left-4 z-20 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:outline-none"'
)

content = content.replace(
    'className="absolute top-4 right-4 z-20 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:outline-none"',
    'className="hidden lg:block absolute top-4 right-4 z-20 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:outline-none"'
)

with open(filepath, 'w') as f:
    f.write(content)
