import re

with open('src/App.tsx', 'r') as f:
    app_content = f.read()

# Make the distance table rows a bit softer in their background
app_content = app_content.replace('bg-zinc-100/50 dark:bg-zinc-800/50', 'bg-zinc-100/30 dark:bg-zinc-800/30')

with open('src/App.tsx', 'w') as f:
    f.write(app_content)

print("Updated table rows")
