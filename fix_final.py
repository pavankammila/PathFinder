import re
import os

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # selection pseudo-class
    content = re.sub(r'selection:bg-zinc-200 dark:bg-zinc-700', 'selection:bg-zinc-200 dark:selection:bg-zinc-700', content)
    
    # extra dark:bg-zinc-950 inside hover states
    content = re.sub(r'dark:hover:bg-zinc-200/50 dark:bg-zinc-950', 'dark:hover:bg-zinc-800', content)

    # empty background for table sticky header (might be missing transition colors)
    content = re.sub(r'bg-white dark:bg-zinc-900 dark:bg-zinc-100', 'bg-white dark:bg-zinc-900 transition-colors', content)

    # Any other transition-colors missing from structural pieces
    content = re.sub(r'bg-white dark:bg-zinc-900 border', 'bg-white dark:bg-zinc-900 transition-colors border', content)
    
    with open(filepath, 'w') as f:
        f.write(content)

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))

print("Final cleanup")
