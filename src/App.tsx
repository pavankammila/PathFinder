import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipForward, RotateCcw, Plus, Link2, Trash2,
  MapPin, Flag, Camera, Settings2, Map, Moon, Sun, Eraser, Bot, PanelLeftClose, PanelRightClose, PanelLeftOpen, PanelRightOpen, Undo2, Redo2
} from 'lucide-react';
import { Node, Edge, AlgorithmStep, OperationType } from './types';
import { GraphCanvas } from './components/GraphCanvas';
import { EdgeWeightPopover } from './components/EdgeWeightPopover';
import { getNextNodeLabel } from './utils/graphUtils';
import { runDijkstra, runFloydWarshall, algorithmMetadata } from './algorithms';
import { PRESETS } from './utils/presets';
import { CameraModal } from './components/CameraModal';
import { AITutorPanel } from './components/AITutorPanel';

export enum EditorMode {
  DEFAULT = 'DEFAULT',
  ADD_NODE = 'ADD_NODE',
  CONNECT = 'CONNECT',
  DELETE = 'DELETE',
  SELECT_SOURCE = 'SELECT_SOURCE',
  SELECT_DEST = 'SELECT_DEST'
}

export enum ExecutionState {
  IDLE = 'IDLE',
  READY = 'READY',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export enum AlgorithmType {
  DIJKSTRA = 'DIJKSTRA',
  FLOYD_WARSHALL = 'FLOYD_WARSHALL'
}

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("pathfinder-theme") as "light" | "dark") || "light";
    }
    return "light";
  });

  useEffect(() => {
    localStorage.setItem("pathfinder-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "light" ? "dark" : "light");

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [mode, setMode] = useState<EditorMode>(EditorMode.DEFAULT);
  
  const [sourceNodeId, setSourceNodeId] = useState<string | null>(null);
  const [destNodeId, setDestNodeId] = useState<string | null>(null);
  
  const [connectStartNodeId, setConnectStartNodeId] = useState<string | null>(null);
  const [pendingEdge, setPendingEdge] = useState<{sourceId: string, targetId: string} | null>(null);
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

  // Undo/Redo State
  const [past, setPast] = useState<{nodes: Node[], edges: Edge[]}[]>([]);
  const [future, setFuture] = useState<{nodes: Node[], edges: Edge[]}[]>([]);

  const saveHistory = useCallback((currentNodes: Node[], currentEdges: Edge[]) => {
    setPast(prev => [...prev, { nodes: [...currentNodes], edges: [...currentEdges] }]);
    setFuture([]);
  }, []);

  const handleUndo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setPast(prev => prev.slice(0, prev.length - 1));
    setFuture(prev => [{ nodes, edges }, ...prev]);
    setNodes(previous.nodes);
    setEdges(previous.edges);
    clearExecutionState();
  }, [past, nodes, edges]);

  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture(prev => prev.slice(1));
    setPast(prev => [...prev, { nodes, edges }]);
    setNodes(next.nodes);
    setEdges(next.edges);
    clearExecutionState();
  }, [future, nodes, edges]);
  const [tutorQuery, setTutorQuery] = useState<string | undefined>();
  const openCameraModal = () => setIsCameraModalOpen(true);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if ((e.key === 'y' && (e.ctrlKey || e.metaKey)) || (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey)) {
        e.preventDefault();
        handleRedo();
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [handleUndo, handleRedo]);

  // Algorithm Execution State
  const [algo, setAlgo] = useState<AlgorithmType>(AlgorithmType.DIJKSTRA);
  const [speed, setSpeed] = useState<number>(1);
  const [execState, setExecState] = useState<ExecutionState>(ExecutionState.IDLE);
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [algoResult, setAlgoResult] = useState<{ path: string[] | null, cost: number, negativeCycle?: boolean, error?: string } | null>(null);
  
  const traceEndRef = useRef<HTMLDivElement>(null);
  
  const clearExecutionState = useCallback(() => {
    setExecState(ExecutionState.IDLE);
    setSteps([]);
    setCurrentStepIndex(-1);
    setAlgoResult(null);
  }, []);




  const showError = useCallback((msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 3000);
  }, []);

  const prepareExecution = useCallback((): boolean => {
    if (!sourceNodeId) {
      showError("SELECT A SOURCE NODE");
      return false;
    }
    if (!destNodeId) {
      showError("SELECT A DESTINATION NODE");
      return false;
    }
    
    if (algo === AlgorithmType.DIJKSTRA) {
      const hasNegativeWeight = edges.some(e => e.weight < 0);
      if (hasNegativeWeight) {
        showError("DIJKSTRA CANNOT RUN: Dijkstra's algorithm requires non-negative edge weights.");
        return false;
      }
    }
    
    let res;
    if (algo === AlgorithmType.DIJKSTRA) {
      res = runDijkstra({ nodes, edges }, sourceNodeId, destNodeId);
    } else {
      res = runFloydWarshall({ nodes, edges }, sourceNodeId, destNodeId);
    }

    if (res.error) {
      showError(res.error);
      setExecState(ExecutionState.ERROR);
      setAlgoResult({ path: null, cost: 0, error: res.error });
      if (res.steps.length > 0) {
        setSteps(res.steps);
        setCurrentStepIndex(0);
      }
      return false;
    }

    setSteps(res.steps);
    // Determine path based on which algorithm ran, as they might have different return interfaces right now
    const algoPath = 'shortestPath' in res ? res.shortestPath : (res as any).path;
    const isNegative = 'negativeCycle' in res ? res.negativeCycle : false;
    setAlgoResult({ path: algoPath, cost: res.totalCost, negativeCycle: isNegative });
    setCurrentStepIndex(0);
    return true;
  }, [algo, nodes, edges, sourceNodeId, destNodeId, showError]);

  useEffect(() => {
    if (execState === ExecutionState.COMPLETED && algo === AlgorithmType.FLOYD_WARSHALL && steps.length > 0) {
      const lastStep = steps[steps.length - 1];
      const distMatrix = lastStep.distanceMatrixSnapshot;
      const nextMatrix = lastStep.nextMatrixSnapshot;
      if (distMatrix && nextMatrix && sourceNodeId && destNodeId) {
        if (distMatrix[sourceNodeId]?.[destNodeId] === Infinity) {
          setAlgoResult(prev => ({ path: null, cost: 0, negativeCycle: prev?.negativeCycle }));
        } else {
          const newPath: string[] = [];
          let curr: string | null = sourceNodeId;
          while (curr !== destNodeId && curr !== null) {
            newPath.push(curr);
            curr = nextMatrix[curr][destNodeId];
          }
          if (curr === destNodeId) {
            newPath.push(curr);
            setAlgoResult(prev => ({ path: newPath, cost: distMatrix[sourceNodeId][destNodeId], negativeCycle: prev?.negativeCycle }));
          } else {
            setAlgoResult(prev => ({ path: null, cost: 0, negativeCycle: prev?.negativeCycle }));
          }
        }
      }
    }
  }, [sourceNodeId, destNodeId, algo, execState, steps]);

  const handleRun = () => {
    if (execState === ExecutionState.IDLE) {
      if (prepareExecution()) {
        setExecState(ExecutionState.RUNNING);
        setMode(EditorMode.DEFAULT);
      }
    } else if (execState === ExecutionState.PAUSED || execState === ExecutionState.READY) {
      setExecState(ExecutionState.RUNNING);
      setMode(EditorMode.DEFAULT);
    }
  };

  const handlePause = () => {
    if (execState === ExecutionState.RUNNING) {
      setExecState(ExecutionState.PAUSED);
    }
  };

  const handleStep = () => {
    if (execState === ExecutionState.IDLE) {
      if (prepareExecution()) {
        setExecState(ExecutionState.PAUSED);
        setMode(EditorMode.DEFAULT);
      }
    } else if (execState === ExecutionState.PAUSED || execState === ExecutionState.RUNNING) {
      setExecState(ExecutionState.PAUSED);
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
      } else {
        setExecState(ExecutionState.COMPLETED);
      }
    }
  };

  useEffect(() => {
    if (execState === ExecutionState.RUNNING && steps.length > 0) {
      if (currentStepIndex >= steps.length - 1) {
        setExecState(ExecutionState.COMPLETED);
      }
    }
  }, [execState, currentStepIndex, steps.length]);

  useEffect(() => {
    let timer: number;
    if (execState === ExecutionState.RUNNING) {
      timer = window.setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= steps.length - 1) return prev;
          return prev + 1;
        });
      }, 1000 / speed);
    }
    return () => clearInterval(timer);
  }, [execState, speed, steps.length]);

  useEffect(() => {
    if (traceEndRef.current) {
      traceEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentStepIndex]);

  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;
  const buildTutorContext = useCallback(() => {
    return {
      algorithm: algo,
      source: nodes.find(n => n.id === sourceNodeId)?.label || null,
      destination: nodes.find(n => n.id === destNodeId)?.label || null,
      graph: {
        nodes: nodes.map(n => n.label),
        edges: edges.map(e => ({
          source: nodes.find(n => n.id === e.source)?.label,
          target: nodes.find(n => n.id === e.target)?.label,
          weight: e.weight,
          directed: e.directed
        }))
      },
      currentStep: currentStepIndex,
      algorithmState: execState,
      currentDistances: algo === AlgorithmType.DIJKSTRA 
        ? Object.fromEntries(nodes.map(n => [n.label, currentStep?.distanceSnapshot?.[n.id] ?? '∞']))
        : currentStep?.distanceMatrixSnapshot,
      currentPredecessors: algo === AlgorithmType.DIJKSTRA 
        ? Object.fromEntries(nodes.map(n => [n.label, nodes.find(p => p.id === currentStep?.predecessorSnapshot?.[n.id])?.label || null]))
        : currentStep?.nextMatrixSnapshot,
      traceStep: currentStep?.explanationText,
      result: algoResult
    };
  }, [algo, nodes, edges, sourceNodeId, destNodeId, currentStepIndex, execState, currentStep, algoResult]);


  const askTutor = (query: string) => {
    setIsTutorOpen(true);
    setTutorQuery(query);
  };

  const handleModeSelect = (newMode: EditorMode) => {
    setMode(newMode);
    setConnectStartNodeId(null);
  };

  const handleCanvasClick = useCallback((x: number, y: number) => {
    if (mode === EditorMode.ADD_NODE) {
      saveHistory(nodes, edges);
      const label = getNextNodeLabel(nodes.map(n => n.label));
      setNodes(prev => [...prev, { id: `n_${Date.now()}`, label, x, y }]);
      clearExecutionState();
    }
  }, [mode, nodes, clearExecutionState]);

  const handleNodeDoubleClick = useCallback((nodeId: string) => {
    if (mode === EditorMode.DEFAULT) {
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        const newLabel = window.prompt("Enter new label for this node:", node.label);
        if (newLabel !== null && newLabel.trim() !== "") {
          setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, label: newLabel.trim() } : n));
          clearExecutionState();
        }
      }
    }
  }, [mode, nodes, clearExecutionState]);

  const handleNodeClick = useCallback((nodeId: string) => {
    switch (mode) {
      case EditorMode.CONNECT:
        if (!connectStartNodeId) {
          setConnectStartNodeId(nodeId);
        } else {
          if (connectStartNodeId === nodeId) {
            showError("Select two different nodes.");
            setConnectStartNodeId(null);
          } else {
            const isDuplicate = edges.some(e => 
              (e.source === connectStartNodeId && e.target === nodeId) ||
              (!e.directed && e.source === nodeId && e.target === connectStartNodeId)
            );
            if (isDuplicate) {
              showError("Edge already exists between these nodes.");
              setConnectStartNodeId(null);
            } else {
              setPendingEdge({ sourceId: connectStartNodeId, targetId: nodeId });
              setConnectStartNodeId(null);
            }
          }
        }
        break;
      case EditorMode.DELETE:
        saveHistory(nodes, edges);
        setNodes(prev => prev.filter(n => n.id !== nodeId));
        setEdges(prev => prev.filter(e => e.source !== nodeId && e.target !== nodeId));
        if (sourceNodeId === nodeId) setSourceNodeId(null);
        if (destNodeId === nodeId) setDestNodeId(null);
        clearExecutionState();
        break;
      case EditorMode.SELECT_SOURCE:
        setSourceNodeId(nodeId);
        setMode(EditorMode.DEFAULT);
        clearExecutionState();
        break;
      case EditorMode.SELECT_DEST:
        setDestNodeId(nodeId);
        setMode(EditorMode.DEFAULT);
        clearExecutionState();
        break;
      default:
        break;
    }
  }, [mode, connectStartNodeId, edges, sourceNodeId, destNodeId, showError, clearExecutionState]);

  const handleEdgeClick = useCallback((edgeId: string) => {
    if (mode === EditorMode.DELETE) {
      saveHistory(nodes, edges);
      setEdges(prev => prev.filter(e => e.id !== edgeId));
      clearExecutionState();
    } else if (mode === EditorMode.DEFAULT) {
      setEditingEdgeId(edgeId);
    }
  }, [mode, clearExecutionState]);

  const handleNodeMove = useCallback((nodeId: string, x: number, y: number) => {
    saveHistory(nodes, edges);
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, x, y } : n));
  }, []);

  const handleCreateEdge = (weight: number) => {
    if (!pendingEdge) return;
    const newEdge: Edge = {
      id: `e_${Date.now()}`,
      source: pendingEdge.sourceId,
      target: pendingEdge.targetId,
      weight,
      directed: true
    };
    setEdges(prev => [...prev, newEdge]);
    setPendingEdge(null);
    setConnectStartNodeId(null);
    clearExecutionState();
  };

  const handleEditEdge = (weight: number) => {
    if (!editingEdgeId) return;
    saveHistory(nodes, edges);
    setEdges(prev => prev.map(e => e.id === editingEdgeId ? { ...e, weight } : e));
    setEditingEdgeId(null);
    clearExecutionState();
  };

  const handleReset = () => {
    setMode(EditorMode.DEFAULT);
    setConnectStartNodeId(null);
    setPendingEdge(null);
    setExecState(ExecutionState.IDLE);
    setSteps([]);
    setCurrentStepIndex(-1);
    setAlgoResult(null);
  };

  const handleClearAll = () => {
    handleReset();
    setNodes([]);
    setEdges([]);
    setSourceNodeId(null);
    setDestNodeId(null);
  };

  const handleLoadPreset = (presetName: string) => {
    handleReset();
    const preset = PRESETS[presetName];
    saveHistory(nodes, edges);
    if (preset) {
      setNodes([...preset.nodes]);
      setEdges([...preset.edges]);
      setSourceNodeId('n1'); // Auto-select S or A
      setDestNodeId(preset.nodes[preset.nodes.length - 1].id);
    }
  };

  const getModeClass = (m: EditorMode) => `w-full flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none ${mode === m ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'}`;
  const getDeleteModeClass = () => `w-full flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none ${mode === EditorMode.DELETE ? 'bg-red-600 text-white dark:text-zinc-900 shadow-sm' : 'text-red-600 hover:bg-red-50 hover:text-red-700'}`;

  const isExecutionActive = execState !== ExecutionState.IDLE;

  return (
    <div className="flex flex-col h-screen w-screen bg-transparent text-zinc-900 dark:text-zinc-100 transition-colors font-sans overflow-hidden select-none selection:bg-zinc-200 dark:selection:bg-zinc-700">
      {/* HEADER */}
      <header className="h-12 surface-header flex items-center justify-between px-4 shrink-0 z-50">
        <div className="flex items-center gap-2 sm:gap-4">
          <img 
            src="/logo-full.png" 
            alt="PathFinder" 
            className="hidden sm:block h-6 sm:h-7 w-auto object-contain invert hue-rotate-180 dark:invert-0 dark:hue-rotate-0 transition-all"
          />
          <div className="flex sm:hidden items-center gap-2">
            <img 
              src="/logo-icon.png" 
              alt="PathFinder Icon" 
              className="h-5 w-auto object-contain invert hue-rotate-180 dark:invert-0 dark:hue-rotate-0 transition-all"
            />
            <h1 className="text-[12px] font-bold tracking-widest uppercase leading-none">Pathfinder</h1>
          </div>
          <div className="hidden md:flex flex-col ml-2 border-l border-zinc-200/50 dark:border-zinc-800/50 pl-4">
            <span className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none">Shortest Path</span>
            <span className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none mt-0.5">Algorithm Laboratory</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200/50 dark:border-zinc-800/50 p-0.5 mr-2">
            <button onClick={handleUndo} disabled={past.length === 0} className="w-7 h-7 flex items-center justify-center rounded hover:bg-white dark:hover:bg-zinc-800 hover:shadow-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-50 disabled:pointer-events-none transition-all focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:outline-none" title="Undo (Ctrl+Z)">
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleRedo} disabled={future.length === 0} className="w-7 h-7 flex items-center justify-center rounded hover:bg-white dark:hover:bg-zinc-800 hover:shadow-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-50 disabled:pointer-events-none transition-all focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:outline-none" title="Redo (Ctrl+Y)">
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200/50 dark:border-zinc-800/50 p-0.5">
            <button onClick={handleReset} className="w-7 h-7 flex items-center justify-center rounded hover:bg-white dark:hover:bg-zinc-800 hover:shadow-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:outline-none" title="Reset">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button onClick={handlePause} className="w-7 h-7 flex items-center justify-center rounded hover:bg-white dark:hover:bg-zinc-800 hover:shadow-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:outline-none" title="Pause">
              <Pause className="w-3.5 h-3.5 fill-current" />
            </button>
            <button onClick={handleStep} disabled={execState === ExecutionState.COMPLETED} className="w-7 h-7 flex items-center justify-center rounded hover:bg-white dark:hover:bg-zinc-800 hover:shadow-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-50 disabled:pointer-events-none transition-all focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:outline-none" title="Step">
              <SkipForward className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleRun} disabled={execState === ExecutionState.RUNNING || execState === ExecutionState.COMPLETED} className="w-7 h-7 flex items-center justify-center rounded bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-md hover:from-blue-400 hover:to-cyan-400 disabled:from-zinc-300 disabled:to-zinc-300 dark:disabled:from-zinc-800 dark:disabled:to-zinc-800 disabled:text-zinc-500 dark:disabled:text-zinc-500 border-0 disabled:pointer-events-none transition-all focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:outline-none ml-0.5" title="Run">
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={openCameraModal}
            className="flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded text-[10px] font-bold hover:bg-indigo-100 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          >
            <Camera className="w-3.5 h-3.5" />
            CAMERA INPUT
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row flex-1 lg:overflow-hidden">
        {/* LEFT SIDEBAR */}
        <aside className={`w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-zinc-200/50 dark:border-zinc-800/50 bg-transparent flex flex-col shrink-0 lg:overflow-y-auto order-2 lg:order-none max-lg:!flex p-4 sm:p-6 lg:p-4 ${!isLeftSidebarOpen ? "hidden lg:hidden" : ""}`}>
          <div className="space-y-6">
            
            <section>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter block mb-0">Graph</label>
                <button onClick={() => setIsLeftSidebarOpen(false)} className="p-1 -mr-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" title="Close Panel">
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1">
                <button onClick={() => handleModeSelect(EditorMode.ADD_NODE)} disabled={isExecutionActive} className={getModeClass(EditorMode.ADD_NODE)}>
                  <Plus className="w-3.5 h-3.5" /> Add Node
                </button>
                <button onClick={() => handleModeSelect(EditorMode.CONNECT)} disabled={isExecutionActive} className={getModeClass(EditorMode.CONNECT)}>
                  <Link2 className="w-3.5 h-3.5" /> Connect
                </button>
                <button onClick={() => handleModeSelect(EditorMode.DELETE)} disabled={isExecutionActive} className={getDeleteModeClass()}>
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
                <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2"></div>
                <button onClick={() => handleModeSelect(EditorMode.SELECT_SOURCE)} disabled={isExecutionActive} className={getModeClass(EditorMode.SELECT_SOURCE)}>
                  <MapPin className="w-3.5 h-3.5" /> Select Source
                </button>
                <button onClick={() => handleModeSelect(EditorMode.SELECT_DEST)} disabled={isExecutionActive} className={getModeClass(EditorMode.SELECT_DEST)}>
                  <Flag className="w-3.5 h-3.5" /> Select Destination
                </button>
                <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2"></div>
                <button 
                  onClick={handleClearAll} 
                  disabled={isExecutionActive} 
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-700 dark:hover:text-red-400"
                >
                  <Eraser className="w-3.5 h-3.5" /> Clear Workspace
                </button>
              </div>
            </section>

            <section>
              <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter block mb-3">Algorithm</label>
              <div className="space-y-1">
                <label className={`flex items-center gap-2 px-3 py-2 rounded border cursor-pointer focus-within:ring-2 focus-within:ring-zinc-900 transition-colors ${algo === AlgorithmType.DIJKSTRA ? 'bg-black/5 dark:bg-white/5 border-zinc-200/50 dark:border-zinc-800/50' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800 dark:hover:bg-zinc-800 border-transparent'}`}>
                  <input type="radio" name="algo" checked={algo === AlgorithmType.DIJKSTRA} onChange={() => setAlgo(AlgorithmType.DIJKSTRA)} disabled={isExecutionActive} className="sr-only" />
                  <div className={`w-1.5 h-1.5 rounded-full ${algo === AlgorithmType.DIJKSTRA ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-transparent border border-zinc-300'}`}></div>
                  <span className={`text-[11px] font-medium ${algo === AlgorithmType.DIJKSTRA ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`}>Dijkstra</span>
                </label>
                <label className={`flex items-center gap-2 px-3 py-2 rounded border cursor-pointer focus-within:ring-2 focus-within:ring-zinc-900 transition-colors ${algo === AlgorithmType.FLOYD_WARSHALL ? 'bg-black/5 dark:bg-white/5 border-zinc-200/50 dark:border-zinc-800/50' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800 dark:hover:bg-zinc-800 border-transparent'}`}>
                  <input type="radio" name="algo" checked={algo === AlgorithmType.FLOYD_WARSHALL} onChange={() => setAlgo(AlgorithmType.FLOYD_WARSHALL)} disabled={isExecutionActive} className="sr-only" />
                  <div className={`w-1.5 h-1.5 rounded-full ${algo === AlgorithmType.FLOYD_WARSHALL ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-transparent border border-zinc-300'}`}></div>
                  <span className={`text-[11px] font-medium ${algo === AlgorithmType.FLOYD_WARSHALL ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`}>Floyd-Warshall</span>
                </label>
              </div>
            </section>

            <section>
              <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter block mb-3">Speed</label>
              <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200/50 dark:border-zinc-800/50 p-0.5">
                {[0.5, 1, 2].map(s => (
                  <button 
                    key={s} 
                    onClick={() => setSpeed(s)}
                    className={`flex-1 px-2 py-1 text-[10px] font-medium rounded transition-colors focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:outline-none ${speed === s ? 'bg-transparent shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
                  >
                    {s}×
                  </button>
                ))}
              </div>
            </section>

            <section>
              <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter block mb-3">Graph Presets</label>
              <div className="space-y-1">
                {Object.keys(PRESETS).map((preset) => (
                  <button 
                    key={preset} 
                    onClick={() => handleLoadPreset(preset)}
                    disabled={isExecutionActive}
                    className="w-full text-left px-3 py-1.5 rounded text-[11px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:outline-none text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 border border-transparent disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </section>
          </div>
        </aside>

        {/* CENTER CANVASES & PANELS */}
        <main className="flex-1 flex flex-col min-w-0 bg-transparent relative order-1 lg:order-none min-h-[400px] lg:min-h-0 shrink-0 lg:shrink">
          {!isLeftSidebarOpen && (
            <button
              onClick={() => setIsLeftSidebarOpen(true)}
              className="absolute top-4 left-4 z-20 p-2 surface-floating rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:outline-none"
              title="Open Graph Panel"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}
          {!isRightSidebarOpen && (
            <button
              onClick={() => setIsRightSidebarOpen(true)}
              className="hidden lg:block absolute top-4 right-4 z-20 p-2 surface-floating rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:outline-none"
              title="Open Inspector Panel"
            >
              <PanelRightOpen className="w-4 h-4" />
            </button>
          )}
          <div className={`absolute top-4 z-20 flex items-center gap-2 bg-transparent px-3 py-1.5 rounded-full shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 text-[10px] font-mono font-medium text-zinc-500 dark:text-zinc-400 transition-all duration-300 ${!isLeftSidebarOpen ? 'left-14' : 'left-4'}`}>
            MODE: <span className="text-zinc-900 dark:text-zinc-100">{mode.replace('_', ' ')}</span>
          </div>

          {errorMsg && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-50 text-red-600 px-4 py-2 rounded shadow-sm border border-red-200 text-[11px] font-medium animate-in fade-in slide-in-from-top-2">
              {errorMsg}
            </div>
          )}

          <div className="flex-1 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
            
            <div className="absolute inset-0 z-10">
              <GraphCanvas
                nodes={nodes}
                edges={edges}
                mode={mode}
                sourceNodeId={algo === AlgorithmType.FLOYD_WARSHALL && execState !== ExecutionState.COMPLETED && execState !== ExecutionState.IDLE && currentStep?.predecessor ? currentStep.predecessor : sourceNodeId}
                destNodeId={algo === AlgorithmType.FLOYD_WARSHALL && execState !== ExecutionState.COMPLETED && execState !== ExecutionState.IDLE && currentStep?.updatedNode ? currentStep.updatedNode : destNodeId}
                connectStartNodeId={connectStartNodeId}
                activeNodeId={currentStep?.currentNode}
                activeEdgeId={currentStep?.affectedEdge}
                visitedNodeIds={currentStep?.visitedNodes || []}
                pathNodeIds={execState === ExecutionState.COMPLETED && algoResult?.path ? algoResult.path : undefined}
                pathEdgeIds={execState === ExecutionState.COMPLETED && algoResult?.path ? algoResult.path.slice(0, -1).map((source, i) => {
                  const target = algoResult.path![i + 1];
                  return edges.find(e => (e.source === source && e.target === target) || (!e.directed && e.target === source && e.source === target))?.id || '';
                }) : undefined}
                distances={currentStep?.distanceSnapshot || (execState === ExecutionState.IDLE ? undefined : steps[steps.length-1]?.distanceSnapshot)}
                readonly={execState !== ExecutionState.IDLE && execState !== ExecutionState.ERROR}
                theme={theme}
                onNodeClick={handleNodeClick}
                onNodeDoubleClick={handleNodeDoubleClick}
                onEdgeClick={handleEdgeClick}
                onCanvasClick={handleCanvasClick}
                onNodeMove={handleNodeMove}
              />
            </div>

            {nodes.length === 0 && (
              <div className="absolute inset-0 z-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <div className="w-12 h-12 rounded border border-zinc-200/50 dark:border-zinc-800/50 bg-transparent flex items-center justify-center mb-3 text-zinc-300 shadow-sm mx-auto">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-zinc-500 dark:text-zinc-400 text-xs font-medium">Workspace Empty</span>
                <span className="text-zinc-400 dark:text-zinc-500 text-[10px] mt-1 block">Select a preset or add nodes to begin.</span>
              </div>
            )}
            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 surface-floating rounded-full px-4 py-2 z-20">
              <button onClick={() => setIsTutorOpen(!isTutorOpen)} className={`p-1.5 rounded-full focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:outline-none transition-colors flex items-center gap-1.5 pl-2 ${isTutorOpen ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`} title="PATHFINDER AI">
                <Bot className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold tracking-widest uppercase leading-none mr-1">AI</span>
              </button>
              <button 
                onClick={toggleTheme}
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-500 dark:text-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:outline-none transition-colors" 
                title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR: INSPECTOR */}
        <aside className={`w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-zinc-200/50 dark:border-zinc-800/50 bg-transparent flex flex-col shrink-0 lg:overflow-y-auto order-3 lg:order-none max-lg:!flex p-4 sm:p-6 lg:p-4 ${!isRightSidebarOpen ? 'hidden lg:hidden' : ''}`}>
          <div className="space-y-6">
            
            <section>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter block mb-0">Algorithm State</label>
                <button onClick={() => setIsRightSidebarOpen(false)} className="p-1 -mr-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" title="Close Panel">
                  <PanelRightClose className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-black/5 dark:bg-white/5 rounded p-3 border border-zinc-200/30 dark:border-zinc-800/30/50 space-y-2">
                {algo === AlgorithmType.FLOYD_WARSHALL ? (
                  <>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Intermediate (K)</span>
                      <span className="font-mono text-zinc-900 dark:text-zinc-100 font-medium">
                        {currentStep?.currentNode ? nodes.find(n => n.id === currentStep.currentNode)?.label : '--'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Source (I)</span>
                      <span className="font-mono text-zinc-900 dark:text-zinc-100 font-medium">
                        {currentStep?.predecessor ? nodes.find(n => n.id === currentStep.predecessor)?.label : '--'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Destination (J)</span>
                      <span className="font-mono text-zinc-900 dark:text-zinc-100 font-medium">
                        {currentStep?.updatedNode ? nodes.find(n => n.id === currentStep.updatedNode)?.label : '--'}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Source</span>
                      <span className="font-mono text-zinc-900 dark:text-zinc-100 font-medium">
                        {sourceNodeId ? nodes.find(n => n.id === sourceNodeId)?.label : '--'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Destination</span>
                      <span className="font-mono text-zinc-900 dark:text-zinc-100 font-medium">
                        {destNodeId ? nodes.find(n => n.id === destNodeId)?.label : '--'}
                      </span>
                    </div>
                  </>
                )}
                <div className="h-px bg-zinc-200 dark:bg-zinc-700 my-1"></div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status</span>
                  <span className={`font-bold ${execState === ExecutionState.ERROR ? 'text-red-500' : execState === ExecutionState.COMPLETED ? 'text-indigo-500' : execState === ExecutionState.RUNNING ? 'text-amber-500' : 'text-zinc-400 dark:text-zinc-500'}`}>
                    {execState}
                  </span>
                </div>
              </div>
            </section>

            {algo === AlgorithmType.FLOYD_WARSHALL ? (
              <section>
                <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter block mb-3">Distance Matrix</label>
                <div className="border border-zinc-200/50 dark:border-zinc-800/50 rounded overflow-hidden">
                  <table className="w-full text-center text-[10px] min-w-max">
                    <thead className="bg-zinc-50/50 dark:bg-zinc-950/50 border-b border-zinc-200/50 dark:border-zinc-800/50">
                      <tr className="text-zinc-500 dark:text-zinc-400">
                        <th className="px-2 py-1.5 font-medium border-r border-zinc-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 sticky left-0 z-10 w-8"></th>
                        {nodes.map(n => (
                          <th key={n.id} className="px-2 py-1.5 font-medium border-r border-zinc-200/50 dark:border-zinc-800/50">{n.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-transparent">
                      {nodes.length === 0 ? (
                        <tr>
                          <td colSpan={1} className="px-2 py-6 text-center text-zinc-400 dark:text-zinc-500 italic font-mono text-[9px]">
                            -- EMPTY --
                          </td>
                        </tr>
                      ) : (
                        nodes.map(u => (
                          <tr key={u.id} className="border-b border-zinc-50 dark:border-zinc-800/30 last:border-0">
                            <td className="px-2 py-1.5 font-mono border-r border-zinc-200/50 dark:border-zinc-800/50 font-bold text-zinc-500 dark:text-zinc-400 bg-white/50 dark:bg-zinc-900/50 sticky left-0 z-10">
                              {u.label}
                            </td>
                            {nodes.map(v => {
                              const dist = currentStep?.distanceMatrixSnapshot?.[u.id]?.[v.id] ?? (execState === ExecutionState.COMPLETED ? steps[steps.length - 1]?.distanceMatrixSnapshot?.[u.id]?.[v.id] : Infinity);
                              const distDisplay = dist === Infinity || dist === undefined ? '∞' : dist;
                              const isUpdated = currentStep?.operationType === OperationType.UPDATE_DISTANCE && currentStep.predecessor === u.id && currentStep.updatedNode === v.id;
                              const isComparing = currentStep?.operationType === OperationType.COMPARE_PATH && currentStep.predecessor === u.id && currentStep.updatedNode === v.id;
                              const bgClass = isUpdated ? 'bg-amber-100 font-bold text-amber-700' : isComparing ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400';
                              return (
                                <td key={v.id} className={`px-2 py-1.5 font-mono border-r border-zinc-50 dark:border-zinc-800/30 transition-colors ${bgClass}`}>
                                  {distDisplay}
                                </td>
                              );
                            })}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                
                {currentStep?.operationType === OperationType.COMPARE_PATH && (
                  <div className="mt-3 bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/50 rounded p-2 text-[10px]">
                    <div className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1 text-[9px] font-bold">Current Comparison</div>
                    <div className="font-mono text-zinc-700 dark:text-zinc-300">
                      D[{nodes.find(n => n.id === currentStep.predecessor)?.label}][{nodes.find(n => n.id === currentStep.updatedNode)?.label}] = {currentStep.previousDistance === Infinity ? '∞' : currentStep.previousDistance}
                    </div>
                    <div className="font-mono text-zinc-700 dark:text-zinc-300 mt-0.5">
                      D[{nodes.find(n => n.id === currentStep.predecessor)?.label}][{nodes.find(n => n.id === currentStep.currentNode)?.label}] + D[{nodes.find(n => n.id === currentStep.currentNode)?.label}][{nodes.find(n => n.id === currentStep.updatedNode)?.label}] = {currentStep.newDistance === Infinity ? '∞' : currentStep.newDistance}
                    </div>
                  </div>
                )}
                
                {currentStep?.operationType === OperationType.UPDATE_DISTANCE && (
                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded p-2 text-[10px]">
                    <div className="text-amber-600 uppercase tracking-wider mb-1 text-[9px] font-bold">Decision</div>
                    <div className="font-mono text-amber-800">
                      Update D[{nodes.find(n => n.id === currentStep.predecessor)?.label}][{nodes.find(n => n.id === currentStep.updatedNode)?.label}] to {currentStep.newDistance}
                    </div>
                  </div>
                )}
              </section>
            ) : (
              <section>
                <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter block mb-3">Distance Table</label>
                <div className="border border-zinc-200/50 dark:border-zinc-800/50 rounded overflow-hidden">
                  <table className="w-full text-left text-[10px]">
                    <thead className="bg-zinc-50/50 dark:bg-zinc-950/50 border-b border-zinc-200/50 dark:border-zinc-800/50">
                      <tr className="text-zinc-500 dark:text-zinc-400">
                        <th className="px-2 py-1.5 font-medium border-r border-zinc-200/50 dark:border-zinc-800/50">NODE</th>
                        <th className="px-2 py-1.5 font-medium border-r border-zinc-200/50 dark:border-zinc-800/50">DIST</th>
                        <th className="px-2 py-1.5 font-medium border-r border-zinc-200/50 dark:border-zinc-800/50">PRED</th>
                        <th className="px-2 py-1.5 font-medium">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="bg-transparent">
                      {nodes.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-2 py-6 text-center text-zinc-400 dark:text-zinc-500 italic font-mono text-[9px]">
                            -- EMPTY --
                          </td>
                        </tr>
                      ) : (
                        nodes.map(node => {
                          const dist = currentStep ? currentStep.distanceSnapshot[node.id] : Infinity;
                          const distDisplay = dist === Infinity ? '∞' : dist;
                          const predId = currentStep ? currentStep.predecessorSnapshot[node.id] : null;
                          const predDisplay = predId ? nodes.find(n => n.id === predId)?.label || '--' : '--';
                          
                          let status = "PENDING";
                          if (currentStep?.currentNode === node.id) status = "CURRENT";
                          else if (currentStep?.visitedNodes.includes(node.id)) status = "VISITED";
                          else if (execState === ExecutionState.COMPLETED && dist === Infinity) status = "UNREACHABLE";
                          
                          const statusColor = status === 'CURRENT' ? 'text-amber-500' : status === 'VISITED' ? 'text-green-500' : status === 'UNREACHABLE' ? 'text-red-400' : 'text-zinc-400 dark:text-zinc-500';
  
                          return (
                            <tr key={node.id} className="border-b border-zinc-50 dark:border-zinc-800/30 last:border-0">
                              <td className="px-2 py-1.5 font-mono border-r border-zinc-200/30 dark:border-zinc-800/30/50 text-zinc-900 dark:text-zinc-100">{node.label}</td>
                              <td className="px-2 py-1.5 font-mono border-r border-zinc-200/30 dark:border-zinc-800/30/50 text-zinc-500 dark:text-zinc-400">{distDisplay}</td>
                              <td className="px-2 py-1.5 font-mono border-r border-zinc-200/30 dark:border-zinc-800/30/50 text-zinc-500 dark:text-zinc-400">{predDisplay}</td>
                              <td className={`px-2 py-1.5 font-medium ${statusColor}`}>{status}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            <section>
              <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter block mb-3">Result</label>
              <div className="grid grid-cols-2 gap-2">
                <div className={`surface-card rounded p-3 col-span-2 transition-colors duration-500 ${execState === ExecutionState.COMPLETED && algoResult?.path && !algoResult?.negativeCycle ? "bg-sky-50/50 dark:bg-sky-900/10 border-sky-200/50 dark:border-sky-800/50 shadow-[0_0_15px_rgba(14,165,233,0.1)]" : ""}`}>
                  <div className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter mb-1">Shortest Path</div>
                  <div className="font-mono text-[11px] text-zinc-900 dark:text-zinc-100 break-words">
                    {execState === ExecutionState.ERROR ? <span className="text-red-500">ALGORITHM ERROR</span> :
                     (execState === ExecutionState.COMPLETED ? 
                        (algoResult?.negativeCycle ? <span className="text-red-500">NEGATIVE CYCLE DETECTED</span> : 
                         (algoResult?.path ? algoResult.path.map(id => nodes.find(n => n.id === id)?.label).join(' → ') : 
                         <span className="text-zinc-500 dark:text-zinc-400">NO PATH FOUND</span>)) : 
                     <span className="text-zinc-500 dark:text-zinc-400">Not computed</span>)}
                  </div>
                </div>
                <div className={`surface-card rounded p-3 transition-colors duration-500 ${execState === ExecutionState.COMPLETED && algoResult?.path && !algoResult?.negativeCycle ? "bg-sky-50/50 dark:bg-sky-900/10 border-sky-200/50 dark:border-sky-800/50" : ""}`}>
                  <div className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter mb-1">Total Cost</div>
                  <div className="font-mono text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {execState === ExecutionState.COMPLETED && algoResult?.path && !algoResult?.negativeCycle ? algoResult.cost : '--'}
                  </div>
                </div>
                <div className="surface-card rounded p-3">
                  <div className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter mb-1">Nodes Visited</div>
                  <div className="font-mono text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {execState === ExecutionState.COMPLETED && currentStep ? currentStep.visitedNodes.length : '--'}
                  </div>
                </div>
                <div className="surface-card rounded p-3 col-span-2">
                  <div className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter mb-1">Edges Explored</div>
                  <div className="font-mono text-[11px] text-zinc-900 dark:text-zinc-100">
                    {execState === ExecutionState.COMPLETED ? steps.filter(s => s.operationType === OperationType.EXPLORE_EDGE).length : '--'}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter block mb-3">How it works</label>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed border border-zinc-200/30 dark:border-zinc-800/30/50 bg-black/5 dark:bg-white/5/50 p-3 rounded">
                <span className="font-medium text-zinc-700 dark:text-zinc-300 block mb-1">{algorithmMetadata[algo].name}</span>
                {algorithmMetadata[algo].description}
                <div className="mt-2 grid grid-cols-2 gap-1 text-[9px] font-mono">
                  <div>Time: {algorithmMetadata[algo].timeComplexity}</div>
                  <div>Space: {algorithmMetadata[algo].spaceComplexity}</div>
                </div>
              </div>
            </section>

          </div>
        </aside>
      </div>

      {/* BOTTOM: EXECUTION TRACE */}
      <footer className="h-32 border-t border-zinc-200/50 dark:border-zinc-800/50 surface-panel flex flex-col shrink-0">
        <div className="h-8 border-b border-zinc-200/30 dark:border-zinc-800/30/50 flex items-center px-4 justify-between bg-black/5 dark:bg-white/5/50">
          <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter">Execution Trace Log</span>
        </div>
        <div className="flex-1 flex flex-col font-mono text-[10px] bg-black/5 dark:bg-white/5/30 overflow-y-auto p-2 space-y-1">
          {steps.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <span className="text-zinc-400 dark:text-zinc-500 italic">No execution trace available. Run an algorithm to generate steps.</span>
            </div>
          ) : (
            steps.slice(0, currentStepIndex + 1).map((step, idx) => (
              <div key={idx} className="flex items-center gap-4 px-2 py-1 bg-transparent transition-colors border border-zinc-200/30 dark:border-zinc-800/30/50 rounded text-zinc-600 dark:text-zinc-400 shadow-sm animate-in fade-in group relative">
                <span className="text-zinc-400 dark:text-zinc-500 font-bold shrink-0 w-16">STEP {String(step.stepNumber).padStart(2, '0')}</span>
                <span className="text-indigo-500 shrink-0 w-32 truncate">{step.operationType}</span>
                <span className="text-zinc-900 dark:text-zinc-100 flex-1">{step.explanationText}</span>
                {idx === currentStepIndex && (
                  <button onClick={() => askTutor('Explain this step')} className="opacity-0 group-hover:opacity-100 absolute right-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all flex items-center gap-1">
                    <Bot className="w-3 h-3" /> Explain
                  </button>
                )}
              </div>
            ))
          )}
          <div ref={traceEndRef} />
        </div>
      </footer>

      {/* MODALS */}
      {pendingEdge && (
        <EdgeWeightPopover
          sourceLabel={nodes.find(n => n.id === pendingEdge.sourceId)?.label || ''}
          targetLabel={nodes.find(n => n.id === pendingEdge.targetId)?.label || ''}
          onSubmit={handleCreateEdge}
          onCancel={() => {
            setPendingEdge(null);
            setConnectStartNodeId(null);
          }}
        />
      )}
      {editingEdgeId && (
        <EdgeWeightPopover
          sourceLabel={nodes.find(n => n.id === edges.find(e => e.id === editingEdgeId)?.source)?.label || ''}
          targetLabel={nodes.find(n => n.id === edges.find(e => e.id === editingEdgeId)?.target)?.label || ''}
          initialWeight={edges.find(e => e.id === editingEdgeId)?.weight || 1}
          submitLabel="SAVE"
          onSubmit={handleEditEdge}
          onCancel={() => setEditingEdgeId(null)}
        />
      )}
      <CameraModal 
        isOpen={isCameraModalOpen} 
        onClose={() => setIsCameraModalOpen(false)}
        hasExistingGraph={nodes.length > 0}
        onImport={(importedGraph) => {
          handleReset();
          saveHistory(nodes, edges);
          setNodes(importedGraph.nodes);
          setEdges(importedGraph.edges);
          setIsCameraModalOpen(false);
        }}
      />
      <AITutorPanel
        isOpen={isTutorOpen}
        onClose={() => setIsTutorOpen(false)}
        buildContext={buildTutorContext}
        externalQuery={tutorQuery}
        onExternalQueryHandled={() => setTutorQuery(undefined)}
      />
    </div>
  );
}
