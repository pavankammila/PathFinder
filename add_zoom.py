import re
import os

filepath = 'src/components/GraphCanvas.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Add Maximize import
content = content.replace("import { Node, Edge } from '../types';", "import { Node, Edge } from '../types';\nimport { Focus } from 'lucide-react';")

# Add zoom behavior ref
content = content.replace(
    '  const svgRef = useRef<SVGSVGElement>(null);',
    '  const svgRef = useRef<SVGSVGElement>(null);\n  const zoomBehavior = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);'
)

# Update bg-catcher to use layer node for pointer
old_bg_catcher = """        .on('click', (event) => {
          const [x, y] = d3.pointer(event);
          callbacks.current.onCanvasClick(x, y);
        });"""

new_bg_catcher = """        .on('click', (event) => {
          const layerNode = svg.select('.graph-layer').node() as SVGGElement;
          const [x, y] = d3.pointer(event, layerNode);
          callbacks.current.onCanvasClick(x, y);
        });

      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => {
          svg.select('.graph-layer').attr('transform', event.transform);
        });
      svg.call(zoom).on('dblclick.zoom', null);
      zoomBehavior.current = zoom;"""
      
content = content.replace(old_bg_catcher, new_bg_catcher)

# Update return value to include wrapper and center button
old_return = """  return <svg ref={svgRef} className="w-full h-full outline-none" tabIndex={0} />;"""

new_return = """  const handleCenter = () => {
    if (!svgRef.current || !zoomBehavior.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(750).call(zoomBehavior.current.transform, d3.zoomIdentity);
  };

  return (
    <div className="w-full h-full relative">
      <svg ref={svgRef} className="w-full h-full outline-none" tabIndex={0} />
      <button 
        onClick={handleCenter}
        className="absolute bottom-6 right-6 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:outline-none z-20"
        title="Center Graph"
      >
        <Focus className="w-4 h-4" />
      </button>
    </div>
  );"""

content = content.replace(old_return, new_return)

with open(filepath, 'w') as f:
    f.write(content)

print("Zoom logic added")
