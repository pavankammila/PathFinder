import re

with open('src/components/GraphCanvas.tsx', 'r') as f:
    content = f.read()

content = content.replace('className="w-full h-full outline-none"', 'className="w-full h-full outline-none touch-none"')

with open('src/components/GraphCanvas.tsx', 'w') as f:
    f.write(content)

print("Fixed touch action")
