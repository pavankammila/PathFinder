import re

with open('src/components/AITutorPanel.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'setMessages(prev => [...prev, { role: \'model\', content: "PATHFINDER AI is temporarily unavailable." }]);',
    'setMessages(prev => [...prev, { role: \'model\', content: error instanceof Error ? error.message : "PATHFINDER AI is temporarily unavailable." }]);'
)

with open('src/components/AITutorPanel.tsx', 'w') as f:
    f.write(content)

