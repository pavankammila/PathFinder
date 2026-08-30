import re

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Imports
content = content.replace("Eraser, Bot", "Eraser, Bot, PanelLeftClose, PanelRightClose, PanelLeftOpen, PanelRightOpen")

# 2. State
old_state = "  const [isTutorOpen, setIsTutorOpen] = useState(false);"
new_state = """  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);"""
content = content.replace(old_state, new_state)

# 3. Left Sidebar aside
old_left_aside = """<aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 overflow-y-auto">"""
new_left_aside = """<aside className={`w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 overflow-y-auto ${!isLeftSidebarOpen ? 'hidden' : ''}`}>"""
content = content.replace(old_left_aside, new_left_aside)

# 4. Right Sidebar aside
old_right_aside = """<aside className="w-80 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 overflow-y-auto">"""
new_right_aside = """<aside className={`w-80 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 overflow-y-auto ${!isRightSidebarOpen ? 'hidden' : ''}`}>"""
content = content.replace(old_right_aside, new_right_aside)

# 5. Left label
old_left_label = """            <section>
              <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter block mb-3">Graph</label>"""
new_left_label = """            <section>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter block mb-0">Graph</label>
                <button onClick={() => setIsLeftSidebarOpen(false)} className="p-1 -mr-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" title="Close Panel">
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>"""
content = content.replace(old_left_label, new_left_label)

# 6. Right label
old_right_label = """            <section>
              <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter block mb-3">Algorithm State</label>"""
new_right_label = """            <section>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter block mb-0">Algorithm State</label>
                <button onClick={() => setIsRightSidebarOpen(false)} className="p-1 -mr-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" title="Close Panel">
                  <PanelRightClose className="w-4 h-4" />
                </button>
              </div>"""
content = content.replace(old_right_label, new_right_label)

# 7. Main block
old_main = """        <main className="flex-1 flex flex-col min-w-0 bg-zinc-100 dark:bg-zinc-800 relative">
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-full shadow-sm border border-zinc-200 dark:border-zinc-800 text-[10px] font-mono font-medium text-zinc-500 dark:text-zinc-400">"""

new_main = """        <main className="flex-1 flex flex-col min-w-0 bg-zinc-100 dark:bg-zinc-800 relative">
          {!isLeftSidebarOpen && (
            <button
              onClick={() => setIsLeftSidebarOpen(true)}
              className="absolute top-4 left-4 z-20 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:outline-none"
              title="Open Graph Panel"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}
          {!isRightSidebarOpen && (
            <button
              onClick={() => setIsRightSidebarOpen(true)}
              className="absolute top-4 right-4 z-20 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:outline-none"
              title="Open Inspector Panel"
            >
              <PanelRightOpen className="w-4 h-4" />
            </button>
          )}
          <div className={`absolute top-4 z-20 flex items-center gap-2 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-full shadow-sm border border-zinc-200 dark:border-zinc-800 text-[10px] font-mono font-medium text-zinc-500 dark:text-zinc-400 transition-all duration-300 ${!isLeftSidebarOpen ? 'left-14' : 'left-4'}`}>"""
content = content.replace(old_main, new_main)

with open(filepath, 'w') as f:
    f.write(content)

