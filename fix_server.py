import re

filepath = 'server.ts'
with open(filepath, 'r') as f:
    content = f.read()

bad_block = """      // Send chat history if any
      const history = messages.slice(0, -1).map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));
      
      if (history.length > 0) {
        // Unfortunately, @google/genai SDK doesn't let us easily seed history in `ai.chats.create` with the new SDK unless we pass it during create.
        // Wait, the SDK allows passing history in `create` or we just pass the history array in `ai.models.generateContent`.
        // Let's just use `generateContent` with history for full control.
      }"""

content = content.replace(bad_block, '')
content = content.replace(
    '      const chat = ai.chats.create({\n        model: "gemini-3.5-flash",\n        config: {\n          systemInstruction,\n          temperature: 0.7,\n        },\n      });',
    '')

with open(filepath, 'w') as f:
    f.write(content)
