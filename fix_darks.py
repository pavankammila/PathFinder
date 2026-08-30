import re
import os

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Clean up double darks
    content = re.sub(r'dark:bg-zinc-900 dark:bg-zinc-100', 'dark:bg-zinc-900', content)
    content = re.sub(r'dark:text-zinc-500 dark:text-zinc-400', 'dark:text-zinc-500', content)
    content = re.sub(r'dark:text-zinc-400 dark:text-zinc-500', 'dark:text-zinc-400', content)
    
    with open(filepath, 'w') as f:
        f.write(content)

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))

print("Fixed")
