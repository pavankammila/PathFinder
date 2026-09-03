with open('src/utils/presets.ts', 'r') as f:
    content = f.read()

content = content.replace("  }\n  'DAG (Directed", "  },\n  'DAG (Directed")

with open('src/utils/presets.ts', 'w') as f:
    f.write(content)
