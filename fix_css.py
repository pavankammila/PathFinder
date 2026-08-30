import re

filepath = 'src/index.css'
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace(
    'body {\n    @apply font-sans text-primary bg-canvas overflow-hidden m-0 p-0 h-screen w-screen;\n  }',
    'body {\n    @apply font-sans text-primary bg-canvas m-0 p-0;\n  }'
)

with open(filepath, 'w') as f:
    f.write(content)
