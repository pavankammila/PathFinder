import re
import os

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Fix mode class
    content = re.sub(
        r"'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 dark:hover:bg-zinc-200/50 dark:bg-zinc-950 hover:text-zinc-900 dark:hover:text-zinc-100 dark:text-zinc-100'",
        r"'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'",
        content
    )
    
    # Fix preset buttons
    content = re.sub(
        r"text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 dark:hover:bg-zinc-200/50 dark:bg-zinc-950 hover:text-zinc-900 dark:hover:text-zinc-100 dark:text-zinc-100 border border-transparent",
        r"text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 border border-transparent",
        content
    )

    # Fix other redundant dark classes in hover
    content = re.sub(
        r"hover:bg-white dark:hover:bg-zinc-700 dark:bg-zinc-900",
        r"hover:bg-white dark:hover:bg-zinc-800",
        content
    )
    content = re.sub(
        r"hover:text-zinc-900 dark:hover:text-zinc-100 dark:text-zinc-100",
        r"hover:text-zinc-900 dark:hover:text-zinc-100",
        content
    )
    
    # Fix body class if needed (double dark)
    content = re.sub(r'bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100', 'bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors', content)

    # Fix other known bugs
    content = re.sub(r'dark:bg-zinc-900 dark:bg-zinc-100', 'dark:bg-zinc-900', content)
    
    with open(filepath, 'w') as f:
        f.write(content)

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))

print("Fixed specific classes")
