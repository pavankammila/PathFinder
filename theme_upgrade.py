import re

# 1. Update index.css
with open('src/index.css', 'r') as f:
    css_content = f.read()

# Replace body layer
body_css = """@layer base {
  body {
    @apply font-sans text-zinc-900 overflow-hidden m-0 p-0 h-screen w-screen bg-[#fafafa];
    position: relative;
    z-index: 0;
  }
  .dark body {
    @apply text-zinc-100 bg-[#09090b];
  }

  /* Atmospheric pseudo-elements */
  body::before,
  body::after {
    content: '';
    position: fixed;
    border-radius: 50%;
    filter: blur(120px);
    z-index: -1;
    pointer-events: none;
  }

  /* Light mode gradients */
  body::before {
    top: -10%;
    left: -10%;
    width: 60vw;
    height: 60vh;
    background: radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, rgba(14, 165, 233, 0) 70%); /* soft blue/cyan */
    opacity: 0.8;
  }

  body::after {
    bottom: -10%;
    right: -10%;
    width: 70vw;
    height: 70vh;
    background: radial-gradient(circle, rgba(244, 114, 182, 0.1) 0%, rgba(244, 114, 182, 0) 70%); /* warm pink/orange */
    opacity: 0.8;
  }

  /* Dark mode gradients */
  .dark body::before {
    background: radial-gradient(circle, rgba(37, 99, 235, 0.18) 0%, rgba(37, 99, 235, 0) 70%);
    opacity: 1;
    top: auto;
    bottom: -20%;
    left: -10%;
    width: 80vw;
    height: 80vh;
  }

  .dark body::after {
    background: radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0) 70%);
    opacity: 1;
    bottom: -10%;
    right: -10%;
    top: auto;
  }
}

/* Surface classes for panels */
@layer utilities {
  .surface-panel {
    @apply bg-white/70 dark:bg-[#0c0c0e]/70 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.2)] transition-colors;
  }
  .surface-card {
    @apply bg-white/50 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm transition-colors;
  }
  .surface-header {
    @apply bg-white/80 dark:bg-[#0c0c0e]/80 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50 transition-colors;
  }
  .surface-floating {
    @apply bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 shadow-md transition-colors;
  }
}
"""

css_content = re.sub(r'@layer base\s*\{[\s\S]*?\}\s*\}', body_css, css_content)

with open('src/index.css', 'w') as f:
    f.write(css_content)

# 2. Update App.tsx classes
with open('src/App.tsx', 'r') as f:
    app_content = f.read()

# Root background
app_content = app_content.replace('className="flex flex-col h-screen w-screen bg-zinc-50 dark:bg-zinc-950', 'className="flex flex-col h-screen w-screen bg-transparent')

# Header
app_content = app_content.replace('h-12 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex', 'h-12 surface-header flex')

# Left Sidebar
app_content = app_content.replace('w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex', 'w-64 border-r border-zinc-200/50 dark:border-zinc-800/50 surface-panel flex')

# Right Sidebar
app_content = app_content.replace('w-80 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex', 'w-80 border-l border-zinc-200/50 dark:border-zinc-800/50 surface-panel flex')

# Main canvas wrapper
app_content = app_content.replace('bg-zinc-100 dark:bg-zinc-800 relative', 'bg-transparent relative')

# Trace Footer
app_content = app_content.replace('className="h-32 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0"', 'className="h-32 border-t border-zinc-200/50 dark:border-zinc-800/50 surface-panel flex flex-col shrink-0"')

# Toggle buttons
app_content = app_content.replace('bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm', 'surface-floating rounded-md')

# Distance table alternating / inner backgrounds
app_content = app_content.replace('bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800', 'bg-zinc-50/50 dark:bg-zinc-950/50 border-b border-zinc-200/50 dark:border-zinc-800/50')
app_content = app_content.replace('bg-zinc-50 dark:bg-zinc-950 sticky', 'bg-white/50 dark:bg-zinc-900/50 sticky')
app_content = app_content.replace('bg-white dark:bg-zinc-900', 'bg-transparent')
app_content = app_content.replace('bg-zinc-50 dark:bg-zinc-950', 'bg-black/5 dark:bg-white/5')
app_content = app_content.replace('border-zinc-200 dark:border-zinc-800', 'border-zinc-200/50 dark:border-zinc-800/50')
app_content = app_content.replace('border-zinc-100 dark:border-zinc-800', 'border-zinc-200/30 dark:border-zinc-800/30')


# Panels inside the sidebars
app_content = app_content.replace('bg-transparent transition-colors border-zinc-200/50 dark:border-zinc-800/50 rounded p-2', 'surface-card rounded p-2')

# Modes buttons
# "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm" -> leave active mode mostly the same or subtle
# Let's add the run button accent
# Run button original: bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-200
run_btn_regex = r'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 disabled:text-zinc-500 dark:disabled:text-zinc-500'
run_btn_repl = 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-md hover:from-blue-400 hover:to-cyan-400 disabled:from-zinc-300 disabled:to-zinc-300 dark:disabled:from-zinc-800 dark:disabled:to-zinc-800 disabled:text-zinc-500 dark:disabled:text-zinc-500 border-0'
app_content = re.sub(run_btn_regex, run_btn_repl, app_content)

# Floating trace button (AI Tutor and bottom-6 right-6 center button)
# "bg-transparent transition-colors border border-zinc-200/50 dark:border-zinc-800/50 rounded-full"
# We already replaced bg-white with bg-transparent.
app_content = app_content.replace('bg-transparent border border-zinc-200/50 dark:border-zinc-800/50 rounded-full shadow-sm', 'surface-floating rounded-full')
app_content = app_content.replace('bg-transparent transition-colors border border-zinc-200/50 dark:border-zinc-800/50 rounded-full px-4 py-2 shadow-sm', 'surface-floating rounded-full px-4 py-2')

# Floyd current comparison panel
app_content = app_content.replace('bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/50 rounded p-2 text-[10px]', 'bg-black/5 dark:bg-white/5 border border-zinc-200/50 dark:border-zinc-800/50 rounded p-2 text-[10px]')

with open('src/App.tsx', 'w') as f:
    f.write(app_content)

print("Updated CSS and App.tsx")
