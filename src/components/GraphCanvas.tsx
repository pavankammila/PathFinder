import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Node, Edge } from '../types';
import { Focus } from 'lucide-react';

interface GraphCanvasProps {
  nodes: Node[];
  edges: Edge[];
  mode: string;
  sourceNodeId: string | null;
  destNodeId: string | null;
  connectStartNodeId: string | null;
  activeNodeId?: string | null;
  activeEdgeId?: string | null;
  visitedNodeIds?: string[];
  pathNodeIds?: string[];
  pathEdgeIds?: string[];
  distances?: Record<string, number>;
  theme?: "light" | "dark";
  readonly?: boolean;
  onNodeClick: (nodeId: string) => void;
  onNodeDoubleClick?: (nodeId: string) => void;
  onEdgeClick: (edgeId: string) => void;
  onCanvasClick: (x: number, y: number) => void;
  onNodeMove: (nodeId: string, x: number, y: number) => void;
}

export function GraphCanvas({
  nodes, edges, mode, sourceNodeId, destNodeId, connectStartNodeId,
  activeNodeId, activeEdgeId, visitedNodeIds, pathNodeIds, pathEdgeIds,
  distances, readonly, theme = "light",
  onNodeClick, onNodeDoubleClick, onEdgeClick, onCanvasClick, onNodeMove
}: GraphCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomBehavior = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const callbacks = useRef({ onNodeClick, onNodeDoubleClick, onEdgeClick, onCanvasClick, onNodeMove });
  const nodesRef = useRef(nodes);

  useEffect(() => {
    callbacks.current = { onNodeClick, onNodeDoubleClick, onEdgeClick, onCanvasClick, onNodeMove };
    nodesRef.current = nodes;
  }, [onNodeClick, onNodeDoubleClick, onEdgeClick, onCanvasClick, onNodeMove, nodes]);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    if (svg.select('.graph-layer').empty()) {
      const defs = svg.append('defs');
      
      const createMarker = (id: string, color: string) => {
        defs.append('marker')
          .attr('id', id)
          .attr('viewBox', '0 -5 10 10')
          .attr('refX', 8)
          .attr('refY', 0)
          .attr('markerWidth', 6)
          .attr('markerHeight', 6)
          .attr('orient', 'auto')
          .append('path')
          .attr('d', 'M0,-5L10,0L0,5')
          .attr('fill', color);
      };

      createMarker('arrow-default', (theme === 'dark' ? '#52525b' : '#d4d4d8'));
      createMarker('arrow-active', (theme === 'dark' ? '#fbbf24' : '#f59e0b'));
      createMarker('arrow-path', (theme === 'dark' ? '#818cf8' : '#4f46e5'));

      const layer = svg.append('g').attr('class', 'graph-layer');
      layer.append('g').attr('class', 'edges-layer');
      layer.append('g').attr('class', 'nodes-layer');
      
      svg.append('rect')
        .attr('class', 'bg-catcher')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('fill', 'transparent')
        .lower()
        .on('click', (event) => {
          if (event.defaultPrevented) return;
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
      zoomBehavior.current = zoom;
    }

    const layer = svg.select('.graph-layer');

    // EDGES
    const edgesSelection = layer.select('.edges-layer')
      .selectAll<SVGGElement, Edge>('.edge-group')
      .data(edges, d => d.id);

    const edgesEnter = edgesSelection.enter()
      .append('g')
      .attr('class', 'edge-group')
      .on('click', (event, d) => {
        if (event.defaultPrevented) return;
        event.stopPropagation();
        callbacks.current.onEdgeClick(d.id);
      });

    edgesEnter.append('path').attr('class', 'edge-path');
    edgesEnter.append('rect').attr('class', 'edge-label-bg');
    edgesEnter.append('text').attr('class', 'edge-label');

    const edgesMerge = edgesEnter.merge(edgesSelection);

    const calculatePath = (d: Edge) => {
      const source = nodesRef.current.find(n => n.id === d.source);
      const target = nodesRef.current.find(n => n.id === d.target);
      if (!source || !target) return '';
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      if (length === 0) return '';
      const ratio = Math.max(0, (length - 22) / length);
      const endX = source.x + dx * ratio;
      const endY = source.y + dy * ratio;
      return `M${source.x},${source.y} L${endX},${endY}`;
    };

    const getMidPoint = (d: Edge) => {
      const source = nodesRef.current.find(n => n.id === d.source);
      const target = nodesRef.current.find(n => n.id === d.target);
      if (!source || !target) return { x: 0, y: 0 };
      return { x: (source.x + target.x) / 2, y: (source.y + target.y) / 2 };
    };

    const edgePaths = edgesMerge.select('.edge-path');

    edgePaths
      .attr('d', calculatePath)
      .each(function(d) {
         const el = d3.select(this);
         const isPath = pathEdgeIds?.includes(d.id);
         const isActive = activeEdgeId === d.id;
         
         const stroke = isPath ? (theme === 'dark' ? '#818cf8' : '#4f46e5') : (isActive ? (theme === 'dark' ? '#fbbf24' : '#f59e0b') : (theme === 'dark' ? '#52525b' : '#d4d4d8'));
         const width = (isPath || isActive) ? 3 : 2;
         const marker = isPath ? 'url(#arrow-path)' : (isActive ? 'url(#arrow-active)' : 'url(#arrow-default)');
         
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         const state = (this as any).__edgeState || {};
         
         if (isPath) {
             const idx = pathEdgeIds!.indexOf(d.id);
             el.transition().delay(idx * 150).duration(250)
               .attr('stroke', stroke)
               .attr('stroke-width', width)
               .attr('stroke-dasharray', null)
               .attr('stroke-dashoffset', null)
               .attr('marker-end', d.directed ? marker : null);
         } else if (isActive && !state.wasActive) {
             const source = nodesRef.current.find(n => n.id === d.source);
             const target = nodesRef.current.find(n => n.id === d.target);
             const len = (source && target) ? Math.sqrt(Math.pow(target.x - source.x, 2) + Math.pow(target.y - source.y, 2)) : 1000;
             el.attr('stroke-dasharray', len)
               .attr('stroke-dashoffset', len)
               .attr('stroke', stroke)
               .attr('stroke-width', width)
               .attr('marker-end', d.directed ? marker : null)
               .transition().duration(400).ease(d3.easeCubicOut)
               .attr('stroke-dashoffset', 0)
               .on('end', function() {
                  d3.select(this).attr('stroke-dasharray', null).attr('stroke-dashoffset', null);
               });
         } else {
             el.transition().duration(250)
               .attr('stroke', stroke)
               .attr('stroke-width', width)
               .attr('stroke-dasharray', null)
               .attr('stroke-dashoffset', null)
               .attr('marker-end', d.directed ? marker : null);
         }
         
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         (this as any).__edgeState = { wasActive: isActive };
      });

    edgePaths
      .attr('fill', 'none')
      .style('cursor', (mode === 'DELETE' || mode === 'DEFAULT') ? 'pointer' : 'default')
      .on('mouseover', function() {
        if (mode === 'DELETE') {
          d3.select(this).attr('stroke', '#ef4444').attr('stroke-width', 3);
        } else if (mode === 'DEFAULT') {
          d3.select(this).attr('stroke', (theme === 'dark' ? '#818cf8' : '#4f46e5')).attr('stroke-width', 3);
        }
      })
      .on('mouseout', function(event, d) {
        if (mode === 'DELETE' || mode === 'DEFAULT') {
           const stroke = pathEdgeIds?.includes(d.id) ? (theme === 'dark' ? '#818cf8' : '#4f46e5') : (activeEdgeId === d.id ? (theme === 'dark' ? '#fbbf24' : '#f59e0b') : (theme === 'dark' ? '#52525b' : '#d4d4d8'));
           const width = (pathEdgeIds?.includes(d.id) || activeEdgeId === d.id) ? 3 : 2;
           d3.select(this).attr('stroke', stroke).attr('stroke-width', width);
        }
      });

    edgesMerge.select('.edge-label-bg')
      .attr('x', d => getMidPoint(d).x - 12)
      .attr('y', d => getMidPoint(d).y - 8)
      .attr('width', 24)
      .attr('height', 16)
      .attr('rx', 2)
      .attr('fill', theme === 'dark' ? '#27272a' : 'white')
      .attr('stroke', (theme === 'dark' ? '#3f3f46' : '#e4e4e7'));

    edgesMerge.select('.edge-label')
      .attr('x', d => getMidPoint(d).x)
      .attr('y', d => getMidPoint(d).y + 3)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'monospace')
      .attr('font-size', '10px')
      .attr('fill', (theme === 'dark' ? '#a1a1aa' : '#71717a'))
      .text(d => d.weight);

    edgesSelection.exit().remove();

    // NODES
    const nodesSelection = layer.select('.nodes-layer')
      .selectAll<SVGGElement, Node>('.node-group')
      .data(nodes, d => d.id);

    const nodesEnter = nodesSelection.enter()
      .append('g')
      .attr('class', 'node-group')
      .on('click', function(event, d) {
        if (event.defaultPrevented) return;
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
      });

    nodesEnter.append('circle').attr('class', 'node-bg');
    nodesEnter.append('text').attr('class', 'node-label');
    nodesEnter.append('text').attr('class', 'node-distance');

    const drag = d3.drag<SVGGElement, Node>()
      .filter(() => mode === 'DEFAULT')
      .on('start', function(event) { d3.select(this).raise(); })
      .on('drag', function(event, d) {
        const newX = event.x;
        const newY = event.y;
        d3.select(this).attr('transform', `translate(${newX},${newY})`);
        
        layer.select('.edges-layer').selectAll<SVGGElement, Edge>('.edge-group')
          .filter(e => e.source === d.id || e.target === d.id)
          .each(function(e) {
            const group = d3.select(this);
            const s = e.source === d.id ? {x: newX, y: newY} : nodesRef.current.find(n => n.id === e.source)!;
            const t = e.target === d.id ? {x: newX, y: newY} : nodesRef.current.find(n => n.id === e.target)!;
            if(s && t) {
              const dx = t.x - s.x;
              const dy = t.y - s.y;
              const length = Math.sqrt(dx * dx + dy * dy);
              if (length > 0) {
                const ratio = Math.max(0, (length - 22) / length);
                const endX = s.x + dx * ratio;
                const endY = s.y + dy * ratio;
                group.select('.edge-path').attr('d', `M${s.x},${s.y} L${endX},${endY}`);
              }
              
              group.select('.edge-label-bg')
                .attr('x', (s.x + t.x)/2 - 12)
                .attr('y', (s.y + t.y)/2 - 8);
              group.select('.edge-label')
                .attr('x', (s.x + t.x)/2)
                .attr('y', (s.y + t.y)/2 + 3);
            }
          });
      })
      .on('end', function(event, d) {
        callbacks.current.onNodeMove(d.id, event.x, event.y);
      });

    nodesEnter.call(drag);

    const nodesMerge = nodesEnter.merge(nodesSelection);
    nodesMerge.attr('transform', d => `translate(${d.x},${d.y})`);
    
    nodesMerge.select('.node-bg')
      .each(function(d) {
         const el = d3.select(this);
         
         let fill = theme === 'dark' ? '#27272a' : 'white';
         let stroke = theme === 'dark' ? '#f4f4f5' : '#18181b';
         let strokeWidth = 2;

         if (pathNodeIds?.includes(d.id)) { fill = theme === 'dark' ? '#3730a3' : '#c7d2fe'; stroke = (theme === 'dark' ? '#818cf8' : '#4f46e5'); strokeWidth = 3; }
         else if (activeNodeId === d.id) { fill = theme === 'dark' ? '#854d0e' : '#fef08a'; stroke = theme === 'dark' ? '#fde047' : '#ca8a04'; strokeWidth = 3; }
         else if (d.id === sourceNodeId) { fill = theme === 'dark' ? '#14532d' : '#dcfce7'; stroke = theme === 'dark' ? '#4ade80' : '#16a34a'; strokeWidth = 2; }
         else if (d.id === destNodeId) { fill = theme === 'dark' ? '#7f1d1d' : '#fee2e2'; stroke = theme === 'dark' ? '#f87171' : '#dc2626'; strokeWidth = 2; }
         else if (visitedNodeIds?.includes(d.id)) { fill = theme === 'dark' ? '#3f3f46' : '#f4f4f5'; stroke = theme === 'dark' ? '#71717a' : '#a1a1aa'; strokeWidth = 2; }
         else if (d.id === connectStartNodeId) { fill = theme === 'dark' ? '#312e81' : '#e0e7ff'; stroke = (theme === 'dark' ? '#818cf8' : '#4f46e5'); strokeWidth = 3; }
         
         const curDist = distances ? distances[d.id] : undefined;
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         const nodeState = (this as any).__nodeState || {};
         const isPath = pathNodeIds?.includes(d.id);
         
         if (isPath && !nodeState.wasPath) {
             const idx = pathNodeIds!.indexOf(d.id);
             el.transition().delay(idx * 150).duration(250)
               .attr('r', 20)
               .attr('fill', fill)
               .attr('stroke', stroke)
               .attr('stroke-width', strokeWidth)
               .transition().duration(200)
               .attr('r', 18);
         } else if (curDist !== undefined && nodeState.lastDist !== undefined && curDist !== nodeState.lastDist) {
            el.transition().duration(150)
              .attr('r', 22)
              .attr('fill', (theme === 'dark' ? '#78350f' : '#fef3c7'))
              .attr('stroke', (theme === 'dark' ? '#fbbf24' : '#f59e0b'))
              .attr('stroke-width', 3)
              .transition().duration(400)
              .attr('r', 18)
              .attr('fill', fill)
              .attr('stroke', stroke)
              .attr('stroke-width', strokeWidth);
         } else {
            el.transition().duration(250)
              .attr('r', 18)
              .attr('fill', fill)
              .attr('stroke', stroke)
              .attr('stroke-width', strokeWidth);
         }
         
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         (this as any).__nodeState = { lastDist: curDist, wasPath: isPath };
      });
      
    nodesMerge.select('.node-bg')
      .style('cursor', mode === 'ADD_NODE' ? 'default' : 'pointer')
      .on('mouseover', function() {
        if (mode !== 'ADD_NODE') d3.select(this).attr('stroke-width', 3);
        if (mode === 'DELETE') d3.select(this).attr('stroke', '#ef4444');
      })
      .on('mouseout', function(event, d) {
        if (mode === 'DELETE') {
          const defaultStroke = (pathNodeIds?.includes(d.id) || d.id === connectStartNodeId) ? (theme === 'dark' ? '#818cf8' : '#4f46e5') : activeNodeId === d.id ? '#ca8a04' : d.id === sourceNodeId ? '#16a34a' : (d.id === destNodeId ? '#dc2626' : (visitedNodeIds?.includes(d.id) ? (theme === 'dark' ? '#71717a' : '#a1a1aa') : (theme === 'dark' ? '#f4f4f5' : '#18181b')));
          d3.select(this).attr('stroke', defaultStroke);
        }
        const defaultWidth = (pathNodeIds?.includes(d.id) || activeNodeId === d.id || d.id === connectStartNodeId) ? 3 : 2;
        d3.select(this).attr('stroke-width', defaultWidth);
      });

    nodesMerge.select('.node-label')
      .attr('text-anchor', 'middle')
      .attr('y', 4)
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('fill', theme === 'dark' ? '#f4f4f5' : '#18181b')
      .text(d => d.label)
      .style('pointer-events', 'none');

    nodesMerge.select('.node-distance')
      .attr('text-anchor', 'middle')
      .attr('y', -24)
      .each(function(d) {
         const el = d3.select(this);
         const curDist = distances ? distances[d.id] : undefined;
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         const state = (this as any).__distState || {};
         
         if (curDist === undefined) {
            el.text('');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (this as any).__distState = { last: curDist };
            return;
         }
         
         const formatDist = (val: number) => val === Infinity ? '∞' : val.toString();
         const cStr = formatDist(curDist);
         
         if (state.last !== undefined && curDist !== state.last) {
            const pStr = formatDist(state.last);
            el.text(`${pStr} → ${cStr}`)
              .attr('fill', (theme === 'dark' ? '#fbbf24' : '#f59e0b'))
              .attr('font-weight', 'bold')
              .attr('font-size', '12px')
              .transition().duration(600).delay(400)
              .attr('fill', (theme === 'dark' ? '#a1a1aa' : '#71717a'))
              .attr('font-size', '10px')
              .attr('font-weight', '600')
              .on('end', function() {
                 d3.select(this).text(cStr);
              });
         } else {
            const activeTransition = d3.active(this);
            if (!activeTransition) {
               el.text(cStr)
                 .attr('fill', (theme === 'dark' ? '#a1a1aa' : '#71717a'))
                 .attr('font-weight', '600')
                 .attr('font-size', '10px');
            }
         }
         
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         (this as any).__distState = { last: curDist };
      });

    nodesSelection.exit().remove();

  }, [nodes, edges, mode, sourceNodeId, destNodeId, connectStartNodeId, activeNodeId, activeEdgeId, visitedNodeIds, pathNodeIds, pathEdgeIds, distances, readonly, theme = "light"]);

  const handleCenter = () => {
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
  );
}
