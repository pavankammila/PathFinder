import re

with open('server.ts', 'r') as f:
    content = f.read()

replacement = """    } catch (error: any) {
      console.error("AI Chat Error:", error);
      let errorMsg = error.message;
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.error && parsed.error.message) {
           errorMsg = parsed.error.message;
        }
      } catch (e) {
        // Not JSON
      }
      res.status(500).json({ error: errorMsg });
    }"""

content = re.sub(
    r"    \} catch \(error: any\) \{\s*console\.error\(\"AI Chat Error:\", error\);\s*res\.status\(500\)\.json\(\{ error: error\.message \}\);\s*\}",
    replacement,
    content,
    flags=re.MULTILINE
)

with open('server.ts', 'w') as f:
    f.write(content)

