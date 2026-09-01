import re

with open('src/components/AITutorPanel.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    r"${isExpanded ? \'w-full sm:w-[600px] sm:max-w-[90vw]\' : \'w-full sm:w-[350px]\'}",
    r"${isExpanded ? 'w-full sm:w-[600px] sm:max-w-[90vw]' : 'w-full sm:w-[350px]'}"
)

with open('src/components/AITutorPanel.tsx', 'w') as f:
    f.write(content)

print("Fixed syntax error 2")
