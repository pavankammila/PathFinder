import re

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Remove p-4 from the left sidebar inner div
content = content.replace(
    '<aside className={`w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 lg:overflow-y-auto order-2 lg:order-none max-lg:!flex p-4 sm:p-6 lg:p-0 ${!isLeftSidebarOpen ? "hidden lg:hidden" : ""}`}>\n          <div className="p-4 space-y-6">',
    '<aside className={`w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 lg:overflow-y-auto order-2 lg:order-none max-lg:!flex p-4 sm:p-6 lg:p-4 ${!isLeftSidebarOpen ? "hidden lg:hidden" : ""}`}>\n          <div className="space-y-6">'
)

# Do the same for the right sidebar
content = content.replace(
    '<aside className={`w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 lg:overflow-y-auto order-3 lg:order-none max-lg:!flex p-4 sm:p-6 lg:p-0 ${!isRightSidebarOpen ? \'hidden lg:hidden\' : \'\'}`}>\n          <div className="p-4 space-y-6">',
    '<aside className={`w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 lg:overflow-y-auto order-3 lg:order-none max-lg:!flex p-4 sm:p-6 lg:p-4 ${!isRightSidebarOpen ? \'hidden lg:hidden\' : \'\'}`}>\n          <div className="space-y-6">'
)


with open(filepath, 'w') as f:
    f.write(content)
