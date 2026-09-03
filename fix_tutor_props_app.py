import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

pattern = re.compile(r'<AITutorPanel\s+isOpen=\{isTutorOpen\}')
content = re.sub(pattern, '<AITutorPanel currentAlgorithm={algo} isOpen={isTutorOpen}', content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
