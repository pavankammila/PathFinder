import re

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Add tutorQuery state
content = content.replace(
    '  const [isTutorOpen, setIsTutorOpen] = useState(false);',
    '  const [isTutorOpen, setIsTutorOpen] = useState(false);\n  const [tutorQuery, setTutorQuery] = useState<string | undefined>();'
)

# Add ask function
ask_fn = """
  const askTutor = (query: string) => {
    setIsTutorOpen(true);
    setTutorQuery(query);
  };
"""
content = content.replace('  const handleModeSelect = (newMode: EditorMode) => {', ask_fn + '\n  const handleModeSelect = (newMode: EditorMode) => {')

# Edit AITutorPanel usage
old_panel = """      <AITutorPanel
        isOpen={isTutorOpen}
        onClose={() => setIsTutorOpen(false)}
        buildContext={buildTutorContext}
      />"""
new_panel = """      <AITutorPanel
        isOpen={isTutorOpen}
        onClose={() => setIsTutorOpen(false)}
        buildContext={buildTutorContext}
        externalQuery={tutorQuery}
        onExternalQueryHandled={() => setTutorQuery(undefined)}
      />"""
content = content.replace(old_panel, new_panel)

# Edit trace output
old_trace = """            steps.slice(0, currentStepIndex + 1).map((step, idx) => (
              <div key={idx} className="flex gap-4 px-2 py-1 bg-white dark:bg-zinc-900 transition-colors border border-zinc-100 dark:border-zinc-800/50 rounded text-zinc-600 dark:text-zinc-400 shadow-sm animate-in fade-in">
                <span className="text-zinc-400 dark:text-zinc-500 font-bold shrink-0 w-16">STEP {String(step.stepNumber).padStart(2, '0')}</span>
                <span className="text-indigo-500 shrink-0 w-32 truncate">{step.operationType}</span>
                <span className="text-zinc-900 dark:text-zinc-100">{step.explanationText}</span>
              </div>
            ))"""
new_trace = """            steps.slice(0, currentStepIndex + 1).map((step, idx) => (
              <div key={idx} className="flex items-center gap-4 px-2 py-1 bg-white dark:bg-zinc-900 transition-colors border border-zinc-100 dark:border-zinc-800/50 rounded text-zinc-600 dark:text-zinc-400 shadow-sm animate-in fade-in group relative">
                <span className="text-zinc-400 dark:text-zinc-500 font-bold shrink-0 w-16">STEP {String(step.stepNumber).padStart(2, '0')}</span>
                <span className="text-indigo-500 shrink-0 w-32 truncate">{step.operationType}</span>
                <span className="text-zinc-900 dark:text-zinc-100 flex-1">{step.explanationText}</span>
                {idx === currentStepIndex && (
                  <button onClick={() => askTutor('Explain this step')} className="opacity-0 group-hover:opacity-100 absolute right-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all flex items-center gap-1">
                    <Bot className="w-3 h-3" /> Explain
                  </button>
                )}
              </div>
            ))"""
content = content.replace(old_trace, new_trace)

# Edit Result panel
old_result = """              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white dark:bg-zinc-900 transition-colors border border-zinc-200 dark:border-zinc-800 rounded p-2 col-span-2">
                  <div className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter mb-1">Shortest Path</div>
                  <div className="font-mono text-indigo-600 dark:text-indigo-400 text-sm font-bold flex items-center gap-2">
                    {algoResult?.path ? algoResult.path.join(' → ') : (algoResult?.negativeCycle ? 'Negative Cycle Detected' : 'Unreachable')}
                  </div>
                </div>"""
new_result = """              <div className="flex items-center justify-between mb-3">
                <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter block">Result</label>
                {execState === ExecutionState.COMPLETED && (
                  <button onClick={() => askTutor('Explain the result')} className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 transition-colors">
                    <Bot className="w-3 h-3" /> Explain Result
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white dark:bg-zinc-900 transition-colors border border-zinc-200 dark:border-zinc-800 rounded p-2 col-span-2">
                  <div className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter mb-1">Shortest Path</div>
                  <div className="font-mono text-indigo-600 dark:text-indigo-400 text-sm font-bold flex items-center gap-2">
                    {algoResult?.path ? algoResult.path.join(' → ') : (algoResult?.negativeCycle ? 'Negative Cycle Detected' : 'Unreachable')}
                  </div>
                </div>"""
content = content.replace('<label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter block mb-3">Result</label>\n              <div className="grid grid-cols-2 gap-2">\n                <div className="bg-white dark:bg-zinc-900 transition-colors border border-zinc-200 dark:border-zinc-800 rounded p-2 col-span-2">\n                  <div className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter mb-1">Shortest Path</div>\n                  <div className="font-mono text-indigo-600 dark:text-indigo-400 text-sm font-bold flex items-center gap-2">\n                    {algoResult?.path ? algoResult.path.join(\' → \') : (algoResult?.negativeCycle ? \'Negative Cycle Detected\' : \'Unreachable\')}\n                  </div>\n                </div>', new_result)

with open(filepath, 'w') as f:
    f.write(content)

