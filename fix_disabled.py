import re
import os

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    content = re.sub(r'disabled:bg-zinc-300 dark:bg-zinc-700', 'disabled:bg-zinc-300 dark:disabled:bg-zinc-800', content)
    content = re.sub(r'disabled:text-zinc-500 dark:text-zinc-400', 'disabled:text-zinc-500 dark:disabled:text-zinc-500', content)
    
    with open(filepath, 'w') as f:
        f.write(content)

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))

print("Fixed disabled")
