import re

filepath = 'src/components/AITutorPanel.tsx'
with open(filepath, 'r') as f:
    content = f.read()

content = re.sub(
    r'className=\{\`fixed right-0 top-0 bottom-0 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-xl z-50 flex flex-col transition-all duration-300 ease-in-out \$\{\s*isExpanded \? \'w-\[600px\] max-w-\[90vw\]\' : \'w-\[350px\]\'\}\`\}',
    r'className={`fixed right-0 top-0 bottom-0 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-xl z-50 flex flex-col transition-all duration-300 ease-in-out ${isExpanded ? "w-full sm:w-[600px] max-w-[90vw]" : "w-full sm:w-[350px]"}`}',
    content
)

with open(filepath, 'w') as f:
    f.write(content)
