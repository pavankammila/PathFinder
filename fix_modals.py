import re

with open('src/components/CameraModal.tsx', 'r') as f:
    content = f.read()
# Fix padding on CameraModal
content = content.replace('backdrop-blur-sm p-8', 'backdrop-blur-sm p-4 sm:p-8')
# Fix the other CameraModal wrapper
content = content.replace('backdrop-blur-sm">', 'backdrop-blur-sm p-4">')
with open('src/components/CameraModal.tsx', 'w') as f:
    f.write(content)

with open('src/components/AITutorPanel.tsx', 'r') as f:
    content = f.read()

# Fix AITutorPanel width
content = re.sub(
    r'\$\{isExpanded \? \'w-\[600px\] max-w-\[90vw\]\' : \'w-\[350px\]\'\}',
    r'${isExpanded ? \'w-full sm:w-[600px] sm:max-w-[90vw]\' : \'w-full sm:w-[350px]\'}',
    content
)
with open('src/components/AITutorPanel.tsx', 'w') as f:
    f.write(content)

print("Fixed Modals")
