import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add to lucide imports
content = re.sub(
    r"\} from 'lucide-react';",
    "  ChevronDown, Check\n} from 'lucide-react';",
    content
)

# Add state
content = content.replace(
    '  const [mode, setMode] = useState<EditorMode>(EditorMode.DEFAULT);',
    '  const [mode, setMode] = useState<EditorMode>(EditorMode.DEFAULT);\n  const [allowDoubleClickMove, setAllowDoubleClickMove] = useState(false);\n  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);'
)

# Replace the MODE indicator
old_indicator = """          <div className={`absolute top-4 z-20 flex items-center gap-2 bg-transparent px-3 py-1.5 rounded-full shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 text-[10px] font-mono font-medium text-zinc-500 dark:text-zinc-400 transition-all duration-300 ${!isLeftSidebarOpen ? 'left-14' : 'left-4'}`}>
            MODE: <span className="text-zinc-900 dark:text-zinc-100">{mode.replace('_', ' ')}</span>{mode === EditorMode.DEFAULT && <span className="hidden sm:inline opacity-50 ml-2">(Double-click node to move)</span>}
          </div>"""

new_indicator = """          <div className={`absolute top-4 z-20 transition-all duration-300 ${!isLeftSidebarOpen ? 'left-14' : 'left-4'}`}>
            <button 
              onClick={() => setIsModeMenuOpen(!isModeMenuOpen)}
              className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-full shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 text-[10px] font-mono font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:outline-none"
            >
              MODE: <span className="text-zinc-900 dark:text-zinc-100">{mode.replace('_', ' ')}</span>
              <ChevronDown className="w-3 h-3 opacity-50" />
            </button>
            
            {isModeMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsModeMenuOpen(false)}></div>
                <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-lg shadow-lg z-20 py-1 overflow-hidden">
                  <div className="max-h-[60vh] overflow-y-auto">
                    {[
                      EditorMode.DEFAULT,
                      EditorMode.ADD_NODE,
                      EditorMode.CONNECT,
                      EditorMode.DELETE,
                      EditorMode.SELECT_SOURCE,
                      EditorMode.SELECT_DEST
                    ].map((m) => (
                      <button
                        key={m}
                        onClick={() => {
                          handleModeSelect(m);
                          setIsModeMenuOpen(false);
                        }}
                        disabled={isExecutionActive}
                        className="w-full text-left px-3 py-2 text-[11px] font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-between disabled:opacity-50 text-zinc-700 dark:text-zinc-300"
                      >
                        {m.replace('_', ' ')}
                        {mode === m && <Check className="w-3 h-3 text-zinc-900 dark:text-zinc-100" />}
                      </button>
                    ))}
                    <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1"></div>
                    <button
                      onClick={() => {
                        setAllowDoubleClickMove(!allowDoubleClickMove);
                        setIsModeMenuOpen(false);
                      }}
                      disabled={isExecutionActive}
                      className="w-full text-left px-3 py-2 text-[11px] font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-between disabled:opacity-50 text-zinc-700 dark:text-zinc-300"
                    >
                      DOUBLE-CLICK TO MOVE NODE
                      {allowDoubleClickMove && <Check className="w-3 h-3 text-zinc-900 dark:text-zinc-100" />}
                    </button>
                  </div>
                </div>
              </>
            )}
            
            {allowDoubleClickMove && mode === EditorMode.DEFAULT && (
              <span className="hidden sm:inline absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap text-[10px] font-medium text-zinc-500 opacity-70 pointer-events-none">
                Double-click a node to move
              </span>
            )}
          </div>"""

content = content.replace(old_indicator, new_indicator)

# Add allowDoubleClickMove to GraphCanvas props
content = content.replace(
    '                destNodeId={algo === AlgorithmType.FLOYD_WARSHALL && execState !== ExecutionState.COMPLETED && execState !== ExecutionState.IDLE && currentStep?.updatedNode ? currentStep.updatedNode : destNodeId}',
    '                destNodeId={algo === AlgorithmType.FLOYD_WARSHALL && execState !== ExecutionState.COMPLETED && execState !== ExecutionState.IDLE && currentStep?.updatedNode ? currentStep.updatedNode : destNodeId}\n                allowDoubleClickMove={allowDoubleClickMove}'
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
