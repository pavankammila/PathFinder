import re

with open('server.ts', 'r') as f:
    content = f.read()

content = content.replace('model: "gemini-3.1-pro-preview"', 'model: "gemini-3.7-flash"')

with open('server.ts', 'w') as f:
    f.write(content)

