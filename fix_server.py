import re

with open('server.ts', 'r') as f:
    content = f.read()

replacement = """    try {
      const { messages, context } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "Gemini API key is missing. Please add it in Settings > Secrets." });
      }

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: {"""

content = re.sub(
    r"    try \{\s*const \{ messages, context \} = req\.body;\s*const ai = new GoogleGenAI\(\{\s*apiKey: process\.env\.GEMINI_API_KEY,\s*httpOptions: \{",
    replacement,
    content,
    flags=re.MULTILINE
)

with open('server.ts', 'w') as f:
    f.write(content)

