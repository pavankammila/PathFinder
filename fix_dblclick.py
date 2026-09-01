import re

with open('src/components/GraphCanvas.tsx', 'r') as f:
    content = f.read()

click_handler = """      .on('click', function(event, d) {
        if (event.defaultPrevented) return;
        event.stopPropagation();
        const now = Date.now();
        // @ts-ignore
        const lastClick = this.__lastClick || 0;
        if (now - lastClick < 400) {
          if (mode === 'DEFAULT') {
            setMovableNodeId(prev => prev === d.id ? null : d.id);
          }
          if (callbacks.current.onNodeDoubleClick) {
            callbacks.current.onNodeDoubleClick(d.id);
          }
          // @ts-ignore
          this.__lastClick = 0; // reset
        } else {
          callbacks.current.onNodeClick(d.id);
          // @ts-ignore
          this.__lastClick = now;
        }
      });"""

content = re.sub(
    r'\.on\(\'click\', function\(event, d\) \{.*?\}\);',
    click_handler,
    content,
    flags=re.DOTALL
)

with open('src/components/GraphCanvas.tsx', 'w') as f:
    f.write(content)
print("Fixed click handler")
