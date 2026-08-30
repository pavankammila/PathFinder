import re

filepath = 'src/components/GraphCanvas.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Edge click
old_edge_click = """      .on('click', (event, d) => {
        event.stopPropagation();
        callbacks.current.onEdgeClick(d.id);
      });"""
new_edge_click = """      .on('click', (event, d) => {
        if (event.defaultPrevented) return;
        event.stopPropagation();
        callbacks.current.onEdgeClick(d.id);
      });"""
content = content.replace(old_edge_click, new_edge_click)

# bg-catcher click
old_bg_click = """        .on('click', (event) => {
          const layerNode = svg.select('.graph-layer').node() as SVGGElement;"""
new_bg_click = """        .on('click', (event) => {
          if (event.defaultPrevented) return;
          const layerNode = svg.select('.graph-layer').node() as SVGGElement;"""
content = content.replace(old_bg_click, new_bg_click)

with open(filepath, 'w') as f:
    f.write(content)

