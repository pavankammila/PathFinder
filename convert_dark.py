import re
import os

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Replacements
    # Backgrounds
    content = re.sub(r'\bbg-white\b', 'bg-white dark:bg-zinc-900', content)
    content = re.sub(r'\bbg-zinc-50\b', 'bg-zinc-50 dark:bg-zinc-950', content)
    content = re.sub(r'\bbg-zinc-100\b', 'bg-zinc-100 dark:bg-zinc-800', content)
    content = re.sub(r'\bbg-zinc-200\b', 'bg-zinc-200 dark:bg-zinc-700', content)
    content = re.sub(r'\bbg-zinc-900\b', 'bg-zinc-900 dark:bg-zinc-100', content)
    content = re.sub(r'\bbg-zinc-300\b', 'bg-zinc-300 dark:bg-zinc-700', content) # disabled button bg
    
    # Text
    content = re.sub(r'\btext-zinc-900\b', 'text-zinc-900 dark:text-zinc-100', content)
    content = re.sub(r'\btext-zinc-800\b', 'text-zinc-800 dark:text-zinc-200', content)
    content = re.sub(r'\btext-zinc-700\b', 'text-zinc-700 dark:text-zinc-300', content)
    content = re.sub(r'\btext-zinc-600\b', 'text-zinc-600 dark:text-zinc-400', content)
    content = re.sub(r'\btext-zinc-500\b', 'text-zinc-500 dark:text-zinc-400', content)
    content = re.sub(r'\btext-zinc-400\b', 'text-zinc-400 dark:text-zinc-500', content)
    content = re.sub(r'\btext-white\b', 'text-white dark:text-zinc-900', content)
    
    # Borders
    content = re.sub(r'\bborder-zinc-200\b', 'border-zinc-200 dark:border-zinc-800', content)
    content = re.sub(r'\bborder-zinc-100\b', 'border-zinc-100 dark:border-zinc-800/50', content)
    content = re.sub(r'\bborder-zinc-50\b', 'border-zinc-50 dark:border-zinc-800/30', content)

    # Hover Backgrounds
    content = re.sub(r'\bhover:bg-zinc-100\b', 'hover:bg-zinc-100 dark:hover:bg-zinc-800', content)
    content = re.sub(r'\bhover:bg-zinc-50\b', 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50', content)
    content = re.sub(r'\bhover:bg-white\b', 'hover:bg-white dark:hover:bg-zinc-700', content)
    content = re.sub(r'\bhover:bg-zinc-800\b', 'hover:bg-zinc-800 dark:hover:bg-zinc-200', content)
    
    # Hover Text
    content = re.sub(r'\bhover:text-zinc-900\b', 'hover:text-zinc-900 dark:hover:text-zinc-100', content)

    # Rings
    content = re.sub(r'\bfocus-visible:ring-zinc-900\b', 'focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100', content)
    
    with open(filepath, 'w') as f:
        f.write(content)

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))

print("Done")
