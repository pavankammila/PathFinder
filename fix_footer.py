import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<footer className="min-h-[300px] xl:min-h-0 xl:h-32 border-t',
    '<footer className="h-[400px] xl:h-32 border-t'
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Fixed footer height")
