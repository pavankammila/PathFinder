import React, { useState, useEffect } from 'react';
import { DetectedGraph, DetectedNode, DetectedEdge } from '../../camera/types';
import { Check, AlertTriangle, Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { Graph, Node, Edge } from '../../types';

interface ReviewScreenProps {
  initialGraph: DetectedGraph;
  imageUrl: string;
  hasExistingGraph: boolean;
  onImport: (graph: Graph) => void;
  onCancel: () => void;
}

export function ReviewScreen({ initialGraph, imageUrl, hasExistingGraph, onImport, onCancel }: ReviewScreenProps) {
  const [nodes, setNodes] = useState<DetectedNode[]>(initialGraph.nodes);
  const [edges, setEdges] = useState<DetectedEdge[]>(initialGraph.edges);
  
  // Validation state
  const [isValid, setIsValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    validateGraph();
  }, [nodes, edges]);

  const validateGraph = () => {
    const errors: string[] = [];
    
    // Check nodes
    const nodeIds = new Set<string>();
    const nodeLabels = new Set<string>();
    
    nodes.forEach(n => {
      if (!n.label || n.label.trim() === '') {
        errors.push(`Node ${n.id} is missing a label.`);
      }
      if (nodeLabels.has(n.label)) {
        errors.push(`Duplicate node label detected: ${n.label}. Labels must be unique.`);
      }
      nodeIds.add(n.id);
      nodeLabels.add(n.label);
    });

    // Check edges
    edges.forEach((e, index) => {
      if (!nodeIds.has(e.source)) errors.push(`Edge ${index + 1} has invalid source.`);
      if (!nodeIds.has(e.target)) errors.push(`Edge ${index + 1} has invalid target.`);
      if (e.weight === undefined || isNaN(e.weight) || e.weight < 0) {
        errors.push(`Edge ${e.source}→${e.target} has invalid weight. Weight must be >= 0.`);
      }
    });

    setValidationErrors(errors);
    setIsValid(errors.length === 0);
  };

  const handleImport = () => {
    if (!isValid) return;
    
    if (hasExistingGraph && !showConfirm) {
      setShowConfirm(true);
      return;
    }
    
    const finalGraph: Graph = {
      nodes: nodes.map(n => ({ id: n.id, label: n.label, x: n.x, y: n.y })),
      edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target, weight: e.weight, directed: e.directed }))
    };
    
    onImport(finalGraph);
  };

  // Basic editing functions
  const updateNodeLabel = (id: string, label: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, label } : n));
  };
  
  const deleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.source !== id && e.target !== id));
  };
  
  const addNode = () => {
    const id = `n${Date.now()}`;
    setNodes(prev => [...prev, { id, label: `N${prev.length + 1}`, x: 100, y: 100, confidence: 1 }]);
  };
  
  const updateEdgeWeight = (id: string, weightStr: string) => {
    const weight = parseFloat(weightStr);
    setEdges(prev => prev.map(e => e.id === id ? { ...e, weight } : e));
  };
  
  const deleteEdge = (id: string) => {
    setEdges(prev => prev.filter(e => e.id !== id));
  };
  
  const addEdge = () => {
    if (nodes.length < 2) return;
    const id = `e${Date.now()}`;
    setEdges(prev => [...prev, { id, source: nodes[0].id, target: nodes[1].id, weight: 1, directed: false, confidence: 1 }]);
  };

  return (
    <div className="flex flex-col h-full relative">
      {showConfirm && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="surface-panel p-6 rounded shadow-xl w-80 text-center flex flex-col gap-4">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
            <div>
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Overwrite Graph?</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Importing this graph will replace the current graph.</p>
            </div>
            <div className="flex gap-2 w-full mt-2">
              <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded hover:bg-zinc-200 dark:bg-zinc-700">CANCEL</button>
              <button onClick={handleImport} className="flex-1 px-4 py-2 text-xs font-bold text-white dark:text-zinc-900 bg-indigo-600 rounded hover:bg-indigo-700">IMPORT</button>
            </div>
          </div>
        </div>
      )}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">REVIEW DETECTED GRAPH</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Check the detected nodes, edges and weights before importing.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 surface-panel transition-colors border border-zinc-200 dark:border-zinc-800 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800 dark:hover:bg-zinc-800">CANCEL</button>
          <button onClick={handleImport} disabled={!isValid} className="px-4 py-2 text-xs font-bold text-white dark:text-zinc-900 bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">IMPORT GRAPH</button>
        </div>
      </div>
      
      <div className="flex flex-1 min-h-0">
        {/* Left: Image */}
        <div className="w-1/2 p-4 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center relative overflow-hidden">
          <img src={imageUrl} alt="Captured" className="max-w-full max-h-full object-contain" />
          {/* Overlay markers could go here */}
        </div>
        
        {/* Right: Data */}
        <div className="w-1/2 overflow-y-auto p-4 surface-panel flex flex-col gap-6">
          {initialGraph.warnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded text-amber-800 text-xs">
              <div className="font-bold mb-1 flex items-center gap-1"><AlertTriangle className="w-4 h-4"/> Warnings</div>
              <ul className="list-disc pl-4 space-y-1">
                {initialGraph.warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}
          
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 p-3 rounded text-red-800 text-xs">
              <div className="font-bold mb-1 flex items-center gap-1"><AlertCircle className="w-4 h-4"/> Invalid Graph</div>
              <ul className="list-disc pl-4 space-y-1">
                {validationErrors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">NODES</h3>
              <button onClick={addNode} className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"><Plus className="w-3 h-3"/> ADD NODE</button>
            </div>
            <div className="space-y-2">
              {nodes.map(n => (
                <div key={n.id} className="flex items-center gap-2 p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded">
                  <input 
                    type="text" 
                    value={n.label} 
                    onChange={e => updateNodeLabel(n.id, e.target.value)}
                    className="w-16 px-2 py-1 text-xs border border-zinc-300 rounded font-mono"
                  />
                  <div className="flex-1"></div>
                  {n.confidence < 0.8 && <span className="text-[10px] text-amber-600 font-bold bg-amber-100 px-1.5 py-0.5 rounded">REVIEW</span>}
                  <button onClick={() => deleteNode(n.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 className="w-3 h-3"/></button>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">EDGES</h3>
              <button onClick={addEdge} className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"><Plus className="w-3 h-3"/> ADD EDGE</button>
            </div>
            <div className="space-y-2">
              {edges.map(e => {
                const sLabel = nodes.find(n => n.id === e.source)?.label || '???';
                const tLabel = nodes.find(n => n.id === e.target)?.label || '???';
                
                return (
                  <div key={e.id} className="flex items-center gap-2 p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded">
                    <div className="font-mono text-xs text-zinc-600 dark:text-zinc-400 font-bold w-16 truncate text-right">{sLabel}</div>
                    <div className="text-zinc-400 dark:text-zinc-500 text-xs">→</div>
                    <div className="font-mono text-xs text-zinc-600 dark:text-zinc-400 font-bold w-16 truncate">{tLabel}</div>
                    
                    <input 
                      type="number" 
                      value={isNaN(e.weight) ? '' : e.weight} 
                      onChange={ev => updateEdgeWeight(e.id, ev.target.value)}
                      placeholder="WEIGHT REQUIRED"
                      className={`w-24 px-2 py-1 text-xs border rounded font-mono ${isNaN(e.weight) || e.weight < 0 ? 'border-red-400 bg-red-50 text-red-900' : 'border-zinc-300'}`}
                    />
                    
                    <button 
                      onClick={() => setEdges(prev => prev.map(ev => ev.id === e.id ? { ...ev, directed: !ev.directed } : ev))}
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${e.directed ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400'}`}
                      title="Toggle Directed"
                    >
                      {e.directed ? 'DIR' : 'UNDIR'}
                    </button>
                    
                    <div className="flex-1"></div>
                    {e.confidence < 0.8 && <span className="text-[10px] text-amber-600 font-bold bg-amber-100 px-1.5 py-0.5 rounded">REVIEW</span>}
                    <button onClick={() => deleteEdge(e.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 className="w-3 h-3"/></button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
