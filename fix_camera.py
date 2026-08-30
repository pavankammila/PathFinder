import re

with open('src/components/CameraModal.tsx', 'r') as f:
    content = f.read()

# Update background of the modal
content = content.replace('bg-white dark:bg-zinc-900', 'surface-panel')

with open('src/components/CameraModal.tsx', 'w') as f:
    f.write(content)

