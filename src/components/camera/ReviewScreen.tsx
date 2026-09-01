import React, { useState, useEffect } from 'react';
import { DetectedGraph, DetectedNode, DetectedEdge } from '../../camera/types';
import { AlertTriangle, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Graph, Node, Edge } from '../../types';

interface ReviewScreenProps {
  initialGraph: DetectedGraph;
  imageUrl: string;
  existingGraph: Graph;
  onImport: (graph: Graph) => void;
  onCancel: () => void;
}

type ReviewNode = DetectedNode & { isNew?: boolean };
type ReviewEdge = DetectedEdge & { isNew?: boolean };

export function ReviewScreen({ initialGraph, imageUrl, existingGraph, onImport, onCancel }: ReviewScreenProps) {
  const [importMode, setImportMode] = useState<'REPLACE' | 'MERGE'>(
    existingGraph.nodes.length > 0 ? 'MERGE' : 'REPLACE'
  );

  const [nodes, setNodes] = useState<ReviewNode[]>([]);
  const [edges, setEdges] = useState<ReviewEdge[]>([]);
  
  const [isValid, setIsValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (importMode === 'REPLACE') {
      setNodes(initialGraph.nodes.map(n => ({ ...n, isNew: true })));
      setEdges(initialGraph.edges.map(e => ({ ...e, isNew: true })));
    } else {
      const mergedNodes = [
        ...existingGraph.nodes.map(n => ({ ...n, confidence: 1, isNew: false })),
        ...initialGraph.nodes.map(n => ({ ...n, isNew: true, id: `new_${n.id}` }))
      ];
      
      const newEdges = initialGraph.edges.map(e => ({
        ...e,
        isNew: true,
        source: `new_${e.source}`,
        target: `new_${e.target}`,
        id: `new_${e.id}`
      }));
      
      const mergedEdges = [
        ...existingGraph.edges.map(e => ({ ...e, confidence: 1, isNew: false })),
        ...newEdges
      ];
      
      setNodes(mergedNodes);
      setEdges(mergedEdges);
    }
  }, [importMode, initialGraph, existingGraph]);

  useEffect(() => {
    validateGraph();
  }, [nodes, edges]);

  const validateGraph = () => {
    const errors: string[] = [];
    if (nodes.length === 0) errors.push("Graph must have at least one node.");
    const duplicateLabels = nodes.filter((n, i, a) => a.findIndex(n2 => n2.label === n.label) !== i);
    if (duplicateLabels.length > 0) errors.push("Node labels must be unique.");
    const invalidEdges = edges.filter(e => !nodes.some(n => n.id === e.source) || !nodes.some(n => n.id === e.target));
    if (invalidEdges.length > 0) errors.push("Some edges reference deleted nodes.");
    const invalidWeights = edges.filter(e => isNaN(e.weight) || e.weight < 0);
    if (invalidWeights.length > 0) errors.push("Weights must be valid non-negative numbers.");
    
    setValidationErrors(errors);
    setIsValid(errors.length === 0);
  };

  const handleImport = () => {
    if (importMode === 'REPLACE' && existingGraph.nodes.length > 0 && !showConfirm) {
      setShowConfirm(true);
      return;
    }
    if (isValid) {
      onImport({ nodes, edges });
    }
  };

  const updateNodeLabel = (id: string, label: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, label } : n));
  };

  const deleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.source !== id && e.target !== id));
  };

  const addNode = () => {
    const id = `n${Date.now()}`;
    setNodes(prev => [...prev, { id, label: `N${prev.length + 1}`, x: 100, y: 100, confidence: 1, isNew: true }]);
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
    setEdges(prev => [...prev, { id, source: nodes[0].id, target: nodes[1].id, weight: 1, directed: false, confidence: 1, isNew: true }]);
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
              <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded hover:bg-zinc-200 dark:bg-zinc-700 transition-colors">CANCEL</button>
              <button onClick={handleImport} className="flex-1 px-4 py-2 text-xs font-bold text-white dark:text-zinc-900 bg-indigo-600 rounded hover:bg-indigo-700 transition-colors">IMPORT</button>
            </div>
          </div>
        </div>
      )}
      
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">REVIEW DETECTED GRAPH</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Check the detected nodes, edges and weights before importing.</p>
        </div>
        <div className="flex gap-2 items-center w-full sm:w-auto">
          {existingGraph.nodes.length > 0 && (
            <div className="flex rounded overflow-hidden border border-zinc-200 dark:border-zinc-800 mr-2">
              <button 
                onClick={() => setImportMode('MERGE')}
                className={`px-3 py-1.5 text-[10px] font-bold transition-colors ${importMode === 'MERGE' ? 'bg-indigo-600 text-white dark:text-zinc-900' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
              >
                MERGE
              </button>
              <button 
                onClick={() => setImportMode('REPLACE')}
                className={`px-3 py-1.5 text-[10px] font-bold transition-colors ${importMode === 'REPLACE' ? 'bg-indigo-600 text-white dark:text-zinc-900' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
              >
                REPLACE
              </button>
            </div>
          )}
          <button onClick={onCancel} className="px-4 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">CANCEL</button>
          <button onClick={handleImport} disabled={!isValid} className="px-4 py-2 text-xs font-bold text-white dark:text-zinc-900 bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">IMPORT GRAPH</button>
        </div>
      </div>
      
      <div className="flex flex-1 min-h-0 flex-col md:flex-row">
        {/* Left: Image */}
        <div className="w-full md:w-1/2 p-4 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/50 flex items-center justify-center relative overflow-hidden h-48 md:h-auto">
          <img src={imageUrl} alt="Captured" className="max-w-full max-h-full object-contain drop-shadow-sm rounded" />
        </div>
        
        {/* Right: Data */}
        <div className="w-full md:w-1/2 overflow-y-auto p-4 bg-white dark:bg-zinc-900 flex flex-col gap-6">
          {initialGraph.warnings && initialGraph.warnings.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3 rounded text-amber-800 dark:text-amber-500 text-xs">
              <div className="font-bold mb-1 flex items-center gap-1"><AlertTriangle className="w-4 h-4"/> Warnings</div>
              <ul className="list-disc pl-4 space-y-1">
                {initialGraph.warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}
          
          {validationErrors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-3 rounded text-red-800 dark:text-red-400 text-xs">
              <div className="font-bold mb-1 flex items-center gap-1"><AlertCircle className="w-4 h-4"/> Invalid Graph</div>
              <ul className="list-disc pl-4 space-y-1">
                {validationErrors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold tracking-wider text-zinc-800 dark:text-zinc-200">NODES</h3>
              <button onClick={addNode} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold flex items-center gap-1 transition-colors"><Plus className="w-3 h-3"/> ADD NODE</button>
            </div>
            <div className="space-y-2">
              {nodes.map(n => (
                <div key={n.id} className={`flex items-center gap-2 p-2 rounded border transition-colors ${n.isNew ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800/50' : 'bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800'}`}>
                  <input 
                    type="text" 
                    value={n.label} 
                    onChange={e => updateNodeLabel(n.id, e.target.value)}
                    className="w-16 px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                  <div className="flex-1"></div>
                  {n.isNew && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/50 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">NEW</span>}
                  {n.confidence < 0.8 && <span className="text-[9px] text-amber-700 dark:text-amber-500 font-bold bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/50 px-1.5 py-0.5 rounded">REVIEW</span>}
                  <button onClick={() => deleteNode(n.id)} className="text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 p-1 rounded transition-colors"><Trash2 className="w-3 h-3"/></button>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold tracking-wider text-zinc-800 dark:text-zinc-200">EDGES</h3>
              <button onClick={addEdge} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold flex items-center gap-1 transition-colors"><Plus className="w-3 h-3"/> ADD EDGE</button>
            </div>
            <div className="space-y-2">
              {edges.map(e => {
                const sLabel = nodes.find(n => n.id === e.source)?.label || '???';
                const tLabel = nodes.find(n => n.id === e.target)?.label || '???';
                
                return (
                  <div key={e.id} className={`flex items-center gap-2 p-2 rounded border transition-colors ${e.isNew ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800/50' : 'bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800'}`}>
                    <div className="font-mono text-xs text-zinc-600 dark:text-zinc-400 font-bold w-12 truncate text-right">{sLabel}</div>
                    <div className="text-zinc-400 dark:text-zinc-600 text-xs">→</div>
                    <div className="font-mono text-xs text-zinc-600 dark:text-zinc-400 font-bold w-12 truncate">{tLabel}</div>
                    
                    <input 
                      type="number" 
                      value={isNaN(e.weight) ? '' : e.weight} 
                      onChange={ev => updateEdgeWeight(e.id, ev.target.value)}
                      placeholder="WT"
                      className={`w-16 px-2 py-1 text-xs border rounded font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none ${isNaN(e.weight) || e.weight < 0 ? 'border-red-400 bg-red-50 text-red-900' : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100'}`}
                    />
                    
                    <button 
                      onClick={() => setEdges(prev => prev.map(ev => ev.id === e.id ? { ...ev, directed: !ev.directed } : ev))}
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border transition-colors ${e.directed ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-400' : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400'}`}
                      title="Toggle Directed"
                    >
                      {e.directed ? 'DIR' : 'UNDIR'}
                    </button>
                    
                    <div className="flex-1"></div>
                    {e.isNew && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/50 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">NEW</span>}
                    {e.confidence < 0.8 && <span className="text-[9px] text-amber-700 dark:text-amber-500 font-bold bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/50 px-1.5 py-0.5 rounded">REVIEW</span>}
                    <button onClick={() => deleteEdge(e.id)} className="text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 p-1 rounded transition-colors"><Trash2 className="w-3 h-3"/></button>
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
