import re

with open('src/components/GraphCanvas.tsx', 'r') as f:
    content = f.read()

# Add state
state_code = """  const [movableNodeId, setMovableNodeId] = useState<string | null>(null);
  useEffect(() => { if (mode !== 'DEFAULT') setMovableNodeId(null); }, [mode]);
"""
content = content.replace(
    '  const svgRef = useRef<SVGSVGElement>(null);',
    state_code + '\n  const svgRef = useRef<SVGSVGElement>(null);'
)

# Update zoom disabling check: we want zoom to work unless dragging
# Oh wait, D3 zoom and D3 drag can coexist nicely. The issue is double click handling.

with open('src/components/GraphCanvas.tsx', 'w') as f:
    f.write(content)

print("Added movableNodeId")
