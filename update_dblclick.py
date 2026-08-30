import re
import os

filepath = 'src/components/GraphCanvas.tsx'
with open(filepath, 'r') as f:
    content = f.read()

old_click = """      .on('pointerup', function(event, d) {
        event.stopPropagation();
        const now = Date.now();
        // @ts-ignore
        const lastClick = this.__lastClick || 0;
        if (now - lastClick < 300) {
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

new_click = """      .on('click', function(event, d) {
        event.stopPropagation();
        const now = Date.now();
        // @ts-ignore
        const lastClick = this.__lastClick || 0;
        if (now - lastClick < 400) { // Increased to 400ms for easier tapping
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

content = content.replace(old_click, new_click)

with open(filepath, 'w') as f:
    f.write(content)

print("Restored click and increased timeout")
