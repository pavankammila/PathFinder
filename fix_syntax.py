import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    r"${!isRightSidebarOpen ? \'hidden xl:hidden\' : \'\'}",
    r"${!isRightSidebarOpen ? 'hidden xl:hidden' : ''}"
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Fixed syntax error")
