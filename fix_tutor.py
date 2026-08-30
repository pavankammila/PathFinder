import re

with open('src/components/AITutorPanel.tsx', 'r') as f:
    content = f.read()

# Update background of the AI panel
content = content.replace('bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800', 'surface-panel border-l border-zinc-200/50 dark:border-zinc-800/50')
content = content.replace('bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800', 'surface-header border-b border-zinc-200/50 dark:border-zinc-800/50')
content = content.replace('bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800', 'surface-header border-t border-zinc-200/50 dark:border-zinc-800/50')
content = content.replace('bg-zinc-50 dark:bg-zinc-800', 'surface-card')
content = content.replace('bg-zinc-100 dark:bg-zinc-800', 'bg-black/5 dark:bg-white/5')
content = content.replace('bg-zinc-900 dark:bg-zinc-100', 'bg-gradient-to-br from-blue-500 to-cyan-500 border-0')
content = content.replace('text-white dark:text-zinc-900', 'text-white')

with open('src/components/AITutorPanel.tsx', 'w') as f:
    f.write(content)
