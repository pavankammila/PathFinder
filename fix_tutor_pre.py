with open('src/components/AITutorPanel.tsx', 'r') as f:
    content = f.read()

content = content.replace("[&_pre]:bg-black/5", "[&_pre]:overflow-x-auto [&_pre]:bg-black/5")

with open('src/components/AITutorPanel.tsx', 'w') as f:
    f.write(content)
