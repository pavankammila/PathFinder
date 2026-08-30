import re

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace(
    '<main className="flex-1 flex flex-col min-w-0 bg-zinc-100 dark:bg-zinc-800 relative order-1 lg:order-none min-h-[500px] lg:min-h-0">',
    '<main className="flex-1 flex flex-col min-w-0 bg-zinc-100 dark:bg-zinc-800 relative order-1 lg:order-none min-h-[400px] max-h-[50vh] lg:max-h-none lg:min-h-0">'
)

with open(filepath, 'w') as f:
    f.write(content)
