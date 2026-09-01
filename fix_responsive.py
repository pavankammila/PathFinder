import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Fix Root Container
content = re.sub(
    r'<div className="flex flex-col h-screen w-screen[^"]*overflow-hidden([^"]*)">',
    r'<div className="flex flex-col min-h-screen xl:h-screen w-full bg-transparent text-zinc-900 dark:text-zinc-100 transition-colors font-sans overflow-x-hidden xl:overflow-hidden select-none selection:bg-zinc-200 dark:selection:bg-zinc-700">',
    content
)

# Fix Middle Container
content = re.sub(
    r'<div className="flex flex-col lg:flex-row flex-1 lg:overflow-hidden">',
    r'<div className="flex flex-col xl:flex-row flex-1 xl:overflow-hidden">',
    content
)

# Fix Left Sidebar
# <aside className={`w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-zinc-200/50 dark:border-zinc-800/50 bg-transparent flex flex-col shrink-0 lg:overflow-y-auto order-2 lg:order-none max-lg:!flex p-4 sm:p-6 lg:p-4 ${!isLeftSidebarOpen ? "hidden lg:hidden" : ""}`}>
content = re.sub(
    r'w-full lg:w-64 border-b lg:border-b-0 lg:border-r [^"]*lg:overflow-y-auto order-2 lg:order-none max-lg:!flex p-4 sm:p-6 lg:p-4 \$\{![^?]*\? "hidden lg:hidden" : ""\}',
    r'w-full xl:w-64 border-b xl:border-b-0 xl:border-r border-zinc-200/50 dark:border-zinc-800/50 bg-transparent flex flex-col shrink-0 xl:overflow-y-auto order-2 xl:order-none max-xl:!flex p-4 sm:p-6 xl:p-4 ${!isLeftSidebarOpen ? "hidden xl:hidden" : ""}',
    content
)

# Hide left close button on mobile
content = re.sub(
    r'<button onClick=\{[^}]*setIsLeftSidebarOpen\(false\)[^}]*className="([^"]*)"',
    lambda m: '<button onClick={() => setIsLeftSidebarOpen(false)} className="' + m.group(1).replace('xl:hidden hidden', '').replace('hidden xl:block', '') + ' hidden xl:block"',
    content
)

# Fix Main Center Area
# <main className="flex-1 flex flex-col min-w-0 bg-transparent relative order-1 lg:order-none min-h-[400px] lg:min-h-0 shrink-0 lg:shrink">
content = re.sub(
    r'<main className="flex-1 flex flex-col min-w-0 bg-transparent relative order-1 lg:order-none min-h-\[400px\] lg:min-h-0 shrink-0 lg:shrink">',
    r'<main className="flex-1 flex flex-col min-w-0 bg-transparent relative order-1 xl:order-none min-h-[450px] xl:min-h-0 shrink-0 xl:shrink">',
    content
)

# Update PanelLeftOpen button
content = re.sub(
    r'<button\s*onClick=\{[^}]*setIsLeftSidebarOpen\(true\)\}\s*className="hidden lg:block',
    r'<button\n              onClick={() => setIsLeftSidebarOpen(true)}\n              className="hidden xl:block',
    content
)

# Update PanelRightOpen button
content = re.sub(
    r'<button\s*onClick=\{[^}]*setIsRightSidebarOpen\(true\)\}\s*className="hidden lg:block',
    r'<button\n              onClick={() => setIsRightSidebarOpen(true)}\n              className="hidden xl:block',
    content
)

# Fix Right Sidebar
# <aside className={`w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-zinc-200/50 dark:border-zinc-800/50 bg-transparent flex flex-col shrink-0 lg:overflow-y-auto order-3 lg:order-none max-lg:!flex p-4 sm:p-6 lg:p-4 ${!isRightSidebarOpen ? \'hidden lg:hidden\' : \'\'}`}>
content = re.sub(
    r'w-full lg:w-80 border-t lg:border-t-0 lg:border-l [^"]*lg:overflow-y-auto order-3 lg:order-none max-lg:!flex p-4 sm:p-6 lg:p-4 \$\{![^?]*\? \'hidden lg:hidden\' : \'\'\}',
    r'w-full xl:w-80 border-t xl:border-t-0 xl:border-l border-zinc-200/50 dark:border-zinc-800/50 bg-transparent flex flex-col shrink-0 xl:overflow-y-auto order-3 xl:order-none max-xl:!flex p-4 sm:p-6 xl:p-4 ${!isRightSidebarOpen ? \'hidden xl:hidden\' : \'\'}',
    content
)

# Hide right close button on mobile
content = re.sub(
    r'<button onClick=\{[^}]*setIsRightSidebarOpen\(false\)[^}]*className="([^"]*)"',
    lambda m: '<button onClick={() => setIsRightSidebarOpen(false)} className="' + m.group(1).replace('xl:hidden hidden', '').replace('hidden xl:block', '') + ' hidden xl:block"',
    content
)

# Fix Trace footer
# <footer className="h-32 border-t border-zinc-200/50 dark:border-zinc-800/50 surface-panel flex flex-col shrink-0">
content = re.sub(
    r'<footer className="h-32 border-t border-zinc-200/50 dark:border-zinc-800/50 surface-panel flex flex-col shrink-0">',
    r'<footer className="min-h-[300px] xl:min-h-0 xl:h-32 border-t border-zinc-200/50 dark:border-zinc-800/50 surface-panel flex flex-col shrink-0">',
    content
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Applied responsive fixes")
