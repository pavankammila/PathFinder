with open('server.ts', 'r') as f:
    content = f.read()

content = content.replace('"gemini-3.7-flash"', '"gemini-3.8-flash"')
content = content.replace('"gemini-3.6-flash"', '"gemini-flash-latest"')

with open('server.ts', 'w') as f:
    f.write(content)
