import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace('min-h-[450px]', 'min-h-[350px] sm:min-h-[400px] xl:min-h-0')

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Fixed graph height")
