import re

filepath = 'src/components/GraphCanvas.tsx'
with open(filepath, 'r') as f:
    content = f.read()

old_click = """      .on('click', function(event, d) {
        event.stopPropagation();"""
new_click = """      .on('click', function(event, d) {
        if (event.defaultPrevented) return;
        event.stopPropagation();"""

content = content.replace(old_click, new_click)

with open(filepath, 'w') as f:
    f.write(content)

