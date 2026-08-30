import re

with open('src/App.tsx', 'r') as f:
    app_content = f.read()

# Fix surface-card replacements
app_content = app_content.replace('bg-transparent transition-colors border border-zinc-200/50 dark:border-zinc-800/50 rounded p-2', 'surface-card rounded p-3')

# Highlight result panel on completion
result_panel_regex = r'<div className="surface-card rounded p-3 col-span-2">\s*<div className="text-\[9px\] text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter mb-1">Shortest Path</div>'
result_panel_repl = r'<div className={`surface-card rounded p-3 col-span-2 transition-colors duration-500 ${execState === ExecutionState.COMPLETED && algoResult?.path && !algoResult?.negativeCycle ? "bg-sky-50/50 dark:bg-sky-900/10 border-sky-200/50 dark:border-sky-800/50 shadow-[0_0_15px_rgba(14,165,233,0.1)]" : ""}`}>\n                  <div className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter mb-1">Shortest Path</div>'

app_content = re.sub(result_panel_regex, result_panel_repl, app_content)

# Highlight total cost panel on completion
cost_panel_regex = r'<div className="surface-card rounded p-3">\s*<div className="text-\[9px\] text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter mb-1">Total Cost</div>'
cost_panel_repl = r'<div className={`surface-card rounded p-3 transition-colors duration-500 ${execState === ExecutionState.COMPLETED && algoResult?.path && !algoResult?.negativeCycle ? "bg-sky-50/50 dark:bg-sky-900/10 border-sky-200/50 dark:border-sky-800/50" : ""}`}>\n                  <div className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter mb-1">Total Cost</div>'

app_content = re.sub(cost_panel_regex, cost_panel_repl, app_content)

# Fix Trace Footer classes to have transition
app_content = app_content.replace('className="flex-1 flex flex-col font-mono text-[10px] bg-black/5 dark:bg-white/5 overflow-y-auto p-2 space-y-1"', 'className="flex-1 flex flex-col font-mono text-[10px] bg-black/5 dark:bg-white/5 overflow-y-auto p-2 space-y-1 transition-colors"')

with open('src/App.tsx', 'w') as f:
    f.write(app_content)

print("Result panels updated")
