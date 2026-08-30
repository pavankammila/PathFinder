import re
import os

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace(
    '  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);',
    '  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);\n  const [isTutorOpen, setIsTutorOpen] = useState(false);'
)

with open(filepath, 'w') as f:
    f.write(content)

