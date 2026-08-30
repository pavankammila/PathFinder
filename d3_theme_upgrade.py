import re

with open('src/components/GraphCanvas.tsx', 'r') as f:
    content = f.read()

# Update D3 nodes and edges coloring logic
# We need to change the stroke and fill logic inside the `useEffect` node rendering block

def replace_color_logic(match):
    return """
         let fill = theme === 'dark' ? 'rgba(24, 24, 27, 0.7)' : 'rgba(255, 255, 255, 0.7)';
         let stroke = theme === 'dark' ? '#3f3f46' : '#e4e4e7';
         let strokeWidth = 2;

         if (pathNodeIds?.includes(d.id)) { fill = theme === 'dark' ? '#0c4a6e' : '#e0f2fe'; stroke = (theme === 'dark' ? '#38bdf8' : '#0284c7'); strokeWidth = 3; }
         else if (activeNodeId === d.id) { fill = theme === 'dark' ? '#083344' : '#ecfeff'; stroke = theme === 'dark' ? '#22d3ee' : '#06b6d4'; strokeWidth = 3; }
         else if (d.id === sourceNodeId) { fill = theme === 'dark' ? '#164e63' : '#cffafe'; stroke = theme === 'dark' ? '#22d3ee' : '#06b6d4'; strokeWidth = 3; }
         else if (d.id === destNodeId) { fill = theme === 'dark' ? '#881337' : '#ffe4e6'; stroke = theme === 'dark' ? '#fb7185' : '#f43f5e'; strokeWidth = 3; }
         else if (visitedNodeIds?.includes(d.id)) { fill = theme === 'dark' ? '#082f49' : '#f0f9ff'; stroke = theme === 'dark' ? '#0369a1' : '#bae6fd'; strokeWidth = 2; }
         else if (d.id === connectStartNodeId) { fill = theme === 'dark' ? '#0c4a6e' : '#e0f2fe'; stroke = (theme === 'dark' ? '#38bdf8' : '#0284c7'); strokeWidth = 3; }
"""

# The existing block starts with `let fill = theme === 'dark' ? '#27272a' : 'white';`
# and ends right before `d3.select(this)`
pattern = r"let fill = theme === 'dark' \? '#27272a' : 'white';[\s\S]*?else if \(d\.id === connectStartNodeId\) \{[^}]+\}"
content = re.sub(pattern, replace_color_logic(None).strip(), content)

# Initial enter colors
content = content.replace(".attr('fill', theme === 'dark' ? '#27272a' : 'white')", ".attr('fill', theme === 'dark' ? 'rgba(24, 24, 27, 0.7)' : 'rgba(255, 255, 255, 0.7)')")
content = content.replace("stroke = (theme === 'dark' ? '#3f3f46' : '#e4e4e7')", "stroke = (theme === 'dark' ? '#3f3f46' : '#e4e4e7')")

# Edges
# .attr('stroke', d => (activeEdgeId === d.id || pathEdgeIds?.includes(d.id)) ? (theme === 'dark' ? '#60a5fa' : '#3b82f6') : (theme === 'dark' ? '#3f3f46' : '#d1d5db'))
# Change to match the new cyan/sky path focus
content = content.replace("(theme === 'dark' ? '#60a5fa' : '#3b82f6')", "(theme === 'dark' ? '#38bdf8' : '#0284c7')")

with open('src/components/GraphCanvas.tsx', 'w') as f:
    f.write(content)

print("Updated GraphCanvas.tsx")
