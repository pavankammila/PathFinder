import React, { useState, useEffect } from 'react';
import { X, Play, Loader2 } from 'lucide-react';
import { Graph, AlgorithmType } from '../types';
import { algorithmMetadata } from '../algorithms/metadata';
import { validateAlgorithmRequirements } from '../algorithms/validation';
import * as algos from '../algorithms';

interface CompareAlgorithmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  graph: Graph;
  sourceId: string | null;
  destId: string | null;
}

interface RunResult {
  algorithm: AlgorithmType;
  success: boolean;
  message?: string;
  cost?: number;
  nodesVisited?: number;
  edgesExplored?: number;
  executionTimeMs?: number;
}

export function CompareAlgorithmsModal({ isOpen, onClose, graph, sourceId, destId }: CompareAlgorithmsModalProps) {
  const [selectedAlgos, setSelectedAlgos] = useState<Set<AlgorithmType>>(new Set([
    AlgorithmType.BFS, AlgorithmType.DIJKSTRA, AlgorithmType.BELLMAN_FORD
  ]));
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<RunResult[]>([]);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleAlgo = (algo: AlgorithmType) => {
    const next = new Set(selectedAlgos);
    if (next.has(algo)) {
      next.delete(algo);
    } else {
      next.add(algo);
    }
    setSelectedAlgos(next);
  };

  const handleRunComparison = async () => {
    if (selectedAlgos.size === 0) return;
    setIsRunning(true);
    setResults([]);

    const runResults: RunResult[] = [];
    
    // We run sequentially to avoid blocking the main thread entirely, 
    // and using setTimeout to yield so the UI can update
    for (const algo of Array.from(selectedAlgos)) {
      await new Promise(resolve => setTimeout(resolve, 10)); // Yield to paint

      const validation = validateAlgorithmRequirements(graph, algo, sourceId, destId);
      if (!validation.valid) {
        runResults.push({
          algorithm: algo,
          success: false,
          message: validation.message
        });
        continue;
      }

      // Clone graph conceptually (we only read, so it's fine)
      const t0 = performance.now();
      let res;
      try {
        switch (algo) {
          case AlgorithmType.BFS: res = algos.runBFS(graph, sourceId!, destId); break;
          case AlgorithmType.DIJKSTRA: res = algos.runDijkstra(graph, sourceId!, destId); break;
          case AlgorithmType.BELLMAN_FORD: res = algos.runBellmanFord(graph, sourceId!, destId); break;
          case AlgorithmType.FLOYD_WARSHALL: res = algos.runFloydWarshall(graph, sourceId!, destId); break;
          case AlgorithmType.DAG_SHORTEST_PATH: res = algos.runDAGShortestPath(graph, sourceId!, destId); break;
          case AlgorithmType.A_STAR: res = algos.runAStar(graph, sourceId!, destId); break;
          case AlgorithmType.JOHNSON: res = algos.runJohnson(graph); break;
          case AlgorithmType.BIDIRECTIONAL: res = algos.runBidirectional(graph, sourceId!, destId); break;
          case AlgorithmType.DIAL: res = algos.runDial(graph, sourceId!, destId); break;
          case AlgorithmType.SPFA: res = algos.runSPFA(graph, sourceId!, destId); break;
        }
        const t1 = performance.now();

        if (res?.error || res?.negativeCycle) {
          runResults.push({
            algorithm: algo,
            success: false,
            message: res.error || 'Failed'
          });
        } else {
          runResults.push({
            algorithm: algo,
            success: true,
            cost: res?.totalCost,
            nodesVisited: res?.nodesVisited,
            edgesExplored: res?.edgesExplored,
            executionTimeMs: t1 - t0
          });
        }
      } catch (e: any) {
        runResults.push({
          algorithm: algo,
          success: false,
          message: e.message || 'Error'
        });
      }
      setResults([...runResults]);
    }
    
    setIsRunning(false);
  };

  const algoList = Object.values(AlgorithmType);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Compare Algorithms</h2>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col md:flex-row gap-6">
          
          {/* Selection Panel */}
          <div className="w-full md:w-1/3 flex flex-col gap-4">
            <div>
              <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Select Algorithms</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">Choose which algorithms to run on the current graph state. Identical source and destination nodes will be used.</p>
              
              <div className="space-y-1 max-h-[40vh] overflow-y-auto pr-2">
                {algoList.map(a => (
                  <label key={a} className="flex items-center gap-3 p-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors">
                    <input 
                      type="checkbox" 
                      className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
                      checked={selectedAlgos.has(a)}
                      onChange={() => toggleAlgo(a)}
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{algorithmMetadata[a].name}</span>
                      <span className="text-[10px] text-zinc-500">{algorithmMetadata[a].timeComplexity}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleRunComparison}
              disabled={isRunning || selectedAlgos.size === 0}
              className="mt-auto w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-3 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {isRunning ? 'Running...' : 'Run Comparison'}
            </button>
          </div>

          {/* Results Panel */}
          <div className="w-full md:w-2/3 border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800 pt-6 md:pt-0 md:pl-6 flex flex-col">
            <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-4">Results</h3>
            
            {results.length === 0 && !isRunning ? (
              <div className="flex-1 flex items-center justify-center text-center p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                <p className="text-sm text-zinc-500">Select algorithms and click Run Comparison to see performance metrics based on the current graph.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase tracking-wider">
                      <th className="pb-3 pr-4 font-semibold">Algorithm</th>
                      <th className="pb-3 px-4 font-semibold text-right">Cost</th>
                      <th className="pb-3 px-4 font-semibold text-right">Nodes Visited</th>
                      <th className="pb-3 px-4 font-semibold text-right">Edges Explored</th>
                      <th className="pb-3 pl-4 font-semibold text-right">Time (ms)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, idx) => (
                      <tr key={idx} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/20">
                        <td className="py-3 pr-4 font-medium text-zinc-900 dark:text-zinc-100">
                          {algorithmMetadata[r.algorithm].name}
                          {!r.success && <span className="block text-[10px] text-red-500 font-normal mt-0.5">{r.message}</span>}
                        </td>
                        {r.success ? (
                          <>
                            <td className="py-3 px-4 text-right text-zinc-600 dark:text-zinc-400 font-mono">{r.cost !== undefined && r.cost !== Infinity ? r.cost : '∞'}</td>
                            <td className="py-3 px-4 text-right text-zinc-600 dark:text-zinc-400 font-mono">{r.nodesVisited}</td>
                            <td className="py-3 px-4 text-right text-zinc-600 dark:text-zinc-400 font-mono">{r.edgesExplored}</td>
                            <td className="py-3 pl-4 text-right text-zinc-600 dark:text-zinc-400 font-mono">
                              {r.executionTimeMs !== undefined ? r.executionTimeMs.toFixed(2) : '--'}
                            </td>
                          </>
                        ) : (
                          <td colSpan={4} className="py-3 pl-4 text-right text-zinc-400 dark:text-zinc-600 italic">Not applicable / Failed</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Context Notice */}
            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                <strong>Note:</strong> Performance metrics (execution time) run in the browser UI thread and may vary. 
                Algorithms designated as "All-Pairs" (e.g. Floyd-Warshall, Johnson) process the entire graph indiscriminately, 
                so their metrics cannot be directly compared to single-source routines on the exact same basis, but are shown for scale.
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
